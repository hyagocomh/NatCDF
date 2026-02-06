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

/* ==============================
   BLOQUEIO DE ACESSO DIRETO
============================== */
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
  if (!cpf) return false;

  // Remove qualquer coisa que não seja número
  cpf = cpf.replace(/\D/g, '');

  // Deve ter 11 dígitos
  if (cpf.length !== 11) return false;

  // Elimina CPFs inválidos conhecidos (todos iguais)
  if (/^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  let resto;

  // Primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  // Segundo dígito verificador
  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }

  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;

  return resto === parseInt(cpf.substring(10, 11));
}

/* ==============================
   INPUT CPF E TELEFONE → SOMENTE NÚMEROS
============================== */
const cpfInput = document.getElementById('cpf');
const telefoneInput = document.getElementById('telefone');

if (cpfInput) {
  cpfInput.addEventListener('input', () => {
    cpfInput.value = cpfInput.value.replace(/\D/g, '');
    limparErro(cpfInput, 'erroCpf');
  });
}

if (telefoneInput) {
  telefoneInput.addEventListener('input', () => {
    telefoneInput.value = telefoneInput.value.replace(/\D/g, '');
    limparErro(telefoneInput, 'erroTelefone');
  });
} 

/* ==============================
   ENVIO DO FORMULÁRIO → IR PARA PAGAMENTO
============================== */
const form = document.getElementById('formCadastro');

if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valido = true;

    const nomeInput = document.getElementById('nome');
    const emailInput = document.getElementById('email');
    const telefoneInput = document.getElementById('telefone');

    limparErro(nomeInput, 'erroNome');
    limparErro(cpfInput, 'erroCpf');
    limparErro(emailInput, 'erroEmail');
    limparErro(telefoneInput, 'erroTelefone');

    const nome = nomeInput.value.trim();
    const cpf = cpfInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const telefone = telefoneInput ? telefoneInput.value.trim() : '';

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

    // Telefone: aceita 10 (fixo) ou 11 (celular) dígitos
    if (telefoneInput && !/^\d{10,11}$/.test(telefone)) {
      mostrarErro(telefoneInput, 'Telefone inválido (ex: 11999998888).', 'erroTelefone');
      valido = false;
    }

    if (!valido) {
      // foca no primeiro campo com erro visível
      const firstError = document.querySelector('.field-error');
      if (firstError) firstError.focus();
      return;
    }

    /* ==============================
       SALVA DADOS DO CADASTRO
    ============================== */
    localStorage.setItem(
      'dadosCadastro',
      JSON.stringify({ nome, cpf, email, telefone })
    );

    window.location.href = 'pagamento.html';
  });
} 