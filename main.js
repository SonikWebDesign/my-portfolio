const cvs=document.getElementById('c');
const renderer=new THREE.WebGLRenderer({canvas:cvs,antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.setClearColor(0xedf2f8,1);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(60,window.innerWidth/window.innerHeight,.1,2000);
window.addEventListener('resize',()=>{camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();renderer.setSize(window.innerWidth,window.innerHeight);});

function mkG(n,rad,arms,c1,c2,sp,ys){
  const g=new THREE.BufferGeometry(),p=new Float32Array(n*3),c=new Float32Array(n*3);
  const C1=new THREE.Color(c1),C2=new THREE.Color(c2);
  for(let i=0;i<n;i++){
    const arm=Math.floor(Math.random()*arms),r=Math.pow(Math.random(),.52)*rad;
    const a=(arm/arms)*Math.PI*2+r*.013+(Math.random()-.5)*.55,s=sp*(1-r/rad)*.5+sp*.18;
    p[i*3]=Math.cos(a)*r+(Math.random()-.5)*s;p[i*3+1]=(Math.random()-.5)*rad*ys;p[i*3+2]=Math.sin(a)*r+(Math.random()-.5)*s;
    const mix=Math.random(),col=C1.clone().lerp(C2,mix);c[i*3]=col.r;c[i*3+1]=col.g;c[i*3+2]=col.b;
  }
  g.setAttribute('position',new THREE.BufferAttribute(p,3));g.setAttribute('color',new THREE.BufferAttribute(c,3));
  return new THREE.Points(g,new THREE.PointsMaterial({size:.5,vertexColors:true,transparent:true,opacity:.45,depthWrite:false,sizeAttenuation:true}));
}
const galaxy=mkG(22000,150,3,'#0088ff','#003399',16,.042);scene.add(galaxy);
const dust=mkG(6000,195,2,'#88bbff','#4477cc',30,.055);scene.add(dust);
const cg=new THREE.BufferGeometry(),cp=new Float32Array(2000*3);
for(let i=0;i<2000;i++){const r=Math.random()*18,a=Math.random()*Math.PI*2,b=Math.random()*Math.PI*2;cp[i*3]=Math.cos(a)*Math.cos(b)*r;cp[i*3+1]=Math.sin(b)*r*.28;cp[i*3+2]=Math.sin(a)*Math.cos(b)*r;}
cg.setAttribute('position',new THREE.BufferAttribute(cp,3));
const core=new THREE.Points(cg,new THREE.PointsMaterial({size:.9,color:0x4499ff,transparent:true,opacity:.6,depthWrite:false}));scene.add(core);
const sg=new THREE.BufferGeometry(),sp2=new Float32Array(3500*3);
for(let i=0;i<3500;i++){sp2[i*3]=(Math.random()-.5)*900;sp2[i*3+1]=(Math.random()-.5)*900;sp2[i*3+2]=(Math.random()-.5)*900;}
sg.setAttribute('position',new THREE.BufferAttribute(sp2,3));
scene.add(new THREE.Points(sg,new THREE.PointsMaterial({size:.18,color:0x3366bb,transparent:true,opacity:.18})));
const shardGroup=new THREE.Group();
for(let i=0;i<16;i++){
  const geo=new THREE.OctahedronGeometry(Math.random()*2+.5,0);
  const mat=new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(.6+Math.random()*.05,.7,.55+Math.random()*.2),wireframe:true,transparent:true,opacity:.12+Math.random()*.18});
  const mesh=new THREE.Mesh(geo,mat);
  const r=60+Math.random()*100,a=Math.random()*Math.PI*2;
  mesh.position.set(Math.cos(a)*r,(Math.random()-.5)*40,Math.sin(a)*r);
  mesh.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
  mesh.userData={rx:(.002+Math.random()*.004)*(Math.random()>.5?1:-1),ry:(.002+Math.random()*.004)*(Math.random()>.5?1:-1),fo:Math.random()*Math.PI*2,fs:.008+Math.random()*.006};
  shardGroup.add(mesh);
}
scene.add(shardGroup);

