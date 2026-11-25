const $ = id => document.getElementById(id);
const room=$("room"), demo=$("demo"), board=$("board"), track=$("tracks"), viewer=$("viewer"), dialog=$("detail");
const reduced=matchMedia("(prefers-reduced-motion: reduce)");
const cells=[[1,1],[1,2],[1,3],[2,3],[3,3],[3,2],[3,1],[2,1]];
const ns="http://www.w3.org/2000/svg";
const number=n=>String(n+1).padStart(2,"0");
let active=0,slide=0,hover=false,opened=false,stageTime=0,slideTime=0,grace,trigger;
let lastTime=0,raf,transition;
const frames=i=>stages[i].imgs.map((_,index)=>index);
const arrivalStep=80;
viewer.style.setProperty("--arrival",stages.length*arrivalStep+"ms");
const nodes=stages.map((s,i)=>{
 const n=document.createElement("button");n.className="node";n.style.gridArea=cells[i].join(" / ");
 n.style.setProperty("--arrival",i*arrivalStep+"ms");
 n.style.setProperty("--note-name","history-note-"+i);
 n.innerHTML='<img alt=""><span class="num"></span><b></b><span class="date"></span><small></small>';
 if(s.thumbCaption){n.firstChild.alt=s.thumbCaption;n.firstChild.title=s.thumbCaption}
 n.firstChild.src=s.thumb;n.querySelector(".num").textContent=number(i);n.querySelector(".date").textContent=s.date;n.querySelector("b").textContent=s.title;n.querySelector("small").textContent=s.summary;
 n.onpointerenter=e=>{if(e.pointerType!=="touch"){hold();select(i)}};
 n.onpointerleave=leave;
 n.onclick=()=>select(i);
 $("nodes").append(n);return n;
});
function hold(){clearTimeout(grace);hover=true}
function leave(){clearTimeout(grace);grace=setTimeout(()=>hover=false,500)}
viewer.onpointerenter=e=>{if(e.pointerType!=="touch")hold()};viewer.onpointerleave=leave;
function status(){
 $("chapter").textContent=number(active)+" / 08　"+stages[active].date;
}
function select(i){if(i===active)return;const old=active;if(segments[old])segments[old].fill.style.strokeDashoffset=1;active=i;slide=0;stageTime=0;slideTime=0;paint(old)}
function sourceView(img){
 dialog.classList.toggle("lightbox",Boolean(img));
 dialog.setAttribute("aria-label",img?img[1]:stages[active].source);
 if(img){const image=new Image();image.src=reduced.matches&&img[3]?img[3]:img[0];image.alt=img[1];$("detailbody").replaceChildren(image)}
 else{const h=document.createElement("h3"),p=document.createElement("pre");h.textContent=stages[active].source;p.textContent=stages[active].excerpt;$("detailbody").replaceChildren(h,p)}
 dialog.showModal()
}
$("close").onclick=()=>dialog.close();dialog.onclick=e=>{if(e.target===dialog)dialog.close()};
$("source").onclick=()=>sourceView();
function renderFrame(type,dir=1){
 const stage=stages[active],list=frames(active),id=list[slide];
 const holder=$("frame");const outgoing=holder.lastElementChild;
 if(transition)transition.cancel();
 Array.from(holder.children).filter(e=>e!==outgoing).forEach(e=>e.remove());
 const incoming=document.createElement("div");incoming.className="layer";
 const [src,alt]=stage.imgs[id],btn=document.createElement("button"),im=new Image();
 im.src=reduced.matches&&stage.imgs[id][3]?stage.imgs[id][3]:src;im.alt=alt;btn.setAttribute("aria-label","放大："+alt);btn.append(im);
 btn.onclick=()=>sourceView(stage.imgs[id]);incoming.append(btn);holder.append(incoming);
 $("caption").textContent=(slide+1)+" / "+list.length+"　"+alt;
 if(!outgoing||reduced.matches){outgoing?.remove();return}
 outgoing.inert=true;
 const options={duration:type==="stage"?450:340,easing:"cubic-bezier(.22,.75,.2,1)"};
 if(type==="stage"){
  // The old surface recedes while a new viewport opens from the route direction.
  const start=dir>0?"inset(0 100% 0 0)":"inset(0 0 0 100%)";
  outgoing.animate([{transform:"none"},{transform:"scale(.94)"}],options);
  transition=incoming.animate([{clipPath:start,transform:"translateX("+dir*16+"px)"},{clipPath:"inset(0)",transform:"none"}],options);
 }else{
  outgoing.animate([{transform:"none"},{transform:"translateY("+(-dir*25)+"%)"}],options);
  transition=incoming.animate([{transform:"translateY("+dir*100+"%)"},{transform:"none"}],options);
 }
 transition.onfinish=()=>outgoing.remove()
}
function paint(old=active){
 nodes[active].classList.toggle("swung");
 nodes.forEach((n,i)=>n.setAttribute("aria-current",String(i===active)));
 $("heading").textContent=stages[active].title;$("story").textContent=stages[active].story;$("source").textContent=stages[active].source;
 viewer.querySelector(".albumfoot > div").hidden=stages[active].imgs.length===1;
 status();renderFrame("stage",active>=old?1:-1);

 if(!reduced.matches)viewer.querySelector(".prose").animate([{clipPath:"inset(0 0 90% 0)",transform:"translateY(6px)"},{clipPath:"inset(0)",transform:"none"}],{duration:350,easing:"ease-out"});
 if(innerWidth<=900&&opened){const strip=$("nodes");strip.scrollTo({left:nodes[active].offsetLeft-strip.clientWidth/2+nodes[active].offsetWidth/2,behavior:reduced.matches?"instant":"smooth"})}
 charge();
}
function step(d){slide=(slide+d+frames(active).length)%frames(active).length;slideTime=0;renderFrame("slide",d)}
$("prev").onclick=()=>step(-1);$("next").onclick=()=>step(1);
const segments=nodes.slice(0,7).map((_,i)=>{
 const rail=document.createElementNS(ns,"path"),fill=rail.cloneNode();
 rail.setAttribute("stroke-dasharray","4 5");
 rail.setAttribute("marker-end","url(#route-tip)");
 fill.setAttribute("pathLength","1");
 fill.setAttribute("stroke-dasharray","1");
 fill.style.strokeDashoffset=1;
 for(const path of [rail,fill])path.style.setProperty("--arrival",(i+1)*arrivalStep+"ms");
 track.append(rail,fill);return {rail,fill};
});
function layout(){
 if(innerWidth<=900)return;
 const first=nodes[0].getBoundingClientRect(),last=nodes[7].getBoundingClientRect();
 const tabY=(first.bottom+last.top)/2-room.getBoundingClientRect().top+room.scrollTop;
 room.style.setProperty("--tab-y",tabY+"px");
 sessionStorage.setItem("historyTabRatio",String(tabY/innerHeight));
 const gap=10;
 segments.forEach(({rail,fill},i)=>{
  const a=nodes[i],b=nodes[i+1];
  const horizontal=cells[i][0]===cells[i+1][0];
  const forward=horizontal?b.offsetLeft>a.offsetLeft:b.offsetTop>a.offsetTop;
  let d;
  if(horizontal){
   const y=a.offsetTop+a.offsetHeight/2;
   const start=forward?a.offsetLeft+a.offsetWidth+gap:a.offsetLeft-gap;
   const end=forward?b.offsetLeft-gap:b.offsetLeft+b.offsetWidth+gap;
   d='M '+start+' '+y+' H '+end;
  }else{
   const x=a.offsetLeft+a.offsetWidth/2;
   const start=forward?a.offsetTop+a.offsetHeight+gap:a.offsetTop-gap;
   const end=forward?b.offsetTop-gap:b.offsetTop+b.offsetHeight+gap;
   d='M '+x+' '+start+' V '+end;
  }
  rail.setAttribute("d",d);fill.setAttribute("d",d);
 });
}
function charge(){
 const ratio=Math.min(1,stageTime/12000);
 if(segments[active])segments[active].fill.style.strokeDashoffset=1-ratio;
 nodes[active].style.setProperty("--charge",(ratio*100)+"%");
}
function tick(now){
 const dt=Math.min(120,now-lastTime);lastTime=now;
 if(opened&&!document.hidden&&!dialog.open&&!reduced.matches){
  slideTime+=dt;if(frames(active).length>1 && slideTime>=Math.max(5500,(stages[active].imgs[slide][2]||0)+500))step(1);
  if(!hover && active<nodes.length-1){
   stageTime+=dt;
   if(stageTime>=12000)select(active+1);
   charge();
  }
 }
 if(opened)raf=requestAnimationFrame(tick)
}
function startBoard(){
 if(opened)return;
 opened=true;layout();lastTime=performance.now();raf=requestAnimationFrame(tick)
}
function closeRoom(){
 if(!opened)return;
 room.classList.add("returning");
 opened=false;cancelAnimationFrame(raf);sessionStorage.setItem("historyReturned",String(Date.now()));
 // Finish dispatching the wheel event before navigating to the separate Demo document.
 setTimeout(()=>location.replace("../index.html#flagship"),0)
}
$("back").onclick=closeRoom;
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&opened&&!dialog.open)closeRoom()});
window.addEventListener("pageshow",startBoard);
window.addEventListener("pagehide",()=>{opened=false;cancelAnimationFrame(raf)});
let wheelSum=0,lastWheel=0;
room.addEventListener("wheel",e=>{
 if(!opened||dialog.open||e.ctrlKey||Math.abs(e.deltaY)<=Math.abs(e.deltaX))return;
 e.preventDefault();
 const now=performance.now();if(now-lastWheel>190)wheelSum=0;lastWheel=now;
 wheelSum+=e.deltaY*(e.deltaMode===1?16:e.deltaMode===2?innerHeight:1);
 if(Math.abs(wheelSum)>=38){wheelSum=0;closeRoom()}
},{passive:false});
let touch;
room.addEventListener("touchstart",e=>{touch=e.target.closest("nav,dialog,button")?null:e.touches[0]}, {passive:true});
room.addEventListener("touchend",e=>{if(touch){const p=e.changedTouches[0];if(p.clientX-touch.clientX>85&&Math.abs(p.clientY-touch.clientY)<40)closeRoom()}touch=null},{passive:true});
let resizeFrame;
new ResizeObserver(()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(layout)}).observe(board);paint();

