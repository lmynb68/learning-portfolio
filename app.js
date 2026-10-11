let currentFilter = 'all';
const grid = document.getElementById('project-grid');
const search = document.getElementById('search');
const dialog = document.getElementById('project-dialog');
let opener = null;
const art = {embedded:'IRQ → MCU',notes:'{ learn; }',hardware:'CORE / PCB',web:'< create />',reference:'READ → MAP'};
function render(){
 const query = search.value.trim().toLocaleLowerCase();
 const selected = projects.filter(p => (currentFilter === 'all' || p.category === currentFilter) && [p.title,p.subtitle,p.description,...p.topics].join(' ').toLocaleLowerCase().includes(query));
 grid.replaceChildren();
 for (const p of selected){
  const card = document.createElement('article'); card.className = 'project-card';
  const visual = document.createElement('div'); visual.className = 'card-art art-' + p.category; visual.setAttribute('aria-hidden','true');
  const code = document.createElement('span'); code.className = 'art-code'; code.textContent = art[p.category];
  const number = document.createElement('span'); number.className = 'art-number'; number.textContent = 'EXPLORATION ' + String(projects.indexOf(p)+1).padStart(2,'0'); visual.append(code,number);
  const content = document.createElement('div'); content.className = 'card-content';
  for (const [tag,cls,text] of [['p','card-label',p.label],['h3','',p.title],['p','card-subtitle',p.subtitle],['p','card-description',p.description]]){const el=document.createElement(tag);el.className=cls;el.textContent=text;content.append(el);}
  const bottom=document.createElement('div');bottom.className='card-bottom';const status=document.createElement('span');status.className='card-status';status.textContent=p.status;
  const button=document.createElement('button');button.className='card-button';button.textContent='查看记录 ↗';button.setAttribute('aria-label','查看'+p.title+'的记录');button.addEventListener('click',()=>openProject(p,button));bottom.append(status,button);content.append(bottom);card.append(visual,content);grid.append(card);
 }
 document.getElementById('result-count').textContent = selected.length + ' / ' + projects.length + ' 条学习记录';
 document.getElementById('empty').hidden = selected.length > 0;
}
function openProject(p,button){
 opener=button;
 for(const [id,value] of Object.entries({'dialog-label':p.label,'dialog-title':p.title,'dialog-subtitle':p.subtitle,'dialog-description':p.description,'dialog-status':p.status,'dialog-detail':p.detail,'dialog-origin':p.origin,'dialog-evidence':p.evidence})){document.getElementById(id).textContent=value;}
 const list=document.getElementById('dialog-topics');list.replaceChildren();p.topics.forEach(t=>{const li=document.createElement('li');li.textContent=t;list.append(li);});
 const link=document.getElementById('dialog-source');link.hidden=!p.url;if(p.url){link.href=p.url;}else{link.removeAttribute('href');}
 dialog.showModal();document.getElementById('close-dialog').focus();
}
function setFilter(value){currentFilter=value;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===value)));render();}
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>setFilter(b.dataset.filter)));
search.addEventListener('input',render);
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
dialog.addEventListener('close',()=>opener?.focus());
document.querySelectorAll('[data-topic]').forEach(a=>a.addEventListener('click',()=>{search.value=a.dataset.topic;setFilter('all');}));
render();