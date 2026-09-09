function chooseExercises(count, equipment, focus, mustTerms, avoidTerms, lowImpact, includeTags=[], avoidTags=[]) {
  const must = [];
  const custom = [];

  mustTerms.forEach(term=>{
    const match = findExercise(term);
    if (match) {
      // Avoid always wins if the same movement is both required and excluded.
      if (!isAvoided(match,avoidTerms,avoidTags) && !must.some(e=>e.name===match.name)) must.push(match);
    } else if (!categoryTermToTag(term)) {
      custom.push({name:term, eq:"custom", tags:["custom"], target:"Work steadily", impact:"low"});
    }
  });

  const compatible = ex=>
    equipment.includes(ex.eq) &&
    !(lowImpact && ex.impact === "high") &&
    !isAvoided(ex,avoidTerms,avoidTags);

  // Explicit include-focus buttons guarantee at least one compatible station from each chosen area.
  const categoryPicks = [];
  [...includeTags].forEach(tag=>{
    if (avoidTags.has ? avoidTags.has(tag) : [...avoidTags].includes(tag)) return;
    let candidates = EXERCISES.filter(ex=>compatible(ex) && ex.tags.includes(tag) && !must.some(m=>m.name===ex.name) && !categoryPicks.some(m=>m.name===ex.name));
    if (candidates.length) categoryPicks.push(shuffle(candidates)[0]);
  });

  let picked = [...must, ...custom, ...categoryPicks].slice(0,count);
  let pool = EXERCISES.filter(ex=>
    compatible(ex) &&
    allowedByFocus(ex,focus) &&
    !picked.some(m=>m.name===ex.name)
  );

  const targets = categoryTargets(focus);
  let targetIndex = 0;

  while (picked.length < count && pool.length) {
    const target = targets[targetIndex % targets.length];
    targetIndex++;
    let candidates = pool.filter(e=>e.tags.includes(target));
    if (!candidates.length) candidates = pool;
    const candidate = shuffle(candidates)[0];
    picked.push(candidate);
    pool = pool.filter(e=>e.name!==candidate.name);
  }

  // If the focus-filtered pool was too small, fill from any compatible exercise, but never break an Avoid rule.
  if (picked.length < count) {
    let fallback = EXERCISES.filter(ex=>compatible(ex) && !picked.some(p=>p.name===ex.name));
    while (picked.length < count && fallback.length) {
      const candidate = shuffle(fallback)[0];
      picked.push(candidate);
      fallback = fallback.filter(e=>e.name!==candidate.name);
    }
  }
  return picked;
}

function workoutLabel(format, plan) {
  if (format === "tabata") return `${plan.blocks} Tabata pairs`;
  if (format === "emom") return `${plan.minutes} EMOM minutes`;
  return `${plan.stations} stations × ${plan.rounds} rounds`;
}

function generateWorkout() {
  const equipmentText = $("equipmentInput").value;
  const equipment = parseEquipment(equipmentText);
  const duration = Number($("durationSelect").value);
  const focus = $("focusSelect").value;
  const warmup = Number($("warmupSelect").value);
  const must = splitTerms($("mustInclude").value);
  const avoid = parseAvoidTerms($("avoidInput").value);
  const lowImpact = $("lowImpact").checked;
  const plan = estimatePlan(selectedFormat,duration,warmup);
  const exercises = chooseExercises(plan.stations,equipment,focus,must,avoid,lowImpact,includeFocusTags,avoidFocusTags);

  currentWorkout = { format:selectedFormat, equipmentText, equipment, duration, focus, warmup, plan, exercises, avoid, includeFocus:[...includeFocusTags], avoidFocus:[...avoidFocusTags], voice:$("voiceCues").checked };
  buildQueueFromWorkout();
  renderPreview();
  savePrefs();
}