const CAMS=[{p:[0,34,125],rx:.18,ry:0},{p:[85,14,60],rx:.12,ry:.38},{p:[-40,25,110],rx:.15,ry:-.22},{p:[-55,-18,78],rx:.22,ry:-.28},{p:[30,20,95],rx:.14,ry:.25},{p:[0,-55,88],rx:.52,ry:.1},{p:[0,8,48],rx:.08,ry:0}];
const TOTAL=7;
let cur_sec=0,anim_sec=0,mouse={x:0,y:0},transitioning=false,t2=0;
const panels=document.querySelectorAll('.panel');
const dots=document.querySelectorAll('.d-dot');
const hintDots=document.querySelectorAll('.hint-dot');

function showPanel(idx){
  panels.forEach((p,i)=>{p.classList.remove('active','exit-up','exit-down');if(i!==idx)p.classList.add(i<idx?'exit-up':'exit-down');});
  panels[idx].classList.add('active');
  dots.forEach((d,i)=>d.classList.toggle('on',i===idx));
  hintDots.forEach((d,i)=>d.classList.toggle('on',i===idx));
  if(idx===3)startCounters();
}
function goTo(idx){if(idx===cur_sec||transitioning)return;transitioning=true;cur_sec=idx;showPanel(idx);setTimeout(()=>{transitioning=false;},600);}
function goNext(){if(cur_sec<TOTAL-1)goTo(cur_sec+1);}
function goPrev(){if(cur_sec>0)goTo(cur_sec-1);}
document.addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowRight')goNext();if(e.key==='ArrowUp'||e.key==='ArrowLeft')goPrev();});
let wLock=false;
window.addEventListener('wheel',e=>{if(e.target.closest('.port-slider,.port-cats,#p-portfolio,#p-services,#p-process,#p-contact'))return;if(wLock)return;wLock=true;e.deltaY>0?goNext():goPrev();setTimeout(()=>wLock=false,700);},{passive:true});
let tY=0,tX=0;
window.addEventListener('touchstart',e=>{tY=e.touches[0].clientY;tX=e.touches[0].clientX;},{passive:true});
window.addEventListener('touchend',e=>{if(e.target.closest('.port-slider'))return;const dy=tY-e.changedTouches[0].clientY,dx=tX-e.changedTouches[0].clientX;if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>38){dy>0?goNext():goPrev();}},{passive:true});
document.addEventListener('mousemove',e=>{mouse.x=(e.clientX/window.innerWidth-.5)*2;mouse.y=(e.clientY/window.innerHeight-.5)*2;});

function lerp(a,b,t){return a+(b-a)*t;}
const tv=new THREE.Vector3();
function animate(){
  requestAnimationFrame(animate);t2+=.001;
  anim_sec+=(cur_sec-anim_sec)*.055;
  const si=Math.floor(anim_sec),sj=Math.min(si+1,TOTAL-1),tt=anim_sec-si;
  const A=CAMS[si],B=CAMS[sj];
  tv.set(lerp(A.p[0],B.p[0],tt)+mouse.x*3.5,lerp(A.p[1],B.p[1],tt)-mouse.y*2.5,lerp(A.p[2],B.p[2],tt));
  camera.position.lerp(tv,.07);camera.lookAt(0,0,0);
  galaxy.rotation.x+=(lerp(A.rx,B.rx,tt)-galaxy.rotation.x)*.05;
  galaxy.rotation.y+=(lerp(A.ry,B.ry,tt)-galaxy.rotation.y)*.05;
  galaxy.rotation.z+=.0007;
  dust.rotation.x=galaxy.rotation.x;dust.rotation.y=galaxy.rotation.y;dust.rotation.z=galaxy.rotation.z;
  core.rotation.y=galaxy.rotation.y;
  shardGroup.children.forEach(m=>{m.rotation.x+=m.userData.rx;m.rotation.y+=m.userData.ry;m.position.y+=Math.sin(t2*m.userData.fs*100+m.userData.fo)*.04;});
  shardGroup.rotation.y+=.0003;
  renderer.render(scene,camera);
}
animate();

