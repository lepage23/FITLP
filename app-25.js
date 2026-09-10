// FITLP reliability patch: robust random rest photos + quick Push ups / Sit ups includes.
(function(){
  const OPENVERSE='https://api.openverse.org/v1/images/';
  const COMMONS='https://commons.wikimedia.org/w/api.php';
  const ALLOWED=new Set(['cc0','pdm','by','by-sa']);

  const css=document.createElement('style');
  css.textContent=`
    .fitlp-quick-includes{margin:4px 0 15px;padding:12px 13px;border:1px solid var(--line);border-radius:13px;background:var(--dark)}
    .fitlp-quick-includes-title{font-size:12px;font-weight:850;color:var(--text);margin-bottom:8px}
    .fitlp-quick-includes-row{display:flex;gap:8px;flex-wrap:wrap}
    .fitlp-quick-include{flex:1;min-width:150px;padding:10px 12px;border-radius:11px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font-weight:850}
    .fitlp-quick-include.active{background:var(--work)!important;color:var(--primary-ink)!important;border-color:var(--work)!important}
    .fitlp-quick-includes-help{font-size:10px;color:var(--muted);margin-top:7px}

    #fitlpRandomRest24{display:none!important}
    #fitlpReliableRest25{display:none;flex-direction:column;align-items:center;gap:7px;margin:0 auto 18px}
    #fitlpReliableRest25.show{display:flex}
    #fitlpReliableRest25 img{width:min(430px,86vw);height:270px;object-fit:cover;border:1px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:0 12px 30px var(--season-shadow,rgba(0,0,0,.12));transition:opacity .25s ease}
    #fitlpReliableRest25 a{font-size:9px;color:var(--muted)!important;text-decoration:none;max-width:min(430px,86vw);line-height:1.3}
    #fitlpReliableRest25 a:hover{text-decoration:underline}
    @media(max-width:620px){#fitlpReliableRest25 img{height:210px}.fitlp-quick-include{min-width:0}}
  `;
  document.head.appendChild(css);

  // ---------- Quick include buttons ----------
  const must=document.getElementById('mustInclude');
  if(must){
    const field=must.closest('.field');
    const grid=field?.closest('.grid');
    if(grid && !document.getElementById('fitlpQuickIncludes')){
      const box=document.createElement('div');
      box.id='fitlpQuickIncludes';
      box.className='fitlp-quick-includes';
      box.innerHTML=`
        <div class="fitlp-quick-includes-title">Quick include</div>
        <div class="fitlp-quick-includes-row">
          <button type="button" class="fitlp-quick-include" data-exercise="Push ups">Include push ups</button>
          <button type="button" class="fitlp-quick-include" data-exercise="Sit ups">Include sit ups</button>
        </div>
        <div class="fitlp-quick-includes-help">Push ups is handy for your 100-a-day challenge. These buttons guarantee the movement is included in the generated workout.</div>`;
      grid.insertAdjacentElement('afterend',box);

      function parts(){
        return must.value.split(/[,;\n]+/).map(x=>x.trim()).filter(Boolean);
      }
      function has(name){return parts().some(x=>x.toLowerCase()===name.toLowerCase());}
      function sync(){
        box.querySelectorAll('.fitlp-quick-include').forEach(btn=>btn.classList.toggle('active',has(btn.dataset.exercise)));
      }
      function toggle(name){
        let list=parts();
        const index=list.findIndex(x=>x.toLowerCase()===name.toLowerCase());
        if(index>=0)list.splice(index,1);else list.push(name);
        must.value=list.join(', ');
        must.dispatchEvent(new Event('input',{bubbles:true}));
        must.dispatchEvent(new Event('change',{bubbles:true}));
        sync();
        if(typeof generateWorkout==='function')generateWorkout();
      }
      box.addEventListener('click',e=>{
        const btn=e.target.closest('.fitlp-quick-include');
        if(btn)toggle(btn.dataset.exercise);
      });
      must.addEventListener('input',sync);
      sync();
    }
  }

  // ---------- Reliable random rest photos ----------
  const exercise=document.getElementById('exercise');
  if(!exercise)return;

  const wrap=document.createElement('div');
  wrap.id='fitlpReliableRest25';
  wrap.innerHTML='<img alt="Random open-licensed rest picture" referrerpolicy="no-referrer"><a target="_blank" rel="noopener noreferrer"></a>';
  exercise.parentNode.insertBefore(wrap,exercise);
  const img=wrap.querySelector('img');
  const credit=wrap.querySelector('a');

  const TOPICS=['deep sea creature','brutalist architecture','ancient ruins','macro insect','volcano landscape','space telescope','old machinery','fossil museum','lighthouse coast','cave interior','storm clouds','shipwreck','traditional mask','strange statue','desert landscape','microscopy','vintage vehicle','unusual bird','astronomy observatory','street photography','castle ruins','iceberg','steam locomotive','jellyfish','old scientific instrument'];
  let pool=[],poolLoading=null,poolIndex=0,interval=null,requestId=0,lastUrl='';

  const short=(s,n=34)=>{s=String(s||'').replace(/\s+/g,' ').trim();return s.length>n?s.slice(0,n-1).trim()+'…':s;};
  const secure=u=>/^https:\/\//i.test(String(u||''));

  async function loadOpenversePool(){
    if(pool.length>=18)return pool;
    if(poolLoading)return poolLoading;
    poolLoading=(async()=>{
      const topics=[...TOPICS].sort(()=>Math.random()-.5).slice(0,6);
      const batches=await Promise.all(topics.map(async q=>{
        try{
          const url=`${OPENVERSE}?${new URLSearchParams({q,page_size:'15',mature:'false'})}`;
          const r=await fetch(url,{headers:{Accept:'application/json'},cache:'no-store'});
          if(!r.ok)throw new Error();
          const data=await r.json();
          return (data.results||[]).filter(x=>{
            const lic=String(x.license||'').toLowerCase();
            return !x.watermarked&&ALLOWED.has(lic)&&(secure(x.thumbnail)||secure(x.url));
          }).map(x=>({
            urls:[x.thumbnail,x.url].filter(secure).filter((v,i,a)=>a.indexOf(v)===i),
            page:x.foreign_landing_url||x.detail_url||x.url||'',
            credit:`${short(x.creator||'Openverse contributor')} · ${String(x.license||'').toUpperCase()} · ${x.source||'Openverse'}`
          }));
        }catch(e){return[];}
      }));
      pool=batches.flat().sort(()=>Math.random()-.5).slice(0,60);
      poolLoading=null;
      return pool;
    })();
    return poolLoading;
  }

  function commonsApi(params){
    return fetch(`${COMMONS}?${new URLSearchParams({format:'json',origin:'*',...params})}`,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error();return r.json();});
  }
  function randomDate(){
    const start=new Date(2013,0,1).getTime(),end=Date.now()-86400000;
    const d=new Date(start+Math.random()*(end-start));
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }
  async function commonsFallback(){
    for(let i=0;i<5;i++){
      try{
        const date=randomDate();
        const ex=await commonsApi({action:'expandtemplates',text:`{{Potd/${date}}}`,prop:'wikitext'});
        let filename=String(ex?.expandtemplates?.wikitext||'').trim().replace(/^\[\[:?(?:File|Image):/i,'').replace(/\]\]$/,'').replace(/^(?:File|Image):/i,'');
        if(filename.includes('|'))filename=filename.split('|')[0];
        if(!filename||/no[_ ]image/i.test(filename))continue;
        const q=await commonsApi({action:'query',prop:'imageinfo',iiprop:'url|mime|extmetadata',iiurlwidth:'1000',titles:`File:${filename}`});
        const page=Object.values(q?.query?.pages||{})[0],info=page?.imageinfo?.[0];
        if(!info||!secure(info.thumburl||info.url)||!/image\/(jpeg|jpg|png|webp)/i.test(info.mime||''))continue;
        const m=info.extmetadata||{};
        const creator=String(m.Artist?.value||m.Credit?.value||'Wikimedia Commons contributor').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
        return {urls:[info.thumburl||info.url],page:info.descriptionurl||'',credit:`${short(creator)} · ${m.LicenseShortName?.value||'Commons licence'} · Wikimedia Commons`};
      }catch(e){}
    }
    return null;
  }

  function tryUrls(item,token,index=0){
    return new Promise(resolve=>{
      if(!item?.urls?.length||index>=item.urls.length)return resolve(false);
      const url=item.urls[index];
      const pre=new Image();
      pre.referrerPolicy='no-referrer';
      pre.onload=()=>{
        if(token!==requestId||current?.phase!=='rest')return resolve(false);
        img.style.opacity='0';
        img.referrerPolicy='no-referrer';
        img.src=url;
        img.alt='Random open-licensed rest picture';
        credit.href=item.page||'#';
        credit.textContent=`Random picture: ${item.credit}`;
        lastUrl=url;
        requestAnimationFrame(()=>img.style.opacity='1');
        resolve(true);
      };
      pre.onerror=()=>resolve(tryUrls(item,token,index+1));
      pre.src=url;
    });
  }

  async function showRandom(){
    if(current?.phase!=='rest')return;
    const token=++requestId;
    await loadOpenversePool();
    if(token!==requestId||current?.phase!=='rest')return;

    for(let attempts=0;attempts<Math.min(pool.length,12);attempts++){
      const item=pool[poolIndex++%pool.length];
      if(item.urls?.some(u=>u===lastUrl))continue;
      if(await tryUrls(item,token))return;
    }

    const fallback=await commonsFallback();
    if(token!==requestId||current?.phase!=='rest'||!fallback)return;
    await tryUrls(fallback,token);
  }

  function updateRest(){
    if(current?.phase==='rest'){
      wrap.classList.add('show');
      if(!interval){showRandom();interval=setInterval(showRandom,3000);}
    }else{
      wrap.classList.remove('show');
      if(interval){clearInterval(interval);interval=null;}
      requestId++;
    }
  }

  const previousRenderTimer=renderTimer;
  renderTimer=function(){previousRenderTimer();updateRest();};
  loadOpenversePool();
})();
