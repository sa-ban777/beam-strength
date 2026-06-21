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
      '梁強度計算 結果','計算箇所：'+(val('calcLocation')||'-'),'断面：'+sectionText(),
      '材料：'+val('material')+' / E='+txt('rE')+' N/mm² / 降伏='+txt('rYield')+' N/mm²','支持条件：'+val('loadCase'),
      '荷重方向：'+val('axis'),'梁長さ：'+val('spanL')+' mm','荷重：'+(val('loadCase').includes('等分布')?'w='+val('uniformLoadW')+' N/mm':'P='+val('pointLoadP')+' N'),
      '総合判定：'+txt('overallBadge'),'応力判定：'+txt('stressJudge').replace(/^応力判定：/,''),'たわみ判定：'+txt('deflectionJudge').replace(/^たわみ判定：/,''),
      '安全率：'+txt('rSafety'),'最大応力：'+txt('rStress')+' N/mm²','最大たわみ：'+txt('rDefTotal')+' mm / 許容 '+txt('rDefAllow')+' mm',
      '最大曲げモーメント：'+txt('rM')+' N･mm','断面積：'+txt('rArea')+' mm²','断面二次モーメント：'+txt('rI')+' mm⁴','断面係数：'+txt('rZ')+' mm³','概算質量：'+txt('rMass')+' kg'
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
      @media print{
        @page{size:A4 landscape;margin:5mm}
        html,body{width:287mm!important;height:200mm!important;margin:0!important;background:#fff!important;color:#111!important;overflow:hidden!important}
        body{font-size:7px!important;line-height:1.08!important;-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}.actions,#copyResultBtn,.quick-result-bar,.section-dim-controls,.section-axis-btn,.dim-step-buttons,#jsonImportStatus{display:none!important}
        .topbar{height:9mm!important;margin:0 0 1.5mm!important;padding:0 0 1mm!important;border-bottom:1px solid #111!important;background:#fff!important;color:#111!important}.topbar h1{font-size:13px!important;margin:0!important;color:#111!important}.topbar p{font-size:7px!important;margin:.5mm 0 0!important;color:#333!important}
        .page{display:grid!important;grid-template-columns:54mm 64mm 1fr 1fr!important;grid-template-rows:100mm 76mm!important;grid-template-areas:'input result visual visual' 'input result formula moment'!important;gap:1.5mm!important;width:100%!important;height:181mm!important;padding:0!important;margin:0!important;overflow:hidden!important;align-items:stretch!important}.card{padding:1mm!important;margin:0!important;border:1px solid #999!important;border-radius:0!important;background:#fff!important;overflow:hidden!important;min-height:0!important}.card+.card{margin-top:0!important}
        .input-card{grid-area:input!important}.result-card{grid-area:result!important}.visual-card{grid-area:visual!important}.formula-card{grid-area:formula!important}.moment-card{grid-area:moment!important}h2{font-size:8.5px!important;margin:0 0 .8mm!important;padding:0!important;color:#111!important}.section-title{min-height:0!important;margin:0 0 .8mm!important}.badge,.big-badge{font-size:7.2px!important;padding:.4mm 1mm!important;border-radius:0!important}
        .calc-location-label{display:flex!important;margin:0 0 .8mm!important;padding:.7mm!important;border:1px solid #777!important;border-radius:0!important;font-size:7.2px!important;background:#fff!important}.calc-location-label input{height:5mm!important;border:0!important;border-bottom:1px solid #555!important;border-radius:0!important;font-size:8.8px!important;color:#111!important;background:#fff!important}.condition-summary{font-size:6.3px!important;line-height:1.1!important;white-space:normal!important;overflow:hidden!important;margin:0 0 .8mm!important;padding:.7mm!important;border:1px solid #bbb!important;border-radius:0!important;background:#fff!important;color:#111!important;max-height:9mm!important}.input-warning-panel{display:none!important}
        .input-column{display:grid!important;grid-template-columns:1fr 1fr!important;gap:.6mm!important}.input-column label{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:.6mm!important;min-height:5.6mm!important;padding:.5mm!important;border:1px solid #ddd!important;border-radius:0!important;font-size:6.2px!important;line-height:1.05!important;color:#111!important;background:#fff!important;white-space:nowrap!important}.input-column input,.input-column select{height:4.8mm!important;max-width:24mm!important;font-size:6.7px!important;padding:0 .5mm!important;border:1px solid #aaa!important;border-radius:0!important;color:#111!important;background:#fff!important}.input-column label.input-field-hidden{display:none!important}
        .result-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:.7mm!important}.result-grid>div{min-height:10mm!important;padding:.8mm!important;border:1px solid #aaa!important;border-radius:0!important;background:#fff!important;display:grid!important;grid-template-columns:1fr!important}.result-grid span{font-size:6.1px!important}.result-grid strong{font-size:8px!important;color:#111!important}.result-grid small{font-size:5.8px!important}.sub-judges{gap:1mm!important;margin-top:.8mm!important}.sub-judge{font-size:7.4px!important;padding:.8mm!important;border-radius:0!important}
        .visual-split{display:grid!important;grid-template-columns:1fr 1fr!important;gap:1mm!important;height:auto!important;align-items:start!important}.visual-card canvas{width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:520/320!important;object-fit:contain!important;border:1px solid #ddd!important;border-radius:0!important;display:block!important}.subcaption{font-size:6.4px!important;margin:0 0 .5mm!important}.note{font-size:6.1px!important;margin:.5mm 0 0!important;max-height:5mm!important;overflow:hidden!important}
        .formula{font-size:5.7px!important;line-height:1.05!important;height:68mm!important;min-height:68mm!important;padding:1mm!important;border:1px solid #aaa!important;border-radius:0!important;white-space:pre-wrap!important;overflow:hidden!important;background:#0f172a!important;color:#fff!important}.moment-card canvas{width:100%!important;height:auto!important;max-height:none!important;aspect-ratio:1100/300!important;object-fit:contain!important;border:1px solid #ddd!important;border-radius:0!important;display:block!important}
        .result-reference-banner{display:none!important}.result-card.calc-reference-mode .result-grid{opacity:1!important}.result-card.calc-reference-mode .result-grid::before{display:none!important}
      }
    `;
    document.head.appendChild(s);
  }
  function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.left='-9999px';document.body.appendChild(ta);ta.focus();ta.select();try{document.execCommand('copy')}catch(e){}ta.remove()}
  async function copy(){const text=buildText();try{if(navigator.clipboard&&navigator.clipboard.writeText)await navigator.clipboard.writeText(text);else fallbackCopy(text)}catch(e){fallbackCopy(text)}const btn=$('copyResultBtn');if(btn){const old=btn.textContent;btn.textContent='コピー完了';setTimeout(()=>btn.textContent=old,1200)}}
  function ensureButton(){ensureStyle();if($('copyResultBtn'))return;const actions=document.querySelector('.actions');if(actions){const btn=document.createElement('button');btn.id='copyResultBtn';btn.type='button';btn.textContent='結果コピー';const csv=$('csvBtn');if(csv)csv.insertAdjacentElement('afterend',btn);else actions.appendChild(btn);btn.addEventListener('click',copy)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureButton);else ensureButton();
})();
