(() => {
  const account = document.currentScript.dataset.account;
  if (!account || !/^[a-z0-9-]+$/.test(account) ||
      location.origin !== "https://austwed.github.io" ||
      navigator.doNotTrack === "1" || navigator.globalPrivacyControl) return;

  function count(name, event) {
    const url = new URL("https://" + account + ".goatcounter.com/count");
    url.searchParams.set("p", name);
    if (event) url.searchParams.set("e", "1");
    fetch(url, {mode:"no-cors", credentials:"omit", referrerPolicy:"no-referrer",
      keepalive:true, cache:"no-store"}).catch(() => {});
  }
  count("/portfolio/", false);
  const actions = new Map([
    ["assets/files/portfolio.pdf", "作品集 PDF"],
    ["assets/play/birch-camp/index.html", "网页试玩"],
    ["https://www.bilibili.com/video/BV1dsyDzPEdx/", "Unity 实机视频"],
    ["https://www.bilibili.com/video/BV1gdEE6pEBU/", "ARCG 实机视频"]
  ]);
  function recordClick(event) {
    if (!event.isTrusted || (event.type === "auxclick" && event.button !== 1)) return;
    const link = event.target.closest("a[href]");
    const action = link && actions.get(link.getAttribute("href"));
    if (action) count(action, true);
  }
  document.addEventListener("click", recordClick, true);
  document.addEventListener("auxclick", recordClick, true);
})();
