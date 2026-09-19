import { query } from '../config/database.js';

export class BookModel {
  static async findById(id) {
    const result = await query(
      `SELECT id, titulo, isbn, editorial_id, categoria_id, ano_publicacion, 
              descripcion, cantidad_total, cantidad_disponible, activo 
       FROM libros WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByISBN(isbn) {
    const result = await query(
      `SELECT id, titulo, isbn, editorial_id, categoria_id, ano_publicacion, 
              descripcion, cantidad_total, cantidad_disponible, activo 
       FROM libros WHERE isbn = $1`,
      [isbn]
    );
    return result.rows[0];
  }

  static async findAll(limit = 20, offset = 0, filters = {}) {
    let queryStr = 'SELECT id, titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_disponible FROM libros WHERE activo = true';
    const params = [];

    if (filters.categoria_id) {
      params.push(filters.categoria_id);
      queryStr += ` AND categoria_id = $${params.length}`;
    }

    if (filters.titulo) {
      params.push(`%${filters.titulo}%`);
      queryStr += ` AND titulo ILIKE $${params.length}`;
    }

    if (filters.disponibleSolo === true) {
      queryStr += ` AND cantidad_disponible > 0`;
    }

    queryStr += ` ORDER BY titulo ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await query(queryStr, params);
    return result.rows;
  }

  static async searchByAuthor(authorName, limit = 20, offset = 0) {
    const result = await query(
      `SELECT DISTINCT l.id, l.titulo, l.isbn, l.editorial_id, l.categoria_id, 
              l.ano_publicacion, l.descripcion, l.cantidad_disponible
       FROM libros l
       INNER JOIN libro_autor la ON l.id = la.libro_id
       INNER JOIN autores a ON la.autor_id = a.id
       WHERE (a.nombre ILIKE $1 OR a.apellido ILIKE $1) AND l.activo = true
       ORDER BY l.titulo ASC
       LIMIT $2 OFFSET $3`,
      [`%${authorName}%`, limit, offset]
    );
    return result.rows;
  }

  static async getWithAuthors(id) {
    const result = await query(
      `SELECT l.id, l.titulo, l.isbn, l.editorial_id, l.categoria_id, l.ano_publicacion, 
              l.descripcion, l.cantidad_disponible, l.cantidad_total,
              array_agg(json_build_object('id', a.id, 'nombre', a.nombre, 'apellido', a.apellido)) as autores
       FROM libros l
       LEFT JOIN libro_autor la ON l.id = la.libro_id
       LEFT JOIN autores a ON la.autor_id = a.id
       WHERE l.id = $1 AND l.activo = true
       GROUP BY l.id`,
      [id]
    );
    return result.rows[0];
  }

  static async create(bookData) {
    const { titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_total } = bookData;

    const result = await query(
      `INSERT INTO libros (titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_total, cantidad_disponible, activo, fecha_creacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $7, true, NOW())
       RETURNING id, titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_total, cantidad_disponible`,
      [titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_total]
    );

    return result.rows[0];
  }

  static async update(id, bookData) {
    const { titulo, editorial_id, categoria_id, ano_publicacion, descripcion } = bookData;

    const result = await query(
      `UPDATE libros 
       SET titulo = $1, editorial_id = $2, categoria_id = $3, ano_publicacion = $4, 
           descripcion = $5, fecha_actualizacion = NOW()
       WHERE id = $6
       RETURNING id, titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion`,
      [titulo, editorial_id, categoria_id, ano_publicacion, descripcion, id]
    );

    return result.rows[0];
  }

  static async getTotalCount(filters = {}) {
    let queryStr = 'SELECT COUNT(*) as total FROM libros WHERE activo = true';
    const params = [];

    if (filters.categoria_id) {
      params.push(filters.categoria_id);
      queryStr += ` AND categoria_id = $${params.length}`;
    }

    const result = await query(queryStr, params);
    return parseInt(result.rows[0].total);
  }
}

export default BookModel;

