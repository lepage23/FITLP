// FITLP Wikimedia Commons Picture of the Day on the workout builder screen.
(function(){
  const API = 'https://commons.wikimedia.org/w/api.php';
  const POTD_PAGE = 'https://commons.wikimedia.org/wiki/Commons:Picture_of_the_day';
  const CACHE_PREFIX = 'fitlpPotdV2:';
  let loadedDate = '';

  const style = document.createElement('style');
  style.textContent = `
    .fitlp-potd-card{overflow:hidden;padding:0!important}
    .fitlp-potd-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:17px 18px 13px}
    .fitlp-potd-title{font-size:18px;font-weight:900;color:var(--text);margin:0}
    .fitlp-potd-date{font-size:11px;color:var(--muted);margin-top:4px}
    .fitlp-potd-badge{flex:0 0 auto;border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;padding:6px 9px;font-size:10px;font-weight:850}
    .fitlp-potd-image-link{display:block;background:var(--dark);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
    .fitlp-potd-image{display:block;width:100%;height:min(380px,48vw);min-height:220px;object-fit:cover;background:var(--dark)}
    .fitlp-potd-body{padding:14px 18px 17px}
    .fitlp-potd-caption{font-size:13px;line-height:1.5;color:var(--text);font-weight:650}
    .fitlp-potd-credit{margin-top:9px;font-size:10px;line-height:1.45;color:var(--muted)}
    .fitlp-potd-credit a,.fitlp-potd-fallback a{color:var(--accent);font-weight:800;text-decoration:none}
    .fitlp-potd-loading{padding:24px 18px;color:var(--muted);font-size:13px;text-align:center}
    .fitlp-potd-fallback{padding:18px;color:var(--muted);font-size:13px;line-height:1.5}
    @media(max-width:620px){
      .fitlp-potd-head{padding:14px 14px 11px}
      .fitlp-potd-body{padding:12px 14px 14px}
      .fitlp-potd-image{height:56vw;min-height:190px}
      .fitlp-potd-title{font-size:16px}
    }
  `;
  document.head.appendChild(style);

  const workoutContent = document.getElementById('workoutTabContent');
  if (!workoutContent) return;

  const card = document.createElement('div');
  card.id = 'fitlpPictureOfDay';
  card.className = 'card fitlp-potd-card';
  card.innerHTML = '<div class="fitlp-potd-loading">Loading today\'s Wikimedia Commons picture…</div>';
  workoutContent.insertBefore(card, workoutContent.firstElementChild);

  function localDateKey(){
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }

  function readableDate(key){
    const [y,m,d] = key.split('-').map(Number);
    return new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',year:'numeric'}).format(new Date(y,m-1,d));
  }

  function stripHtml(value){
    if(!value) return '';
    const el = document.createElement('div');
    el.innerHTML = String(value);
    el.querySelectorAll('style,script,noscript').forEach(node=>node.remove());
    return (el.textContent || '').replace(/\s+/g,' ').trim();
  }

  function cleanCaptionText(value, dateKey){
    let text = stripHtml(value);
    if(!text) return '';

    // Wikimedia's POTD template can include helper/translation boilerplate after the real caption.
    // Keep the human-readable sentence and remove those template labels if they appear.
    const stopMarkers = [
      `Template:Potd/${dateKey}`,
      'This is the English translation of the Picture of the day description page',
      'Descriptions in other languages:',
      'Potd/'
    ];
    for(const marker of stopMarkers){
      const i = text.indexOf(marker);
      if(i > 0) text = text.slice(0,i).trim();
    }

    // Defensive cleanup in case CSS text ever survives a MediaWiki response.
    text = text.replace(/^.*?\}\s*(?=[A-Z0-9*])/s,'').trim();
    return text;
  }

  async function api(params){
    const qs = new URLSearchParams({format:'json',origin:'*',...params});
    const response = await fetch(`${API}?${qs.toString()}`, {cache:'no-store'});
    if(!response.ok) throw new Error(`Commons API ${response.status}`);
    return response.json();
  }

  async function expand(templateText){
    const data = await api({action:'expandtemplates',text:templateText,prop:'wikitext'});
    return String(data?.expandtemplates?.wikitext || '').trim();
  }

  function normaliseFilename(value){
    let text = stripHtml(value).trim();
    text = text.replace(/^\[\[:?(?:File|Image):/i,'').replace(/\]\]$/,'');
    text = text.replace(/^(?:File|Image):/i,'');
    if(text.includes('|')) text = text.split('|')[0];
    return text.trim();
  }

  async function getCaption(dateKey){
    try{
      const page = `Template:Potd/${dateKey} (en)`;
      const data = await api({action:'parse',page,prop:'text',disableeditsection:'1'});
      const raw = data?.parse?.text?.['*'] || data?.parse?.text || '';
      const container = document.createElement('div');
      container.innerHTML = String(raw);
      container.querySelectorAll('style,script,noscript,.potd-description-helper-box').forEach(node=>node.remove());
      const cleaned = cleanCaptionText(container.innerHTML, dateKey);
      if(cleaned) return cleaned;
    }catch(e){}

    // Fallback: expand the documented English POTD caption template directly.
    try{
      const expanded = await expand(`{{Potd/${dateKey} (en)}}`);
      return cleanCaptionText(expanded, dateKey);
    }catch(e){
      return '';
    }
  }

  async function fetchPotd(dateKey){
    const expanded = await expand(`{{Potd/${dateKey}}}`);
    const filename = normaliseFilename(expanded);
    if(!filename || /no[_ ]image/i.test(filename)) throw new Error('No Picture of the Day available');

    const data = await api({
      action:'query',
      prop:'imageinfo',
      iiprop:'url|extmetadata',
      iiurlwidth:'1200',
      titles:`File:${filename}`
    });
    const page = Object.values(data?.query?.pages || {})[0];
    const info = page?.imageinfo?.[0];
    if(!info?.thumburl && !info?.url) throw new Error('Picture image unavailable');

    const meta = info.extmetadata || {};
    const caption = (await getCaption(dateKey)) || cleanCaptionText(meta.ImageDescription?.value || meta.ImageDescription?.Value || '', dateKey);
    const artist = stripHtml(meta.Artist?.value || meta.Artist?.Value || '');
    const licence = stripHtml(meta.LicenseShortName?.value || meta.LicenseShortName?.Value || meta.UsageTerms?.value || meta.UsageTerms?.Value || '');
    const filePage = info.descriptionurl || `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(filename.replace(/ /g,'_'))}`;

    return {
      date: dateKey,
      filename,
      image: info.thumburl || info.url,
      fullImage: info.url || info.thumburl,
      filePage,
      caption,
      artist,
      licence
    };
  }

  function safeUrl(url){
    return /^https:\/\//i.test(String(url || '')) ? url : '#';
  }

  function render(data){
    const creditBits = [];
    if(data.artist) creditBits.push(data.artist);
    if(data.licence) creditBits.push(data.licence);
    const credit = creditBits.length ? creditBits.join(' · ') : 'Licence and creator details on Wikimedia Commons';
    card.innerHTML = `
      <div class="fitlp-potd-head">
        <div>
          <h2 class="fitlp-potd-title">Picture of the day</h2>
          <div class="fitlp-potd-date">${readableDate(data.date)}</div>
        </div>
        <div class="fitlp-potd-badge">Wikimedia Commons</div>
      </div>
      <a class="fitlp-potd-image-link" href="${safeUrl(data.filePage)}" target="_blank" rel="noopener noreferrer">
        <img class="fitlp-potd-image" src="${safeUrl(data.image)}" alt="Wikimedia Commons Picture of the Day" referrerpolicy="no-referrer">
      </a>
      <div class="fitlp-potd-body">
        <div class="fitlp-potd-caption">${data.caption || data.filename}</div>
        <div class="fitlp-potd-credit">${credit} · <a href="${safeUrl(data.filePage)}" target="_blank" rel="noopener noreferrer">View image details</a></div>
      </div>`;
  }

  function renderFallback(){
    card.innerHTML = `
      <div class="fitlp-potd-head">
        <div><h2 class="fitlp-potd-title">Picture of the day</h2><div class="fitlp-potd-date">${readableDate(localDateKey())}</div></div>
        <div class="fitlp-potd-badge">Wikimedia Commons</div>
      </div>
      <div class="fitlp-potd-fallback">Today’s image couldn’t be loaded right now. <a href="${POTD_PAGE}" target="_blank" rel="noopener noreferrer">Open Wikimedia Commons Picture of the Day</a>.</div>`;
  }

  function readCache(dateKey){
    try{
      const raw = localStorage.getItem(CACHE_PREFIX + dateKey);
      if(!raw) return null;
      const data = JSON.parse(raw);
      return data?.date === dateKey && data?.image ? data : null;
    }catch(e){ return null; }
  }

  function writeCache(dateKey,data){
    try{
      Object.keys(localStorage).filter(k=>k.startsWith('fitlpPotd') && k !== CACHE_PREFIX + dateKey).forEach(k=>localStorage.removeItem(k));
      localStorage.setItem(CACHE_PREFIX + dateKey, JSON.stringify(data));
    }catch(e){}
  }

  async function loadToday(force=false){
    const dateKey = localDateKey();
    if(!force && dateKey === loadedDate) return;
    loadedDate = dateKey;

    const cached = readCache(dateKey);
    if(cached){
      render(cached);
      return;
    }

    card.innerHTML = '<div class="fitlp-potd-loading">Loading today\'s Wikimedia Commons picture…</div>';
    try{
      const data = await fetchPotd(dateKey);
      writeCache(dateKey,data);
      if(dateKey === localDateKey()) render(data);
    }catch(e){
      renderFallback();
    }
  }

  loadToday();
  setInterval(()=>loadToday(false), 5 * 60 * 1000);
})();
