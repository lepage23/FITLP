// FITLP Wikimedia Commons exercise imagery.
// Every workout exercise and warm-up movement has a Commons search query.
// Results are relevance-checked before they replace the built-in illustration.
(function(){
  const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
  const CACHE_PREFIX = 'fitlpCommonsImageV3:';
  const CACHE_MS = 30 * 24 * 60 * 60 * 1000;

  const SEARCH = {
    'Hammer curls':'dumbbell hammer curl exercise',
    'Regular curls':'dumbbell biceps curl exercise',
    'Pinwheel curls':'cross body hammer curl dumbbell exercise',
    'Single-arm shoulder press':'single arm dumbbell shoulder press exercise',
    'Single-arm floor press':'dumbbell floor press exercise',
    'One-arm dumbbell row':'one arm dumbbell row exercise',
    'Dumbbell goblet squat':'dumbbell goblet squat exercise',
    'Dumbbell Romanian deadlift':'dumbbell Romanian deadlift exercise',
    'Dumbbell reverse lunge':'dumbbell reverse lunge exercise',
    'Dumbbell thruster':'dumbbell thruster exercise',
    'Dumbbell clean to press':'dumbbell clean press exercise',
    'Suitcase march':'dumbbell suitcase carry exercise',
    'Kettlebell swings':'kettlebell swing exercise',
    'Kettlebell goblet squat':'kettlebell goblet squat exercise',
    'Kettlebell deadlift':'kettlebell deadlift exercise',
    'Kettlebell reverse lunge':'kettlebell reverse lunge exercise',
    'Kettlebell one-arm row':'one arm kettlebell row exercise',
    'Kettlebell shoulder press':'kettlebell shoulder press exercise',
    'Kettlebell halo':'kettlebell halo exercise',
    'Kettlebell high pull':'kettlebell high pull exercise',
    'Push ups':'push-up exercise fitness',
    'Bicycle crunches':'bicycle crunch exercise',
    'Sit ups':'sit-up exercise fitness',
    'Dead bugs':'dead bug abdominal exercise',
    'Shoulder taps':'plank shoulder tap exercise',
    'Bodyweight squats':'bodyweight squat exercise',
    'Speed squats':'squat exercise fitness',
    'Split squats':'split squat exercise',
    'Reverse lunges':'reverse lunge exercise',
    'Glute bridges':'glute bridge exercise',
    'Mountain climbers':'mountain climber exercise fitness',
    'High knees':'high knees exercise fitness',
    'Burpees':'burpee exercise fitness',
    'Squat jumps':'jump squat exercise fitness',
    'Bench step ups':'step up bench fitness exercise',
    'Bench dips':'bench dip triceps exercise',
    'Elevated push ups':'incline push-up bench exercise',
    "Child's pose":"child's pose yoga stretch",
    'Kneeling prayer / lat stretch':'kneeling lat stretch exercise',
    'Cat-cow':'cat cow yoga pose',
    'Thread the needle':'thread the needle yoga pose',
    'Downward dog pedal':'downward facing dog yoga pose',
    "World's greatest stretch":'world greatest stretch lunge exercise',
    'Hamstring sweeps':'standing hamstring stretch exercise',
    'Half-kneeling hip flexor stretch':'kneeling hip flexor stretch exercise',
    'Shadow boxing · movement + jab':'Mike Tyson boxer boxing',
    'Shadow boxing · jab-cross + slips':'Tyson Fury boxer boxing',
    'Shadow boxing · hooks + uppercuts':'Canelo Alvarez boxer boxing',
    'Shadow boxing · footwork + combinations':'Julio Cesar Chavez boxer boxing',
    'Shadow boxing · free round':'Mexican luchador lucha libre wrestler',
    'Lymphatic hops':'jumping warm up exercise fitness',
    'Body waves':'body wave movement exercise',
    'Trunk twists':'standing trunk rotation exercise',
    'Arm swings':'arm swing warm up exercise',
    'Dead arms':'relaxed arm swing warm up exercise',
    'Golf swings':'golf swing movement exercise',
    'Marches':'marching in place exercise',
    'Ballet squats':'plie squat exercise',
    'Horse stance':'horse stance martial arts exercise'
  };

  const REQUIRED = {
    'Hammer curls':['hammer','curl'], 'Regular curls':['curl'], 'Pinwheel curls':['curl'],
    'Single-arm shoulder press':['shoulder','press'], 'Single-arm floor press':['floor','press'],
    'One-arm dumbbell row':['dumbbell','row'], 'Dumbbell goblet squat':['goblet','squat'],
    'Dumbbell Romanian deadlift':['deadlift'], 'Dumbbell reverse lunge':['lunge'],
    'Dumbbell thruster':['thruster'], 'Dumbbell clean to press':['clean','press'], 'Suitcase march':['carry'],
    'Kettlebell swings':['kettlebell','swing'], 'Kettlebell goblet squat':['kettlebell','squat'],
    'Kettlebell deadlift':['kettlebell','deadlift'], 'Kettlebell reverse lunge':['kettlebell','lunge'],
    'Kettlebell one-arm row':['kettlebell','row'], 'Kettlebell shoulder press':['kettlebell','press'],
    'Kettlebell halo':['kettlebell'], 'Kettlebell high pull':['kettlebell'],
    'Push ups':['push'], 'Bicycle crunches':['crunch'], 'Sit ups':['sit'], 'Dead bugs':['dead bug'],
    'Shoulder taps':['shoulder','tap'], 'Bodyweight squats':['squat'], 'Speed squats':['squat'],
    'Split squats':['split','squat'], 'Reverse lunges':['lunge'], 'Glute bridges':['glute','bridge'],
    'Mountain climbers':['mountain climber'], 'High knees':['high knee'], 'Burpees':['burpee'],
    'Squat jumps':['squat','jump'], 'Bench step ups':['step'], 'Bench dips':['dip'], 'Elevated push ups':['push'],
    "Child's pose":["child's pose"], 'Kneeling prayer / lat stretch':['lat','stretch'], 'Cat-cow':['cat','cow'],
    'Thread the needle':['thread','needle'], 'Downward dog pedal':['downward','dog'],
    "World's greatest stretch":['stretch'], 'Hamstring sweeps':['hamstring'],
    'Half-kneeling hip flexor stretch':['hip','flexor'],
    'Lymphatic hops':['jump'], 'Body waves':['body','wave'], 'Trunk twists':['trunk'], 'Arm swings':['arm'],
    'Dead arms':['arm'], 'Golf swings':['golf'], 'Marches':['march'], 'Ballet squats':['squat'], 'Horse stance':['horse','stance']
  };

  const CHAMPIONS = {
    'Shadow boxing · movement + jab':{must:['mike tyson'],name:'Mike Tyson'},
    'Shadow boxing · jab-cross + slips':{must:['tyson fury'],name:'Tyson Fury'},
    'Shadow boxing · hooks + uppercuts':{must:['canelo','alvarez'],name:'Canelo Álvarez'},
    'Shadow boxing · footwork + combinations':{must:['julio','chavez'],name:'Julio César Chávez'},
    'Shadow boxing · free round':{must:['luchador'],name:'Mexican luchador'}
  };

  const BAD = /\b(book|books|cover|scan|scanned|page|pages|volume|manual|catalog|catalogue|poster|postcard|stamp|stamps|newspaper|magazine|textile|fabric|carpet|rug|wallpaper|sheet music|score|map|diagram|chart|advertisement|advert|packaging|label|record sleeve|album cover)\b/i;
  const pending = new Map();

  const style = document.createElement('style');
  style.textContent = `
    .fitlp-commons-row{grid-template-columns:34px 92px 1fr auto!important}
    .fitlp-commons-thumb{width:92px;height:92px;object-fit:cover;border-radius:13px;background:var(--dark,#f5f5f4);border:1px solid var(--line,#343a46);display:block}
    .fitlp-img-credit{display:block;margin-top:5px;font-size:9px;line-height:1.3;color:var(--muted,#7c8491)!important;text-decoration:none;opacity:.9}
    .fitlp-img-credit:hover{text-decoration:underline}
    #timerWarmupImage.fitlp-commons-timer{display:flex;flex-direction:column;align-items:center;gap:7px}
    #timerWarmupImage.fitlp-commons-timer img{width:min(390px,84vw);max-height:310px;object-fit:contain;background:var(--panel,#f5f5f4);border-color:var(--line,#303542)}
    #fitlpTimerImageCredit{font-size:10px;line-height:1.35;color:var(--muted,#7c8491);max-width:min(390px,84vw)}
    #fitlpTimerImageCredit a{color:inherit;text-decoration:underline}
    .fitlp-commons-loading{opacity:.45}
    @media(max-width:620px){.fitlp-commons-row{grid-template-columns:34px 74px 1fr!important}.fitlp-commons-thumb{width:74px;height:74px}.fitlp-commons-row .pill{display:none}.fitlp-img-credit{font-size:8px}}
  `;
  document.head.appendChild(style);

  function plain(html){
    const div=document.createElement('div');
    div.innerHTML=String(html||'');
    return (div.textContent||'').replace(/\s+/g,' ').trim();
  }
  function norm(text){ return plain(text).toLowerCase().replace(/[–—_]/g,' ').replace(/[^a-z0-9áéíóúñü' -]/g,' ').replace(/\s+/g,' ').trim(); }
  function short(text,max=44){ const s=String(text||'').replace(/\s+/g,' ').trim(); return s.length>max?s.slice(0,max-1).trim()+'…':s; }
  function cacheKey(label){ return CACHE_PREFIX+label; }
  function readCache(label){
    try{ const d=JSON.parse(localStorage.getItem(cacheKey(label))||'null'); if(!d?.url||!d?.page||!d?.saved||Date.now()-d.saved>CACHE_MS)return null; return d; }catch(e){return null;}
  }
  function writeCache(label,data){ try{localStorage.setItem(cacheKey(label),JSON.stringify({...data,saved:Date.now()}));}catch(e){} }

  function candidateText(page){
    const info=page?.imageinfo?.[0]||{};
    const m=info.extmetadata||{};
    return norm([page?.title,m.ObjectName?.value,m.ImageDescription?.value,m.Categories?.value,m.DepictedPeople?.value,m.Credit?.value].join(' '));
  }
  function scoreCandidate(label,page){
    const text=candidateText(page);
    const info=page?.imageinfo?.[0]||{};
    if(!text || BAD.test(text)) return -999;
    if(info.mime && !/^image\//i.test(info.mime)) return -999;

    const champ=CHAMPIONS[label];
    if(champ){
      const hits=champ.must.filter(x=>text.includes(norm(x))).length;
      if(hits<champ.must.length) return -999;
      let s=20+hits*8;
      if(/boxing|boxer|fight|ring|champion/.test(text)) s+=8;
      if(/portrait|press conference|arrival|ceremony/.test(text)) s-=2;
      return s;
    }

    const required=REQUIRED[label]||[];
    let matches=0;
    required.forEach(term=>{if(text.includes(norm(term)))matches++;});
    if(required.length && matches===0) return -999;

    let score=matches*7;
    const queryTokens=norm(SEARCH[label]).split(' ').filter(w=>w.length>3&&!['exercise','fitness','training','warm'].includes(w));
    queryTokens.forEach(w=>{if(text.includes(w))score++;});
    if(/exercise|fitness|workout|training|yoga|boxing|sport|gym/.test(text))score+=3;
    if(/illustration|demonstration|performing|doing|pose|stance/.test(text))score+=2;
    return score;
  }

  function searchCommons(label){
    if(!SEARCH[label]) return Promise.resolve(null);
    const cached=readCache(label); if(cached)return Promise.resolve(cached);
    if(pending.has(label))return pending.get(label);

    const q=SEARCH[label]+' -book -scan -page -textile -poster';
    const params=new URLSearchParams({action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'20',gsrsearch:q,prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'760'});
    const request=fetch(`${COMMONS_API}?${params.toString()}`)
      .then(r=>{if(!r.ok)throw new Error('Commons request failed');return r.json();})
      .then(data=>{
        const pages=Object.values(data?.query?.pages||{}).filter(p=>p?.imageinfo?.[0]?.thumburl||p?.imageinfo?.[0]?.url);
        const ranked=pages.map(page=>({page,score:scoreCandidate(label,page)})).filter(x=>x.score>=4).sort((a,b)=>b.score-a.score);
        if(!ranked.length)return null;
        const page=ranked[0].page, info=page.imageinfo[0], meta=info.extmetadata||{};
        const creator=plain(meta.Artist?.value||meta.Credit?.value||'Wikimedia Commons contributor');
        const licence=plain(meta.LicenseShortName?.value||meta.UsageTerms?.value||'Wikimedia Commons licence');
        const result={url:info.thumburl||info.url,page:info.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,creator:short(creator,58),licence:short(licence,34),title:page.title||label,featured:CHAMPIONS[label]?.name||''};
        writeCache(label,result); return result;
      }).catch(()=>null).finally(()=>pending.delete(label));
    pending.set(label,request); return request;
  }

  function rowLabel(row){return row.querySelector('.ex-name')?.textContent?.trim()||'';}
  function rowTextHost(row){return row.querySelector('.ex-name')?.parentElement||row;}
  function ensureRowImage(row){
    const label=rowLabel(row); if(!SEARCH[label]||row.dataset.commonsBound===label)return;
    row.dataset.commonsBound=label; row.classList.add('fitlp-commons-row');
    let img=row.querySelector('.exercise-thumb,.warmup-thumb,.fitlp-commons-thumb');
    if(!img){ img=document.createElement('img'); img.className='fitlp-commons-thumb fitlp-commons-loading'; img.alt=`${label} exercise image`; img.loading='lazy'; const num=row.querySelector('.num'); if(num)num.insertAdjacentElement('afterend',img); else row.prepend(img); }
    else img.classList.add('fitlp-commons-thumb');

    searchCommons(label).then(info=>{
      if(!info||!row.isConnected||rowLabel(row)!==label){img.classList.remove('fitlp-commons-loading');return;}
      img.src=info.url; img.alt=CHAMPIONS[label]?`${info.featured} boxing image`:`${label} exercise image`; img.classList.remove('fitlp-commons-loading'); img.title=`${info.creator} · ${info.licence} · Wikimedia Commons`;
      let credit=row.querySelector('.fitlp-img-credit');
      if(!credit){credit=document.createElement('a');credit.className='fitlp-img-credit';credit.target='_blank';credit.rel='noopener noreferrer';rowTextHost(row).appendChild(credit);}
      credit.href=info.page; credit.textContent=`Image: ${info.featured?info.featured+' · ':''}${short(info.creator,28)} · ${info.licence} · Commons`;
    });
  }
  function hydrateRows(){document.querySelectorAll('#workoutList .exercise-row,#warmupList .exercise-row').forEach(ensureRowImage);}
  function ensureTimerCredit(wrap){let c=document.getElementById('fitlpTimerImageCredit');if(!c){c=document.createElement('div');c.id='fitlpTimerImageCredit';wrap.appendChild(c);}return c;}
  function renderCommonsTimerImage(){
    const label=current?.label||''; if(!SEARCH[label]||['rest','done','transition'].includes(current?.phase))return;
    const wrap=document.getElementById('timerWarmupImage'),img=document.getElementById('timerWarmupImageEl'); if(!wrap||!img)return;
    wrap.classList.add('fitlp-commons-timer'); const credit=ensureTimerCredit(wrap),expected=current;
    if(current?.image){img.src=current.image;img.alt=label;wrap.style.display='flex';}
    searchCommons(label).then(info=>{if(!info||current!==expected||current?.label!==label)return;img.src=info.url;img.alt=CHAMPIONS[label]?`${info.featured} boxing image`:`${label} exercise image`;img.title=`${info.creator} · ${info.licence} · Wikimedia Commons`;wrap.style.display='flex';credit.innerHTML=`Image: <a href="${info.page}" target="_blank" rel="noopener noreferrer">${escapeHtml((info.featured?info.featured+' · ':'')+short(info.creator,32))}</a> · ${escapeHtml(info.licence)} · Wikimedia Commons`;});
  }
  function prefetchCurrentWorkout(){(currentWorkout?.exercises||[]).forEach(ex=>{if(SEARCH[ex.name])searchCommons(ex.name);});}

  const previousRenderPreview=renderPreview;
  renderPreview=function(){previousRenderPreview();hydrateRows();prefetchCurrentWorkout();};
  const previousRenderWarmupTab=renderWarmupTab;
  renderWarmupTab=function(){previousRenderWarmupTab();hydrateRows();};
  const previousRenderTimer=renderTimer;
  renderTimer=function(){previousRenderTimer();renderCommonsTimerImage();};

  hydrateRows(); prefetchCurrentWorkout(); if(typeof renderWarmupTab==='function')renderWarmupTab();
})();