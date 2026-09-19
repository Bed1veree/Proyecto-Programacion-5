import express from 'express';
import pool from '../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        l.id,
        l.titulo,
        l.isbn,
        l.ano_publicacion,
        l.descripcion,
        l.cantidad_total,
        l.cantidad_disponible,
        e.nombre as editorial,
        c.nombre as categoria,
        STRING_AGG(CONCAT(a.nombre, ' ', a.apellido), ', ') as autores
      FROM libros l
      LEFT JOIN editoriales e ON l.editorial_id = e.id
      LEFT JOIN categorias c ON l.categoria_id = c.id
      LEFT JOIN libro_autor la ON l.id = la.libro_id
      LEFT JOIN autores a ON la.autor_id = a.id
      WHERE l.activo = true
      GROUP BY l.id, l.titulo, l.isbn, l.ano_publicacion, l.descripcion, 
               l.cantidad_total, l.cantidad_disponible, e.nombre, c.nombre
      ORDER BY l.titulo ASC
    `);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener libros:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener libros',
      message: err.message
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT 
        l.id,
        l.titulo,
        l.isbn,
        l.ano_publicacion,
        l.descripcion,
        l.cantidad_total,
        l.cantidad_disponible,
        e.nombre as editorial,
        c.nombre as categoria,
        json_agg(
          json_build_object(
            'nombre', a.nombre,
            'apellido', a.apellido,
            'nacionalidad', a.nacionalidad
          )
        ) FILTER (WHERE a.id IS NOT NULL) as autores
      FROM libros l
      LEFT JOIN editoriales e ON l.editorial_id = e.id
      LEFT JOIN categorias c ON l.categoria_id = c.id
      LEFT JOIN libro_autor la ON l.id = la.libro_id
      LEFT JOIN autores a ON la.autor_id = a.id
      WHERE l.id = $1 AND l.activo = true
      GROUP BY l.id, l.titulo, l.isbn, l.ano_publicacion, l.descripcion, 
               l.cantidad_total, l.cantidad_disponible, e.nombre, c.nombre
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Libro no encontrado'
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error al obtener libro:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener libro',
      message: err.message
    });
  }
});

router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchQuery = `%${query}%`;
    
    const result = await pool.query(`
      SELECT 
        l.id,
        l.titulo,
        l.isbn,
        l.ano_publicacion,
        l.descripcion,
        l.cantidad_total,
        l.cantidad_disponible,
        e.nombre as editorial,
        c.nombre as categoria
      FROM libros l
      LEFT JOIN editoriales e ON l.editorial_id = e.id
      LEFT JOIN categorias c ON l.categoria_id = c.id
      WHERE l.activo = true AND (
        l.titulo ILIKE $1 OR 
        l.descripcion ILIKE $1 OR 
        l.isbn ILIKE $1
      )
      ORDER BY l.titulo ASC
      LIMIT 20
    `, [searchQuery]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error en búsqueda:', err);
    res.status(500).json({
      success: false,
      error: 'Error en búsqueda',
      message: err.message
    });
  }
});

router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const result = await pool.query(`
      SELECT 
        l.id,
        l.titulo,
        l.isbn,
        l.ano_publicacion,
        l.descripcion,
        l.cantidad_total,
        l.cantidad_disponible,
        e.nombre as editorial,
        c.nombre as categoria
      FROM libros l
      LEFT JOIN editoriales e ON l.editorial_id = e.id
      LEFT JOIN categorias c ON l.categoria_id = c.id
      WHERE l.activo = true AND l.categoria_id = $1
      ORDER BY l.titulo ASC
    `, [categoryId]);
    
    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    console.error('Error al obtener libros por categoría:', err);
    res.status(500).json({
      success: false,
      error: 'Error al obtener libros por categoría',
      message: err.message
    });
  }
});

export default router;
