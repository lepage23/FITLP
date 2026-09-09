const WARMUP_MOVES = [
  { name:"March + arm swings", note:"Easy pace. Let the arms swing naturally and loosen the shoulders.", area:"Full body" },
  { name:"Shoulder rolls + arm circles", note:"15 seconds each direction. Keep the movement smooth.", area:"Upper body" },
  { name:"Standing torso rotations", note:"Rotate through the upper back with relaxed hips and knees.", area:"Core" },
  { name:"Hip openers", note:"Lift one knee, circle it out, then alternate sides.", area:"Lower body" },
  { name:"Hamstring sweeps", note:"Heel forward, soft supporting knee, sweep the hands towards the toes.", area:"Lower body" },
  { name:"World's greatest stretch", note:"Alternate sides. Step long, reach down, then rotate the chest open.", area:"Full body" },
  { name:"Walking knee hugs", note:"Bring the knee gently towards the chest, release, then alternate.", area:"Lower body" },
  { name:"Reverse lunge + overhead reach", note:"Step back, reach tall, return to standing and alternate sides.", area:"Full body" },
  { name:"Inchworms", note:"Fold forward, walk the hands to a high plank, then walk back in.", area:"Full body" },
  { name:"Calf raises + ankle rocks", note:"Move slowly through the ankles and use a comfortable range.", area:"Lower body" }
];

let warmupDuration = 180;
let standaloneWarmupActive = false;

function warmupSequence(seconds=warmupDuration) {
  const moveCount = seconds <= 120 ? 4 : seconds <= 180 ? 6 : 10;
  const moves = WARMUP_MOVES.slice(0,moveCount);
  const perMove = Math.floor(seconds / moves.length);
  let remainder = seconds - perMove * moves.length;
  return moves.map(move=>({ ...move, duration:perMove + (remainder-- > 0 ? 1 : 0) }));
}

function renderWarmupTab() {
  const sequence = warmupSequence();
  $("warmupSummary").textContent = `${Math.round(warmupDuration/60)} minute warm-up · ${sequence.length} movements`;
  $("warmupList").innerHTML = sequence.map((move,i)=>`
    <div class="exercise-row warmup-row">
      <div class="num">${i+1}</div>
      <div>
        <div class="ex-name">${escapeHtml(move.name)}</div>
        <div class="ex-note">${escapeHtml(move.note)}</div>
      </div>
      <div class="pill">${move.duration}s</div>
    </div>`).join("");
  document.querySelectorAll(".warmup-length-btn").forEach(btn=>{
    btn.classList.toggle("active",Number(btn.dataset.seconds)===warmupDuration);
  });
}

function selectMainTab(tab) {
  const warmup = tab === "warmup";
  $("workoutTabContent").classList.toggle("hidden",warmup);
  $("warmupTabContent").classList.toggle("hidden",!warmup);
  $("workoutTabBtn").classList.toggle("active",!warmup);
  $("warmupTabBtn").classList.toggle("active",warmup);
  window.scrollTo(0,0);
}

function buildStandaloneWarmupQueue() {
  const sequence = warmupSequence();
  queue = sequence.map((move,i)=>({
    phase:"warmup",
    label:move.name,
    target:move.note,
    duration:move.duration,
    meta:`Warm-up movement ${i+1} of ${sequence.length}`
  }));
  queue.push({phase:"done",label:"Warm-up complete",target:"Ready for your workout",duration:0,meta:""});
}

function startStandaloneWarmup() {
  standaloneWarmupActive = true;
  pauseTimer();
  releaseWakeLock();
  buildStandaloneWarmupQueue();
  current = null;
  queueIndex = -1;
  secondsLeft = 0;
  $("builderScreen").style.display="none";
  $("timerScreen").style.display="block";
  $("timerFormat").textContent=`Warm-up · ${Math.round(warmupDuration/60)} mins`;
  resetTimer(false);
  window.scrollTo(0,0);
}

// Upgrade the workout queue so its selected warm-up is guided movement-by-movement.
const originalBuildQueueFromWorkout = buildQueueFromWorkout;
buildQueueFromWorkout = function() {
  originalBuildQueueFromWorkout();
  const w = currentWorkout;
  if (!w || w.warmup <= 0) return;
  const warmupIndex = queue.findIndex(item=>item.phase==="warmup");
  if (warmupIndex < 0) return;
  const sequence = warmupSequence(w.warmup);
  const steps = sequence.map((move,i)=>({
    phase:"warmup",
    label:move.name,
    target:move.note,
    duration:move.duration,
    meta:`Warm-up movement ${i+1} of ${sequence.length}`
  }));
  queue.splice(warmupIndex,1,...steps);
};

// Keep the completion cue correct when the separate warm-up timer is used.
const originalLoadStep = loadStep;
loadStep = function(index,announce=true) {
  queueIndex = clamp(index,0,queue.length-1);
  current = queue[queueIndex];
  secondsLeft = current.duration;
  renderTimer();
  if (announce && !["rest","done"].includes(current.phase)) speak(current.label);
  if (current.phase === "done") {
    pauseTimer();
    releaseWakeLock();
    beep(880,.5);
    if (currentWorkout?.voice) speak(standaloneWarmupActive ? "Warm-up complete" : "Workout complete");
  }
};

const originalShowTimer = showTimer;
showTimer = function() {
  standaloneWarmupActive = false;
  originalShowTimer();
};

$("workoutTabBtn").addEventListener("click",()=>selectMainTab("workout"));
$("warmupTabBtn").addEventListener("click",()=>selectMainTab("warmup"));
document.querySelectorAll(".warmup-length-btn").forEach(btn=>btn.addEventListener("click",()=>{
  warmupDuration = Number(btn.dataset.seconds);
  renderWarmupTab();
}));
$("startWarmupBtn").addEventListener("click",startStandaloneWarmup);

renderWarmupTab();
// Rebuild the initial generated workout so it also gets the guided warm-up sequence.
generateWorkout();
