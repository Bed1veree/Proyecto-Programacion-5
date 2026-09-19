import express from 'express';
import pool from '../config/database.js';
import config from '../config/config.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const libroId = Number(req.body.libroId);

  if (!Number.isInteger(libroId) || libroId <= 0) {
    return res.status(400).json({ success: false, error: 'El libro seleccionado no es válido' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const bookResult = await client.query(
      'SELECT id, titulo, cantidad_disponible FROM libros WHERE id = $1 AND activo = true FOR UPDATE',
      [libroId],
    );
    const book = bookResult.rows[0];

    if (!book || book.cantidad_disponible < 1) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'Este libro no tiene ejemplares disponibles' });
    }

    const inventoryResult = await client.query(
      `SELECT id FROM inventario
       WHERE libro_id = $1 AND estado = 'disponible'
       ORDER BY id
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [libroId],
    );
    const inventory = inventoryResult.rows[0];

    if (!inventory) {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, error: 'No se encontró un ejemplar disponible' });
    }

    const loanResult = await client.query(
      `INSERT INTO prestamos (usuario_id, libro_id, inventario_id, fecha_vencimiento)
       VALUES ($1, $2, $3, CURRENT_DATE + $4)
       RETURNING id, fecha_prestamo, fecha_vencimiento, estado`,
      [req.user.id, libroId, inventory.id, config.policies.maxLoanDays],
    );

    await client.query("UPDATE inventario SET estado = 'prestado' WHERE id = $1", [inventory.id]);
    await client.query(
      'UPDATE libros SET cantidad_disponible = cantidad_disponible - 1 WHERE id = $1',
      [libroId],
    );
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: `Préstamo registrado para “${book.titulo}”`,
      data: loanResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar préstamo:', error);
    res.status(500).json({ success: false, error: 'No se pudo registrar el préstamo' });
  } finally {
    client.release();
  }
});

export default router;
