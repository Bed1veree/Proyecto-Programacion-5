import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        codigo,
        activo
      FROM categorias
      WHERE activo = true
      ORDER BY nombre ASC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener categorías:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categorías',
      message: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        id,
        nombre,
        descripcion,
        codigo,
        activo
      FROM categorias
      WHERE id = $1 AND activo = true
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Categoría no encontrada'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error al obtener categoría:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener categoría',
      message: err.message
    });
  }
});

export default router;
