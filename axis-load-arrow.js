(function(){
  if (typeof window.drawSection !== 'function') return;
  const baseDrawSection = window.drawSection;
  function arrow(ctx,x1,y1,x2,y2,color){
    ctx.save();
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
    const a=Math.atan2(y2-y1,x2-x1),h=11;
    ctx.beginPath();
    ctx.moveTo(x2,y2);
    ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));
    ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function label(ctx,text,x,y,color){
    ctx.save();
    ctx.font='bold 13px sans-serif';
    const w=ctx.measureText(text).width;
    ctx.fillStyle='rgba(255,255,255,0.94)';
    ctx.fillRect(x-4,y-14,w+8,19);
    ctx.strokeStyle='rgba(37,99,235,0.22)';
    ctx.strokeRect(x-4,y-14,w+8,19);
    ctx.fillStyle=color;
    ctx.fillText(text,x,y);
    ctx.restore();
  }
  function drawAxisLoadArrow(i){
    const c=document.getElementById('sectionCanvas');
    if(!c) return;
    const ratio=window.devicePixelRatio||1;
    const W=Math.max(1,Math.round(c.clientWidth||c.width/ratio));
    const Hc=Math.max(1,Math.round(c.clientHeight||c.height/ratio));
    const ctx=c.getContext('2d');
    ctx.save();
    ctx.setTransform(ratio,0,0,ratio,0,0);
    const dw=Math.max(i.B||i.D||1,1);
    const dh=Math.max(i.H||i.D||1,1);
    const scale=Math.min((W-90)/dw,(Hc-64)/dh)*0.86;
    const drawW=dw*scale;
    const drawH=dh*scale;
    const x0=(W-drawW)/2;
    const y0=(Hc-drawH)/2;
    const cx=x0+drawW/2;
    const cy=y0+drawH/2;
    const color='#2563eb';
    if(String(i.axis||'').startsWith('Y')){
      const sx=Math.max(8,x0-72), ex=Math.max(16,x0-18);
      arrow(ctx,sx,cy,ex,cy,color);
      label(ctx,'Y方向荷重',Math.max(8,sx),Math.max(16,y0-10),color);
    }else{
      const sy=Math.max(12,y0-44), ey=Math.max(18,y0-8);
      arrow(ctx,cx,sy,cx,ey,color);
      label(ctx,'X方向荷重',Math.min(W-92,cx+8),Math.max(16,sy+12),color);
    }
    ctx.restore();
  }
  window.drawSection=function(i,sec){
    baseDrawSection(i,sec);
    drawAxisLoadArrow(i);
  };
  if(typeof render==='function') render();
})();
