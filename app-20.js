// FITLP Wikimedia Commons exercise imagery.
// Every workout exercise and warm-up movement has a Commons search query.
// Images are fetched lazily, cached in the browser, and shown with creator/licence credit.
(function(){
  const COMMONS_API = 'https://commons.wikimedia.org/w/api.php';
  const CACHE_PREFIX = 'fitlpCommonsImageV2:';
  const CACHE_MS = 30 * 24 * 60 * 60 * 1000;

  const SEARCH = {
    // Dumbbell
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
    'Dumbbell clean to press':'dumbbell clean and press exercise',
    'Suitcase march':'dumbbell suitcase carry exercise',

    // Kettlebell
    'Kettlebell swings':'kettlebell swing exercise',
    'Kettlebell goblet squat':'kettlebell goblet squat exercise',
    'Kettlebell deadlift':'kettlebell deadlift exercise',
    'Kettlebell reverse lunge':'kettlebell reverse lunge exercise',
    'Kettlebell one-arm row':'one arm kettlebell row exercise',
    'Kettlebell shoulder press':'kettlebell shoulder press exercise',
    'Kettlebell halo':'kettlebell halo exercise',
    'Kettlebell high pull':'kettlebell high pull exercise',

    // Bodyweight
    'Push ups':'push-up exercise fitness',
    'Bicycle crunches':'bicycle crunch exercise',
    'Sit ups':'sit-up exercise fitness',
    'Dead bugs':'dead bug abdominal exercise',
    'Shoulder taps':'plank shoulder tap exercise',
    'Bodyweight squats':'bodyweight squat exercise',
    'Speed squats':'bodyweight squat fitness exercise',
    'Split squats':'split squat exercise',
    'Reverse lunges':'reverse lunge exercise',
    'Glute bridges':'glute bridge exercise',
    'Mountain climbers':'mountain climber exercise fitness',
    'High knees':'high knees exercise fitness',
    'Burpees':'burpee exercise fitness',
    'Squat jumps':'jump squat exercise fitness',

    // Bench
    'Bench step ups':'step-up exercise bench fitness',
    'Bench dips':'bench dip triceps exercise',
    'Elevated push ups':'incline push-up bench exercise',

    // Mobility warm-up
    "Child's pose":"child's pose yoga stretch",
    'Kneeling prayer / lat stretch':'kneeling lat stretch exercise',
    'Cat-cow':'cat cow yoga exercise',
    'Thread the needle':'thread the needle yoga stretch',
    'Downward dog pedal':'downward facing dog yoga pose',
    "World's greatest stretch":'world greatest stretch lunge exercise',
    'Hamstring sweeps':'standing hamstring stretch exercise',
    'Half-kneeling hip flexor stretch':'kneeling hip flexor stretch exercise',

    // Shadow boxing
    'Shadow boxing · movement + jab':'shadow boxing jab training',
    'Shadow boxing · jab-cross + slips':'shadow boxing punch training',
    'Shadow boxing · hooks + uppercuts':'shadow boxing hook uppercut training',
    'Shadow boxing · footwork + combinations':'boxing footwork shadow boxing training',
    'Shadow boxing · free round':'shadow boxing training exercise',

    // 9-minute daily movement routine
    'Lymphatic hops':'jumping exercise warm up fitness',
    'Body waves':'body wave movement exercise',
    'Trunk twists':'standing trunk rotation exercise',
    'Arm swings':'arm swing warm up exercise',
    'Dead arms':'relaxed arm swing warm up exercise',
    'Golf swings':'golf swing movement exercise',
    'Marches':'marching in place exercise',
    'Ballet squats':'plie squat exercise',
    'Horse stance':'horse stance martial arts exercise'
  };

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
    @media(max-width:620px){
      .fitlp-commons-row{grid-template-columns:34px 74px 1fr!important}
      .fitlp-commons-thumb{width:74px;height:74px}
      .fitlp-commons-row .pill{display:none}
      .fitlp-img-credit{font-size:8px}
    }
  `;
  document.head.appendChild(style);

  function plain(html){
    const div=document.createElement('div');
    div.innerHTML=String(html||'');
    return (div.textContent||'').replace(/\s+/g,' ').trim();
  }

  function short(text,max=44){
    const s=String(text||'').replace(/\s+/g,' ').trim();
    return s.length>max ? s.slice(0,max-1).trim()+'…' : s;
  }

  function cacheKey(label){
    return CACHE_PREFIX + label;
  }

  function readCache(label){
    try{
      const data=JSON.parse(localStorage.getItem(cacheKey(label))||'null');
      if(!data || !data.url || !data.page || !data.saved) return null;
      if(Date.now()-data.saved>CACHE_MS) return null;
      return data;
    }catch(e){ return null; }
  }

  function writeCache(label,data){
    try{ localStorage.setItem(cacheKey(label),JSON.stringify({...data,saved:Date.now()})); }catch(e){}
  }

  function searchCommons(label){
    if(!SEARCH[label]) return Promise.resolve(null);
    const cached=readCache(label);
    if(cached) return Promise.resolve(cached);
    if(pending.has(label)) return pending.get(label);

    const params=new URLSearchParams({
      action:'query',
      format:'json',
      origin:'*',
      generator:'search',
      gsrnamespace:'6',
      gsrlimit:'8',
      gsrsearch:SEARCH[label],
      prop:'imageinfo',
      iiprop:'url|mime|extmetadata',
      iiurlwidth:'760'
    });

    const request=fetch(`${COMMONS_API}?${params.toString()}`)
      .then(r=>{ if(!r.ok) throw new Error('Commons request failed'); return r.json(); })
      .then(data=>{
        const pages=Object.values(data?.query?.pages||{})
          .filter(page=>page?.imageinfo?.[0]?.thumburl || page?.imageinfo?.[0]?.url);
        if(!pages.length) return null;

        const page=pages[0];
        const info=page.imageinfo[0];
        const meta=info.extmetadata||{};
        const creator=plain(meta.Artist?.value || meta.Credit?.value || 'Wikimedia Commons contributor');
        const licence=plain(meta.LicenseShortName?.value || meta.UsageTerms?.value || 'Wikimedia Commons licence');
        const result={
          url:info.thumburl || info.url,
          page:info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,
          creator:short(creator,58),
          licence:short(licence,34),
          title:page.title || label
        };
        writeCache(label,result);
        return result;
      })
      .catch(()=>null)
      .finally(()=>pending.delete(label));

    pending.set(label,request);
    return request;
  }

  function rowLabel(row){
    return row.querySelector('.ex-name')?.textContent?.trim() || '';
  }

  function rowTextHost(row){
    return row.querySelector('.ex-name')?.parentElement || row;
  }

  function ensureRowImage(row){
    const label=rowLabel(row);
    if(!SEARCH[label] || row.dataset.commonsBound===label) return;
    row.dataset.commonsBound=label;
    row.classList.add('fitlp-commons-row');

    let img=row.querySelector('.exercise-thumb,.warmup-thumb,.fitlp-commons-thumb');
    if(!img){
      img=document.createElement('img');
      img.className='fitlp-commons-thumb fitlp-commons-loading';
      img.alt=`${label} exercise image`;
      img.loading='lazy';
      const num=row.querySelector('.num');
      if(num) num.insertAdjacentElement('afterend',img);
      else row.prepend(img);
    }else{
      img.classList.add('fitlp-commons-thumb');
    }

    searchCommons(label).then(info=>{
      if(!info || !row.isConnected || rowLabel(row)!==label) return;
      img.src=info.url;
      img.alt=`${label} exercise image`;
      img.classList.remove('fitlp-commons-loading');
      img.title=`${info.creator} · ${info.licence} · Wikimedia Commons`;

      let credit=row.querySelector('.fitlp-img-credit');
      if(!credit){
        credit=document.createElement('a');
        credit.className='fitlp-img-credit';
        credit.target='_blank';
        credit.rel='noopener noreferrer';
        rowTextHost(row).appendChild(credit);
      }
      credit.href=info.page;
      credit.textContent=`Image: ${short(info.creator,30)} · ${info.licence} · Commons`;
    });
  }

  function hydrateRows(){
    document.querySelectorAll('#workoutList .exercise-row,#warmupList .exercise-row').forEach(ensureRowImage);
  }

  function ensureTimerCredit(wrap){
    let credit=document.getElementById('fitlpTimerImageCredit');
    if(!credit){
      credit=document.createElement('div');
      credit.id='fitlpTimerImageCredit';
      wrap.appendChild(credit);
    }
    return credit;
  }

  function renderCommonsTimerImage(){
    const label=current?.label || '';
    if(!SEARCH[label] || ['rest','done','transition'].includes(current?.phase)) return;

    const wrap=document.getElementById('timerWarmupImage');
    const img=document.getElementById('timerWarmupImageEl');
    if(!wrap || !img) return;
    wrap.classList.add('fitlp-commons-timer');
    const credit=ensureTimerCredit(wrap);
    const expected=current;

    // Keep an existing inline illustration visible while the Commons photo is loading.
    if(current?.image){
      img.src=current.image;
      img.alt=label;
      wrap.style.display='flex';
    }

    searchCommons(label).then(info=>{
      if(!info || current!==expected || current?.label!==label) return;
      img.src=info.url;
      img.alt=`${label} exercise image`;
      img.title=`${info.creator} · ${info.licence} · Wikimedia Commons`;
      wrap.style.display='flex';
      credit.innerHTML=`Image: <a href="${info.page}" target="_blank" rel="noopener noreferrer">${escapeHtml(short(info.creator,38))}</a> · ${escapeHtml(info.licence)} · Wikimedia Commons`;
    });
  }

  function prefetchCurrentWorkout(){
    (currentWorkout?.exercises||[]).forEach(ex=>{ if(SEARCH[ex.name]) searchCommons(ex.name); });
  }

  const previousRenderPreview=renderPreview;
  renderPreview=function(){
    previousRenderPreview();
    hydrateRows();
    prefetchCurrentWorkout();
  };

  const previousRenderWarmupTab=renderWarmupTab;
  renderWarmupTab=function(){
    previousRenderWarmupTab();
    hydrateRows();
  };

  const previousRenderTimer=renderTimer;
  renderTimer=function(){
    previousRenderTimer();
    renderCommonsTimerImage();
  };

  // Re-run the visible lists once this patch has loaded.
  hydrateRows();
  prefetchCurrentWorkout();
  if(typeof renderWarmupTab==='function') renderWarmupTab();
})();
