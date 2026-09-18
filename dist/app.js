const rawEvents = [
 ['6:15am','Science x AI Breakfast','Endpoint Arena','Research talent','Researchers',91,90,'GO'],
 ['7:00am',"The 7AM Club: Tech Week Founders' Run",'Leverage, Tavily','Investor access','Founders raising',83,84,'GO'],
 ['7:30am','Run Tech Club | Signal Run','Run Tech Club','Looking for a job','Job seekers',72,67,'MAYBE'],
 ['8:00am','Bots, Bagels & Brews','Startup Grind, Bright Data','Engineer talent','Engineers',88,86,'GO'],
 ['8:00am','Women Founders, Funders, & Operators Walk','The Investment Committee','Investor access','Founders raising',93,94,'GO'],
 ['8:00am','1,200 Free Coffees | Brewbird x Flex','Flex','Sales pitch / noise','General networking',89,42,'SKIP'],
 ['8:30am','Robots & Hardware Coffee @Tesla Showroom','Leverage','Engineer talent','Engineers',86,87,'GO'],
 ['8:30am',"Bria × fal × LTX: What's New in Open-Weights Pipelines",'Bria, fal, LTX','Research talent','Researchers',94,95,'GO'],
 ['8:30am','Physical AI Founders & Investors Breakfast','Raisable','Investor access','Founders raising',95,97,'GO'],
 ['9:00am','Matched by Verci','Verci','Looking for a job','Job seekers',74,69,'MAYBE'],
 ['9:00am','Coffee Rave for AI Builders','EchoHer','Engineer talent','Engineers',84,82,'GO'],
 ['9:00am',"Founders' Coffee",'Y·US Ventures, Bridgit','Investor access','Founders raising',87,90,'GO'],
 ['9:00am','Hardware Founders and Builders Breakfast','Byteforge Systems','Engineer talent','Engineers',91,92,'GO'],
 ['9:00am','Welcome Breakfast w/ Deel, AWS & Ramp','Deel, AWS, Ramp','Sales pitch / noise','General networking',92,38,'SKIP'],
 ['9:00am','Supporting Tech Teams Through Rapid Growth','STRATIVIS','Engineer talent','Hiring managers',78,73,'GO'],
 ['9:00am','How Much Should AI Know About You?','Consulate General of Switzerland','Research talent','Researchers',82,80,'GO'],
 ['9:30am','The MCP Gateway','Agentic Fabriq, Open Future Forum','Research talent','Engineers',89,88,'GO'],
 ['10:00am','Shaping What’s Next with Techstars, Zendesk & DigitalOcean','Techstars, DigitalOcean, Zendesk','Investor access','Founders raising',88,89,'GO'],
 ['10:00am','Growth Teardown: 5 Companies in 60 Minutes','Juliet AI','Sales pitch / noise','Growth teams',76,51,'SKIP'],
 ['10:00am','AI Native in Half a Day','Corporate Accelerator Forum, USF','Looking for a job','Job seekers',71,70,'MAYBE'],
 ['10:00am','Frontier Science AI Hackathon','Cinnamon Sipper','Research talent','Researchers',86,91,'GO'],
 ['10:00am','From Term Sheet To Cap Table','Qapita','Investor access','Founders raising',85,83,'GO'],
 ['11:00am','Founder Social Club Pop Up Cafe','Founder Social Club','Investor access','Founders raising',73,72,'GO'],
 ['9:00am','AGI, Inc. Store — Wearables Pop-up','AGI, Inc.','Sales pitch / noise','General networking',90,33,'SKIP'],
 ['Featured','Future of Creativity, Experiences & Play','Gold House Ventures','Research talent','Engineers',82,79,'GO'],
 ['Featured','Watts & Wisdom: An Evening with Filippo Pozzato','a16z, Rillet','Investor access','Founders raising',77,75,'GO'],
 ['Featured','Building the Future of Preventive Health','Fenwick & West','Research talent','Researchers',84,83,'GO'],
 ['Featured',"GTM Panel: What's Working Right Now",'Skillsheet','Sales pitch / noise','Sales teams',86,48,'SKIP'],
 ['Featured','Hack Alcatraz with Cloudflare and Kling AI','Cloudflare, Kling AI','Engineer talent','Engineers',93,94,'GO'],
 ['Featured','Official Tech Week Kickoff','Fireworks, Stripe, Vercel','Looking for a job','Job seekers',89,88,'GO'],
 ['Featured','Meet the Lab: Mistral','Mistral','Research talent','Researchers',95,96,'GO'],
 ['Featured','Claude Founder House','Anthropic','Investor access','Founders raising',92,93,'GO'],
 ['Featured','a16z & Friends: Morning Bike Ride','a16z','Investor access','Founders raising',78,80,'GO'],
 ['Featured','Advancing Collaborative AI Drug Discovery','a16z, Lilly','Research talent','Researchers',94,95,'GO'],
 ['6:00am',"Niural AI's Quiet Room",'Niural AI','Looking for a job','Job seekers',80,74,'GO'],
 ['6:30am','Sunrise Storytelling','Need To Film Ltd','Sales pitch / noise','Creators',71,64,'MAYBE'],
 ['7:00am','Clementino Classic','Domu','Sales pitch / noise','General networking',68,61,'MAYBE'],
 ['7:00am','Sunrise Cold Plunge with Soma','Soma','Sales pitch / noise','General networking',75,63,'MAYBE'],
 ['7:30am','Coffee Rave','SFSC','Sales pitch / noise','General networking',72,66,'MAYBE'],
 ['9:00am','Law in the Age of AI','SimpleClosure, Carta','Research talent','Researchers',87,85,'GO']
];
const events=rawEvents.map((e,i)=>({id:i+1,time:e[0],name:e[1],host:e[2],signal:e[3],best:e[4],score:e[6],verdict:e[7]}));
const personaOrder={founder:[8,4,11],jobseeker:[2,9,14],engineer:[7,12,16],researcher:[7,0,20]};
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
 document.querySelector('#recommendationList').innerHTML=personaOrder[persona].map((idx,i)=>{const e=events[idx];return `<div class="rec"><span class="rec-rank">0${i+1}</span><div><h3>${e.name}</h3><p>${e.host} · ${e.signal}</p></div><strong class="score">${e.score}</strong></div>`}).join('');
}
function rowMarkup(e,full=false){
 const eventCell=`<span class="event-name">${e.name}</span><span class="event-host">${e.host}</span>`;
 if(full)return `<tr data-event-id="${e.id}"><td>${e.time}</td><td>${eventCell}</td><td><span class="tag">${e.signal}</span></td><td>${e.best}</td><td class="score-cell" data-vibe="${e.score}">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
 return `<tr data-event-id="${e.id}"><td>${eventCell}</td><td><span class="tag">${e.signal}</span></td><td>${e.best}</td><td class="score-cell" data-vibe="${e.score}">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
}
function renderRows(){document.querySelector('#overviewRows').innerHTML=events.slice(0,5).map(e=>rowMarkup(e)).join('')}
let activeSignal='all';
let processedEvents=40;
let classificationRunning=false;
function updateEventRendering(processed){
 processedEvents=processed;
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
 const filtered=events.filter(e=>(activeSignal==='all'||e.signal===activeSignal)&&(!q||`${e.name} ${e.host}`.toLowerCase().includes(q)));
 document.querySelector('#allEventRows').innerHTML=filtered.map(e=>rowMarkup(e,true)).join('');
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
 classificationRunning=true;processedEvents=0;updateEventRendering(0);
 panel.classList.remove('complete');panel.classList.add('running');state.textContent='RUNNING';button.disabled=true;tokenInBar.style.width='0';tokenOutBar.style.width='0';updateLiveSignalMix(0);let step=0;
 const stages=['Fetching calendar…','Normalizing event records…',`Classifying with ${model}…`,'Ranking by persona…'];
 const activityStages=['Reading titles, hosts, times, and descriptions from the calendar.','Mapping source fields into a consistent event schema.','Scoring audience fit, event quality, and sales-noise signals.','Building ranked recommendations for each attendee persona.'];
 const timer=setInterval(()=>{step++;const processed=Math.min(step,events.length),pct=Math.round(processed/events.length*100),stageIndex=Math.min(Math.floor(pct/27),3),tokensIn=Math.round(78700*pct/100),tokensOut=Math.round(35300*pct/100);bar.style.width=`${pct}%`;detail.textContent=`${pct}%`;processedCount.textContent=`${processed} / 40`;inputTokens.textContent=tokensIn.toLocaleString();outputTokens.textContent=tokensOut.toLocaleString();totalTokens.textContent=(tokensIn+tokensOut).toLocaleString();tokenInBar.style.width=`${tokensIn/114000*100}%`;tokenOutBar.style.width=`${tokensOut/114000*100}%`;updateLiveSignalMix(processed);updateEventRendering(processed);status.textContent=stages[stageIndex];activity.textContent=stageIndex===2&&processed?`Evaluating “${events[Math.min(processed-1,39)].name}” against the weighted rubric.`:activityStages[stageIndex];if(pct===100){clearInterval(timer);setTimeout(()=>{classificationRunning=false;updateEventRendering(40);panel.classList.remove('running');panel.classList.add('complete');state.textContent='COMPLETE';status.textContent='Classification complete';detail.textContent='100%';activity.textContent='40 events vibe-ranked and ready for review.';button.disabled=false;showToast('40 events classified · results updated')},450)}},80);
}
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
renderRecommendations();renderRows();renderAllEvents();renderCriteria();
function registerAgentTools(){
 const context=document.modelContext;
 if(!context?.registerTool)return;
 const controller=new AbortController();
 const register=(tool)=>Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});
 register({name:'navigate_signal_dashboard',title:'Navigate Signal dashboard',description:'Open a dashboard view: overview, events, or criteria.',inputSchema:{type:'object',properties:{view:{type:'string',enum:['overview','events','criteria']}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!['overview','events','criteria'].includes(input?.view))throw new Error('Invalid view');switchView(input.view);return{view:input.view,status:'visible'}}});
 register({name:'filter_sf_tech_week_events',title:'Filter SF Tech Week events',description:'Filter the visible event table by search text and optional primary signal.',inputSchema:{type:'object',properties:{query:{type:'string'},signal:{type:'string',enum:['all','Investor access','Engineer talent','Research talent','Looking for a job','Sales pitch / noise']}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){switchView('events');activeSignal=input?.signal||'all';document.querySelector('#eventSearch').value=input?.query||'';document.querySelectorAll('[data-signal]').forEach(x=>x.classList.toggle('active',x.dataset.signal===activeSignal));renderAllEvents();return{matches:document.querySelectorAll('#allEventRows tr').length,signal:activeSignal,query:input?.query||''}}});
}
registerAgentTools();
