/* =========================================================
   REFERÊNCIAS DO DOM
========================================================= */
const onlineDiv = document.getElementById('online');
const presencialDiv = document.getElementById('presencial');

const planoOnlineDiv = document.getElementById('planoOnline');
const planoPresencialDiv = document.getElementById('planoPresencial');

const selectPresencial = document.getElementById('selectPresencial');
const materiasBox = document.getElementById('materiasBox');
const erroCurso = document.getElementById('erroCurso');

const materiasEls = document.querySelectorAll('.materia');

/* =========================================================
   VALORES
========================================================= */
const VALOR_ONLINE = 799.90;
let modalidadeSelecionada = null;
const valoresPresencial = {
  "MAX NATCDF (Combo Completo)": 450,
  "NATCDF Combo 2 Matérias": 320,
  "NATCDF 1 Matéria": 180
};

let materiasSelecionadas = [];

/* =========================================================
   ONLINE
========================================================= */
function mostrarOnline() {
  modalidadeSelecionada = 'online';
  erroCurso.style.display = 'none';

  onlineDiv.classList.remove('hidden');
  presencialDiv.classList.add('hidden');

  // Limpa presencial
  selectPresencial.value = '';
  planoPresencialDiv.classList.add('hidden');
  materiasBox.classList.add('hidden');
  limparMaterias();

  planoOnlineDiv.innerHTML = `
    <h3>Curso selecionado</h3>
    <p><strong>NATUREZA CDF Online</strong></p>
    <p>Valor: R$ ${VALOR_ONLINE.toFixed(2)}</p>
  `;
  planoOnlineDiv.classList.remove('hidden');

  localStorage.setItem(
    'cursoSelecionado',
    JSON.stringify({
      nome: 'NATUREZA CDF Online',
      valor: VALOR_ONLINE,
      modalidade: 'online'
    })
  );
}


/* =========================================================
   PRESENCIAL
========================================================= */
function mostrarPresencial() {
  modalidadeSelecionada = 'presencial';
  erroCurso.style.display = 'none';

  presencialDiv.classList.remove('hidden');
  onlineDiv.classList.add('hidden');
  planoOnlineDiv.classList.add('hidden');

  // LIMPA QUALQUER CURSO ANTERIOR
  selectPresencial.value = '';
  planoPresencialDiv.classList.add('hidden');
  materiasBox.classList.add('hidden');
  limparMaterias();

  localStorage.removeItem('cursoSelecionado');
}


/* =========================================================
   PLANO PRESENCIAL
========================================================= */
function mostrarPlanoPresencial() {
  erroCurso.style.display = 'none';

  const curso = selectPresencial.value;
  limparMaterias();
  materiasBox.classList.add('hidden');

  if (!curso) {
    planoPresencialDiv.classList.add('hidden');
    return;
  }

  const valor = valoresPresencial[curso];

  if (curso.includes('Matéria')) {
    materiasBox.classList.remove('hidden');
  }

  planoPresencialDiv.innerHTML = `
    <h3>Curso selecionado</h3>
    <p><strong>${curso}</strong></p>
    <p>Valor: R$ ${valor.toFixed(2)}</p>
  `;
  planoPresencialDiv.classList.remove('hidden');

  localStorage.setItem(
    'cursoSelecionado',
    JSON.stringify({
      nome: curso,
      valor: valor,
      modalidade: 'presencial'
    })
  );
}

/* =========================================================
   MATÉRIAS
========================================================= */
materiasEls.forEach(el => {
  el.addEventListener('click', () => {
    const curso = selectPresencial.value;
    const materia = el.dataset.materia;

    if (!curso.includes('Matéria')) return;

    const limite = curso.includes('2 Matérias') ? 2 : 1;

    if (!el.classList.contains('selected') && materiasSelecionadas.length >= limite) {
      erroCurso.innerText = `Selecione exatamente ${limite} matéria(s).`;
      erroCurso.style.display = 'block';
      return;
    }

    el.classList.toggle('selected');

    if (materiasSelecionadas.includes(materia)) {
      materiasSelecionadas = materiasSelecionadas.filter(m => m !== materia);
    } else {
      materiasSelecionadas.push(materia);
    }

    const valor = valoresPresencial[curso];

    localStorage.setItem(
      'cursoSelecionado',
      JSON.stringify({
        nome: `${curso} (${materiasSelecionadas.join(', ')})`,
        valor: valor,
        modalidade: 'presencial'
      })
    );
  });
});

/* =========================================================
   AUXILIAR
========================================================= */
function limparMaterias() {
  materiasSelecionadas = [];
  materiasEls.forEach(m => m.classList.remove('selected'));
}

/* =========================================================
   CONTINUAR
========================================================= */
function irParaCadastro() {

  // 1️⃣ Modalidade obrigatória
  if (!modalidadeSelecionada) {
    erroCurso.innerText = 'Selecione a modalidade (Online ou Presencial).';
    erroCurso.style.display = 'block';
    return;
  }

  // 2️⃣ Curso obrigatório
  const curso = localStorage.getItem('cursoSelecionado');

  if (!curso) {
    erroCurso.innerText = 'Selecione um curso para continuar.';
    erroCurso.style.display = 'block';
    return;
  }

  // 3️⃣ Validação de matérias (presencial)
  if (modalidadeSelecionada === 'presencial') {

    if (
      selectPresencial.value === 'NATCDF Combo 2 Matérias' &&
      materiasSelecionadas.length !== 2
    ) {
      erroCurso.innerText = 'Selecione exatamente 2 matérias.';
      erroCurso.style.display = 'block';
      return;
    }

    if (
      selectPresencial.value === 'NATCDF 1 Matéria' &&
      materiasSelecionadas.length !== 1
    ) {
      erroCurso.innerText = 'Selecione 1 matéria.';
      erroCurso.style.display = 'block';
      return;
    }
  }

  // 4️⃣ OK → Cadastro
  window.location.href = 'cadastro.html';
}

