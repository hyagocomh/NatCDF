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
   VALOR FINAL
============================== */
let valorFinal = Number(curso.valor);

/* ==============================
   RESUMO DO PEDIDO
============================== */
const resumo = document.getElementById('resumoPedido');

function atualizarResumo() {
  if (!resumo) return;

  resumo.innerHTML = `
    <h3>Resumo do pedido</h3>
    <p><strong>Curso:</strong> ${curso.nome}</p>
    <p><strong>Valor:</strong> R$ ${valorFinal.toFixed(2)}</p>
    <p><strong>Aluno:</strong> ${cadastro.nome}</p>
  `;
}
atualizarResumo();

/* ==============================
   APLICAR CUPOM
============================== */
document.getElementById('aplicarCupom').addEventListener('click', async () => {
  const codigo = document.getElementById('cupom').value.trim();
  const feedback = document.getElementById('feedbackCupom');

  feedback.style.display = 'none';

  try {
    const res = await fetch('https://naturezacdfcheckout.com.br/api/validar-cupom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cupom: codigo, curso: curso.nome })
    });

    const data = await res.json();

    if (data.erro) {
      feedback.style.display = 'block';
      feedback.style.color = '#e53935';
      feedback.innerText = data.erro;
      return;
    }

    valorFinal = Number(data.valorComDesconto);
    feedback.style.display = 'block';
    feedback.style.color = '#2e7d32';
    feedback.innerText = `Novo valor: R$ ${valorFinal.toFixed(2)}`;
    atualizarResumo();

  } catch (err) {
    feedback.style.display = 'block';
    feedback.style.color = '#e53935';
    feedback.innerText = 'Erro ao aplicar cupom.';
  }
});

/* ==============================
   PAGAMENTO (CARTÃO / CHECKOUT MP)
============================== */
document.getElementById('btnPagar').addEventListener('click', async () => {
  try {
    const res = await fetch('https://naturezacdfcheckout.com.br/api/create_preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curso: curso.nome,
        valor: valorFinal,
        aluno: cadastro
      })
    });

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
