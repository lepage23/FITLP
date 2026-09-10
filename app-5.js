// FITLP embedded exercise illustrations. These are inline SVG data URIs so GitHub Pages
// does not depend on separate binary image assets.
(function(){
  const BG='#f7f5f0', SKIN='#f0a26f', TOP='#5d78a3', LEG='#303746', MAT='#8192ab', DARK='#202631';
  const line=(x1,y1,x2,y2,w=12,c=SKIN)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;
  const db=(x,y)=>`<g fill="${DARK}"><rect x="${x-15}" y="${y-6}" width="30" height="12" rx="4"/><rect x="${x-25}" y="${y-17}" width="13" height="34" rx="5"/><rect x="${x+12}" y="${y-17}" width="13" height="34" rx="5"/></g>`;
  const kb=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})" fill="${DARK}"><circle cx="0" cy="8" r="20"/><path d="M-13 -3 Q-13 -24 0 -24 Q13 -24 13 -3" fill="none" stroke="${DARK}" stroke-width="8" stroke-linecap="round"/></g>`;
  const mat=`<rect x="25" y="260" width="350" height="24" rx="12" fill="${MAT}" opacity=".9"/>`;
  const head=(x,y)=>circle(x,y,18,'#4a342f')+circle(x-4,y+4,13,SKIN);
  const torso=(x,y,w=58,h=82,rot=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${TOP}" transform="rotate(${rot} ${x+w/2} ${y+h/2})"/>`;
  const foot=(x,y)=>`<ellipse cx="${x}" cy="${y}" rx="18" ry="7" fill="${SKIN}"/>`;
  const svg=(body)=>`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${BG}"/>${mat}${body}</svg>`)}`;

  function ill(type){
    switch(type){
      case 'child': return svg(
        head(235,185)+torso(150,155,90,48,-8)+line(165,190,110,225,18,LEG)+line(110,225,85,250,18,LEG)+line(195,180,285,225,12)+line(200,184,300,225,12)+foot(82,255)
      );
      case 'prayer': return svg(
        head(230,184)+torso(145,152,95,50,-7)+line(160,188,105,225,18,LEG)+line(105,225,82,250,18,LEG)+line(195,180,292,222,12)+line(200,184,292,222,12)+circle(300,222,7,SKIN)+foot(80,255)
      );
      case 'catcow': return svg(
        head(298,145)+`<path d="M115 175 Q195 110 275 170" fill="none" stroke="${TOP}" stroke-width="34" stroke-linecap="round"/>`+line(125,185,115,250,14,LEG)+line(255,185,265,250,14,LEG)+line(138,175,125,250,12)+line(260,175,285,250,12)+foot(112,255)+foot(270,255)
      );
      case 'thread': return svg(
        head(245,210)+torso(160,150,85,60,12)+line(165,195,120,245,16,LEG)+line(220,195,195,248,16,LEG)+line(210,182,285,230,11)+line(185,176,115,220,11)+foot(112,255)+foot(193,255)
      );
      case 'downdog': return svg(
        head(295,205)+`<path d="M105 215 L180 105 L285 220" fill="none" stroke="${TOP}" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>`+line(180,105,110,250,15,LEG)+line(180,105,210,245,15,LEG)+line(268,215,320,250,11)+line(280,220,345,250,11)+foot(103,257)+foot(211,250)
      );
      case 'world': return svg(
        head(255,125)+torso(205,130,55,78,-22)+line(220,200,165,252,17,LEG)+line(235,205,310,250,17,LEG)+line(230,155,180,235,11)+line(245,150,275,65,11)+foot(160,258)+foot(318,257)
      );
      case 'hamstring': return svg(
        head(235,80)+torso(190,90,55,85,25)+line(215,170,145,250,17,LEG)+line(215,170,285,250,17,LEG)+line(210,120,160,225,11)+line(225,125,175,225,11)+foot(140,258)+foot(292,258)
      );
      case 'hipflexor': return svg(
        head(210,72)+torso(180,92,60,85,0)+line(195,175,135,245,17,LEG)+line(210,175,290,245,17,LEG)+line(193,110,175,40,11)+line(225,110,245,40,11)+foot(130,255)+foot(300,255)
      );
      case 'hammer': return svg(
        head(200,55)+torso(170,78,60,95)+line(182,105,160,170,12)+line(218,105,240,170,12)+line(160,170,160,215,12)+line(240,170,240,215,12)+db(160,215)+db(240,215)+line(185,170,170,252,17,LEG)+line(215,170,230,252,17,LEG)+foot(168,258)+foot(232,258)
      );
      case 'curl': return svg(
        head(200,55)+torso(170,78,60,95)+line(182,105,160,165,12)+line(218,105,240,165,12)+line(160,165,178,125,12)+line(240,165,222,125,12)+db(178,125)+db(222,125)+line(185,170,170,252,17,LEG)+line(215,170,230,252,17,LEG)+foot(168,258)+foot(232,258)
      );
      case 'pinwheel': return svg(
        head(200,55)+torso(170,78,60,95)+line(182,105,158,165,12)+line(218,105,240,170,12)+line(158,165,205,125,12)+db(205,125)+db(240,215)+line(185,170,170,252,17,LEG)+line(215,170,230,252,17,LEG)+foot(168,258)+foot(232,258)
      );
      case 'press': return svg(
        head(200,65)+torso(170,88,60,90)+line(182,110,165,160,12)+line(165,160,165,205,12)+line(218,110,235,65,12)+line(235,65,235,25,12)+db(235,25)+line(185,175,170,252,17,LEG)+line(215,175,230,252,17,LEG)+foot(168,258)+foot(232,258)
      );
      case 'row': return svg(
        head(250,95)+torso(175,105,80,55,15)+line(190,145,145,215,17,LEG)+line(220,155,275,230,17,LEG)+line(205,120,170,185,11)+line(235,125,275,165,11)+db(170,190)+`<rect x="260" y="175" width="105" height="18" rx="8" fill="${DARK}"/>`+foot(140,250)+foot(285,240)
      );
      case 'kbswing': return svg(
        head(205,62)+torso(175,85,60,90,0)+line(185,115,150,155,11)+line(215,115,250,155,11)+line(150,155,200,190,11)+line(250,155,200,190,11)+kb(200,205,.85)+line(188,172,160,252,17,LEG)+line(212,172,240,252,17,LEG)+foot(158,258)+foot(242,258)
      );
      case 'goblet': return svg(
        head(200,65)+torso(170,92,60,80)+kb(200,132,.8)+line(182,110,170,135,11)+line(218,110,230,135,11)+line(185,170,145,245,19,LEG)+line(215,170,255,245,19,LEG)+foot(140,255)+foot(260,255)
      );
      case 'pushup': return svg(
        head(305,190)+`<path d="M95 205 L180 185 L285 200" fill="none" stroke="${TOP}" stroke-width="30" stroke-linecap="round"/>`+line(95,205,55,250,14,LEG)+line(180,190,120,250,14,LEG)+line(275,195,305,245,11)+line(285,198,335,245,11)+foot(50,258)+foot(115,258)
      );
      case 'bicycle': return svg(
        head(120,185)+torso(120,170,100,48,-10)+line(150,185,95,150,11)+line(150,185,110,125,11)+line(205,190,260,150,17,LEG)+line(205,190,310,220,17,LEG)+line(260,150,300,115,17,LEG)+line(310,220,355,220,17,LEG)+foot(305,110)+foot(362,222)
      );
      case 'situp': return svg(
        head(145,160)+torso(135,155,90,55,-20)+line(145,160,110,130,11)+line(160,160,125,125,11)+line(215,195,270,245,18,LEG)+line(215,195,330,245,18,LEG)+foot(278,255)+foot(338,255)
      );
    }
    return '';
  }

  const warmMap={
    "Child's pose":'child',
    "Kneeling prayer / lat stretch":'prayer',
    "Cat-cow":'catcow',
    "Thread the needle":'thread',
    "Downward dog pedal":'downdog'
  };
  WARMUP_MOVES.forEach(m=>{ if(warmMap[m.name]) m.image=ill(warmMap[m.name]); });

  const extras=[
    {name:"World's greatest stretch",note:"Step one foot forward into a long lunge, place a hand down and rotate the other arm towards the ceiling. Alternate sides.",area:"Full body",image:ill('world')},
    {name:"Hamstring sweeps",note:"Put one heel forward with a soft supporting knee and sweep your hands down towards the toes. Alternate sides.",area:"Hamstrings",image:ill('hamstring')},
    {name:"Half-kneeling hip flexor stretch",note:"One knee down, one foot forward. Gently tuck the pelvis and move the hips forward. Switch sides halfway through.",area:"Hip flexors",image:ill('hipflexor')}
  ];
  extras.forEach(m=>{if(!WARMUP_MOVES.some(x=>x.name===m.name))WARMUP_MOVES.push(m);});

  warmupSequence=function(seconds=warmupDuration){
    const count=seconds<=120?4:seconds<=180?6:8;
    const moves=WARMUP_MOVES.slice(0,count), per=Math.floor(seconds/moves.length); let rem=seconds-per*moves.length;
    return moves.map(m=>({...m,duration:per+(rem-->0?1:0)}));
  };

  const exMap={
    "Hammer curls":'hammer',"Regular curls":'curl',"Pinwheel curls":'pinwheel',"Single-arm shoulder press":'press',"One-arm dumbbell row":'row',
    "Kettlebell swings":'kbswing',"Kettlebell goblet squat":'goblet',"Push ups":'pushup',"Bicycle crunches":'bicycle',"Sit ups":'situp'
  };
  EXERCISES.forEach(ex=>{if(exMap[ex.name])ex.image=ill(exMap[ex.name]);});

  const s=document.createElement('style');
  s.textContent=`#workoutList .exercise-row.has-img{grid-template-columns:34px 76px 1fr auto}.exercise-thumb{width:76px;height:76px;object-fit:cover;border-radius:12px;background:#f5f5f4;border:1px solid #343a46}@media(max-width:620px){#workoutList .exercise-row.has-img{grid-template-columns:34px 68px 1fr}.exercise-thumb{width:68px;height:68px}#workoutList .exercise-row.has-img .pill{display:none}}`;
  document.head.appendChild(s);

  const oldBuild=buildQueueFromWorkout;
  buildQueueFromWorkout=function(){
    oldBuild();
    queue.forEach(item=>{if(item.phase==='work'||item.phase==='emom'){const ex=EXERCISES.find(e=>e.name===item.label);if(ex?.image)item.image=ex.image;}});
  };

  const oldPreview=renderPreview;
  renderPreview=function(){
    oldPreview();
    document.querySelectorAll('#workoutList .exercise-row').forEach((row,i)=>{
      const ex=currentWorkout?.exercises?.[i]; if(!ex?.image||row.querySelector('.exercise-thumb'))return;
      row.classList.add('has-img'); const img=document.createElement('img'); img.className='exercise-thumb'; img.src=ex.image; img.alt=ex.name;
      row.insertBefore(img,row.children[1]);
    });
  };

  renderWarmupTab();
  generateWorkout();
})();
