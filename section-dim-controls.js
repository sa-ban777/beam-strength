(function(){
  const ids=['diameterD','B','H','t1','t2'];
  const labels={diameterD:'D',B:'B',H:'H',t1:'t1',t2:'t2'};
  const steps={diameterD:1,B:1,H:1,t1:0.1,t2:0.1};
  function $(id){return document.getElementById(id)}
  function stepDecimals(step){const s=String(step);return s.includes('.')?s.split('.')[1].length:0}
  function sectionType(){const el=$('sectionType');return el?el.value:''}
  function visibleIds(){
    const st=sectionType();
    if(st==='丸棒') return ['diameterD'];
    if(st==='長方形') return ['B','H'];
    return ['B','H','t1','t2'];
  }
  function isEditable(){
    const mode=$('jisShapeMode');
    if(mode && mode.value==='__steel__') return false;
    return visibleIds().some(id=>{const el=$(id);return el && !el.disabled});
  }
  function ensureStyle(){
    if($('sectionDimControlStyle')) return;
    const style=document.createElement('style');
    style.id='sectionDimControlStyle';
    style.textContent=`
      .section-dim-controls{position:absolute;right:8px;top:28px;z-index:5;background:rgba(255,255,255,.92);border:1px solid #cbd5e1;border-radius:10px;padding:6px;box-shadow:0 2px 8px rgba(15,23,42,.12);display:grid;grid-template-columns:auto 70px;gap:4px 6px;align-items:center;font-size:11px;color:#334155;max-width:150px}
      .section-dim-controls .dim-title{grid-column:1/3;font-weight:800;color:#1f2937;margin-bottom:2px}
      .section-dim-controls label{font-weight:800;color:#475569}
      .section-dim-controls input{width:70px;height:22px;border:1px solid #cbd5e1;border-radius:6px;padding:1px 4px;font-size:11px;background:#fff;color:#111827}
      .section-dim-controls input:disabled{background:#f1f5f9;color:#94a3b8}
      .section-dim-controls .dim-note{grid-column:1/3;font-size:10px;color:#64748b;line-height:1.2}
    `;
    document.head.appendChild(style);
  }
  function ensurePanel(){
    ensureStyle();
    const canvas=$('sectionCanvas');
    if(!canvas) return null;
    const pane=canvas.closest('.visual-pane')||canvas.parentElement;
    if(!pane) return null;
    if(getComputedStyle(pane).position==='static') pane.style.position='relative';
    let panel=$('sectionDimControls');
    if(panel) return panel;
    panel=document.createElement('div');
    panel.id='sectionDimControls';
    panel.className='section-dim-controls';
    panel.innerHTML='<div class="dim-title">寸法調整</div>'+ids.map(id=>`<label data-dim-label="${id}" for="dimCtrl_${id}">${labels[id]}</label><input data-dim-input="${id}" id="dimCtrl_${id}" type="number">`).join('')+'<div class="dim-note" id="dimCtrlNote"></div>';
    pane.appendChild(panel);
    panel.querySelectorAll('input[data-dim-input]').forEach(input=>{
      const id=input.dataset.dimInput;
      input.step=String(steps[id]||1);
      input.addEventListener('input',()=>applyInput(id,input.value));
      input.addEventListener('change',()=>applyInput(id,input.value));
      input.addEventListener('wheel',e=>{
        if(input.disabled) return;
        e.preventDefault();
        const step=steps[id]||1;
        const current=Number(input.value);
        const next=(Number.isFinite(current)?current:0)+(e.deltaY<0?step:-step);
        input.value=next.toFixed(stepDecimals(step));
        applyInput(id,input.value);
      },{passive:false});
    });
    return panel;
  }
  function applyInput(id,value){
    const target=$(id);
    if(!target || target.disabled) return;
    target.value=value;
    target.dispatchEvent(new Event('input',{bubbles:true}));
    target.dispatchEvent(new Event('change',{bubbles:true}));
    if(typeof ss400FixAutoYield==='function') ss400FixAutoYield();
    if(typeof render==='function') render();
  }
  function syncPanel(){
    const panel=ensurePanel();
    if(!panel) return;
    const show=new Set(visibleIds());
    const editable=isEditable();
    ids.forEach(id=>{
      const rowVisible=show.has(id);
      const label=panel.querySelector(`[data-dim-label="${id}"]`);
      const input=panel.querySelector(`[data-dim-input="${id}"]`);
      if(label) label.style.display=rowVisible?'':'none';
      if(input){
        input.style.display=rowVisible?'':'none';
        input.step=String(steps[id]||1);
        const src=$(id);
        if(src && document.activeElement!==input) input.value=src.value;
        input.disabled=!editable || !src || src.disabled;
      }
    });
    const note=$('dimCtrlNote');
    if(note) note.textContent=editable?'ホイール可':'形鋼はDB値固定';
  }
  function patchRender(){
    if(typeof render!=='function' || render._sectionDimPatched) return;
    const original=render;
    window.render=function(){
      const result=original.apply(this,arguments);
      syncPanel();
      return result;
    };
    window.render._sectionDimPatched=true;
  }
  function init(){
    ensurePanel();
    patchRender();
    ['shapePreset','sectionType','diameterD','B','H','t1','t2','jisShapeMode','jisSteelKind','jisSteelSize'].forEach(id=>{
      const el=$(id);if(!el)return;
      ['input','change'].forEach(ev=>el.addEventListener(ev,()=>setTimeout(syncPanel,0)));
    });
    syncPanel();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
