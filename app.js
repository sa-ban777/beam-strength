const DATA=window.BEAM_XLSM_DATA;
const MATERIALS=DATA.materials,CASES=DATA.loadCases,SHAPES=DATA.shapes,DEFAULTS=DATA.defaults;
const $=id=>document.getElementById(id);
const num=(v,f=0)=>{const x=Number(v);return Number.isFinite(x)?x:f};
const div=(a,b)=>b?a/b:NaN;
const isY=a=>String(a||'').startsWith('Y');
function fmt(v,d=3){if(!Number.isFinite(v))return'-';const a=Math.abs(v);if(a&&a>=1e7)return v.toExponential(3);return v.toLocaleString('ja-JP',{maximumFractionDigits:d})}
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mat(n){return MATERIALS.find(m=>m.name===n)||MATERIALS[0]}
function shp(){return SHAPES.find(s=>s.name===$('shapePreset').value)||SHAPES[0]}
function manual(){const s=shp();return !s||s.name==='手入力'}
function putMaterial(n){const m=mat(n);$('youngModulus').value=m.E;$('densityInput').value=m.density;$('yieldStressInput').value=m.yieldStress}
function populate(){
 $('shapePreset').innerHTML=SHAPES.map(s=>'<option value="'+esc(s.name)+'">'+esc(s.name)+'</option>').join('');
 $('material').innerHTML=MATERIALS.map(m=>'<option value="'+esc(m.name)+'">'+esc(m.name)+'</option>').join('');
 $('loadCase').innerHTML=CASES.map(c=>'<option value="'+esc(c.name)+'">'+esc(c.name)+'</option>').join('')
}
function applyPreset(changeMaterial=true){
 const m=manual(),s=shp();
 $('sectionType').disabled=!m;['B','H','t1','t2','diameterD'].forEach(id=>$(id).disabled=!m);
 $('material').disabled=false;['youngModulus','densityInput','yieldStressInput'].forEach(id=>$(id).disabled=false);
 if(!m&&s){$('sectionType').value=s.sectionType||'長方形';$('B').value=s.B??'';$('H').value=s.H??'';$('t1').value=s.t1??'';$('t2').value=s.t2??'';$('diameterD').value='';if(changeMaterial){$('material').value=s.material||$('material').value;putMaterial($('material').value)}}
}
function init(){
 const v={shapePreset:DEFAULTS.shapePreset,material:DEFAULTS.material,loadCase:DEFAULTS.loadCase,sectionType:DEFAULTS.sectionType,axis:DEFAULTS.axis,deflectionRatio:DEFAULTS.deflectionRatio,spanL:DEFAULTS.spanL,pointLoadP:DEFAULTS.pointLoadP,uniformLoadW:DEFAULTS.uniformLoadW,diameterD:DEFAULTS.diameterD,B:DEFAULTS.B,H:DEFAULTS.H,t1:DEFAULTS.t1,t2:DEFAULTS.t2,gravity:DEFAULTS.gravity};
 Object.entries(v).forEach(([k,val])=>{if($(k))$(k).value=val});putMaterial(v.material);applyPreset(true)
}
function inputs(){
 const s=shp(),m=manual();
 return{manual:m,shape:s,sectionType:m?$('sectionType').value:s.sectionType,materialName:$('material').value,E:num($('youngModulus').value,205000),density:num($('densityInput').value,7850),yieldStress:num($('yieldStressInput').value,235),axis:$('axis').value,L:num($('spanL').value),P:num($('pointLoadP').value),w:num($('uniformLoadW').value),n:num($('deflectionRatio').value,300),D:num($('diameterD').value),B:num($('B').value),H:num($('H').value),t1:num($('t1').value),t2:num($('t2').value),g:num($('gravity').value,9.80665),loadCase:$('loadCase').value}
}
function sectionManual(i){
 const D=i.D,B=i.B,H=i.H,t1=i.t1,t2=i.t2,y=isY(i.axis);let A=NaN,c=NaN,I=NaN,Z=NaN;
 if(i.sectionType==='丸棒'){A=Math.PI*D**2/4;c=D/2;I=Math.PI*D**4/64;Z=div(I,D/2)}
 else if(i.sectionType==='長方形'){A=B*H;c=y?B/2:H/2;I=y?H*B**3/12:B*H**3/12;Z=y?div(I,B/2):div(I,H/2)}
 else if(i.sectionType==='L字'){A=t2*H+B*t1-t2*t1;c=y?div(t2*H*(t2/2)+B*t1*(B/2)-t2*t1*(t2/2),A):div(t2*H*(H/2)+B*t1*(t1/2)-t2*t1*(t1/2),A);I=y?(H*t2**3/12+t2*H*(t2/2-c)**2+t1*B**3/12+B*t1*(B/2-c)**2-t1*t2**3/12-t2*t1*(t2/2-c)**2):(t2*H**3/12+t2*H*(H/2-c)**2+B*t1**3/12+B*t1*(t1/2-c)**2-t2*t1**3/12-t2*t1*(t1/2-c)**2);Z=y?div(I,Math.max(c,B-c)):div(I,Math.max(c,H-c))}
 else if(i.sectionType==='コの字'){A=B*t1+2*t2*(H-t1);const q=B*t1*(H-t1/2)+2*t2*(H-t1)*((H-t1)/2);c=y?B/2:div(q,A);I=y?(t1*B**3/12+2*((H-t1)*t2**3/12+t2*(H-t1)*(B/2-t2/2)**2)):(B*t1**3/12+B*t1*(H-t1/2-c)**2+2*(t2*(H-t1)**3/12+t2*(H-t1)*(((H-t1)/2)-c)**2));Z=y?div(I,B/2):div(I,Math.max(c,H-c))}
 else if(i.sectionType==='コの字2'){A=t2*H+2*(B-t2)*t1;const q=t2*H*(t2/2)+2*(B-t2)*t1*(t2+(B-t2)/2);c=y?div(q,A):H/2;I=y?(H*t2**3/12+t2*H*(c-t2/2)**2+2*(t1*(B-t2)**3/12+(B-t2)*t1*(c-(t2+(B-t2)/2))**2)):(t2*H**3/12+2*((B-t2)*t1**3/12+(B-t2)*t1*((H-t1)/2)**2));Z=y?div(I,Math.max(c,B-c)):div(I,H/2)}
 else{A=2*B*t1+t2*(H-2*t1);c=y?B/2:H/2;I=y?2*(t1*B**3/12)+(H-2*t1)*t2**3/12:2*(B*t1**3/12+B*t1*((H-t1)/2)**2)+t2*(H-2*t1)**3/12;Z=y?div(I,B/2):div(I,H/2)}
 return{A,c,I,Z}
}
function section(i){if(i.manual)return sectionManual(i);const s=i.shape,y=isY(i.axis),m=sectionManual(i);return{A:(s.areaCm2||0)*100,I:(y?s.IyCm4:s.IxCm4)*10000,Z:(y?s.ZyCm3:s.ZxCm3)*1000,c:m.c}}
function valid(i){if(i.L<=0||i.E<=0||i.density<=0||i.yieldStress<=0)return'NG';return'OK'}
function calc(){const i=inputs(),sec=section(i),E=i.E,d=i.density,Fy=i.yieldStress,L=i.L,P=i.P,w=i.w,I=sec.I,selfW=sec.A*d*i.g/1e9,totalW=w+selfW;let M=NaN,dl=NaN,ds=NaN;
 if(i.loadCase==='両端支持・中央集中荷重'){M=P*L/4+selfW*L**2/8;dl=div(P*L**3,48*E*I);ds=div(5*selfW*L**4,384*E*I)}
 else if(i.loadCase==='両端支持・等分布荷重'){M=totalW*L**2/8;dl=div(5*w*L**4,384*E*I);ds=div(5*selfW*L**4,384*E*I)}
 else if(i.loadCase==='片持ち・先端集中荷重'){M=P*L+selfW*L**2/2;dl=div(P*L**3,3*E*I);ds=div(selfW*L**4,8*E*I)}
 else if(i.loadCase==='片持ち・等分布荷重'){M=totalW*L**2/2;dl=div(w*L**4,8*E*I);ds=div(selfW*L**4,8*E*I)}
 else if(i.loadCase==='両端固定・中央集中荷重'){M=P*L/8+selfW*L**2/12;dl=div(P*L**3,192*E*I);ds=div(selfW*L**4,384*E*I)}
 else{M=totalW*L**2/12;dl=div(w*L**4,384*E*I);ds=div(selfW*L**4,384*E*I)}
 const stress=div(M,sec.Z),safety=div(Fy,stress),dt=dl+ds,da=div(L,i.n),mass=sec.A*L*d/1e9,usedLoad=i.loadCase.includes('等分布')?w:P,usedUnit=i.loadCase.includes('等分布')?'N/mm':'N',stressJudge=safety>=1?'OK':'NG',deflectionJudge=dt<=da?'OK':'NG',sectionCheck=valid(i),overall=sectionCheck==='OK'&&stressJudge==='OK'&&deflectionJudge==='OK'?'OK':'NG';return{i,sec,E,density:d,Fy,selfW,totalW,M,stress,safety,dLoad:dl,dSelf:ds,dTotal:dt,dAllow:da,mass,usedLoad,usedUnit,stressJudge,deflectionJudge,sectionCheck,overall}}
