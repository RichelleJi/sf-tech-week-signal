const JSON_HEADERS={"content-type":"application/json; charset=utf-8","cache-control":"no-store"};
const MODELS=new Set(['Qwen/Qwen3.6-35B-A3B','google/gemma-4-26B-A4B-it']);
const SIGNALS=['Investor access','Engineer talent','Research talent','Looking for a job','Sales pitch / noise'];
const BEST_FOR={'Investor access':'Founders raising','Engineer talent':'Engineers','Research talent':'Researchers','Looking for a job':'Job seekers','Sales pitch / noise':'General networking'};

function json(payload,status=200){return new Response(JSON.stringify(payload),{status,headers:JSON_HEADERS})}
function finiteInt(value,fallback,min,max){const parsed=Number.parseInt(value,10);return Number.isFinite(parsed)?Math.min(max,Math.max(min,parsed)):fallback}
function allowedModel(value){return MODELS.has(value)?value:null}
function normalizeSignal(value){return SIGNALS.includes(value)?value:'Sales pitch / noise'}
function scoreToVibe(value){const score=Number(value);return Number.isFinite(score)?Math.max(0,Math.min(100,Math.round(score*25))):50}
function verdict(vibe){return vibe>=78?'GO':vibe>=62?'MAYBE':'SKIP'}

async function listEvents(url,env){
 const limit=finiteInt(url.searchParams.get('limit'),50,1,100);
 const offset=finiteInt(url.searchParams.get('offset'),0,0,10000);
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

async function savedClassifications(url,env){
 const model=allowedModel(url.searchParams.get('model'));
 if(!model)return json({error:'Unsupported model'},400);
 const result=await env.DB.prepare(`SELECT source_id, signal, best_for, vibe, verdict, confidence, input_tokens, output_tokens, latency_ms, classified_at FROM event_classifications WHERE model = ? ORDER BY classified_at DESC`).bind(model).all();
 const latest=await env.DB.prepare(`SELECT id, model, status, total_events, processed_events, input_tokens, output_tokens, total_latency_ms, started_at, completed_at, error FROM classification_runs WHERE model = ? ORDER BY started_at DESC LIMIT 1`).bind(model).first();
 return json({model,run:latest||null,classifications:result.results});
}

async function startClassification(request,env){
 const body=await request.json().catch(()=>null);
 const model=allowedModel(body?.model);
 if(!model)return json({error:'Unsupported model'},400);
 if(!env.CLASSIFIER_API_KEY||!env.CLASSIFIER_ENDPOINT)return json({error:'Classifier service is not configured'},503);
 const count=await env.DB.prepare('SELECT COUNT(*) AS total FROM events').first();
 const runId=crypto.randomUUID();
 const startedAt=new Date().toISOString();
 await env.DB.prepare(`INSERT INTO classification_runs (id, model, status, total_events, processed_events, input_tokens, output_tokens, total_latency_ms, started_at) VALUES (?, ?, 'running', ?, 0, 0, 0, 0, ?)`).bind(runId,model,count.total,startedAt).run();
 await env.DB.prepare('DELETE FROM event_classifications WHERE model = ?').bind(model).run();
 return json({run_id:runId,model,total_events:count.total,processed_events:0,input_tokens:0,output_tokens:0,total_latency_ms:0,status:'running'});
}

function buildQuestions(events,weights){
 const weightText=Object.entries(weights||{}).map(([key,value])=>`${key}: ${value}`).join(', ');
 const questions={};
 events.forEach((event,index)=>{
  questions[`signal_${index}`]={type:'choice',instructions:`Choose the event's strongest attendee signal. Use the title, host, location, status, and description. Rubric weights: ${weightText||'default balanced rubric'}.`,criteria:{
   'Investor access':'High-quality access to partners, principals, angels, allocators, or credible fundraising conversations.',
   'Engineer talent':'Strong engineers, technical leaders, maintainers, builders, or formats that reveal technical ability.',
   'Research talent':'Researchers, paper authors, labs, frontier-model teams, or substantive scientific depth.',
   'Looking for a job':'Active recruiters, hiring managers, open roles, referral access, or career-relevant conversations.',
   'Sales pitch / noise':'Sponsor-heavy framing, vague futurism, lead generation, generic networking, or low audience specificity.'
  }};
  questions[`vibe_${index}`]={type:'score',instructions:'Rate whether this event is worth the calendar time for an ambitious San Francisco engineer, founder, researcher, or job seeker. Reward substantive people and access; penalize generic sales noise.',criteria:['Hard skip: low signal or pure promotion','Weak: unlikely to repay the time','Mixed: potentially useful with notable caveats','Strong: good people or unusually useful access','Exceptional: rare, highly relevant, and worth prioritizing']};
 });
 return questions;
}

async function callClassifier(events,model,weights,env){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort('Classifier timeout'),90000);
 const started=Date.now();
 try{
  const response=await fetch(env.CLASSIFIER_ENDPOINT,{method:'POST',headers:{authorization:`Bearer ${env.CLASSIFIER_API_KEY}`,'content-type':'application/json'},body:JSON.stringify({model,state:events.map(event=>({title:event.title,host:event.host,location:event.location,status:event.status,description:event.description||''})),questions:buildQuestions(events,weights)}),signal:controller.signal});
  const text=await response.text();
  let payload=null;try{payload=JSON.parse(text)}catch{}
  if(!response.ok)throw new Error(`Classifier ${response.status}: ${payload?.message||payload?.error||text.slice(0,240)||'request failed'}`);
  return{payload,latency_ms:Date.now()-started};
 }finally{clearTimeout(timeout)}
}

