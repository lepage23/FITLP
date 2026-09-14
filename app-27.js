// FITLP single-station rerolls and copyable workout summary.
(function(){
  const layout=document.createElement('style');
  layout.textContent=`
    #workoutList .exercise-row{grid-template-columns:34px minmax(0,1fr) auto 38px}
    #workoutList .exercise-row.has-img{grid-template-columns:34px 76px minmax(0,1fr) auto 38px!important}
    #workoutList .exercise-row.fitlp-commons-row{grid-template-columns:34px 92px minmax(0,1fr) auto 38px!important}
    #workoutList .exercise-row.fitlp-media-row{grid-template-columns:34px 104px minmax(0,1fr) auto 38px!important}
    @media(max-width:620px){
      #workoutList .exercise-row{grid-template-columns:34px minmax(0,1fr) 38px}
      #workoutList .exercise-row.has-img{grid-template-columns:34px 68px minmax(0,1fr) 38px!important}
      #workoutList .exercise-row.fitlp-commons-row{grid-template-columns:34px 74px minmax(0,1fr) 38px!important}
      #workoutList .exercise-row.fitlp-media-row{grid-template-columns:34px 76px minmax(0,1fr) 38px!important}
      #workoutList .exercise-row .pill{display:none}
    }
  `;
  document.head.appendChild(layout);

  function compatibleReplacement(ex,index){
    const w=currentWorkout;
    if(!w) return false;
    const used=new Set(w.exercises.filter((_,i)=>i!==index).map(item=>item.name));
    return w.equipment.includes(ex.eq)
      && !(w.lowImpact && ex.impact==='high')
      && !isAvoided(ex,w.avoid||[],w.avoidFocus||[])
      && !used.has(ex.name)
      && ex.name!==w.exercises[index]?.name;
  }

  function rerollExercise(index){
    const w=currentWorkout;
    const previous=w?.exercises?.[index];
    if(!w || !previous) return;

    let candidates=EXERCISES.filter(ex=>compatibleReplacement(ex,index) && allowedByFocus(ex,w.focus));

    // Keep any include-focus category that only this station currently fulfils.
    const requiredTags=(w.includeFocus||[]).filter(tag=>
      (previous.tags||[]).includes(tag)
      && !w.exercises.some((ex,i)=>i!==index && (ex.tags||[]).includes(tag))
    );
    if(requiredTags.length){
      const requiredCandidates=candidates.filter(ex=>requiredTags.every(tag=>(ex.tags||[]).includes(tag)));
      if(requiredCandidates.length) candidates=requiredCandidates;
    }

    // Prefer a similar movement category so one reroll does not unbalance the workout.
    const similar=candidates.filter(ex=>(ex.tags||[]).some(tag=>(previous.tags||[]).includes(tag)));
    if(similar.length) candidates=similar;
    if(!candidates.length) candidates=EXERCISES.filter(ex=>compatibleReplacement(ex,index));

    if(!candidates.length){
      const notice=document.createElement('div');
      notice.className='notice';
      notice.textContent='No other exercise matches those settings. Change the equipment or avoid list and try again.';
      $('parseNotice')?.appendChild(notice);
      return;
    }

    w.exercises[index]=shuffle(candidates)[0];
    buildQueueFromWorkout();
    renderPreview();
  }

  function addRerollButtons(){
    document.querySelectorAll('#workoutList .exercise-row').forEach((row,index)=>{
      if(row.querySelector('.reroll-exercise-btn')) return;
      const name=currentWorkout?.exercises?.[index]?.name||`exercise ${index+1}`;
      const button=document.createElement('button');
      button.type='button';
      button.className='reroll-exercise-btn';
      button.setAttribute('aria-label',`Change ${name}`);
      button.title='Change this exercise';
      button.textContent='↻';
      button.addEventListener('click',()=>rerollExercise(index));
      row.appendChild(button);
    });
  }

  function equipmentLabel(eq){
    if(eq==='bodyweight') return 'bodyweight';
    if(eq==='dumbbell') return 'dumbbell';
    if(eq==='kettlebell') return 'kettlebell';
    if(eq==='bench') return 'bench';
    return 'custom';
  }

  function timingLine(w){
    if(w.format==='tabata') return `20s on/10s off, ${w.plan.blocks} Tabata pairs`;
    if(w.format==='emom') return `${w.plan.minutes}-minute EMOM, ${w.exercises.length} exercises`;
    const format=FORMATS[w.format];
    return `${format.work}s on/${format.rest}s off, ${w.plan.stations} stations x ${w.plan.rounds} rounds`;
  }

  function warmupLine(w){
    if(!w.warmup) return 'Warm-up: None';
    const names=typeof warmupSequence==='function'
      ? warmupSequence(w.warmup).map(move=>move.name).join(', ')
      : 'Warm up';
    return `Warm-up: ${Math.round(w.warmup/60)} min - ${names}`;
  }

  function workoutListText(){
    const w=currentWorkout;
    if(!w) return '';
    const lines=['Gym Check In!','',warmupLine(w),timingLine(w),''];
    w.exercises.forEach(ex=>lines.push(`${ex.name} (${equipmentLabel(ex.eq)}) – ${ex.target}`));
    return lines.join('\n');
  }

  function refreshExport(){
    const field=$('workoutExportText');
    if(field) field.value=workoutListText();
    const status=$('workoutCopyStatus');
    if(status) status.textContent='';
  }

  const previousRenderPreview=renderPreview;
  renderPreview=function(){
    previousRenderPreview();
    addRerollButtons();
    if(!$('workoutExportBox')?.classList.contains('hidden')) refreshExport();
  };

  $('generateWorkoutListBtn')?.addEventListener('click',()=>{
    $('workoutExportBox')?.classList.remove('hidden');
    refreshExport();
    $('workoutExportText')?.focus();
    $('workoutExportText')?.select();
  });

  $('copyWorkoutListBtn')?.addEventListener('click',async()=>{
    const text=workoutListText();
    try{
      await navigator.clipboard.writeText(text);
    }catch(e){
      $('workoutExportText')?.focus();
      $('workoutExportText')?.select();
      document.execCommand('copy');
    }
    $('workoutCopyStatus').textContent='Workout list copied';
  });

  addRerollButtons();
})();