function badge(el,text,cls){el.className=el.classList.contains('big-badge')?'big-badge':'badge';el.textContent=text;if(cls)el.classList.add(cls)}
function render(){const r=calc();badge($('shapeCheckBadge'),'断面判定：'+r.sectionCheck,r.sectionCheck==='OK'?'ok':'ng');badge($('overallBadge'),r.overall,r.overall==='OK'?'ok':'ng');[['rE',r.E,0],['rDensity',r.density,0],['rYield',r.Fy,3],['rArea',r.sec.A,3],['rCentroid',r.sec.c,3],['rI',r.sec.I,3],['rZ',r.sec.Z,3],['rUsedLoad',r.usedLoad,6],['rSelfW',r.selfW,9],['rTotalW',r.totalW,9],['rM',r.M,3],['rStress',r.stress,3],['rSafety',r.safety,3],['rDefLoad',r.dLoad,6],['rDefSelf',r.dSelf,6],['rDefTotal',r.dTotal,6],['rDefAllow',r.dAllow,3],['rMass',r.mass,6]].forEach(a=>$(a[0]).textContent=fmt(a[1],a[2]));$('rUsedLoadUnit').textContent=r.usedUnit;badge($('stressJudge'),'応力判定：'+r.stressJudge,r.stressJudge==='OK'?'ok':'ng');badge($('deflectionJudge'),'たわみ判定：'+r.deflectionJudge,r.deflectionJudge==='OK'?'ok':'ng');$('formulaMemo').textContent='支持・荷重ケース：'+r.i.loadCase+'\n断面：'+(r.i.manual?'手入力':r.i.shape.name)+' / '+r.i.sectionType+' / '+r.i.axis+'\n材料：'+r.i.materialName+' / E='+fmt(r.E,0)+' / 密度='+fmt(r.density,0)+' / 降伏='+fmt(r.Fy,3)+'\n\nw_self = A × 密度 × g / 1,000,000,000 = '+fmt(r.selfW,9)+' N/mm\nw_total = '+fmt(r.totalW,9)+' N/mm\nMmax = '+fmt(r.M,6)+' N･mm\nσ = Mmax / Z = '+fmt(r.stress,6)+' N/mm²\n安全率 = '+fmt(r.safety,6)+'\nδ_load = '+fmt(r.dLoad,9)+' mm\nδ_self = '+fmt(r.dSelf,9)+' mm\nδ_total = '+fmt(r.dTotal,9)+' mm\n許容たわみ = '+fmt(r.dAllow,6)+' mm';drawSection(r.i,r.sec);drawMoment(r)}
function canvasSize(c){const ratio=window.devicePixelRatio||1,w=Math.max(1,Math.round(c.clientWidth||c.width)),h=Math.max(1,Math.round(c.clientHeight||c.height));if(c.width!==Math.round(w*ratio)||c.height!==Math.round(h*ratio)){c.width=Math.round(w*ratio);c.height=Math.round(h*ratio)}const ctx=c.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);return{ctx,w,h}}
function drawSection(i,sec){const s=canvasSize($('sectionCanvas')),ctx=s.ctx,W=s.w,Hc=s.h;ctx.clearRect(0,0,W,Hc);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,Hc);const dw=Math.max(i.B||i.D||1,1),dh=Math.max(i.H||i.D||1,1),sc=Math.min((W-80)/dw,(Hc-60)/dh)*.9,x0=(W-dw*sc)/2,y0=(Hc-dh*sc)/2,B=i.B*sc,H=i.H*sc,t1=i.t1*sc,t2=i.t2*sc,D=i.D*sc;ctx.strokeStyle='#0f172a';ctx.lineWidth=2;ctx.fillStyle='#dbeafe';function R(x,y,w,h){ctx.fillRect(x,y,w,h);ctx.strokeRect(x,y,w,h)}if(i.sectionType==='丸棒'){ctx.beginPath();ctx.arc(W/2,Hc/2,D/2,0,7);ctx.fill();ctx.stroke()}else if(i.sectionType==='L字'){R(x0,y0,t2,H);R(x0,y0+H-t1,B,t1)}else if(i.sectionType==='コの字'){R(x0,y0,B,t1);R(x0,y0+t1,t2,H-t1);R(x0+B-t2,y0+t1,t2,H-t1)}else if(i.sectionType==='コの字2'){R(x0,y0,t2,H);R(x0+t2,y0,B-t2,t1);R(x0+t2,y0+H-t1,B-t2,t1)}else if(i.sectionType==='長方形'){R(x0,y0,B,H)}else{R(x0,y0,B,t1);R(x0+(B-t2)/2,y0+t1,t2,H-2*t1);R(x0,y0+H-t1,B,t1)}ctx.save();ctx.setLineDash([6,5]);ctx.strokeStyle='#c62828';ctx.beginPath();const cy=y0+((i.H||i.D)-sec.c)*sc;ctx.moveTo(16,cy);ctx.lineTo(W-16,cy);ctx.stroke();ctx.restore();ctx.fillStyle='#334155';ctx.font='12px sans-serif';ctx.fillText('断面形状：'+i.sectionType,16,Hc-10)}
function arrow(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),h=7;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-h*Math.cos(a-Math.PI/6),y2-h*Math.sin(a-Math.PI/6));ctx.lineTo(x2-h*Math.cos(a+Math.PI/6),y2-h*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fill()}
function drawMoment(r){const s=canvasSize($('momentCanvas')),ctx=s.ctx,W=s.w,H=s.h;ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);const x0=55,x1=W-55,beamY=55,baseY=H*.48,amp=H*.32;ctx.strokeStyle='#111827';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(x0,beamY);ctx.lineTo(x1,beamY);ctx.stroke();ctx.strokeStyle=ctx.fillStyle='#2563eb';for(let k=0;k<=10;k++){const x=x0+(x1-x0)*k/10;arrow(ctx,x,25,x,beamY-5)}ctx.fillText('P='+fmt(r.i.P,1)+' N',W/2-25,20);ctx.strokeStyle='#c62828';ctx.fillStyle='rgba(198,40,40,.12)';ctx.beginPath();ctx.moveTo(x0,baseY);ctx.lineTo((x0+x1)/2,baseY+amp);ctx.lineTo(x1,baseY);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#111827';ctx.fillText('Mmax='+fmt(r.M,2)+' N･mm',x0,H-15)}
function saveCsv(){const r=calc();const rows=[['項目','値'],['材料',r.i.materialName],['E',r.E],['密度',r.density],['降伏',r.Fy],['Mmax',r.M],['応力',r.stress],['安全率',r.safety],['最大たわみ',r.dTotal],['判定',r.overall]];download('beam_strength_result.csv','\ufeff'+rows.map(a=>a.join(',')).join('\n'),'text/csv')}
function saveJson(){download('beam_strength_input.json',JSON.stringify(inputs(),null,2),'application/json')}
function download(name,content,type){const b=new Blob([content],{type}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u)}
function bind(){['shapePreset','loadCase','sectionType','axis','deflectionRatio','spanL','pointLoadP','uniformLoadW','gravity','diameterD','B','H','t1','t2','youngModulus','densityInput','yieldStressInput'].forEach(id=>{$(id).addEventListener('input',()=>{if(id==='shapePreset')applyPreset(true);render()});$(id).addEventListener('change',()=>{if(id==='shapePreset')applyPreset(true);render()})});$('material').addEventListener('change',()=>{putMaterial($('material').value);render()});$('printBtn').addEventListener('click',()=>window.print());$('csvBtn').addEventListener('click',saveCsv);$('jsonBtn').addEventListener('click',saveJson);$('resetBtn').addEventListener('click',()=>{init();render()});window.addEventListener('resize',render)}
populate();init();bind();render();
