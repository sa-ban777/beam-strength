(function(){
  function $(id){return document.getElementById(id)}
  function ensureStyle(){
    if($('sectionAxisToggleStyle')) return;
    const style=document.createElement('style');
    style.id='sectionAxisToggleStyle';
    style.textContent=`
      .section-axis-btn{position:absolute;z-index:7;min-width:82px;height:28px;border:1px solid #cbd5e1;border-radius:8px;background:rgba(255,255,255,.94);color:#334155;font-size:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(15,23,42,.12)}
      .section-axis-btn:hover{background:#eff6ff;border-color:#93c5fd}
      .section-axis-btn.active{background:#2563eb;color:#fff;border-color:#2563eb}
      .section-axis-x{left:8px;top:28px;transform:none}
      .section-axis-y{left:8px;top:50%;transform:translateY(-50%)}
    `;
    document.head.appendChild(style);
  }
  function ensureUI(){
    ensureStyle();
    const canvas=$('sectionCanvas');
    const axis=$('axis');
    if(!canvas||!axis) return null;
    const pane=canvas.closest('.visual-pane')||canvas.parentElement;
    if(!pane) return null;
    if(getComputedStyle(pane).position==='static') pane.style.position='relative';
    let xBtn=$('sectionAxisX');
    let yBtn=$('sectionAxisY');
    if(!xBtn){
      xBtn=document.createElement('button');
      xBtn.id='sectionAxisX';
      xBtn.type='button';
      xBtn.className='section-axis-btn section-axis-x';
      xBtn.dataset.axis='X方向';
      xBtn.title='X方向荷重に切替';
      xBtn.textContent='↓ X方向';
      pane.appendChild(xBtn);
    }
    if(!yBtn){
      yBtn=document.createElement('button');
      yBtn.id='sectionAxisY';
      yBtn.type='button';
      yBtn.className='section-axis-btn section-axis-y';
      yBtn.dataset.axis='Y方向';
      yBtn.title='Y方向荷重に切替';
      yBtn.textContent='→ Y方向';
      pane.appendChild(yBtn);
    }
    [xBtn,yBtn].forEach(btn=>{
      if(btn.dataset.axisClickBound==='1') return;
      btn.dataset.axisClickBound='1';
      btn.addEventListener('click',()=>{
        const sel=$('axis');
        if(!sel) return;
        sel.value=btn.dataset.axis;
        sel.dispatchEvent(new Event('input',{bubbles:true}));
        sel.dispatchEvent(new Event('change',{bubbles:true}));
        syncUI();
        if(typeof render==='function') render();
      });
    });
    return {xBtn,yBtn};
  }
  function syncUI(){
    const ui=ensureUI();
    const axis=$('axis');
    if(!ui||!axis) return;
    [ui.xBtn,ui.yBtn].forEach(btn=>{
      btn.classList.toggle('active',btn.dataset.axis===axis.value);
    });
  }
  function patchRender(){
    if(typeof render!=='function'||render._sectionAxisTogglePatched) return;
    const original=render;
    window.render=function(){
      const result=original.apply(this,arguments);
      syncUI();
      return result;
    };
    window.render._sectionAxisTogglePatched=true;
  }
  function init(){
    ensureUI();
    patchRender();
    const axis=$('axis');
    if(axis){
      axis.addEventListener('input',syncUI);
      axis.addEventListener('change',syncUI);
    }
    syncUI();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();
