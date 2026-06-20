(function(){
  const DIM_IDS=['diameterD','B','H','t1','t2'];
  function $(id){return document.getElementById(id)}
  function n(id){const el=$(id);const v=Number(el&&el.value);return Number.isFinite(v)?v:NaN}
  function txt(id){const el=$(id);return el?String(el.value||''):''}
  function isSteel(){const mode=$('jisShapeMode');if(mode)return mode.value==='__steel__';const sp=$('shapePreset');return sp&&!String(sp.value||'').startsWith('断面形状_')}
  function sectionType(){return txt('sectionType')||'長方形'}
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
    const loadLabel=labelOf('loadCase');
    if(loadLabel)loadLabel.classList.add('input-field-hidden');
    const link=$('thicknessLink');
    const linkLabel=link&&link.closest('label');
    if(linkLabel)linkLabel.classList.add('input-field-hidden');
  }
  function clearErrors(){['spanL','B','H','diameterD','t1','t2','youngModulus','densityInput','yieldStressInput'].forEach(id=>{const el=$(id);if(el)el.classList.remove('input-error')})}
  function mark(id){const el=$(id);if(el)el.classList.add('input-error')}
  function validate(){
    clearErrors();
    if(isSteel()) return [];
    const st=sectionType();
    const errors=[];
    const L=n('spanL');
    if(!(L>0)){errors.push('梁長さ L は 0 より大きくしてください');mark('spanL')}
    const E=n('youngModulus'),rho=n('densityInput'),fy=n('yieldStressInput');
    if(!(E>0)){errors.push('ヤング率 E は 0 より大きくしてください');mark('youngModulus')}
    if(!(rho>0)){errors.push('密度は 0 より大きくしてください');mark('densityInput')}
    if(!(fy>0)){errors.push('降伏/耐力は 0 より大きくしてください');mark('yieldStressInput')}
    if(st==='丸棒'){
      const D=n('diameterD');
      if(!(D>0)){errors.push('丸棒の外径 D は 0 より大きくしてください');mark('diameterD')}
      return errors;
    }
    const B=n('B'),H=n('H');
    if(!(B>0)){errors.push('外形幅 B は 0 より大きくしてください');mark('B')}
    if(!(H>0)){errors.push('外形高さ H は 0 より大きくしてください');mark('H')}
    if(st==='長方形') return errors;
    const t1=n('t1'),t2=n('t2');
    if(!(t1>0)){errors.push('t1 は 0 より大きくしてください');mark('t1')}
    if(!(t2>0)){errors.push('t2 は 0 より大きくしてください');mark('t2')}
    if(Number.isFinite(t1)&&Number.isFinite(H)&&t1>H){errors.push('t1 が H より大きくなっています');mark('t1');mark('H')}
    if(Number.isFinite(t2)&&Number.isFinite(B)&&t2>B){errors.push('t2 が B より大きくなっています');mark('t2');mark('B')}
    if(['I形鋼','H形鋼'].includes(st)&&Number.isFinite(t1)&&Number.isFinite(H)&&2*t1>=H){errors.push('I/H形は 2×t1 が H 未満になるようにしてください');mark('t1');mark('H')}
    if(['コの字','コの字2'].includes(st)&&Number.isFinite(t1)&&Number.isFinite(H)&&t1>=H){errors.push('コの字は t1 が H 未満になるようにしてください');mark('t1');mark('H')}
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
    ['shapePreset','jisShapeMode','jisSteelKind','jisSteelSize','sectionType','axis','material','loadCase','spanL','pointLoadP','uniformLoadW','diameterD','B','H','t1','t2','youngModulus','densityInput','yieldStressInput'].forEach(id=>{
      const el=$(id);if(!el||el.dataset.inputGuardsBound==='1')return;
      el.dataset.inputGuardsBound='1';
      el.addEventListener('input',()=>setTimeout(apply,0));
      el.addEventListener('change',()=>setTimeout(apply,0));
    });
  }
  function init(){ensureUI();bind();patchRender();apply()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
