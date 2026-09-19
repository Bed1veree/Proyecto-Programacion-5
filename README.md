# BiblioUni

Proyecto de Programación 5 sobre una biblioteca universitaria. Permite consultar el catálogo, enviar solicitudes de préstamo e iniciar sesión como administrador. Tiene una API con Express, una interfaz con Next.js y una base de datos en PostgreSQL.

## Integrantes

- Fabian Zuñiga
- Felipe Rivas

## Tecnologías

| Parte | Tecnología |
| --- | --- |
| Base de datos | PostgreSQL |
| Backend | Node.js y Express |
| Frontend | Next.js |
| Autenticación | JWT y bcrypt |

## Estado actual

Por ahora el proyecto incluye:

- Inicio de sesión del administrador.
- Consulta del catálogo, detalle y búsqueda de libros.
- Consulta de categorías y usuarios.
- Base de datos para libros, autores, préstamos, reservas y multas.
- Formulario para solicitar préstamos y panel de administración para revisarlos.

Las reservas, multas e historial están en el diseño y en la base de datos, pero todavía no se pueden usar desde la aplicación.

## Estructura

```text
Proyecto_Programacion_5/
├── backend/       API de Express
├── frontend/      Aplicación de Next.js
├── database/      Scripts para crear la base de datos
└── docs/          Informe, diagramas y mockups
```

## Cómo ejecutarlo

### 1. Preparar la base de datos

Con PostgreSQL en ejecución, crea una base de datos llamada `biblioteca_universitaria` y ejecuta el script:

```bash
psql -U biblioteca_user -d biblioteca_universitaria < database/schema_fixed.sql
```

Si usas otro usuario, contraseña o nombre de base de datos, debes reflejarlo en el archivo `.env` del backend.

### 2. Ejecutar el backend

```bash
cd backend
npm install
npm run dev
```

La API queda disponible en `http://localhost:3001`. Puedes comprobarla en `http://localhost:3001/api/health`.

### 3. Ejecutar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Luego abre `http://localhost:3000` en el navegador.

## Rutas principales de la API

| Método | Ruta | Uso |
| --- | --- | --- |
| GET | `/api/health` | Verificar que la API responde |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/books` | Listar libros activos |
| GET | `/api/books/:id` | Consultar un libro |
| GET | `/api/books/search/:query` | Buscar por texto |
| GET | `/api/categories` | Listar categorías |
| POST | `/api/loan-requests` | Enviar una solicitud de préstamo |
| GET | `/api/loan-requests` | Ver solicitudes como administrador |

## Documentación adicional

- [Información general](docs/informe/01_informacion_general.md)
- [Roles](docs/informe/02_roles.md)
- [Modelo de datos](docs/informe/03_modelo_base_datos.md)
- [Mockups](docs/informe/04_mockups.md)

## Notas

La cuenta de ejemplo es solo para uso local. No subas el archivo `.env` al repositorio.
