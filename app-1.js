const FORMATS = {
  f45: { name:"F45-style 40/20", desc:"40 seconds work, 20 seconds transition. Exercises rotate as stations and repeat for several laps.", work:40, rest:20 },
  quick: { name:"Quick circuit 30/15", desc:"Faster changes: 30 seconds work, 15 seconds transition. Useful when you want more movement and less grinding.", work:30, rest:15 },
  strength: { name:"Strength 45/15", desc:"45 seconds on each strength station with 15 seconds to change. Slower reps, more control.", work:45, rest:15 },
  tabata: { name:"Tabata rotate 20/10", desc:"20 seconds hard, 10 seconds off. Two exercises alternate for 8 intervals, then you get 60 seconds before the next pair.", work:20, rest:10 },
  emom: { name:"EMOM 60 sec", desc:"A new exercise starts every minute. Hit the rep target, then use whatever remains of the minute as rest.", work:60, rest:0 }
};

const EXERCISES = [
  {name:"Hammer curls", eq:"dumbbell", tags:["arms","upper","pull"], target:"8–12 each arm", impact:"low"},
  {name:"Regular curls", eq:"dumbbell", tags:["arms","upper","pull"], target:"8–12 each arm", impact:"low"},
  {name:"Pinwheel curls", eq:"dumbbell", tags:["arms","upper","pull"], target:"8–12 each arm", impact:"low"},
  {name:"Single-arm shoulder press", eq:"dumbbell", tags:["upper","push","compound"], target:"8–12 each arm", impact:"low"},
  {name:"Single-arm floor press", eq:"dumbbell", tags:["upper","push","compound"], target:"8–12 each arm", impact:"low"},
  {name:"One-arm dumbbell row", eq:"dumbbell", tags:["upper","pull","compound"], target:"10–12 each arm", impact:"low"},
  {name:"Dumbbell goblet squat", eq:"dumbbell", tags:["lower","compound"], target:"10–15 reps", impact:"low"},
  {name:"Dumbbell Romanian deadlift", eq:"dumbbell", tags:["lower","hinge","compound"], target:"10–15 reps", impact:"low"},
  {name:"Dumbbell reverse lunge", eq:"dumbbell", tags:["lower","compound"], target:"8–10 each side", impact:"low"},
  {name:"Dumbbell thruster", eq:"dumbbell", tags:["lower","upper","push","cardio","compound"], target:"8–12 reps", impact:"medium"},
  {name:"Dumbbell clean to press", eq:"dumbbell", tags:["upper","lower","cardio","compound"], target:"6–10 each arm", impact:"medium"},
  {name:"Suitcase march", eq:"dumbbell", tags:["core","conditioning"], target:"Controlled marching", impact:"low"},

  {name:"Kettlebell swings", eq:"kettlebell", tags:["lower","hinge","cardio","compound"], target:"15–20 reps", impact:"medium"},
  {name:"Kettlebell goblet squat", eq:"kettlebell", tags:["lower","compound"], target:"12–15 reps", impact:"low"},
  {name:"Kettlebell deadlift", eq:"kettlebell", tags:["lower","hinge","compound"], target:"12–15 reps", impact:"low"},
  {name:"Kettlebell reverse lunge", eq:"kettlebell", tags:["lower","compound"], target:"8–10 each side", impact:"low"},
  {name:"Kettlebell one-arm row", eq:"kettlebell", tags:["upper","pull","compound"], target:"10–12 each arm", impact:"low"},
  {name:"Kettlebell shoulder press", eq:"kettlebell", tags:["upper","push"], target:"8–10 each arm", impact:"low"},
  {name:"Kettlebell halo", eq:"kettlebell", tags:["upper","core"], target:"6–8 each direction", impact:"low"},
  {name:"Kettlebell high pull", eq:"kettlebell", tags:["upper","cardio","compound"], target:"8–12 each arm", impact:"medium"},

  {name:"Push ups", eq:"bodyweight", tags:["upper","push","compound"], target:"10–20 reps", impact:"low"},
  {name:"Bicycle crunches", eq:"bodyweight", tags:["core"], target:"20–30 reps", impact:"low"},
  {name:"Sit ups", eq:"bodyweight", tags:["core"], target:"12–20 reps", impact:"low"},
  {name:"Dead bugs", eq:"bodyweight", tags:["core"], target:"8–12 each side", impact:"low"},
  {name:"Shoulder taps", eq:"bodyweight", tags:["core","upper"], target:"16–24 taps", impact:"low"},
  {name:"Bodyweight squats", eq:"bodyweight", tags:["lower"], target:"15–25 reps", impact:"low"},
  {name:"Speed squats", eq:"bodyweight", tags:["lower","cardio"], target:"Fast, controlled reps", impact:"medium"},
  {name:"Split squats", eq:"bodyweight", tags:["lower"], target:"10–15 each side", impact:"low"},
  {name:"Reverse lunges", eq:"bodyweight", tags:["lower"], target:"10–12 each side", impact:"low"},
  {name:"Glute bridges", eq:"bodyweight", tags:["lower","core"], target:"15–20 reps", impact:"low"},
  {name:"Mountain climbers", eq:"bodyweight", tags:["cardio","core"], target:"Fast, controlled reps", impact:"medium"},
  {name:"High knees", eq:"bodyweight", tags:["cardio"], target:"Keep moving", impact:"high"},
  {name:"Burpees", eq:"bodyweight", tags:["cardio","compound"], target:"Steady reps", impact:"high"},
  {name:"Squat jumps", eq:"bodyweight", tags:["lower","cardio"], target:"Explosive reps", impact:"high"},

  {name:"Bench step ups", eq:"bench", tags:["lower","cardio"], target:"10–12 each side", impact:"medium"},
  {name:"Bench dips", eq:"bench", tags:["upper","push","arms"], target:"8–15 reps", impact:"low"},
  {name:"Elevated push ups", eq:"bench", tags:["upper","push"], target:"10–20 reps", impact:"low"}
];

