(function(){
  const $=id=>document.getElementById(id);
  function ensureStyle(){
    if($('printReportStyle'))return;
    const s=document.createElement('style');
    s.id='printReportStyle';
    s.textContent=`
      .calc-location-label{display:flex!important;align-items:center!important;gap:6px!important;background:#fff!important;border:1px solid #bfdbfe!important;border-radius:8px!important;padding:5px 7px!important;margin:2px 0 5px!important;font-weight:900;color:#334155}
      .calc-location-label input{flex:1 1 auto!important;min-width:160px!important;height:28px!important;border:1px solid #cbd5e1!important;border-radius:6px!important;padding:2px 7px!important;font-size:13px!important;background:#fff!important;color:#111827!important}
      @media(max-width:640px){.calc-location-label{font-size:11.5px!important;padding:4px 6px!important}.calc-location-label input{height:28px!important;font-size:13px!important;min-width:120px!important}}
      @media print{
        @page{size:A4 portrait;margin:7mm}
        *{box-shadow:none!important;text-shadow:none!important}
        html,body{width:210mm!important;height:297mm!important;margin:0!important;background:#fff!important;color:#111!important;overflow:hidden!important}
        body{font-size:8.5px!important;line-height:1.12!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
        .topbar{padding:0 0 2mm!important;margin:0 0 1mm!important;border-bottom:1px solid #111!important;background:#fff!important;color:#111!important;display:flex!important;align-items:flex-start!important;justify-content:space-between!important}
        .topbar h1{font-size:14px!important;margin:0!important;color:#111!important}.topbar p{font-size:7.5px!important;margin:1px 0 0!important;color:#333!important}.actions{display:none!important}
        .page{display:grid!important;grid-template-columns:1fr 1fr!important;grid-template-areas:'summary summary' 'input result' 'visual visual' 'formula moment'!important;gap:1.4mm!important;padding:0!important;margin:0!important;width:100%!important;max-width:none!important;overflow:hidden!important}
        .quick-result-bar{grid-area:summary!important;position:static!important;display:grid!important;grid-template-columns:repeat(5,1fr)!important;gap:1mm!important;margin:0!important;padding:1mm!important;border:1px solid #333!important;border-radius:0!important;background:#f8fafc!important;break-inside:avoid!important}
        .quick-result-item{min-height:8mm!important;padding:1mm!important;border:1px solid #888!important;border-radius:0!important;background:#fff!important}.quick-result-item span{font-size:7px!important}.quick-result-item strong{font-size:9px!important;color:#111!important}
        .card{padding:1.2mm!important;margin:0!important;border:1px solid #777!important;border-radius:0!important;background:#fff!important;break-inside:avoid!important;overflow:hidden!important}.card+ .card{margin-top:0!important}
        .input-card{grid-area:input!important}.result-card{grid-area:result!important}.visual-card{grid-area:visual!important}.formula-card{grid-area:formula!important}.moment-card{grid-area:moment!important}
        h2{font-size:9px!important;margin:0 0 1mm!important;padding:0!important;color:#111!important}.section-title{min-height:0!important;margin:0 0 1mm!important}.badge,.big-badge{font-size:8px!important;padding:1px 3px!important;border-radius:0!important}
        .calc-location-label{display:flex!important;margin:0 0 1mm!important;padding:1mm!important;border:1px solid #333!important;border-radius:0!important;font-size:8px!important;background:#fff!important}.calc-location-label input{height:6mm!important;border:0!important;border-bottom:1px solid #333!important;border-radius:0!important;font-size:10px!important;padding:0 1mm!important;color:#111!important}
        .condition-summary{font-size:7.2px!important;line-height:1.15!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;margin:0 0 1mm!important;padding:1mm!important;border:1px solid #aaa!important;border-radius:0!important;background:#fff!important;color:#111!important}.input-warning-panel{font-size:7.5px!important;line-height:1.15!important;margin:0 0 1mm!important;padding:1mm!important;border-radius:0!important}
        .input-column{display:grid!important;grid-template-columns:1fr 1fr!important;gap:.7mm!important}.input-column label{display:flex!important;min-height:0!important;padding:.6mm!important;border:1px solid #ddd!important;border-radius:0!important;font-size:7px!important;line-height:1.1!important;color:#111!important;background:#fff!important}.input-column input,.input-column select{height:5.5mm!important;font-size:7.5px!important;padding:0 .6mm!important;border:1px solid #aaa!important;border-radius:0!important;color:#111!important;background:#fff!important}
        .result-grid{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:.7mm!important}.result-grid>div{min-height:9mm!important;padding:.8mm!important;border:1px solid #aaa!important;border-radius:0!important;background:#fff!important}.result-grid span{font-size:6.6px!important}.result-grid strong{font-size:8.2px!important}.result-grid small{font-size:6.2px!important}.sub-judges{gap:1mm!important;margin-top:1mm!important}.sub-judge{font-size:8px!important;padding:1mm!important;border-radius:0!important}
        .visual-split{display:grid!important;grid-template-columns:1fr 1fr!important;gap:1mm!important}.visual-card canvas{height:58mm!important;max-height:58mm!important;flex:0 0 58mm!important}.moment-card canvas{height:47mm!important;max-height:47mm!important;flex:0 0 47mm!important}.subcaption{font-size:7px!important}.note{font-size:7px!important;margin:1mm 0 0!important}.section-dim-controls,.section-axis-btn{display:none!important}
        .formula{font-size:6.3px!important;line-height:1.08!important;min-height:47mm!important;height:47mm!important;padding:1mm!important;border:1px solid #aaa!important;border-radius:0!important;white-space:pre-wrap!important;overflow:hidden!important;background:#fff!important;color:#111!important}
        .result-reference-banner{font-size:7.5px!important;margin:0 0 1mm!important;padding:1mm!important;border-radius:0!important}.result-card.calc-reference-mode .result-grid{opacity:1!important}.result-card.calc-reference-mode .result-grid::before{font-size:7.5px!important;padding:1mm!important;border-radius:0!important}
      }
    `;
    document.head.appendChild(s);
  }
  function ensureLocation(){
    if($('calcLocation'))return;
    const card=document.querySelector('.input-card');const title=card&&card.querySelector('.section-title');
    if(!card||!title)return;
    const label=document.createElement('label');
    label.className='calc-location-label';
    label.innerHTML='計算箇所 <input id="calcLocation" type="text" placeholder="例：盤内補強材、扉フレーム、受皿梁など">';
    title.insertAdjacentElement('afterend',label);
    const input=$('calcLocation');
    input.addEventListener('input',()=>{if(typeof render==='function')setTimeout(render,0)});
  }
  function enhancedSave(e){
    if(!e.target||e.target.id!=='jsonBtn')return;
    e.preventDefault();e.stopImmediatePropagation();
    const data=typeof inputs==='function'?inputs():{};
    data.calcLocation=$('calcLocation')?$('calcLocation').value:'';
    data.savedAt=new Date().toISOString();
    const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='beam_strength_input.json';a.click();URL.revokeObjectURL(u);
  }
  function init(){ensureStyle();ensureLocation();document.addEventListener('click',enhancedSave,true)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
