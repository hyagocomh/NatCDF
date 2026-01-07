/* =========================================================
   RECUPERA DADOS SALVOS
========================================================= */
const curso = JSON.parse(localStorage.getItem('cursoSelecionado'));
const cadastro = JSON.parse(localStorage.getItem('dadosCadastro'));

/* =========================================================
   VALIDA FLUXO
========================================================= */
if (!curso || !cadastro) {
  alert('Fluxo incompleto. Refaça a inscrição.');
  window.location.href = 'index.html';
}

/* =========================================================
   RESUMO DO PEDIDO
========================================================= */
const resumo = document.getElementById('resumoPedido');

resumo.innerHTML = `
  <h3>Resumo do pedido</h3>

  <p><strong>Curso:</strong> ${curso.nome}</p>
  <p><strong>Modalidade:</strong> ${
    curso.modalidade === 'presencial' ? 'Presencial' : 'Online'
  }</p>
  <p><strong>Valor:</strong> R$ ${curso.valor.toFixed(2)}</p>

  <hr style="margin:12px 0; opacity:0.2;">

  <p><strong>Aluno:</strong> ${cadastro.nome}</p>
  <p><strong>E-mail:</strong> ${cadastro.email}</p>
`;

/* =========================================================
   PAGAMENTO
========================================================= */
document.getElementById('btnPagar').addEventListener('click', async () => {
  try {
    const btn = document.getElementById('btnPagar');
    btn.disabled = true;
    btn.innerText = 'Redirecionando...';

    const response = await fetch('http://localhost:3000/create_preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        curso: curso,        // ✅ OBJETO COMPLETO (CORREÇÃO)
        aluno: cadastro
      })
    });

    const data = await response.json();

    if (!data.init_point) {
      throw new Error('Erro ao criar preferência de pagamento');
    }

    window.location.href = data.init_point;

  } catch (error) {
    alert('Erro ao iniciar pagamento.');
    console.error(error);

    const btn = document.getElementById('btnPagar');
    btn.disabled = false;
    btn.innerText = 'Pagar agora';
  }
});
