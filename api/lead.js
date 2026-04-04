// api/lead.js (Vercel)
import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });

  const { fbp, fbc, userAgent, em, ph, eventId } = req.body;
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Usando as variáveis de ambiente que você já configurou na Vercel
  const url = `https://graph.facebook.com/v18.0/${process.env.ID_PIXEL_FB}/events?access_token=${process.env.FB_ACCESS_TOKEN}`;

  // Função para fazer o Hash SHA256 (Obrigatório pela Meta para dados sensíveis)
  const hash = (val) => val ? crypto.createHash('sha256').update(val.trim().toLowerCase()).digest('hex') : null;

  const payload = {
    data: [{
      event_name: 'Contact',
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId, // ID sincronizado com a LP para desduplicação
      action_source: 'website',
      event_source_url: req.headers.referer || '',
      
      // ATENÇÃO: COLOQUE O SEU CÓDIGO DE TESTE DA META ABAIXO
      // Você encontra esse código na aba "Eventos de Teste" do Gerenciador de Eventos
      test_event_code: 'TEST57777', // Substitua TESTXXXXX pelo seu código real
      
      user_data: {
        client_ip_address: clientIp,
        client_user_agent: userAgent,
        fbp: fbp,
        fbc: fbc,
        em: hash(em), // E-mail hashado (se houver)
        ph: hash(ph)  // Telefone hashado (se houver)
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
    
    // Retorna o resultado da Meta para você ver no console do navegador se deu certo
    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
