// FITLP workout start flow fix + Skip warm-up confirmation.
(function(){
  const style = document.createElement('style');
  style.textContent = `
    .fitlp-start-overlay{position:fixed;inset:0;background:rgba(6,8,12,.72);display:none;align-items:center;justify-content:center;padding:20px;z-index:12000}
    .fitlp-start-overlay.show{display:flex}
    .fitlp-start-modal{width:min(420px,100%);background:var(--panel);border:1px solid var(--line);border-radius:18px;padding:22px;text-align:center;box-shadow:0 20px 70px rgba(0,0,0,.45)}
    .fitlp-start-modal h2{font-size:28px;margin:0 0 8px}
    .fitlp-start-modal p{margin:0 0 18px;color:var(--muted)}
    .fitlp-start-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .fitlp-start-actions button{padding:14px 12px;border-radius:12px;font-weight:900}
    .fitlp-start-yes{background:#3a2024;color:#fecaca}
    .fitlp-start-no{background:var(--work);color:#052e16}
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.className = 'fitlp-start-overlay';
  overlay.id = 'fitlpStartOverlay';
  overlay.innerHTML = `
    <div class="fitlp-start-modal" role="dialog" aria-modal="true" aria-labelledby="fitlpStartTitle">
      <h2 id="fitlpStartTitle">Skip warm-up?</h2>
      <p id="fitlpStartCopy">Start the workout immediately, or do the selected warm-up first.</p>
      <div class="fitlp-start-actions">
        <button type="button" class="fitlp-start-yes" id="fitlpSkipWarmupYes">Yes, skip it</button>
        <button type="button" class="fitlp-start-no" id="fitlpSkipWarmupNo">No, warm up</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  function rebuildWorkoutQueue(){
    if (!currentWorkout) {
      generateWorkout();
    } else {
      // Rebuild from the selected workout every time. This prevents a standalone warm-up
      // queue from being reused when the user comes back and starts the workout.
      buildQueueFromWorkout();
    }
  }

  function stripWarmupFromQueue(){
    const firstWorkoutIndex = queue.findIndex(item=>item && (item.phase === 'work' || item.phase === 'emom'));
    if (firstWorkoutIndex > 0) queue = queue.slice(firstWorkoutIndex);
  }

  function launchWorkout(skipWarmup){
    overlay.classList.remove('show');
    standaloneWarmupActive = false;
    pauseTimer();
    releaseWakeLock();
    rebuildWorkoutQueue();
    if (skipWarmup) stripWarmupFromQueue();
    current = null;
    queueIndex = -1;
    secondsLeft = 0;
    $('builderScreen').style.display = 'none';
    $('timerScreen').style.display = 'block';
    $('timerFormat').textContent = FORMATS[currentWorkout.format].name;
    resetTimer(false);
    window.scrollTo(0,0);
  }

  function askBeforeWorkout(){
    if (!currentWorkout) generateWorkout();
    const warmupSeconds = Number(currentWorkout?.warmup || 0);
    if (warmupSeconds <= 0) {
      launchWorkout(true);
      return;
    }
    const mins = Math.round(warmupSeconds/60);
    const copy = document.getElementById('fitlpStartCopy');
    if (copy) copy.textContent = `You selected a ${mins}-minute warm-up. Skip it and go straight to the workout?`;
    overlay.classList.add('show');
  }

  // Capture the click before the original Start workout handler runs.
  const startButton = $('startWorkoutBtn');
  if (startButton) {
    startButton.addEventListener('click',function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      askBeforeWorkout();
    },true);
  }

  $('fitlpSkipWarmupYes').addEventListener('click',()=>launchWorkout(true));
  $('fitlpSkipWarmupNo').addEventListener('click',()=>launchWorkout(false));
  overlay.addEventListener('click',e=>{ if(e.target===overlay) overlay.classList.remove('show'); });
})();
