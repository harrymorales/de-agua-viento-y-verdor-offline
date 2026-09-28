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
            ['Par Lingüístico Rrom', 'Daniel Gómez'],
            ['Par Lingüístico Yukpa', 'Wilson Pardo'],
            ['Par Lingüístico Cofán', 'María Helena Tobar'],
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
          title: 'Producción editorial transmedia',
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
  const people = entries => entries.map(([role, name]) => `<section><p>${escape(role)}</p><h3>${escape(name)}</h3></section>`).join('');
  const cards = entries => entries.map(card => `<article class="credits-print-card"><h2>${escape(card.title)}</h2><div>${people(card.people)}</div></article>`).join('');
  const sections = groups.map(group => `<section class="credits-print-section"><header><span>${group.number}</span><h2>${group.heading}</h2></header><div class="credits-print-grid">${cards(group.cards)}</div></section>`).join('');

  document.getElementById('root').innerHTML = `
    <main class="credits-page credits-print">
      <header class="credits-print-masthead">
        <a href="index.html" class="credits-print-back">← Volver al inicio</a>
        <p>Audioteca <i>De agua, viento y verdor</i>, tomo IV</p>
        <div><span>© CoCrea, 2026</span><span>Edición multilingüe</span><span>ISBN · Sin dato</span></div>
        <h1>Créditos</h1>
        <p class="credits-print-subtitle">Paisajes sonoros, cantos y relatos en lenguas nativas para niños y niñas</p>
      </header>
      ${sections}
      <section class="credits-print-rights">
        <span>Información editorial y derechos</span>
        <h2>Derechos colectivos y autorización de uso</h2>
        <p>© De los cantos, relatos, narraciones, vocabularios, músicas, sonoridades y demás expresiones culturales tradicionales: las comunidades palenquera, rrom, yukpa, raizal, inga y cofán, según corresponda a cada contenido.</p>
        <p>Los contenidos de origen comunitario mantienen su naturaleza colectiva y su vínculo con el patrimonio cultural inmaterial de los pueblos y comunidades que participaron en su creación, transmisión y registro. La autorización otorgada para esta publicación no implica transferencia de la titularidad colectiva ni apropiación de los conocimientos, expresiones culturales tradicionales, lenguas, sonoridades o saberes de las comunidades.</p>
        <p>Los derechos de intérpretes, ejecutantes, narradores y demás participantes corresponden a sus respectivos titulares y se ejercen conforme a las autorizaciones individuales suscritas para el proyecto.</p>
        <h2>Autorización de circulación y uso</h2>
        <p>Las comunidades autorizan a CoCrea, el Ministerio de Educación Nacional y el Ministerio de las Culturas, las Artes y los Saberes, mediante licencia gratuita y no exclusiva, a reproducir, divulgar, distribuir y poner a disposición los contenidos aprobados de la Audioteca <i>De agua, viento y verdor, tomo IV</i>, en plataformas y medios institucionales, con fines educativos, culturales y de acceso público.</p>
        <p>Se permiten las adecuaciones técnicas, lingüísticas y de accesibilidad necesarias, siempre que no alteren su sentido cultural. Se prohíbe su comercialización o monetización.</p>
      </section>
      <section class="credits-print-section credits-print-convenio">
        <header><span>04</span><h2>Convenio</h2></header>
        <p class="credits-convenio">Esta publicación es producto del <b>Convenio Interadministrativo No. CVI-MEN-0001-2026</b>, suscrito entre el Ministerio de Educación Nacional, el Ministerio de las Culturas, las Artes y los Saberes No. 0932-2026 y la Corporación Colombia Crea Talento – CoCrea.</p>
      </section>
      <footer class="credits-print-footer"><span>Bogotá D. C., Colombia</span><a href="index.html">De agua, viento y verdor</a></footer>
    </main>`;
})();
