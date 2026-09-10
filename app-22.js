// FITLP seasonal-theme contrast fixes for warm-up mode controls.
(function(){
  const style=document.createElement('style');
  style.id='fitlpWarmupModeContrastFix';
  style.textContent=`
    .warmup-mode-btn{
      background:var(--panel2)!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
    }
    .warmup-mode-btn.active{
      background:var(--accent-soft)!important;
      color:var(--text)!important;
      border-color:var(--accent)!important;
    }
    .warmup-fixed-length{
      background:var(--dark)!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
    }
  `;
  document.head.appendChild(style);
})();
