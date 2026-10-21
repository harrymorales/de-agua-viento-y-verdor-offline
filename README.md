# De agua, viento y verdor — audioteca

Sitio estático y autocontenido. La página principal es `index.html`; las seis comunidades están en `territories/`. No requiere `npm install`, base de datos ni API para funcionar. Para servirlo localmente se necesita un servidor HTTP estático; abrirlo como `file://` puede restringir funciones del navegador.

## Entrega a Maguaré

Se necesita Node.js para ejecutar los scripts de preparación (no en el servidor de producción):

```text
node scripts/audit-maguare.cjs
node scripts/package-maguare.cjs --dry-run
node scripts/package-maguare.cjs delivery/maguare
```

El último comando solo permite un paquete de hasta 100 MiB. El estado y las decisiones pendientes están en `MAGUARE-ENTREGA.md`. La configuración está en `maguare.config.json`. La copia generada se puede instalar bajo un subdirectorio; debe servirse por HTTPS con `index.html` como entrada. No se deben subir `scripts/`, `src/`, originales no versionados ni archivos temporales.

Las imágenes de contenido usan WebP. Si se sustituyen originales más adelante, regenere y valide las variantes con `python scripts/optimize-images-webp.py --apply`, `node scripts/update-webp-references.cjs` y `python scripts/verify-webp.py`. Los logos institucionales se mantienen en sus formatos oficiales.

Antes de producción, probar en móvil y escritorio todas las rutas, galería, reproductores, teclado, contraste, enlaces y rendimiento en la URL definitiva. No activar la indexación ni Google Tag Manager sin la URL y el identificador oficial aprobados por Maguaré.
