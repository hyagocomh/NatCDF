const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

/* ===============================
   MERCADO PAGO
================================ */
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-3775593871707696-010609-0d4b967aa175b53dceffceafd816721c-3114469016'
});

const preference = new Preference(client);

/* ===============================
   CUPONS (SOMENTE PRESENCIAL)
================================ */
const CUPONS = {
  COMBOMAX20: {
    curso: 'MAX NATCDF (Combo Completo)',
    valorFinal: 360
  },
  '2MATERIA15': {
    curso: 'NATCDF Combo 2 Matérias',
    valorFinal: 270
  },
  '1MATERIA10': {
    curso: 'NATCDF 1 Matéria',
    valorFinal: 160
  }
};

/* ===============================
   VALIDAR CUPOM
================================ */
app.post('/validar-cupom', (req, res) => {
  const { cupom, curso, valorOriginal } = req.body;

  const codigo = cupom.toUpperCase().trim();

  if (!CUPONS[codigo]) {
    return res.status(400).json({ erro: 'Cupom inválido.' });
  }

  if (CUPONS[codigo].curso !== curso) {
    return res.status(400).json({
      erro: 'Este cupom não é válido para o curso selecionado.'
    });
  }

  return res.json({
    valorComDesconto: CUPONS[codigo].valorFinal
  });
});

/* ===============================
   CRIAR PAGAMENTO
================================ */
app.post('/create_preference', async (req, res) => {
  try {
    const { curso, valor, aluno } = req.body;

    const result = await preference.create({
      body: {
        items: [
          {
            title: curso,
            quantity: 1,
            unit_price: Number(valor)
          }
        ],
        payer: {
          name: aluno.nome,
          email: aluno.email
        },
        back_urls: {
          success: 'http://127.0.0.1:5500/sucesso.html',
          failure: 'http://127.0.0.1:5500/erro.html',
          pending: 'http://127.0.0.1:5500/pendente.html'
        }
      }
    });

    res.json({ init_point: result.init_point });

  } catch (error) {
    console.error('ERRO MERCADO PAGO:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

/* ===============================
   SERVER
================================ */
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});