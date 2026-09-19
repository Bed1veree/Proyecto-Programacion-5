import pkg from 'pg';
import config from './config.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: config.database.url,
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database,
});

pool.on('error', (err) => {
  console.error('Error en pool de conexión:', err);
});

export const getConnection = async () => {
  try {
    const connection = await pool.connect();
    return connection;
  } catch (err) {
    console.error('Error al conectar a la base de datos:', err);
    throw err;
  }
};

export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`Query ejecutada: ${text.substring(0, 50)}... (${duration}ms)`);
    return result;
  } catch (err) {
    console.error('Error en query:', err, `Query: ${text}`);
    throw err;
  }
};

export default pool;

