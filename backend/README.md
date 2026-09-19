# Backend de BiblioUni

Esta carpeta contiene la API de Express, sus rutas y la conexión con PostgreSQL.

## Ejecutar la API

```bash
npm install
npm run dev
```

Por defecto queda disponible en `http://localhost:3001`.

## Configuración

Crea un archivo `.env`. Estas son las variables necesarias:

```env
PORT=3001
DATABASE_URL=postgresql://usuario:contraseña@localhost:5432/biblioteca_universitaria
JWT_SECRET=una_clave_para_desarrollo
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

No subas `.env` al repositorio.

## Rutas disponibles

- `GET /api/health`: comprueba que la API responda.
- `POST /api/auth/login`: inicia sesión y devuelve un token.
- `GET /api/books`: lista los libros activos.
- `GET /api/books/:id`: consulta el detalle de un libro.
- `GET /api/books/search/:query`: busca libros por texto.
- `GET /api/categories`: lista las categorías.
- `POST /api/loan-requests`: guarda una solicitud de préstamo.
- `GET /api/loan-requests`: muestra las solicitudes al administrador.
- `PATCH /api/loan-requests/:id`: aprueba o rechaza una solicitud.

Al aprobar una solicitud, se registra el préstamo y se descuenta un ejemplar disponible.
