// FITLP whole-session progress bar and custom workout completion message.
(function(){
  const COMPLETION_MESSAGE = 'Fuck yeah boyo, up the RAH';

  const style = document.createElement('style');
  style.textContent = `
    .overall-progress-wrap{margin:-7px 0 22px;text-align:left}
    .overall-progress-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:7px;color:#9ba3b2;font-size:12px;font-weight:700}
    .overall-progress-track{height:12px;background:#262a31;border:1px solid #303542;border-radius:999px;overflow:hidden}
    .overall-progress-fill{height:100%;width:0;background:#4ade80;border-radius:999px;transition:width .35s linear}
    .overall-progress-fill.complete{box-shadow:0 0 16px rgba(74,222,128,.45)}
  `;
  document.head.appendChild(style);

  const intervalBar = document.querySelector('#timerScreen .bar');
  if (intervalBar && !document.getElementById('overallProgressTrack')) {
    const wrap = document.createElement('div');
    wrap.className = 'overall-progress-wrap';
    wrap.innerHTML = `
      <div class="overall-progress-head">
        <span>Overall progress</span>
        <span id="overallProgressPercent">0%</span>
      </div>
      <div class="overall-progress-track" id="overallProgressTrack">
        <div class="overall-progress-fill" id="overallProgressFill"></div>
      </div>`;
    intervalBar.insertAdjacentElement('afterend', wrap);
  }

  function overallProgress(){
    if (!Array.isArray(queue) || !queue.length || !current) return 0;

    const timed = queue.map(item=>Math.max(0, Number(item?.duration) || 0));
    const total = timed.reduce((sum,n)=>sum+n,0);
    if (total <= 0) return current?.phase === 'done' ? 100 : 0;
    if (current.phase === 'done') return 100;

    let completed = 0;
    for (let i=0;i<queueIndex;i++) completed += timed[i] || 0;
    const currentDuration = timed[queueIndex] || 0;
    completed += Math.max(0, currentDuration - Math.max(0, Number(secondsLeft) || 0));

    return Math.max(0, Math.min(100, (completed / total) * 100));
  }

  function renderOverallProgress(){
    const pct = overallProgress();
    const rounded = Math.round(pct);
    const fill = document.getElementById('overallProgressFill');
    const label = document.getElementById('overallProgressPercent');
    if (fill) {
      fill.style.width = `${pct}%`;
      fill.classList.toggle('complete', pct >= 99.999);
    }
    if (label) label.textContent = `${rounded}%`;
  }

  // app-7 creates the fireworks overlay before this file loads, so customise its copy here.
  const celebration = document.getElementById('fitlpCelebrationText');
  if (celebration) {
    celebration.innerHTML = `${COMPLETION_MESSAGE}<small>WORKOUT COMPLETE</small>`;
  }

  const previousRenderTimer = renderTimer;
  renderTimer = function(){
    previousRenderTimer();
    renderOverallProgress();

    // Only replace the final screen for a full workout. Standalone warm-ups keep their own completion copy.
    if (current?.phase === 'done' && !standaloneWarmupActive && currentWorkout) {
      const exerciseEl = document.getElementById('exercise');
      const targetEl = document.getElementById('target');
      if (exerciseEl) exerciseEl.textContent = COMPLETION_MESSAGE;
      if (targetEl) targetEl.textContent = 'Workout complete';
    }
  };

  renderOverallProgress();
})();
