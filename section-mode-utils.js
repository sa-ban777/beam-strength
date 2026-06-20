(function(){
  function $(id){return document.getElementById(id)}
  function getMode(){
    const mode=$('jisShapeMode');
    if(mode) return mode.value==='__steel__'?'steel':'manual';
    const preset=$('shapePreset');
    if(preset) return String(preset.value||'').startsWith('断面形状_')?'manual':'steel';
    return 'manual';
  }
  function getSectionType(){
    const el=$('sectionType');
    return el?String(el.value||''):'';
  }
  function isSteel(){return getMode()==='steel'}
  function isManual(){return getMode()==='manual'}
  window.BeamSectionMode={getMode,isSteel,isManual,getSectionType};
  window.getBeamSectionMode=getMode;
  window.isSteelSection=isSteel;
  window.isManualSection=isManual;
})();