function buildQueueFromWorkout() {
  queue = [];
  const w = currentWorkout;
  if (!w) return;
  if (w.warmup > 0) {
    const avoidingSquats = isAvoided({name:"Squats",tags:["lower"]}, w.avoid || [], w.avoidFocus || []);
    const warmupTarget = avoidingSquats
      ? "March on the spot, arm circles, hip hinges and light mobility"
      : "Move through easy squats, arm circles and light mobility";
    queue.push({phase:"warmup",label:"Warm up",target:warmupTarget,duration:w.warmup,meta:"Warm-up"});
  }

  if (w.format === "tabata") {
    for (let b=0;b<w.plan.blocks;b++) {
      const pair = [w.exercises[b*2], w.exercises[b*2+1]].filter(Boolean);
      for (let i=0;i<8;i++) {
        const ex = pair[i%pair.length];
        queue.push({phase:"work",label:ex.name,target:ex.target,duration:20,meta:`Tabata pair ${b+1} of ${w.plan.blocks} · interval ${i+1} of 8`});
        const lastInterval = i===7;
        queue.push({phase:"rest",label:lastInterval?"Pair complete":"Rest",target:lastInterval?"Catch your breath":"10 seconds",duration:lastInterval?60:10,meta:`Tabata pair ${b+1} of ${w.plan.blocks}`});
      }
      if (b===w.plan.blocks-1) queue.pop(); // remove final 60 sec recovery
    }
  } else if (w.format === "emom") {
    for (let m=0;m<w.plan.minutes;m++) {
      const ex = w.exercises[m%w.exercises.length];
      queue.push({phase:"emom",label:ex.name,target:`${ex.target} · rest for the remainder of the minute`,duration:60,meta:`Minute ${m+1} of ${w.plan.minutes}`});
    }
  } else {
    const f = FORMATS[w.format];
    for (let r=1;r<=w.plan.rounds;r++) {
      w.exercises.forEach((ex,i)=>{
        queue.push({phase:"work",label:ex.name,target:ex.target,duration:f.work,meta:`Round ${r} of ${w.plan.rounds} · station ${i+1} of ${w.exercises.length}`});
        const isVeryLast = r===w.plan.rounds && i===w.exercises.length-1;
        if (!isVeryLast && f.rest>0) queue.push({phase:"rest",label:"Rest / switch",target:"Get ready for the next station",duration:f.rest,meta:`Round ${r} of ${w.plan.rounds}`});
      });
    }
  }
  queue.push({phase:"done",label:"Workout complete",target:"Nice work",duration:0,meta:""});
}

function renderPreview() {
  const w = currentWorkout;
  if (!w) return;
  $("previewCard").classList.remove("hidden");
  const mins = Math.round(w.plan.estimated/60);
  $("workoutSummary").innerHTML = `<span><strong>${FORMATS[w.format].name}</strong></span><span>${workoutLabel(w.format,w.plan)} · about ${mins} mins incl. warm-up</span>`;
  $("workoutList").innerHTML = w.exercises.map((ex,i)=>`
    <div class="exercise-row">
      <div class="num">${i+1}</div>
      <div><div class="ex-name">${escapeHtml(ex.name)}</div><div class="ex-note">${escapeHtml(ex.target)}</div></div>
      <div class="pill">${ex.eq === "bodyweight" ? "Bodyweight" : ex.eq === "dumbbell" ? "Dumbbell" : ex.eq === "kettlebell" ? "Kettlebell" : ex.eq === "bench" ? "Bench" : "Custom"}</div>
    </div>`).join("");

  const recognised = w.equipment.filter(e=>e!=="bodyweight").length;
  const notices = [];
  if (!recognised) notices.push("I could not recognise any equipment keywords, so this workout uses bodyweight plus any custom exercises you forced in.");
  if (w.includeFocus?.length) notices.push(`Include focus: ${w.includeFocus.map(t=>escapeHtml(FOCUS_LABELS[t]||t)).join(", ")}.`);
  const avoidLabels = [...(w.avoidFocus||[]).map(t=>FOCUS_LABELS[t]||t), ...(w.avoid||[])];
  if (avoidLabels.length) notices.push(`Avoiding: ${avoidLabels.map(escapeHtml).join(", ")}.`);
  $("parseNotice").innerHTML = notices.map(n=>`<div class="notice">${n}</div>`).join("");
}

function escapeHtml(s) {
  return String(s).replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[c]));
}

function fmt(s) {
  s = Math.max(0,Math.round(s));
  const m = Math.floor(s/60), sec=s%60;
  return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
}

function beep(freq=660,dur=.12) {
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
    const osc=audioCtx.createOscillator(), gain=audioCtx.createGain();
    osc.frequency.value=freq; osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(.12,audioCtx.currentTime); osc.start(); osc.stop(audioCtx.currentTime+dur);
  } catch(e) {}
}

function speak(text) {
  if (!soundOn || !currentWorkout?.voice || !window.speechSynthesis || !text) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05; u.pitch = 1;
    window.speechSynthesis.speak(u);
  } catch(e) {}
}

async function requestWakeLock() {
  try {
    if ("wakeLock" in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request("screen");
      $("wakeStatus").textContent = "Screen stay-awake active";
      wakeLock.addEventListener("release",()=>{ wakeLock=null; $("wakeStatus").textContent=""; });
    }
  } catch(e) { $("wakeStatus").textContent=""; }
}

function releaseWakeLock() {
  if (wakeLock) { wakeLock.release().catch(()=>{}); wakeLock=null; }
}

function showTimer() {
  if (!currentWorkout) generateWorkout();
  resetTimer(false);
  $("builderScreen").style.display="none";
  $("timerScreen").style.display="block";
  $("timerFormat").textContent=FORMATS[currentWorkout.format].name;
  window.scrollTo(0,0);
}
