// FITLP verified real imagery + larger news rails + random rest photos.
(function(){
  const COMMONS_API='https://commons.wikimedia.org/w/api.php';
  const VERIFIED_CACHE='fitlpVerifiedCommonsV1:';
  const VERIFIED_MS=30*24*60*60*1000;
  const verified=new Map();
  const pending=new Map();

  // Search phrases and title checks. A Commons result is only allowed on screen when
  // its actual file title clearly describes the requested exercise/person.
  const RULES={
    'Hammer curls':{q:'hammer curl dumbbell',groups:[['hammer','curl']]},
    'Regular curls':{q:'biceps curl dumbbell',groups:[['biceps','curl'],['bicep','curl']]},
    'Pinwheel curls':{q:'cross body hammer curl dumbbell',groups:[['cross','body','hammer','curl'],['pinwheel','curl']]},
    'Single-arm shoulder press':{q:'dumbbell shoulder press',groups:[['shoulder','press']]},
    'Single-arm floor press':{q:'dumbbell floor press',groups:[['floor','press']]},
    'One-arm dumbbell row':{q:'one arm dumbbell row',groups:[['dumbbell','row'],['one','arm','row']]},
    'Dumbbell goblet squat':{q:'dumbbell goblet squat',groups:[['goblet','squat']]},
    'Dumbbell Romanian deadlift':{q:'dumbbell Romanian deadlift',groups:[['romanian','deadlift'],['dumbbell','deadlift']]},
    'Dumbbell reverse lunge':{q:'dumbbell reverse lunge',groups:[['reverse','lunge'],['dumbbell','lunge']]},
    'Dumbbell thruster':{q:'dumbbell thruster',groups:[['dumbbell','thruster'],['thruster']]},
    'Dumbbell clean to press':{q:'dumbbell clean press',groups:[['clean','press']]},
    'Suitcase march':{q:'dumbbell suitcase carry',groups:[['suitcase','carry'],['suitcase','march']]},
    'Kettlebell swings':{q:'kettlebell swing',groups:[['kettlebell','swing']]},
    'Kettlebell goblet squat':{q:'kettlebell goblet squat',groups:[['kettlebell','goblet','squat'],['goblet','squat']]},
    'Kettlebell deadlift':{q:'kettlebell deadlift',groups:[['kettlebell','deadlift']]},
    'Kettlebell reverse lunge':{q:'kettlebell reverse lunge',groups:[['kettlebell','lunge'],['reverse','lunge']]},
    'Kettlebell one-arm row':{q:'kettlebell row',groups:[['kettlebell','row']]},
    'Kettlebell shoulder press':{q:'kettlebell shoulder press',groups:[['kettlebell','press'],['kettlebell','shoulder']]},
    'Kettlebell halo':{q:'kettlebell halo',groups:[['kettlebell','halo']]},
    'Kettlebell high pull':{q:'kettlebell high pull',groups:[['kettlebell','high','pull']]},
    'Push ups':{q:'push-up exercise',groups:[['push','up'],['pushup']]},
    'Bicycle crunches':{q:'bicycle crunch exercise',groups:[['bicycle','crunch']]},
    'Sit ups':{q:'sit-up exercise',groups:[['sit','up'],['situp']]},
    'Dead bugs':{q:'dead bug exercise',groups:[['dead','bug']]},
    'Shoulder taps':{q:'plank shoulder tap exercise',groups:[['shoulder','tap']]},
    'Bodyweight squats':{q:'bodyweight squat exercise',groups:[['squat']]},
    'Speed squats':{q:'bodyweight squat exercise',groups:[['squat']]},
    'Split squats':{q:'split squat exercise',groups:[['split','squat']]},
    'Reverse lunges':{q:'reverse lunge exercise',groups:[['reverse','lunge'],['lunge']]},
    'Glute bridges':{q:'glute bridge exercise',groups:[['glute','bridge']]},
    'Mountain climbers':{q:'mountain climber exercise',groups:[['mountain','climber']]},
    'High knees':{q:'high knees exercise',groups:[['high','knee']]},
    'Burpees':{q:'burpee exercise',groups:[['burpee']]},
    'Squat jumps':{q:'jump squat exercise',groups:[['jump','squat'],['squat','jump']]},
    'Bench step ups':{q:'bench step up exercise',groups:[['step','up']]},
    'Bench dips':{q:'bench dip exercise',groups:[['bench','dip'],['triceps','dip']]},
    'Elevated push ups':{q:'incline push-up exercise',groups:[['incline','push'],['elevated','push']]},

    "Child's pose":{q:"child's pose yoga",groups:[["child's",'pose'],['child','pose']]},
    'Kneeling prayer / lat stretch':{q:'kneeling lat stretch',groups:[['lat','stretch'],['kneeling','stretch']]},
    'Cat-cow':{q:'cat cow yoga pose',groups:[['cat','cow']]},
    'Thread the needle':{q:'thread the needle yoga',groups:[['thread','needle']]},
    'Downward dog pedal':{q:'downward facing dog yoga',groups:[['downward','dog']]},
    "World's greatest stretch":{q:'world greatest stretch exercise',groups:[['greatest','stretch'],['lunge','stretch']]},
    'Hamstring sweeps':{q:'hamstring stretch exercise',groups:[['hamstring','stretch']]},
    'Half-kneeling hip flexor stretch':{q:'kneeling hip flexor stretch',groups:[['hip','flexor','stretch']]},

    // Real, existing Commons images of champions / lucha libre for shadow-boxing rounds.
    'Shadow boxing · movement + jab':{q:'Mike Tyson boxing',groups:[['mike','tyson']],featured:'Mike Tyson'},
    'Shadow boxing · jab-cross + slips':{q:'Tyson Fury boxing',groups:[['tyson','fury']],featured:'Tyson Fury'},
    'Shadow boxing · hooks + uppercuts':{q:'Canelo Alvarez boxing',groups:[['canelo'],['saul','alvarez']],featured:'Canelo Álvarez'},
    'Shadow boxing · footwork + combinations':{q:'Julio Cesar Chavez boxer',groups:[['julio','cesar','chavez'],['julio','chavez']],featured:'Julio César Chávez'},
    'Shadow boxing · free round':{q:'Mexican luchador lucha libre',groups:[['luchador'],['lucha','libre']],featured:'Mexican luchador'},

    'Lymphatic hops':{q:'jumping exercise warm up',groups:[['jump']]},
    'Body waves':{q:'body wave exercise',groups:[['body','wave']]},
    'Trunk twists':{q:'trunk rotation exercise',groups:[['trunk','rotation'],['trunk','twist']]},
    'Arm swings':{q:'arm swing exercise',groups:[['arm','swing']]},
    'Dead arms':{q:'arm swing warm up',groups:[['arm','swing']]},
    'Golf swings':{q:'golf swing',groups:[['golf','swing']]},
    'Marches':{q:'marching in place exercise',groups:[['march']]},
    'Ballet squats':{q:'plie squat exercise',groups:[['plie','squat'],['plié','squat']]},
    'Horse stance':{q:'horse stance martial arts',groups:[['horse','stance']]}
  };

  const BAD=/\b(book|books|cover|scan|scanned|page|pages|volume|manual|catalog|catalogue|poster|postcard|stamp|newspaper|magazine|textile|fabric|carpet|rug|wallpaper|sheet music|score|map|diagram of anatomy|advertisement|packaging|label|record sleeve|album cover)\b/i;
  const norm=s=>String(s||'').toLowerCase().replace(/[–—_]/g,' ').replace(/[^a-z0-9áéíóúñü' -]/g,' ').replace(/\s+/g,' ').trim();
  const plain=html=>{const d=document.createElement('div');d.innerHTML=String(html||'');return (d.textContent||'').replace(/\s+/g,' ').trim();};
  const short=(s,n=42)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s;};

  function cacheRead(label){
    try{const d=JSON.parse(localStorage.getItem(VERIFIED_CACHE+label)||'null');if(!d?.url||!d?.saved||Date.now()-d.saved>VERIFIED_MS)return null;return d;}catch(e){return null;}
  }
  function cacheWrite(label,d){try{localStorage.setItem(VERIFIED_CACHE+label,JSON.stringify({...d,saved:Date.now()}));}catch(e){}}

  function titleMatches(label,page){
    const rule=RULES[label];
    if(!rule)return false;
    const title=norm(String(page?.title||'').replace(/^File:/i,''));
    if(!title||BAD.test(title))return false;
    return rule.groups.some(group=>group.every(word=>title.includes(norm(word))));
  }

  function scorePage(label,page){
    if(!titleMatches(label,page))return -999;
    const info=page?.imageinfo?.[0];
    if(!info?.url && !info?.thumburl)return -999;
    if(info?.mime && !/^image\//i.test(info.mime))return -999;
    const m=info.extmetadata||{};
    const desc=plain(m.ImageDescription?.value||'');
    if(BAD.test(desc))return -999;
    const title=norm(page.title);
    const q=norm(RULES[label].q).split(' ').filter(x=>x.length>2);
    let score=20;
    q.forEach(w=>{if(title.includes(w))score+=2;});
    // Prefer photographs/raster images, then genuine sourced diagrams if that's what Commons has.
    if(/image\/(jpeg|jpg|webp)/i.test(info.mime||''))score+=7;
    if(/image\/png/i.test(info.mime||''))score+=4;
    if(/image\/svg/i.test(info.mime||''))score+=1;
    if(/exercise|fitness|training|boxing|yoga|sport|workout/i.test(desc))score+=3;
    return score;
  }

  function verifiedCommons(label){
    if(!RULES[label])return Promise.resolve(null);
    if(verified.has(label))return Promise.resolve(verified.get(label));
    const cached=cacheRead(label);if(cached){verified.set(label,cached);return Promise.resolve(cached);}
    if(pending.has(label))return pending.get(label);

    const rule=RULES[label];
    const params=new URLSearchParams({
      action:'query',format:'json',origin:'*',generator:'search',gsrnamespace:'6',gsrlimit:'35',
      gsrsearch:rule.q+' -book -scan -page -textile -poster',prop:'imageinfo',
      iiprop:'url|mime|extmetadata',iiurlwidth:'900'
    });
    const p=fetch(`${COMMONS_API}?${params}`)
      .then(r=>r.ok?r.json():Promise.reject())
      .then(data=>{
        const ranked=Object.values(data?.query?.pages||{}).map(page=>({page,score:scorePage(label,page)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
        if(!ranked.length)return null;
        const page=ranked[0].page,info=page.imageinfo[0],m=info.extmetadata||{};
        const creator=plain(m.Artist?.value||m.Credit?.value||'Wikimedia Commons contributor');
        const licence=plain(m.LicenseShortName?.value||m.UsageTerms?.value||'Wikimedia Commons licence');
        const out={
          url:info.thumburl||info.url,
          page:info.descriptionurl||`https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g,'_'))}`,
          creator:short(creator,54),licence:short(licence,30),title:page.title,featured:rule.featured||''
        };
        verified.set(label,out);cacheWrite(label,out);return out;
      }).catch(()=>null).finally(()=>pending.delete(label));
    pending.set(label,p);return p;
  }

  const css=document.createElement('style');
  css.textContent=`
    /* Hide anything from the older loose image search until this verifier approves it. */
    #workoutList .exercise-row[data-fitlp-verified="pending"] .exercise-thumb,
    #workoutList .exercise-row[data-fitlp-verified="pending"] .warmup-thumb,
    #workoutList .exercise-row[data-fitlp-verified="pending"] .fitlp-commons-thumb,
    #warmupList .exercise-row[data-fitlp-verified="pending"] .exercise-thumb,
    #warmupList .exercise-row[data-fitlp-verified="pending"] .warmup-thumb,
    #warmupList .exercise-row[data-fitlp-verified="pending"] .fitlp-commons-thumb{visibility:hidden!important}
    .fitlp-verified-note{font-size:9px;color:var(--muted)!important;margin-top:5px}

    /* Bigger news rails, positioned beside the central workout rather than at screen corners. */
    @media(min-width:1500px){
      #timerScreen .fitlp-news-rail{display:block!important;top:105px!important;width:440px!important}
      #timerScreen .fitlp-news-left{left:auto!important;right:calc(50% + 340px)!important}
      #timerScreen .fitlp-news-right{right:auto!important;left:calc(50% + 340px)!important}
      #timerScreen .fitlp-news-card{min-height:270px!important;padding:28px 30px!important;border-radius:22px!important}
      #timerScreen .fitlp-news-source{font-size:18px!important;margin-bottom:20px!important}
      #timerScreen .fitlp-news-headline{font-size:25px!important;line-height:1.34!important;font-weight:800!important}
      #timerScreen .fitlp-news-count{font-size:13px!important;margin-top:20px!important}
    }
    @media(min-width:1800px){
      #timerScreen .fitlp-news-rail{width:500px!important}
      #timerScreen .fitlp-news-left{right:calc(50% + 360px)!important}
      #timerScreen .fitlp-news-right{left:calc(50% + 360px)!important}
      #timerScreen .fitlp-news-headline{font-size:28px!important}
    }

    .fitlp-rest-photo{display:none;flex-direction:column;align-items:center;gap:6px;margin:0 0 18px}
    .fitlp-rest-photo.show{display:flex}
    .fitlp-rest-photo img{width:min(430px,86vw);height:270px;object-fit:cover;border:1px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:0 12px 30px var(--season-shadow,rgba(0,0,0,.12));transition:opacity .28s ease}
    .fitlp-rest-photo small{font-size:9px;color:var(--muted)}
    @media(max-width:620px){.fitlp-rest-photo img{height:210px}}
  `;
  document.head.appendChild(css);

  function getRowLabel(row){return row.querySelector('.ex-name')?.textContent?.trim()||'';}
  function getRowImg(row){return row.querySelector('.fitlp-commons-thumb,.exercise-thumb,.warmup-thumb');}
  function rowTextHost(row){return row.querySelector('.ex-name')?.parentElement||row;}

  function verifyRow(row){
    const label=getRowLabel(row);if(!RULES[label])return;
    if(row.dataset.fitlpVerified==='ok'&&verified.has(label)){
      const img=getRowImg(row),info=verified.get(label);if(img&&img.src!==info.url)img.src=info.url;return;
    }
    if(row.dataset.fitlpVerified==='pending')return;
    row.dataset.fitlpVerified='pending';
    verifiedCommons(label).then(info=>{
      if(!row.isConnected||getRowLabel(row)!==label)return;
      const img=getRowImg(row);
      if(!info){
        row.dataset.fitlpVerified='none';
        if(img)img.style.display='none';
        const old=row.querySelector('.fitlp-img-credit');if(old)old.style.display='none';
        let note=row.querySelector('.fitlp-verified-note');
        if(!note){note=document.createElement('div');note.className='fitlp-verified-note';rowTextHost(row).appendChild(note);}
        note.textContent='No verified real image found yet';
        return;
      }
      row.dataset.fitlpVerified='ok';
      if(img){img.style.display='block';img.style.visibility='visible';img.src=info.url;img.alt=`${label} image`;img.title=`${info.title} · ${info.creator} · ${info.licence}`;}
      let credit=row.querySelector('.fitlp-img-credit');
      if(!credit){credit=document.createElement('a');credit.className='fitlp-img-credit';credit.target='_blank';credit.rel='noopener noreferrer';rowTextHost(row).appendChild(credit);}
      credit.style.display='block';credit.href=info.page;credit.textContent=`Image: ${info.featured?info.featured+' · ':''}${short(info.creator,28)} · ${info.licence} · Commons`;
    });
  }
  function verifyAllRows(){document.querySelectorAll('#workoutList .exercise-row,#warmupList .exercise-row').forEach(verifyRow);}

  // Keep old async search results from replacing our verified image later.
  const listObserver=new MutationObserver(muts=>{
    muts.forEach(m=>{
      const row=(m.target.nodeType===1?m.target:m.target.parentElement)?.closest?.('.exercise-row');
      if(!row)return;
      const label=getRowLabel(row),info=verified.get(label);
      if(info&&row.dataset.fitlpVerified==='ok'){
        const img=getRowImg(row);if(img&&img.src!==info.url)img.src=info.url;
      }else if(row.dataset.fitlpVerified!=='pending')verifyRow(row);
    });
  });
  ['workoutList','warmupList'].forEach(id=>{const el=document.getElementById(id);if(el)listObserver.observe(el,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});});

  const oldPreview=renderPreview;
  renderPreview=function(){oldPreview();verifyAllRows();};
  const oldWarm=renderWarmupTab;
  renderWarmupTab=function(){oldWarm();verifyAllRows();};

  function enforceVerifiedTimerImage(){
    const label=current?.label||'';
    if(!RULES[label]||['rest','done','transition'].includes(current?.phase))return;
    const wrap=document.getElementById('timerWarmupImage'),img=document.getElementById('timerWarmupImageEl');
    if(!wrap||!img)return;
    const expected=current;
    // Never flash the old generated/loose result while verification is happening.
    wrap.style.display='none';
    verifiedCommons(label).then(info=>{
      if(!info||current!==expected||current?.label!==label)return;
      img.src=info.url;img.alt=`${label} image`;img.title=`${info.title} · ${info.creator} · ${info.licence}`;wrap.style.display='flex';
      let c=document.getElementById('fitlpTimerImageCredit');
      if(!c){c=document.createElement('div');c.id='fitlpTimerImageCredit';wrap.appendChild(c);}
      c.innerHTML=`Image: <a href="${info.page}" target="_blank" rel="noopener noreferrer">${escapeHtml(info.featured||short(info.creator,38))}</a> · ${escapeHtml(info.licence)} · Wikimedia Commons`;
    });
  }

  // ----- Random high-quality Commons photos during REST -----
  const exerciseEl=document.getElementById('exercise');
  const restWrap=document.createElement('div');
  restWrap.id='fitlpRestPhoto';restWrap.className='fitlp-rest-photo';
  restWrap.innerHTML='<img id="fitlpRestPhotoImg" alt="Random Wikimedia Commons featured picture"><small>Random Wikimedia Commons featured picture</small>';
  if(exerciseEl)exerciseEl.parentNode.insertBefore(restWrap,exerciseEl);
  const restImg=restWrap.querySelector('img');
  let restTimer=null,restRequest=0,lastRestUrl='';

  function api(params){
    return fetch(`${COMMONS_API}?${new URLSearchParams({format:'json',origin:'*',...params})}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json();});
  }
  function randomPastDate(){
    const start=new Date(2012,0,1).getTime(),end=Date.now()-86400000;
    const d=new Date(start+Math.random()*(end-start));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  async function randomPotdPhoto(){
    for(let tries=0;tries<4;tries++){
      try{
        const date=randomPastDate();
        const ex=await api({action:'expandtemplates',text:`{{Potd/${date}}}`,prop:'wikitext'});
        let filename=String(ex?.expandtemplates?.wikitext||'').trim().replace(/^\[\[:?(?:File|Image):/i,'').replace(/\]\]$/,'').replace(/^(?:File|Image):/i,'');
        if(filename.includes('|'))filename=filename.split('|')[0];
        if(!filename||/no[_ ]image/i.test(filename))continue;
        const q=await api({action:'query',prop:'imageinfo',iiprop:'url|mime',iiurlwidth:'1000',titles:`File:${filename}`});
        const page=Object.values(q?.query?.pages||{})[0],info=page?.imageinfo?.[0];
        if(!info||!/image\/(jpeg|jpg|png|webp)/i.test(info.mime||''))continue;
        return {url:info.thumburl||info.url,page:info.descriptionurl||`https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename.replace(/ /g,'_'))}`};
      }catch(e){}
    }
    return null;
  }
  async function swapRestPhoto(){
    if(current?.phase!=='rest')return;
    const req=++restRequest;
    const p=await randomPotdPhoto();
    if(!p||req!==restRequest||current?.phase!=='rest')return;
    if(p.url===lastRestUrl)return swapRestPhoto();
    lastRestUrl=p.url;
    restImg.style.opacity='0';
    const preload=new Image();
    preload.onload=()=>{
      if(req!==restRequest||current?.phase!=='rest')return;
      restImg.src=p.url;restImg.onclick=()=>window.open(p.page,'_blank','noopener');restImg.style.cursor='pointer';
      requestAnimationFrame(()=>restImg.style.opacity='1');
    };
    preload.src=p.url;
  }
  function updateRestPhotos(){
    if(current?.phase==='rest'){
      restWrap.classList.add('show');
      if(!restTimer){swapRestPhoto();restTimer=setInterval(swapRestPhoto,4000);}
    }else{
      restWrap.classList.remove('show');
      if(restTimer){clearInterval(restTimer);restTimer=null;}
      restRequest++;
    }
  }

  const oldTimer=renderTimer;
  renderTimer=function(){oldTimer();enforceVerifiedTimerImage();updateRestPhotos();};

  verifyAllRows();
})();
