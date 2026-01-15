import { MercadoPagoConfig, Preference } from 'mercadopago';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { curso, valor, aluno } = req.body;

  if (!curso || !valor || !aluno) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  const client = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN
  });

  const preference = new Preference(client);

  try {
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
        metadata: {
          nome: aluno.nome,
          cpf: aluno.cpf,
          email: aluno.email,
          curso,
          valor
        },
        back_urls: {
          success: `${process.env.FRONTEND_URL}/sucesso.html`,
          failure: `${process.env.FRONTEND_URL}/erro.html`,
          pending: `${process.env.FRONTEND_URL}/pendente.html`
        },
        notification_url: `${process.env.API_URL}/api/webhook_mercadopago`
      }
    });

    return res.json({ init_point: result.init_point });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
}
