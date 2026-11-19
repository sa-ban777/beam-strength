(function(){
  const desktopLayout=window.matchMedia('screen and (min-width:1400px)');
  const ids=['diameterD','B','H','B1','B2','t1','t2','t3'];
  const labels={diameterD:'D',B:'B',H:'H',t1:'t1',t2:'t2',t3:'t3',B1:'B1',B2:'B2'};
  const steps={diameterD:1,B:1,H:1,t1:0.1,t2:0.1,t3:0.1,B1:1,B2:1};
  function $(id){return document.getElementById(id)}
  function stepDecimals(step){const s=String(step);return s.includes('.')?s.split('.')[1].length:0}
  function sectionType(){return window.BeamSectionMode&&window.BeamSectionMode.getSectionType()?window.BeamSectionMode.getSectionType():(($('sectionType')||{}).value||'')}
  function visibleIds(){
    const st=sectionType();
    if(st==='丸棒') return ['diameterD'];
    if(st===LIPPED_CHANNEL) return ids.slice(1);
    if(st==='長方形') return ['B','H'];
    return ['B','H','t1','t2'];
  }
  function isEditable(){
    if(window.BeamSectionMode&&window.BeamSectionMode.isSteel()) return false;
    return visibleIds().some(id=>{const el=$(id);return el && !el.disabled});
  }
  function ensureStyle(){
    if($('sectionDimControlStyle')) return;
    const style=document.createElement('style');
    style.id='sectionDimControlStyle';
    style.textContent=`
      .section-dim-controls{position:absolute;right:8px;top:64px;z-index:5;background:rgba(255,255,255,.92);border:1px solid #cbd5e1;border-radius:10px;padding:6px;box-shadow:0 2px 8px rgba(15,23,42,.12);display:grid;grid-template-columns:auto 70px;gap:4px 6px;align-items:center;font-size:11px;color:#334155;max-width:150px}
      .section-dim-controls .dim-title{grid-column:1/3;font-weight:800;color:#1f2937;margin-bottom:2px}
      .section-dim-controls label{font-weight:800;color:#475569}
      .section-dim-controls input{width:70px;height:22px;border:1px solid #cbd5e1;border-radius:6px;padding:1px 4px;font-size:11px;background:#fff;color:#111827}
      .section-dim-controls input:disabled{background:#f1f5f9;color:#94a3b8}
      .section-dim-controls .thickness-link-label{grid-column:1/-1;display:flex;align-items:center;gap:5px}
      .section-dim-controls .thickness-link-label input{width:auto!important;height:auto!important}
      .section-dim-controls.dim-controls-lipped{position:static;flex:none;max-width:none!important;grid-template-columns:repeat(2,minmax(0,1fr) minmax(0,2fr))!important;margin-top:4px}
      .section-dim-controls.dim-controls-lipped input[data-dim-input]{width:100%!important}
      .section-dim-controls.dim-controls-lipped .dim-title,.section-dim-controls.dim-controls-lipped .dim-note{grid-column:1/-1}
      #sectionCanvas.lipped-section-canvas{min-height:166px}
      @media screen and (min-width:1400px){
        .visual-card:has(.dim-controls-lipped) .visual-split{min-height:0}
        #sectionCanvas.lipped-section-canvas{height:auto!important;flex:1 1 166px}
        #supportCaseCanvas.compact-support-canvas{height:150px!important;flex:0 0 150px;min-height:150px}
        .section-dim-controls.dim-controls-lipped{grid-template-columns:repeat(3,auto minmax(0,1fr))!important;gap:2px 6px;padding:4px 6px}
        .section-dim-controls.dim-controls-lipped input[data-dim-input]{height:19px}
        .section-dim-controls.dim-controls-lipped .dim-title{margin:0}
        .section-dim-controls.dim-controls-lipped select{font:inherit;height:20px}
        .section-dim-controls.dim-controls-lipped .lip-width-controls{gap:2px 10px}
      }
      .lip-width-controls{grid-column:1/-1;display:flex;flex-wrap:wrap;align-items:center;gap:6px 14px}
      .lip-width-controls label{display:flex;align-items:center;gap:5px}
      .lip-width-controls input{width:auto!important;height:auto!important}
      .section-dim-controls.dim-controls-lipped .dim-step-buttons{display:none}
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
    const lipControls=document.createElement('div');
    lipControls.id='lipWidthControls';
    lipControls.className='lip-width-controls';
    lipControls.innerHTML='<label>B1・B2の参照先 <select id="lipWidthSource"><option value="input">入力値</option><option value="t1">t1</option></select></label><label><input type="checkbox" id="lipWidthLink" checked>B1・B2を連動</label>';
    panel.querySelector('.dim-title').after(lipControls);
    $('lipWidthSource').addEventListener('change',()=>render());
    $('lipWidthLink').addEventListener('change',()=>{
      if($('lipWidthLink').checked)$('B2').value=$('B1').value;
      render();
    });
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
    const lipWidth=id==='B1'||id==='B2';
    if(!target || target.disabled || (lipWidth&&$('lipWidthSource').value==='t1')) return;
    target.value=value;
    if(lipWidth&&$('lipWidthLink').checked){
      $(id==='B1'?'B2':'B1').value=target.value;
    }
    target.dispatchEvent(new Event('input',{bubbles:true}));
    target.dispatchEvent(new Event('change',{bubbles:true}));
    if(typeof ss400FixAutoYield==='function') ss400FixAutoYield();
    if(typeof render==='function') render();
  }
  function syncPanel(){
    const panel=ensurePanel();
    if(!panel) return;
    const lipped=sectionType()===LIPPED_CHANNEL;
    panel.classList.toggle('dim-controls-lipped',lipped);
    const sectionCanvas=$('sectionCanvas'),supportCanvas=$('supportCaseCanvas');
    const compactSupport=lipped&&desktopLayout.matches;
    const pane=(compactSupport?supportCanvas:sectionCanvas).parentElement;
    if(panel.parentElement!==pane) pane.appendChild(panel);
    sectionCanvas.classList.toggle('lipped-section-canvas',lipped);
    supportCanvas.classList.toggle('compact-support-canvas',compactSupport);
    $('lipWidthControls').style.display=lipped?'':'none';
    const useT1=lipped&&$('lipWidthSource').value==='t1';
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
        const widthUsesT1=useT1&&(id==='B1'||id==='B2');
        input.disabled=!editable || !src || src.disabled || widthUsesT1;
        if(widthUsesT1) input.value=$('t1').value;
        else if(src && document.activeElement!==input) input.value=src.value;
        input.classList.toggle('input-error',!!src?.classList.contains('input-error'));
      }
    });
    const note=$('dimCtrlNote');
    if(note) note.textContent=editable?'ホイール可':'形鋼はDB値固定';
  }
  function patchRender(){
    if(typeof render!=='function' || render._sectionDimPatched) return;
    const original=render;
    window.render=function(){
      syncPanel();
      return original.apply(this,arguments);
    };
    window.render._sectionDimPatched=true;
  }
  function init(){
    ensurePanel();
    $('resetBtn')?.addEventListener('click',()=>{
      $('lipWidthSource').value='input';
      $('lipWidthLink').checked=true;
      render();
    });
    patchRender();
    desktopLayout.addEventListener("change",()=>render());
    ['shapePreset','sectionType','diameterD','B','H','t1','t2','jisShapeMode','jisSteelKind','jisSteelSize'].forEach(id=>{
      const el=$(id);if(!el)return;
      ['input','change'].forEach(ev=>el.addEventListener(ev,()=>setTimeout(syncPanel,0)));
    });
    syncPanel();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();