# Contenido editable por territorio

La audioteca que abre `index.html` conserva sin cambios la implementación y el diseño originales.

El catálogo de territorios está en `src/content/territories.json`. Solo los territorios con estado `published` se validan como listos para integrar. Los demás se conservan como `draft` hasta recibir contenido aprobado.

El contenido original de Palenque fue extraído a `src/content/palenque.original.json`. Es la referencia completa para construir cada nueva audioteca, sin volver a escribir textos ni rutas desde el archivo compilado.

Raizal ya cuenta con una primera carga textual en `src/content/raizal.json`: perfil de comunidad, 13 pistas, letras y traducciones disponibles, 144 entradas de vocabulario en español, inglés y creole, y cinco lecturas culturales. Tiene estado `text-ready` porque aún faltan los archivos de audio e imágenes; no debe cambiarse a `published` hasta que esos recursos estén copiados y verificados.

Para crear un territorio nuevo, copie `src/content/territory-template.json`, asígnele el nombre de su `slug` y complete estos bloques:

1. `cover`: portada, título, descripción y fotografía principal.
2. `communityProfile`: datos de la comunidad, historia y nota patrimonial.
3. `tracks`: una ficha por audio, con ruta, texto original, traducción y actividad relacionada.
4. `vocabulary` y `vocabularyAudioSegments`: palabras y marcas temporales dentro del audio de vocabulario.
5. `photos`, `activities` y `culturalArticles`: fototeca, guía pedagógica y lecturas de contexto.

Mantenga las rutas de audios e imágenes relativas a la raíz del proyecto. Antes de conectar un nuevo territorio a la interfaz, se validarán todas las rutas para evitar botones o reproductores vacíos.

Cada entrada de `vocabulary` puede incluir `spanish`, `native`, `english` y `creole`. Se conservan los campos que aplican a cada territorio, sin forzar equivalencias que no existan.

Si se actualiza el archivo original de Palenque, ejecute `node scripts/extract-palenque-data.cjs` para regenerar el JSON desde el artefacto original.

Antes de conectar o publicar un territorio, ejecute `node scripts/validate-content.cjs`. La validación comprueba que tenga información mínima y que todas las rutas de audio e imagen existan.

## Construir una audioteca con el diseño original

Después de validar un territorio publicado, ejecute `node scripts/build-territory.cjs <slug>`. Por ejemplo, `node scripts/build-territory.cjs palenque` crea `territories/palenque/index.html`.

La página generada reutiliza literalmente el CSS y el motor visual originales. Solo se sustituyen las siete estructuras de contenido: territorios, vocabulario, tiempos del vocabulario, fototeca, pistas, actividades y artículos culturales. El archivo original en `assets/offline-index.js` nunca se modifica.
