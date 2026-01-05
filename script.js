/* =========================================================
   REFERÊNCIAS PRINCIPAIS DO DOM
   ========================================================= */

// Blocos principais
const onlineDiv = document.getElementById('online');
const presencialDiv = document.getElementById('presencial');

// Selects
const selectPresencial = document.getElementById('selectPresencial');

// Containers de exibição
const planoPresencialDiv = document.getElementById('planoPresencial');
const materiasBox = document.getElementById('materiasBox');

// Matérias (botões visuais)
const materiasEls = document.querySelectorAll('.materia');


/* =========================================================
   CONTROLE DE MODALIDADE (ONLINE / PRESENCIAL)
   ========================================================= */

function mostrarOnline() {
  onlineDiv.classList.remove('hidden');
  presencialDiv.classList.add('hidden');

  // Limpa seleção do presencial
  selectPresencial.value = '';
  planoPresencialDiv.classList.add('hidden');
  materiasBox.classList.add('hidden');
  limparMaterias();
}

function mostrarPresencial() {
  presencialDiv.classList.remove('hidden');
  onlineDiv.classList.add('hidden');
}


/* =========================================================
   MOSTRAR PLANO PRESENCIAL SELECIONADO
   ========================================================= */

function mostrarPlanoPresencial() {
  const curso = selectPresencial.value;

  // Sempre limpa matérias ao trocar de curso
  limparMaterias();

  // Conteúdo dos planos
  const planos = {
    combo: `
      <h3>MAX NATCDF (Combo Completo)</h3>
      <p><strong>Valor:</strong> R$ 450,00</p>
    `,
    combo2: `
      <h3>NATCDF Combo 2 Matérias</h3>
      <p><strong>Valor:</strong> R$ 320,00</p>
      <p>Escolha <strong>2 matérias</strong>.</p>
    `,
    '1mat': `
      <h3>NATCDF1 Matéria</h3>
      <p><strong>Valor:</strong> R$ 180,00</p>
      <p>Escolha <strong>1 matéria</strong>.</p>
    `
  };

  // Exibe o plano escolhido
  if (planos[curso]) {
    planoPresencialDiv.innerHTML = planos[curso];
    planoPresencialDiv.classList.remove('hidden');
  } else {
    planoPresencialDiv.classList.add('hidden');
  }

  // Mostra seleção de matérias apenas quando necessário
  if (curso === 'combo2' || curso === '1mat') {
    materiasBox.classList.remove('hidden');
  } else {
    materiasBox.classList.add('hidden');
  }
}


/* =========================================================
   SELEÇÃO DE MATÉRIAS (SEM CHECKBOX)
   ========================================================= */

materiasEls.forEach(el => {
  el.addEventListener('click', () => {
    const curso = selectPresencial.value;

    // Só permite seleção se o curso exigir matérias
    if (curso !== 'combo2' && curso !== '1mat') return;

    const selecionadas = document.querySelectorAll('.materia.selected');

    // REGRAS DE LIMITE
    if (
      curso === 'combo2' &&
      !el.classList.contains('selected') &&
      selecionadas.length >= 2
    ) {
      alert('Você pode selecionar apenas 2 matérias.');
      return;
    }

    if (
      curso === '1mat' &&
      !el.classList.contains('selected') &&
      selecionadas.length >= 1
    ) {
      alert('Você pode selecionar apenas 1 matéria.');
      return;
    }

    // Alterna seleção visual
    el.classList.toggle('selected');
  });
});


/* =========================================================
   FUNÇÕES AUXILIARES
   ========================================================= */

// Remove seleção de todas as matérias
function limparMaterias() {
  materiasEls.forEach(m => m.classList.remove('selected'));
}


/* =========================================================
   CONTINUAR PARA CADASTRO (MEMORIZAÇÃO)
   ========================================================= */

function irParaCadastro() {
  let cursoSelecionado = null;
  let materiasSelecionadas = [];

  /* -------- ONLINE -------- */
  if (!onlineDiv.classList.contains('hidden')) {
    cursoSelecionado = `
      <h3>NATUREZA CDF Online</h3>
      <p><strong>Valor:</strong> R$ 799,90(PIX) ou 10 x 89,90(CARTÃO)</p>
    `;
  }

  /* -------- PRESENCIAL -------- */
  if (!presencialDiv.classList.contains('hidden')) {
    const curso = selectPresencial.value;

    if (!curso) {
      alert('Selecione um curso presencial.');
      return;
    }

    // Captura matérias escolhidas
    materiasSelecionadas = [...document.querySelectorAll('.materia.selected')]
      .map(m => m.dataset.materia);

    // Valida quantidade de matérias
    if (curso === 'combo2' && materiasSelecionadas.length !== 2) {
      alert('Selecione exatamente 2 matérias.');
      return;
    }

    if (curso === '1mat' && materiasSelecionadas.length !== 1) {
      alert('Selecione exatamente 1 matéria.');
      return;
    }

    cursoSelecionado = `
      ${planoPresencialDiv.innerHTML}
      ${
        materiasSelecionadas.length
          ? `<p><strong>Matéria(s):</strong> ${materiasSelecionadas.join(', ')}</p>`
          : ''
      }
    `;
  }

  // Segurança extra
  if (!cursoSelecionado) {
    alert('Selecione um curso para continuar.');
    return;
  }

  // Salva no localStorage
  localStorage.setItem('cursoSelecionado', cursoSelecionado);

  // Redireciona
  window.location.href = 'cadastro.html';
}
