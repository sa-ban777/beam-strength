(function(){
  function cases(){return[
    ['片持ち・先端集中荷重','両端支持・中央集中荷重','両端固定・中央集中荷重'],
    ['片持ち・等分布荷重','両端支持・等分布荷重','両端固定・等分布荷重']
  ];}
  function cellFromPoint(canvas, clientX, clientY){
    const rect=canvas.getBoundingClientRect();
    const x=clientX-rect.left;
    const y=clientY-rect.top;
    const W=rect.width;
    const H=rect.height;
    const ml=44, mt=34, mr=6, mb=6;
    const cw=(W-ml-mr)/3;
    const rh=(H-mt-mb)/2;
    const col=Math.floor((x-ml)/cw);
    const row=Math.floor((y-mt)/rh);
    if(col<0||col>2||row<0||row>1) return null;
    return {row,col,name:cases()[row][col]};
  }
  function selectSupportCase(name){
    const sel=document.getElementById('loadCase');
    if(!sel) return;
    const option=[...sel.options].find(o=>o.value===name||o.textContent===name);
    if(!option) return;
    sel.value=option.value;
    sel.dispatchEvent(new Event('input',{bubbles:true}));
    sel.dispatchEvent(new Event('change',{bubbles:true}));
    if(typeof render==='function') render();
  }
  function bind(){
    const canvas=document.getElementById('supportCaseCanvas');
    if(!canvas||canvas.dataset.supportClickEnabled==='1') return;
    canvas.dataset.supportClickEnabled='1';
    canvas.style.cursor='pointer';
    canvas.title='クリックで支持・荷重ケースを変更できます';
    canvas.addEventListener('click',function(e){
      const cell=cellFromPoint(canvas,e.clientX,e.clientY);
      if(cell) selectSupportCase(cell.name);
    });
    canvas.addEventListener('mousemove',function(e){
      canvas.style.cursor=cellFromPoint(canvas,e.clientX,e.clientY)?'pointer':'default';
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind);
  else bind();
})();
