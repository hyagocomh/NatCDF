require('dotenv').config();

const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { MercadoPagoConfig, Preference } = require('mercadopago');

// Node 18+ já tem fetch nativo
const fetch = global.fetch;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

/* =====================================================
   VARIÁVEIS DE AMBIENTE
===================================================== */
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://127.0.0.1:5500';
const NGROK_URL = process.env.NGROK_URL;

console.log('FRONTEND_URL:', FRONTEND_URL);
console.log('NGROK_URL:', NGROK_URL);

/* =====================================================
   ROTA RAIZ (TESTE NGROK)
===================================================== */
app.get('/', (req, res) => {
  res.send('🚀 Backend NATUREZA CDF online');
});

/* =====================================================
   MERCADO PAGO
===================================================== */
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const preference = new Preference(client);

/* =====================================================
   CONFIGURAÇÃO DE E-MAIL
===================================================== */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/* =====================================================
   CUPONS
===================================================== */
const CUPONS = {
  EX3NAT: { curso: 'MAX NATCDF (Combo Completo)', valorFinal: 360 },
  'EX2NAT': { curso: 'NATCDF Combo 2 Matérias', valorFinal: 270 },
  'EX1NAT': { curso: 'NATCDF 1 Matéria', valorFinal: 160 }
};

/* =====================================================
   VALIDAR CUPOM
===================================================== */
app.post('/validar-cupom', (req, res) => {
  const { cupom, curso } = req.body;

  if (!cupom || !curso) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  const codigo = cupom.toUpperCase().trim();
  const cupomData = CUPONS[codigo];

  if (!cupomData || !curso.startsWith(cupomData.curso)) {
    return res.status(400).json({ erro: 'Cupom inválido.' });
  }

  res.json({ valorComDesconto: cupomData.valorFinal });
});

/* =====================================================
   CHECKOUT PRO – CRIAR PAGAMENTO
===================================================== */
app.post('/create_preference', async (req, res) => {
  try {
    const { curso, valor, aluno } = req.body;

    if (!curso || !valor || !aluno) {
      return res.status(400).json({ error: 'Dados incompletos.' });
    }

    if (!NGROK_URL) {
      return res.status(500).json({
        error: 'NGROK_URL não configurado no .env'
      });
    }

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

        // 🔥 METADATA (dados que voltam no webhook)
        metadata: {
          nome: aluno.nome,
          cpf: aluno.cpf,
          email: aluno.email,
          curso: curso,
          valor: valor
        },

        back_urls: {
          success: `${FRONTEND_URL}/sucesso.html`,
          failure: `${FRONTEND_URL}/erro.html`,
          pending: `${FRONTEND_URL}/pendente.html`
        },

        notification_url: `${NGROK_URL}/webhook/mercadopago`
      }
    });

    res.json({ init_point: result.init_point });

  } catch (error) {
    console.error('❌ ERRO CHECKOUT:', error);
    res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
});

/* =====================================================
   WEBHOOK MERCADO PAGO
===================================================== */
app.post('/webhook/mercadopago', async (req, res) => {
  try {
    console.log('🔔 Webhook Mercado Pago recebido');

    // Ignora merchant_order
    if (req.body.topic === 'merchant_order') {
      return res.sendStatus(200);
    }

    const paymentId = req.body?.data?.id;
    if (!paymentId) {
      console.log('ℹ️ Evento sem paymentId');
      return res.sendStatus(200);
    }

    console.log('💳 Payment ID:', paymentId);

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`
        }
      }
    );

    const payment = await response.json();

    if (payment.status !== 'approved') {
      console.log('⏳ Pagamento ainda não aprovado:', payment.status);
      return res.sendStatus(200);
    }

    console.log('✅ PAGAMENTO APROVADO');

    const meta = payment.metadata || {};

    console.log('📦 DADOS DO ALUNO:', meta);

    /* =====================================================
       ENVIO DE E-MAIL
    ===================================================== */
    await transporter.sendMail({
      from: `"NATUREZA CDF" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_DESTINO,
      subject: '⚛️ Nova matrícula - NATUREZA CDF',
      html: `
        <h2>Novo pagamento aprovado</h2>
        <p><strong>Nome:</strong> ${meta.nome || '-'}</p>
        <p><strong>CPF:</strong> ${meta.cpf || '-'}</p>
        <p><strong>Email:</strong> ${meta.email || '-'}</p>
        <p><strong>Curso:</strong> ${meta.curso || '-'}</p>
        <p><strong>Valor:</strong> R$ ${meta.valor || '-'}</p>
      `
    });

    console.log('📧 E-mail enviado com sucesso');

    res.sendStatus(200);

  } catch (error) {
    console.error('❌ Erro no webhook Mercado Pago:', error);
    res.sendStatus(500);
  }
});

/* =====================================================
   SERVER
===================================================== */
app.listen(PORT, () => {
  console.log(`✅ Backend rodando em http://localhost:${PORT}`);
});
