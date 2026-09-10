// FITLP keyboard shortcut: Spacebar skips the current timer step.
(function(){
  function isEditableTarget(target){
    if (!target || !(target instanceof Element)) return false;
    return !!target.closest('input, textarea, select, [contenteditable="true"]');
  }

  function timerIsVisible(){
    const screen = document.getElementById('timerScreen');
    return !!screen && getComputedStyle(screen).display !== 'none';
  }

  document.addEventListener('keydown',function(e){
    if (e.code !== 'Space' || e.repeat || e.ctrlKey || e.altKey || e.metaKey) return;
    if (isEditableTarget(e.target)) return;
    if (!timerIsVisible()) return;
    if (document.getElementById('fitlpStartOverlay')?.classList.contains('show')) return;
    if (!current || current.phase === 'done') return;

    e.preventDefault();
    skipStep();
  });

  const skipButton = document.getElementById('skipBtn');
  if (skipButton) {
    skipButton.title = 'Skip current step (Spacebar)';
    skipButton.setAttribute('aria-keyshortcuts','Space');
  }
})();
