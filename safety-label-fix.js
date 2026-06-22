(function(){
  function $(id){return document.getElementById(id)}
  function labelOf(id){const el=$(id);return el&&el.closest('div')&&el.closest('div').querySelector('span')}
  function removeCard(id){const el=$(id);const card=el&&el.closest('div');if(card)card.remove()}
  function ensureStyle(){
    if($('safetyLabelFixStyle'))return;
    const s=document.createElement('style');
    s.id='safetyLabelFixStyle';
    s.textContent=`
      .quick-result-bar{grid-template-columns:repeat(5,minmax(120px,1fr))!important;gap:6px!important;margin:0 0 8px!important;padding:7px!important;border-radius:10px!important;background:#e8f0ff!important}
      .quick-result-item{display:grid!important;grid-template-columns:1fr!important;grid-template-rows:auto auto!important;align-items:center!important;justify-content:stretch!important;min-height:50px!important;padding:7px 10px!important;gap:4px!important;border-radius:8px!important;overflow:visible!important}
      .quick-result-item span{font-size:12px!important;line-height:1.05!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;color:#334155!important}
      .quick-result-item strong{font-size:18px!important;line-height:1.05!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;text-align:left!important;color:#0f172a!important}
      #quickJudge{font-size:17px!important}
      .result-card .result-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:5px!important}
      .result-card .result-grid>div{min-height:36px!important;padding:4px 7px!important;border-radius:6px!important;display:grid!important;grid-template-columns:1fr auto!important;grid-template-rows:auto auto!important;align-items:center!important;column-gap:6px!important;row-gap:2px!important}
      .result-card .result-grid span{font-size:11.5px!important;line-height:1.1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
      .result-card .result-grid strong{font-size:15px!important;line-height:1.05!important;white-space:nowrap!important;text-align:right!important;grid-row:1/3!important;grid-column:2!important}
      .result-card .result-grid small{font-size:10px!important;line-height:1!important;white-space:nowrap!important;grid-column:1!important;color:#64748b!important}
      .result-card .sub-judges{margin-top:5px!important;gap:5px!important}
      .result-card .sub-judge{padding:5px 8px!important;font-size:11.5px!important;line-height:1.05!important;border-radius:6px!important}
      .section-performance-block{margin-top:8px!important;padding-top:8px!important;border-top:1px solid #cbd5e1!important}
      .section-performance-block h3{font-size:12.5px!important;margin:0 0 6px!important;color:#334155!important}
      .section-performance-grid{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}
      .section-performance-grid>div{min-height:46px!important;padding:6px 8px!important;border:1px solid #dbe3ef!important;border-radius:8px!important;background:#fff!important;display:grid!important;grid-template-columns:1fr!important;grid-template-rows:auto auto auto!important;align-items:start!important;row-gap:3px!important}
      .section-performance-grid span{font-size:12px!important;line-height:1.15!important;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;color:#334155!important;display:block!important}
      .section-performance-grid strong{font-size:15px!important;line-height:1.05!important;white-space:nowrap!important;text-align:left!important;grid-row:auto!important;grid-column:auto!important;color:#0f172a!important;display:block!important}
      .section-performance-grid small{font-size:10px!important;line-height:1!important;white-space:nowrap!important;grid-column:auto!important;color:#64748b!important;display:block!important}
      @media(max-width:640px){.quick-result-bar{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important;padding:4px!important}.quick-result-item{min-height:42px!important;padding:5px 7px!important}.quick-result-item:first-child{grid-column:1/-1!important}.quick-result-item span{font-size:10.5px!important}.quick-result-item strong{font-size:15px!important}.result-card .result-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}.result-card .result-grid>div{min-height:34px!important;padding:3px 6px!important}.result-card .result-grid span{font-size:10px!important}.result-card .result-grid strong{font-size:13px!important}.result-card .result-grid small{font-size:9px!important}.section-performance-grid{grid-template-columns:1fr!important;gap:4px!important}.section-performance-grid>div{min-height:40px!important;padding:5px 7px!important}.section-performance-grid span{font-size:11px!important}.section-performance-grid strong{font-size:13px!important}.section-performance-grid small{font-size:9px!important}}
    `;
    document.head.appendChild(s);
  }
  function removeShortBendingCards(){
    removeCard('rBendRatioShort');
    document.querySelectorAll('.result-card .result-grid>div').forEach(card=>{
      const span=card.querySelector('span');
      const strong=card.querySelector('strong');
      const label=span?String(span.textContent||'').trim():'';
      if(label==='曲げ応力 短期'||label==='短期曲げ応力度比')card.remove();
      if(strong&&strong.id==='rBendRatioShort')card.remove();
    });
  }
  function renameAndRemove(){
    ensureStyle();
    const s=labelOf('rSafety');
    if(s)s.textContent='安全率（曲げ応力 短期）';
    removeShortBendingCards();
    const l=labelOf('rBendRatioLong');
    if(l)l.textContent='曲げ応力 長期';
    const u=$('rBendRatioLong')&&$('rBendRatioLong').parentElement&&$('rBendRatioLong').parentElement.querySelector('small');
    if(u)u.textContent='(降伏/1.5)/σ';
    const iLabel=labelOf('rI');
    if(iLabel)iLabel.textContent='断面二次モーメント';
    const memo=$('formulaMemo');
    if(memo){
      let t=String(memo.textContent||'');
      t=t.replace(/曲げ応力 短期 = 降伏 \/ σ/g,'安全率（曲げ応力 短期） = 降伏 / σ');
      memo.textContent=t;
    }
  }
  function patchRender(){
    if(typeof render!=='function'||render._safetyLabelFixPatched)return;
    const original=render;
    window.render=function(){const out=original.apply(this,arguments);renameAndRemove();setTimeout(renameAndRemove,0);return out};
    window.render._safetyLabelFixPatched=true;
  }
  function init(){ensureStyle();patchRender();renameAndRemove();setTimeout(renameAndRemove,100);setTimeout(renameAndRemove,500);setInterval(renameAndRemove,1000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
