(() => {
  const card = (title, people) => `<article class="credits-print-card"><h2>${title}</h2><div>${people.map(([role, name]) => `<section><p>${role}</p><h3>${name}</h3></section>`).join('')}</div></article>`;

  const institutions = [
    card('Ministerio de Educación Nacional', [
      ['Ministra de Educación Nacional', 'Ilva Myriam Hoyos Castañeda'],
      ['Viceministerio de Educación Preescolar, Básica y Media', 'Gledy María Foliaco Rebolledo'],
      ['Director (E) Primera Infancia', 'Yonar Eduardo Figueroa Salas'],
      ['Profesional técnico Primera Infancia', 'Karem Yiseth Trujillo Vanegas']
    ]),
    card('Ministerio de las Culturas, las Artes y los Saberes', [
      ['Ministra de las Culturas, las Artes y los Saberes', 'Paola Holguín Moreno'],
      ['Secretario General', 'Julián David Sterling Olave'],
      ['Viceministra de las Artes y la Economía Cultural y Creativa', 'Ana María Abello Restrepo'],
      ['Viceministra de los Patrimonios, las Memorias y la Gobernanza Cultural (*)', 'Aglaé Dinora Caraballo Mercado'],
      ['Director de Poblaciones', 'Héctor Enrique Durango Galván'],
      ['Coordinador Grupo Cursos de Vida', 'William Ricardo Aguilera López'],
      ['Profesional Especializado Cursos de Vida', 'Deisy Contreras Ramos']
    ]),
    card('Corporación Colombia Crea Talento – CoCrea', [
      ['Directora', 'María del Pilar Ordóñez Méndez'],
      ['Subdirector Corporativo', 'Óscar Medina Sánchez'],
      ['Jefe de Comunicaciones', 'Luisa Cano'],
      ['Coordinadora de Proyectos de Interés Común, PICS', 'Paola Vives Baquero'],
      ['Líder Misional', 'Carlos Mauricio Galeano Vargas']
    ])
  ].join('');

  const direction = card('Dirección y producción', [
    ['Dirección editorial transmedia y autoría de «Cómo leer y escuchar este libro»', 'Lizardo Carvajal'],
    ['Producción general', 'Milena Thinkan Beltrán'],
    ['Producción ejecutiva', 'Lee Morales'],
    ['Coordinación de producción', 'Nathashia Franco'],
    ['Coordinación editorial', 'Laly Malagón Vargas'],
    ['Coordinación técnica y revisión de textos', 'Yohanna Milena Flórez Díaz'],
    ['Asesoría pedagógica', 'Sandra Patricia Argel Raciny'],
    ['Comité editorial y curaduría', 'Equipo de producción de CoCrea']
  ]);

  const content = card('Autoría y contenidos', [
    ['Investigación antropológica, escritura de los textos sobre las comunidades y de las introducciones a los registros sonoros, y coautoría de «Cómo leer y escuchar este libro»', 'Libia Tattay Bolaños'],
    ['Producción sonora y musical; autoría de paisajes sonoros y de sus textos; grabación y edición musical; coautoría de «Cómo leer y escuchar este libro»', 'León David Cobo Estrada'],
    ['Asesoría lingüística y coautoría de «Cómo leer y escuchar este libro»', 'Charlotte Victoria Álvarez'],
    ['Escritura de orientaciones pedagógicas', 'Luz Estela Fajardo']
  ]);

  const translations = card('Traducción y revisión lingüística', [
    ['Traducción — comunidad palenquera', 'Manuel Pérez Salinas'],
    ['Traducción — comunidad rrom', 'Esmeralda Gómez Triana'],
    ['Traducción — comunidad yukpa', 'Katia Johanna Garcerant Capitan'],
    ['Traducción — comunidad raizal', 'Alejandro Guillermo Dawkins Hawkins'],
    ['Traducción — comunidad inga', 'María Ermencia Chasoy Janamejoy · Carmelina Chindoy · Rosa Jamioy Janamejoy'],
    ['Traducción — comunidad cofán', 'Roveyro López'],
    ['Revisión lingüística — lengua rrom', 'Daniel Gómez'],
    ['Revisión lingüística — lengua yukpa', 'Wilson Largo Sichaca'],
    ['Revisión lingüística — lengua cofán', 'María Elena Tobar']
  ]);

  const production = card('Producción gráfica, audiovisual y digital', [
    ['Fotografía y realización audiovisual', 'Juan Camilo Franco Hernández'],
    ['Diseño gráfico y maquetación', 'César Garzón'],
    ['Ilustración', 'Laura Ciro'],
    ['Programación', 'Harry Morales'],
    ['Corrección de estilo', 'Estefanía Mejía'],
    ['Revisión de textos', 'Mango Producciones y equipo lingüístico'],
    ['Ingeniería de mezcla y masterización', 'Pablo Martínez'],
    ['Asistencia de mezcla', 'Adriana Moreno · Mario Lora']
  ]);

  const legal = `
    <section class="credits-print-legal">
      <h2>Información editorial y derechos</h2>
      <p><b>Audioteca <i>De agua, viento y verdor</i>, volumen IV</b><br>© [Titularidad por confirmar], 2026<br>Edición multilingüe<br>ISBN: [Por definir]<br>Bogotá, D. C., Colombia</p>
      <h2>Derechos de autor, derechos colectivos y autorización de uso</h2>
      <p>© De los cantos, relatos, narraciones, vocabularios, músicas, sonoridades y demás expresiones culturales tradicionales: las comunidades palenquera, rrom, yukpa, raizal, inga y cofán, según corresponda a cada contenido.</p>
      <p>Los contenidos de origen comunitario mantienen su naturaleza colectiva y su vínculo con el patrimonio cultural inmaterial de los pueblos y comunidades que participaron en su creación, transmisión y registro. La autorización otorgada para esta publicación no implica transferencia de la titularidad colectiva ni apropiación de los conocimientos, expresiones culturales tradicionales, lenguas, sonoridades o saberes de las comunidades.</p>
      <p>Los derechos de autores, intérpretes, ejecutantes, narradores y demás participantes corresponden a sus respectivos titulares y se ejercen conforme a las autorizaciones individuales suscritas para el proyecto.</p>
      <h2>Autorización de circulación y uso</h2>
      <p>Las comunidades autorizan a CoCrea, el Ministerio de Educación Nacional y el Ministerio de las Culturas, las Artes y los Saberes, mediante licencia gratuita y no exclusiva, a reproducir, divulgar, distribuir y poner a disposición los contenidos aprobados de la Audioteca <i>De agua, viento y verdor</i>, tomo IV, en plataformas y medios institucionales, con fines educativos, culturales y de acceso público.</p>
      <p>Se permiten las adecuaciones técnicas, lingüísticas y de accesibilidad necesarias, siempre que no alteren su sentido cultural. Se prohíbe su comercialización o monetización.</p>
      <h2>Convenio</h2>
      <p>Esta publicación es producto del Convenio Interadministrativo n.º CVI-MEN-0001-2026 y 0932-2026, suscrito entre el Ministerio de Educación Nacional, el Ministerio de las Culturas, las Artes y los Saberes y la Corporación Colombia Crea Talento – CoCrea.</p>
    </section>`;

  document.getElementById('root').innerHTML = `
    <main class="credits-page credits-print">
      <header class="credits-print-header">
        <div><a href="index.html">← Volver al inicio</a><p>Audioteca <i>De agua, viento y verdor</i>,<br>tomo IV</p></div>
        <img src="images/portal/creditos-logos.png" alt="Ministerio de Educación, Ministerio de las Culturas y CoCrea">
      </header>
      <div class="credits-print-columns">
        <section>${institutions}</section>
        <section>${direction}${content}${translations}</section>
        <section>${production}${legal}</section>
      </div>
      <footer class="credits-print-footer"><a href="index.html">De agua, viento y verdor</a></footer>
    </main>`;
})();
