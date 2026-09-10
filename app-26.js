// FITLP stable looping media patch.
// app-24 re-renders the timer every second; this patch keeps the chosen media mounted
// for the whole exercise interval so videos/GIFs are not constantly restarted.
(function(){
  const exercise=document.getElementById('exercise');
  if(!exercise) return;

  const style=document.createElement('style');
  style.textContent=`
    #fitlpMotionTimer{display:none!important}
    #fitlpStableMotion26{display:none;flex-direction:column;align-items:center;gap:7px;margin:0 auto 18px}
    #fitlpStableMotion26.show{display:flex}
    #fitlpStableMotion26 .fitlp-stable-media{width:min(430px,86vw);height:300px;object-fit:contain;border:1px solid var(--line);border-radius:18px;background:var(--panel);box-shadow:0 12px 30px var(--season-shadow,rgba(0,0,0,.12))}
    #fitlpStableMotion26 .fitlp-stable-credit{font-size:9px;color:var(--muted)!important;text-decoration:none;max-width:min(430px,86vw);line-height:1.3}
    #fitlpStableMotion26 .fitlp-loop-badge{font-size:9px;font-weight:900;letter-spacing:.08em;color:var(--work)}
    @media(max-width:620px){#fitlpStableMotion26 .fitlp-stable-media{height:235px}}
  `;
  document.head.appendChild(style);

  const wrap=document.createElement('div');
  wrap.id='fitlpStableMotion26';
  exercise.parentNode.insertBefore(wrap,exercise);

  let activeKey='';
  let activeSrc='';
  let retryTimers=[];

  function clearRetries(){ retryTimers.forEach(clearTimeout); retryTimers=[]; }

  function getRowFor(label){
    return [...document.querySelectorAll('#workoutList .exercise-row,#warmupList .exercise-row')]
      .find(row=>row.querySelector('.ex-name')?.textContent?.trim()===label) || null;
  }

  function extractSource(label){
    const row=getRowFor(label);
    let media=row?.querySelector('.fitlp-media-slot video,.fitlp-media-slot img');
    let credit=row?.querySelector('.fitlp-media-credit');

    // app-24 may already have resolved the timer media before the preview row catches up.
    if(!media){
      const legacy=document.getElementById('fitlpMotionTimer');
      media=legacy?.querySelector('video,img') || null;
      credit=legacy?.querySelector('.fitlp-media-credit,a') || credit;
    }

    if(!media?.src) return null;
    const tag=media.tagName.toLowerCase();
    const isVideo=tag==='video';
    const isGif=!isVideo && (/\.gif(?:$|[?#])/i.test(media.src) || row?.querySelector('.fitlp-media-motion')?.textContent?.trim()==='GIF');
    return {
      src:media.currentSrc || media.src,
      kind:isVideo?'video':(isGif?'gif':'image'),
      href:credit?.href || '',
      credit:credit?.textContent?.trim() || ''
    };
  }

  function mount(info,label){
    if(!info?.src) return;
    if(activeSrc===info.src && wrap.querySelector('.fitlp-stable-media')){
      wrap.classList.add('show');
      const video=wrap.querySelector('video');
      if(video?.paused) video.play().catch(()=>{});
      return;
    }

    activeSrc=info.src;
    wrap.innerHTML='';

    let media;
    if(info.kind==='video'){
      media=document.createElement('video');
      media.src=info.src;
      media.autoplay=true;
      media.muted=true;
      media.loop=true;
      media.playsInline=true;
      media.preload='auto';
      media.setAttribute('playsinline','');
      media.setAttribute('muted','');
      // Belt-and-braces: some mobile browsers can still stop at the end despite loop.
      media.addEventListener('ended',()=>{
        try{media.currentTime=0;}catch(e){}
        media.play().catch(()=>{});
      });
      media.addEventListener('canplay',()=>media.play().catch(()=>{}),{once:true});
    }else{
      media=document.createElement('img');
      media.src=info.src;
      media.alt=`${label} demonstration`;
      media.referrerPolicy='no-referrer';
    }
    media.className='fitlp-stable-media';
    wrap.appendChild(media);

    if(info.kind==='video' || info.kind==='gif'){
      const badge=document.createElement('div');
      badge.className='fitlp-loop-badge';
      badge.textContent=info.kind==='video'?'LOOPING VIDEO':'LOOPING GIF';
      wrap.appendChild(badge);
    }

    if(info.credit){
      const a=document.createElement('a');
      a.className='fitlp-stable-credit';
      a.textContent=info.credit;
      if(info.href){a.href=info.href;a.target='_blank';a.rel='noopener noreferrer';}
      wrap.appendChild(a);
    }

    wrap.classList.add('show');
    if(media.tagName==='VIDEO') media.play().catch(()=>{});
  }

  function tryMount(label,key){
    if(key!==activeKey || current?.label!==label) return;
    const info=extractSource(label);
    if(info) mount(info,label);
  }

  function scheduleMount(label,key){
    clearRetries();
    [0,120,350,800,1500,3000].forEach(delay=>{
      retryTimers.push(setTimeout(()=>tryMount(label,key),delay));
    });
  }

  function updateStableMedia(){
    const label=current?.label || '';
    const phase=current?.phase || '';
    const valid=label && !['rest','done','transition'].includes(phase);

    if(!valid){
      activeKey=''; activeSrc=''; clearRetries();
      wrap.classList.remove('show');
      wrap.innerHTML='';
      return;
    }

    const key=`${phase}|${label}`;
    if(key!==activeKey){
      activeKey=key;
      activeSrc='';
      wrap.classList.remove('show');
      wrap.innerHTML='';
      scheduleMount(label,key);
      return;
    }

    // Do not rebuild the media on timer ticks. Just make sure a video is still playing.
    const video=wrap.querySelector('video');
    if(video?.paused && !document.hidden) video.play().catch(()=>{});
  }

  const previousRenderTimer=renderTimer;
  renderTimer=function(){
    previousRenderTimer();
    updateStableMedia();
  };

  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden) wrap.querySelector('video')?.play().catch(()=>{});
  });
})();
