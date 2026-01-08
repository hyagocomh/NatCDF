/* ==============================
   BLOQUEIO DE ACESSO DIRETO
============================== */
const curso = JSON.parse(localStorage.getItem('cursoSelecionado'));
const cadastro = JSON.parse(localStorage.getItem('dadosCadastro'));

if (!curso || !cadastro) {
  window.location.replace('acesso-negado.html');
  throw new Error('Acesso inválido: fluxo não iniciado corretamente');
}

/* ==============================
   VALOR FINAL (PODE SER ALTERADO POR CUPOM)
============================== */
let valorFinal = Number(curso.valor);

/* ==============================
   RESUMO DO PEDIDO
============================== */
const resumo = document.getElementById('resumoPedido');

function atualizarResumo() {
  resumo.innerHTML = `
    <h3>Resumo do pedido</h3>

    <p><strong>Curso:</strong> ${curso.nome}</p>
    <p><strong>Modalidade:</strong> ${
      curso.modalidade === 'presencial' ? 'Presencial' : 'Online'
    }</p>
    <p><strong>Valor:</strong> R$ ${valorFinal.toFixed(2)}</p>

    <hr style="margin:12px 0; opacity:0.2;">

    <p><strong>Aluno:</strong> ${cadastro.nome}</p>
    <p><strong>E-mail:</strong> ${cadastro.email}</p>
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

  if (!codigo) return;

  try {
    const response = await fetch('http://localhost:3000/validar-cupom', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cupom: codigo,
        curso: curso.nome,
        valorOriginal: curso.valor
      })
    });

    const data = await response.json();

    if (data.erro) {
      feedback.style.display = 'block';
      feedback.style.color = '#e53935';
      feedback.innerText = data.erro;
      return;
    }

    valorFinal = Number(data.valorComDesconto);

    feedback.style.display = 'block';
    feedback.style.color = '#2e7d32';
    feedback.innerText = `Cupom aplicado! Novo valor: R$ ${valorFinal.toFixed(2)}`;

    atualizarResumo();

  } catch (err) {
    feedback.style.display = 'block';
    feedback.style.color = '#e53935';
    feedback.innerText = 'Erro ao validar cupom.';
    console.error(err);
  }
});

/* ==============================
   PAGAMENTO
============================== */
document.getElementById('btnPagar').addEventListener('click', async () => {
  const btn = document.getElementById('btnPagar');
  btn.disabled = true;
  btn.innerText = 'Redirecionando...';

  try {
    const response = await fetch('http://localhost:3000/create_preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curso: curso.nome,
        valor: valorFinal,
        aluno: cadastro
      })
    });

    const data = await response.json();

    if (!data.init_point) {
      throw new Error('Falha ao criar preferência de pagamento');
    }

    window.location.href = data.init_point;

  } catch (err) {
    alert('Erro ao iniciar pagamento.');
    console.error(err);
    btn.disabled = false;
    btn.innerText = 'Pagar agora';
  }
});
