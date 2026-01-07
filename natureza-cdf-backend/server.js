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
   CRIAR PREFERÊNCIA
================================ */
app.post('/create_preference', async (req, res) => {
  try {
    const { curso, aluno } = req.body;

    if (
      !curso ||
      typeof curso.nome !== 'string' ||
      typeof curso.valor !== 'number'
    ) {
      return res.status(400).json({ error: 'Curso inválido' });
    }

    const result = await preference.create({
      body: {
        items: [
          {
            title: curso.nome,
            quantity: 1,
            unit_price: Number(curso.valor)
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

        // ❌ REMOVIDO:
        // auto_return: 'approved'
      }
    });

    res.json({
      init_point: result.init_point
    });

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
