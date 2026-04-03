export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

  const { fbp, fbc, userAgent } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Usando o nome exato da variável que você criou na Vercel: ID_PIXEL_FB
  const url = `https://graph.facebook.com/v18.0/${process.env.ID_PIXEL_FB}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

  const payload = {
    data: [{
      event_name: 'Contact', // Configurado para o evento de Contato que você escolheu
      event_time: Math.floor(Date.now() / 1000),
      action_source: 'website',
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp: fbp,
        fbc: fbc
      }
    }]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
