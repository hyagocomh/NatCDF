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
const cadastro = JSON.parse(localStorage.getItem('dadosCadastro'));

if (!curso || !cadastro || !fluxoValido()) {
  window.location.replace('acesso-negado.html');
  throw new Error('Fluxo inválido');
}

/* ==============================
   VALOR FINAL (APENAS VISUAL)
============================== */
let valorFinal = Number(curso.valor);
let cupomAplicado = null;

/* ==============================
   RESUMO
============================== */
const resumo = document.getElementById('resumoPedido');

function atualizarResumo() {
  const maskedCpf = cadastro.cpf ? cadastro.cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4') : '';

  resumo.innerHTML = `
    <h3>Resumo do pedido</h3>
    <p><strong>Curso:</strong> ${curso.nome}</p>
    <p><strong>Valor:</strong> R$ ${valorFinal.toFixed(2)}</p>
    <p><strong>Aluno:</strong> ${cadastro.nome}</p>
    <p><strong>CPF:</strong> ${maskedCpf}</p>
    <p><strong>E-mail:</strong> ${cadastro.email || '—'}</p>
    <p><strong>Telefone:</strong> ${cadastro.telefone || '—'}</p>
  `;
}
atualizarResumo();

/* ==============================
   CUPOM (APENAS VISUAL)
============================== */
document.getElementById('aplicarCupom').addEventListener('click', async () => {
  const codigo = document.getElementById('cupom').value.trim().toUpperCase();
  const feedback = document.getElementById('feedbackCupom');

  try {
    const res = await fetch(
      'https://backend-natcdf.onrender.com/validar-cupom',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cupom: codigo,
          curso: curso.nome
        })
      }
    );

    const data = await res.json();

    if (data.erro) {
      feedback.style.display = 'block';
      feedback.style.color = '#e53935';
      feedback.innerText = data.erro;
      cupomAplicado = null;
      return;
    }

    valorFinal = Number(data.valorComDesconto);
    cupomAplicado = codigo;

    feedback.style.display = 'block';
    feedback.style.color = '#2e7d32';
    feedback.innerText = `Novo valor: R$ ${valorFinal.toFixed(2)}`;

    atualizarResumo();

  } catch (err) {
    feedback.style.display = 'block';
    feedback.style.color = '#e53935';
    feedback.innerText = 'Erro ao aplicar cupom.';
    cupomAplicado = null;
  }
});

/* ==============================
   PAGAMENTO (BACKEND MANDA)
============================== */
document.getElementById('btnPagar').addEventListener('click', async () => {
  try {
    const res = await fetch(
      'https://backend-natcdf.onrender.com/create_preference',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          curso: curso.nome,
          cupom: cupomAplicado,
          aluno: cadastro 
        })
      }
    );

    const data = await res.json();

    if (!data.init_point) {
      alert('Erro ao iniciar pagamento.');
      return;
    }

    window.location.href = data.init_point;
    localStorage.removeItem('flowToken');

  } catch (err) {
    alert('Erro ao iniciar pagamento.');
  }
});
