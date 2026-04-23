  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).end();                                                                                                                               
                                                                                                                                                                                           
    const { fbclid, fbp, fbc, pageUrl } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;                                                                                           
                                                                                                                                                                                           
    const REDIS_URL = process.env.REDIS_URL;                                                                                                                                               
    const data = JSON.stringify({ fbclid, fbp, fbc, pageUrl, ip, ts: Date.now() });
                                                                                                                                                                                           
    await fetch(`${REDIS_URL}/set/fbclid:${ip}`, {
      method: 'POST',                                                                                                                                                                      
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: data, ex: 1800 })                                                                                                                                      
    });                                       
                                                                                                                                                                                           
    return res.status(200).json({ ok: true });
  }
