// FITLP live news rails: rotating BBC News + The Guardian headlines during the timer.
// Uses the publishers' RSS feeds via rss2json so the static GitHub Pages app can read them in-browser.
(function(){
  const ROTATE_MS = 18000;
  const REFRESH_MS = 10 * 60 * 1000;
  const RSS2JSON = 'https://api.rss2json.com/v1/api.json';

  const sources = {
    bbc: {
      label: 'BBC News',
      rss: 'https://feeds.bbci.co.uk/news/rss.xml',
      items: [],
      index: 0
    },
    guardian: {
      label: 'The Guardian',
      rss: 'https://www.theguardian.com/uk/rss',
      items: [],
      index: 0
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .fitlp-news-rail{display:none;position:fixed;top:92px;width:245px;z-index:30}
    .fitlp-news-left{left:18px}
    .fitlp-news-right{right:18px}
    .fitlp-news-card{border:1px solid #343a46;border-radius:16px;background:#171b22;padding:15px 16px;min-height:148px;box-shadow:0 12px 35px rgba(0,0,0,.18)}
    .fitlp-news-source{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:11px;font-size:12px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:#f3f4f6}
    .fitlp-news-live{display:inline-flex;align-items:center;gap:5px;color:#86efac;font-size:10px;font-weight:800;letter-spacing:.08em}
    .fitlp-news-live::before{content:'';width:6px;height:6px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px rgba(74,222,128,.55)}
    .fitlp-news-headline{display:block;color:#e5e7eb;text-decoration:none;font-size:14px;font-weight:750;line-height:1.45;transition:opacity .35s ease,transform .35s ease}
    .fitlp-news-headline.changing{opacity:0;transform:translateY(4px)}
    .fitlp-news-count{margin-top:11px;color:#777f8e;font-size:10px}
    .fitlp-news-mobile{display:none;margin:12px 0 18px;gap:10px}
    .fitlp-news-mobile .fitlp-news-card{min-height:116px}
    @media(min-width:1180px){.fitlp-news-rail{display:block}}
    @media(max-width:1179px){
      .fitlp-news-mobile{display:grid;grid-template-columns:1fr 1fr}
    }
    @media(max-width:650px){
      .fitlp-news-mobile{grid-template-columns:1fr}
      .fitlp-news-card{padding:12px 13px;min-height:0}
      .fitlp-news-headline{font-size:13px}
    }
    @media(prefers-reduced-motion:reduce){.fitlp-news-headline{transition:none}}
  `;
  document.head.appendChild(style);

  function cardMarkup(source){
    return `
      <div class="fitlp-news-card" data-news-card="${source}">
        <div class="fitlp-news-source">
          <span data-news-source="${source}"></span>
          <span class="fitlp-news-live">Live</span>
        </div>
        <a class="fitlp-news-headline" data-news-headline="${source}" href="#" target="_blank" rel="noopener noreferrer">Loading latest headlines…</a>
        <div class="fitlp-news-count" data-news-count="${source}">Updating from RSS</div>
      </div>`;
  }

  const timerScreen = document.getElementById('timerScreen');
  const timerHead = document.querySelector('#timerScreen .timer-head');
  if (!timerScreen || !timerHead) return;

  const left = document.createElement('aside');
  left.className = 'fitlp-news-rail fitlp-news-left';
  left.setAttribute('aria-label','BBC News headlines');
  left.innerHTML = cardMarkup('bbc');

  const right = document.createElement('aside');
  right.className = 'fitlp-news-rail fitlp-news-right';
  right.setAttribute('aria-label','Guardian headlines');
  right.innerHTML = cardMarkup('guardian');

  timerScreen.appendChild(left);
  timerScreen.appendChild(right);

  const mobile = document.createElement('div');
  mobile.className = 'fitlp-news-mobile';
  mobile.innerHTML = cardMarkup('bbc') + cardMarkup('guardian');
  timerHead.insertAdjacentElement('afterend', mobile);

  Object.entries(sources).forEach(([key,source])=>{
    document.querySelectorAll(`[data-news-source="${key}"]`).forEach(el=>el.textContent=source.label);
  });

  function cleanTitle(title){
    return String(title || '')
      .replace(/\s*[|–-]\s*(BBC News|The Guardian)\s*$/i,'')
      .trim();
  }

  function render(sourceKey, animate=false){
    const source = sources[sourceKey];
    const item = source.items[source.index];
    const headlines = document.querySelectorAll(`[data-news-headline="${sourceKey}"]`);
    const counts = document.querySelectorAll(`[data-news-count="${sourceKey}"]`);

    if (!item) {
      headlines.forEach(el=>{
        el.textContent = 'Live headlines unavailable. Retrying automatically.';
        el.removeAttribute('href');
      });
      counts.forEach(el=>el.textContent='Feed temporarily unavailable');
      return;
    }

    const apply = ()=>{
      headlines.forEach(el=>{
        el.textContent = cleanTitle(item.title);
        if (item.link) el.href = item.link;
        else el.removeAttribute('href');
        el.classList.remove('changing');
      });
      counts.forEach(el=>el.textContent=`Headline ${source.index + 1} of ${source.items.length}`);
    };

    if (!animate) {
      apply();
      return;
    }

    headlines.forEach(el=>el.classList.add('changing'));
    setTimeout(apply, 360);
  }

  function jsonpFeed(sourceKey){
    const source = sources[sourceKey];
    return new Promise((resolve,reject)=>{
      const callbackName = `fitlp${sourceKey}${Date.now()}${Math.floor(Math.random()*10000)}`.replace(/[^a-zA-Z0-9]/g,'');
      const script = document.createElement('script');
      let settled = false;
      const timer = setTimeout(()=>finish(new Error('News request timed out')),12000);

      function cleanup(){
        clearTimeout(timer);
        try{ delete window[callbackName]; }catch(e){ window[callbackName]=undefined; }
        script.remove();
      }
      function finish(error,data){
        if(settled) return;
        settled=true;
        cleanup();
        if(error) reject(error); else resolve(data);
      }

      window[callbackName] = data=>finish(null,data);
      script.onerror = ()=>finish(new Error('News request failed'));
      script.src = `${RSS2JSON}?rss_url=${encodeURIComponent(source.rss)}&callback=${callbackName}`;
      document.head.appendChild(script);
    });
  }

  async function refresh(sourceKey){
    try{
      const data = await jsonpFeed(sourceKey);
      if (!data || data.status !== 'ok' || !Array.isArray(data.items) || !data.items.length) throw new Error('Empty feed');
      const unique = [];
      const seen = new Set();
      data.items.forEach(item=>{
        const title=cleanTitle(item.title);
        if(!title || seen.has(title)) return;
        seen.add(title);
        unique.push({title,link:item.link || ''});
      });
      if(!unique.length) throw new Error('No usable headlines');
      sources[sourceKey].items = unique.slice(0,10);
      sources[sourceKey].index = 0;
      render(sourceKey,false);
    }catch(e){
      if(!sources[sourceKey].items.length) render(sourceKey,false);
    }
  }

  function advance(sourceKey){
    const source=sources[sourceKey];
    if(source.items.length<2) return;
    source.index=(source.index+1)%source.items.length;
    render(sourceKey,true);
  }

  refresh('bbc');
  refresh('guardian');

  setInterval(()=>advance('bbc'),ROTATE_MS);
  setTimeout(()=>{
    advance('guardian');
    setInterval(()=>advance('guardian'),ROTATE_MS);
  },Math.round(ROTATE_MS/2));

  setInterval(()=>{
    refresh('bbc');
    refresh('guardian');
  },REFRESH_MS);
})();
