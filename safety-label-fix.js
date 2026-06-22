(function(){
  function $(id){return document.getElementById(id)}
  function labelOf(id){const el=$(id);return el&&el.closest('div')&&el.closest('div').querySelector('span')}
  function removeCard(id){const el=$(id);const card=el&&el.closest('div');if(card)card.remove()}
  function renameAndRemove(){
    const s=labelOf('rSafety');
    if(s)s.textContent='安全率（曲げ応力 短期）';
    removeCard('rBendRatioShort');
    const l=labelOf('rBendRatioLong');
    if(l)l.textContent='曲げ応力 長期';
    const u=$('rBendRatioLong')&&$('rBendRatioLong').parentElement&&$('rBendRatioLong').parentElement.querySelector('small');
    if(u)u.textContent='(降伏/1.5)/σ';
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
    window.render=function(){const out=original.apply(this,arguments);renameAndRemove();return out};
    window.render._safetyLabelFixPatched=true;
  }
  function init(){patchRender();renameAndRemove();setTimeout(renameAndRemove,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
