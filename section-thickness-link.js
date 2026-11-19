(function(){
  const DEFAULT_T=3.2;
  let syncing=false;
  function $(id){return document.getElementById(id)}
  function isSectionShape(){return window.BeamSectionMode?window.BeamSectionMode.isManual():true}
  function isSteel(){return window.BeamSectionMode?window.BeamSectionMode.isSteel():!isSectionShape()}
  function dispatch(el){
    if(!el)return;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function ensureCheckbox(){
    let cb=$('thicknessLink');
    if(cb)return cb;
    const panel=$('sectionDimControls');
    if(!panel)return null;
    const label=document.createElement('label');
    label.className='thickness-link-label';
    label.innerHTML='<input id="thicknessLink" type="checkbox" checked><span>板厚を連動</span>';
    panel.querySelector('.dim-title').after(label);
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
    const st=$('sectionType').value;
    cb.disabled=isSteel()||st==='丸棒'||st==='長方形';
    wrap.style.display=cb.disabled?'none':'';
    wrap.querySelector('span').textContent=st===LIPPED_CHANNEL?'t1・t2・t3を連動':'t1・t2を連動';
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
    if($('sectionType').value===LIPPED_CHANNEL)$('t3').value=DEFAULT_T;
    setMaterialSPCC();
    syncCheckboxState();
    if(typeof render==='function')render();
  }
  function syncThickness(sourceId){
    const cb=ensureCheckbox();
    if(syncing||!cb||!cb.checked||isSteel())return;
    const src=$(sourceId);
    const ids=$('sectionType').value===LIPPED_CHANNEL?['t1','t2','t3']:['t1','t2'];
    if(!src||!ids.includes(sourceId))return;
    syncing=true;
    try{
      const targets=ids.filter(id=>id!==sourceId).map($).filter(el=>el&&!el.disabled&&el.value!==src.value);
      targets.forEach(el=>el.value=src.value);
      targets.forEach(dispatch);
    }finally{
      syncing=false;
    }
  }
  function bind(){
    ensureCheckbox();
    $('resetBtn')?.addEventListener('click',()=>{const cb=ensureCheckbox();if(cb){cb.checked=true;syncThickness('t1');render();}});
    ['t1','t2','t3'].forEach(id=>{
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
