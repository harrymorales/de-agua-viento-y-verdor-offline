(() => {
  const groups = [
    {
      number: '01',
      heading: 'Instituciones',
      tone: '',
      cards: [
        {
          title: 'Ministerio de Educación Nacional',
          people: [
            ['Ministra', 'Ilva Myriam Hoyos Castañeda'],
            ['Viceministerio de Educación Preescolar, Básica y Media', 'Gledy María Foliaco Rebolledo'],
            ['Directora Primera Infancia', 'María del Pilar Ardila (E)'],
            ['Profesional técnico Primera Infancia', 'Karem Yiseth Trujillo Vanegas']
          ]
        },
        {
          title: 'Ministerio de las Culturas, las Artes y los Saberes',
          people: [
            ['Ministra', 'Paola Holguín Moreno'],
            ['Secretario General', 'Julián David Sterling Olave'],
            ['Viceministra de las Artes y la Economía Cultural y Creativa', 'Ana María Abello Restrepo'],
            ['Viceministra de los Patrimonios, las Memorias y la Gobernanza Cultural (*)', 'Aglaé Dinora Caraballo Mercado'],
            ['Director de Poblaciones', 'Héctor Enrique Durango'],
            ['Coordinador Grupo Cursos de Vida', 'William Ricardo Aguilera López']
          ]
        },
        {
          title: 'Corporación Colombia Crea Talento, CoCrea',
          people: [
            ['Directora', 'María del Pilar Ordóñez Méndez'],
            ['Subdirector Corporativo', 'Óscar Medina Sánchez'],
            ['Directora de comunicaciones', 'Luisa Cano'],
            ['Coordinadora de proyectos de interés común, PICS', 'Paola Vives Baquero'],
            ['Líder Misional', 'Carlos Mauricio Galeano Vargas'],
            ['Líder Técnica', 'Yohanna Milena Flórez Díaz'],
            ['Asesora Pedagógica', 'Sandra Patricia Argel Raciny'],
            ['Productora General', 'Milena Thinkan Beltrán'],
            ['Antropóloga', 'Libia Tattay Bolaños'],
            ['Fotógrafo y realizador audiovisual', 'Juan Camilo Franco Hernández'],
            ['Periodista', 'Jenny Alexandra González Fandiño'],
            ['Diseñador', 'Nicolás Andrés Galindo Becerra']
          ]
        }
      ]
    },
    {
      number: '02',
      heading: 'Lenguas y producción sonora',
      tone: 'credits-pale',
      cards: [
        {
          title: 'Equipo lingüístico',
          people: [
            ['Asesora Lingüista', 'Charlotte Victoria Álvarez'],
            ['Traductor de la comunidad Palenque', 'Manuel Pérez Salinas'],
            ['Traductor de la comunidad Rrom', 'Esmeralda Gómez Triana'],
            ['Traductor de la comunidad Yukpa', 'Katia Johanna Garcerant Capitan'],
            ['Traductor de la comunidad Raizal', 'Alejandro Guillermo Dawkins Hawkins'],
            ['Traductor de la comunidad Inga', 'María Ermencia Chasoy Janamejoy'],
            ['Traductor de la comunidad Cofán', 'Roveyro López']
          ]
        },
        {
          title: 'Producción sonora y musical',
          people: [
            ['Productor sonoro y musical, autoría de paisajes sonoros, grabación y edición musical', 'León David Cobo Estrada'],
            ['Comité editorial y curaduría', 'Equipo de producción CoCrea']
          ]
        },
        {
          title: 'Mango Producciones',
          people: [
            { heading: 'Equipo lingüístico' },
            ['Par Lingüístico Rrom', 'Daniel Gómez'],
            ['Par Lingüístico Yukpa', 'Wilson Pardo'],
            ['Par Lingüístico Cofán', 'María Helena Tobar'],
            { heading: 'Edición, mezcla y masterización' },
            ['Asistente mezcla', 'Adriana Moreno'],
            ['Ingeniero de mezcla y masterización', 'Pablo Martínez'],
            ['Asistente de mezcla', 'Mario Lora']
          ]
        }
      ]
    },
    {
      number: '03',
      heading: 'Edición y realización',
      tone: '',
      cards: [
        {
          title: 'Producción editorial',
          people: [
            ['Escritura de textos de comunidades e introductorios de registros sonoros', 'Libia Tattay Bolaños'],
            ['Redacción de textos de paisajes sonoros', 'León David Cobo Estrada'],
            ['Redacción de textos: Cómo leer y escuchar este libro', 'León David Cobo Estrada · Libia Tattay Bolaños · Charlotte Victoria Álvarez'],
            ['Revisión de textos', 'Yohanna Milena Flórez Díaz']
          ]
        },
        {
          title: 'Producción editorial',
          tone: 'credits-print-card--accent',
          people: [
            ['Producción ejecutiva', 'Lee Morales'],
            ['Administración', 'Katiana Avendaño'],
            ['Coordinación de producción', 'Nathashia Franco'],
            ['Director editorial transmedia', 'Lizardo Carvajal'],
            ['Coordinación editorial', 'Laly Malagón Vargas'],
            ['Correctora de estilo', 'Estefanía Mejía'],
            ['Diseño gráfico y maquetación', 'César Garzón'],
            ['Ilustración', 'Laura Ciro'],
            ['Programación', 'Harry Morales'],
            ['Redacción de orientaciones pedagógicas', 'Luz Estela Fajardo']
          ]
        }
      ]
    }
  ];

  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const people = entries => entries.map(entry => entry.heading
    ? `<h3 class="credits-print-subheading">${escape(entry.heading)}</h3>`
    : `<section><p>${escape(entry[0])}</p><h3>${escape(entry[1])}</h3></section>`).join('');
  const card = entry => `<article class="credits-print-card${entry.tone ? ` ${entry.tone}` : ''}"><h2>${escape(entry.title)}</h2><div>${people(entry.people)}</div></article>`;
  const legal = `
    <section class="credits-print-legal">
      <h2>Información editorial y derechos</h2>
      <p><b>Audioteca: <i>De agua, viento y verdor, tomo IV</i></b><br>© CoCrea, 2026<br><b>Edición multilingüe</b><br><b>ISBN</b><br><em>Sin dato</em></p>
      <p><b>Bogotá D. C., Colombia</b></p>
      <h2>Derechos de autor, derechos colectivos y autorización de uso</h2>
      <p><b>© De los cantos, relatos, narraciones, vocabularios, músicas, sonoridades y demás expresiones culturales tradicionales:</b> las comunidades palenquera, rrom, yukpa, raizal, inga y cofán, según corresponda a cada contenido.</p>
      <p>Los contenidos de origen comunitario mantienen su naturaleza colectiva y su vínculo con el patrimonio cultural inmaterial de los pueblos y comunidades que participaron en su creación, transmisión y registro. La autorización otorgada para esta publicación no implica transferencia de la titularidad colectiva ni apropiación de los conocimientos, expresiones culturales tradicionales, lenguas, sonoridades o saberes de las comunidades.</p>
      <p>Los derechos de intérpretes, ejecutantes, narradores y demás participantes corresponden a sus respectivos titulares y se ejercen conforme a las autorizaciones individuales suscritas para el proyecto.</p>
      <h2>Autorización de circulación y uso</h2>
      <p>Las comunidades autorizan a CoCrea, el Ministerio de Educación Nacional y el Ministerio de las Culturas, las Artes y los Saberes, mediante licencia gratuita y no exclusiva, a reproducir, divulgar, distribuir y poner a disposición los contenidos aprobados de la Audioteca <i>De agua, viento y verdor, tomo IV</i>, en plataformas y medios institucionales, con fines educativos, culturales y de acceso público.</p>
      <p>Se permiten las adecuaciones técnicas, lingüísticas y de accesibilidad necesarias, siempre que no alteren su sentido cultural. Se prohíbe su comercialización o monetización.</p>
      <h2>Convenio</h2>
      <p>Esta publicación es producto del <b>Convenio Interadministrativo No. CVI-MEN-0001-2026</b>, suscrito entre el Ministerio de Educación Nacional, el Ministerio de las Culturas, las Artes y los Saberes No. 0932-2026 y la Corporación Colombia Crea Talento – CoCrea.</p>
    </section>`;

  document.getElementById('root').innerHTML = `
    <main class="credits-page credits-print">
      <header class="credits-print-header">
        <div><a href="index.html">← Volver al inicio</a><p>Audioteca <i>De agua, viento y verdor</i>,<br>tomo IV</p></div>
        <img src="images/portal/creditos-logos.png" alt="Ministerio de Educación, Ministerio de las Culturas y CoCrea">
      </header>
      <div class="credits-print-columns">
        <section>${card(groups[0].cards[0])}${card(groups[0].cards[1])}${card(groups[0].cards[2])}</section>
        <section>${card(groups[1].cards[0])}${card(groups[1].cards[1])}${card(groups[2].cards[0])}${card(groups[1].cards[2])}</section>
        <section>${card(groups[2].cards[1])}${legal}</section>
      </div>
      <footer class="credits-print-footer"><a href="index.html">De agua, viento y verdor</a></footer>
    </main>`;
})();
