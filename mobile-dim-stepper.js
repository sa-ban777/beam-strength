(function(){
  const DIM_IDS=['diameterD','B','H','t1','t2'];
  const LABELS={diameterD:'D',B:'B',H:'H',t1:'t1',t2:'t2'};
  const STEPS={diameterD:1,B:1,H:1,t1:0.1,t2:0.1};
  let timer=null;
  function $(id){return document.getElementById(id)}
  function decimals(step){const s=String(step);return s.includes('.')?s.split('.')[1].length:0}
  function fire(el){if(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}}
  function changeDim(id,dir){
    const src=$(id);if(!src||src.disabled)return;
    const step=STEPS[id]||1;
    const cur=Number(src.value);
    const next=Math.max(0,(Number.isFinite(cur)?cur:0)+dir*step);
    src.value=next.toFixed(decimals(step));
    fire(src);
    if(typeof ss400FixAutoYield==='function')ss400FixAutoYield();
    if(typeof render==='function')render();
  }
  function ensureStyle(){
    if($('mobileDimStepperStyle'))return;
    const s=document.createElement('style');
    s.id='mobileDimStepperStyle';
    s.textContent=`
      .dim-step-buttons{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:3px;margin-top:3px}
      .dim-step-row{display:grid;grid-template-columns:26px 1fr 26px;align-items:center;gap:2px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:7px;padding:2px}
      .dim-step-row span{text-align:center;font-size:10px;font-weight:900;color:#334155}
      .dim-step-row button{height:24px;border:1px solid #93c5fd;border-radius:6px;background:#eff6ff;color:#1d4ed8;font-size:15px;font-weight:900;line-height:1;touch-action:none;user-select:none}
      .dim-step-row button:active{background:#bfdbfe}
      .dim-step-row.is-hidden{display:none}.dim-step-row.is-disabled{opacity:.45}
      @media(max-width:640px){.section-dim-controls{grid-template-columns:auto 68px!important;max-width:168px!important;font-size:11px!important}.section-dim-controls input{width:68px!important;height:28px!important;font-size:13px!important}.dim-step-buttons{grid-template-columns:1fr;gap:4px}.dim-step-row{grid-template-columns:34px 1fr 34px;padding:3px}.dim-step-row button{height:32px;font-size:18px}.dim-step-row span{font-size:12px}}
      @media print{.dim-step-buttons{display:none!important}}
    `;
    document.head.appendChild(s);
  }
  function ensurePanel(){
    ensureStyle();
    const panel=$('sectionDimControls');if(!panel)return null;
    let box=$('dimStepButtons');
    if(box)return box;
    box=document.createElement('div');
    box.id='dimStepButtons';
    box.className='dim-step-buttons';
    box.innerHTML=DIM_IDS.map(id=>`<div class="dim-step-row" data-step-row="${id}"><button type="button" data-dim-step="${id}" data-dir="-1">−</button><span>${LABELS[id]}</span><button type="button" data-dim-step="${id}" data-dir="1">＋</button></div>`).join('');
    panel.appendChild(box);
    box.addEventListener('click',e=>{const b=e.target.closest('button[data-dim-step]');if(!b)return;changeDim(b.dataset.dimStep,Number(b.dataset.dir)||1)});
    box.addEventListener('pointerdown',e=>{
      const b=e.target.closest('button[data-dim-step]');if(!b)return;
      const id=b.dataset.dimStep,dir=Number(b.dataset.dir)||1;
      clearInterval(timer);
      timer=setInterval(()=>changeDim(id,dir),180);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(ev=>box.addEventListener(ev,()=>{clearInterval(timer);timer=null}));
    return box;
  }
  function sync(){
    const box=ensurePanel();if(!box)return;
    DIM_IDS.forEach(id=>{
      const row=box.querySelector(`[data-step-row="${id}"]`);
      const input=document.querySelector(`[data-dim-input="${id}"]`);
      const hidden=!input||input.style.display==='none';
      const disabled=!input||input.disabled;
      if(row){row.classList.toggle('is-hidden',hidden);row.classList.toggle('is-disabled',disabled);row.querySelectorAll('button').forEach(b=>b.disabled=disabled)}
    });
  }
  function patchRender(){
    if(typeof render!=='function'||render._mobileDimStepperPatched)return;
    const original=render;
    window.render=function(){const r=original.apply(this,arguments);setTimeout(sync,0);return r};
    window.render._mobileDimStepperPatched=true;
  }
  function init(){patchRender();setTimeout(sync,0);document.addEventListener('input',()=>setTimeout(sync,0),true);document.addEventListener('change',()=>setTimeout(sync,0),true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
