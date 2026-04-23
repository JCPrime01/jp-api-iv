  export default async function handler(req, res) {                                                                                                                                        
    if (req.method !== 'POST') return res.status(405).json({ error: 'Apenas POST' });                                                                                                      
                                              
    const { fbclid, fbp, fbc, pageUrl } = req.body;                                                                                                                                        
                                                                                                                                                                                           
    const KOMMO_TOKEN = process.env.KOMMO_TOKEN;                                                                                                                                           
    const KOMMO_DOMAIN = 'jotapbet.kommo.com';                                                                                                                                             
                                                                                                                                                                                           
    try {                                                                                                                                                                                  
      const leadRes = await fetch(`https://${KOMMO_DOMAIN}/api/v4/leads`, {                                                                                                              
        method: 'POST',                                                                                                                                                                    
        headers: {                        
          'Authorization': `Bearer ${KOMMO_TOKEN}`,                                                                                                                                        
          'Content-Type': 'application/json'                                                                                                                                               
        },
        body: JSON.stringify([{                                                                                                                                                            
          name: 'Lead LP - ' + new Date().toLocaleDateString('pt-BR'),                                                                                                                   
          _embedded: {                                                                                                                                                                     
            tags: [{ name: 'LP-Jota' }]                                                                                                                                                  
          }                               
        }])                                                                                                                                                                                
      });                                                                                                                                                                                  
                                                                                                                                                                                           
      const leadData = await leadRes.json();                                                                                                                                               
      const leadId = leadData?._embedded?.leads?.[0]?.id;                                                                                                                                  
   
      if (!leadId) return res.status(500).json({ error: 'Falha ao criar lead', detail: leadData });                                                                                        
                                                                                                                                                                                         
      await fetch(`https://${KOMMO_DOMAIN}/api/v4/leads/${leadId}/notes`, {
        method: 'POST',                                                                                                                                                                    
        headers: {
          'Authorization': `Bearer ${KOMMO_TOKEN}`,                                                                                                                                        
          'Content-Type': 'application/json'                                                                                                                                             
        },                                                                                                                                                                                 
        body: JSON.stringify([{                                                                                                                                                          
          note_type: 'common',                
          params: {                       
            text: `fbclid: ${fbclid || 'n/a'}\nfbp: ${fbp || 'n/a'}\nfbc: ${fbc || 'n/a'}\nURL: ${pageUrl || 'n/a'}`
          }                                                                                                                                                                                
        }])                               
      });                                                                                                                                                                                  
                                                                                                                                                                                           
      return res.status(200).json({ success: true, leadId });
                                                                                                                                                                                           
    } catch (e) {                                                                                                                                                                        
      return res.status(500).json({ error: e.message });
    }
  }
