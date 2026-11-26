(() => {
  "use strict";
  const sections = Array.from(document.querySelectorAll("main > section"));
  const chapterLinks = Array.from(document.querySelectorAll(".track a"));
  const mast = document.querySelector(".mast");
  const folio = document.querySelector("#folio-index");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const effectPreview = new URLSearchParams(location.search).get("effects") === "gallery";
  // Each destination keeps its signature, including jumps from the chapter rail.
  function galleryFrames(id, forward) {
    const direction = forward ? 1 : -1;
    const rise = (amount) => "translateY(" + direction * amount + "%)";
    const still = {transform:"none", opacity:1};
    switch (id) {
      case "top": // stackCover
        return [[{transform:rise(100)}, still], [still, {transform:rise(-10) + " scale(.94)"}]];
      case "flagship": // coverZoom
        return [[{transform:rise(100) + " scale(1.14)"}, still], [still, {transform:"scale(.85)", opacity:.84}]];
      case "materials": // zoomStack
        return [[{transform:"scale(.76)", opacity:0}, still], [still, {transform:"scale(1.18)", opacity:.45}]];
      case "research": { // door
        const hinge = "0% 50%";
        return [[{transform:"perspective(1600px) rotateY(" + direction * 84 + "deg)", transformOrigin:hinge, opacity:.45},
          {...still, transformOrigin:hinge}], [still, {transform:"scale(.96)", opacity:.75}]];
      }
      case "arcg": // coverInverted
        return [[{transform:rise(-100)}, still], [still, {transform:rise(7)}]];
    }
  }
  const desktop = matchMedia("(min-width: 960px) and (min-height: 620px)");
  const aliases = {
    home: "top", project: "flagship", playables: "flagship", unity: "flagship",
    docs: "materials", resources: "materials", teardown: "research", works: "arcg", others: "arcg"
  };
  const pad = value => String(value).padStart(2, "0");
  function chapterFromHash(hash) {
    const slug = hash.slice(1);
    return sections.findIndex(section => section.id === (aliases[slug] || slug));
  }
  let active = Math.max(0, chapterFromHash(location.hash));
  let cover = false;
  let transitions = [];
  const poster = document.querySelector(".home-poster");
  const exhibit = poster.querySelector(".exhibit");
  const flights = new Map();
  let homeVisible;
  function animateExhibits(show) {
    if (show === homeVisible) return;
    const returning = homeVisible === false;
    homeVisible = show;
    if (reducedMotion.matches || (!show && !returning && !sections[0].classList.contains("is-current"))) return;
    exhibit.querySelectorAll("[data-piece]").forEach((piece, index) => {
      const flight = flights.get(piece);
      if (flight) {
        flight.updatePlaybackRate(show ? 1 : -1.8);
        flight.play();
        return;
      }
      const box = piece.getBoundingClientRect();
      const drop = poster.getBoundingClientRect().bottom - box.top + 64;
      const drift = (exhibit.getBoundingClientRect().left + exhibit.clientWidth * .55
        - box.left - box.width / 2) * .32;
      const tucked = {translate:drift + "px " + drop + "px", scale:".54"};
      const animation = piece.animate([
        {...tucked, offset:0},
        {...tucked, offset:.04 + index * .055, easing:"cubic-bezier(.22,.74,.24,1)"},
        {translate:"0 -8px", scale:"1.018", offset:.82 + index * .025, easing:"ease-out"},
        {translate:"0 0", scale:"1", offset:1}
      ], {duration:720, delay:show && cover && returning ? 270 : 0, fill:"both"});
      if (!show) {
        animation.effect.setKeyframes([
          {...tucked, easing:"ease-in"},
          {translate:"0 0", scale:"1"}
        ]);
        animation.currentTime = 720;
        animation.playbackRate = -1.8;
      }
      flights.set(piece, animation);
      animation.onfinish = () => {
        flights.delete(piece);
        if (homeVisible) animation.cancel();
        else {
          // Keep the prints tucked away until the next chapter paint.
          animation.cancel();
          exhibit.classList.add("stowed");
        }
      };
    });
    if (show) exhibit.classList.remove("stowed");
  }
  function paintChapter() {
    animateExhibits(active === 0);
    mast.dataset.theme = sections[active].id;
    sections.forEach((section, i) => {
      section.classList.toggle("is-current", i === active);
      section.inert = cover && i !== active;
      if (i === active) chapterLinks[i].setAttribute("aria-current", "location");
      else chapterLinks[i].removeAttribute("aria-current");
    });
    folio.textContent = pad(active + 1);
  }
  function clearTransition() {
    transitions.forEach(animation => animation.cancel());
    transitions = [];
    sections.forEach(section => {
      section.classList.remove("in-motion");
      section.style.zIndex = "";
    });
  }
  function changeChapter(index, historyMode = "replace") {
    if (index < 0 || index >= sections.length) return;
    const next = sections[index];
    if (historyMode && location.hash !== "#" + next.id) {
      history[historyMode + "State"](null, "", "#" + next.id);
    }
    if (!cover) {
      next.scrollIntoView({block:"start", behavior:"instant"});
      active = index;
      paintChapter();
      return;
    }
    if (index === active) return;
    clearTransition();
    const before = sections[active];
    const forward = index > active;
    const moveFocus = before.contains(document.activeElement);
    active = index;
    paintChapter();
    if (moveFocus) {
      const title = next.querySelector("h1,h2");
      title.tabIndex = -1;
      title.focus({preventScroll:true});
    }
    if (reducedMotion.matches) return;
    before.classList.add("in-motion");
    before.style.zIndex = forward ? "1" : "2";
    next.style.zIndex = forward ? "2" : "1";
    const still = {transform:"translateY(0)", opacity:1};
    const under = {transform:"translateY(-8%)", opacity:.75};
    const edge = {transform:"translateY(100%)", opacity:1};
    const timing = {duration:640, easing:"cubic-bezier(.66,0,.2,1)", fill:"both"};
    let incoming = forward ? [edge, still] : [under, still];
    let outgoing = forward ? [still, under] : [still, edge];
    if (effectPreview) {
      [incoming, outgoing] = galleryFrames(next.id, forward);
      before.style.zIndex = "1";
      next.style.zIndex = "2";
    }
    const entering = next.animate(incoming, timing);
    const leaving = before.animate(outgoing, timing);
    transitions = [entering, leaving];
    entering.onfinish = () => {
      if (transitions[0] === entering) clearTransition();
    };
  }
  let layoutFrame = 0;
  function measureLayout() {
    layoutFrame = 0;
    const previousMode = cover;
    document.documentElement.style.setProperty("--bar", mast.offsetHeight + "px");
    cover = desktop.matches;
    document.documentElement.classList.toggle("cover", cover);
    if (cover && sections.some(section => section.scrollHeight > section.clientHeight + 2)) {
      cover = false;
      document.documentElement.classList.remove("cover");
    }
    if (cover !== previousMode) {
      clearTransition();
      if (cover) window.scrollTo({top:0, behavior:"instant"});
      else sections[active].scrollIntoView({block:"start", behavior:"instant"});
    }
    paintChapter();
  }
  function requestLayout() {
    if (!layoutFrame) layoutFrame = requestAnimationFrame(measureLayout);
  }
  let scrollFrame = 0;
  function followReading() {
    scrollFrame = 0;
    if (cover) return;
    const guide = mast.offsetHeight + Math.min(innerHeight * .28, 170);
    let nearest = 0;
    sections.forEach((section, i) => {
      if (section.getBoundingClientRect().top <= guide) nearest = i;
    });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 2) nearest = sections.length - 1;
    if (nearest !== active) {
      active = nearest;
      paintChapter();
      history.replaceState(null, "", "#" + sections[active].id);
    }
  }
  window.addEventListener("scroll", () => {
    if (!cover && !scrollFrame) scrollFrame = requestAnimationFrame(followReading);
  }, {passive:true});
  document.addEventListener("click", event => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    const index = chapterFromHash(anchor.hash);
    if (index < 0) return;
    event.preventDefault();
    changeChapter(index, "push");
  });
  chapterLinks.forEach((link, index) => {
    let timer;
    function cancel() {
      clearTimeout(timer);
      link.classList.remove("dwelling");
    }
    link.addEventListener("pointerenter", event => {
      if (event.pointerType !== "mouse" || index === active) return;
      link.classList.add("dwelling");
      timer = setTimeout(() => { cancel(); changeChapter(index); }, 300);
    });
    link.addEventListener("pointerleave", cancel);
    link.addEventListener("pointerdown", cancel);
  });
  window.addEventListener("hashchange", () => {
    const index = chapterFromHash(location.hash || "#top");
    if (index >= 0) changeChapter(index, null);
  });

  // Use fresh wheel input to advance; never queue turns for later playback.
  let lastWheel = -Infinity, lastTurn = -Infinity, wheelDirection = 0;
  let wheelDistance = 0, peakDelta = 0, turned = false;
  window.addEventListener("wheel", event => {
    if (!cover || event.ctrlKey || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    const now = performance.now();
    const direction = Math.sign(event.deltaY);
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1;
    const amount = Math.min(120, Math.abs(event.deltaY) * unit);
    if (now - lastWheel > 210 || direction !== wheelDirection) {
      wheelDistance = peakDelta = 0;
      turned = false;
    }
    lastWheel = now;
    wheelDirection = direction;
    peakDelta = Math.max(peakDelta, amount);
    // Ignore the diminishing tail of a touchpad flick after its first turn.
    if (turned && amount < Math.max(3, peakDelta * .45)) return;
    wheelDistance += amount;
    const rate = turned ? Math.min(2.4, 1 + wheelDistance / 240) : 1;
    if (transitions.length) {
      if (now - lastTurn >= 85 && wheelDistance >= 38) {
        transitions.forEach(animation => animation.updatePlaybackRate(Math.max(1.5, rate)));
      }
      return;
    }
    if (wheelDistance < (turned ? 90 : 38) || now - lastTurn < 260) return;
    const next = active + direction;
    if (next < 0 || next >= sections.length) return;
    changeChapter(next);
    if (turned) transitions.forEach(animation => animation.updatePlaybackRate(rate));
    lastTurn = now;
    turned = true;
    wheelDistance = 0;
  }, {passive:false});
  document.addEventListener("keydown", event => {
    if (!cover || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target.matches("input, textarea, select, [contenteditable='true']")) return;
    if (event.key === " " && event.target.closest("button,a")) return;
    const targets = {
      ArrowDown:active+1, PageDown:active+1, ArrowUp:active-1, PageUp:active-1,
      Home:0, End:sections.length-1, " ":active+(event.shiftKey ? -1 : 1)
    };
    if (!(event.key in targets)) return;
    event.preventDefault();
    if (!event.repeat && !transitions.length) changeChapter(targets[event.key]);
  });

  const photographs = {
    "unity-album": [
      ["../assets/exhibit/town.webp","灰岩镇主街"],
      ["../assets/exhibit/field.webp","粮田派工与预估产粮"],
      ["../assets/exhibit/cavern.webp","沉眠古窟救援"],
      ["../assets/exhibit/defense.webp","灰岩营地首次防守"],
      ["../assets/exhibit/march.webp","世界行军与据点道路"],
      ["../assets/exhibit/return.webp","返乡 · 损毁的白桦村"]
    ],
    "web-album": [
      ["../assets/exhibit/web-camp.webp","营地经营"], ["../assets/exhibit/web-muster.webp","土匪据点 · 编队测试"], ["../assets/exhibit/web-board.webp","土匪据点 · 回合战斗"]
    ]
  };
  const turns = new Map();
  function bindAlbum(album, entries) {
    const stage = album.querySelector(".prints");
    const caption = album.querySelector(".frame-caption");
    const count = album.querySelector(".frame-count");
    caption.setAttribute("aria-live","polite");
    const labels = album.id === "unity-album"
      ? ["灰岩镇","派工","古窟","防守","行军","返乡"] : ["营地","编队","战斗"];
    let position = 0, moving = null;
    let pointerX, pointerY;
    const frames = entries.map(([src,label], i) => {
      const sheet = document.createElement("div");
      sheet.className = "photo-leaf";
      const img = new Image();
      img.src = src;
      img.alt = label;
      const tab = document.createElement("button");
      tab.className = "ribbon";
      tab.type = "button";
      tab.textContent = labels[i];
      tab.setAttribute("aria-label","查看" + label);
      tab.style.top = (4 + i * 90 / entries.length) + "%";
      tab.style.setProperty("--ribbon-color", ["#e4d5ad","#c9ddce","#ddd2e6","#ccdeec","#e5cbbd","#d2d4b8"][i]);
      tab.addEventListener("click", () => select(i));
      tab.addEventListener("pointermove", e => {
        if (e.pointerType !== "mouse" || (e.clientX === pointerX && e.clientY === pointerY)) return;
        pointerX = e.clientX;
        pointerY = e.clientY;
        select(i);
      });
      sheet.append(img,tab);
      return sheet;
    });
    stage.replaceChildren(...frames);
    const pause = document.createElement("button");
    pause.type = "button";
    pause.className = "slideshow-control";
    const controls = album.querySelector(".album-buttons");
    controls.prepend(pause);
    const manualByDefault = album.id === "web-album";
    let stopped = manualByDefault || reducedMotion.matches;
    let timer, hovered = false, inView = false, playRequested = false;
    function schedule() {
      clearTimeout(timer);
      if (stopped || !inView || document.hidden || (!playRequested && (hovered || album.contains(document.activeElement))) ||
          !album.closest(".scene").classList.contains("is-current")) return;
      timer = setTimeout(() => { turn(1); schedule(); }, album.id === "unity-album" ? 5800 : 7200);
    }
    function playbackLabel() {
      pause.dataset.action = stopped ? "play" : "pause";
      pause.title = stopped ? "播放幻灯片" : "暂停幻灯片";
      pause.setAttribute("aria-label", stopped ? "播放幻灯片" : "暂停幻灯片");
    }
    playbackLabel();
    pause.addEventListener("click", () => { stopped = !stopped; playRequested = !stopped; playbackLabel(); schedule(); });
    album.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") { hovered = true; playRequested = false; schedule(); } });
    album.addEventListener("pointerleave", () => { hovered = false; schedule(); });
    album.addEventListener("focusin",schedule);
    album.addEventListener("focusout",() => requestAnimationFrame(schedule));
    document.addEventListener("visibilitychange",schedule);
    reducedMotion.addEventListener("change", () => { stopped = manualByDefault || reducedMotion.matches; playbackLabel(); schedule(); });
    new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); },
      {threshold:0.25}).observe(album);
    new MutationObserver(schedule).observe(album.closest(".scene"),{attributes:true,attributeFilter:["class"]});
    function select(index) {
      playRequested = false;
      if (position !== index) turn(index-position);
      schedule();
    }
    function settle() {
      frames.forEach((sheet,i) => {
        const depth = (i - position + frames.length) % frames.length;
        sheet.style.setProperty("--depth",depth);
        sheet.style.zIndex = frames.length - depth;
        sheet.dataset.depth = depth;
        sheet.firstElementChild.setAttribute("aria-hidden",String(depth !== 0));
        sheet.lastElementChild.setAttribute("aria-pressed",String(depth === 0));
      });
      caption.textContent = entries[position][1];
      count.textContent = pad(position + 1) + " / " + pad(entries.length);
    }
    function turn(direction) {
      if (moving) moving.cancel();
      const old = frames[position];
      const from = getComputedStyle(old).transform;
      position = (position + direction + frames.length) % frames.length;
      settle();
      if (reducedMotion.matches) return;
      const behind = old.style.zIndex;
      const rest = getComputedStyle(old).transform;
      // The tab belongs to the sheet. Change its stacking level only at the outer edge.
      moving = old.animate([
        {transform:from, zIndex:frames.length+1},
        {transform:"translate(-13%,-9%) rotate(-5deg)", zIndex:frames.length+1,offset:.48},
        {transform:"translate(-13%,-9%) rotate(-5deg)", zIndex:behind,offset:.481},
        {transform:rest, zIndex:behind}
      ], {duration:540,easing:"ease-in-out"});
      const trip = moving;
      trip.onfinish = () => { if (moving === trip) moving = null; };
    }
    album.querySelectorAll("button[data-step]").forEach(button => {
      button.addEventListener("click", () => turn(Number(button.dataset.step)));
    });
    album.addEventListener("keydown", event => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      if (!event.repeat) turn(event.key === "ArrowLeft" ? -1 : 1);
    });
    turns.set(album, turn);
    settle();
  }
  Object.entries(photographs).forEach(([id, frames]) => bindAlbum(document.getElementById(id), frames));
  const mobileChapter = matchMedia("(max-width:660px)");
  let chapterTurn;
  function swipeChapter(step) {
    const index = active + step;
    if (chapterTurn || index < 0 || index >= sections.length) return;
    if (reducedMotion.matches || !document.startViewTransition) {
      changeChapter(index);
      return;
    }
    const root = document.documentElement;
    root.dataset.swipe = step > 0 ? "next" : "previous";
    chapterTurn = document.startViewTransition(() => changeChapter(index));
    chapterTurn.finished.finally(() => {
      delete root.dataset.swipe;
      chapterTurn = null;
    });
  }
  let touch = null;
  document.addEventListener("touchstart", event => {
    touch = event.touches.length === 1 ? {
      x:event.touches[0].clientX, y:event.touches[0].clientY, scene:event.target.closest("main > .scene"),
      album:event.target.closest(".album-stage")?.closest(".album")
    } : null;
  }, {passive:true});
  document.addEventListener("touchcancel", () => { touch = null; }, {passive:true});
  document.addEventListener("touchend", event => {
    if (!touch || event.touches.length) return;
    const dx = event.changedTouches[0].clientX - touch.x;
    const dy = event.changedTouches[0].clientY - touch.y;
    if (touch.album && Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)*1.3) {
      turns.get(touch.album)(dx < 0 ? 1 : -1);
    } else if (mobileChapter.matches && touch.scene && Math.abs(dx) >= 54 && Math.abs(dx) > Math.abs(dy)*1.5) {
      swipeChapter(dx < 0 ? 1 : -1);
    } else if (cover && !transitions.length && Math.abs(dy) > 45 && Math.abs(dy) > Math.abs(dx)*1.3) {
      changeChapter(active + (dy < 0 ? 1 : -1));
    }
    touch = null;
  }, {passive:true});
  const samples = Array.from(document.querySelectorAll("[data-piece]"));
  function feature(id) {
    samples.forEach(sample => sample.toggleAttribute("data-front", sample.dataset.piece === id));
    document.querySelectorAll(".catalog-column").forEach(group => group.toggleAttribute("data-lit", group.dataset.group === id));
  }
  document.querySelectorAll(".catalog-column,[data-piece]").forEach(group => {
    const id = group.dataset.group || group.dataset.piece;
    group.addEventListener("pointerenter", event => { if (event.pointerType === "mouse") feature(id); });
    group.addEventListener("pointerleave", () => feature(null));
    group.addEventListener("focusin", () => feature(id));
    group.addEventListener("focusout", event => { if (!group.contains(event.relatedTarget)) feature(null); });
  });
  const arSwitch = document.querySelector(".ar-switch");
  const arButtons = Array.from(arSwitch.querySelectorAll("button"));
  arButtons.forEach((button,index)=>button.addEventListener("click",()=>{
    arSwitch.parentElement.classList.toggle("show-catalog",index===1);
    arButtons.forEach(item=>item.setAttribute("aria-pressed",String(item===button)));
  }));
  const switcher = document.querySelector(".mobile-game-switch button");
  switcher.addEventListener("click", () => {
    const spread = switcher.closest(".game-spread");
    const showWeb = spread.classList.toggle("show-web");
    switcher.setAttribute("aria-expanded", String(showWeb));
    switcher.querySelector("span").firstChild.textContent = showWeb ? "断剑归途 · Unity DEMO" : "网页流程原型";
    switcher.querySelector("small").textContent = showWeb ? "返回实机相册" : "查看原型相册";
    switcher.querySelector("img").src = photographs[showWeb ? "unity-album" : "web-album"][0][0];
  });
  document.querySelectorAll(".binding").forEach(binding => {
    const lid = binding.querySelector(".lid");
    const contents = binding.querySelector(".contents");
    function open(value) {
      binding.classList.toggle("opened", value);
      lid.setAttribute("aria-expanded", String(value));
      contents.inert = !value;
    }
    function closeAndFocus() {
      open(false);
      lid.focus({preventScroll:true});
    }
    lid.addEventListener("click", () => {
      if (mobileChapter.matches) {
        document.querySelectorAll(".binding.opened").forEach(other => {
          if (other !== binding) other.querySelector(".shut").click();
        });
      }
      open(true);
      contents.querySelector("li a").focus({preventScroll:true});
    });
    binding.addEventListener("pointerenter", event => { if (!mobileChapter.matches && event.pointerType === "mouse") open(true); });
    binding.addEventListener("pointerleave", event => {
      if (!mobileChapter.matches && event.pointerType === "mouse" && !binding.contains(document.activeElement)) open(false);
    });
    binding.addEventListener("focusout", event => { if (!mobileChapter.matches && !binding.contains(event.relatedTarget)) open(false); });
    binding.addEventListener("keydown", event => {
      if (event.key === "Escape") { event.preventDefault(); closeAndFocus(); }
    });
    binding.querySelector(".shut").addEventListener("click", closeAndFocus);
  });
  const rack = document.querySelector(".research");
  rack.addEventListener("pointermove", e => {
    if (e.pointerType !== "mouse" || reducedMotion.matches) return;
    const bounds = rack.getBoundingClientRect();
    rack.style.setProperty("--lamp-x", (e.clientX - bounds.left) + "px");
    rack.style.setProperty("--lamp-y", (e.clientY - bounds.top) + "px");
    rack.classList.add("lit-rack");
  });
  rack.addEventListener("pointerleave", () => rack.classList.remove("lit-rack"));
  measureLayout();
  if (!cover && active > 0) sections[active].scrollIntoView({behavior:"instant"});
  window.addEventListener("resize", requestLayout);
  const contentSize = new ResizeObserver(requestLayout);
  [mast, ...document.querySelectorAll(".poster-inner,.inventory,.game-spread,.docs-inner,.study-copy,.extras-inner")]
    .forEach(element => contentSize.observe(element));
  document.fonts.ready.then(requestLayout);
  reducedMotion.addEventListener("change", () => {
    if (!reducedMotion.matches) return;
    clearTransition();
    flights.forEach(animation => animation.cancel());
    flights.clear();
    exhibit.classList.remove("stowed");
  });
})();
