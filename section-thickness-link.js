(function(){
  const DEFAULT_T=3.2;
  let syncing=false;
  function $(id){return document.getElementById(id)}
  function isSectionShape(){
    const mode=$('jisShapeMode');
    if(mode) return mode.value!=='__steel__';
    const hidden=$('shapePreset');
    return !!hidden && String(hidden.value||'').startsWith('断面形状_');
  }
  function isSteel(){return !isSectionShape()}
  function dispatch(el){
    if(!el)return;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function ensureStyle(){
    if($('thicknessLinkStyle'))return;
    const style=document.createElement('style');
    style.id='thicknessLinkStyle';
    style.textContent=`
      .thickness-link-label{display:flex;align-items:center;justify-content:space-between;gap:8px}
      .thickness-link-label span{display:flex;align-items:center;gap:6px;font-weight:800;color:#334155}
      .thickness-link-label input{width:auto;accent-color:#2563eb}
      .thickness-link-label small{font-size:10px;color:#64748b}
    `;
    document.head.appendChild(style);
  }
  function ensureCheckbox(){
    ensureStyle();
    let cb=$('thicknessLink');
    if(cb)return cb;
    const t2=$('t2');
    const t2Label=t2&&t2.closest('label');
    if(!t2Label||!t2Label.parentNode)return null;
    const label=document.createElement('label');
    label.className='thickness-link-label';
    label.innerHTML='<span><input id="thicknessLink" type="checkbox" checked>t1/t2連動</span><small>形鋼時は無効</small>';
    t2Label.parentNode.insertBefore(label,t2Label.nextSibling);
    cb=$('thicknessLink');
    cb.addEventListener('change',()=>{
      if(cb.checked && isSectionShape()) syncThickness('t1');
      syncCheckboxState();
      if(typeof render==='function')render();
    });
    return cb;
  }
  function syncCheckboxState(){
    const cb=ensureCheckbox();
    const wrap=cb&&cb.closest('label');
    if(!cb||!wrap)return;
    const steel=isSteel();
    cb.disabled=steel;
    wrap.style.opacity=steel?0.45:1;
  }
  function setMaterialSPCC(){
    const mat=$('material');
    if(!mat)return;
    const has=[...mat.options].some(o=>o.value==='SPCC');
    if(!has||mat.value==='SPCC')return;
    mat.value='SPCC';
    dispatch(mat);
  }
  function setSectionDefaults(){
    if(!isSectionShape())return;
    const t1=$('t1'),t2=$('t2');
    if(t1&&!t1.disabled)t1.value=DEFAULT_T;
    if(t2&&!t2.disabled)t2.value=DEFAULT_T;
    setMaterialSPCC();
    syncCheckboxState();
    if(typeof render==='function')render();
  }
  function syncThickness(sourceId){
    const cb=ensureCheckbox();
    if(syncing||!cb||!cb.checked||isSteel())return;
    const src=$(sourceId);
    const dst=$(sourceId==='t1'?'t2':'t1');
    if(!src||!dst||dst.disabled)return;
    syncing=true;
    dst.value=src.value;
    dispatch(dst);
    syncing=false;
  }
  function bind(){
    ensureCheckbox();
    ['t1','t2'].forEach(id=>{
      const el=$(id);if(!el||el.dataset.thicknessLinkBound==='1')return;
      el.dataset.thicknessLinkBound='1';
      el.addEventListener('input',()=>syncThickness(id));
      el.addEventListener('change',()=>syncThickness(id));
    });
    ['shapePreset','jisShapeMode','jisSteelKind','jisSteelSize'].forEach(id=>{
      const el=$(id);if(!el||el.dataset.sectionDefaultsBound==='1')return;
      el.dataset.sectionDefaultsBound='1';
      el.addEventListener('change',()=>setTimeout(setSectionDefaults,0));
      el.addEventListener('input',()=>setTimeout(setSectionDefaults,0));
    });
    syncCheckboxState();
  }
  function patchRender(){
    if(typeof render!=='function'||render._thicknessLinkPatched)return;
    const original=render;
    window.render=function(){
      const result=original.apply(this,arguments);
      syncCheckboxState();
      return result;
    };
    window.render._thicknessLinkPatched=true;
  }
  function init(){bind();patchRender();syncCheckboxState();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);
  else init();
})();