let cStarted=false;
function startCounters(){
  if(cStarted)return;cStarted=true;
  function cnt(id,to,dur){const el=document.getElementById(id);let s=null;(function step(ts){if(!s)s=ts;const p=Math.min((ts-s)/dur,1);el.textContent=Math.floor(p*to)+(p===1&&to>=10?'+':'');if(p<1)requestAnimationFrame(step);})(performance.now());}
  cnt('s1',120,1800);cnt('s2',85,1800);cnt('s3',5,1200);cnt('s4',20,1500);
}

const curEl=document.getElementById('cur'),ringEl=document.getElementById('cur-ring');
let cx=0,cy=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{cx=e.clientX;cy=e.clientY;curEl.style.left=cx+'px';curEl.style.top=cy+'px';});
(function ar(){rx+=(cx-rx)*.18;ry+=(cy-ry)*.18;ringEl.style.left=rx+'px';ringEl.style.top=ry+'px';requestAnimationFrame(ar);})();
document.querySelectorAll('a,button,.s-card,.d-dot').forEach(el=>{el.addEventListener('mouseenter',()=>ringEl.classList.add('big'));el.addEventListener('mouseleave',()=>ringEl.classList.remove('big'));});

let lang='en';
function setLang(l){lang=l;document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on',b.textContent===l.toUpperCase()));document.querySelectorAll('[data-en]').forEach(el=>{const v=el.getAttribute('data-'+l)||el.getAttribute('data-en');el.innerHTML=v;});document.querySelectorAll('[data-en-ph]').forEach(el=>{el.placeholder=el.getAttribute('data-'+l+'-ph')||el.getAttribute('data-en-ph');});}

function sendMsg(btn){const orig=btn.textContent;btn.textContent=lang==='bg'?'ИЗПРАТЕНО ✓':'SENT ✓';setTimeout(()=>btn.textContent=orig,3000);}

function psNav(btn,dir){const sl=btn.closest('.port-slider');const sls=sl.querySelectorAll('.port-slide');const dts=sl.querySelectorAll('.ps-dot');let idx=parseInt(sl.dataset.idx)||0;sls[idx].classList.remove('port-slide-active');dts[idx].classList.remove('ps-dot-on');idx=(idx+dir+sls.length)%sls.length;sls[idx].classList.add('port-slide-active');dts[idx].classList.add('ps-dot-on');sl.dataset.idx=idx;}
function psGoto(dot,idx){const sl=dot.closest('.port-slider');const sls=sl.querySelectorAll('.port-slide');const dts=sl.querySelectorAll('.ps-dot');const cur=parseInt(sl.dataset.idx)||0;sls[cur].classList.remove('port-slide-active');dts[cur].classList.remove('ps-dot-on');sls[idx].classList.add('port-slide-active');dts[idx].classList.add('ps-dot-on');sl.dataset.idx=idx;}
let ptX2=0,ptY2=0,ptSl=null;
document.addEventListener('touchstart',e=>{const sl=e.target.closest('.port-slider');if(sl){ptSl=sl;ptX2=e.touches[0].clientX;ptY2=e.touches[0].clientY;}else ptSl=null;},{passive:true});
document.addEventListener('touchend',e=>{if(!ptSl)return;const dx=ptX2-e.changedTouches[0].clientX,dy=ptY2-e.changedTouches[0].clientY;if(Math.abs(dx)>Math.abs(dy)&&Math.abs(dx)>30){const b=ptSl.querySelector(dx>0?'.ps-next':'.ps-prev');if(b)b.click();}},{passive:true});
