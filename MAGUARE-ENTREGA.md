# Preparación para Maguaré

Este paquete se encuentra en **staging**: `index.html` y `robots.txt` usan `noindex, nofollow`. Antes de producción, cambie el entorno a `production` y configure los valores vacíos de `maguare.config.json`.

## Datos que debe suministrar Maguaré

- `productionUrl`: URL absoluta y definitiva del minisito. Es necesaria para `canonical`, `og:url`, `og:image` y datos estructurados válidos.
- `gtmContainerId`: identificador oficial del contenedor GTM. El código conserva los dos puntos de inserción obligatorios, pero no instala rastreadores sin este valor aprobado.
- Confirmación de título institucional: el título completo de la audioteca con el cierre institucional excede el rango recomendado de 50-60 caracteres. Está priorizada la denominación oficial hasta recibir una alternativa aprobada.

## Requisitos implementados

- Idioma `es-CO`, viewport, theme color, description, Open Graph, Twitter Card, manifiesto web y reserva de GTM.
- Rutas relativas aptas para subdirectorios y paquete con `index.html` en raíz.
- Staging con bloqueo de indexación mediante `meta robots` y `robots.txt`.
- Reutilización de CSS y JavaScript minificados existentes, sin dependencias externas.
- Auditoría local con `node scripts/audit-maguare.cjs`.

## Pendientes de optimización de recursos

El paquete original contiene imágenes por encima de 400 KB y audios superiores a 5 MB, además de varios archivos M4A. La auditoría los lista para conversión a WebP y MP3/OGG. No se han recomprimido automáticamente para evitar alterar voces, música e ilustraciones sin una revisión de calidad de la comunidad y del equipo editorial.

También faltan los PNG de aplicación (`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) y una versión de `og.png` a 1200x630 píxeles y máximo 500 KB. El manifiesto usa temporalmente el favicon SVG existente.

Al entregar a producción, el ZIP debe contener la raíz del paquete, sin `node_modules`, archivos de entorno ni archivos temporales.
