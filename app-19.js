// FITLP seasonal contrast fix for obscure fact cards.
(function(){
  const style=document.createElement('style');
  style.id='fitlpFactContrastFix';
  style.textContent=`
    .fitlp-fact-card,
    .fitlp-fact-card span,
    #fitlpFactText,
    #fitlpPreviewFact{
      color:var(--text)!important;
    }
    .fitlp-fact-card strong,
    #fitlpPreviewFact strong{
      color:var(--work)!important;
    }
  `;
  document.head.appendChild(style);
})();
