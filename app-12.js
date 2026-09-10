// FITLP custom full-workout completion voice line.
(function(){
  const COMPLETE_LINE = 'Work out complete, fuck yeah boyo, up the raaaaah!';
  const previousLoadStep = loadStep;

  loadStep = function(index, announce=true){
    const next = Array.isArray(queue) ? queue[Math.max(0, Math.min(index, queue.length - 1))] : null;
    const isFullWorkoutDone = next?.phase === 'done' && !standaloneWarmupActive && !!currentWorkout;

    if (!isFullWorkoutDone) {
      previousLoadStep(index, announce);
      return;
    }

    // Suppress the older generic "Workout complete" voice cue, then speak the custom line once.
    const voiceWasOn = !!currentWorkout.voice;
    currentWorkout.voice = false;
    previousLoadStep(index, announce);
    currentWorkout.voice = voiceWasOn;

    if (voiceWasOn && soundOn) {
      speak(COMPLETE_LINE);
    }
  };

  // Load keyboard shortcuts after the existing timer logic has finished initialising.
  const shortcutScript = document.createElement('script');
  shortcutScript.src = 'app-13.js';
  document.body.appendChild(shortcutScript);
})();
