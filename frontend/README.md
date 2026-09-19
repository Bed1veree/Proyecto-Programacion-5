# Frontend de BiblioUni

La interfaz está hecha con Next.js. Incluye el catálogo, el formulario de solicitudes, el inicio de sesión y el panel de administración.

## Ejecutar la aplicación

```bash
npm install
npm run dev
```

Después abre `http://localhost:3000`.

## Páginas principales

- `/`: catálogo de libros.
- `/login`: formulario de inicio de sesión.
- `/dashboard`: panel del administrador con las solicitudes de préstamo.

La aplicación necesita que la API esté disponible en `http://localhost:3001`. Las reservas, multas e historial aparecen en el diseño, pero todavía no funcionan en la interfaz.
