import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/database.js';
import config from '../config/config.js';

const router = express.Router();

const createToken = (user) => jwt.sign(
  { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
  config.jwt.secret,
  { expiresIn: config.jwt.expire },
);

router.post('/register', async (req, res) => {
  const { nombre, email, cedula, telefono, password } = req.body;

  if (!nombre || !email || !cedula || !password) {
    return res.status(400).json({
      success: false,
      error: 'Nombre, correo, cédula y contraseña son obligatorios',
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'La contraseña debe tener al menos 6 caracteres',
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, cedula, password_hash, rol_id, telefono)
       VALUES ($1, LOWER($2), $3, $4, 3, $5)
       RETURNING id, nombre, email, cedula, telefono`,
      [nombre.trim(), email.trim(), cedula.trim(), passwordHash, telefono?.trim() || null],
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado correctamente',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        error: 'El correo o la cédula ya están registrados',
      });
    }

    console.error('Error al registrar usuario:', error);
    res.status(500).json({ success: false, error: 'No se pudo registrar el usuario' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Correo y contraseña son obligatorios',
    });
  }

  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, u.password_hash, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE LOWER(u.email) = LOWER($1) AND u.activo = true`,
      [email.trim()],
    );

    const user = result.rows[0];
    const validPassword = user && await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Correo o contraseña incorrectos' });
    }

    const { password_hash: ignoredPassword, ...publicUser } = user;
    res.json({ success: true, token: createToken(publicUser), user: publicUser });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ success: false, error: 'No se pudo iniciar sesión' });
  }
});

export default router;
