(function(){
  const WARN_CLASS='calc-reference-mode';
  function $(id){return document.getElementById(id)}
  function text(id){const el=$(id);return el?String(el.textContent||'').trim():'-'}
  function hasInputWarnings(){
    const warn=$('inputWarningPanel');
    return !!(warn&&warn.classList.contains('show')&&String(warn.textContent||'').trim());
  }
  function ensureStyle(){
    if($('resultSummaryGuardStyle'))return;
    const s=document.createElement('style');
    s.id='resultSummaryGuardStyle';
    s.textContent=`
      .quick-result-bar{position:sticky;top:0;z-index:19;display:grid;grid-template-columns:1.1fr repeat(4,1fr);gap:4px;margin:0 0 5px;padding:4px;background:#e8f0ff;border:1px solid #bfdbfe;border-radius:8px;box-shadow:0 2px 8px rgba(15,23,42,.10)}
      .quick-result-item{display:flex;align-items:center;justify-content:space-between;gap:5px;min-width:0;background:#fff;border:1px solid #dbeafe;border-radius:6px;padding:4px 6px;font-weight:900;line-height:1.05}
      .quick-result-item span{font-size:10.5px;color:#475569;white-space:nowrap}.quick-result-item strong{font-size:13px;color:#111827;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right}
      .quick-result-item.judge-ok{background:#dcfce7;border-color:#86efac}.quick-result-item.judge-ng{background:#fee2e2;border-color:#fca5a5}.quick-result-item.judge-ref{background:#fef3c7;border-color:#facc15}
      .result-reference-banner{display:none;margin:0 0 5px;padding:7px 9px;border:2px solid #f59e0b;border-radius:8px;background:#fffbeb;color:#92400e;font-size:13px;font-weight:900;line-height:1.3}
      .result-reference-banner.show{display:block}
      .result-card.${WARN_CLASS} .result-grid{opacity:.62}
      .result-card.${WARN_CLASS} .result-grid::before{content:'入力値に異常があるため、下記計算結果は参考値です';display:block;grid-column:1/-1;background:#fffbeb;border:2px solid #f59e0b;border-radius:8px;padding:8px 10px;color:#92400e;font-size:14px;font-weight:900;line-height:1.3;opacity:1}
      @media(max-width:1600px){.quick-result-bar{grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;margin-bottom:2px;padding:2px;border-radius:5px}.quick-result-item{padding:2px 4px;border-radius:4px}.quick-result-item span{font-size:9.5px}.quick-result-item strong{font-size:11.5px}.result-reference-banner{font-size:10.5px;margin-bottom:2px;padding:4px 5px;border-radius:5px}.result-card.${WARN_CLASS} .result-grid::before{font-size:10.5px;padding:5px}}
      @media(max-width:640px){.quick-result-bar{grid-template-columns:repeat(2,minmax(0,1fr))}.quick-result-item:first-child{grid-column:1/-1}.quick-result-item strong{font-size:12px}}
    `;
    document.head.appendChild(s);
  }
  function ensureUI(){
    ensureStyle();
    const resultCard=document.querySelector('.result-card');
    if(!resultCard)return;
    let bar=$('quickResultBar');
    if(!bar){
      bar=document.createElement('div');
      bar.id='quickResultBar';
      bar.className='quick-result-bar';
      bar.innerHTML=`
        <div class="quick-result-item" id="quickJudgeItem"><span>総合判定</span><strong id="quickJudge">-</strong></div>
        <div class="quick-result-item"><span>安全率</span><strong id="quickSafety">-</strong></div>
        <div class="quick-result-item"><span>最大たわみ</span><strong id="quickDefTotal">-</strong></div>
        <div class="quick-result-item"><span>最大応力</span><strong id="quickStress">-</strong></div>
        <div class="quick-result-item"><span>許容たわみ</span><strong id="quickDefAllow">-</strong></div>
      `;
      document.querySelector('.page')?.insertBefore(bar,document.querySelector('.page').firstChild);
    }
    let banner=$('resultReferenceBanner');
    if(!banner){
      banner=document.createElement('div');
      banner.id='resultReferenceBanner';
      banner.className='result-reference-banner';
      const title=resultCard.querySelector('.section-title');
      if(title) title.insertAdjacentElement('afterend',banner);
    }
  }
  function setItemState(item,judge,ref){
    if(!item)return;
    item.classList.remove('judge-ok','judge-ng','judge-ref');
    if(ref)item.classList.add('judge-ref');
    else if(String(judge).includes('OK'))item.classList.add('judge-ok');
    else if(String(judge).includes('NG'))item.classList.add('judge-ng');
  }
  function update(){
    ensureUI();
    const ref=hasInputWarnings();
    const resultCard=document.querySelector('.result-card');
    if(resultCard)resultCard.classList.toggle(WARN_CLASS,ref);
    const banner=$('resultReferenceBanner');
    if(banner){
      banner.classList.toggle('show',ref);
      banner.textContent=ref?'入力値に異常があります。計算結果は参考値として扱い、入力値を修正してください。':'';
    }
    const overall=text('overallBadge');
    const quickJudge=$('quickJudge');
    if(quickJudge)quickJudge.textContent=ref?'参考値':overall;
    const qs=$('quickSafety');if(qs)qs.textContent=text('rSafety');
    const qd=$('quickDefTotal');if(qd)qd.textContent=text('rDefTotal')+' mm';
    const qst=$('quickStress');if(qst)qst.textContent=text('rStress')+' N/mm²';
    const qa=$('quickDefAllow');if(qa)qa.textContent=text('rDefAllow')+' mm';
    setItemState($('quickJudgeItem'),overall,ref);
  }
  function patchRender(){
    if(typeof render!=='function'||render._resultSummaryGuardPatched)return;
    const original=render;
    window.render=function(){
      const result=original.apply(this,arguments);
      setTimeout(update,0);
      return result;
    };
    window.render._resultSummaryGuardPatched=true;
  }
  function bind(){
    ['input','change'].forEach(ev=>document.addEventListener(ev,()=>setTimeout(update,0),true));
  }
  function init(){ensureUI();patchRender();bind();setTimeout(update,0)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
