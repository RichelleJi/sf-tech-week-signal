const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=60"};

function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:JSON_HEADERS})}

async function listEvents(url,env){
 const limit=Math.min(100,Math.max(1,Number.parseInt(url.searchParams.get('limit')||'50',10)||50));
 const offset=Math.min(10000,Math.max(0,Number.parseInt(url.searchParams.get('offset')||'0',10)||0));
 const date=url.searchParams.get('date');
 const where=date?'WHERE event_date = ?':'';
 const statement=env.DB.prepare(`SELECT source_id, event_date AS date, event_time AS time, title, host, location, status, source_url, description, description_status, scraped_at FROM events ${where} ORDER BY event_date, event_time, title LIMIT ? OFFSET ?`);
 const result=date?await statement.bind(date,limit,offset).all():await statement.bind(limit,offset).all();
 const countStatement=env.DB.prepare(`SELECT COUNT(*) AS total FROM events ${where}`);
 const count=date?await countStatement.bind(date).first():await countStatement.first();
 return json({total:count.total,limit,offset,next_offset:offset+result.results.length<count.total?offset+result.results.length:null,events:result.results});
}

async function eventStats(env){
 const totals=await env.DB.prepare('SELECT event_date AS date, COUNT(*) AS count FROM events GROUP BY event_date ORDER BY event_date').all();
 const descriptions=await env.DB.prepare("SELECT description_status AS status, COUNT(*) AS count FROM events GROUP BY description_status ORDER BY description_status").all();
 return json({total:totals.results.reduce((sum,row)=>sum+row.count,0),by_date:totals.results,descriptions:descriptions.results});
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  try{
   if(url.pathname==='/api/events')return await listEvents(url,env);
   if(url.pathname==='/api/stats')return await eventStats(env);
   return env.ASSETS.fetch(request);
  }catch(error){return json({error:'Database request failed',detail:error instanceof Error?error.message:String(error)},500)}
 }
};
