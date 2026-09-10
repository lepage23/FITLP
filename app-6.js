// FITLP warm-up modes: mobility, shadow boxing and a 9-minute daily movement routine.
(function(){
  let warmupMode = localStorage.getItem('fitlpWarmupMode') || 'mobility';

  const SHADOW_ROUNDS = [
    {name:'Shadow boxing · movement + jab', note:'Stay light on your feet. Move, guard up and work the jab.'},
    {name:'Shadow boxing · jab-cross + slips', note:'Straight punches, then slip left and right. Keep it controlled.'},
    {name:'Shadow boxing · hooks + uppercuts', note:'Short combinations. Rotate through the hips without overreaching.'},
    {name:'Shadow boxing · footwork + combinations', note:'Move forwards, backwards and side to side while throwing combinations.'},
    {name:'Shadow boxing · free round', note:'Mix your punches, defence and footwork. Keep moving for the full minute.'}
  ];

  const DAILY_MOVES = [
    {name:'Lymphatic hops', note:'Light, relaxed hops. Stay soft through the knees and ankles.'},
    {name:'Body waves', note:'Let the movement flow through the ankles, knees, hips, spine and shoulders.'},
    {name:'Trunk twists', note:'Rotate gently side to side and let the arms follow naturally.'},
    {name:'Arm swings', note:'Loose, relaxed swings through a comfortable range.'},
    {name:'Dead arms', note:'Keep the arms heavy and relaxed while turning the body.'},
    {name:'Golf swings', note:'Rotate through the hips and torso as if making an easy golf swing.'},
    {name:'Marches', note:'March steadily with an upright posture and relaxed breathing.'},
    {name:'Ballet squats', note:'Use a comfortable wide stance. Sit down smoothly and stand tall.'},
    {name:'Horse stance', note:'Hold a comfortable wide squat stance. Stay tall and breathe steadily.'}
  ];

  const style = document.createElement('style');
  style.textContent = `
    .warmup-mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0 16px}
    .warmup-mode-btn{background:var(--panel2);color:#dfe3ea;border:1px solid #343a46;border-radius:11px;padding:11px 8px;font-weight:800;font-size:12px}
    .warmup-mode-btn.active{background:#292238;border-color:var(--accent);color:#efe9ff}
    .warmup-source{margin-top:10px;color:var(--muted);font-size:11px;line-height:1.45}
    .warmup-fixed-length{display:none;background:var(--dark);border:1px solid var(--line);border-radius:11px;padding:11px 12px;margin:10px 0 14px;color:#fde68a;font-weight:800;text-align:center}
    @media(max-width:620px){.warmup-mode-grid{grid-template-columns:1fr}.warmup-mode-btn{padding:12px}}
  `;
  document.head.appendChild(style);

  const lengthLabel = document.querySelector('#warmupTabContent label');
  const lengthGrid = document.querySelector('#warmupTabContent .warmup-lengths');
  const intro = document.querySelector('#warmupTabContent .warmup-intro');
  if (!lengthGrid || !intro) return;

  const modeWrap = document.createElement('div');
  modeWrap.innerHTML = `
    <label>Warm-up type</label>
    <div class="warmup-mode-grid" id="warmupModeGrid">
      <button type="button" class="warmup-mode-btn" data-mode="mobility">Mobility & stretches</button>
      <button type="button" class="warmup-mode-btn" data-mode="shadow">Shadow boxing</button>
      <button type="button" class="warmup-mode-btn" data-mode="daily">9-min daily movement</button>
    </div>
  `;
  lengthLabel.parentNode.insertBefore(modeWrap, lengthLabel);

  const fixedLength = document.createElement('div');
  fixedLength.id = 'warmupFixedLength';
  fixedLength.className = 'warmup-fixed-length';
  fixedLength.textContent = '9 minutes · 60 seconds per movement';
  lengthGrid.parentNode.insertBefore(fixedLength, lengthGrid.nextSibling);

  const originalRenderWarmupTab = renderWarmupTab;
  const originalStartStandaloneWarmup = startStandaloneWarmup;

  function modeTitle(){
    if (warmupMode === 'shadow') return 'Shadow boxing';
    if (warmupMode === 'daily') return '9-minute daily movement';
    return 'Warm-up & mobility';
  }

  function renderShadow(){
    const mins = warmupDuration >= 300 ? 5 : 3;
    const rounds = SHADOW_ROUNDS.slice(0, mins);
    $('warmupSummary').textContent = `${mins} minute shadow boxing warm-up · ${rounds.length} × 60 second rounds`;
    $('warmupList').innerHTML = rounds.map((move,i)=>`
      <div class="exercise-row warmup-row">
        <div class="num">${i+1}</div>
        <div><div class="ex-name">${escapeHtml(move.name)}</div><div class="ex-note">${escapeHtml(move.note)}</div></div>
        <div class="pill">60s</div>
      </div>`).join('');
  }

  function renderDaily(){
    $('warmupSummary').textContent = '9 minute daily movement · 9 movements × 60 seconds';
    $('warmupList').innerHTML = DAILY_MOVES.map((move,i)=>`
      <div class="exercise-row warmup-row">
        <div class="num">${i+1}</div>
        <div><div class="ex-name">${escapeHtml(move.name)}</div><div class="ex-note">${escapeHtml(move.note)}</div></div>
        <div class="pill">60s</div>
      </div>`).join('') + '<div class="warmup-source">Routine based on the 9-minute “minimum viable exercise” sequence shared by @mydisciplinedrive. Move at your own pace and modify movements as needed.</div>';
  }

  renderWarmupTab = function(){
    document.querySelectorAll('.warmup-mode-btn').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===warmupMode));
    const p = document.querySelector('#warmupTabContent .warmup-intro p');
    const h = document.querySelector('#warmupTabContent .warmup-intro h1');
    if (h) h.textContent = modeTitle();

    if (warmupMode === 'mobility') {
      if (warmupDuration > 300) warmupDuration = 180;
      if (p) p.textContent = 'Guided body stretches, mobility and short holds before you train. No equipment needed.';
      lengthLabel.style.display = '';
      lengthGrid.style.display = '';
      fixedLength.style.display = 'none';
      lengthGrid.querySelector('[data-seconds="120"]').style.display = '';
      originalRenderWarmupTab();
      return;
    }

    if (warmupMode === 'shadow') {
      if (![180,300].includes(warmupDuration)) warmupDuration = 180;
      if (p) p.textContent = 'A simple boxing warm-up using movement, punches, defence and footwork. No equipment needed.';
      lengthLabel.style.display = '';
      lengthGrid.style.display = 'grid';
      fixedLength.style.display = 'none';
      lengthGrid.querySelector('[data-seconds="120"]').style.display = 'none';
      document.querySelectorAll('.warmup-length-btn').forEach(btn=>{
        const sec = Number(btn.dataset.seconds);
        btn.classList.toggle('active',sec===warmupDuration);
      });
      renderShadow();
      return;
    }

    warmupDuration = 540;
    if (p) p.textContent = 'A low-barrier daily movement sequence with T’ai Chi / Qi Gong-inspired flowing movements.';
    lengthLabel.style.display = 'none';
    lengthGrid.style.display = 'none';
    fixedLength.style.display = 'block';
    renderDaily();
  };

  function buildSelectedQueue(){
    if (warmupMode === 'shadow') {
      const mins = warmupDuration >= 300 ? 5 : 3;
      queue = SHADOW_ROUNDS.slice(0,mins).map((move,i)=>({
        phase:'warmup', label:move.name, target:move.note, duration:60,
        meta:`Shadow boxing · round ${i+1} of ${mins}`
      }));
      queue.push({phase:'done',label:'Warm-up complete',target:'Ready for your workout',duration:0,meta:''});
      return;
    }
    if (warmupMode === 'daily') {
      queue = DAILY_MOVES.map((move,i)=>({
        phase:'warmup', label:move.name, target:move.note, duration:60,
        meta:`Daily movement · ${i+1} of 9`
      }));
      queue.push({phase:'done',label:'9 minutes complete',target:'You moved today',duration:0,meta:''});
    }
  }

  function startSelectedWarmup(){
    if (warmupMode === 'mobility') {
      originalStartStandaloneWarmup();
      return;
    }
    standaloneWarmupActive = true;
    pauseTimer();
    releaseWakeLock();
    buildSelectedQueue();
    current = null;
    queueIndex = -1;
    secondsLeft = 0;
    $('builderScreen').style.display='none';
    $('timerScreen').style.display='block';
    $('timerFormat').textContent = warmupMode === 'shadow'
      ? `Shadow boxing · ${warmupDuration/60} mins`
      : '9-minute daily movement';
    resetTimer(false);
    window.scrollTo(0,0);
  }

  // Replace the original Start button to remove its earlier click handler.
  const oldStart = $('startWarmupBtn');
  const newStart = oldStart.cloneNode(true);
  oldStart.parentNode.replaceChild(newStart,oldStart);
  newStart.addEventListener('click',startSelectedWarmup);

  document.querySelectorAll('.warmup-mode-btn').forEach(btn=>btn.addEventListener('click',()=>{
    warmupMode = btn.dataset.mode;
    localStorage.setItem('fitlpWarmupMode',warmupMode);
    renderWarmupTab();
  }));

  // Existing duration handlers still update warmupDuration. This extra handler refreshes our custom modes afterwards.
  document.querySelectorAll('.warmup-length-btn').forEach(btn=>btn.addEventListener('click',()=>{
    if (warmupMode !== 'mobility') setTimeout(renderWarmupTab,0);
  }));

  renderWarmupTab();
})();
