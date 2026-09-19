# Información general

## Proyecto

**BiblioUni** es una aplicación web sencilla para una biblioteca universitaria. Permite consultar el catálogo, enviar solicitudes de préstamo y revisarlas desde una cuenta de administrador.

## Integrantes

- Fabian Zuñiga
- Felipe Rivas

## Problema

Llevar la información de los libros y préstamos de forma manual puede dificultar saber qué ejemplares están disponibles o encontrar los datos de un usuario. La aplicación busca facilitar estas tareas a estudiantes y al personal de la biblioteca.

## Alcance de esta entrega

Esta entrega tiene la base de datos, la API, el catálogo, el inicio de sesión del administrador y las solicitudes de préstamo. Las reservas, devoluciones y multas están planteadas en el modelo de datos, pero aún no están en la interfaz.

## Tecnologías usadas

- PostgreSQL para almacenar la información.
- Node.js y Express para la API.
- Next.js para la interfaz web.
- JWT y bcrypt para manejar el acceso de los usuarios.

## Usuarios previstos

- **Administrador:** revisa y gestiona las solicitudes de préstamo.
- **Bibliotecario:** es un rol pensado para trabajar con el catálogo y el inventario.
- **Estudiante:** es el rol que se asigna cuando se aprueba una solicitud de préstamo.

El proyecto sigue en desarrollo. Lo que aún no está en la interfaz se puede ver en el modelo de datos y los mockups.
