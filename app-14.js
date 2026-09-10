// FITLP quick fact: one short random fact per generated workout.
(function(){
  const FACTS = [
    'Octopuses have three hearts.',
    'A day on Venus is longer than a year on Venus.',
    'Sharks existed before trees.',
    'Antarctica is the largest desert on Earth.',
    'The dot above a lowercase i or j is called a tittle.',
    'Oxford University was teaching students before the Aztec Empire existed.',
    'Cleopatra lived closer to the Moon landing than to the building of the Great Pyramid.',
    'Bananas are berries, botanically speaking.',
    'A group of flamingos is called a flamboyance.',
    'The human body has 206 bones in adulthood.',
    'Saturn would float in water if you had a bathtub big enough.',
    'The Eiffel Tower can grow slightly taller in hot weather as the metal expands.',
    'Wombat droppings are cube-shaped.',
    'The fingerprints of koalas can look remarkably similar to human fingerprints.',
    'Scotland has more than 790 offshore islands.',
    'The shortest war on record lasted less than an hour.',
    'The Pacific Ocean is larger than all Earth’s land area combined.',
    'Light from the Sun takes about eight minutes to reach Earth.',
    'The average cloud can weigh hundreds of tonnes.',
    'A bolt of lightning can heat the air around it to hotter than the surface of the Sun.',
    'The Moon is moving away from Earth by about 3.8 cm each year.',
    'An ostrich’s eye is bigger than its brain.',
    'Sea otters sometimes hold hands while sleeping so they do not drift apart.',
    'The heart of a blue whale is roughly the size of a small car.',
    'There are more possible chess games than atoms in the observable universe.',
    'The word “muscle” comes from a Latin word meaning “little mouse”.',
    'The first recorded marathon winner at the modern Olympics was Spyridon Louis in 1896.',
    'Humans share roughly half their DNA with bananas, depending on how the comparison is made.',
    'A teaspoon of neutron-star material would weigh billions of tonnes on Earth.',
    'The Great Wall of China is not visible from the Moon with the naked eye.',
    'Some bamboo species can grow more than 90 cm in a single day.',
    'Crows can recognise individual human faces.',
    'Ravens are capable of planning for future events.',
    'The Roman Empire used concrete that could survive seawater for centuries.',
    'There are lakes beneath Antarctica’s ice sheet.',
    'Mount Everest grows by a few millimetres each year because of tectonic movement.',
    'The largest known living organism by area is a fungus in Oregon.',
    'A snail can have thousands of tiny teeth on its radula.',
    'The colour orange was named after the fruit in English, not the other way round.',
    'The ampersand symbol was once treated as the 27th character of the English alphabet.'
  ];

  const style = document.createElement('style');
  style.textContent = `
    .fitlp-fact-card{margin:0 0 18px;padding:12px 14px;border:1px solid #343a46;border-radius:12px;background:#171b22;color:#dfe3ea;font-size:13px;line-height:1.45}
    .fitlp-fact-card strong{color:#a7f3d0;margin-right:6px}
    .fitlp-preview-fact{margin-top:12px}
  `;
  document.head.appendChild(style);

  const timerAnchor = document.querySelector('#timerScreen .upnext');
  const factCard = document.createElement('div');
  factCard.id = 'fitlpFactCard';
  factCard.className = 'fitlp-fact-card';
  factCard.innerHTML = '<strong>Quick fact:</strong><span id="fitlpFactText"></span>';
  if (timerAnchor) timerAnchor.insertAdjacentElement('afterend', factCard);

  function pickFact(){
    let last = -1;
    try { last = Number(localStorage.getItem('fitlpLastFactIndex')); } catch(e) {}
    let idx = Math.floor(Math.random() * FACTS.length);
    if (FACTS.length > 1 && idx === last) idx = (idx + 1 + Math.floor(Math.random() * (FACTS.length - 1))) % FACTS.length;
    try { localStorage.setItem('fitlpLastFactIndex', String(idx)); } catch(e) {}
    return FACTS[idx];
  }

  function ensureFact(){
    if (!currentWorkout) return;
    if (!currentWorkout.fitlpFact) currentWorkout.fitlpFact = pickFact();
  }

  function renderFact(){
    const card = document.getElementById('fitlpFactCard');
    const text = document.getElementById('fitlpFactText');
    if (!card || !text) return;
    const show = !!currentWorkout && !standaloneWarmupActive;
    card.style.display = show ? '' : 'none';
    if (show) {
      ensureFact();
      text.textContent = currentWorkout.fitlpFact;
    }
  }

  function renderPreviewFact(){
    const preview = document.getElementById('previewCard');
    if (!preview || !currentWorkout) return;
    ensureFact();
    let el = document.getElementById('fitlpPreviewFact');
    if (!el) {
      el = document.createElement('div');
      el.id = 'fitlpPreviewFact';
      el.className = 'fitlp-fact-card fitlp-preview-fact';
      const actions = preview.querySelector('.actions');
      if (actions) actions.insertAdjacentElement('beforebegin', el);
      else preview.appendChild(el);
    }
    el.innerHTML = `<strong>Quick fact:</strong>${escapeHtml(currentWorkout.fitlpFact)}`;
  }

  const previousGenerateWorkout = generateWorkout;
  generateWorkout = function(){
    previousGenerateWorkout();
    if (currentWorkout) currentWorkout.fitlpFact = pickFact();
    renderPreviewFact();
    renderFact();
  };

  const previousRenderPreview = renderPreview;
  renderPreview = function(){
    previousRenderPreview();
    renderPreviewFact();
  };

  const previousRenderTimer = renderTimer;
  renderTimer = function(){
    previousRenderTimer();
    renderFact();
  };

  // Existing workout on page load.
  ensureFact();
  renderPreviewFact();
  renderFact();
})();
