(function(){
  const data=window.BEAM_XLSM_DATA;
  const hidden=document.getElementById('shapePreset');
  if(!data||!hidden||document.getElementById('jisShapeMode')) return;

  const label=hidden.closest('label');
  const parent=label&&label.parentNode;
  if(!parent) return;
  label.style.display='none';

  const sectionPresets=[
    ['断面形状_L字','断面形状_L字'],
    ['断面形状_コの字','断面形状_コの字'],
    ['断面形状_凹の字','断面形状_凹の字'],
    ['断面形状_I(H)形','断面形状_I(H)形'],
    ['断面形状_円','断面形状_円'],
    ['断面形状_長方形','断面形状_長方形']
  ];
  const jisShapes=(data.shapes||[]).filter(s=>s.source==='JIS G 3192:2014');
  const kinds=[...new Set(jisShapes.map(s=>s.shapeKind||s.jisKind).filter(Boolean))];

  function makeLabel(text,id){
    const l=document.createElement('label');
    l.textContent=text;
    const s=document.createElement('select');
    s.id=id;
    l.appendChild(s);
    return {label:l,select:s};
  }

  const mode=makeLabel('断面形状','jisShapeMode');
  const kind=makeLabel('形鋼種類','jisSteelKind');
  const size=makeLabel('形鋼サイズ','jisSteelSize');

  parent.insertBefore(mode.label,label);
  parent.insertBefore(kind.label,label);
  parent.insertBefore(size.label,label);

  mode.select.innerHTML=[
    ...sectionPresets.map(([v,t])=>`<option value="${v}">${t}</option>`),
    '<option value="__steel__">形鋼</option>'
  ].join('');
  kind.select.innerHTML=kinds.map(k=>`<option value="${k}">${k}</option>`).join('');

  function dispatchHidden(){
    hidden.dispatchEvent(new Event('input',{bubbles:true}));
    hidden.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function setDisabledSteel(disabled){
    kind.select.disabled=disabled;
    size.select.disabled=disabled;
    kind.label.style.opacity=disabled?0.45:1;
    size.label.style.opacity=disabled?0.45:1;
  }
  function refreshSizes(keepValue){
    const k=kind.select.value;
    const list=jisShapes.filter(s=>(s.shapeKind||s.jisKind)===k);
    const before=keepValue||size.select.value;
    size.select.innerHTML=list.map(s=>`<option value="${s.name}">${s.jisSize||s.displayName||s.name}</option>`).join('');
    if(before&&[...size.select.options].some(o=>o.value===before)) size.select.value=before;
    if(!size.select.value&&size.select.options.length) size.select.selectedIndex=0;
  }
  function applySelection(){
    if(mode.select.value==='__steel__'){
      setDisabledSteel(false);
      refreshSizes();
      if(size.select.value) hidden.value=size.select.value;
    }else{
      setDisabledSteel(true);
      hidden.value=mode.select.value;
    }
    dispatchHidden();
  }
  function wheelSelect(e){
    const el=e.currentTarget;
    if(!el||el.disabled) return;
    e.preventDefault();
    const n=el.options.length;
    if(!n) return;
    let idx=el.selectedIndex<0?0:el.selectedIndex;
    idx += e.deltaY>0?1:-1;
    idx=Math.max(0,Math.min(n-1,idx));
    if(idx!==el.selectedIndex){
      el.selectedIndex=idx;
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }
  }

  mode.select.addEventListener('change',applySelection);
  kind.select.addEventListener('change',()=>{refreshSizes();applySelection();});
  size.select.addEventListener('change',applySelection);
  [mode.select,kind.select,size.select].forEach(s=>s.addEventListener('wheel',wheelSelect,{passive:false}));

  const curShape=jisShapes.find(s=>s.name===hidden.value);
  if(curShape){
    mode.select.value='__steel__';
    kind.select.value=curShape.shapeKind||curShape.jisKind;
    refreshSizes(curShape.name);
  }else{
    const curSection=sectionPresets.find(([v])=>v===hidden.value);
    if(curSection) mode.select.value=curSection[0];
    else {
      const defaultJis=jisShapes.find(s=>s.jisSize==='50×50×6'&&s.shapeKind==='等辺山形鋼')||jisShapes[0];
      if(defaultJis){
        mode.select.value='__steel__';
        kind.select.value=defaultJis.shapeKind||defaultJis.jisKind;
        refreshSizes(defaultJis.name);
      }
    }
  }
  applySelection();
})();