const boardURL=new URL("board.html",document.currentScript.src);
if(location.pathname.includes("/history-preview/")&&!location.hash)history.replaceState(null,"",location.pathname+location.search+"#flagship");
const returned=Number(sessionStorage.getItem("historyReturned"));
let quietUntil=returned+500;
window.addEventListener("wheel",event=>{
 if(Date.now()<quietUntil&&!event.ctrlKey){event.preventDefault();event.stopImmediatePropagation();quietUntil=Date.now()+220}
},{capture:true,passive:false});
document.addEventListener("DOMContentLoaded",()=>{
 const entry=document.querySelector(".history-trigger");
 const ratio=Number(sessionStorage.getItem("historyTabRatio"))||.37;
 entry.style.setProperty("--tab-y",(ratio*100)+"vh");
 let dialog,frame,closing=false;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 function close(){
  if(!dialog||closing)return;
  closing=true;
  function finish(){
   quietUntil=Date.now()+500;
   dialog.close();
   dialog.remove();
   dialog=null;frame=null;closing=false;
   entry.focus({preventScroll:true});
  }
  if(reduced.matches){finish();return}
  const from=getComputedStyle(dialog).transform;
  dialog.getAnimations().forEach(animation=>animation.cancel());
  const anim=dialog.animate([{transform:from},{transform:"translateX(100%)"}],
   {duration:480,easing:"cubic-bezier(.35,0,.2,1)",fill:"forwards"});
  anim.finished.then(finish,finish);
 }
 function open(){
  if(dialog)return;
  dialog=document.createElement("dialog");dialog.className="history-cover";dialog.setAttribute("aria-label","DEMO开发历程");
  frame=document.createElement("iframe");frame.title="开发历程";frame.src=boardURL.href;
  frame.addEventListener("load",()=>{
   dialog.showModal();
   if(!reduced.matches)dialog.animate([{transform:"translateX(100%)"},{transform:"translateX(0)"}],{duration:480,easing:"cubic-bezier(.35,0,.2,1)"});
   frame.focus({preventScroll:true});
  },{once:true});
  dialog.addEventListener("cancel",e=>{e.preventDefault();close()});
  dialog.append(frame);document.body.append(dialog);
 }
 window.addEventListener("message",e=>{
  if(frame&&e.source===frame.contentWindow&&e.origin===location.origin&&e.data==="history-board-return")close();
 });
 const direct=new URL(location.href);
 if(direct.searchParams.get("history")==="board"){
  direct.searchParams.delete("history");history.replaceState(null,"",direct);open();
 }
 entry.onclick=open;
 let start;const scene=document.querySelector("#flagship");
 scene.addEventListener("touchstart",e=>{start=e.target.closest("a,button,.album")?null:e.touches[0]},{passive:true});
 scene.addEventListener("touchend",e=>{if(start&&start.clientX-e.changedTouches[0].clientX>85&&Math.abs(e.changedTouches[0].clientY-start.clientY)<40)open();start=null},{passive:true});
});
window.addEventListener("pageshow",()=>{quietUntil=Number(sessionStorage.getItem("historyReturned"))+500});
