(function(){
  const DIM_IDS=['diameterD','B','H','t1','t2'];
  function $(id){return document.getElementById(id)}
  function n(id){const el=$(id);const v=Number(el&&el.value);return Number.isFinite(v)?v:NaN}
  function txt(id){const el=$(id);return el?String(el.value||''):''}
  function isSteel(){return window.BeamSectionMode?window.BeamSectionMode.isSteel():(()=>{const mode=$('jisShapeMode');if(mode)return mode.value==='__steel__';const sp=$('shapePreset');return sp&&!String(sp.value||'').startsWith('断面形状_')})()}
  function sectionType(){return window.BeamSectionMode&&window.BeamSectionMode.getSectionType()?window.BeamSectionMode.getSectionType():(txt('sectionType')||'長方形')}
  function fmt(v,d=3){return Number.isFinite(v)?Number(v).toLocaleString('ja-JP',{maximumFractionDigits:d}):'-'}
  function ensureStyle(){
    if($('inputGuardsSummaryStyle'))return;
    const s=document.createElement('style');
    s.id='inputGuardsSummaryStyle';
    s.textContent=`
      .condition-summary{margin:2px 0 5px;padding:5px 7px;border:1px solid #cbd5e1;border-radius:8px;background:#f8fafc;color:#334155;font-size:12px;font-weight:800;line-height:1.25;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .input-warning-panel{display:none;margin:2px 0 5px;padding:6px 8px;border:2px solid #dc2626;border-radius:8px;background:#fff1f2;color:#991b1b;font-size:12px;font-weight:900;line-height:1.35}
      .input-warning-panel.show{display:block}
      .input-column label.input-field-hidden{display:none!important}
      .input-column input.input-error,.input-column select.input-error{border-color:#dc2626!important;outline:2px solid rgba(220,38,38,.18)!important;background:#fff7f7!important}
      @media(max-width:1600px){.condition-summary{font-size:10.5px;margin:1px 0 2px;padding:3px 5px;border-radius:5px}.input-warning-panel{font-size:10.5px;margin:1px 0 2px;padding:4px 5px;border-radius:5px}}
    `;
    document.head.appendChild(s);
  }
  function ensureUI(){
    ensureStyle();
    const card=document.querySelector('.input-card');
    const title=card&&card.querySelector('.section-title');
    if(!card||!title)return;
    let summary=$('conditionSummary');
    if(!summary){summary=document.createElement('div');summary.id='conditionSummary';summary.className='condition-summary';title.insertAdjacentElement('afterend',summary)}
    let warn=$('inputWarningPanel');
    if(!warn){warn=document.createElement('div');warn.id='inputWarningPanel';warn.className='input-warning-panel';summary.insertAdjacentElement('afterend',warn)}
  }
  function labelOf(id){const el=$(id);return el&&el.closest('label')}
  function setDimVisibility(){
    DIM_IDS.forEach(id=>{const l=labelOf(id);if(l)l.classList.add('input-field-hidden')});
    ['shapePreset','loadCase','axis'].forEach(id=>{const l=labelOf(id);if(l)l.classList.add('input-field-hidden')});
    const link=$('thicknessLink');
    const linkLabel=link&&link.closest('label');
    if(linkLabel)linkLabel.classList.add('input-field-hidden');
  }
  function clearErrors(){['spanL','B','H','diameterD','t1','t2','youngModulus','densityInput','yieldStressInput','pointLoadP','uniformLoadW','deflectionRatio','gravity'].forEach(id=>{const el=$(id);if(el)el.classList.remove('input-error')})}
  function mark(id){const el=$(id);if(el)el.classList.add('input-error')}
  function add(errors,msg,...ids){errors.push(msg);ids.forEach(mark)}
  function validate(){
    clearErrors();
    const st=sectionType();
    const errors=[];
    const L=n('spanL'),E=n('youngModulus'),rho=n('densityInput'),fy=n('yieldStressInput'),ratio=n('deflectionRatio'),g=n('gravity');
    if(!(L>0))add(errors,'梁長さ L は 0 より大きくしてください','spanL');
    if(!(E>0))add(errors,'ヤング率 E は 0 より大きくしてください','youngModulus');
    if(!(rho>0))add(errors,'密度は 0 より大きくしてください','densityInput');
    if(!(fy>0))add(errors,'降伏/耐力は 0 より大きくしてください','yieldStressInput');
    if(!(ratio>0))add(errors,'許容たわみ L/n は 0 より大きくしてください','deflectionRatio');
    if(!(g>0))add(errors,'重力加速度は 0 より大きくしてください','gravity');
    const load=txt('loadCase'),P=n('pointLoadP'),w=n('uniformLoadW');
    if(load.includes('集中')&&!(P>0))add(errors,'集中荷重ケースでは P を 0 より大きくしてください','pointLoadP');
    if(load.includes('等分布')&&!(w>0))add(errors,'等分布荷重ケースでは w を 0 より大きくしてください','uniformLoadW');
    if(isSteel()){
      try{if(typeof calc==='function'){const r=calc();if(!(r.sec.A>0))add(errors,'断面積 A が 0 または計算不能です');if(!(r.sec.I>0))add(errors,'断面二次モーメント I が 0 または計算不能です');if(!(r.sec.Z>0))add(errors,'断面係数 Z が 0 または計算不能です')}}catch(e){add(errors,'断面計算に失敗しました')}
      return errors;
    }
    if(st==='丸棒'){
      const D=n('diameterD');
      if(!(D>0))add(errors,'丸棒の外径 D は 0 より大きくしてください','diameterD');
    }else{
      const B=n('B'),H=n('H');
      if(!(B>0))add(errors,'外形幅 B は 0 より大きくしてください','B');
      if(!(H>0))add(errors,'外形高さ H は 0 より大きくしてください','H');
      if(st!=='長方形'){
        const t1=n('t1'),t2=n('t2');
        if(!(t1>0))add(errors,'t1 は 0 より大きくしてください','t1');
        if(!(t2>0))add(errors,'t2 は 0 より大きくしてください','t2');
        if(Number.isFinite(t1)&&Number.isFinite(H)&&t1>H)add(errors,'t1 が H より大きくなっています','t1','H');
        if(Number.isFinite(t2)&&Number.isFinite(B)&&t2>B)add(errors,'t2 が B より大きくなっています','t2','B');
        if(['I形鋼','H形鋼'].includes(st)&&Number.isFinite(t1)&&Number.isFinite(H)&&2*t1>=H)add(errors,'I/H形は 2×t1 が H 未満になるようにしてください','t1','H');
        if(['コの字','コの字2'].includes(st)&&Number.isFinite(t1)&&Number.isFinite(H)&&t1>=H)add(errors,'コの字は t1 が H 未満になるようにしてください','t1','H');
      }
    }
    try{if(typeof calc==='function'){const r=calc();if(!(r.sec.A>0))add(errors,'断面積 A が 0 または計算不能です');if(!(r.sec.I>0))add(errors,'断面二次モーメント I が 0 または計算不能です');if(!(r.sec.Z>0))add(errors,'断面係数 Z が 0 または計算不能です');if(!Number.isFinite(r.stress))add(errors,'曲げ応力が計算不能です');if(!Number.isFinite(r.dTotal))add(errors,'たわみが計算不能です')}}catch(e){add(errors,'断面計算に失敗しました')}
    return errors;
  }
  function updateSummary(){
    ensureUI();
    const summary=$('conditionSummary');
    if(!summary)return;
    const st=sectionType();
    const shape=isSteel()?('形鋼 '+(txt('jisSteelKind')||'')+' '+(txt('jisSteelSize')||txt('shapePreset'))):('断面形状 '+st);
    const load=txt('loadCase');
    let dims='';
    if(isSteel()) dims='DB寸法';
    else if(st==='丸棒') dims='D='+fmt(n('diameterD'));
    else if(st==='長方形') dims='B='+fmt(n('B'))+' / H='+fmt(n('H'));
    else dims='B='+fmt(n('B'))+' / H='+fmt(n('H'))+' / t1='+fmt(n('t1'))+' / t2='+fmt(n('t2'));
    const force=load.includes('等分布')?'w='+fmt(n('uniformLoadW'),6)+'N/mm':'P='+fmt(n('pointLoadP'),1)+'N';
    summary.textContent=shape+'｜'+dims+'｜'+txt('axis')+'｜L='+fmt(n('spanL'),1)+'mm｜'+force+'｜材料='+txt('material')+'｜支持='+load;
  }
  function apply(){
    setDimVisibility();
    updateSummary();
    const errors=validate();
    const warn=$('inputWarningPanel');
    if(warn){warn.classList.toggle('show',errors.length>0);warn.textContent=errors.length?'入力確認：'+errors.join(' / '):''}
    const badge=$('shapeCheckBadge');
    if(badge&&errors.length){badge.textContent='断面判定：入力確認';badge.className='badge ng'}
  }
  function patchRender(){
    if(typeof render!=='function'||render._inputGuardsPatched)return;
    const original=render;
    window.render=function(){
      const result=original.apply(this,arguments);
      apply();
      return result;
    };
    window.render._inputGuardsPatched=true;
  }
  function bind(){
    ['shapePreset','jisShapeMode','jisSteelKind','jisSteelSize','sectionType','axis','material','loadCase','spanL','pointLoadP','uniformLoadW','diameterD','B','H','t1','t2','youngModulus','densityInput','yieldStressInput','deflectionRatio','gravity'].forEach(id=>{
      const el=$(id);if(!el||el.dataset.inputGuardsBound==='1')return;
      el.dataset.inputGuardsBound='1';
      el.addEventListener('input',()=>setTimeout(apply,0));
      el.addEventListener('change',()=>setTimeout(apply,0));
    });
  }
  function init(){ensureUI();bind();patchRender();apply()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
