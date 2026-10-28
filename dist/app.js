'use strict';
const players=[
{id:'ayo',name:'Ayo Martins',position:'Forward',club:'Lagos City FC',country:'Nigeria',foot:'Right',number:9,colour:'#cce6ff',chapters:[['2025/26','Lagos City FC'],['2024/25','Mainland United'],['2023/24','Mainland United']]},
{id:'ella',name:'Ella Brooks',position:'Midfielder',club:'East London Athletic',country:'England',foot:'Left',number:8,colour:'#dbeafe',chapters:[['2025/26','East London Athletic'],['2024/25','Northside Women']]},
{id:'sam',name:'Samuel Okoro',position:'Defender',club:'Coastal Rovers',country:'Nigeria',foot:'Right',number:4,colour:'#ccd9e1',chapters:[['2025/26','Coastal Rovers'],['2024/25','Lagos City FC']]},
{id:'leo',name:'Leo Ferreira',position:'Goalkeeper',club:'Vila Nova Athletic',country:'Portugal',foot:'Right',number:1,colour:'#b9ddfa',chapters:[['2025/26','Vila Nova Athletic'],['2024/25','Vila Nova Athletic']]}
];
const seed=[{id:'v1',player:'ayo',title:'A season of finding the net',skill:'Goals',season:'2025/26',club:'Lagos City FC',headline:'Made for the moment',art:''},{id:'v2',player:'ella',title:'Seeing the pass before everyone else',skill:'Assists',season:'2025/26',club:'East London Athletic',headline:'A different vision',art:'two'},{id:'v3',player:'sam',title:'The art of winning it back',skill:'Defending',season:'2025/26',club:'Coastal Rovers',headline:'Nothing gets through',art:'three'},{id:'v4',player:'leo',title:'Big saves. Bigger moments.',skill:'Goalkeeping',season:'2025/26',club:'Vila Nova Athletic',headline:'The last line',art:'four'},{id:'v5',player:'ayo',title:'Where the journey started',skill:'Skills',season:'2023/24',club:'Mainland United',headline:'Before the spotlight',art:'five'},{id:'v6',player:'ella',title:'One season. A new level.',skill:'Full matches',season:'2024/25',club:'Northside Women',headline:'Every touch matters',art:'six'}];
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const locales=window.TOUCHLINE_LOCALES;
let language,chosenLanguage;
try{language=localStorage.getItem('touchline-language')}catch{}
if(!locales[language])language=null;
const t=key=>locales[language||'en'].messages[key]||locales.en.messages[key]||key;
const roleKeys={Forward:'forward',Midfielder:'midfielder',Defender:'defender',Goalkeeper:'goalkeeper',Right:'right',Left:'left',Both:'both',Goals:'goals',Assists:'assists',Skills:'skills',Defending:'defending',Goalkeeping:'goalkeeping','Full matches':'matches','All highlights':'all'};
const label=value=>roleKeys[value]?t(roleKeys[value]):esc(value);
function countryName(value){const code={Nigeria:'NG',England:'GB',Portugal:'PT'}[value];try{return code?esc(new Intl.DisplayNames([language||'en'],{type:'region'}).of(code)):esc(value)}catch{return esc(value)}}
let state;try{state=JSON.parse(localStorage.getItem('touchline-state'))||{}}catch{state={}}
state.saved=state.saved||[];state.following=state.following||[];state.profile=state.profile||null;
let uploads=[],page='home',filter='All highlights',query='',sort='featured',chapter='All',db,activeUrl;
function persist(){try{localStorage.setItem('touchline-state',JSON.stringify(state))}catch{toast(t('saveError'))}}
function toast(msg){$('#toast').textContent=msg;$('#toast').classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3500)}
function initials(name){return String(name||'').split(' ').map(s=>s[0]).slice(0,2).join('')}
function player(id){return id==='me'?(state.profile?{...state.profile,id:'me',chapters:[...new Set(uploads.map(v=>v.season))].sort().reverse().map(s=>[s,uploads.find(v=>v.season===s).club])}:null):players.find(p=>p.id===id)}
function allVideos(){return [...uploads,...seed]}
function navButton(target,icon,key){return '<button data-nav="'+target+'">'+icon+' <span>'+t(key)+'</span>'+(target==='following'?'<i id="followCount">'+state.following.length+'</i>':'')+'</button>'}
function renderChrome(){
 document.documentElement.lang=language||'en';
 document.documentElement.dir=locales[language||'en'].dir;
 document.title='Touchline · '+t('hero');
 $('.sidebar').innerHTML='<a class="brand" href="#home"><span class="brandmark">t<span>●</span></span><bdi>touchline</bdi><span class="beta">BETA</span></a><div class="navlabel">'+t('world')+'</div><nav>'+navButton('home','◈','discover')+navButton('players','♙','players')+navButton('following','◎','following')+navButton('saved','▱','saved')+navButton('channel','▣','career')+'</nav><div class="sidebar-card"><span class="tiny">'+t('stage')+'</span><h3>'+t('hero')+'</h3><p>'+t('journey')+'</p><button class="light small" data-action="profile">'+t('create')+' ↗</button></div><div class="sidefoot">'+t('football')+'<br><span>'+t('local')+'</span></div>';
 $('header').innerHTML='<label class="search"><span>⌕</span><input id="search" placeholder="'+esc(t('search'))+'" aria-label="'+esc(t('search'))+'"></label><div class="headright"><button class="language-switch" data-action="language" aria-label="'+t('language')+'">◎ <bdi>'+locales[language||'en'].name+'</bdi>⌄</button><button class="upload" data-action="upload">＋ '+t('upload')+'</button><button class="avatar" data-action="profile" aria-label="'+t('edit')+'">'+initials(state.profile?.name||'You')+'</button></div>';
 $('#search').value=query;
 $('footer').innerHTML='<span><bdi>touchline © 2026</bdi></span><span>'+t('footer')+'</span>';
 $('.mobile-nav').innerHTML=navButton('home','◈','discover')+navButton('players','♙','players')+'<button data-action="upload">＋<span>'+t('upload')+'</span></button>'+navButton('saved','▱','saved')+navButton('channel','▣','career');
 $('#modal .close').setAttribute('aria-label',t('close'));
}
function pageTop(title){return '<div class="page-top"><div><div class="eyebrow">'+t('hero')+'</div><h1>'+title+'</h1></div></div>'}
function card(v){
 const p=player(v.player);
 return '<article class="video-card"><button class="thumbnail" data-watch="'+v.id+'" aria-label="'+esc(v.title)+'"><div class="art '+(v.art||'')+'"></div><span class="thumb-label">'+t(v.local?'ownVideo':'preview')+'</span><bdi class="thumb-season">'+esc(v.season)+'</bdi><span class="thumb-copy"><small>'+label(v.skill)+' / <bdi>'+esc(p?.name||'')+'</bdi></small>'+esc(v.headline||v.title)+'</span><span class="play-icon">▶</span></button><div class="card-info"><button class="player-avatar" data-player="'+v.player+'" style="background:'+(p?.colour||'#cce6ff')+'" aria-label="'+esc(p?.name||'')+'">'+initials(p?.name)+'</button><div><h3><button data-watch="'+v.id+'">'+esc(v.title)+'</button></h3><div class="card-meta"><button data-player="'+v.player+'"><bdi>'+esc(p?.name)+'</bdi> ↗</button><br><bdi>'+esc(v.club)+'</bdi> · '+t(v.local?'device':'sample')+'</div></div><button class="save '+(state.saved.includes(v.id)?'saved':'')+'" data-save="'+v.id+'" aria-label="'+t(state.saved.includes(v.id)?'remove':'save')+'">'+(state.saved.includes(v.id)?'▰':'▱')+'</button></div></article>';
}
function tile(p){return '<button class="player-tile" data-player="'+p.id+'"><span class="arrow">↗</span><span class="player-avatar" style="background:'+p.colour+'">'+initials(p.name)+'</span><h3><bdi>'+esc(p.name)+'</bdi></h3><p>'+label(p.position)+' · '+countryName(p.country)+'<br><bdi>'+esc(p.club)+'</bdi></p></button>'}
function empty(){return '<div class="empty"><div class="eyebrow">'+t('stage')+'</div><h2>'+t('empty')+'</h2><p>'+t('emptyHint')+'</p><button class="light" data-action="'+(state.profile?'upload':'profile')+'">'+t(state.profile?'upload':'create')+' ↗</button></div>'}
function render(){
 document.querySelectorAll('[data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav===page));
 if($('#followCount'))$('#followCount').textContent=state.following.length;
 let html='';
 if(page.startsWith('player:')||page==='channel'){
  const p=player(page==='channel'?'me':page.split(':')[1]);
  if(!p){html=pageTop(t('career'))+empty()}else{
   const own=p.id==='me',videos=allVideos().filter(v=>v.player===p.id&&(chapter==='All'||v.season===chapter));
   html='<button class="back" data-nav="players">← '+t('players')+'</button><div class="profile-banner"><div class="player-avatar">'+initials(p.name)+'</div><div><span class="tiny">'+t(own?'career':'sample')+'</span><h1><bdi>'+esc(p.name)+'</bdi></h1><p>'+label(p.position)+' · <bdi>'+esc(p.club)+'</bdi> · '+countryName(p.country)+'</p></div><button class="light" '+(own?'data-action="profile"':'data-follow="'+p.id+'"')+'>'+t(own?'edit':state.following.includes(p.id)?'following':'follow')+'</button></div><div class="profile-details"><span class="badge">'+t('foot')+': '+label(p.foot)+'</span><span class="badge">'+label(p.position)+'</span><span class="badge">'+t(own?'device':'sample')+'</span></div><div class="section-head"><h2>'+t('archive')+'</h2>'+(own?'<button class="section-link" data-action="upload">＋ '+t('upload')+'</button>':'')+'</div><div class="timeline"><button data-chapter="All" class="'+(chapter==='All'?'selected':'')+'"><strong>'+t('entire')+'</strong></button>'+p.chapters.map(([s,c])=>'<button data-chapter="'+esc(s)+'" class="'+(chapter===s?'selected':'')+'"><strong><bdi>'+esc(s)+'</bdi></strong><span><bdi>'+esc(c)+'</bdi></span></button>').join('')+'</div>'+(videos.length?'<div class="grid">'+videos.map(card).join('')+'</div>':empty())+'<p class="notice">'+t(own?'localHint':'previewHint')+'</p>';
  }
 }else if(page==='players'){
  const shown=[...players,...(state.profile?[player('me')]:[])].filter(p=>(p.name+' '+p.club+' '+p.country+' '+label(p.position)+' '+countryName(p.country)).toLocaleLowerCase().includes(query));
  html=pageTop(t('players'))+'<div class="player-grid">'+shown.map(tile).join('')+'</div>'+(shown.length?'':empty());
 }else{
  let videos=allVideos().filter(v=>{
   const p=player(v.player);
   return (filter==='All highlights'||v.skill===filter)&&((v.title+' '+p?.name+' '+v.club+' '+label(v.skill)+' '+label(p?.position)+' '+v.season).toLocaleLowerCase().includes(query))&&(page!=='saved'||state.saved.includes(v.id))&&(page!=='following'||state.following.includes(v.player));
  });
  if(sort==='season')videos.sort((a,b)=>b.season.localeCompare(a.season));
  if(page==='home'&&!query){
   html=pageTop(t('discover'))+'<section class="hero"><img src="football.jpg" alt=""><div class="hero-content"><span class="tag">'+t('stage')+'</span><h2>'+t('hero')+'<br><em>'+t('football')+'</em></h2><p>'+t('journey')+'</p><div class="hero-actions"><button class="light" data-nav="players">'+t('explore')+' ↗</button><button class="text-button" data-action="profile">'+t('start')+' →</button></div></div></section>';
  }else html=pageTop(t(query?'searchResults':page==='saved'?'saved':'following'));
  html+='<div class="categories">'+['All highlights','Goals','Assists','Skills','Defending','Goalkeeping','Full matches'].map(v=>'<button class="chip '+(filter===v?'active':'')+'" data-filter="'+v+'">'+label(v)+'</button>').join('')+'</div><div class="section-head"><h2>'+t('highlights')+'</h2><select id="sort" aria-label="'+t('highlights')+'"><option value="featured" '+(sort==='featured'?'selected':'')+'>'+t('featured')+'</option><option value="season" '+(sort==='season'?'selected':'')+'>'+t('latest')+'</option></select></div>'+(videos.length?'<div class="grid">'+videos.map(card).join('')+'</div>':empty());
  if(page==='home'&&!query)html+='<hr class="divider"><div class="section-head"><h2>'+t('players')+'</h2><button class="section-link" data-nav="players">'+t('explore')+' ↗</button></div><div class="player-grid">'+players.map(tile).join('')+'</div><section class="callout"><div><h3>'+t('stage')+'</h3><p>'+t('journey')+'</p></div><button class="light small" data-action="profile">'+t('create')+' ↗</button></section>';
 }
 $('#main').innerHTML=html;
}
function openModal(html){if(activeUrl){URL.revokeObjectURL(activeUrl);activeUrl=null}$('#modalBody').innerHTML=html;if(!$('#modal').open)$('#modal').showModal()}
function options(values,selected){return values.map(v=>'<option value="'+v+'" '+(v===selected?'selected':'')+'>'+label(v)+'</option>').join('')}
function profileForm(){
 const p=state.profile||{};
 openModal('<div class="eyebrow">'+t('world')+'</div><h2>'+t(p.name?'edit':'create')+'</h2><p>'+t('localHint')+'</p><form id="profileForm"><div class="form-grid"><label>'+t('name')+'<input name="name" required maxlength="60" autocomplete="name" value="'+esc(p.name||'')+'"></label><label>'+t('country')+'<input name="country" required maxlength="50" autocomplete="country-name" value="'+esc(p.country||'')+'"></label><label>'+t('position')+'<select name="position">'+options(['Forward','Midfielder','Defender','Goalkeeper'],p.position)+'</select></label><label>'+t('foot')+'<select name="foot">'+options(['Right','Left','Both'],p.foot)+'</select></label><label class="full">'+t('club')+'<input name="club" required maxlength="70" value="'+esc(p.club||'')+'"></label></div><button class="light" type="submit">'+t('saveProfile')+' ↗</button></form>');
}
function uploadForm(){
 if(!state.profile){profileForm();toast(t('uploadHint'));return}
 openModal('<div class="eyebrow">'+t('career')+'</div><h2>'+t('upload')+'</h2><p>'+t('localHint')+'</p><form id="uploadForm"><div class="form-grid"><label class="full file-input">'+t('video')+'<input type="file" name="video" accept="video/mp4,video/webm" required></label><label class="full">'+t('title')+'<input name="title" required maxlength="100"></label><label>'+t('season')+'<input name="season" required pattern="[0-9]{4}/[0-9]{2}" placeholder="2025/26" dir="ltr"></label><label>'+t('club')+'<input name="club" required maxlength="70" value="'+esc(state.profile.club)+'"></label><label class="full">'+t('category')+'<select name="skill">'+options(['Goals','Assists','Skills','Defending','Goalkeeping','Full matches'])+'</select></label></div><label class="check"><input type="checkbox" required><span>'+t('permission')+'</span></label><button class="light" type="submit">'+t('saveVideo')+' ↗</button><p id="uploadStatus" role="status"></p></form>');
}
function watch(id){
 const v=allVideos().find(x=>x.id===id);if(!v)return;
 const p=player(v.player);let url=v.blob?URL.createObjectURL(v.blob):null;
 const media=url?'<video src="'+url+'" controls playsinline preload="metadata"></video>':'<div class="watch-placeholder"><div><span class="tiny">'+t('preview')+'</span><h3>'+esc(v.headline)+'</h3><p>'+t('previewHint')+'</p><button class="light small" data-action="upload">'+t('upload')+' ↗</button></div></div>';
 openModal(media+'<h2 style="font-size:29px">'+esc(v.title)+'</h2><p><bdi>'+esc(p.name)+' · '+esc(v.club)+' · '+esc(v.season)+'</bdi> · '+label(v.skill)+'</p><div class="watch-actions"><button class="light small" data-player="'+v.player+'">'+t('archive')+' ↗</button><button data-save="'+id+'" class="small">'+t(state.saved.includes(id)?'remove':'saved')+'</button>'+(v.local?'<button class="small" data-delete="'+id+'">'+t('delete')+'</button>':'')+'</div><p class="notice">'+t(v.local?'localHint':'previewHint')+'</p>');
 activeUrl=url;
}
function navigate(next){page=next;chapter='All';filter='All highlights';query='';$('#search').value='';$('#modal').close();render();window.scrollTo({top:0,behavior:'smooth'})}
function languagePicker(){
 chosenLanguage=language||Object.keys(locales).find(c=>c===(navigator.language||'').split('-')[0])||'en';
 const d=$('#languageDialog');
 if(!language)document.body.classList.add('language-required');
 $('#languageSearch').value='';
 drawLanguages();
 d.showModal();
}
function drawLanguages(){
 const q=$('#languageSearch').value.trim().toLocaleLowerCase();
 let names;try{names=new Intl.DisplayNames(['en'],{type:'language'})}catch{}
 $('#languageOptions').innerHTML=Object.entries(locales).filter(([code,l])=>(l.name+' '+code+' '+(names?.of(code)||'')).toLocaleLowerCase().includes(q)).map(([code,l])=>'<button type="button" class="language-option '+(chosenLanguage===code?'selected':'')+'" data-language="'+code+'" aria-pressed="'+(chosenLanguage===code)+'"><span lang="'+code+'" dir="'+l.dir+'">'+l.name+'</span><small>'+esc(names?.of(code)||code)+'</small><span class="language-check" aria-hidden="true">'+(chosenLanguage===code?'✓':'')+'</span></button>').join('');
 updateLanguagePreview();
}
function updateLanguagePreview(){
 const l=locales[chosenLanguage];
 $('#languageTitle').textContent=l.messages.choose;
 $('#languageHint').textContent=l.messages.chooseHint;
 $('#languageTitle').lang=chosenLanguage;$('#languageTitle').dir=l.dir;
 $('#languageHint').lang=chosenLanguage;$('#languageHint').dir=l.dir;
 $('#languageContinue').textContent=l.messages.continue+' →';
 $('#languageContinue').lang=chosenLanguage;$('#languageContinue').dir=l.dir;
 $('#languageClose').hidden=!language;$('#languageClose').setAttribute('aria-label',l.messages.close);
 $('#languageSearch').placeholder=l.messages.language+' / Language';
 $('#languageSearch').setAttribute('aria-label',l.messages.language+' / Language');
}
document.addEventListener('click',async e=>{
 const b=e.target.closest('button,a');if(!b)return;
 if(b.dataset.language){chosenLanguage=b.dataset.language;drawLanguages();return}
 if(b.id==='languageContinue'){
  language=chosenLanguage;
  try{localStorage.setItem('touchline-language',language)}catch{}
  document.body.classList.remove('language-required');renderChrome();render();
  $('#languageDialog').close();$('.language-switch').focus();return;
 }
 if(b.id==='languageClose'){$('#languageDialog').close();return}
 if(b.dataset.nav){e.preventDefault();navigate(b.dataset.nav)}
 if(b.classList.contains('brand')){e.preventDefault();navigate('home')}
 if(b.dataset.player)navigate('player:'+b.dataset.player);
 if(b.dataset.action){const a=b.dataset.action;if(a==='language')languagePicker();if(a==='profile')profileForm();if(a==='upload')uploadForm()}
 if(b.dataset.filter){filter=b.dataset.filter;render()}
 if(b.dataset.chapter){chapter=b.dataset.chapter;render()}
 if(b.dataset.watch)watch(b.dataset.watch);
 if(b.dataset.follow){const id=b.dataset.follow;state.following=state.following.includes(id)?state.following.filter(x=>x!==id):[...state.following,id];persist();render()}
 if(b.dataset.save){const id=b.dataset.save;state.saved=state.saved.includes(id)?state.saved.filter(x=>x!==id):[...state.saved,id];persist();render();if($('#modal').open)watch(id);toast(t(state.saved.includes(id)?'savedMessage':'removedMessage'))}
 if(b.dataset.delete){const id=b.dataset.delete;try{await dbOp('readwrite',s=>s.delete(id));uploads=uploads.filter(x=>x.id!==id);state.saved=state.saved.filter(x=>x!==id);persist();$('#modal').close();render();toast(t('removedMessage'))}catch{toast(t('saveError'))}}
});
$('#modal .close').onclick=()=>$('#modal').close();
$('#modal').addEventListener('close',()=>{const v=$('#modal video');if(v)v.pause();if(activeUrl)URL.revokeObjectURL(activeUrl);activeUrl=null});
$('#modal').addEventListener('click',e=>{if(e.target===$('#modal')){const r=$('#modal').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('#modal').close()}});
$('#languageDialog').addEventListener('cancel',e=>{if(!language)e.preventDefault()});
$('#languageSearch').addEventListener('input',drawLanguages);
document.addEventListener('input',e=>{if(e.target.id==='search'){query=e.target.value.toLocaleLowerCase();if(page.startsWith('player:')||page==='channel')page='home';render()}});
document.addEventListener('change',e=>{if(e.target.id==='sort'){sort=e.target.value;render()}});
document.addEventListener('submit',async e=>{
 if(e.target.id==='profileForm'){
  e.preventDefault();const f=new FormData(e.target);
  const p={name:f.get('name').trim(),country:f.get('country').trim(),club:f.get('club').trim(),position:f.get('position'),foot:f.get('foot'),colour:'#cce6ff'};
  if(!p.name||!p.country||!p.club){toast(t('required'));return}
  state.profile=p;persist();navigate('channel');renderChrome();render();toast(t('profileMessage'));
 }
 if(e.target.id==='uploadForm'){
  e.preventDefault();const form=e.target,f=new FormData(form),file=f.get('video');
  if(!file?.size||!['video/mp4','video/webm'].includes(file.type)){toast(t('videoError'));return}
  if(file.size>100*1024*1024){toast(t('sizeError'));return}
  const v={id:crypto.randomUUID(),player:'me',title:f.get('title').trim(),season:f.get('season'),club:f.get('club').trim(),skill:f.get('skill'),local:true,blob:file};
  if(!v.title||!v.club){toast(t('required'));return}
  form.querySelector('[type="submit"]').disabled=true;$('#uploadStatus').textContent=t('loading');
  try{await dbOp('readwrite',s=>s.put(v));uploads.unshift(v);navigate('channel');toast(t('uploadMessage'))}
  catch{$('#uploadStatus').textContent=t('saveError');form.querySelector('[type="submit"]').disabled=false}
 }
});
function dbOp(mode,fn){return new Promise((resolve,reject)=>{if(!db){reject();return}const tx=db.transaction('videos',mode),req=fn(tx.objectStore('videos'));tx.oncomplete=()=>resolve(req.result);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error)})}
async function init(){
 renderChrome();render();if(!language)languagePicker();else document.body.classList.remove('language-required');
 try{
  db=await new Promise((resolve,reject)=>{const r=indexedDB.open('touchline-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('videos',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=reject});
  uploads=await dbOp('readonly',s=>s.getAll());render();
 }catch{toast(t('storageError'))}
}
init();
