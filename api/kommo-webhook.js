  import { Redis } from '@upstash/redis';                                                                                                                                                  
                                                                                                                                                                                           
  const redis = Redis.fromEnv();          
                                                                                                                                                                                           
  E troca o bloco do fetch do Redis por:                                                                                                                                                   
                                          
  const result = await redis.get(`fbclid:${ip}`);                                                                                                                                          
  if (!result) return res.status(200).json({ ok: false, reason: 'no redis data' });                                                                                                        
                                              
  const { fbclid, fbp, fbc, pageUrl, utm_source, utm_campaign, utm_content, utm_medium } = typeof result === 'string' ? JSON.parse(result) : result; 
