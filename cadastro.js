/* ==============================
   VALIDA TOKEN DE FLUXO
============================== */
function fluxoValido() {
  const token = JSON.parse(localStorage.getItem('flowToken'));
  if (!token) return false;
  if (Date.now() > token.expires) {
    localStorage.removeItem('flowToken');
    return false;
  }
  return true;
}

const curso = JSON.parse(localStorage.getItem('cursoSelecionado'));

if (!curso || !fluxoValido()) {
  window.location.replace('acesso-negado.html');
  throw new Error('Acesso inválido');
}


/* ==============================
   MOSTRA RESUMO DO CURSO
============================== */
const resumoCurso = document.getElementById('resumoCurso');

if (resumoCurso) {
  resumoCurso.innerHTML = `
    <h3>Curso selecionado</h3>
    <p><strong>${curso.nome}</strong></p>
    <p>Modalidade: ${curso.modalidade}</p>
    <p>Valor: R$ ${Number(curso.valor).toFixed(2)}</p>
  `;
}

/* ==============================
   FUNÇÕES AUXILIARES
============================== */
function mostrarErro(input, mensagem, erroId) {
  input.classList.add('field-error');
  const erro = document.getElementById(erroId);
  erro.innerText = mensagem;
  erro.style.display = 'block';
}

function limparErro(input, erroId) {
  input.classList.remove('field-error');
  const erro = document.getElementById(erroId);
  erro.innerText = '';
  erro.style.display = 'none';
}

function cpfValido(cpf) {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 1; i <= 9; i++) soma += parseInt(cpf[i - 1]) * (11 - i);
  let resto = (soma * 10) % 11;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) soma += parseInt(cpf[i - 1]) * (12 - i);
  resto = (soma * 10) % 11;
  return resto === parseInt(cpf[10]);
}

/* ==============================
   INPUT CPF → SOMENTE NÚMEROS
============================== */
const cpfInput = document.getElementById('cpf');

cpfInput.addEventListener('input', () => {
  cpfInput.value = cpfInput.value.replace(/\D/g, '');
  limparErro(cpfInput, 'erroCpf');
});

/* ==============================
   BOTÃO IR PARA PAGAMENTO
============================== */
document.getElementById('btnIrPagamento').addEventListener('click', () => {
  let valido = true;

  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');

  limparErro(nomeInput, 'erroNome');
  limparErro(cpfInput, 'erroCpf');
  limparErro(emailInput, 'erroEmail');

  const nome = nomeInput.value.trim();
  const cpf = cpfInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();

  if (!nome) {
    mostrarErro(nomeInput, 'Informe seu nome completo.', 'erroNome');
    valido = false;
  }

  if (!/^\d{11}$/.test(cpf) || !cpfValido(cpf)) {
    mostrarErro(cpfInput, 'CPF inválido.', 'erroCpf');
    valido = false;
  }

  if (!email || !email.includes('@')) {
    mostrarErro(emailInput, 'Informe um e-mail válido.', 'erroEmail');
    valido = false;
  }

  if (!valido) return;

  /* ==============================
     SALVA DADOS DO CADASTRO
  ============================== */
  localStorage.setItem(
    'dadosCadastro',
    JSON.stringify({ nome, cpf, email })
  );

  window.location.href = 'pagamento.html';
});
