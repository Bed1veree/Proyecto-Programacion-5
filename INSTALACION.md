# Instalación local

Esta guía muestra cómo ejecutar BiblioUni en tu computador. Necesitas Node.js, npm y PostgreSQL.

## Base de datos

1. Inicia PostgreSQL.
2. Crea la base de datos `biblioteca_universitaria` y un usuario que pueda usarla.
3. Ejecuta el script incluido en el proyecto:

```bash
psql -U biblioteca_user -d biblioteca_universitaria < database/schema_fixed.sql
```

El usuario y la contraseña deben coincidir con los que pongas en el `.env` del backend.

## Backend

```bash
cd backend
npm install
npm run dev
```

El servidor usa el puerto 3001 por defecto. Puedes revisarlo en `http://localhost:3001/api/health`.

## Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

Abre `http://localhost:3000` para ver la aplicación.

## Problemas comunes

- Si un puerto está ocupado, detén el proceso que lo está usando o cambia el puerto en la configuración.
- Si la API no conecta a PostgreSQL, revisa que el servicio esté activo y que las credenciales del `.env` sean correctas.
- Si falta un paquete, ejecuta `npm install` dentro de la carpeta correspondiente.

Las claves del proyecto son solo para desarrollo local.
