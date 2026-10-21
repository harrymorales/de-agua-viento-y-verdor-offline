# Reunión técnica con Maguaré — De agua, viento y verdor

## Mensaje de apertura

«La audioteca está aprobada visual y funcionalmente por el cliente. Tenemos una copia de revisión en staging para que verifiquen la instalación. Falta una corrección editorial final; no cambiaremos esos textos hasta recibirla. Queremos acordar con ustedes la integración, el tratamiento de medios y los criterios de aceptación antes de presentar el paquete definitivo».

## Demostración sugerida (5 minutos)

1. Home y selección de una de las seis comunidades.
2. Audioteca: cambio de pista, reproducción, panel de texto y vocabulario.
3. Fototeca y navegación de regreso; vista móvil y menú.
4. Si hay tiempo, comprobar navegación básica con teclado.

## Decisiones que necesitamos de Maguaré

- **Alojamiento y tamaño:** las imágenes ya usan WebP y el paquete optimizado ocupa ~651,78 MiB sin comprimir (antes ~735,55 MiB); el documento propone ≤75 MiB y procurar no superar 100 MiB. ¿Aceptan medios alojados por separado, paquetes por comunidad o una excepción? ¿Qué tamaño máximo admiten su servidor y su proceso de carga?
- **Audio:** 33 pistas superan 5 MiB y seis archivos son M4A. ¿Exigen convertir cada pista a MP3/OGG de ≤5 MiB incluso cuando la duración haría perceptible la pérdida de calidad, o aceptan excepciones justificadas para grabaciones largas?
- **Ruta final:** ¿cuál será la URL HTTPS y el subdirectorio definitivo? ¿Quién configura la publicación, caché y tipos MIME de MP3/OGG/WebP? Confirmar expresamente `Content-Type: image/webp` en el VPS.
- **Analítica:** ¿cuál es el ID oficial de GTM y qué interacciones deben medirse? Confirmar convención de nombres, consentimiento y restricciones de terceros.
- **SEO y marca:** confirmar logos e iconos oficiales, imagen para compartir y título. El sufijo institucional exigido en el documento choca con el rango de 50–60 caracteres para `<title>`; pedir cuál regla priorizar.
- **QA:** acordar quién ejecuta PageSpeed (meta ≥85 móvil/escritorio), accesibilidad WCAG 2.1 AA y pruebas en la URL final; definir plazo y canal para corregir incidencias.

## Qué entregar y qué no prometer todavía

El ZIP de revisión tiene `index.html` en la raíz, rutas relativas y `README.md`. Está marcado como staging (`noindex`) y no incorpora GTM sin el identificador oficial. Sirve para evaluación técnica, **no** como entrega conforme en peso o rendimiento. No afirmar que supera PageSpeed, accesibilidad o QA de servidor hasta medirlos en la instalación de Maguaré. No prometer compresión de voces, música o ilustraciones sin validar calidad con el cliente.

Comparta la copia actual `delivery/maguare-webp-revision.zip` (643,90 MiB comprimidos); la copia anterior `maguare-revision.zip` ya no refleja la optimización WebP.

## Cierre propuesto

Pedir por escrito: URL/subdirectorio, límites reales de carga, decisión sobre medios y excepciones, GTM, lineamientos de marca, responsables de pruebas y fecha para recibir la corrección textual final. Con esas respuestas se podrá preparar y verificar el paquete de producción.
