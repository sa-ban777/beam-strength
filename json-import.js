(function(){
  const $=id=>document.getElementById(id);
  const fire=el=>{if(el){el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
  const set=(id,v)=>{const el=$(id);if(el&&v!==undefined&&v!==null){el.value=v;fire(el);}};
  function presetOf(sectionType){return {'L字':'断面形状_L字','コの字2':'断面形状_コの字','コの字':'断面形状_凹の字','I形鋼':'断面形状_I(H)形','H形鋼':'断面形状_I(H)形','丸棒':'断面形状_円','長方形':'断面形状_長方形'}[sectionType]||'断面形状_長方形'}
  function hasOption(sel,v){return !!sel&&[...sel.options].some(o=>o.value===v)}
  function normalize(j){return{shape:j.shapePreset||(j.shape&&j.shape.name),manual:j.manual,sectionType:j.sectionType,material:j.material||j.materialName,E:j.E??j.youngModulus,density:j.density??j.densityInput,yieldStress:j.yieldStress??j.Fy??j.yieldStressInput,axis:j.axis,L:j.L??j.spanL,P:j.P??j.pointLoadP,w:j.w??j.uniformLoadW,n:j.n??j.deflectionRatio,D:j.D??j.diameterD,B:j.B,H:j.H,t1:j.t1,t2:j.t2,g:j.g??j.gravity,loadCase:j.loadCase}}
  function restoreShape(d,cb){
    const mode=$('jisShapeMode'),kind=$('jisSteelKind'),size=$('jisSteelSize'),hidden=$('shapePreset');
    const shapes=(window.BEAM_XLSM_DATA&&window.BEAM_XLSM_DATA.shapes)||[];
    const s=shapes.find(x=>x.name===d.shape);
    if(mode&&s&&d.manual===false){
      mode.value='__steel__';fire(mode);
      if(kind){kind.value=s.shapeKind||s.jisKind||kind.value;fire(kind)}
      setTimeout(()=>{if(size&&hasOption(size,s.name)){size.value=s.name;fire(size)}else if(hidden){hidden.value=s.name;fire(hidden)}cb();},0);
      return;
    }
    const p=String(d.shape||'').startsWith('断面形状_')?d.shape:presetOf(d.sectionType);
    if(mode&&hasOption(mode,p)){mode.value=p;fire(mode)}else if(hidden&&hasOption(hidden,p)){hidden.value=p;fire(hidden)}
    cb();
  }
  function restore(j){
    const d=normalize(j||{});
    restoreShape(d,()=>setTimeout(()=>{
      set('sectionType',d.sectionType);set('material',d.material);set('loadCase',d.loadCase);set('axis',d.axis);
      set('deflectionRatio',d.n);set('spanL',d.L);set('pointLoadP',d.P);set('uniformLoadW',d.w);set('gravity',d.g);
      set('diameterD',d.D);set('B',d.B);set('H',d.H);set('t1',d.t1);set('t2',d.t2);
      set('youngModulus',d.E);set('densityInput',d.density);set('yieldStressInput',d.yieldStress);
      if(typeof render==='function')render();
      const b=$('jsonImportBtn');if(b){const t=b.textContent;b.textContent='JSON読込完了';setTimeout(()=>b.textContent=t,1200)}
    },0));
  }
  function setup(){
    if($('jsonImportBtn'))return;
    const save=$('jsonBtn');if(!save||!save.parentNode)return;
    const btn=document.createElement('button');btn.id='jsonImportBtn';btn.type='button';btn.textContent='入力JSON読込';
    const file=document.createElement('input');file.id='jsonImportFile';file.type='file';file.accept='.json,application/json';file.style.display='none';
    save.insertAdjacentElement('afterend',btn);btn.insertAdjacentElement('afterend',file);
    btn.addEventListener('click',()=>{file.value='';file.click()});
    file.addEventListener('change',()=>{
      const f=file.files&&file.files[0];if(!f)return;
      const r=new FileReader();
      r.onload=()=>{try{restore(JSON.parse(String(r.result||'')))}catch(e){window.alert('JSON読込に失敗しました')}};
      r.readAsText(f,'utf-8');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup);else setup();
})();