let selectedFormat = "f45";
const includeFocusTags = new Set();
const avoidFocusTags = new Set();
const FOCUS_LABELS = { upper:"Upper body", arms:"Arms", core:"Core", lower:"Lower body", cardio:"Cardio" };
let currentWorkout = null;
let queue = [];
let queueIndex = -1;
let current = null;
let secondsLeft = 0;
let running = false;
let timerId = null;
let soundOn = true;
let wakeLock = null;
let audioCtx = null;

const $ = id => document.getElementById(id);
const clamp = (n,min,max) => Math.max(min,Math.min(max,n));

function shuffle(arr) {
  const copy = [...arr];
  for (let i=copy.length-1;i>0;i--) {
    const j = Math.floor(Math.random()*(i+1));
    [copy[i],copy[j]]=[copy[j],copy[i]];
  }
  return copy;
}

function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
}

function parseEquipment(text) {
  const t = normalise(text);
  const found = new Set(["bodyweight"]);
  if (/dumbbell|dumbell|\bdb\b/.test(t)) found.add("dumbbell");
  if (/kettlebell|kettle bell|\bkb\b/.test(t)) found.add("kettlebell");
  if (/bench|box|chair|step/.test(t)) found.add("bench");
  return [...found];
}

function splitTerms(text) {
  return text.split(/,|\n|;/).map(s=>s.trim()).filter(Boolean);
}

function rootWord(word) {
  let w = normalise(word);
  if (!w) return "";
  if (w.endsWith("ing") && w.length > 5) w = w.slice(0,-3);
  if (w.endsWith("ies") && w.length > 4) w = w.slice(0,-3) + "y";
  else if (/(sses|xes|ches|shes|zes)$/.test(w)) w = w.slice(0,-2);
  else if (w.endsWith("s") && !w.endsWith("ss") && w.length > 3) w = w.slice(0,-1);
  return w;
}

function rootPhrase(text) {
  return normalise(text).split(" ").map(rootWord).filter(Boolean).join(" ");
}

function cleanAvoidTerm(term) {
  let t = normalise(term);
  t = t.replace(/^(please )?(avoid|skip|exclude|without|remove|leave out) /, "");
  t = t.replace(/^(please )?(no|not) /, "");
  t = t.replace(/^(please )?(do not|don t|dont) (include|use|give me) /, "");
  t = t.replace(/^(please )?i (do not|don t|dont) want /, "");
  return t.trim();
}

