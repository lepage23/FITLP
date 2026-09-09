function showBuilder() {
  pauseTimer(); releaseWakeLock();
  $("timerScreen").style.display="none";
  $("builderScreen").style.display="block";
}

function loadStep(index, announce=true) {
  queueIndex = clamp(index,0,queue.length-1);
  current = queue[queueIndex];
  secondsLeft = current.duration;
  renderTimer();
  if (announce && !["rest","done"].includes(current.phase)) speak(current.label);
  if (current.phase === "done") {
    pauseTimer(); releaseWakeLock(); beep(880,.5);
    if (currentWorkout?.voice) speak("Workout complete");
  }
}

function startTimer() {
  if (running) return;
  if (!current) loadStep(0,true);
  if (current.phase === "done") return;
  running=true; $("startPauseBtn").textContent="Pause";
  requestWakeLock();
  timerId=setInterval(tick,1000);
}

function pauseTimer() {
  running=false; clearInterval(timerId); timerId=null;
  $("startPauseBtn").textContent="Start";
}

function tick() {
  if (!current || current.phase === "done") return;
  if (secondsLeft<=3 && secondsLeft>0 && current.phase!=="warmup") beep(440,.08);
  secondsLeft--;
  if (secondsLeft <= 0) {
    const nextIndex=queueIndex+1;
    if (nextIndex < queue.length) {
      beep(queue[nextIndex].phase==="work"||queue[nextIndex].phase==="emom"?720:540,.12);
      loadStep(nextIndex,true);
    }
    return;
  }
  renderTimer();
}

function skipStep() {
  if (!current) { loadStep(0,true); return; }
  if (queueIndex < queue.length-1) { beep(660,.1); loadStep(queueIndex+1,true); }
}

function backStep() {
  if (!current || queueIndex<=0) { loadStep(0,false); return; }
  loadStep(queueIndex-1,true);
}

function resetTimer(announce=false) {
  pauseTimer(); releaseWakeLock(); current=null; queueIndex=-1; secondsLeft=0;
  if (queue.length) loadStep(0,announce);
  pauseTimer(); renderTimer();
}

function renderTimer() {
  if (!current) return;
  $("phase").className=`phase ${current.phase}`;
  $("phase").textContent=current.phase==="warmup"?"Warm up":current.phase==="work"?"Work":current.phase==="emom"?"EMOM":current.phase==="rest"?"Rest":"Done";
  $("exercise").textContent=current.label;
  $("target").textContent=current.target||"";
  $("time").textContent=fmt(secondsLeft);
  $("meta").textContent=current.meta||"";
  const pct=current.duration>0?((current.duration-secondsLeft)/current.duration)*100:100;
  $("barFill").style.width=`${pct}%`;
  $("barFill").className=`bar-fill ${current.phase==="rest"?"rest":current.phase==="warmup"?"warmup":""}`;
  const next=queue[queueIndex+1];
  $("upnext").innerHTML=next?`Up next: <strong>${escapeHtml(next.label)}</strong>${next.target?`<br>${escapeHtml(next.target)}`:""}`:"Finished";
  $("startPauseBtn").textContent=running?"Pause":"Start";
}

function savePrefs() {
  const data={
    equipment:$("equipmentInput").value,duration:$("durationSelect").value,focus:$("focusSelect").value,warmup:$("warmupSelect").value,
    format:selectedFormat,must:$("mustInclude").value,avoid:$("avoidInput").value,includeFocus:[...includeFocusTags],avoidFocus:[...avoidFocusTags],low:$("lowImpact").checked,voice:$("voiceCues").checked
  };
  try { localStorage.setItem("workoutBuilderPrefs",JSON.stringify(data)); $("savedStatus").textContent="Settings saved on this device"; } catch(e) {}
}

function loadPrefs() {
  try {
    const raw=localStorage.getItem("workoutBuilderPrefs"); if(!raw) return;
    const d=JSON.parse(raw);
    if(d.equipment) $("equipmentInput").value=d.equipment;
    if(d.duration) $("durationSelect").value=d.duration;
    if(d.focus) $("focusSelect").value=d.focus;
    if(d.warmup!==undefined) $("warmupSelect").value=d.warmup;
    if(d.must!==undefined) $("mustInclude").value=d.must;
    if(d.avoid!==undefined) $("avoidInput").value=d.avoid;
    includeFocusTags.clear(); (d.includeFocus||[]).forEach(t=>includeFocusTags.add(t));
    avoidFocusTags.clear(); (d.avoidFocus||[]).forEach(t=>avoidFocusTags.add(t));
    syncFocusChips();
    $("lowImpact").checked=!!d.low;
    $("voiceCues").checked=d.voice!==false;
    if(d.format && FORMATS[d.format]) selectedFormat=d.format;
  } catch(e) {}
}

function syncFocusChips() {
  document.querySelectorAll(".focus-chip").forEach(btn=>{
    const set = btn.dataset.group === "include" ? includeFocusTags : avoidFocusTags;
    btn.classList.toggle("active",set.has(btn.dataset.tag));
  });
}

function toggleFocusChip(btn) {
  const tag = btn.dataset.tag;
  const isInclude = btn.dataset.group === "include";
  const target = isInclude ? includeFocusTags : avoidFocusTags;
  const opposite = isInclude ? avoidFocusTags : includeFocusTags;
  if (target.has(tag)) target.delete(tag);
  else {
    target.add(tag);
    // A body area cannot be both required and excluded. The most recent tap wins.
    opposite.delete(tag);
  }
  syncFocusChips();
}

function setFormat(format) {
  selectedFormat=format;
  document.querySelectorAll(".format-btn").forEach(b=>b.classList.toggle("active",b.dataset.format===format));
  $("formatDesc").textContent=FORMATS[format].desc;
}

document.querySelectorAll(".format-btn").forEach(btn=>btn.addEventListener("click",()=>setFormat(btn.dataset.format)));
document.querySelectorAll(".focus-chip").forEach(btn=>btn.addEventListener("click",()=>toggleFocusChip(btn)));
$("generateBtn").addEventListener("click",generateWorkout);
$("shuffleBtn").addEventListener("click",generateWorkout);
$("startWorkoutBtn").addEventListener("click",showTimer);
$("backToBuilderBtn").addEventListener("click",showBuilder);
$("skipBtn").addEventListener("click",skipStep);
$("backBtn").addEventListener("click",backStep);
$("resetBtn").addEventListener("click",()=>resetTimer(false));
$("startPauseBtn").addEventListener("click",()=>running?pauseTimer():startTimer());
$("soundToggleBtn").addEventListener("click",()=>{ soundOn=!soundOn; $("soundToggleBtn").textContent=soundOn?"Sound on":"Sound off"; if(!soundOn && window.speechSynthesis) window.speechSynthesis.cancel(); });
document.addEventListener("visibilitychange",()=>{ if(document.visibilityState==="visible" && running) requestWakeLock(); });

loadPrefs();
syncFocusChips();
setFormat(selectedFormat);
generateWorkout();
