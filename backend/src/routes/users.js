import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.telefono,
        u.direccion,
        u.activo,
        u.fecha_registro,
        r.nombre as rol
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.activo = true
      ORDER BY u.nombre ASC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuarios',
      message: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        u.id,
        u.nombre,
        u.email,
        u.cedula,
        u.telefono,
        u.direccion,
        u.activo,
        u.fecha_registro,
        r.nombre as rol,
        r.descripcion as rol_descripcion
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      WHERE u.id = $1 AND u.activo = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener usuario',
      message: err.message
    });
  }
});

router.get('/roles/list', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        permisos,
        activo
      FROM roles
      ORDER BY nombre ASC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener roles',
      message: err.message
    });
  }
});

export default router;
