# Modelo de base de datos

La base de datos usa PostgreSQL y guarda la información principal de la biblioteca. El script para crearla está en `database/schema_fixed.sql`.

## Grupos de tablas

| Grupo | Tablas principales | Propósito |
| --- | --- | --- |
| Usuarios | `roles`, `usuarios` | Identificar a las personas y sus permisos. |
| Catálogo | `libros`, `autores`, `editoriales`, `categorias` | Describir los libros disponibles. |
| Inventario | `inventario`, `ubicaciones`, `ubicacion_libro` | Ubicar y controlar los ejemplares físicos. |
| Circulación | `prestamos`, `devoluciones`, `reservas`, `multas` | Registrar el movimiento de libros. |
| Apoyo | `notificaciones`, `historial_prestamos`, `libro_autor` | Guardar avisos, historial y relaciones entre tablas. |

## Relaciones importantes

- Un usuario tiene un rol, pero un rol puede pertenecer a muchos usuarios.
- Un libro puede tener varios autores y un autor puede participar en varios libros; por eso se usa `libro_autor`.
- Un libro puede estar en varias ubicaciones y una ubicación puede contener varios libros; `ubicacion_libro` resuelve esa relación.
- Un préstamo se asocia a un usuario y a un ejemplar del inventario.

## Detalles del modelo

Cada tabla tiene una clave primaria y las claves foráneas conectan los datos relacionados. El correo, la cédula, el ISBN y algunos códigos no se pueden repetir. También hay validaciones básicas con `CHECK` para estados y cantidades.