function parseAvoidTerms(text) {
  return text
    .split(/[,;\n.!?]+|\band\b/i)
    .map(cleanAvoidTerm)
    .filter(Boolean);
}

function categoryTermToTag(term) {
  const t = rootPhrase(cleanAvoidTerm(term));
  if (["upper", "upper body"].includes(t)) return "upper";
  if (["lower", "lower body", "leg", "legs"].includes(t)) return "lower";
  if (["core", "ab", "abs", "abdominal", "abdominals"].includes(t)) return "core";
  if (["arm", "arms", "bicep", "biceps", "tricep", "triceps"].includes(t)) return "arms";
  if (["cardio", "conditioning"].includes(t)) return "cardio";
  return null;
}

function isAvoided(ex, avoidTerms, avoidTags=[]) {
  const tags = ex.tags || [];
  if ([...avoidTags].some(tag=>tags.includes(tag))) return true;
  const exRoot = rootPhrase(ex.name);
  return avoidTerms.some(term => {
    const categoryTag = categoryTermToTag(term);
    if (categoryTag && tags.includes(categoryTag)) return true;
    const avoidRoot = rootPhrase(term);
    if (!avoidRoot) return false;
    return exRoot.includes(avoidRoot) || avoidRoot.includes(exRoot);
  });
}

function findExercise(term) {
  const n = normalise(term);
  if (!n) return null;
  let exact = EXERCISES.find(e=>normalise(e.name)===n);
  if (exact) return exact;
  let fuzzy = EXERCISES.find(e=>normalise(e.name).includes(n) || n.includes(normalise(e.name)));
  if (fuzzy) return fuzzy;
  const words = n.split(" ").filter(w=>w.length>3);
  return EXERCISES.find(e=>words.length && words.every(w=>normalise(e.name).includes(w))) || null;
}

function allowedByFocus(ex, focus) {
  if (focus === "full") return true;
  if (focus === "upper") return ex.tags.some(t=>["upper","arms","push","pull","core"].includes(t));
  if (focus === "lower") return ex.tags.some(t=>["lower","cardio","core"].includes(t));
  if (focus === "armscore") return ex.tags.some(t=>["arms","core","upper"].includes(t));
  if (focus === "conditioning") return ex.tags.some(t=>["cardio","compound","conditioning","lower","core"].includes(t));
  return true;
}

function categoryTargets(focus) {
  if (focus === "upper") return ["push","pull","arms","core","upper","push","pull","arms","core","upper"];
  if (focus === "lower") return ["lower","hinge","core","lower","cardio","lower","core","hinge","lower","cardio"];
  if (focus === "armscore") return ["arms","core","arms","upper","core","arms","push","core","pull","arms"];
  if (focus === "conditioning") return ["cardio","compound","lower","core","cardio","compound","lower","cardio","core","compound"];
  return ["push","lower","pull","core","cardio","arms","lower","upper","core","compound"];
}

function estimatePlan(format, totalMinutes, warmupSec) {
  const usable = Math.max(360,totalMinutes*60-warmupSec);
  if (format === "tabata") {
    const blockSec = 8*30 + 60; // 4 mins work/rest + 1 min block recovery
    const blocks = clamp(Math.floor((usable+60)/blockSec),1,8);
    return { blocks, stations:blocks*2, rounds:blocks, estimated:warmupSec + blocks*240 + Math.max(0,blocks-1)*60 };
  }
  if (format === "emom") {
    const minutes = Math.max(6,Math.floor(usable/60));
    const stations = clamp(totalMinutes<=20?5:6,4,8);
    const rounds = Math.ceil(minutes/stations);
    return { minutes, stations, rounds, estimated:warmupSec+minutes*60 };
  }
  const f = FORMATS[format];
  let rounds = totalMinutes <= 15 ? 2 : totalMinutes <= 20 ? 3 : totalMinutes <= 35 ? 3 : 4;
  const slot = f.work + f.rest;
  let stations = Math.floor(usable/(rounds*slot));
  stations = clamp(stations,5,10);
  let estimated = warmupSec + rounds*stations*slot;
  while (estimated > totalMinutes*60 + 45 && stations > 5) {
    stations--;
    estimated = warmupSec + rounds*stations*slot;
  }
  return { stations, rounds, estimated };
}
