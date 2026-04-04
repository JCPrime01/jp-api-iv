// api/lead.js
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

  const { fbp, fbc, userAgent, em, ph, eventId } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const url = `https://graph.facebook.com/v18.0/${process.env.ID_PIXEL_FB}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

  // Função para fazer o Hash SHA256 (Obrigatório pela Meta para dados sensíveis )
  const hash = (val) => val ? crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex') : null;

  const payload = {
    data: [{
      event_name: 'Contact',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId, // ESSENCIAL para desduplicação
      action_source: 'website',
      event_source_url: req.headers.referer || '',
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp: fbp,
        fbc: fbc,
        em: hash(em), // E-mail hashado
        ph: hash(ph)  // Telefone hashado
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
