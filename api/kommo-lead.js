  import Redis from 'ioredis';                                                                                                                                                             
                                                                                                                                                                                         
  const redis = new Redis(process.env.URL_REDIS);                                                                                                                                          
                                                 
  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).end();                                                                                                                             
                                                            
    const { fbclid, fbp, fbc, pageUrl, utm_source, utm_campaign, utm_content, utm_medium } = req.body;
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;                                                                                           
                                                                                                
    const data = { fbclid, fbp, fbc, pageUrl, utm_source, utm_campaign, utm_content, utm_medium, ip, ts: Date.now() };                                                                     
                                                                                                                                                                                           
    await redis.set(`fbclid:${ip}`, JSON.stringify(data), 'EX', 1800);
                                                                                                                                                                                           
    return res.status(200).json({ ok: true });                                                                                                                                           
  }
