import express from 'express';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';
import config from '../config/config.js';
import { authMiddleware, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { libroId, nombre, email, cedula, telefono } = req.body;
  const parsedBookId = Number(libroId);

  if (!Number.isInteger(parsedBookId) || parsedBookId <= 0 || !nombre?.trim() || !email?.trim() || !cedula?.trim()) {
    return res.status(400).json({ success: false, error: 'Completa el nombre, correo, documento y libro solicitado' });
  }

  try {
    const book = await pool.query('SELECT id, titulo, cantidad_disponible FROM libros WHERE id = $1 AND activo = true', [parsedBookId]);
    if (!book.rows[0]) return res.status(404).json({ success: false, error: 'El libro seleccionado no existe' });
    if (book.rows[0].cantidad_disponible < 1) return res.status(409).json({ success: false, error: 'El libro no tiene ejemplares disponibles' });

    const result = await pool.query(
      `INSERT INTO solicitudes_prestamo
       (libro_id, nombre_solicitante, email_solicitante, cedula_solicitante, telefono_solicitante)
       VALUES ($1, $2, LOWER($3), $4, $5) RETURNING id, fecha_solicitud`,
      [parsedBookId, nombre.trim(), email.trim(), cedula.trim(), telefono?.trim() || null],
    );
    res.status(201).json({ success: true, message: 'Solicitud enviada. La biblioteca revisará la disponibilidad.', data: result.rows[0] });
  } catch (error) {
    console.error('Error al crear solicitud:', error);
    res.status(500).json({ success: false, error: 'No se pudo enviar la solicitud' });
  }
});

router.get('/', authMiddleware, authorize('Administrador'), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sp.*, l.titulo AS libro_titulo FROM solicitudes_prestamo sp
       JOIN libros l ON l.id = sp.libro_id
       ORDER BY CASE WHEN sp.estado = 'pendiente' THEN 0 ELSE 1 END, sp.fecha_solicitud DESC`,
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error al consultar solicitudes:', error);
    res.status(500).json({ success: false, error: 'No se pudieron cargar las solicitudes' });
  }
});

router.patch('/:id', authMiddleware, authorize('Administrador'), async (req, res) => {
  const requestId = Number(req.params.id);
  const { estado, observaciones } = req.body;
  if (!Number.isInteger(requestId) || !['aprobada', 'rechazada'].includes(estado)) {
    return res.status(400).json({ success: false, error: 'La acción solicitada no es válida' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const requestResult = await client.query('SELECT * FROM solicitudes_prestamo WHERE id = $1 FOR UPDATE', [requestId]);
    const request = requestResult.rows[0];
    if (!request) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'La solicitud no existe' });
    }
    if (request.estado !== 'pendiente') {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Esta solicitud ya fue gestionada' });
    }

    if (estado === 'rechazada') {
      await client.query(
        `UPDATE solicitudes_prestamo SET estado = 'rechazada', observaciones = $1,
         fecha_gestion = CURRENT_TIMESTAMP, gestionado_por = $2 WHERE id = $3`,
        [observaciones?.trim() || null, req.user.id, requestId],
      );
      await client.query('COMMIT');
      return res.json({ success: true, message: 'Solicitud rechazada' });
    }

    const bookResult = await client.query('SELECT id, cantidad_disponible FROM libros WHERE id = $1 AND activo = true FOR UPDATE', [request.libro_id]);
    const book = bookResult.rows[0];
    const inventoryResult = await client.query(
      "SELECT id FROM inventario WHERE libro_id = $1 AND estado = 'disponible' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED",
      [request.libro_id],
    );
    const inventory = inventoryResult.rows[0];
    if (!book || book.cantidad_disponible < 1 || !inventory) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Ya no hay ejemplares disponibles para aprobar esta solicitud' });
    }

    const studentRole = await client.query("SELECT id FROM roles WHERE nombre = 'Estudiante'");
    if (!studentRole.rows[0]) {
      throw new Error('No existe el rol Estudiante en la base de datos. Ejecuta el script schema_fixed.sql.');
    }
    const existingUser = await client.query('SELECT id FROM usuarios WHERE email = $1 OR cedula = $2 LIMIT 1', [request.email_solicitante, request.cedula_solicitante]);
    let userId = existingUser.rows[0]?.id;
    if (!userId) {
      const temporaryHash = await bcrypt.hash(`solicitud-${requestId}-${Date.now()}`, 10);
      const userResult = await client.query(
        `INSERT INTO usuarios (nombre, email, cedula, password_hash, rol_id, telefono)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [request.nombre_solicitante, request.email_solicitante, request.cedula_solicitante, temporaryHash, studentRole.rows[0].id, request.telefono_solicitante],
      );
      userId = userResult.rows[0].id;
    }

    const loan = await client.query(
      `INSERT INTO prestamos (usuario_id, libro_id, inventario_id, fecha_vencimiento)
       VALUES ($1, $2, $3, CURRENT_DATE + $4::integer) RETURNING id, fecha_vencimiento`,
      [userId, request.libro_id, inventory.id, config.policies.maxLoanDays],
    );
    await client.query("UPDATE inventario SET estado = 'prestado' WHERE id = $1", [inventory.id]);
    await client.query('UPDATE libros SET cantidad_disponible = cantidad_disponible - 1 WHERE id = $1', [request.libro_id]);
    await client.query(
      `UPDATE solicitudes_prestamo SET estado = 'aprobada', observaciones = $1,
       fecha_gestion = CURRENT_TIMESTAMP, gestionado_por = $2 WHERE id = $3`,
      [observaciones?.trim() || null, req.user.id, requestId],
    );
    await client.query('COMMIT');
    res.json({ success: true, message: 'Solicitud aprobada y préstamo creado', data: loan.rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al gestionar solicitud:', error);
    res.status(500).json({
      success: false,
      error: 'No se pudo gestionar la solicitud',
      ...(config.nodeEnv === 'development' && { detalle: error.message }),
    });
  } finally {
    client.release();
  }
});

export default router;
