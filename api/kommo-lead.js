  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).end();                                                                                                                               
                                                                                                                                                                                           
    const { fbclid, fbp, fbc, pageUrl } = req.body;                                                                                                                                        
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;                                                                                           
                                                                                                                                                                                           
    const REDIS_URL = process.env.REDIS_URL;                                                                                                                                               
                                                                                                                                                                                           
    const data = JSON.stringify({ fbclid, fbp, fbc, pageUrl, ip, ts: Date.now() });                                                                                                        
                                          
    // Salva por IP com TTL de 30 minutos                                                                                                                                                  
    await fetch(`${REDIS_URL}/set/fbclid:${ip}`, {                                                                                                                                         
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },                                                                                                                                     
      body: JSON.stringify({ value: data, ex: 1800 })
    });                                                                                                                                                                                    
                  
    return res.status(200).json({ ok: true });                                                                                                                                             
  }                                       
                                                                                                                                                                                           
  api/kommo-webhook.js — arquivo novo:                                                                                                                                                     
   
  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).end();
                                              
    const REDIS_URL = process.env.REDIS_URL;
    const KOMMO_TOKEN = process.env.KOMMO_TOKEN;
    const KOMMO_DOMAIN = 'jotapbet.kommo.com';                                                                                                                                             
                                              
    // Kommo envia o IP do contato no webhook                                                                                                                                              
    const ip = req.body?.leads?.add?.[0]?.pipeline_id
      ? req.headers['x-forwarded-for']?.split(',')[0].trim()                                                                                                                               
      : null;                                                                                                                                                                              
                                                                                                                                                                                           
    const leadId = req.body?.leads?.add?.[0]?.id;                                                                                                                                          
                                          
    if (!leadId) return res.status(200).json({ ok: false, reason: 'no lead' });                                                                                                            
                                                                                                                                                                                           
    // Busca fbclid no Redis pelo IP
    const redisRes = await fetch(`${REDIS_URL}/get/fbclid:${ip}`);                                                                                                                         
    const redisData = await redisRes.json();
                                                                                                                                                                                           
    if (!redisData?.result) return res.status(200).json({ ok: false, reason: 'no redis data' });
                                          
    const { fbclid, fbp, fbc, pageUrl } = JSON.parse(redisData.result);                                                                                                                    
                                                                                                                                                                                           
    // Adiciona nota no lead do Kommo                                                                                                                                                      
    await fetch(`https://${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {                                                                                                                  
      method: 'POST',                         
      headers: {                                                                                                                                                                           
        'Authorization': `Bearer ${KOMMO_TOKEN}`,
        'Content-Type': 'application/json'                                                                                                                                                 
      },          
      body: JSON.stringify([{                                                                                                                                                              
        note_type: 'common',                  
        params: {                         
          text: `📊 Rastreio LP\nfbclid: ${fbclid || 'n/a'}\nfbp: ${fbp || 'n/a'}\nfbc: ${fbc || 'n/a'}\nURL: ${pageUrl || 'n/a'}`
        }                                                                                                                                                                                  
      }])                                     
    });                                                                                                                                                                                    
                                                                                                                                                                                           
    return res.status(200).json({ ok: true });                                                                                                                                             
  }
