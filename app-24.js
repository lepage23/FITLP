// FITLP motion-first, multi-source real media.
// Preference: verified looping Commons video/GIF -> verified Openverse photo -> verified Commons photo.
// Openverse broadens still imagery beyond Wikimedia to open-licensed sources such as Flickr and museum collections.
(function(){
  const COMMONS='https://commons.wikimedia.org/w/api.php';
  const OPENVERSE='https://api.openverse.org/v1/images/';
  const CACHE='fitlpMediaV1:';
  const CACHE_MS=14*24*60*60*1000;
  const ALLOWED_LICENSES=new Set(['cc0','pdm','by','by-sa']);
  const mem=new Map(),pending=new Map();

  const R={
    'Hammer curls':{q:'hammer curl dumbbell',g:[['hammer','curl']]},
    'Regular curls':{q:'biceps curl dumbbell',g:[['biceps','curl'],['bicep','curl']],reject:['hammer']},
    'Pinwheel curls':{q:'cross body hammer curl dumbbell',g:[['cross','body','curl'],['pinwheel','curl']]},
    'Single-arm shoulder press':{q:'single arm dumbbell shoulder press',g:[['shoulder','press']]},
    'Single-arm floor press':{q:'dumbbell floor press',g:[['floor','press']]},
    'One-arm dumbbell row':{q:'one arm dumbbell row',g:[['dumbbell','row'],['one','arm','row']]},
    'Dumbbell goblet squat':{q:'dumbbell goblet squat',g:[['goblet','squat']]},
    'Dumbbell Romanian deadlift':{q:'dumbbell Romanian deadlift',g:[['romanian','deadlift']]},
    'Dumbbell reverse lunge':{q:'dumbbell reverse lunge',g:[['reverse','lunge']]},
    'Dumbbell thruster':{q:'dumbbell thruster',g:[['dumbbell','thruster'],['thruster']]},
    'Dumbbell clean to press':{q:'dumbbell clean press',g:[['clean','press']]},
    'Suitcase march':{q:'dumbbell suitcase carry',g:[['suitcase','carry'],['suitcase','march']]},
    'Kettlebell swings':{q:'kettlebell swing',g:[['kettlebell','swing']]},
    'Kettlebell goblet squat':{q:'kettlebell goblet squat',g:[['kettlebell','goblet','squat'],['goblet','squat']]},
    'Kettlebell deadlift':{q:'kettlebell deadlift',g:[['kettlebell','deadlift']]},
    'Kettlebell reverse lunge':{q:'kettlebell reverse lunge',g:[['kettlebell','lunge'],['reverse','lunge']]},
    'Kettlebell one-arm row':{q:'kettlebell one arm row',g:[['kettlebell','row']]},
    'Kettlebell shoulder press':{q:'kettlebell shoulder press',g:[['kettlebell','press']]},
    'Kettlebell halo':{q:'kettlebell halo',g:[['kettlebell','halo']]},
    'Kettlebell high pull':{q:'kettlebell high pull',g:[['kettlebell','high','pull']]},
    'Push ups':{q:'push up exercise',g:[['push','up'],['pushup']]},
    'Bicycle crunches':{q:'bicycle crunch exercise',g:[['bicycle','crunch']]},
    'Sit ups':{q:'sit up exercise',g:[['sit','up'],['situp']]},
    'Dead bugs':{q:'dead bug exercise',g:[['dead','bug']]},
    'Shoulder taps':{q:'plank shoulder tap',g:[['shoulder','tap']]},
    'Bodyweight squats':{q:'bodyweight squat exercise',g:[['squat']],reject:['chair','box squat','assisted','machine']},
    'Speed squats':{q:'bodyweight squat exercise',g:[['squat']],reject:['chair','box squat','assisted','machine']},
    'Split squats':{q:'split squat exercise',g:[['split','squat']]},
    'Reverse lunges':{q:'reverse lunge exercise',g:[['reverse','lunge']]},
    'Glute bridges':{q:'glute bridge exercise',g:[['glute','bridge']]},
    'Mountain climbers':{q:'mountain climber exercise',g:[['mountain','climber']]},
    'High knees':{q:'high knees exercise',g:[['high','knee']]},
    'Burpees':{q:'burpee exercise',g:[['burpee']]},
    'Squat jumps':{q:'jump squat exercise',g:[['jump','squat'],['squat','jump']]},
    'Bench step ups':{q:'bench step up exercise',g:[['step','up']]},
    'Bench dips':{q:'bench dip triceps',g:[['bench','dip'],['triceps','dip']]},
    'Elevated push ups':{q:'incline push up bench',g:[['incline','push'],['elevated','push']]},
    "Child's pose":{q:"child's pose yoga",g:[["child's",'pose'],['child','pose']]},
    'Kneeling prayer / lat stretch':{q:'kneeling lat stretch',g:[['lat','stretch'],['kneeling','stretch']]},
    'Cat-cow':{q:'cat cow yoga',g:[['cat','cow']]},
    'Thread the needle':{q:'thread the needle yoga',g:[['thread','needle']]},
    'Downward dog pedal':{q:'downward facing dog yoga',g:[['downward','dog']]},
    "World's greatest stretch":{q:'world greatest stretch exercise',g:[['greatest','stretch'],['lunge','stretch']]},
    'Hamstring sweeps':{q:'hamstring sweep stretch',g:[['hamstring']]},
    'Half-kneeling hip flexor stretch':{q:'kneeling hip flexor stretch',g:[['hip','flexor']]},
    'Shadow boxing · movement + jab':{q:'Mike Tyson boxing',g:[['mike','tyson']],featured:'Mike Tyson'},
    'Shadow boxing · jab-cross + slips':{q:'Tyson Fury boxing',g:[['tyson','fury']],featured:'Tyson Fury'},
    'Shadow boxing · hooks + uppercuts':{q:'Canelo Alvarez boxing',g:[['canelo'],['saul','alvarez']],featured:'Canelo Álvarez'},
    'Shadow boxing · footwork + combinations':{q:'Julio Cesar Chavez boxer',g:[['julio','cesar','chavez'],['julio','chavez']],featured:'Julio César Chávez'},
    'Shadow boxing · free round':{q:'Mexican luchador lucha libre',g:[['luchador'],['lucha','libre']],featured:'Mexican luchador'},
    'Lymphatic hops':{q:'jumping warm up exercise',g:[['jump']]},
    'Body waves':{q:'body wave movement exercise',g:[['body','wave']]},
    'Trunk twists':{q:'trunk rotation exercise',g:[['trunk','rotation'],['trunk','twist']]},
    'Arm swings':{q:'arm swing warm up',g:[['arm','swing']]},
    'Dead arms':{q:'relaxed arm swing warm up',g:[['arm','swing']]},
    'Golf swings':{q:'golf swing',g:[['golf','swing']]},
    'Marches':{q:'marching in place exercise',g:[['march']]},
    'Ballet squats':{q:'plie squat exercise',g:[['plie','squat'],['plié','squat']]},
    'Horse stance':{q:'horse stance martial arts',g:[['horse','stance']]}
  };

  const BAD=/\b(book|cover|scan|page|manual|catalog|poster|postcard|stamp|newspaper|magazine|textile|fabric|carpet|rug|wallpaper|sheet music|map|advertisement|packaging|label|album cover|chair squat|seated exercise)\b/i;
  const norm=s=>String(s||'').toLowerCase().replace(/[–—_]/g,' ').replace(/[^a-z0-9áéíóúñü' -]/g,' ').replace(/\s+/g,' ').trim();
  const plain=html=>{const d=document.createElement('div');d.innerHTML=String(html||'');return (d.textContent||'').replace(/\s+/g,' ').trim();};
  const short=(s,n=42)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s;};
  const matches=(rule,text)=>rule.g.some(group=>group.every(w=>text.includes(norm(w)))) && !(rule.reject||[]).some(x=>text.includes(norm(x)));

  function readCache(label){try{const d=JSON.parse(localStorage.getItem(CACHE+label)||'null');return d?.url&&Date.now()-d.saved<CACHE_MS?d:null;}catch(e){return null;}}
  function writeCache(label,d){try{localStorage.setItem(CACHE+label,JSON.stringify({...d,saved:Date.now()}));}catch(e){}}

  async function commonsMotion(label){
    const rule=R[label]; if(!rule)return null;
    const qs=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'50',gsrsearch:rule.q,prop:'imageinfo',iiprop:'url|mime|extmetadata'});
    const data=await fetch(`${COMMONS}?${qs}`).then(r=>r.ok?r.json():Promise.reject());
    const pages=Object.values(data?.query?.pages||{});
    const usable=[];
    for(const page of pages){
      const info=page?.imageinfo?.[0],mime=String(info?.mime||'');
      if(!info?.url || !(/^video\//i.test(mime)||/image\/gif/i.test(mime)))continue;
      const meta=info.extmetadata||{};
      const text=norm([page.title,plain(meta.ImageDescription?.value),plain(meta.Categories?.value),plain(meta.DepictedPeople?.value)].join(' '));
      if(BAD.test(text)||!matches(rule,text))continue;
      usable.push({page,info,score:(norm(page.title).split(' ').filter(w=>norm(rule.q).includes(w)).length)+(rule.featured?10:0)});
    }
    usable.sort((a,b)=>b.score-a.score);
    if(!usable.length)return null;
    const {page,info}=usable[0],m=info.extmetadata||{};
    return {kind:/image\/gif/i.test(info.mime||'')?'gif':'video',url:info.url,page:info.descriptionurl||'',creator:short(plain(m.Artist?.value||m.Credit?.value||'Wikimedia Commons contributor'),54),license:short(plain(m.LicenseShortName?.value||m.UsageTerms?.value||'Commons licence'),30),source:'Wikimedia Commons',featured:rule.featured||''};
  }

  async function openverseStill(label){
    const rule=R[label]; if(!rule)return null;
    const qs=new URLSearchParams({q:rule.q,page_size:'30',mature:'false'});
    const data=await fetch(`${OPENVERSE}?${qs}`,{headers:{Accept:'application/json'}}).then(r=>r.ok?r.json():Promise.reject());
    const candidates=(data?.results||[]).filter(x=>{
      if(!x?.thumbnail&&!x?.url)return false;
      if(x.watermarked)return false;
      if(!ALLOWED_LICENSES.has(String(x.license||'').toLowerCase()))return false;
      const tags=Array.isArray(x.tags)?x.tags.map(t=>typeof t==='string'?t:t?.name).filter(Boolean).join(' '):'';
      const text=norm([x.title,tags,x.creator,x.source].join(' '));
      return !BAD.test(text)&&matches(rule,text);
    });
    if(!candidates.length)return null;
    const x=candidates[0];
    return {kind:'image',url:x.thumbnail||x.url,full:x.url||x.thumbnail,page:x.foreign_landing_url||x.detail_url||x.url||'',creator:short(x.creator||'Openverse contributor',54),license:String(x.license||'').toUpperCase(),source:x.source?`Openverse · ${x.source}`:'Openverse',featured:rule.featured||''};
  }

  async function commonsStill(label){
    const rule=R[label]; if(!rule)return null;
    const qs=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'40',gsrsearch:rule.q+' -book -scan -page -poster',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'900'});
    const data=await fetch(`${COMMONS}?${qs}`).then(r=>r.ok?r.json():Promise.reject());
    const ranked=[];
    for(const page of Object.values(data?.query?.pages||{})){
      const info=page?.imageinfo?.[0],mime=String(info?.mime||''); if(!info?.url||!/^image\//i.test(mime)||/gif/i.test(mime))continue;
      const m=info.extmetadata||{};const text=norm([page.title,plain(m.ImageDescription?.value),plain(m.Categories?.value),plain(m.DepictedPeople?.value)].join(' '));
      if(BAD.test(text)||!matches(rule,text))continue;
      ranked.push({page,info,score:/jpeg|jpg|webp/i.test(mime)?5:2});
    }
    ranked.sort((a,b)=>b.score-a.score); if(!ranked.length)return null;
    const {page,info}=ranked[0],m=info.extmetadata||{};
    return {kind:'image',url:info.thumburl||info.url,full:info.url,page:info.descriptionurl||'',creator:short(plain(m.Artist?.value||m.Credit?.value||'Wikimedia Commons contributor'),54),license:short(plain(m.LicenseShortName?.value||m.UsageTerms?.value||'Commons licence'),30),source:'Wikimedia Commons',featured:rule.featured||''};
  }

  function resolveMedia(label){
    if(!R[label])return Promise.resolve(null);
    if(mem.has(label))return Promise.resolve(mem.get(label));
    const c=readCache(label);if(c){mem.set(label,c);return Promise.resolve(c);}
    if(pending.has(label))return pending.get(label);
    const p=(async()=>{
      let out=null;
      try{out=await commonsMotion(label);}catch(e){}
      if(!out)try{out=await openverseStill(label);}catch(e){}
      if(!out)try{out=await commonsStill(label);}catch(e){}
      if(out){mem.set(label,out);writeCache(label,out);} return out;
    })().finally(()=>pending.delete(label));
    pending.set(label,p);return p;
  }

  const css=document.createElement('style');
  css.textContent=`
    /* app-24 owns exercise media. Never show the old generated/loose thumbnails. */
    #workoutList .exercise-thumb,#workoutList .warmup-thumb,#workoutList .fitlp-commons-thumb,
    #warmupList .exercise-thumb,#warmupList .warmup-thumb,#warmupList .fitlp-commons-thumb{display:none!important}
    #timerWarmupImage{display:none!important}
    #fitlpRestPhoto{display:none!important}
    .fitlp-media-row{grid-template-columns:34px 104px 1fr auto!important}
    .fitlp-media-slot{width:104px;height:92px;border-radius:13px;overflow:hidden;border:1px solid var(--line);background:var(--panel2);position:relative}
    .fitlp-media-slot img,.fitlp-media-slot video{width:100%;height:100%;display:block;object-fit:cover}
    .fitlp-media-motion{position:absolute;right:5px;bottom:5px;background:rgba(0,0,0,.68);color:#fff;border-radius:999px;padding:3px 6px;font-size:8px;font-weight:900;letter-spacing:.05em}
    .fitlp-media-credit{display:block;margin-top:5px;font-size:9px!important;color:var(--muted)!important;text-decoration:none;line-height:1.3}
    .fitlp-media-credit:hover{text-decoration:underline}
    #fitlpMotionTimer{display:none;flex-direction:column;align-items:center;gap:7px;margin:0 auto 18px}
    #fitlpMotionTimer.show{display:flex}
    #fitlpMotionTimer img,#fitlpMotionTimer video{width:min(460px,86vw);height:min(330px,42vh);object-fit:contain;border-radius:18px;border:1px solid var(--line);background:var(--panel);box-shadow:0 12px 30px var(--season-shadow,rgba(0,0,0,.12))}
    #fitlpMotionTimer .fitlp-media-credit{max-width:min(460px,86vw);text-align:center}
    #fitlpRandomRest24{display:none;flex-direction:column;align-items:center;gap:7px;margin:0 auto 18px}
    #fitlpRandomRest24.show{display:flex}
    #fitlpRandomRest24 img{width:min(460px,86vw);height:min(300px,38vh);object-fit:cover;border-radius:18px;border:1px solid var(--line);background:var(--panel);box-shadow:0 12px 30px var(--season-shadow,rgba(0,0,0,.12));transition:opacity .25s ease}
    @media(max-width:620px){.fitlp-media-row{grid-template-columns:34px 76px 1fr!important}.fitlp-media-slot{width:76px;height:76px}.fitlp-media-row .pill{display:none}}
  `;
  document.head.appendChild(css);

  function labelOf(row){return row.querySelector('.ex-name')?.textContent?.trim()||'';}
  function hostOf(row){return row.querySelector('.ex-name')?.parentElement||row;}
  function renderInto(slot,info,label,small=false){
    slot.innerHTML='';
    if(info.kind==='video'){
      const v=document.createElement('video');v.src=info.url;v.autoplay=true;v.muted=true;v.loop=true;v.playsInline=true;v.preload=small?'metadata':'auto';v.setAttribute('aria-label',`${label} looping demonstration`);slot.appendChild(v);
      const b=document.createElement('span');b.className='fitlp-media-motion';b.textContent='LOOP';slot.appendChild(b);v.play().catch(()=>{});
    }else{
      const img=document.createElement('img');img.src=info.url;img.alt=`${label} image`;img.loading=small?'lazy':'eager';slot.appendChild(img);
      if(info.kind==='gif'){const b=document.createElement('span');b.className='fitlp-media-motion';b.textContent='GIF';slot.appendChild(b);}
    }
  }

  function hydrateRow(row){
    const label=labelOf(row);if(!R[label])return;
    if(row.dataset.fitlpMedia24===label)return;row.dataset.fitlpMedia24=label;
    row.classList.add('fitlp-media-row');
    let slot=row.querySelector('.fitlp-media-slot');
    if(!slot){slot=document.createElement('div');slot.className='fitlp-media-slot';const num=row.querySelector('.num');num?num.insertAdjacentElement('afterend',slot):row.prepend(slot);}
    slot.style.visibility='hidden';
    resolveMedia(label).then(info=>{
      if(!info||!row.isConnected||labelOf(row)!==label){slot.remove();row.classList.remove('fitlp-media-row');return;}
      renderInto(slot,info,label,true);slot.style.visibility='visible';
      let credit=row.querySelector('.fitlp-media-credit');if(!credit){credit=document.createElement('a');credit.className='fitlp-media-credit';credit.target='_blank';credit.rel='noopener noreferrer';hostOf(row).appendChild(credit);}
      credit.href=info.page||'#';credit.textContent=`${info.kind==='video'||info.kind==='gif'?'Loop':'Image'}: ${info.featured?info.featured+' · ':''}${short(info.creator,28)} · ${info.license} · ${info.source}`;
    });
  }
  function hydrateAll(){document.querySelectorAll('#workoutList .exercise-row,#warmupList .exercise-row').forEach(hydrateRow);}

  const exercise=document.getElementById('exercise');
  const motion=document.createElement('div');motion.id='fitlpMotionTimer';
  const rest=document.createElement('div');rest.id='fitlpRandomRest24';rest.innerHTML='<img alt="Random open-licensed rest picture"><a class="fitlp-media-credit" target="_blank" rel="noopener noreferrer"></a>';
  if(exercise){exercise.parentNode.insertBefore(motion,exercise);exercise.parentNode.insertBefore(rest,exercise);}
  let timerToken=0;
  function updateTimerMedia(){
    const token=++timerToken,label=current?.label||'',phase=current?.phase||'';
    motion.classList.remove('show');motion.innerHTML='';
    if(['rest','done','transition'].includes(phase)||!R[label])return;
    resolveMedia(label).then(info=>{
      if(!info||token!==timerToken||current?.label!==label)return;
      const slot=document.createElement('div');slot.style.position='relative';renderInto(slot,info,label,false);motion.appendChild(slot);
      const credit=document.createElement('a');credit.className='fitlp-media-credit';credit.target='_blank';credit.rel='noopener noreferrer';credit.href=info.page||'#';credit.textContent=`${info.kind==='video'||info.kind==='gif'?'Loop':'Image'}: ${info.featured?info.featured+' · ':''}${short(info.creator,36)} · ${info.license} · ${info.source}`;motion.appendChild(credit);motion.classList.add('show');
    });
  }

  const REST_TOPICS=['deep sea creature','brutalist architecture','ancient ruins','macro insect','volcano landscape','space telescope','old machinery','fossil museum','lighthouse coast','cave interior','storm clouds','shipwreck','traditional mask','strange statue','desert landscape','microscopy','vintage vehicle','unusual bird','astronomy observatory','street photography'];
  let restPool=[],restIndex=0,restInterval=null,restLoading=null;
  async function buildRestPool(){
    if(restPool.length>=12)return restPool;if(restLoading)return restLoading;
    restLoading=(async()=>{
      const topics=[...REST_TOPICS].sort(()=>Math.random()-.5).slice(0,4);
      const batches=await Promise.all(topics.map(async q=>{
        try{const data=await fetch(`${OPENVERSE}?${new URLSearchParams({q,page_size:'12',mature:'false'})}`).then(r=>r.ok?r.json():Promise.reject());return (data.results||[]).filter(x=>!x.watermarked&&ALLOWED_LICENSES.has(String(x.license||'').toLowerCase())&&(x.thumbnail||x.url)).map(x=>({url:x.thumbnail||x.url,page:x.foreign_landing_url||x.url||'',credit:`${short(x.creator||'Openverse contributor',30)} · ${String(x.license||'').toUpperCase()} · Openverse${x.source?' · '+x.source:''}`}));}catch(e){return[];}
      }));
      restPool=batches.flat().sort(()=>Math.random()-.5).slice(0,30);restLoading=null;return restPool;
    })();return restLoading;
  }
  async function showRestImage(){
    if(current?.phase!=='rest')return;await buildRestPool();if(current?.phase!=='rest'||!restPool.length)return;
    const item=restPool[restIndex++%restPool.length],img=rest.querySelector('img'),a=rest.querySelector('a');img.style.opacity='0';
    const pre=new Image();pre.onload=()=>{if(current?.phase!=='rest')return;img.src=item.url;a.href=item.page||'#';a.textContent=`Random picture: ${item.credit}`;requestAnimationFrame(()=>img.style.opacity='1');};pre.src=item.url;
  }
  function updateRest(){
    if(current?.phase==='rest'){
      rest.classList.add('show');motion.classList.remove('show');
      if(!restInterval){showRestImage();restInterval=setInterval(showRestImage,4000);}
    }else{rest.classList.remove('show');if(restInterval){clearInterval(restInterval);restInterval=null;}}
  }

  const oldPreview=renderPreview;renderPreview=function(){oldPreview();hydrateAll();};
  const oldWarm=renderWarmupTab;renderWarmupTab=function(){oldWarm();hydrateAll();};
  const oldTimer=renderTimer;renderTimer=function(){oldTimer();updateTimerMedia();updateRest();};
  const obs=new MutationObserver(()=>hydrateAll());['workoutList','warmupList'].forEach(id=>{const el=document.getElementById(id);if(el)obs.observe(el,{childList:true,subtree:true});});
  hydrateAll();buildRestPool();
})();