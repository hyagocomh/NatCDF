import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const paymentId = req.body?.data?.id;
  if (!paymentId) return res.status(200).end();

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
    return res.status(200).end();
  }

  const m = payment.metadata;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"NATUREZA CDF" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_DESTINO,
    subject: '✅ Novo pagamento aprovado',
    html: `
      <h2>Pagamento aprovado</h2>
      <p><strong>Nome:</strong> ${m.nome}</p>
      <p><strong>CPF:</strong> ${m.cpf}</p>
      <p><strong>Email:</strong> ${m.email}</p>
      <p><strong>Curso:</strong> ${m.curso}</p>
      <p><strong>Valor:</strong> R$ ${Number(m.valor).toFixed(2)}</p>
    `
  });

  return res.status(200).end();
}
