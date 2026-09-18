const sourceEvents=window.SF_TECH_WEEK_EVENTS||[];
const signalRules=[
 ['Research talent',/research|science|lab|quantum|biotech|drug discovery|paper|model training|deepmind|agi|inference/i],
 ['Looking for a job',/hiring|hire|career|talent hunt|recruit|job seeker|open role|founding team/i],
 ['Investor access',/investor|fundrais|venture|\bvc\b|capital|funded|funders|angel|allocator|term sheet|pitch/i],
 ['Engineer talent',/engineer|developer|hackathon|buildathon|builder|devtool|api|agent|robot|hardware|open source|infrastructure/i],
 ['Sales pitch / noise',/sales|marketing|gtm|rave|happy hour|mixer|cocktail|party|brand|sponsor|showcase/i]
];
function hashVibe(value){let h=0;for(const char of value)h=(h*31+char.charCodeAt(0))>>>0;return h}
function classifyEvent(e,i){
 const text=`${e.title} ${e.host} ${e.description||''}`;
 const signal=(signalRules.find(([,pattern])=>pattern.test(text))||['Engineer talent'])[0];
 const best={"Investor access":"Founders raising","Engineer talent":"Engineers","Research talent":"Researchers","Looking for a job":"Job seekers","Sales pitch / noise":"General networking"}[signal];
 let score=58+(hashVibe(e.source_id||String(i))%25);
 if(/Featured/i.test(e.status||''))score+=8;if(/Closed|Full/i.test(e.status||''))score-=9;if(signal==='Sales pitch / noise')score-=8;
 score=Math.max(28,Math.min(98,score));
 return{id:i+1,sourceId:e.source_id,date:e.date,time:e.time,name:e.title,host:e.host||'Host not listed',location:e.location||'Location TBD',description:e.description||'',descriptionStatus:e.description_status||'pending',sourceUrl:e.source_url,signal,best,score,verdict:score>=78?'GO':score>=62?'MAYBE':'SKIP'};
}
const events=sourceEvents.map(classifyEvent);
const personaSignal={founder:'Investor access',jobseeker:'Looking for a job',engineer:'Engineer talent',researcher:'Research talent'};
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]))}
function sourceLink(value){try{const url=new URL(value);return url.protocol==='https:'&&url.hostname==='www.tech-week.com'?url.href:'#'}catch{return '#'}}
const criteria=[
 ['Investor access','I','Partner, principal, angel, or allocator density; fundraising intent; small-group access.',20,'positive'],
 ['Engineer talent','E','Strong engineers, technical leaders, project maintainers, and formats that reveal real ability.',16,'positive'],
 ['Research talent','R','Researchers, paper authors, labs, frontier-model teams, and substantive technical depth.',14,'positive'],
 ['Looking for a job','J','Active recruiters, hiring managers, open roles, referral access, and career-relevant conversations.',12,'positive'],
 ['Food quality','F','Substantial, well-reviewed food that supports the event format—not just snack-table bait.',8,'positive'],
 ['Exclusivity','X','Meaningful curation, relevant invitees, limited capacity, and credible access barriers.',9,'positive'],
 ['Swag ROI','S','Usefulness and quality of giveaways relative to the time and attention the event demands.',6,'positive'],
 ['Venue quality','V','Comfort, acoustics, accessibility, location, layout, and suitability for conversation.',7,'positive'],
 ['Sales pitch / noise','!','Sponsor-heavy framing, vague futurism, lead-gen language, and low audience specificity.',8,'negative']
];
function renderRecommendations(persona='founder'){
 const picks=events.filter(e=>e.signal===personaSignal[persona]).sort((a,b)=>b.score-a.score).slice(0,3);
 document.querySelector('#recommendationList').innerHTML=picks.map((e,i)=>`<div class="rec"><span class="rec-rank">0${i+1}</span><div><h3><a href="${sourceLink(e.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(e.name)}</a></h3><p>${escapeHtml(e.host)} · ${escapeHtml(e.signal)}</p></div><strong class="score">${e.score}</strong></div>`).join('');
}
function rowMarkup(e,full=false){
 const day=new Date(`${e.date}T12:00:00`).toLocaleDateString('en-US',{month:'short',day:'numeric'});
 const eventCell=`<a class="event-name event-link" href="${sourceLink(e.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(e.name)}</a><span class="event-host">${escapeHtml(e.host)} · ${escapeHtml(e.location)}</span>`;
 if(full)return `<tr data-event-id="${e.id}"><td><span class="event-day">${escapeHtml(day)}</span>${escapeHtml(e.time)}</td><td>${eventCell}</td><td><span class="tag">${escapeHtml(e.signal)}</span></td><td>${escapeHtml(e.best)}</td><td class="score-cell" data-vibe="${e.score}">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
 return `<tr data-event-id="${e.id}"><td>${eventCell}</td><td><span class="tag">${escapeHtml(e.signal)}</span></td><td>${escapeHtml(e.best)}</td><td class="score-cell" data-vibe="${e.score}">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
}
let activeSignal='all';
let processedEvents=events.length;
let classificationRunning=false;
let latestProcessedFirst=false;
const developerMode=new URLSearchParams(location.search).get('dev')==='1';
document.querySelector('#devLatency').hidden=!developerMode;
function updateDevLatency(samples,processed,startedAt){
 if(!developerMode||!samples.length)return;
 const ordered=[...samples].sort((a,b)=>a-b),average=samples.reduce((sum,value)=>sum+value,0)/samples.length,p95=ordered[Math.min(ordered.length-1,Math.floor(ordered.length*.95))],latest=samples[samples.length-1],elapsed=Math.max(1,performance.now()-startedAt);
 document.querySelector('#latencyAvg').textContent=`${average.toFixed(1)} ms`;
 document.querySelector('#latencyP95').textContent=`${p95.toFixed(1)} ms`;
 document.querySelector('#latencyLatest').textContent=`${latest.toFixed(1)} ms`;
 document.querySelector('#latencyThroughput').textContent=`${Math.round(processed/elapsed*1000)} ev/s`;
}
function updateEventRendering(processed){
 processedEvents=processed;
 if(latestProcessedFirst&&processed===0)document.querySelectorAll('#allEventRows,#overviewRows').forEach(body=>[...body.children].sort((a,b)=>Number(b.dataset.eventId)-Number(a.dataset.eventId)).forEach(row=>body.append(row)));
 document.querySelectorAll('#allEventRows tr,#overviewRows tr').forEach(row=>{
  const id=Number(row.dataset.eventId),done=id<=processed,active=classificationRunning&&id===Math.min(processed+1,events.length);
  row.classList.toggle('event-classified',done);row.classList.toggle('event-active',active);row.classList.toggle('event-queued',!done&&!active);
  const vibe=row.querySelector('.score-cell');if(vibe)vibe.textContent=done?vibe.dataset.vibe:active?'···':'—';
 });
 const eventsCount=document.querySelector('#eventsCount');if(eventsCount)eventsCount.textContent=processed;
 document.querySelector('.event-table-panel')?.classList.toggle('is-classifying',classificationRunning);
}
function renderAllEvents(){
 const q=document.querySelector('#eventSearch').value.trim().toLowerCase();
 const filtered=events.filter(e=>(activeSignal==='all'||e.signal===activeSignal)&&(!q||`${e.name} ${e.host} ${e.location} ${e.date} ${e.description}`.toLowerCase().includes(q)));
 const ordered=latestProcessedFirst?[...filtered].sort((a,b)=>b.id-a.id):filtered;
 document.querySelector('#allEventRows').innerHTML=ordered.map(e=>rowMarkup(e,true)).join('');
 document.querySelector('#eventEmpty').hidden=filtered.length>0;
 updateEventRendering(processedEvents);
}
function renderCriteria(){
 document.querySelector('#criteriaGrid').innerHTML=criteria.map((c,i)=>`<article class="panel criterion"><div class="criterion-top"><div><h3 class="${c[4]}">${c[0]}</h3><p>${c[2]}</p></div><span class="criterion-icon">${c[1]}</span></div><div class="criterion-controls"><input class="${c[4]}" type="range" min="0" max="40" value="${c[3]}" style="--fill:${c[3]/40*100}%" data-weight="${i}" aria-label="${c[0]} weight"><span class="bar-label">${c[0]}</span><output>${c[3]}%</output></div></article>`).join('');
 document.querySelectorAll('[data-weight]').forEach(input=>input.addEventListener('input',e=>{criteria[+e.target.dataset.weight][3]=+e.target.value;e.target.style.setProperty('--fill',`${e.target.value/40*100}%`);e.target.parentElement.querySelector('output').value=`${e.target.value}%`}));
}
function switchView(name){document.getElementById(name)?.scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();switchView(a.getAttribute('href').slice(1))}));
document.querySelector('#personaSelect').addEventListener('change',e=>renderRecommendations(e.target.value));
document.querySelector('#eventSearch').addEventListener('input',renderAllEvents);
document.querySelectorAll('[data-signal]').forEach(b=>b.addEventListener('click',()=>{activeSignal=b.dataset.signal;document.querySelectorAll('[data-signal]').forEach(x=>x.classList.toggle('active',x===b));renderAllEvents()}));
document.querySelector('#runBtn').addEventListener('click',runClassification);
document.querySelector('#modelSelect').addEventListener('change',e=>{document.querySelector('#configCurrent').textContent=`SF calendar · ${e.target.value.includes('Qwen')?'Qwen3.6':'Gemma 4'}`});
function updateLiveSignalMix(processed){
 const signals=[['Investor access','mixInvestor','var(--acid)'],['Engineer talent','mixEngineer','var(--cyan)'],['Research talent','mixResearch','var(--blue)'],['Looking for a job','mixJobs','#d58cff'],['Sales pitch / noise','mixNoise','var(--red)']];
 const sample=events.slice(0,processed);
 let cursor=0;const slices=signals.map(([signal,id,color])=>{const count=sample.filter(e=>e.signal===signal).length,start=cursor,end=cursor+(processed?count/processed*100:0);cursor=end;document.querySelector(`#${id}`).textContent=count;return `${color} ${start}% ${end}%`});
 const pie=document.querySelector('#liveMixPie');pie.style.background=processed?`conic-gradient(${slices.join(',')})`:'#242c31';pie.setAttribute('aria-label',processed?`Signal mix for ${processed} processed events`:'No events classified yet');document.querySelector('#liveMixTotal').textContent=processed;
}
function runClassification(){
 const panel=document.querySelector('#runPanel'),bar=document.querySelector('#runProgress'),status=document.querySelector('#runStatus'),detail=document.querySelector('#runDetail'),state=document.querySelector('#runState'),button=document.querySelector('#runBtn'),processedCount=document.querySelector('#processedCount'),inputTokens=document.querySelector('#inputTokens'),outputTokens=document.querySelector('#outputTokens'),totalTokens=document.querySelector('#totalTokens'),tokenInBar=document.querySelector('#tokenInBar'),tokenOutBar=document.querySelector('#tokenOutBar'),activity=document.querySelector('#modelActivity');
 const model=document.querySelector('#modelSelect').value.split('/').pop();
 const latencySamples=[],runStartedAt=performance.now();
 classificationRunning=true;latestProcessedFirst=true;processedEvents=0;updateEventRendering(0);
 panel.classList.remove('complete');panel.classList.add('running');state.textContent='RUNNING';button.disabled=true;tokenInBar.style.width='0';tokenOutBar.style.width='0';updateLiveSignalMix(0);let step=0;
 const stages=['Fetching calendar…','Normalizing event records…',`Classifying with ${model}…`,'Ranking by persona…'];
 const activityStages=['Reading calendar records.','Normalizing event fields.','Evaluating audience fit and noise.','Ranking attendee fit.'];
 const totalIn=events.length*250,totalOut=events.length*82,batch=Math.max(1,Math.ceil(events.length/120));
 const timer=setInterval(()=>{
  const tickStartedAt=performance.now();
  step+=batch;
  const processed=Math.min(step,events.length),pct=Math.round(processed/events.length*100),stageIndex=Math.min(Math.floor(pct/27),3),tokensIn=Math.round(totalIn*pct/100),tokensOut=Math.round(totalOut*pct/100);
  bar.style.width=`${pct}%`;detail.textContent=`${pct}%`;processedCount.textContent=`${processed.toLocaleString()} / ${events.length.toLocaleString()}`;inputTokens.textContent=tokensIn.toLocaleString();outputTokens.textContent=tokensOut.toLocaleString();totalTokens.textContent=(tokensIn+tokensOut).toLocaleString();tokenInBar.style.width=`${tokensIn/(totalIn+totalOut)*100}%`;tokenOutBar.style.width=`${tokensOut/(totalIn+totalOut)*100}%`;updateLiveSignalMix(processed);updateEventRendering(processed);status.textContent=stages[stageIndex];activity.textContent=stageIndex===2&&processed?`Evaluating “${events[Math.min(processed-1,events.length-1)].name}”.`:activityStages[stageIndex];
  latencySamples.push(performance.now()-tickStartedAt);updateDevLatency(latencySamples,processed,runStartedAt);
  if(pct===100){clearInterval(timer);setTimeout(()=>{classificationRunning=false;updateEventRendering(events.length);panel.classList.remove('running');panel.classList.add('complete');state.textContent='COMPLETE';status.textContent='Classification complete';detail.textContent='100%';activity.textContent=`${events.length.toLocaleString()} events ready.`;button.disabled=false;showToast(`${events.length.toLocaleString()} events classified · results updated`)},450)}
 },30);
}
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
document.querySelector('#processedCount').textContent=`${events.length.toLocaleString()} / ${events.length.toLocaleString()}`;
document.querySelector('[data-signal="all"] b').textContent=events.length.toLocaleString();
renderRecommendations();renderAllEvents();renderCriteria();updateLiveSignalMix(events.length);
function registerAgentTools(){
 const context=document.modelContext;
 if(!context?.registerTool)return;
 const controller=new AbortController();
 const register=(tool)=>Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});
 register({name:'navigate_signal_dashboard',title:'Navigate Signal dashboard',description:'Open a dashboard view: overview, events, or criteria.',inputSchema:{type:'object',properties:{view:{type:'string',enum:['overview','events','criteria']}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!['overview','events','criteria'].includes(input?.view))throw new Error('Invalid view');switchView(input.view);return{view:input.view,status:'visible'}}});
 register({name:'filter_sf_tech_week_events',title:'Filter SF Tech Week events',description:'Filter the visible event table by search text and optional primary signal.',inputSchema:{type:'object',properties:{query:{type:'string'},signal:{type:'string',enum:['all','Investor access','Engineer talent','Research talent','Looking for a job','Sales pitch / noise']}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){switchView('events');activeSignal=input?.signal||'all';document.querySelector('#eventSearch').value=input?.query||'';document.querySelectorAll('[data-signal]').forEach(x=>x.classList.toggle('active',x.dataset.signal===activeSignal));renderAllEvents();return{matches:document.querySelectorAll('#allEventRows tr').length,signal:activeSignal,query:input?.query||''}}});
}
registerAgentTools();
