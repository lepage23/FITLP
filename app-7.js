// FITLP workout-complete fireworks. Runs only after a full workout, not standalone warm-ups.
(function(){
  let fireworksRunning = false;

  const style = document.createElement('style');
  style.textContent = `
    #fitlpFireworksCanvas{
      position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;
      z-index:9999;display:none;
    }
    #fitlpCelebrationText{
      position:fixed;left:50%;top:42%;transform:translate(-50%,-50%) scale(.9);
      z-index:10000;pointer-events:none;opacity:0;text-align:center;
      font-weight:950;font-size:clamp(30px,8vw,58px);letter-spacing:-1px;
      color:#fff;text-shadow:0 3px 20px rgba(0,0,0,.65);
      transition:opacity .25s ease,transform .25s ease;
    }
    #fitlpCelebrationText.show{opacity:1;transform:translate(-50%,-50%) scale(1)}
    #fitlpCelebrationText small{display:block;margin-top:8px;font-size:clamp(13px,3vw,18px);letter-spacing:1px;color:#d1fae5}
  `;
  document.head.appendChild(style);

  const canvas = document.createElement('canvas');
  canvas.id = 'fitlpFireworksCanvas';
  document.body.appendChild(canvas);

  const celebration = document.createElement('div');
  celebration.id = 'fitlpCelebrationText';
  celebration.innerHTML = 'WORKOUT COMPLETE<small>NICE WORK</small>';
  document.body.appendChild(celebration);

  function launchFireworks(){
    if (fireworksRunning) return;
    fireworksRunning = true;
    canvas.style.display = 'block';
    celebration.classList.add('show');

    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const particles = [];
    let start = performance.now();
    let lastBurst = 0;
    let burstCount = 0;

    function resize(){
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + 'px';
      canvas.style.height = innerHeight + 'px';
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    resize();

    function burst(x,y,amount=52){
      const baseHue = Math.random()*360;
      for(let i=0;i<amount;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 2.4 + Math.random()*5.2;
        particles.push({
          x,y,
          vx:Math.cos(angle)*speed,
          vy:Math.sin(angle)*speed,
          life:1,
          decay:.012 + Math.random()*.014,
          gravity:.045 + Math.random()*.035,
          size:1.8 + Math.random()*3.2,
          hue:(baseHue + Math.random()*80 - 40 + 360)%360
        });
      }
    }

    function frame(now){
      const elapsed = now-start;
      ctx.clearRect(0,0,innerWidth,innerHeight);

      if (elapsed-lastBurst > 360 && burstCount < 9){
        const x = innerWidth*(.12 + Math.random()*.76);
        const y = innerHeight*(.12 + Math.random()*.48);
        burst(x,y,44 + Math.floor(Math.random()*26));
        lastBurst = elapsed;
        burstCount++;
      }

      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];
        p.x+=p.vx;
        p.y+=p.vy;
        p.vx*=.992;
        p.vy=p.vy*.992+p.gravity;
        p.life-=p.decay;
        if(p.life<=0){particles.splice(i,1);continue;}
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},95%,65%,${p.life})`;
        ctx.shadowBlur=10;
        ctx.shadowColor=`hsla(${p.hue},95%,65%,${p.life})`;
        ctx.fill();
      }
      ctx.shadowBlur=0;

      if(elapsed<4200 || particles.length){
        requestAnimationFrame(frame);
      }else{
        canvas.style.display='none';
        celebration.classList.remove('show');
        fireworksRunning=false;
      }
    }

    requestAnimationFrame(frame);
    setTimeout(()=>celebration.classList.remove('show'),2500);
  }

  const previousLoadStep = loadStep;
  loadStep = function(index,announce=true){
    previousLoadStep(index,announce);
    if(current?.phase==='done' && !standaloneWarmupActive && currentWorkout){
      launchFireworks();
    }
  };
})();
