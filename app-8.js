// FITLP interval countdown audio: bop, bop, bop, BEEP.
// Applies to active exercise intervals, including warm-ups and shadow-boxing rounds.
(function(){
  const originalTick = tick;

  function isActiveInterval(item){
    return item && ['work','emom','warmup'].includes(item.phase);
  }

  tick = function(){
    if (!current || current.phase === 'done') return;

    const active = isActiveInterval(current);

    // Audible countdown on the displayed 3, 2 and 1 seconds.
    if (active && secondsLeft <= 3 && secondsLeft > 0) {
      beep(420, .09);
    }

    secondsLeft--;

    if (secondsLeft <= 0) {
      const nextIndex = queueIndex + 1;
      if (nextIndex < queue.length) {
        const next = queue[nextIndex];

        // Higher, longer note marks the end of the exercise interval.
        // The final workout step already has its own completion tone, so do not double-beep it.
        if (active && next.phase !== 'done') {
          beep(920, .28);
        } else if (!active && (next.phase === 'work' || next.phase === 'emom' || next.phase === 'warmup')) {
          // Single cue when a rest finishes and it is time to move again.
          beep(720, .16);
        }

        loadStep(nextIndex, true);
      }
      return;
    }

    renderTimer();
  };
})();
