# Roles del sistema

Hay tres roles para separar las tareas de administración, biblioteca y consulta.

## Administrador

En la versión actual inicia sesión y revisa las solicitudes de préstamo. Puede aprobarlas o rechazarlas.

## Bibliotecario

Este rol está pensado para el trabajo diario con el catálogo, inventario, préstamos y devoluciones. Aún no tiene una pantalla propia.

## Estudiante

Se asigna al registro creado cuando el administrador aprueba una solicitud. Por ahora no tiene inicio de sesión ni una pantalla propia.

## Acceso

La API genera un token al iniciar sesión. Antes de mostrar o gestionar solicitudes, revisa el token y el rol del usuario.
