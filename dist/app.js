const groups = [
  ['Learning path', ['learn/index','learn/01-install','learn/02-create-data','learn/03-query-data','learn/04-schema','learn/05-transactions','learn/06-rails','learn/07-server','learn/08-production']],
  ['Start here', ['overview','getting-started/installation','getting-started/quickstart','getting-started/first-database','getting-started/first-query','getting-started/local-to-production']],
  ['Build an app', ['tutorials/rails-production-app']],
  ['Adapters', ['adapters/index','adapters/ruby','adapters/rails','adapters/python','adapters/node','adapters/sequel']],
  ['Python examples', ['python/index','python/flask','python/fastapi','python/django']],
  ['Node examples', ['node/index','node/api','node/vue','node/alpine','node/sveltekit','node/nextjs']],
  ['Guides', ['developer-guide','real-world-examples','export','cli','cli-cheatsheet','debugging','troubleshooting']],
  ['SQL reference', ['sql/syntax','sql/data-types','sql/operators','sql/functions','sql/joins','sql/transactions','sql/compatibility','sql/sqlite-compatibility','sql/compatibility-guide']],
  ['Rails', ['getting-started/rails','rails/installation','rails/database-yml','rails/active-record','rails/migrations','rails/compatibility-guide','rails/production','rails/troubleshooting']],
  ['Server', ['server/architecture','server/configuration','server/authentication','server/connection-pooling','server/protocol','server/deployment']],
  ['Operations', ['production-readiness','operations/production-guide','operations/backups','operations/restore','operations/monitoring','operations/replication','operations/upgrades','operations/disaster-recovery','operations/failover','operations/runbook','operations/production-runbook','operations/workload-testing']],
  ['Architecture', ['architecture/overview','architecture/current-state','architecture/storage-engine','architecture/sql-engine','architecture/execution-engine','architecture/query-planner','architecture/indexes','architecture/pages','architecture/wal','architecture/recovery','architecture/transactions','architecture/mvcc','architecture/concurrency','architecture/go-accelerator','architecture/production-roadmap']],
  ['Development', ['developer/local-development','developer/branching','developer/snapshots','developer/database-diff','developer/temporal-data','contributing/development','contributing/testing','contributing/benchmarking','contributing/architecture','contributing/release-process','release','lessons-learned']],
  ['Project', ['project/about','project/contribute']]
];
let pages=[], byRoute=new Map(), activeRoute='', hits=[], selected=0;
const $=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const label=route=>byRoute.get(route)?.title || route.split('/').pop().replaceAll('-',' ');
const routeFromHash=()=>decodeURIComponent(location.hash.replace(/^#\/?/,'').split('?')[0])||'learn/index';
const icons={
  'Learning path':'<path d="M4 4h16v16H4zM8 9h8M8 13h8M8 17h5"/>',
  'Start here':'<path d="m5 12 5 5L20 6"/>',
  'Build an app':'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 10 2 2-2 2m5 0h3"/>',
  'Adapters':'<rect x="3" y="8" width="7" height="8" rx="1"/><rect x="14" y="8" width="7" height="8" rx="1"/><path d="M10 12h4M12 3v5m0 8v5"/>',
  'Python examples':'<path d="M12 3H7a3 3 0 0 0-3 3v5h8v2H6a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h5v-5h2v5h4a3 3 0 0 0 3-3v-5h-8v-2h6a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3h-6Z"/>',
  'Node examples':'<path d="m12 2 9 5v10l-9 5-9-5V7zM8 9v6l4 2 4-2V9"/>',
  'Guides':'<path d="M4 5h7a3 3 0 0 1 3 3v12H7a3 3 0 0 0-3 0zm16 0h-3a3 3 0 0 0-3 3v12h3a3 3 0 0 1 3 0z"/>',
  'SQL reference':'<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  'Rails':'<path d="M4 17c1-7 5-10 16-10M6 20c3-6 7-8 14-8M11 21c2-3 5-4 9-4"/>',
  'Server':'<rect x="3" y="3" width="18" height="8" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/><path d="M7 7h.01M7 17h.01"/>',
  'Operations':'<circle cx="12" cy="12" r="8"/><path d="M12 7v5l4 3"/>',
  'Architecture':'<rect x="3" y="4" width="7" height="6" rx="1"/><rect x="14" y="4" width="7" height="6" rx="1"/><rect x="8" y="15" width="8" height="6" rx="1"/><path d="M6.5 10v3h11v-3M12 13v2"/>',
  'Development':'<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14"/>',
  'Project':'<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>'
};
function renderNav(){
  $('nav').innerHTML=groups.map(([name,routes])=>`<div class="nav-group"><div class="nav-group-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||''}</svg>${name}</div>${routes.filter(r=>byRoute.has(r)).map(r=>`<a class="nav-link ${r===activeRoute?'active':''}" href="#/${r}" ${r===activeRoute?'aria-current="page"':''}>${escapeHTML(label(r))}</a>`).join('')}</div>`).join('');
}
function render(){
  const route=routeFromHash(), page=byRoute.get(route)||byRoute.get('learn/index');
  activeRoute=page.route;
  const group=groups.find(([,routes])=>routes.includes(activeRoute))?.[0]||'Docs';
  $('breadcrumb').innerHTML=`RubyDB <span>/</span> ${escapeHTML(group)} <span>/</span> <strong>${escapeHTML(page.title)}</strong>`;
  $('article').innerHTML=page.html;
  document.title=`${page.title} · RubyDB Documentation`;
  $('edit-link').hidden=page.route.startsWith('learn/')||page.route.startsWith('project/');
  $('edit-link').href='https://github.com/aldanedev-create/rubydb/blob/main/'+(page.route==='overview'?'README.md':'docs/'+page.route+'.md');
  const headings=[...$('article').querySelectorAll('h2,h3')];
  $('toc').innerHTML=headings.map((h,i)=>{h.id=h.id||'section-'+i;return `<a class="depth-${h.tagName.slice(1)}" href="#${h.id}">${escapeHTML(h.textContent)}</a>`}).join('');
  $('article').querySelectorAll('pre').forEach(pre=>{const wrapper=document.createElement('div');wrapper.className='code-block';const toolbar=document.createElement('div');toolbar.className='code-toolbar';const button=document.createElement('button');button.className='copy-button';button.textContent='Copy';button.setAttribute('aria-label','Copy code');button.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(pre.querySelector('code')?.textContent||pre.textContent);button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1800)}catch{button.textContent='Select code'}});pre.parentNode.insertBefore(wrapper,pre);wrapper.append(toolbar,pre);toolbar.append(button)});
  const ordered=groups.flatMap(([,routes])=>routes).filter(r=>byRoute.has(r)), index=ordered.indexOf(activeRoute);
  $('pager').innerHTML=[index>0?`<a href="#/${ordered[index-1]}">Previous<strong>← ${escapeHTML(label(ordered[index-1]))}</strong></a>`:'',index<ordered.length-1?`<a class="next" href="#/${ordered[index+1]}">Next<strong>${escapeHTML(label(ordered[index+1]))} →</strong></a>`:''].join('');
  renderNav();$('sidebar').classList.remove('open');$('mobile-menu').setAttribute('aria-expanded','false');
  const section=new URLSearchParams(location.hash.split('?')[1]||'').get('section');
  if(section)requestAnimationFrame(()=>document.getElementById(section)?.scrollIntoView());else scrollTo(0,0);
}
function search(q){
  q=q.trim().toLowerCase();
  hits=q?pages.map(p=>({p,score:(p.title.toLowerCase().includes(q)?100:0)+(p.text.toLowerCase().includes(q)?10:0)})).filter(x=>x.score).sort((a,b)=>b.score-a.score).slice(0,12).map(x=>x.p):[];
  selected=0;renderHits();
}
function renderHits(){
  $('search-results').innerHTML=hits.length?hits.map((p,i)=>`<button class="search-result ${i===selected?'selected':''}" data-index="${i}"><strong>${escapeHTML(p.title)}</strong><small>${escapeHTML(p.route.replaceAll('/',' / '))}</small></button>`).join(''):`<div class="search-empty">${$('search-input').value?'No matching pages. Try another term.':'Type to search all documentation pages.'}</div>`;
  $('search-results').querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>openHit(Number(b.dataset.index))));
}
function openHit(i){if(!hits[i])return;closeSearch();location.hash='#/'+hits[i].route}
function openSearch(){$('search-dialog').hidden=false;$('search-input').value='';search('');$('search-input').focus()}
function closeSearch(){$('search-dialog').hidden=true;$('search-trigger').focus()}
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch()}else if(e.key==='Escape'&&!$('search-dialog').hidden)closeSearch();else if(!$('search-dialog').hidden&&e.key==='ArrowDown'){e.preventDefault();selected=Math.min(hits.length-1,selected+1);renderHits()}else if(!$('search-dialog').hidden&&e.key==='ArrowUp'){e.preventDefault();selected=Math.max(0,selected-1);renderHits()}else if(!$('search-dialog').hidden&&e.key==='Enter'){e.preventDefault();openHit(selected)}});
$('search-trigger').addEventListener('click',openSearch);
$('search-input').addEventListener('input',e=>search(e.target.value));
$('search-dialog').addEventListener('click',e=>{if(e.target===$('search-dialog'))closeSearch()});
$('mobile-menu').addEventListener('click',()=>{const isOpen=$('sidebar').classList.toggle('open');$('mobile-menu').setAttribute('aria-expanded',String(isOpen));$('mobile-menu').setAttribute('aria-label',isOpen?'Close navigation':'Open navigation')});
window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#/'))render()});
fetch('pages.json').then(r=>{if(!r.ok)throw Error('Unable to load pages');return r.json()}).then(data=>{pages=data;byRoute=new Map(pages.map(p=>[p.route,p]));render()}).catch(()=>$('article').innerHTML='<h1>Documentation unavailable</h1><p>Reload this page to try again.</p>');
