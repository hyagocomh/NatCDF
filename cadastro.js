/* ==============================
   BLOQUEIO DE ACESSO DIRETO
============================== */
const curso = JSON.parse(localStorage.getItem('cursoSelecionado'));

if (!curso) {
  window.location.replace('acesso-negado.html');
  throw new Error('Acesso inválido: curso não selecionado');
}

/* ==============================
   RESUMO DO CURSO
============================== */
document.getElementById('resumoCurso').innerHTML = `
  <h3>Curso selecionado</h3>
  <p><strong>${curso.nome}</strong></p>
  <p>Modalidade: ${curso.modalidade}</p>
  <p>Valor: R$ ${Number(curso.valor).toFixed(2)}</p>
`;

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
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf[i - 1]) * (11 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf[i - 1]) * (12 - i);
  }
  resto = (soma * 10) % 11;
  return resto === parseInt(cpf[10]);
}

function senhaValida(senha) {
  return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(senha);
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
  const senhaInput = document.getElementById('senha');
  const confirmarInput = document.getElementById('confirmar');

  // Limpa erros
  limparErro(nomeInput, 'erroNome');
  limparErro(cpfInput, 'erroCpf');
  limparErro(emailInput, 'erroEmail');
  limparErro(senhaInput, 'erroSenha');
  limparErro(confirmarInput, 'erroConfirmar');

  if (!nomeInput.value.trim()) {
    mostrarErro(nomeInput, 'Informe seu nome completo.', 'erroNome');
    valido = false;
  }

  if (!/^\d{11}$/.test(cpfInput.value) || !cpfValido(cpfInput.value)) {
    mostrarErro(cpfInput, 'CPF inválido.', 'erroCpf');
    valido = false;
  }

  if (!emailInput.value.trim()) {
    mostrarErro(emailInput, 'Informe um e-mail válido.', 'erroEmail');
    valido = false;
  }

  if (!senhaValida(senhaInput.value)) {
    mostrarErro(
      senhaInput,
      'A senha deve ter no mínimo 8 caracteres, com letras e números.',
      'erroSenha'
    );
    valido = false;
  }

  if (senhaInput.value !== confirmarInput.value) {
    mostrarErro(confirmarInput, 'As senhas não conferem.', 'erroConfirmar');
    valido = false;
  }

  if (!valido) return;

  /* ==============================
     SALVA DADOS DO CADASTRO
  ============================== */
  localStorage.setItem(
    'dadosCadastro',
    JSON.stringify({
      nome: nomeInput.value.trim(),
      cpf: cpfInput.value,
      email: emailInput.value.trim()
    })
  );

  window.location.href = 'pagamento.html';
});
