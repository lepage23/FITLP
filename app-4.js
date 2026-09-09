const WARMUP_MOVES = [
  { name:"Child's pose", note:"Sit the hips back towards your heels, stretch both arms forward and let the chest sink towards the floor.", area:"Back + shoulders", image:"images/childs-pose.webp" },
  { name:"Kneeling prayer / lat stretch", note:"Kneel, put your hands together, keep your arms long and reach forward as you sit the hips back.", area:"Lats + shoulders", image:"images/kneeling-prayer-lat-stretch.webp" },
  { name:"Cat-cow", note:"On hands and knees, slowly round your back, then gently drop the chest and lift the head.", area:"Back + core", image:"images/cat-cow.webp" },
  { name:"Thread the needle", note:"From hands and knees, slide one arm underneath the other and rotate through the upper back. Switch sides halfway through.", area:"Upper back", image:"images/thread-the-needle.webp" },
  { name:"Downward dog pedal", note:"Push the hips up and back, then alternate bending each knee to gently stretch the calves and hamstrings.", area:"Hamstrings + calves", image:"images/downward-dog-pedal.webp" }
];

let warmupDuration = 180;
let standaloneWarmupActive = false;

(function addWarmupImageStyles(){
  const style = document.createElement("style");
  style.textContent = `
    .warmup-row{grid-template-columns:34px 88px 1fr auto!important}
    .warmup-thumb{width:88px;height:88px;object-fit:cover;border-radius:12px;background:#f5f5f4;border:1px solid #343a46}
    .timer-warmup-image{display:none;justify-content:center;margin:0 0 18px}
    .timer-warmup-image img{width:min(340px,82vw);max-height:300px;object-fit:contain;border-radius:18px;background:#f5f5f4;border:1px solid #303542}
    @media(max-width:620px){.warmup-row{grid-template-columns:34px 76px 1fr!important}.warmup-thumb{width:76px;height:76px}.warmup-row .pill{display:none}}
  `;
  document.head.appendChild(style);

  const exercise = $("exercise");
  if (exercise && !document.getElementById("timerWarmupImage")) {
    const wrap = document.createElement("div");
    wrap.id = "timerWarmupImage";
    wrap.className = "timer-warmup-image";
    wrap.innerHTML = '<img id="timerWarmupImageEl" alt="Warm-up illustration">';
    exercise.parentNode.insertBefore(wrap, exercise);
  }
})();

function warmupSequence(seconds=warmupDuration) {
  const moveCount = seconds <= 120 ? 3 : seconds <= 180 ? 4 : 5;
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
      <img class="warmup-thumb" src="${escapeHtml(move.image)}" alt="${escapeHtml(move.name)}" loading="lazy">
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
    meta:`Warm-up movement ${i+1} of ${sequence.length}`,
    image:move.image
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

// Replace the generic single warm-up block with guided picture-based movements.
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
    meta:`Warm-up movement ${i+1} of ${sequence.length}`,
    image:move.image
  }));
  queue.splice(warmupIndex,1,...steps);
};

function renderCurrentWarmupImage() {
  const wrap = document.getElementById("timerWarmupImage");
  const img = document.getElementById("timerWarmupImageEl");
  if (!wrap || !img) return;
  if (current?.image) {
    img.src = current.image;
    img.alt = current.label || "Warm-up illustration";
    wrap.style.display = "flex";
  } else {
    wrap.style.display = "none";
    img.removeAttribute("src");
  }
}

const originalRenderTimer = renderTimer;
renderTimer = function() {
  originalRenderTimer();
  renderCurrentWarmupImage();
};

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
generateWorkout();