async function classifyBatch(request,env){
 const body=await request.json().catch(()=>null);
 const model=allowedModel(body?.model);
 const runId=typeof body?.run_id==='string'?body.run_id:'';
 const offset=finiteInt(body?.offset,0,0,10000);
 const limit=finiteInt(body?.limit,10,1,20);
 if(!model||!runId)return json({error:'run_id and a supported model are required'},400);
 const run=await env.DB.prepare('SELECT * FROM classification_runs WHERE id = ? AND model = ?').bind(runId,model).first();
 if(!run)return json({error:'Classification run not found'},404);
 if(run.status==='failed')return json({error:run.error||'Classification run failed'},409);
 const rows=await env.DB.prepare(`SELECT source_id, event_date, event_time, title, host, location, status, description FROM events ORDER BY event_date, event_time, title LIMIT ? OFFSET ?`).bind(limit,offset).all();
 if(!rows.results.length){
  const completedAt=new Date().toISOString();
  await env.DB.prepare("UPDATE classification_runs SET status='complete', completed_at=? WHERE id=?").bind(completedAt,runId).run();
  return json({run_id:runId,model,status:'complete',done:true,processed_events:run.total_events,total_events:run.total_events,input_tokens:run.input_tokens,output_tokens:run.output_tokens,total_latency_ms:run.total_latency_ms,results:[]});
 }
 try{
  const {payload,latency_ms}=await callClassifier(rows.results,model,body?.weights||{},env);
  const usage=payload?.usage||{};
  const inputTokens=finiteInt(usage.input_tokens,0,0,10000000);
  const outputTokens=finiteInt(usage.output_tokens,0,0,10000000);
  const perInput=Math.round(inputTokens/rows.results.length),perOutput=Math.round(outputTokens/rows.results.length);
  const now=new Date().toISOString();
  const results=rows.results.map((event,index)=>{
   const signalAnswer=payload?.answers?.[`signal_${index}`]||{};
   const vibeAnswer=payload?.answers?.[`vibe_${index}`]||{};
   const signal=normalizeSignal(signalAnswer.choice);
   const vibe=scoreToVibe(vibeAnswer.score);
   return{source_id:event.source_id,signal,best_for:BEST_FOR[signal],vibe,verdict:verdict(vibe),confidence:Number(signalAnswer.confidence||vibeAnswer.confidence||0),input_tokens:perInput,output_tokens:perOutput,latency_ms,classified_at:now};
  });
  const statements=results.map(result=>env.DB.prepare(`INSERT INTO event_classifications (source_id, model, run_id, signal, best_for, vibe, verdict, confidence, input_tokens, output_tokens, latency_ms, classified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(source_id, model) DO UPDATE SET run_id=excluded.run_id, signal=excluded.signal, best_for=excluded.best_for, vibe=excluded.vibe, verdict=excluded.verdict, confidence=excluded.confidence, input_tokens=excluded.input_tokens, output_tokens=excluded.output_tokens, latency_ms=excluded.latency_ms, classified_at=excluded.classified_at`).bind(result.source_id,model,runId,result.signal,result.best_for,result.vibe,result.verdict,result.confidence,result.input_tokens,result.output_tokens,result.latency_ms,result.classified_at));
  if(statements.length)await env.DB.batch(statements);
  const processed=Math.min(run.total_events,offset+results.length);
  const done=processed>=run.total_events;
  await env.DB.prepare(`UPDATE classification_runs SET status=?, processed_events=?, input_tokens=input_tokens+?, output_tokens=output_tokens+?, total_latency_ms=total_latency_ms+?, completed_at=? WHERE id=?`).bind(done?'complete':'running',processed,inputTokens,outputTokens,latency_ms,done?now:null,runId).run();
  const updated=await env.DB.prepare('SELECT id, model, status, total_events, processed_events, input_tokens, output_tokens, total_latency_ms, started_at, completed_at FROM classification_runs WHERE id=?').bind(runId).first();
  return json({run_id:runId,model,status:updated.status,done,processed_events:updated.processed_events,total_events:updated.total_events,input_tokens:updated.input_tokens,output_tokens:updated.output_tokens,total_latency_ms:updated.total_latency_ms,batch_latency_ms:latency_ms,results});
 }catch(error){
  const message=error instanceof Error?error.message:String(error);
  await env.DB.prepare("UPDATE classification_runs SET status='failed', error=?, completed_at=? WHERE id=?").bind(message,new Date().toISOString(),runId).run();
  return json({error:'Classifier request failed',detail:message,run_id:runId},502);
 }
}

export default {
 async fetch(request,env){
  const url=new URL(request.url);
  try{
   if(url.pathname==='/api/events'&&request.method==='GET')return await listEvents(url,env);
   if(url.pathname==='/api/stats'&&request.method==='GET')return await eventStats(env);
   if(url.pathname==='/api/classifications'&&request.method==='GET')return await savedClassifications(url,env);
   if(url.pathname==='/api/classify/start'&&request.method==='POST')return await startClassification(request,env);
   if(url.pathname==='/api/classify/batch'&&request.method==='POST')return await classifyBatch(request,env);
   return env.ASSETS.fetch(request);
  }catch(error){return json({error:'Backend request failed',detail:error instanceof Error?error.message:String(error)},500)}
 }
};
