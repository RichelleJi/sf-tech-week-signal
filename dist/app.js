const rawEvents = [
 ['6:15am','Science x AI Breakfast','Endpoint Arena','Research talent','Researchers',91,90,'GO'],
 ['7:00am',"The 7AM Club: Tech Week Founders' Run",'Leverage, Tavily','Investor access','Founders raising',83,84,'GO'],
 ['7:30am','Run Tech Club | Signal Run','Run Tech Club','Engineering hiring','Job seekers',72,67,'MAYBE'],
 ['8:00am','Bots, Bagels & Brews','Startup Grind, Bright Data','Engineering hiring','Engineers',88,86,'GO'],
 ['8:00am','Women Founders, Funders, & Operators Walk','The Investment Committee','Investor access','Founders raising',93,94,'GO'],
 ['8:00am','1,200 Free Coffees | Brewbird x Flex','Flex','Sales pitch / noise','General networking',89,42,'SKIP'],
 ['8:30am','Robots & Hardware Coffee @Tesla Showroom','Leverage','Engineering hiring','Engineers',86,87,'GO'],
 ['8:30am',"Bria × fal × LTX: What's New in Open-Weights Pipelines",'Bria, fal, LTX','Research talent','Researchers',94,95,'GO'],
 ['8:30am','Physical AI Founders & Investors Breakfast','Raisable','Investor access','Founders raising',95,97,'GO'],
 ['9:00am','Matched by Verci','Verci','Engineering hiring','Job seekers',74,69,'MAYBE'],
 ['9:00am','Coffee Rave for AI Builders','EchoHer','Engineering hiring','Engineers',84,82,'GO'],
 ['9:00am',"Founders' Coffee",'Y·US Ventures, Bridgit','Investor access','Founders raising',87,90,'GO'],
 ['9:00am','Hardware Founders and Builders Breakfast','Byteforge Systems','Engineering hiring','Engineers',91,92,'GO'],
 ['9:00am','Welcome Breakfast w/ Deel, AWS & Ramp','Deel, AWS, Ramp','Sales pitch / noise','General networking',92,38,'SKIP'],
 ['9:00am','Supporting Tech Teams Through Rapid Growth','STRATIVIS','Engineering hiring','Hiring managers',78,73,'GO'],
 ['9:00am','How Much Should AI Know About You?','Consulate General of Switzerland','Research talent','Researchers',82,80,'GO'],
 ['9:30am','The MCP Gateway','Agentic Fabriq, Open Future Forum','Research talent','Engineers',89,88,'GO'],
 ['10:00am','Shaping What’s Next with Techstars, Zendesk & DigitalOcean','Techstars, DigitalOcean, Zendesk','Investor access','Founders raising',88,89,'GO'],
 ['10:00am','Growth Teardown: 5 Companies in 60 Minutes','Juliet AI','Sales pitch / noise','Growth teams',76,51,'SKIP'],
 ['10:00am','AI Native in Half a Day','Corporate Accelerator Forum, USF','Engineering hiring','Job seekers',71,70,'MAYBE'],
 ['10:00am','Frontier Science AI Hackathon','Cinnamon Sipper','Research talent','Researchers',86,91,'GO'],
 ['10:00am','From Term Sheet To Cap Table','Qapita','Investor access','Founders raising',85,83,'GO'],
 ['11:00am','Founder Social Club Pop Up Cafe','Founder Social Club','Investor access','Founders raising',73,72,'GO'],
 ['9:00am','AGI, Inc. Store — Wearables Pop-up','AGI, Inc.','Sales pitch / noise','General networking',90,33,'SKIP'],
 ['Featured','Future of Creativity, Experiences & Play','Gold House Ventures','Research talent','Engineers',82,79,'GO'],
 ['Featured','Watts & Wisdom: An Evening with Filippo Pozzato','a16z, Rillet','Investor access','Founders raising',77,75,'GO'],
 ['Featured','Building the Future of Preventive Health','Fenwick & West','Research talent','Researchers',84,83,'GO'],
 ['Featured',"GTM Panel: What's Working Right Now",'Skillsheet','Sales pitch / noise','Sales teams',86,48,'SKIP'],
 ['Featured','Hack Alcatraz with Cloudflare and Kling AI','Cloudflare, Kling AI','Engineering hiring','Engineers',93,94,'GO'],
 ['Featured','Official Tech Week Kickoff','Fireworks, Stripe, Vercel','Engineering hiring','Job seekers',89,88,'GO'],
 ['Featured','Meet the Lab: Mistral','Mistral','Research talent','Researchers',95,96,'GO'],
 ['Featured','Claude Founder House','Anthropic','Investor access','Founders raising',92,93,'GO'],
 ['Featured','a16z & Friends: Morning Bike Ride','a16z','Investor access','Founders raising',78,80,'GO'],
 ['Featured','Advancing Collaborative AI Drug Discovery','a16z, Lilly','Research talent','Researchers',94,95,'GO'],
 ['6:00am',"Niural AI's Quiet Room",'Niural AI','Engineering hiring','Job seekers',80,74,'GO'],
 ['6:30am','Sunrise Storytelling','Need To Film Ltd','Sales pitch / noise','Creators',71,64,'MAYBE'],
 ['7:00am','Clementino Classic','Domu','Sales pitch / noise','General networking',68,61,'MAYBE'],
 ['7:00am','Sunrise Cold Plunge with Soma','Soma','Sales pitch / noise','General networking',75,63,'MAYBE'],
 ['7:30am','Coffee Rave','SFSC','Sales pitch / noise','General networking',72,66,'MAYBE'],
 ['9:00am','Law in the Age of AI','SimpleClosure, Carta','Research talent','Researchers',87,85,'GO']
];
const events=rawEvents.map((e,i)=>({id:i+1,time:e[0],name:e[1],host:e[2],signal:e[3],best:e[4],score:e[6],verdict:e[7]}));
const personaOrder={founder:[8,4,11],jobseeker:[2,9,14],engineer:[7,12,16],researcher:[7,0,20]};
const criteria=[
 ['Investor access','I','Partner, principal, angel, or allocator density; fundraising intent; small-group access.',22,'positive'],
 ['Engineering hiring','E','Hiring managers, technical leaders, active roles, and formats that enable real evaluation.',18,'positive'],
 ['Research talent','R','Researchers, paper authors, labs, frontier-model teams, and substantive technical depth.',15,'positive'],
 ['Food quality','F','Substantial, well-reviewed food that supports the event format—not just snack-table bait.',9,'positive'],
 ['Exclusivity','X','Meaningful curation, relevant invitees, limited capacity, and credible access barriers.',10,'positive'],
 ['Swag ROI','S','Usefulness and quality of giveaways relative to the time and attention the event demands.',7,'positive'],
 ['Venue quality','V','Comfort, acoustics, accessibility, location, layout, and suitability for conversation.',9,'positive'],
 ['Sales pitch / noise','!','Sponsor-heavy framing, vague futurism, lead-gen language, and low audience specificity.',10,'negative']
];
function renderRecommendations(persona='founder'){
 document.querySelector('#recommendationList').innerHTML=personaOrder[persona].map((idx,i)=>{const e=events[idx];return `<div class="rec"><span class="rec-rank">0${i+1}</span><div><h3>${e.name}</h3><p>${e.host} · ${e.signal}</p></div><strong class="score">${e.score}</strong></div>`}).join('');
}
function rowMarkup(e,full=false){
 const eventCell=`<span class="event-name">${e.name}</span><span class="event-host">${e.host}</span>`;
 if(full)return `<tr><td>${e.time}</td><td>${eventCell}</td><td><span class="tag">${e.signal}</span></td><td>${e.best}</td><td class="score-cell">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
 return `<tr><td>${eventCell}</td><td><span class="tag">${e.signal}</span></td><td>${e.best}</td><td class="score-cell">${e.score}</td><td><span class="verdict ${e.verdict==='GO'?'go':e.verdict==='SKIP'?'skip':''}">${e.verdict}</span></td></tr>`;
}
function renderRows(){document.querySelector('#overviewRows').innerHTML=events.slice(0,5).map(e=>rowMarkup(e)).join('')}
let activeSignal='all';
function renderAllEvents(){
 const q=document.querySelector('#eventSearch').value.trim().toLowerCase();
 const filtered=events.filter(e=>(activeSignal==='all'||e.signal===activeSignal)&&(!q||`${e.name} ${e.host}`.toLowerCase().includes(q)));
 document.querySelector('#allEventRows').innerHTML=filtered.map(e=>rowMarkup(e,true)).join('');
 document.querySelector('#eventEmpty').hidden=filtered.length>0;
}
function renderCriteria(){
 document.querySelector('#criteriaGrid').innerHTML=criteria.map((c,i)=>`<article class="panel criterion"><div class="criterion-top"><div><h3 class="${c[4]}">${c[0]}</h3><p>${c[2]}</p></div><span class="criterion-icon">${c[1]}</span></div><div class="criterion-controls"><input type="range" min="0" max="40" value="${c[3]}" data-weight="${i}" aria-label="${c[0]} weight"><output>${c[3]}%</output></div></article>`).join('');
 document.querySelectorAll('[data-weight]').forEach(input=>input.addEventListener('input',e=>{criteria[+e.target.dataset.weight][3]=+e.target.value;e.target.nextElementSibling.value=`${e.target.value}%`;document.querySelector('#weightTotal').textContent=`${criteria.reduce((s,c)=>s+c[3],0)}%`}));
}
function switchView(name){document.getElementById(name)?.scrollIntoView({behavior:'smooth',block:'start'})}
document.querySelectorAll('.nav-item').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();switchView(a.getAttribute('href').slice(1))}));
document.querySelector('#personaSelect').addEventListener('change',e=>renderRecommendations(e.target.value));
document.querySelector('#eventSearch').addEventListener('input',renderAllEvents);
document.querySelectorAll('[data-signal]').forEach(b=>b.addEventListener('click',()=>{activeSignal=b.dataset.signal;document.querySelectorAll('[data-signal]').forEach(x=>x.classList.toggle('active',x===b));renderAllEvents()}));
const modal=document.querySelector('#sourceModal');
function openModal(){modal.hidden=false;document.querySelector('#sourceUrl').focus()}
function closeModal(){modal.hidden=true}
document.querySelector('#configureBtn').addEventListener('click',openModal);
document.querySelector('#closeModal').addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
document.querySelector('#saveSource').addEventListener('click',()=>{closeModal();showToast('Configuration saved for this session')});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
document.querySelector('#runBtn').addEventListener('click',runClassification);
function runClassification(){
 const overlay=document.querySelector('#runOverlay'),bar=document.querySelector('#runProgress'),status=document.querySelector('#runStatus'),detail=document.querySelector('#runDetail');
 overlay.hidden=false;let step=0;const stages=['Fetching calendar…','Normalizing event records…','Classifying with Qwen…','Ranking by persona…'];
 const timer=setInterval(()=>{step++;const pct=Math.min(step*8,100);bar.style.width=`${pct}%`;detail.textContent=`${Math.min(Math.round(pct/100*40),40)} of 40 events`;status.textContent=stages[Math.min(Math.floor(pct/27),3)];if(pct===100){clearInterval(timer);setTimeout(()=>{overlay.hidden=true;bar.style.width='0';showToast('40 events classified · recommendations updated')},500)}},120);
}
document.querySelector('#copyPayload').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#payloadPreview').innerText);showToast('Request payload copied')}catch{showToast('Copy unavailable in this preview')}});
function showToast(message){const t=document.querySelector('#toast');t.textContent=message;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2400)}
renderRecommendations();renderRows();renderAllEvents();renderCriteria();
function registerAgentTools(){
 const context=document.modelContext;
 if(!context?.registerTool)return;
 const controller=new AbortController();
 const register=(tool)=>Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});
 register({name:'navigate_signal_dashboard',title:'Navigate Signal dashboard',description:'Open a dashboard view: overview, events, criteria, or model process.',inputSchema:{type:'object',properties:{view:{type:'string',enum:['overview','events','criteria','model']}},required:['view'],additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!['overview','events','criteria','model'].includes(input?.view))throw new Error('Invalid view');switchView(input.view);return{view:input.view,status:'visible'}}});
 register({name:'filter_sf_tech_week_events',title:'Filter SF Tech Week events',description:'Filter the visible event table by search text and optional primary signal.',inputSchema:{type:'object',properties:{query:{type:'string'},signal:{type:'string',enum:['all','Investor access','Engineering hiring','Research talent','Sales pitch / noise']}},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){switchView('events');activeSignal=input?.signal||'all';document.querySelector('#eventSearch').value=input?.query||'';document.querySelectorAll('[data-signal]').forEach(x=>x.classList.toggle('active',x.dataset.signal===activeSignal));renderAllEvents();return{matches:document.querySelectorAll('#allEventRows tr').length,signal:activeSignal,query:input?.query||''}}});
}
registerAgentTools();
