(function(){
  function $(id){return document.getElementById(id)}
  function val(id){const el=$(id);return el?String(el.value||'').trim():''}
  function txt(id){const el=$(id);return el?String(el.textContent||'').trim():''}
  function isSteel(){return window.BeamSectionMode&&window.BeamSectionMode.isSteel&&window.BeamSectionMode.isSteel()}
  function sectionText(){
    if(isSteel())return '形鋼 '+val('jisSteelKind')+' '+val('jisSteelSize');
    const st=val('sectionType');
    if(st==='丸棒')return '断面形状 '+st+' D='+val('diameterD')+'mm';
    if(st==='長方形')return '断面形状 '+st+' B='+val('B')+'mm H='+val('H')+'mm';
    return '断面形状 '+st+' B='+val('B')+'mm H='+val('H')+'mm t1='+val('t1')+'mm t2='+val('t2')+'mm';
  }
  function buildText(){
    return [
      '梁強度計算 結果',
      '計算箇所：'+(val('calcLocation')||'-'),
      '断面：'+sectionText(),
      '材料：'+val('material')+' / E='+txt('rE')+' N/mm² / 降伏='+txt('rYield')+' N/mm²',
      '支持条件：'+val('loadCase'),
      '荷重方向：'+val('axis'),
      '梁長さ：'+val('spanL')+' mm',
      '荷重：'+(val('loadCase').includes('等分布')?'w='+val('uniformLoadW')+' N/mm':'P='+val('pointLoadP')+' N'),
      '総合判定：'+txt('overallBadge'),
      '応力判定：'+txt('stressJudge').replace(/^応力判定：/,''),
      'たわみ判定：'+txt('deflectionJudge').replace(/^たわみ判定：/,''),
      '安全率：'+txt('rSafety'),
      '最大応力：'+txt('rStress')+' N/mm²',
      '最大たわみ：'+txt('rDefTotal')+' mm / 許容 '+txt('rDefAllow')+' mm',
      '最大曲げモーメント：'+txt('rM')+' N･mm',
      '断面積：'+txt('rArea')+' mm²',
      '断面二次モーメント：'+txt('rI')+' mm⁴',
      '断面係数：'+txt('rZ')+' mm³',
      '概算質量：'+txt('rMass')+' kg'
    ].join('\n');
  }
  function ensureStyle(){
    if($('resultCopyStyle'))return;
    const s=document.createElement('style');
    s.id='resultCopyStyle';
    s.textContent=`
      #copyResultBtn{min-height:28px;padding:4px 8px;border:1px solid #2563eb;border-radius:8px;background:#eff6ff;color:#1d4ed8;font-weight:900;cursor:pointer}
      #copyResultBtn:active{background:#bfdbfe}
      @media(max-width:640px){#copyResultBtn{min-height:30px;font-size:11.5px;padding:5px 6px}}
      @media print{#copyResultBtn{display:none!important}}
    `;
    document.head.appendChild(s);
  }
  function fallbackCopy(text){
    const ta=document.createElement('textarea');
    ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';
    document.body.appendChild(ta);ta.focus();ta.select();
    try{document.execCommand('copy')}catch(e){}
    ta.remove();
  }
  async function copy(){
    const text=buildText();
    try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(text);else fallbackCopy(text)}catch(e){fallbackCopy(text)}
    const btn=$('copyResultBtn');if(btn){const old=btn.textContent;btn.textContent='コピー完了';setTimeout(()=>btn.textContent=old,1200)}
  }
  function ensureButton(){
    ensureStyle();
    if($('copyResultBtn'))return;
    const actions=document.querySelector('.actions');
    if(actions){
      const btn=document.createElement('button');btn.id='copyResultBtn';btn.type='button';btn.textContent='結果コピー';
      const csv=$('csvBtn');if(csv)csv.insertAdjacentElement('afterend',btn);else actions.appendChild(btn);
      btn.addEventListener('click',copy);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureButton);else ensureButton();
})();
