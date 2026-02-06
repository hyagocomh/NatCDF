/* =========================================================
   CRIA TOKEN DE FLUXO (SEGURANÇA)
========================================================= */
function gerarUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

localStorage.setItem(
  'flowToken',
  JSON.stringify({
    value: gerarUUID(),
    expires: Date.now() + 10 * 60 * 1000 // 10 minutos
  })
);

/* =========================================================
   REFERÊNCIAS DO DOM
========================================================= */
const avisoCupomPresencial = document.getElementById('avisoCupomPresencial');
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
  "Combo Completo": 450,
  "Combo 2 Matérias": 320,
  "1 Matéria": 180
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
  avisoCupomPresencial.classList.add('hidden');

  selectPresencial.value = '';
  planoPresencialDiv.classList.add('hidden');
  materiasBox.classList.add('hidden');
  limparMaterias();

  planoOnlineDiv.innerHTML = `
    <h3>Curso selecionado</h3>
    <p><strong>Plataforma Online (ANUAL)</strong></p>
    <p>Valor: R$ ${VALOR_ONLINE.toFixed(2)}</p>
  `;
  planoOnlineDiv.classList.remove('hidden');

  localStorage.setItem('cursoSelecionado', JSON.stringify({
    nome: 'Plataforma Online (ANUAL)',
    valor: VALOR_ONLINE,
    modalidade: 'online'
  }));
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
  avisoCupomPresencial.classList.remove('hidden');

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

  if (!curso) return planoPresencialDiv.classList.add('hidden');

  const valor = valoresPresencial[curso];

  if (curso.includes('Matéria')) materiasBox.classList.remove('hidden');

  planoPresencialDiv.innerHTML = `
    <h3>Curso selecionado</h3>
    <p><strong>${curso}</strong></p>
    <p>Valor: R$ ${valor.toFixed(2)}</p>
  `;
  planoPresencialDiv.classList.remove('hidden');

  localStorage.setItem('cursoSelecionado', JSON.stringify({
    nome: curso,
    valor,
    modalidade: 'presencial'
  }));
}

/* =========================================================
   MATÉRIAS
========================================================= */
materiasEls.forEach(el => {
  el.addEventListener('click', () => {
    const curso = selectPresencial.value;
    if (!curso.includes('Matéria')) return;

    const limite = curso.includes('2 Matérias') ? 2 : 1;
    const materia = el.dataset.materia;

    if (!el.classList.contains('selected') && materiasSelecionadas.length >= limite) {
      erroCurso.innerText = `Selecione exatamente ${limite} matéria(s).`;
      erroCurso.style.display = 'block';
      return;
    }

    el.classList.toggle('selected');

    materiasSelecionadas.includes(materia)
      ? materiasSelecionadas = materiasSelecionadas.filter(m => m !== materia)
      : materiasSelecionadas.push(materia);

    localStorage.setItem('cursoSelecionado', JSON.stringify({
      nome: `${curso} (${materiasSelecionadas.join(', ')})`,
      valor: valoresPresencial[curso],
      modalidade: 'presencial'
    }));
  });
});

function limparMaterias() {
  materiasSelecionadas = [];
  materiasEls.forEach(m => m.classList.remove('selected'));
}

/* =========================================================
   CONTINUAR
========================================================= */
function irParaCadastro() {
  if (!modalidadeSelecionada) {
    erroCurso.innerText = 'Selecione a modalidade.';
    erroCurso.style.display = 'block';
    return;
  }

  if (!localStorage.getItem('cursoSelecionado')) {
    erroCurso.innerText = 'Selecione um curso.';
    erroCurso.style.display = 'block';
    return;
  }

  window.location.href = 'cadastro.html';
}
