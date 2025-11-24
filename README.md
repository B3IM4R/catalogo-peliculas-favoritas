# Catálogo de Películas Favoritas

Proyecto FullStack sencillo para gestionar un catálogo personal de películas favoritas con autenticación de usuarios y obtención de pósters desde la API pública OMDb.

## Objetivo
Aprender y demostrar fundamentos: REST API con Express, conexión a MongoDB Atlas, autenticación JWT básica, CRUD de recursos, consumo de API externa y un frontend en JavaScript vanilla con estilos usando Tailwind (CDN) sin complicaciones.

## Variables de entorno (se crearán posteriormente)
- `PORT`: Puerto de la API (3000).
- `MONGODB_URI`: Cadena de conexión completa de Atlas.
- `JWT_SECRET`: Clave para firmar JWT (usa algo largo y aleatorio).
- `OMDB_API_KEY`: Key obtenida de https://www.omdbapi.com/apikey.aspx.

## Despliegue en Render (visión general)
1. Crear nuevo servicio Web en Render apuntando al repo.
2. Añadir variables de entorno en Dashboard de Render.
3. Comando inicial: `pnpm install` y `pnpm start`.
4. Verificar logs y probar endpoints.

## Convención de commits
- `feat:` nuevo feature (endpoint, modelo, servicio).
- `refactor:` reorganización sin cambiar comportamiento externo.
- `docs:` cambios en documentación o comentarios.
- `test:` archivos o ajustes de pruebas.
