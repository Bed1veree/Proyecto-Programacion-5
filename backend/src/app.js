import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config.js';
import pool from './config/database.js';
import routes from './routes/index.js';

const app = express();

app.use(helmet());
app.use(cors(config.cors));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    path: req.path,
    method: req.method,
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

const startServer = async () => {
  try {
    let dbConnected = false;
    try {
      const client = await pool.connect();
      console.log('✓ Conexión a PostgreSQL establecida');
      client.release();
      dbConnected = true;
    } catch (dbErr) {
      console.warn('⚠ Advertencia: No se pudo conectar a PostgreSQL');
      console.warn('  El servidor continuará en modo de desarrollo sin base de datos');
    }

    app.listen(config.port, config.host, () => {
      console.log(`
╔════════════════════════════════════════════╗
║  BIBLIOTECA UNIVERSITARIA - API REST      ║
╠════════════════════════════════════════════╣
║  Servidor: ${config.host}:${config.port}
║  Entorno: ${config.nodeEnv}
║  Base de Datos: ${dbConnected ? '✓ Conectada' : '✗ Desconectada'}
║  URL: http://${config.host}:${config.port}
╠════════════════════════════════════════════╣
║  Endpoints disponibles:
║  • GET /api/health
║  • GET /api/info
║  • (más endpoints en desarrollo)
╚════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('✗ Error al iniciar servidor:', err.message);
    process.exit(1);
  }
};

process.on('SIGTERM', () => {
  console.log('SIGTERM recibido, cerrando servidor...');
  pool.end();
  process.exit(0);
});

startServer();

export default app;
