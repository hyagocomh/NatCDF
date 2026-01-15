const CUPONS = {
  COMBOMAX20: { curso: 'MAX NATCDF (Combo Completo)', valorFinal: 360 },
  '2MATERIA15': { curso: 'NATCDF Combo 2 Matérias', valorFinal: 270 },
  '1MATERIA10': { curso: 'NATCDF 1 Matéria', valorFinal: 160 }
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' });
  }

  const { cupom, curso } = req.body;

  const CUPONS = {
    COMBOMAX20: { curso: 'MAX NATCDF (Combo Completo)', valorFinal: 360 },
    '2MATERIA15': { curso: 'NATCDF Combo 2 Matérias', valorFinal: 270 },
    '1MATERIA10': { curso: 'NATCDF 1 Matéria', valorFinal: 160 }
  };

  if (!cupom || !curso) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }

  const codigo = cupom.toUpperCase().trim();
  const cupomData = CUPONS[codigo];

  if (!cupomData || !curso.startsWith(cupomData.curso)) {
    return res.status(400).json({ erro: 'Cupom inválido.' });
  }

  return res.json({ valorComDesconto: cupomData.valorFinal });
}
