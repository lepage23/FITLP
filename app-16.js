// FITLP fact clarity patch: make context-dependent facts stand alone when shuffled.
(function(){
  const REWRITES = new Map([
    ["Its one-centimetre nose carries about 25,000 touch organs and 100,000 nerve endings.", "A star-nosed mole's one-centimetre nose carries about 25,000 touch organs and 100,000 nerve endings."],
    ["The same manuscript then reverses the joke and shows cats besieging a mouse castle.", "A 1320s English prayer book shows cats besieging a mouse castle, reversing another scene in the book where mice attack a cat's castle."],
    ["In that same book, a drawn rabbit dives into a hole on one page and emerges on the other side.", "One medieval prayer book shows a drawn rabbit diving into a hole on one page and emerging on the facing page."]
  ]);

  function rewriteFactCard(){
    const text = document.getElementById('fitlpFactText');
    if (!text) return;
    const replacement = REWRITES.get(text.textContent.trim());
    if (replacement) text.textContent = replacement;
  }

  function init(){
    if (typeof renderTimer !== 'function') return;
    const previousRenderTimer = renderTimer;
    renderTimer = function(){
      previousRenderTimer();
      rewriteFactCard();
    };
    rewriteFactCard();
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, {once:true});
  } else {
    setTimeout(init, 0);
  }
})();
