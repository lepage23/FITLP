// FITLP obscure fact mode: 100 researched facts, one new fact per exercise interval.
// The same fact stays visible through the rest immediately after that exercise.
// Research sources include NASA, NOAA, Natural History Museum, Kew, British Library,
// British Museum, Smithsonian and the Science History Institute.
(function(){
  const FACTS = [
    "The deep-sea 'headless chicken monster' is actually a swimming sea cucumber.",
    "Some sea cucumbers eject sticky internal organs through their anus, then regrow them.",
    "Some Actinopyga sea cucumbers have five calcified tube feet nicknamed 'anal teeth'.",
    "The gummy-squirrel sea cucumber has 18 feeding tentacles on its red underside.",
    "Some deep-sea sea cucumbers may launch themselves by suddenly expelling waste.",
    "Sea cucumbers have been evolving along their own branch for at least 450 million years.",
    "A group of sea cucumbers is sometimes called a 'pickle'.",
    "The blue-dragon sea slug floats upside down at the ocean surface.",
    "Blue-dragon sea slugs selectively keep the larger stinging cells stolen from their prey.",
    "Some nudibranchs steal intact jellyfish stinging cells and fire them at their own predators.",
    "The so-called sea bunny is a nudibranch only about one centimetre long.",
    "A mantis shrimp can strike prey at roughly 23 metres per second.",
    "A mantis-shrimp strike can create cavitation bubbles that briefly produce heat and light.",
    "Some mantis shrimps have as many as 16 types of photoreceptor.",
    "Each mantis-shrimp eye can estimate distance independently.",
    "A frogfish can open its mouth in about six milliseconds.",
    "Frogfish can walk along the seabed using their pectoral and pelvic fins.",
    "Frogfish can jet-propel themselves by blasting water through gill openings.",
    "A frogfish hunts with a modified dorsal spine that functions like a fishing rod.",
    "Some frogfish can swallow prey as large as, or larger than, themselves.",
    "A star-nosed mole has exactly 22 fleshy rays around its nostrils.",
    "Its one-centimetre nose carries about 25,000 touch organs and 100,000 nerve endings.",
    "A star-nosed mole can touch up to 12 objects every second.",
    "Star-nosed moles have roughly twice the lung capacity of other mole species.",
    "Electrophorus varii can generate electric shocks of up to about 860 volts.",
    "Electric eels use weaker pulses for navigation, prey detection and courtship.",
    "Alessandro Volta's work on the first battery was influenced by studying electric eels.",
    "Common tenrecs can produce litters of up to 30 young and have 36 nipples.",
    "Lowland streaked tenrecs rub specialised quills together to make ultrasonic sounds.",
    "Tenrecs are more closely related to elephants than to hedgehogs.",
    "Some shrew tenrecs may use a form of echolocation to find food.",
    "The Mexican burrowing toad spends most of the year underground and emerges after heavy rain to breed.",
    "Okapis were unknown to Western science until the early 1900s.",
    "Canada lynx have broad padded paws that function like snowshoes.",
    "Bracken Cave in Texas can hold an estimated 20 million Mexican free-tailed bats.",
    "Some cave ecosystems are fuelled largely by mountains of bat guano.",
    "Colugos can glide for 100 metres or more between trees.",
    "A colugo's gliding membrane stretches from its face to its fingers, toes and tail.",
    "Pseudoscorpions are only about 2–8 millimetres long despite their scorpion-like pincers.",
    "Common potoos camouflage themselves by freezing in poses that resemble broken branches.",
    "Reef octopuses can change not just skin colour but skin texture using papillae.",
    "Some leaf katydids imitate leaves so precisely they appear spotted, ragged or partly eaten.",
    "California sea lions' teeth gradually turn black as they age.",
    "Alligator snapping turtles lure prey with a worm-like appendage on the tongue.",
    "Some caecilian embryos scrape their mother's oviduct and drink nutrient-rich fluid.",
    "Some egg-laying caecilian young eat fatty layers of their mother's skin.",
    "Ophiocordyceps fungi can drive infected insects to climb before the host dies.",
    "The ghost plant has no chlorophyll and gets nutrients through fungi connected to tree roots.",
    "Octopus stinkhorn fungus emerges from an egg-like structure before unfurling red arms.",
    "Octopus stinkhorn smells like rotting flesh to recruit insects that spread its spores.",
    "White baneberry fruit is highly toxic to humans, while many birds can eat it.",
    "Low's pitcher plant is shaped so tree shrews can feed above it and defecate into the pitcher.",
    "Bat pitcher plants reflect bat ultrasound, helping woolly bats locate them as roosts.",
    "A Venus flytrap normally needs two rapid trigger-hair touches before it snaps shut.",
    "A closed Venus flytrap waits for more trigger-hair stimulation before spending energy on digestion.",
    "Titan arum mimics both the smell and appearance of rotting flesh to attract pollinators.",
    "A spider-infecting fungus named for David Attenborough was first spotted in a disused gunpowder store.",
    "Victoria amazonica waterlily leaves can reach about three metres across.",
    "Some sunflowers can take up heavy metals such as lead and uranium from contaminated soil.",
    "The titan arum is native to Sumatra's forests.",
    "Neptune's moon Triton orbits in the opposite direction to Neptune's rotation.",
    "Galileo's 1993 flyby of asteroid Ida revealed its tiny moon, later named Dactyl.",
    "Pluto's moon Charon is roughly half Pluto's size.",
    "Europa's hidden saltwater ocean may contain about twice as much water as Earth's global ocean.",
    "On Titan, methane and ethane can rain, flow through rivers and collect in seas.",
    "Io is the most volcanically active world known in the Solar System.",
    "Mercury and Venus have no moons; Venus does have a named quasi-satellite, Zoozve.",
    "Miranda's chopped-up surface shows scars of enormous ancient impacts.",
    "About 99.9% of ordinary matter in space is in the plasma state.",
    "HD 189733 b may have glass-laced clouds driven sideways by winds around 5,400 mph.",
    "Kepler-70 b has been estimated at roughly 6,800°C and may be evaporating.",
    "Astronomers have found rocky exoplanets thought to be covered by global oceans of lava.",
    "Voyager 1 is in interstellar space but could take thousands of years to pass beyond the Oort Cloud.",
    "Parts of a spacecraft can differ by about 33°C simply between sunlight and shade.",
    "A 1320s English prayer book shows mice laying siege to a cat's castle.",
    "The same manuscript then reverses the joke and shows cats besieging a mouse castle.",
    "A medieval margin shows an armed rabbit hunting a dog with a bow.",
    "One medieval prayer book contains an orchestra of cats, pigs, dogs and rabbits.",
    "In that same book, a drawn rabbit dives into a hole on one page and emerges on the other side.",
    "An Old English medical miscellany contains remedies involving plants, animals and charms.",
    "A 10th-century medical manuscript includes drawings of herbs, scorpions and snakes.",
    "One medieval medical manuscript preserved a table of medical weights written in hexameter verse.",
    "A medieval tract on bloodletting includes drawings of the instruments used for phlebotomy.",
    "Fourteenth-century surgeon John Arderne wrote a detailed account of treating an anal fistula.",
    "A physician's medieval notebook mixed surgery, magic, astrology, uroscopy and even a culinary recipe.",
    "In one illuminated medical manuscript, the artist's original instructions are still visible beneath the decoration.",
    "A Sudanese woman's body, naturally mummified in hot sand, preserved an ancient tattoo.",
    "The earliest tangible Egyptian tattooed mummies date to around 2000 BC and include dot-and-dash patterns.",
    "A 2019 Heathrow seizure contained around 190 fake cuneiform clay tablets.",
    "The British Museum's 'Unlucky Mummy' is actually a wooden mummy-board, and its curse stories have no factual basis.",
    "A Pompeii 'sorceress kit' reported in 2019 contained roughly 100 small objects.",
    "One archaeological find highlighted in 2019 was an intact chicken egg about 1,700 years old.",
    "In 1909, treasure hunters secretly dug in Jerusalem for the Ark of the Covenant using an alleged biblical cipher.",
    "Norwegian ice preserved an ancient arrow with animal sinew and pitch still binding the stone point.",
    "Fragments of an early glaciologists' stone shelter were carried miles by moving ice before being rediscovered.",
    "Penicillin researcher Mary Hunt was nicknamed 'Moldy Mary' for hunting useful mould strains, including on cantaloupe.",
    "A guinea pig played an unlikely role in experiments that helped identify the rare element astatine.",
    "Francesco Redi tested and challenged spontaneous generation about two centuries before Pasteur.",
    "Evidence from fossil fish suggests the Chicxulub asteroid struck during Northern Hemisphere spring.",
    "The Chicxulub impactor may have been travelling at roughly 46,000 miles per hour."
  ];

  const BAG_KEY = 'fitlpObscureFactBagV3';
  const LAST_KEY = 'fitlpLastObscureFactIndexV3';

  function shuffledIndices(){
    const arr = Array.from({length:FACTS.length},(_,i)=>i);
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
    let last=-1;
    try{ last=Number(localStorage.getItem(LAST_KEY)); }catch(e){}
    if(arr.length>1 && arr[0]===last) [arr[0],arr[1]]=[arr[1],arr[0]];
    return arr;
  }

  function loadBag(){
    try{
      const parsed=JSON.parse(localStorage.getItem(BAG_KEY)||'[]');
      if(Array.isArray(parsed)){
        const seen=new Set();
        const clean=parsed.filter(i=>Number.isInteger(i)&&i>=0&&i<FACTS.length&&!seen.has(i)&&(seen.add(i),true));
        if(clean.length) return clean;
      }
    }catch(e){}
    return shuffledIndices();
  }

  function drawFact(){
    let bag=loadBag();
    if(!bag.length) bag=shuffledIndices();
    const idx=bag.shift();
    try{
      localStorage.setItem(BAG_KEY,JSON.stringify(bag));
      localStorage.setItem(LAST_KEY,String(idx));
    }catch(e){}
    return FACTS[idx];
  }

  function segmentForCurrent(){
    if(!currentWorkout || standaloneWarmupActive || !current || !Array.isArray(queue) || queueIndex<0) return -1;
    if(current.phase==='warmup' || current.phase==='done') return -1;
    let segment=-1;
    for(let i=0;i<=queueIndex;i++){
      const item=queue[i];
      if(item && (item.phase==='work' || item.phase==='emom')) segment++;
    }
    return segment;
  }

  function factForSegment(segment){
    if(segment<0 || !currentWorkout) return '';
    if(!Array.isArray(currentWorkout.fitlpExerciseFacts)) currentWorkout.fitlpExerciseFacts=[];
    if(!currentWorkout.fitlpExerciseFacts[segment]) currentWorkout.fitlpExerciseFacts[segment]=drawFact();
    return currentWorkout.fitlpExerciseFacts[segment];
  }

  function renderExerciseFact(){
    const card=document.getElementById('fitlpFactCard');
    const text=document.getElementById('fitlpFactText');
    if(!card || !text) return;

    const segment=segmentForCurrent();
    const show=segment>=0 && current && (current.phase==='work' || current.phase==='emom' || current.phase==='rest');
    card.style.display=show?'':'none';
    if(!show) return;

    const fact=factForSegment(segment);
    const label=card.querySelector('strong');
    if(label) label.textContent=`Fact ${segment+1}:`;
    text.textContent=fact;
  }

  function renderPreviewInfo(){
    const el=document.getElementById('fitlpPreviewFact');
    if(!el) return;
    el.innerHTML='<strong>Obscure fact mode:</strong> 100 properly weird facts loaded. You get a new one with every exercise, and it stays on screen through the following rest.';
  }

  const previousGenerateWorkout=generateWorkout;
  generateWorkout=function(){
    previousGenerateWorkout();
    if(currentWorkout) currentWorkout.fitlpExerciseFacts=[];
    renderPreviewInfo();
    renderExerciseFact();
  };

  const previousRenderPreview=renderPreview;
  renderPreview=function(){
    previousRenderPreview();
    renderPreviewInfo();
  };

  const previousRenderTimer=renderTimer;
  renderTimer=function(){
    previousRenderTimer();
    renderExerciseFact();
  };

  renderPreviewInfo();
  renderExerciseFact();
})();
