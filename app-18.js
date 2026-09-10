// FITLP automatic seasonal themes with Halloween, Christmas and Easter overrides.
(function(){
  const THEMES = {
    spring: {
      label: 'Spring',
      icon: '🌸',
      bg: 'radial-gradient(circle at 12% 10%, rgba(255,174,201,.42) 0 10%, transparent 27%), radial-gradient(circle at 88% 18%, rgba(132,220,173,.42) 0 9%, transparent 28%), linear-gradient(135deg,#fff8fc 0%,#eefbf3 52%,#f7ffef 100%)',
      panel: 'rgba(255,255,255,.88)', panel2:'#edf6ef', dark:'#f8fcf8', text:'#213127', muted:'#66776b', line:'#c9ddcf',
      work:'#45b86d', rest:'#5e9fc9', warm:'#dda332', done:'#cf5d70', accent:'#a56bcf', accentSoft:'#f1e5f8',
      primaryInk:'#0f3a20', accentInk:'#2c1739', track:'#dfeae2', shadow:'rgba(53,84,62,.13)', chrome:'#eefbf3'
    },
    summer: {
      label: 'Summer',
      icon: '☀️',
      bg: 'radial-gradient(circle at 88% 7%, rgba(255,196,60,.5) 0 9%, transparent 24%), radial-gradient(circle at 8% 86%, rgba(58,190,213,.24) 0 14%, transparent 34%), linear-gradient(145deg,#fff9df 0%,#eefcff 48%,#e8f7ff 100%)',
      panel:'rgba(255,255,255,.9)', panel2:'#edf8f8', dark:'#f8fcfb', text:'#173447', muted:'#607584', line:'#c7dde2',
      work:'#23a86d', rest:'#2f9bc4', warm:'#e6a71c', done:'#d85b58', accent:'#ef7b55', accentSoft:'#fff0e9',
      primaryInk:'#073d28', accentInk:'#4a1c10', track:'#dcecee', shadow:'rgba(28,89,108,.14)', chrome:'#eefcff'
    },
    autumn: {
      label: 'Autumn',
      icon: '🍂',
      bg: 'radial-gradient(circle at 10% 14%, rgba(198,93,44,.22) 0 8%, transparent 26%), radial-gradient(circle at 90% 82%, rgba(214,143,48,.2) 0 11%, transparent 30%), linear-gradient(140deg,#fff7eb 0%,#f4e4cd 52%,#f8efe2 100%)',
      panel:'rgba(255,250,242,.91)', panel2:'#f1e2cd', dark:'#fff9f0', text:'#412c20', muted:'#806b5c', line:'#d9bea0',
      work:'#4d8d5d', rest:'#557f9b', warm:'#d8892d', done:'#b65349', accent:'#c66332', accentSoft:'#f7dcc9',
      primaryInk:'#173c20', accentInk:'#4b1c0d', track:'#e7d8c6', shadow:'rgba(92,55,25,.15)', chrome:'#f4e4cd'
    },
    winter: {
      label: 'Winter',
      icon: '❄️',
      bg: 'radial-gradient(circle at 16% 14%, rgba(255,255,255,.9) 0 2px, transparent 3px), radial-gradient(circle at 76% 30%, rgba(255,255,255,.8) 0 2px, transparent 3px), radial-gradient(circle at 40% 82%, rgba(255,255,255,.9) 0 2px, transparent 3px), linear-gradient(145deg,#e9f5ff 0%,#dbeaf6 52%,#f8fbff 100%)',
      panel:'rgba(250,253,255,.9)', panel2:'#e4eef6', dark:'#f6fbff', text:'#1d3447', muted:'#62788a', line:'#bfd2e0',
      work:'#3d9b74', rest:'#4d88bb', warm:'#d29a32', done:'#c85f69', accent:'#6b78b8', accentSoft:'#e8eaf8',
      primaryInk:'#123a2c', accentInk:'#20284d', track:'#d6e3ec', shadow:'rgba(39,72,98,.14)', chrome:'#dbeaf6'
    },
    halloween: {
      label: 'Halloween',
      icon: '🎃',
      bg: 'radial-gradient(circle at 10% 13%, rgba(255,126,28,.27) 0 8%, transparent 24%), radial-gradient(circle at 90% 78%, rgba(140,82,190,.24) 0 10%, transparent 30%), linear-gradient(145deg,#2d163d 0%,#4a2147 52%,#5c2a3d 100%)',
      panel:'rgba(58,29,70,.88)', panel2:'#4b2757', dark:'#351941', text:'#fff4e6', muted:'#dac6dd', line:'#7c5588',
      work:'#91d856', rest:'#78c1ef', warm:'#ffad42', done:'#ff6e61', accent:'#ff7a1a', accentSoft:'#5b2c4c',
      primaryInk:'#183408', accentInk:'#351306', track:'#5b3864', shadow:'rgba(0,0,0,.24)', chrome:'#4a2147'
    },
    christmas: {
      label: 'Christmas',
      icon: '🎄',
      bg: 'radial-gradient(circle at 12% 18%, rgba(255,255,255,.92) 0 2px, transparent 3px), radial-gradient(circle at 87% 23%, rgba(255,255,255,.92) 0 2px, transparent 3px), radial-gradient(circle at 72% 78%, rgba(255,255,255,.85) 0 2px, transparent 3px), radial-gradient(circle at 18% 84%, rgba(180,35,47,.12) 0 10%, transparent 27%), linear-gradient(140deg,#eef8f3 0%,#fff8ed 48%,#edf7f1 100%)',
      panel:'rgba(255,255,252,.92)', panel2:'#e8f2ec', dark:'#f8fcf9', text:'#173a2d', muted:'#63776e', line:'#c7dacd',
      work:'#2f9259', rest:'#4f88a8', warm:'#c9972a', done:'#b4232f', accent:'#b4232f', accentSoft:'#f6e3e4',
      primaryInk:'#f7fff9', accentInk:'#fff8f0', track:'#dae8df', shadow:'rgba(31,83,55,.13)', chrome:'#eef8f3'
    },
    easter: {
      label: 'Easter',
      icon: '🐣',
      bg: 'radial-gradient(circle at 10% 15%, rgba(244,180,210,.35) 0 9%, transparent 26%), radial-gradient(circle at 87% 18%, rgba(183,162,226,.35) 0 10%, transparent 28%), radial-gradient(circle at 75% 87%, rgba(249,218,116,.35) 0 8%, transparent 25%), linear-gradient(145deg,#fff9fd 0%,#f1fbf4 48%,#fff8e7 100%)',
      panel:'rgba(255,255,255,.9)', panel2:'#f1eef9', dark:'#fbfafc', text:'#343044', muted:'#756f80', line:'#d9d1e4',
      work:'#67b985', rest:'#78a9cf', warm:'#d9ad38', done:'#d76b89', accent:'#9b7ac8', accentSoft:'#eee6f7',
      primaryInk:'#153b25', accentInk:'#2d2140', track:'#e5e0eb', shadow:'rgba(87,69,108,.12)', chrome:'#f1fbf4'
    }
  };

  function easterSunday(year){
    const a=year%19;
    const b=Math.floor(year/100);
    const c=year%100;
    const d=Math.floor(b/4);
    const e=b%4;
    const f=Math.floor((b+8)/25);
    const g=Math.floor((b-f+1)/3);
    const h=(19*a+b-d-g+15)%30;
    const i=Math.floor(c/4);
    const k=c%4;
    const l=(32+2*e+2*i-h-k)%7;
    const m=Math.floor((a+11*h+22*l)/451);
    const month=Math.floor((h+l-7*m+114)/31);
    const day=((h+l-7*m+114)%31)+1;
    return new Date(year,month-1,day);
  }

  function dayStamp(date){
    return new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime();
  }

  function themeForDate(now){
    const override = new URLSearchParams(location.search).get('theme');
    if(override && THEMES[override]) return override;

    const month=now.getMonth()+1;
    const day=now.getDate();

    if(month===10) return 'halloween';
    if(month===12 && day<=25) return 'christmas';

    const easter=easterSunday(now.getFullYear());
    const easterStart=new Date(easter); easterStart.setDate(easter.getDate()-7);
    const easterEnd=new Date(easter); easterEnd.setDate(easter.getDate()+1);
    const stamp=dayStamp(now);
    if(stamp>=dayStamp(easterStart) && stamp<=dayStamp(easterEnd)) return 'easter';

    if(month>=3 && month<=5) return 'spring';
    if(month>=6 && month<=8) return 'summer';
    if(month>=9 && month<=11) return 'autumn';
    return 'winter';
  }

  const style=document.createElement('style');
  style.id='fitlpSeasonalThemeStyles';
  style.textContent=`
    html,body{background:var(--season-bg)!important;background-attachment:fixed!important;color:var(--text)!important;transition:background .5s ease,color .35s ease}
    body{background-color:transparent!important}
    .card,.upnext,.fitlp-fact-card,.fitlp-news-card{background:var(--panel)!important;border-color:var(--line)!important;box-shadow:0 14px 38px var(--season-shadow)!important;backdrop-filter:blur(7px)}
    textarea,input,select,.exercise-row,.main-tabs{background:var(--dark)!important;color:var(--text)!important;border-color:var(--line)!important}
    .ghost,.format-btn,.focus-chip,.main-tab.active,.warmup-length-btn,.mini-btn,.controls button{background:var(--panel2)!important;color:var(--text)!important;border-color:var(--line)!important}
    .primary,#startPauseBtn{background:var(--work)!important;color:var(--primary-ink)!important}
    .secondary{background:var(--accent)!important;color:var(--accent-ink)!important}
    .format-btn.active{background:var(--accent-soft)!important;border-color:var(--accent)!important;color:var(--text)!important}
    .focus-chip[data-group="include"].active{background:var(--accent-soft)!important;border-color:var(--work)!important;color:var(--text)!important}
    .focus-chip[data-group="avoid"].active{background:color-mix(in srgb,var(--done) 18%,var(--panel))!important;border-color:var(--done)!important;color:var(--text)!important}
    .notice{background:var(--accent-soft)!important;border-color:var(--line)!important;color:var(--text)!important}
    .num{background:var(--panel2)!important;color:var(--text)!important}
    .pill{color:var(--muted)!important;border-color:var(--line)!important}
    .brand,h1,h2,h3,.exercise,.time,.ex-name,.upnext strong,.fitlp-news-source{color:var(--text)!important}
    p,.tiny,.helper,.format-desc,.chip-label,.summary,.ex-note,.target,.meta,.upnext,.warmup-tip,#warmupSummary,.fitlp-news-count{color:var(--muted)!important}
    .check,.warmup-length-btn,.format-btn,.focus-chip{color:var(--text)!important}
    .bar,.overall-progress-track{background:var(--track)!important;border-color:var(--line)!important}
    .bar-fill,.overall-progress-fill{background:var(--work)!important}
    .bar-fill.rest{background:var(--rest)!important}
    .bar-fill.warmup{background:var(--warm)!important}
    .phase.work,.phase.emom{color:var(--work)!important}
    .phase.rest,.phase.transition{color:var(--rest)!important}
    .phase.warmup{color:var(--warm)!important}
    .phase.done{color:var(--done)!important}
    .fitlp-fact-card strong,.fitlp-news-live{color:var(--work)!important}
    .fitlp-news-live::before{background:var(--work)!important;box-shadow:0 0 10px color-mix(in srgb,var(--work) 65%,transparent)!important}
    .fitlp-news-headline{color:var(--text)!important}
    .fitlp-theme-badge{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border-radius:999px;background:var(--panel)!important;border:1px solid var(--line);color:var(--text);font-size:11px;font-weight:850;box-shadow:0 8px 22px var(--season-shadow);white-space:nowrap}
    .fitlp-theme-badge span{color:var(--muted);font-weight:700}
    .fitlp-topbar-meta{display:flex;align-items:center;justify-content:flex-end;gap:8px;flex-wrap:wrap}
    @media(max-width:620px){.fitlp-theme-badge{padding:6px 8px;font-size:10px}.fitlp-topbar-meta{gap:5px}}
  `;
  document.head.appendChild(style);

  function ensureBadge(){
    const topbar=document.querySelector('#builderScreen .topbar');
    const saved=document.getElementById('savedStatus');
    if(!topbar || !saved) return null;
    let wrap=topbar.querySelector('.fitlp-topbar-meta');
    if(!wrap){
      wrap=document.createElement('div');
      wrap.className='fitlp-topbar-meta';
      saved.replaceWith(wrap);
      wrap.appendChild(saved);
    }
    let badge=document.getElementById('fitlpThemeBadge');
    if(!badge){
      badge=document.createElement('div');
      badge.id='fitlpThemeBadge';
      badge.className='fitlp-theme-badge';
      wrap.insertBefore(badge,saved);
    }
    return badge;
  }

  let activeTheme='';
  function applyTheme(){
    const name=themeForDate(new Date());
    if(name===activeTheme) return;
    activeTheme=name;
    const t=THEMES[name];
    const root=document.documentElement;
    root.dataset.fitlpTheme=name;
    root.style.setProperty('--season-bg',t.bg);
    root.style.setProperty('--panel',t.panel);
    root.style.setProperty('--panel2',t.panel2);
    root.style.setProperty('--dark',t.dark);
    root.style.setProperty('--text',t.text);
    root.style.setProperty('--muted',t.muted);
    root.style.setProperty('--line',t.line);
    root.style.setProperty('--work',t.work);
    root.style.setProperty('--rest',t.rest);
    root.style.setProperty('--warm',t.warm);
    root.style.setProperty('--done',t.done);
    root.style.setProperty('--accent',t.accent);
    root.style.setProperty('--accent-soft',t.accentSoft);
    root.style.setProperty('--primary-ink',t.primaryInk);
    root.style.setProperty('--accent-ink',t.accentInk);
    root.style.setProperty('--track',t.track);
    root.style.setProperty('--season-shadow',t.shadow);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta) meta.setAttribute('content',t.chrome);
    const badge=ensureBadge();
    if(badge) badge.innerHTML=`${t.icon} ${t.label} <span>auto theme</span>`;
  }

  applyTheme();
  setInterval(applyTheme,60*60*1000);
})();
