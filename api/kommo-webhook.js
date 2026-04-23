  import Redis from 'ioredis';

  const redis = new Redis(process.env.URL_REDIS);                                                                                                                                          
   
  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).end();                                                                                                                             

    const KOMMO_TOKEN = process.env.KOMMO_TOKEN;                                                                                                                                           
    const KOMMO_DOMAIN = 'jotapbet.kommo.com';
                                                                                                                                                                                           
    if (!leadId) return res.status(200).json({ ok: false, reason: 'no lead' });                                                                                                          
                                                                               
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim();                                                                                                                       
    if (!ip) return res.status(200).json({ ok: false, reason: 'no ip' });
                                                                                                                                                                                           
    const result = await redis.get(`fbclid:${ip}`);                                                                                                                                      
    if (!result) return res.status(200).json({ ok: false, reason: 'no redis data' });                                                                                                      
                                                                                     
    const { fbclid, fbp, fbc, pageUrl, utm_source, utm_campaign, utm_content, utm_medium } = JSON.parse(result);                                                                           
                                                                                                                                                                                           
    await Promise.allSettled([
      fetch(`https://${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {                                                                                                                      
        method: 'POST',                                                                                                                                                                  
        headers: { 'Authorization': `Bearer ${KOMMO_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([{                                                                                                                                                            
          note_type: 'common', 
          params: { text: `Rastreio LP\nfbclid: ${fbclid || 'n/a'}\nfbp: ${fbp || 'n/a'}\nfbc: ${fbc || 'n/a'}\nURL: ${pageUrl || 'n/a'}\nCampanha: ${utm_campaign || 'n/a'}\nCriativo:    
  ${utm_content || 'n/a'}` }                                                                                                                                                             
        }])                                                                                                                                                                                
      }),  
      fetch(`https://graph.facebook.com/v18.0/${process.env.ID_PIXEL_FB}/events?access_token=${process.env.FB_ACCESS_TOKEN}`, {                                                            
        method: 'POST',                                                                                                                                                                  
        headers: { 'Content-Type': 'application/json' },                                                                                                                                   
        body: JSON.stringify({                          
          data: [{                                                                                                                                                                         
            event_name: 'Lead',                                                                                                                                                          
            event_time: Math.floor(Date.now() / 1000),                                                                                                                                     
            event_id: 'Lead' + leadId,                
            action_source: 'website',                                                                                                                                                      
            user_data: { fbp: fbp || undefined, fbc: fbc || undefined, client_ip_address: ip, client_user_agent: 'server' },                                                             
            custom_data: { utm_source, utm_campaign, utm_content, utm_medium }                                              
          }]                                                                                                                                                                               
        })  
      })                                                                                                                                                                                   
    ]);                                                                                                                                                                                  
                                                                                                                                                                                           
    return res.status(200).json({ ok: true });
  }
