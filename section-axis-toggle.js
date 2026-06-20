(function(){
  function $(id){return document.getElementById(id)}
  function ensureStyle(){
    if($('sectionAxisToggleStyle')) return;
    const style=document.createElement('style');
    style.id='sectionAxisToggleStyle';
    style.textContent=`
      .section-axis-toggle{position:absolute;left:8px;top:28px;z-index:7;display:flex;gap:6px;padding:6px;border:1px solid #cbd5e1;border-radius:10px;background:rgba(255,255,255,.94);box-shadow:0 2px 8px rgba(15,23,42,.12)}
      .section-axis-toggle button{min-width:76px;height:28px;border:1px solid #cbd5e1;border-radius:8px;background:#fff;color:#334155;font-size:12px;font-weight:800;cursor:pointer}
      .section-axis-toggle button:hover{background:#eff6ff;border-color:#93c5fd}
      .section-axis-toggle button.active{background:#2563eb;color:#fff;border-color:#2563eb}
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
    let box=$('sectionAxisToggle');
    if(box) return box;
    box=document.createElement('div');
    box.id='sectionAxisToggle';
    box.className='section-axis-toggle';
    box.innerHTML='<button type="button" data-axis="X方向" title="X方向荷重に切替">↓ X方向</button><button type="button" data-axis="Y方向" title="Y方向荷重に切替">→ Y方向</button>';
    pane.appendChild(box);
    box.querySelectorAll('button[data-axis]').forEach(btn=>{
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
    return box;
  }
  function syncUI(){
    const box=ensureUI();
    const axis=$('axis');
    if(!box||!axis) return;
    box.querySelectorAll('button[data-axis]').forEach(btn=>{
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
