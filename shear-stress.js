(function(){
  function $(id){return document.getElementById(id)}
  function fmt(v,d=3){return Number.isFinite(v)?Number(v).toLocaleString('ja-JP',{maximumFractionDigits:d}):'-'}
  function ensureCards(){
    const grid=document.querySelector('.result-grid');
    if(!grid||$('rShearStress'))return;
    const items=[
      ['せん断力 V','rShearForce','N'],
      ['せん断応力 τ','rShearStress','N/mm²'],
      ['許容せん断応力','rAllowShear','N/mm²'],
      ['短期せん断安全率','rShearSafetyShort','許容τ/τ'],
      ['長期せん断安全率','rShearSafetyLong','短期/1.5']
    ];
    items.forEach(([label,id,unit])=>{
      const div=document.createElement('div');
      if(id==='rShearSafetyShort'||id==='rShearSafetyLong')div.className='result-emphasis';
      div.innerHTML='<span>'+label+'</span><strong id="'+id+'">-</strong><small>'+unit+'</small>';
      grid.appendChild(div);
    });
  }
  function shearForce(r){
    if(!r||!r.i)return NaN;
    const i=r.i,L=i.L,P=i.P,w=i.w,selfW=r.selfW,totalW=r.totalW,c=i.loadCase;
    if(c==='両端支持・中央集中荷重')return P/2+selfW*L/2;
    if(c==='両端支持・等分布荷重')return totalW*L/2;
    if(c==='片持ち・先端集中荷重')return P+selfW*L;
    if(c==='片持ち・等分布荷重')return totalW*L;
    if(c==='両端固定・中央集中荷重')return P/2+selfW*L/2;
    return totalW*L/2;
  }
  function values(){
    if(typeof calc!=='function')return null;
    const r=calc();
    const V=shearForce(r);
    const A=r&&r.sec?r.sec.A:NaN;
    const tau=V/A;
    const allow=r.Fy/Math.sqrt(3);
    const shortSF=allow/tau;
    const longSF=shortSF/1.5;
    return {r,V,A,tau,allow,shortSF,longSF};
  }
  function updateCards(){
    ensureCards();
    const v=values();
    if(!v)return;
    const map={rShearForce:[v.V,3],rShearStress:[v.tau,3],rAllowShear:[v.allow,3],rShearSafetyShort:[v.shortSF,3],rShearSafetyLong:[v.longSF,3]};
    Object.entries(map).forEach(([id,a])=>{const el=$(id);if(el)el.textContent=fmt(a[0],a[1])});
    const s1=$('rShearSafetyShort'),s2=$('rShearSafetyLong');
    [s1,s2].forEach(el=>{if(!el)return;const box=el.closest('div');if(!box)return;box.classList.remove('shear-ok','shear-ng');box.classList.add(Number(String(el.textContent).replace(/,/g,''))>=1?'shear-ok':'shear-ng')});
  }
  function appendFormula(){
    const memo=$('formulaMemo');
    const v=values();
    if(!memo||!v)return;
    let t=String(memo.textContent||'').replace(/\n\nせん断応力[\s\S]*$/,'');
    const block='せん断応力\nV = '+fmt(v.V,6)+' N\nτ = V / A = '+fmt(v.V,6)+' / '+fmt(v.A,3)+' = '+fmt(v.tau,6)+' N/mm²\n許容せん断応力 = 降伏 / √3 = '+fmt(v.allow,6)+' N/mm²\n短期せん断安全率 = 許容せん断応力 / τ = '+fmt(v.shortSF,6)+'\n長期せん断安全率 = 短期せん断安全率 / 1.5 = '+fmt(v.longSF,6);
    memo.textContent=t+'\n\n'+block;
  }
  function ensureStyle(){
    if($('shearStressStyle'))return;
    const s=document.createElement('style');
    s.id='shearStressStyle';
    s.textContent='.shear-ok{outline:2px solid rgba(22,163,74,.25)}.shear-ng{outline:2px solid rgba(220,38,38,.3)}';
    document.head.appendChild(s);
  }
  function patchRender(){
    if(typeof render!=='function'||render._shearStressPatched)return;
    const original=render;
    window.render=function(){const out=original.apply(this,arguments);updateCards();appendFormula();return out};
    window.render._shearStressPatched=true;
  }
  function init(){ensureStyle();ensureCards();patchRender();updateCards();appendFormula()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
