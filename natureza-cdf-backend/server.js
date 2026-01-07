const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();

app.use(cors());
app.use(express.json());

// 🔑 CONFIGURAÇÃO DO MERCADO PAGO
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-3775593871707696-010609-0d4b967aa175b53dceffceafd816721c-3114469016'
});

const preference = new Preference(client);

app.post('/create_preference', async (req, res) => {
  const { curso, aluno } = req.body;

  let valor = 799.90;
  if (curso.includes('Combo 2')) valor = 320;
  if (curso.includes('1 Matéria')) valor = 180;

  try {
const result = await preference.create({
  body: {
    items: [
      {
        title: 'Curso NATUREZA CDF',
        description: curso,
        quantity: 1,
        unit_price: Number(valor)
      }
    ],

    payer: {
      name: aluno.nome,
      email: aluno.email
    },

    payment_methods: {
      excluded_payment_methods: [],
      excluded_payment_types: [],
      installments: 12
    },

    back_urls: {
      success: 'http://127.0.0.1:5500/sucesso.html',
      failure: 'http://127.0.0.1:5500/erro.html',
      pending: 'http://127.0.0.1:5500/pendente.html'
    }
  }
});


    // 🔴 ATENÇÃO AQUI 👇
    res.json({
      init_point: result.init_point
    });

  } catch (error) {
    console.error('ERRO MERCADO PAGO:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('✅ Backend rodando em http://localhost:3000');
});
