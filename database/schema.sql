-- =====================================================
-- Sistema de Gestión de Biblioteca Universitaria
-- Script SQL de creación de base de datos
-- =====================================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS biblioteca_universitaria;
\c biblioteca_universitaria;

-- =====================================================
-- 1. TABLA: roles
-- =====================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    permisos TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 2. TABLA: usuarios
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cedula VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER NOT NULL REFERENCES roles(id),
    telefono VARCHAR(20),
    direccion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. TABLA: editoriales
-- =====================================================
CREATE TABLE IF NOT EXISTS editoriales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) UNIQUE NOT NULL,
    pais VARCHAR(100),
    correo VARCHAR(100),
    telefono VARCHAR(20),
    sitio_web VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 4. TABLA: autores
-- =====================================================
CREATE TABLE IF NOT EXISTS autores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    apellido VARCHAR(150) NOT NULL,
    nacionalidad VARCHAR(100),
    fecha_nacimiento DATE,
    biografia TEXT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. TABLA: categorias
-- =====================================================
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion TEXT,
    codigo VARCHAR(20) UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- 6. TABLA: ubicaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS ubicaciones (
    id SERIAL PRIMARY KEY,
    piso INTEGER NOT NULL,
    seccion VARCHAR(50) NOT NULL,
    estante INTEGER,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    UNIQUE(piso, seccion, estante)
);

-- =====================================================
-- 7. TABLA: libros
-- =====================================================
CREATE TABLE IF NOT EXISTS libros (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    editorial_id INTEGER NOT NULL REFERENCES editoriales(id),
    categoria_id INTEGER NOT NULL REFERENCES categorias(id),
    ano_publicacion INTEGER,
    descripcion TEXT,
    cantidad_total INTEGER NOT NULL CHECK (cantidad_total > 0),
    cantidad_disponible INTEGER NOT NULL CHECK (cantidad_disponible >= 0),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. TABLA: libro_autor (Relación N:M)
-- =====================================================
CREATE TABLE IF NOT EXISTS libro_autor (
    id SERIAL PRIMARY KEY,
    libro_id INTEGER NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
    autor_id INTEGER NOT NULL REFERENCES autores(id) ON DELETE CASCADE,
    orden_autor INTEGER,
    UNIQUE(libro_id, autor_id)
);

-- =====================================================
-- 9. TABLA: ubicacion_libro (Relación N:M)
-- =====================================================
CREATE TABLE IF NOT EXISTS ubicacion_libro (
    id SERIAL PRIMARY KEY,
    libro_id INTEGER NOT NULL REFERENCES libros(id) ON DELETE CASCADE,
    ubicacion_id INTEGER NOT NULL REFERENCES ubicaciones(id),
    cantidad_en_ubicacion INTEGER NOT NULL CHECK (cantidad_en_ubicacion > 0),
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. TABLA: inventario
-- =====================================================
CREATE TABLE IF NOT EXISTS inventario (
    id SERIAL PRIMARY KEY,
    libro_id INTEGER NOT NULL REFERENCES libros(id),
    codigo_barra VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'disponible',
    fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_mantenimiento TIMESTAMP,
    notas TEXT,
    CHECK (estado IN ('disponible', 'prestado', 'dañado', 'extraviado', 'mantenimiento'))
);

-- =====================================================
-- 11. TABLA: prestamos
-- =====================================================
CREATE TABLE IF NOT EXISTS prestamos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    libro_id INTEGER NOT NULL REFERENCES libros(id),
    inventario_id INTEGER NOT NULL REFERENCES inventario(id),
    fecha_prestamo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_vencimiento DATE NOT NULL,
    fecha_devolucion TIMESTAMP,
    renovaciones INTEGER DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'activo',
    notas TEXT,
    CHECK (estado IN ('activo', 'devuelto', 'vencido', 'cancelado')),
    CHECK (fecha_vencimiento > CAST(fecha_prestamo AS DATE))
);

-- Solicitudes recibidas desde el catálogo antes de que el administrador apruebe el préstamo.
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

-- =====================================================
-- 12. TABLA: devoluciones
-- =====================================================
CREATE TABLE IF NOT EXISTS devoluciones (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER NOT NULL REFERENCES prestamos(id),
    fecha_devolucion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado_libro VARCHAR(50) NOT NULL,
    observaciones TEXT,
    procesado_por INTEGER NOT NULL REFERENCES usuarios(id),
    dias_atraso INTEGER DEFAULT 0
);

-- =====================================================
-- 13. TABLA: multas
-- =====================================================
CREATE TABLE IF NOT EXISTS multas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    prestamo_id INTEGER REFERENCES prestamos(id),
    monto DECIMAL(10, 2) NOT NULL CHECK (monto > 0),
    concepto VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_pago TIMESTAMP,
    pagada BOOLEAN DEFAULT FALSE,
    observaciones TEXT
);

