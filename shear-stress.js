(function(){
  function $(id){return document.getElementById(id)}
  function fmt(v,d=3){return Number.isFinite(v)?Number(v).toLocaleString('ja-JP',{maximumFractionDigits:d}):'-'}
  function f(v,d=6,u=''){return fmt(v,d)+(u?' '+u:'')}

  function moveSectionPerformance(){
    const inputCard=document.querySelector('.input-card');
    const inputCol=inputCard&&inputCard.querySelector('.input-column');
    if(!inputCard||!inputCol)return;
    let block=$('sectionPerformanceBlock');
    if(!block){
      block=document.createElement('div');
      block.id='sectionPerformanceBlock';
      block.className='section-performance-block';
      block.innerHTML='<h3>断面性能</h3><div id="sectionPerformanceGrid" class="section-performance-grid"></div>';
      inputCol.insertAdjacentElement('afterend',block);
    }
    const g=$('sectionPerformanceGrid');
    ['rArea','rCentroid','rI','rZ'].forEach(id=>{
      const el=$(id), card=el&&el.closest('div');
      if(card&&g&&!g.contains(card))g.appendChild(card);
    });
  }

  function addResultCard(label,id,unit,afterId,emph=false){
    if($(id))return;
    const grid=document.querySelector('.result-grid');
    if(!grid)return;
    const div=document.createElement('div');
    if(emph)div.className='result-emphasis';
    div.innerHTML='<span>'+label+'</span><strong id="'+id+'">-</strong><small>'+unit+'</small>';
    const anchor=$(afterId)&&$(afterId).closest('div');
    if(anchor&&anchor.nextSibling)grid.insertBefore(div,anchor.nextSibling);else grid.appendChild(div);
  }

  function ensureCards(){
    addResultCard('Mmax 外力のみ','rMExternal','N･mm','rM');
    addResultCard('Mmax 自重分','rMSelf','N･mm','rMExternal');
    addResultCard('曲げ応力 短期','rBendRatioShort','降伏/σ','rSafety',true);
    addResultCard('曲げ応力 長期','rBendRatioLong','(降伏/1.5)/σ','rBendRatioShort',true);
    addResultCard('せん断力 V','rShearForce','N','rBendRatioLong');
    addResultCard('せん断応力 τ','rShearStress','N/mm²','rShearForce');
    addResultCard('許容せん断応力','rAllowShear','N/mm²','rShearStress');
    addResultCard('せん断応力 短期','rShearSafetyShort','許容τ/τ','rAllowShear',true);
    addResultCard('せん断応力 長期','rShearSafetyLong','(許容τ/1.5)/τ','rShearSafetyShort',true);
    moveSectionPerformance();
  }

  function momentParts(r){
    const i=r.i,L=i.L,P=i.P,w=i.w,ws=r.selfW,c=i.loadCase;
    if(c==='両端支持・中央集中荷重')return {ext:P*L/4,self:ws*L**2/8,extFormula:'P × L / 4',selfFormula:'w_self × L² / 8',extSub:fmt(P,3)+' × '+fmt(L,3)+' / 4',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 8'};
    if(c==='両端支持・等分布荷重')return {ext:w*L**2/8,self:ws*L**2/8,extFormula:'w × L² / 8',selfFormula:'w_self × L² / 8',extSub:fmt(w,9)+' × '+fmt(L,3)+'² / 8',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 8'};
    if(c==='片持ち・先端集中荷重')return {ext:P*L,self:ws*L**2/2,extFormula:'P × L',selfFormula:'w_self × L² / 2',extSub:fmt(P,3)+' × '+fmt(L,3),selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 2'};
    if(c==='片持ち・等分布荷重')return {ext:w*L**2/2,self:ws*L**2/2,extFormula:'w × L² / 2',selfFormula:'w_self × L² / 2',extSub:fmt(w,9)+' × '+fmt(L,3)+'² / 2',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 2'};
    if(c==='両端固定・中央集中荷重')return {ext:P*L/8,self:ws*L**2/12,extFormula:'P × L / 8',selfFormula:'w_self × L² / 12',extSub:fmt(P,3)+' × '+fmt(L,3)+' / 8',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 12'};
    return {ext:w*L**2/12,self:ws*L**2/12,extFormula:'w × L² / 12',selfFormula:'w_self × L² / 12',extSub:fmt(w,9)+' × '+fmt(L,3)+'² / 12',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'² / 12'};
  }

  function shearParts(r){
    const i=r.i,L=i.L,P=i.P,w=i.w,ws=r.selfW,c=i.loadCase;
    if(c==='両端支持・中央集中荷重')return {ext:P/2,self:ws*L/2,extFormula:'P / 2',selfFormula:'w_self × L / 2',extSub:fmt(P,3)+' / 2',selfSub:fmt(ws,9)+' × '+fmt(L,3)+' / 2'};
    if(c==='両端支持・等分布荷重')return {ext:w*L/2,self:ws*L/2,extFormula:'w × L / 2',selfFormula:'w_self × L / 2',extSub:fmt(w,9)+' × '+fmt(L,3)+' / 2',selfSub:fmt(ws,9)+' × '+fmt(L,3)+' / 2'};
    if(c==='片持ち・先端集中荷重')return {ext:P,self:ws*L,extFormula:'P',selfFormula:'w_self × L',extSub:fmt(P,3),selfSub:fmt(ws,9)+' × '+fmt(L,3)};
    if(c==='片持ち・等分布荷重')return {ext:w*L,self:ws*L,extFormula:'w × L',selfFormula:'w_self × L',extSub:fmt(w,9)+' × '+fmt(L,3),selfSub:fmt(ws,9)+' × '+fmt(L,3)};
    if(c==='両端固定・中央集中荷重')return {ext:P/2,self:ws*L/2,extFormula:'P / 2',selfFormula:'w_self × L / 2',extSub:fmt(P,3)+' / 2',selfSub:fmt(ws,9)+' × '+fmt(L,3)+' / 2'};
    return {ext:w*L/2,self:ws*L/2,extFormula:'w × L / 2',selfFormula:'w_self × L / 2',extSub:fmt(w,9)+' × '+fmt(L,3)+' / 2',selfSub:fmt(ws,9)+' × '+fmt(L,3)+' / 2'};
  }

  function deflectionParts(r){
    const i=r.i,L=i.L,P=i.P,w=i.w,ws=r.selfW,E=r.E,I=r.sec.I,c=i.loadCase;
    if(c==='両端支持・中央集中荷重')return {loadFormula:'P × L³ / (48 × E × I)',selfFormula:'5 × w_self × L⁴ / (384 × E × I)',loadSub:fmt(P,3)+' × '+fmt(L,3)+'³ / (48 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:'5 × '+fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
    if(c==='両端支持・等分布荷重')return {loadFormula:'5 × w × L⁴ / (384 × E × I)',selfFormula:'5 × w_self × L⁴ / (384 × E × I)',loadSub:'5 × '+fmt(w,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:'5 × '+fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
    if(c==='片持ち・先端集中荷重')return {loadFormula:'P × L³ / (3 × E × I)',selfFormula:'w_self × L⁴ / (8 × E × I)',loadSub:fmt(P,3)+' × '+fmt(L,3)+'³ / (3 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (8 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
    if(c==='片持ち・等分布荷重')return {loadFormula:'w × L⁴ / (8 × E × I)',selfFormula:'w_self × L⁴ / (8 × E × I)',loadSub:fmt(w,9)+' × '+fmt(L,3)+'⁴ / (8 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (8 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
    if(c==='両端固定・中央集中荷重')return {loadFormula:'P × L³ / (192 × E × I)',selfFormula:'w_self × L⁴ / (384 × E × I)',loadSub:fmt(P,3)+' × '+fmt(L,3)+'³ / (192 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
    return {loadFormula:'w × L⁴ / (384 × E × I)',selfFormula:'w_self × L⁴ / (384 × E × I)',loadSub:fmt(w,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')',selfSub:fmt(ws,9)+' × '+fmt(L,3)+'⁴ / (384 × '+fmt(E,0)+' × '+fmt(I,3)+')'};
  }

  function values(){
    if(typeof calc!=='function')return null;
    const r=calc(),mp=momentParts(r),sp=shearParts(r),dp=deflectionParts(r);
    const V=sp.ext+sp.self,A=r.sec.A,tau=V/A,allow=r.Fy/Math.sqrt(3);
    const shortSF=allow/tau,longSF=(allow/1.5)/tau;
    const bendShort=r.Fy/r.stress,bendLong=(r.Fy/1.5)/r.stress;
    return {r,mp,sp,dp,V,A,tau,allow,shortSF,longSF,bendShort,bendLong};
  }

  function updateCards(){
    ensureCards();
    const v=values(); if(!v)return;
    const map={rMExternal:[v.mp.ext,3],rMSelf:[v.mp.self,3],rBendRatioShort:[v.bendShort,3],rBendRatioLong:[v.bendLong,3],rShearForce:[v.V,3],rShearStress:[v.tau,3],rAllowShear:[v.allow,3],rShearSafetyShort:[v.shortSF,3],rShearSafetyLong:[v.longSF,3]};
    Object.entries(map).forEach(([id,a])=>{const el=$(id);if(el)el.textContent=fmt(a[0],a[1])});
    ['rShearSafetyShort','rShearSafetyLong','rBendRatioShort','rBendRatioLong'].forEach(id=>{const el=$(id),box=el&&el.closest('div');if(!box)return;box.classList.remove('shear-ok','shear-ng');box.classList.add(Number(String(el.textContent).replace(/,/g,''))>=1?'shear-ok':'shear-ng')});
    moveSectionPerformance();
  }

  function detailedMemo(){
    const v=values(); if(!v)return '';
    const r=v.r,i=r.i,mp=v.mp,sp=v.sp,dp=v.dp;
    return [
      '【1. 条件】','支持・荷重ケース：'+i.loadCase,'断面：'+(i.manual?'手入力':i.shape.name)+' / '+i.sectionType+' / '+i.axis,'材料：'+i.materialName+' / E='+fmt(r.E,0)+' N/mm² / 密度='+fmt(r.density,0)+' kg/m³ / 降伏='+fmt(r.Fy,3)+' N/mm²','L='+fmt(i.L,3)+' mm / P='+fmt(i.P,3)+' N / w='+fmt(i.w,9)+' N/mm / g='+fmt(i.g,5)+' m/s²','',
      '【2. 断面性能】','A = '+f(r.sec.A,3,'mm²'),'I = '+f(r.sec.I,3,'mm⁴'),'Z = '+f(r.sec.Z,3,'mm³'),'重心位置 = '+f(r.sec.c,3,'mm'),'',
      '【3. 荷重】','w_self = A × 密度 × g / 1,000,000,000','       = '+fmt(r.sec.A,3)+' × '+fmt(r.density,0)+' × '+fmt(i.g,5)+' / 1,000,000,000','       = '+f(r.selfW,9,'N/mm'),'w_total = w + w_self = '+fmt(i.w,9)+' + '+fmt(r.selfW,9)+' = '+f(r.totalW,9,'N/mm'),'',
      '【4. 曲げモーメント】','M_external = '+mp.extFormula,'           = '+mp.extSub+' = '+f(mp.ext,6,'N･mm'),'M_self     = '+mp.selfFormula,'           = '+mp.selfSub+' = '+f(mp.self,6,'N･mm'),'Mmax       = M_external + M_self','           = '+fmt(mp.ext,6)+' + '+fmt(mp.self,6)+' = '+f(r.M,6,'N･mm'),'',
      '【5. 曲げ応力】','σ = Mmax / Z = '+fmt(r.M,6)+' / '+fmt(r.sec.Z,3)+' = '+f(r.stress,6,'N/mm²'),'曲げ応力 短期 = 降伏 / σ = '+fmt(r.Fy,3)+' / '+fmt(r.stress,6)+' = '+fmt(v.bendShort,6),'曲げ応力 長期 = (降伏 / 1.5) / σ = ('+fmt(r.Fy,3)+' / 1.5) / '+fmt(r.stress,6)+' = '+fmt(v.bendLong,6),'',
      '【6. たわみ】','δ_load = '+dp.loadFormula,'       = '+dp.loadSub+' = '+f(r.dLoad,9,'mm'),'δ_self = '+dp.selfFormula,'       = '+dp.selfSub+' = '+f(r.dSelf,9,'mm'),'δ_total = δ_load + δ_self','        = '+fmt(r.dLoad,9)+' + '+fmt(r.dSelf,9)+' = '+f(r.dTotal,9,'mm'),'許容たわみ = L / n = '+fmt(i.L,3)+' / '+fmt(i.n,3)+' = '+f(r.dAllow,6,'mm'),'',
      '【7. せん断応力】','V_external = '+sp.extFormula,'           = '+sp.extSub+' = '+f(sp.ext,6,'N'),'V_self     = '+sp.selfFormula,'           = '+sp.selfSub+' = '+f(sp.self,6,'N'),'V          = V_external + V_self = '+fmt(sp.ext,6)+' + '+fmt(sp.self,6)+' = '+f(v.V,6,'N'),'τ = V / A = '+fmt(v.V,6)+' / '+fmt(v.A,3)+' = '+f(v.tau,6,'N/mm²'),'許容せん断応力 = 降伏 / √3 = '+fmt(r.Fy,3)+' / √3 = '+f(v.allow,6,'N/mm²'),'せん断応力 短期 = 許容せん断応力 / τ = '+fmt(v.allow,6)+' / '+fmt(v.tau,6)+' = '+fmt(v.shortSF,6),'せん断応力 長期 = (許容せん断応力 / 1.5) / τ = ('+fmt(v.allow,6)+' / 1.5) / '+fmt(v.tau,6)+' = '+fmt(v.longSF,6)
    ].join('\n');
  }

  function updateFormulaMemo(){const memo=$('formulaMemo');if(!memo)return;const t=detailedMemo();if(t)memo.textContent=t}
  function ensureStyle(){
    if($('shearStressStyle'))return;
    const s=document.createElement('style');s.id='shearStressStyle';
    s.textContent=`
      .shear-ok{outline:1px solid rgba(22,163,74,.25)}.shear-ng{outline:1px solid rgba(220,38,38,.3)}
      .section-performance-block{margin-top:8px;padding-top:6px;border-top:1px solid #cbd5e1}.section-performance-block h3{font-size:12px;margin:0 0 4px;color:#334155}.section-performance-grid{display:grid;grid-template-columns:1fr 1fr;gap:3px}.section-performance-grid>div{min-height:28px;padding:2px 5px;border:1px solid #dbe3ef;border-radius:4px;background:#fff;display:grid;grid-template-columns:1fr auto auto;align-items:center;column-gap:4px}.section-performance-grid span{font-size:10px;line-height:1;white-space:nowrap}.section-performance-grid strong{font-size:12px;line-height:1;white-space:nowrap;text-align:right}.section-performance-grid small{font-size:8.5px;line-height:1;white-space:nowrap;text-align:right}
      .result-card .result-grid{gap:3px!important}.result-card .result-grid>div{min-height:28px!important;padding:2px 5px!important;border-radius:4px!important;display:grid!important;grid-template-columns:1fr auto auto!important;align-items:center!important;column-gap:5px!important;row-gap:0!important}.result-card .result-grid span{font-size:10px!important;line-height:1!important;white-space:nowrap!important}.result-card .result-grid strong{font-size:13px!important;line-height:1!important;white-space:nowrap!important;text-align:right!important}.result-card .result-grid small{font-size:9px!important;line-height:1!important;white-space:nowrap!important;text-align:right!important}.result-card .sub-judges{margin-top:3px!important;gap:3px!important}.result-card .sub-judge{padding:3px 6px!important;font-size:10px!important;line-height:1!important;border-radius:4px!important}
      .visual-card canvas{height:245px!important;width:auto!important;max-width:100%!important;object-fit:contain!important}.moment-card canvas{height:205px!important;width:auto!important;max-width:100%!important;object-fit:contain!important}.formula{font-size:10.5px!important;line-height:1.15!important;min-height:360px!important;white-space:pre-wrap!important;column-count:2!important;column-gap:24px!important;column-rule:1px solid rgba(148,163,184,.35)!important}
      @media(max-width:900px){.formula{column-count:1!important}}
      @media(max-width:640px){.section-performance-grid{grid-template-columns:1fr}.visual-card canvas{height:auto!important;width:100%!important}.moment-card canvas{height:auto!important;width:100%!important}.formula{font-size:10.5px!important;min-height:320px!important;column-count:1!important}.result-card .result-grid>div{min-height:27px!important;padding:2px 4px!important;column-gap:4px!important}.result-card .result-grid span{font-size:9.5px!important}.result-card .result-grid strong{font-size:12px!important}.result-card .result-grid small{font-size:8.5px!important}}
    `;document.head.appendChild(s);
  }
  function patchDimLine(){if(typeof dimLine!=='function'||dimLine._largeLabel)return;const fn=function(ctx,x1,y1,x2,y2,t,v=false){ctx.save();ctx.strokeStyle=ctx.fillStyle='#2563eb';ctx.lineWidth=1.5;ctx.font='bold 13.2px sans-serif';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();if(v){ctx.beginPath();ctx.moveTo(x1-5,y1);ctx.lineTo(x1+5,y1);ctx.moveTo(x2-5,y2);ctx.lineTo(x2+5,y2);ctx.stroke();ctx.save();ctx.translate(x1+15,(y1+y2)/2);ctx.rotate(-Math.PI/2);ctx.fillText(t,-ctx.measureText(t).width/2,0);ctx.restore()}else{ctx.beginPath();ctx.moveTo(x1,y1-5);ctx.lineTo(x1,y1+5);ctx.moveTo(x2,y2-5);ctx.lineTo(x2,y2+5);ctx.stroke();ctx.fillText(t,(x1+x2)/2-ctx.measureText(t).width/2,y1-7)}ctx.restore()};fn._largeLabel=true;window.dimLine=fn;try{dimLine=fn}catch(e){}}
  function patchRender(){if(typeof render!=='function'||render._shearStressPatched)return;const original=render;window.render=function(){patchDimLine();const out=original.apply(this,arguments);updateCards();updateFormulaMemo();return out};window.render._shearStressPatched=true}
  function init(){ensureStyle();patchDimLine();ensureCards();patchRender();if(typeof render==='function')setTimeout(render,0);else{updateCards();updateFormulaMemo()}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();