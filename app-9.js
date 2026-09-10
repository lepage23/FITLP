// FITLP mobility warm-up transition time.
// Adds a short switch interval between stretch/mobility positions so there is time to reposition safely.
(function(){
  const SWITCH_SECONDS = 10;

  function isMobilityWarmup(item){
    return item && item.phase === 'warmup' && String(item.meta || '').startsWith('Warm-up movement');
  }

  function addMobilitySwitches(){
    if (!Array.isArray(queue) || !queue.length) return;
    if (queue.some(item=>item && item.fitlpMobilitySwitch)) return;

    const updated = [];
    for (let i=0;i<queue.length;i++) {
      const item = queue[i];
      const next = queue[i+1];
      updated.push(item);

      if (isMobilityWarmup(item) && isMobilityWarmup(next)) {
        updated.push({
          phase:'rest',
          label:'Switch position',
          target:`Get ready for ${next.label}`,
          duration:SWITCH_SECONDS,
          meta:'Mobility changeover',
          fitlpMobilitySwitch:true
        });
      }
    }
    queue = updated;
  }

  // Full workouts that include the guided mobility warm-up.
  const previousBuildQueueFromWorkout = buildQueueFromWorkout;
  buildQueueFromWorkout = function(){
    previousBuildQueueFromWorkout();
    addMobilitySwitches();
  };

  // Standalone Mobility & stretches mode.
  const previousBuildStandaloneWarmupQueue = buildStandaloneWarmupQueue;
  buildStandaloneWarmupQueue = function(){
    previousBuildStandaloneWarmupQueue();
    addMobilitySwitches();
  };

  // Make the extra changeover time clear in the warm-up preview.
  const previousRenderWarmupTab = renderWarmupTab;
  renderWarmupTab = function(){
    previousRenderWarmupTab();
    const heading = document.querySelector('#warmupTabContent .warmup-intro h1');
    if (heading && heading.textContent.trim() === 'Warm-up & mobility') {
      const sequence = warmupSequence();
      const switches = Math.max(0, sequence.length - 1);
      const extra = switches * SWITCH_SECONDS;
      const summary = $('warmupSummary');
      if (summary && !summary.textContent.includes('switch time')) {
        summary.textContent += ` · ${SWITCH_SECONDS}s switch time between positions (${extra}s total)`;
      }
    }
  };

  renderWarmupTab();
  generateWorkout();
})();
