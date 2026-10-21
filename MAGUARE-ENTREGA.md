# Preparación técnica para Maguaré

Estado: **preparación, no entrega conforme todavía**. La audioteca aprobada y sus textos no se alteran. La configuración sigue en `staging`, con `noindex, nofollow`; no se ha activado GTM ni se ha publicado una nueva versión.

La fuente de requisitos es `MAG_Documentación Técnica Interactivos - aplicativos maguare.gov.co.pdf`. Ejecute `node scripts/audit-maguare.cjs` para el inventario actual. La auditoría usa solo archivos versionados; no cuenta las fotos originales excluidas de Git.

## Datos que debe suministrar Maguaré

- `productionUrl`: URL absoluta y definitiva del minisito. Es necesaria para `canonical`, `og:url`, `og:image` y datos estructurados válidos.
- `gtmContainerId`: identificador oficial y aprobado del contenedor GTM. El empaquetador inserta el código únicamente en producción cuando se configura este valor.
- Confirmación de título institucional: el título completo de la audioteca con el cierre institucional excede el rango recomendado de 50-60 caracteres. Está priorizada la denominación oficial hasta recibir una alternativa aprobada.

## Ya preparado

- El empaquetador (`scripts/package-maguare.cjs`) toma solo los archivos web versionados; omite código fuente, scripts de desarrollo, originales ignorados y archivos locales ajenos.
- Genera `index.html` en la raíz y mantiene los enlaces relativos de las ocho páginas para instalación en un subdirectorio.
- Aplica idioma `es-CO`, descripción propia, Open Graph, Twitter y `robots` a cada página **en la copia**, sin modificar el sitio fuente.
- En producción y con URL HTTPS definitiva, genera `canonical`, `og:url` y la imagen social absoluta. En staging conserva `noindex`.
- GTM solo se instala si Maguaré proporciona su ID oficial; no se incluyen píxeles adicionales.
- El empaquetador se niega a presentar un paquete de más de 100 MiB como conforme sin una autorización explícita de revisión.

## Cómo preparar una copia

1. Revise `maguare.config.json`: deje `staging` para pruebas; ponga `production` solo después de recibir la URL definitiva HTTPS y autorización de Maguaré.
2. Ejecute `node scripts/audit-maguare.cjs` y resuelva los avisos aplicables.
3. Compruebe el tamaño sin copiar: `node scripts/package-maguare.cjs --dry-run`.
4. Una vez optimizados o autorizados los medios, ejecute `node scripts/package-maguare.cjs delivery/maguare`.
5. Verifique la copia por HTTP desde el subdirectorio real, incluida la reproducción de cada audio, las galerías, la navegación por teclado y el diseño móvil. Comprima **el contenido** de `delivery/maguare` de modo que `index.html` quede en la raíz del ZIP.

`--allow-overweight` permite generar una copia de **revisión**, pero no la convierte en entrega conforme.

## Bloqueos y decisiones pendientes

Se convirtieron **302 imágenes de contenido a WebP** y se actualizaron sus rutas; los PNG de ilustraciones se codificaron sin pérdida y los logos oficiales permanecieron intactos. La imagen social `og.webp` se actualizó a partir del nuevo PNG de 1907 × 913 px y se optimizó a WebP. Los originales se conservan localmente para reversión, pero el empaquetador usa los WebP en su lugar. Ejecute `python scripts/verify-webp.py` para validar decodificación, dimensiones y transparencia.

El paquete de revisión optimizado pesa aproximadamente **651.78 MiB sin comprimir** (antes 735.55 MiB): 33 audios superan 5 MiB, 6 son M4A y 246 imágenes aún exceden 150 KiB para interfaz/ilustraciones o 400 KiB para fotografía/fondo. La guía propone 75 MiB y evaluar excepciones hasta 100 MiB. No se han recomprimido automáticamente voces ni música; para reducir más las ilustraciones habría que aceptar compresión con pérdida o redimensionamiento y validar visualmente con el cliente. Sigue siendo necesario acordar calidad, posible división de contenidos, alojamiento de medios y excepción de tamaño con Maguaré.

Faltan `apple-touch-icon.png`, `icon-192.png` e `icon-512.png`. No se sustituirán logos oficiales por variantes generadas.

No se puede certificar todavía PageSpeed ≥85 móvil/escritorio, WCAG 2.1 AA, comportamiento en el VPS ni Rich Results sin la URL de instalación y pruebas reales. El `robots.txt` dentro de un subdirectorio no gobierna el dominio principal; se debe coordinar con el administrador de Maguaré. La corrección editorial final sigue pendiente y se aplicará cuando el cliente la entregue.

La prueba HTTP local desde un subdirectorio respondió 200 para portada, comunidad e imágenes WebP **al configurar `Content-Type: image/webp`**. El servidor predeterminado de Python en este entorno respondió `application/octet-stream` antes de esa configuración; Maguaré debe confirmar el MIME correcto en su VPS.
