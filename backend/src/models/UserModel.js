import { query } from '../config/database.js';

export class UserModel {
  static async findById(id) {
    const result = await query(
      'SELECT id, nombre, email, cedula, rol_id, activo FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await query(
      'SELECT id, nombre, email, cedula, rol_id, password_hash, activo FROM usuarios WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async findByCedula(cedula) {
    const result = await query(
      'SELECT id, nombre, email, cedula, rol_id, password_hash, activo FROM usuarios WHERE cedula = $1',
      [cedula]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { nombre, email, cedula, password_hash, rol_id, telefono, direccion } = userData;

    const result = await query(
      `INSERT INTO usuarios (nombre, email, cedula, password_hash, rol_id, telefono, direccion, activo, fecha_registro)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, NOW())
       RETURNING id, nombre, email, cedula, rol_id, activo, fecha_registro`,
      [nombre, email, cedula, password_hash, rol_id, telefono, direccion]
    );

    return result.rows[0];
  }

  static async update(id, userData) {
    const { nombre, email, telefono, direccion } = userData;

    const result = await query(
      `UPDATE usuarios 
       SET nombre = $1, email = $2, telefono = $3, direccion = $4, fecha_actualizacion = NOW()
       WHERE id = $5
       RETURNING id, nombre, email, cedula, rol_id, activo, fecha_actualizacion`,
      [nombre, email, telefono, direccion, id]
    );

    return result.rows[0];
  }

  static async findAll(limit = 10, offset = 0) {
    const result = await query(
      'SELECT id, nombre, email, cedula, rol_id, activo, fecha_registro FROM usuarios ORDER BY fecha_registro DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  static async countAll() {
    const result = await query('SELECT COUNT(*) as total FROM usuarios');
    return parseInt(result.rows[0].total);
  }
}

export default UserModel;

