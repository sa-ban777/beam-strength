(function(){
  function canvasSize(c){
    const r=window.devicePixelRatio||1;
    const w=Math.max(1,Math.round(c.clientWidth||c.width));
    const h=Math.max(1,Math.round(c.clientHeight||c.height));
    if(c.width!==Math.round(w*r)||c.height!==Math.round(h*r)){c.width=Math.round(w*r);c.height=Math.round(h*r)}
    const ctx=c.getContext('2d');
    ctx.setTransform(r,0,0,r,0,0);
    return{ctx,w,h};
  }
  function fmt(v,d){
    if(!Number.isFinite(v))return'-';
    const a=Math.abs(v);
    if(a&&a>=1e7)return v.toExponential(3);
    return v.toLocaleString('ja-JP',{maximumFractionDigits:d??2});
  }
  function arrow(ctx,x1,y1,x2,y2,color){
    ctx.save();ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1),h=7;
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fill();
    ctx.restore();
  }
  function support(ctx,x,y,type){
    ctx.save();ctx.strokeStyle='#475569';ctx.fillStyle='#e2e8f0';ctx.lineWidth=1.5;
    if(type==='fixed'){
      ctx.beginPath();ctx.moveTo(x,y-26);ctx.lineTo(x,y+26);ctx.stroke();
      for(let k=-22;k<=18;k+=8){ctx.beginPath();ctx.moveTo(x-8,y+k+6);ctx.lineTo(x,y+k);ctx.stroke()}
    }else{
      ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-12,y+18);ctx.lineTo(x+12,y+18);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.beginPath();ctx.moveTo(x-17,y+20);ctx.lineTo(x+17,y+20);ctx.stroke();
      for(let k=-15;k<=12;k+=6){ctx.beginPath();ctx.moveTo(x+k,y+20);ctx.lineTo(x+k+4,y+24);ctx.stroke()}
    }
    ctx.restore();
  }
  function momentValue(caseName,L,P,wExt,wSelf,x){
    const wTotal=wExt+wSelf;
    if(caseName==='両端支持・中央集中荷重'){
      const mp=x<=L/2?P*x/2:P*(L-x)/2;
      const mw=wSelf*x*(L-x)/2;
      return mp+mw;
    }
    if(caseName==='両端支持・等分布荷重') return wTotal*x*(L-x)/2;
    if(caseName==='片持ち・先端集中荷重') return -(P*(L-x)+wSelf*(L-x)*(L-x)/2);
    if(caseName==='片持ち・等分布荷重') return -wTotal*(L-x)*(L-x)/2;
    if(caseName==='両端固定・中央集中荷重'){
      const mp=x<=L/2?(-P*L/8+P*x/2):(3*P*L/8-P*x/2);
      const mw=wSelf*(L*x/2-x*x/2-L*L/12);
      return mp+mw;
    }
    return wTotal*(L*x/2-x*x/2-L*L/12);
  }
  function drawLoads(ctx,caseName,x0,x1,y,P,wExt,wSelf){
    const color='#b7c51c';
    if(caseName.includes('集中')){
      const x=caseName.startsWith('片持ち')?x1:(x0+x1)/2;
      arrow(ctx,x,y-42,x,y-8,color);
      ctx.fillStyle=color;ctx.font='12px sans-serif';ctx.fillText('P='+fmt(P,1)+' N',x+8,y-30);
    }
    const showDist=caseName.includes('等分布')&&wExt>0;
    if(showDist){
      for(let k=0;k<9;k++){
        const x=x0+(x1-x0)*k/8;
        arrow(ctx,x,y-28,x,y-8,color);
      }
      ctx.fillStyle=color;ctx.font='12px sans-serif';
      ctx.fillText('w='+fmt(wExt,5)+' N/mm',x0+8,y-34);
    }
  }
  function drawBeamAndSupports(ctx,caseName,x0,x1,y){
    ctx.save();
    ctx.strokeStyle='#0f172a';ctx.lineWidth=3;
    ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
    if(caseName.startsWith('片持ち')) support(ctx,x0,y,'fixed');
    else if(caseName.startsWith('両端固定')){support(ctx,x0,y,'fixed');support(ctx,x1,y,'fixed')}
    else{support(ctx,x0,y,'pin');support(ctx,x1,y,'pin')}
    ctx.restore();
  }
  function drawLabels(ctx,points,x0,x1,baseY,scaleY,L){
    let maxP={x:0,m:-Infinity}, minP={x:0,m:Infinity};
    points.forEach(p=>{if(p.m>maxP.m)maxP=p;if(p.m<minP.m)minP=p});
    ctx.save();ctx.font='12px sans-serif';ctx.fillStyle='#111827';
    ctx.fillText('B.M.D（曲げモーメント図）',x0,baseY-68);
    ctx.fillStyle='#dc2626';
    if(Math.abs(maxP.m)>1e-9){ctx.fillText('最大 +M='+fmt(maxP.m,2)+' N･mm',x0,baseY+80)}
    if(Math.abs(minP.m)>1e-9){ctx.fillText('最小 -M='+fmt(minP.m,2)+' N･mm',x0+210,baseY+80)}
    ctx.fillStyle='#64748b';
    ctx.fillText('0',x0-22,baseY+4);
    ctx.fillText('L='+fmt(L,1)+' mm',x1-70,baseY+22);
    ctx.restore();
  }
  window.drawMoment=function(r){
    const canvas=document.getElementById('momentCanvas');if(!canvas)return;
    const s=canvasSize(canvas),ctx=s.ctx,W=s.w,H=s.h;
    ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
    const i=r.i,L=i.L||1,P=i.P||0,wExt=i.w||0,wSelf=r.selfW||0;
    const x0=62,x1=W-62,beamY=54,baseY=Math.max(142,H*0.56),amp=Math.min(82,H*0.30);
    drawBeamAndSupports(ctx,i.loadCase,x0,x1,beamY);
    drawLoads(ctx,i.loadCase,x0,x1,beamY,P,wExt,wSelf);
    const n=180;
    const points=[];
    let maxAbs=0;
    for(let k=0;k<=n;k++){
      const x=L*k/n;
      const m=momentValue(i.loadCase,L,P,wExt,wSelf,x);
      points.push({x,m});
      maxAbs=Math.max(maxAbs,Math.abs(m));
    }
    if(!(maxAbs>0))maxAbs=1;
    const sx=x=>x0+(x1-x0)*x/L;
    const sy=m=>baseY+(m/maxAbs)*amp;
    ctx.save();
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x0,baseY);ctx.lineTo(x1,baseY);ctx.stroke();
    ctx.strokeStyle='#dc2626';ctx.fillStyle='rgba(220,38,38,0.12)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(x0,baseY);
    points.forEach(p=>ctx.lineTo(sx(p.x),sy(p.m)));
    ctx.lineTo(x1,baseY);ctx.closePath();ctx.fill();ctx.stroke();
    ctx.setLineDash([4,4]);ctx.strokeStyle='#cbd5e1';
    [0,L/2,L].forEach(x=>{ctx.beginPath();ctx.moveTo(sx(x),baseY-amp-14);ctx.lineTo(sx(x),baseY+amp+14);ctx.stroke()});
    ctx.restore();
    drawLabels(ctx,points,x0,x1,baseY,amp/maxAbs,L);
  };
  if(typeof render==='function')render();
})();