-- =====================================================
-- 14. TABLA: reservas
-- =====================================================
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    libro_id INTEGER NOT NULL REFERENCES libros(id),
    fecha_reserva TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_expiracion DATE NOT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    posicion_cola INTEGER,
    fecha_notificacion TIMESTAMP,
    CHECK (estado IN ('pendiente', 'disponible', 'cancelada', 'vencida'))
);

-- =====================================================
-- 15. TABLA: notificaciones
-- =====================================================
CREATE TABLE IF NOT EXISTS notificaciones (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
    tipo VARCHAR(50) NOT NULL,
    contenido TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP
);

-- =====================================================
-- 16. TABLA: historial_prestamos (historial)
-- =====================================================
CREATE TABLE IF NOT EXISTS historial_prestamos (
    id SERIAL PRIMARY KEY,
    prestamo_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    accion VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_usuarios_rol_id ON usuarios(rol_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_cedula ON usuarios(cedula);
CREATE INDEX idx_libros_categoria_id ON libros(categoria_id);
CREATE INDEX idx_libros_editorial_id ON libros(editorial_id);
CREATE INDEX idx_libros_isbn ON libros(isbn);
CREATE INDEX idx_libro_autor_libro_id ON libro_autor(libro_id);
CREATE INDEX idx_libro_autor_autor_id ON libro_autor(autor_id);
CREATE INDEX idx_inventario_libro_id ON inventario(libro_id);
CREATE INDEX idx_inventario_estado ON inventario(estado);
CREATE INDEX idx_prestamos_usuario_id ON prestamos(usuario_id);
CREATE INDEX idx_prestamos_libro_id ON prestamos(libro_id);
CREATE INDEX idx_prestamos_estado ON prestamos(estado);
CREATE INDEX idx_solicitudes_prestamo_estado ON solicitudes_prestamo(estado);
CREATE INDEX idx_devoluciones_prestamo_id ON devoluciones(prestamo_id);
CREATE INDEX idx_multas_usuario_id ON multas(usuario_id);
CREATE INDEX idx_multas_pagada ON multas(pagada);
CREATE INDEX idx_reservas_usuario_id ON reservas(usuario_id);
CREATE INDEX idx_reservas_libro_id ON reservas(libro_id);
CREATE INDEX idx_reservas_estado ON reservas(estado);
CREATE INDEX idx_notificaciones_usuario_id ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Insertar roles
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Control total del sistema', 'crear_usuarios,editar_usuarios,eliminar_usuarios,reportes,configuracion'),
('Bibliotecario', 'Gestión de catálogo, préstamos e inventario', 'gestionar_libros,gestionar_prestamos,gestionar_devoluciones,ver_inventario'),
('Estudiante', 'Consultar libros y solicitar préstamos', 'consultar_libros,solicitar_prestamo,ver_historial,hacer_reserva');

-- Cuenta disponible para probar el inicio de sesión en el entorno local.
INSERT INTO usuarios (nombre, email, cedula, password_hash, rol_id) VALUES
('Administrador', 'admin@biblioteca.edu.co', '1000000000', '$2b$10$wwkOiK0tEryphVJclG8mb.TA7EqD1qHl5WD9JZOWwZosnNTl.TCOO', 1);

-- Insertar editoriales
INSERT INTO editoriales (nombre, pais, correo, telefono) VALUES
('Penguin Books', 'Reino Unido', 'info@penguinbooks.com', '+44-123-456-789'),
('Macmillan Publishers', 'Estados Unidos', 'info@macmillan.com', '+1-212-555-0100'),
('Oxford University Press', 'Reino Unido', 'info@oup.com', '+44-1865-555-000'),
('Springer', 'Alemania', 'info@springer.com', '+49-69-5000-0'),
('Editorial Planeta', 'España', 'info@planeta.com', '+34-93-555-0000');

-- Insertar categorías
INSERT INTO categorias (nombre, descripcion, codigo) VALUES
('Ficción', 'Novelas y obras literarias de ficción', 'FIC'),
('No Ficción', 'Libros de contenido informativo y educativo', 'NF'),
('Ciencia', 'Libros sobre ciencias naturales y exactas', 'SCI'),
('Historia', 'Libros de historia y arqueología', 'HIS'),
('Tecnología', 'Libros sobre tecnología e informática', 'TECH'),
('Filosofía', 'Obras filosóficas y ensayos', 'PHI'),
('Psicología', 'Libros de psicología y comportamiento humano', 'PSY'),
('Economía', 'Libros sobre economía y negocios', 'ECO');

-- Insertar autores
INSERT INTO autores (nombre, apellido, nacionalidad, fecha_nacimiento) VALUES
('Gabriel', 'García Márquez', 'Colombia', '1927-03-06'),
('Agatha', 'Christie', 'Reino Unido', '1890-01-15'),
('Isaac', 'Asimov', 'Rusia', '1920-01-02'),
('Paulo', 'Coelho', 'Brasil', '1947-08-24'),
('Stephen', 'King', 'Estados Unidos', '1947-09-21'),
('Margaret', 'Atwood', 'Canadá', '1939-11-18'),
('Yuval', 'Harari', 'Israel', '1976-02-24'),
('Malcom', 'Gladwell', 'Canadá', '1966-09-03');

-- Insertar ubicaciones
INSERT INTO ubicaciones (piso, seccion, estante) VALUES
(1, 'A', 1), (1, 'A', 2), (1, 'B', 1), (1, 'B', 2),
(2, 'C', 1), (2, 'C', 2), (2, 'D', 1), (2, 'D', 2),
(3, 'E', 1), (3, 'E', 2), (3, 'F', 1), (3, 'F', 2);

-- Insertar libros
INSERT INTO libros (titulo, isbn, editorial_id, categoria_id, ano_publicacion, descripcion, cantidad_total, cantidad_disponible) VALUES
('Cien años de soledad', '978-8401337976', 3, 1, 1967, 'Novela clásica de la literatura latinoamericana', 5, 3),
('El asesinato de Roger Ackroyd', '978-0062073556', 1, 1, 1926, 'Novela de misterio de Agatha Christie', 4, 2),
('Fundación', '978-0553293357', 2, 1, 1951, 'Novela de ciencia ficción de Isaac Asimov', 3, 1),
('El Alquimista', '978-0062315007', 1, 1, 1988, 'Novela filosófica de Paulo Coelho', 6, 4),
('El Resplandor', '978-0385121675', 2, 1, 1977, 'Novela de terror de Stephen King', 2, 1),
('Sapiens', '978-8499920061', 4, 2, 2011, 'Historia breve de la humanidad', 4, 2),
('El efecto Outlier', '978-8498674457', 1, 2, 2008, 'Análisis de porqué algunos tienen éxito', 3, 1),
('La estructura de las revoluciones científicas', '978-8437504674', 3, 3, 1962, 'Obra fundamental en filosofía de la ciencia', 2, 0);

-- Insertar relaciones libro-autor
INSERT INTO libro_autor (libro_id, autor_id, orden_autor) VALUES
(1, 1, 1),
(2, 2, 1),
(3, 3, 1),
(4, 4, 1),
(5, 5, 1),
(6, 7, 1),
(7, 8, 1);

-- Insertar ubicaciones de libros
INSERT INTO ubicacion_libro (libro_id, ubicacion_id, cantidad_en_ubicacion) VALUES
(1, 1, 2), (1, 2, 3),
(2, 3, 2), (2, 4, 2),
(3, 5, 1), (3, 6, 2),
(4, 7, 3), (4, 8, 3),
(5, 9, 1), (5, 10, 1),
(6, 11, 2), (6, 12, 2),
(7, 1, 2), (7, 3, 1),
(8, 5, 1), (8, 7, 1);

-- Insertar inventario
INSERT INTO inventario (libro_id, codigo_barra, estado) VALUES
('1', 'BIB-001-001', 'disponible'),
('1', 'BIB-001-002', 'disponible'),
('1', 'BIB-001-003', 'prestado'),
('1', 'BIB-001-004', 'disponible'),
('1', 'BIB-001-005', 'disponible'),
('2', 'BIB-002-001', 'disponible'),
('2', 'BIB-002-002', 'disponible'),
('2', 'BIB-002-003', 'prestado'),
('2', 'BIB-002-004', 'disponible'),
('3', 'BIB-003-001', 'disponible'),
('3', 'BIB-003-002', 'prestado'),
('3', 'BIB-003-003', 'mantenimiento'),
('4', 'BIB-004-001', 'disponible'),
('4', 'BIB-004-002', 'disponible'),
('4', 'BIB-004-003', 'disponible'),
('4', 'BIB-004-004', 'disponible'),
('4', 'BIB-004-005', 'disponible'),
('4', 'BIB-004-006', 'prestado'),
('5', 'BIB-005-001', 'disponible'),
('5', 'BIB-005-002', 'prestado'),
('6', 'BIB-006-001', 'disponible'),
('6', 'BIB-006-002', 'disponible'),
('6', 'BIB-006-003', 'disponible'),
('6', 'BIB-006-004', 'disponible'),
('7', 'BIB-007-001', 'disponible'),
('7', 'BIB-007-002', 'disponible'),
('7', 'BIB-007-003', 'prestado'),
('8', 'BIB-008-001', 'disponible'),
('8', 'BIB-008-002', 'disponible');
