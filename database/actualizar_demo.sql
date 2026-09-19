-- Solicitudes de préstamo pendientes de revisión.
CREATE TABLE IF NOT EXISTS solicitudes_prestamo (
  id SERIAL PRIMARY KEY,
  libro_id INTEGER NOT NULL REFERENCES libros(id),
  nombre_solicitante VARCHAR(100) NOT NULL,
  email_solicitante VARCHAR(100) NOT NULL,
  cedula_solicitante VARCHAR(20) NOT NULL,
  telefono_solicitante VARCHAR(20),
  fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  observaciones TEXT,
  fecha_gestion TIMESTAMP,
  gestionado_por INTEGER REFERENCES usuarios(id),
  CHECK (estado IN ('pendiente', 'aprobada', 'rechazada'))
);

CREATE INDEX IF NOT EXISTS idx_solicitudes_prestamo_estado ON solicitudes_prestamo(estado);

-- Cuenta de administrador para uso local.
INSERT INTO usuarios (nombre, email, cedula, password_hash, rol_id, activo)
VALUES (
  'Administrador',
  'admin@biblioteca.edu.co',
  '1000000000',
  '$2b$10$wwkOiK0tEryphVJclG8mb.TA7EqD1qHl5WD9JZOWwZosnNTl.TCOO',
  (SELECT id FROM roles WHERE nombre = 'Administrador'),
  true
)
ON CONFLICT (email) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  password_hash = EXCLUDED.password_hash,
  rol_id = EXCLUDED.rol_id,
  activo = true;
