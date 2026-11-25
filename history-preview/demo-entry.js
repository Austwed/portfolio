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
 const open=()=>location.replace(boardURL);
 entry.onclick=open;
 let start;const scene=document.querySelector("#flagship");
 scene.addEventListener("touchstart",e=>{start=e.target.closest("a,button,.album")?null:e.touches[0]},{passive:true});
 scene.addEventListener("touchend",e=>{if(start&&start.clientX-e.changedTouches[0].clientX>85&&Math.abs(e.changedTouches[0].clientY-start.clientY)<40)open();start=null},{passive:true});
});
window.addEventListener("pageshow",()=>{quietUntil=Number(sessionStorage.getItem("historyReturned"))+500});
window.addEventListener("pagereveal",e=>{
 const transition=e.viewTransition;
 if(!transition)return;
 // Direct loads and interrupted navigations can skip the visual transition.
 transition.ready.catch(()=>{});
 if(document.referrer && new URL(document.referrer).pathname===boardURL.pathname){
  document.documentElement.classList.add("history-return");
  const done=()=>document.documentElement.classList.remove("history-return");
  transition.finished.then(done,done);
 }
});
