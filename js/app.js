(function () {
  "use strict";
  const D = window.BAILU_DATA;
  const G = window.BAILU_STATE;
  const S = G.state;
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const qs = (k) => new URLSearchParams(location.search).get(k) || "";
  const page = () => document.body.dataset.page || "home";
  const go = (u) => { location.href = u; };
  const imageAlt = {
    "museum-exterior.webp": "白鹭市博物馆旧馆正门与1990年代市级文化机构建筑",
    "museum-interior.webp": "白鹭市博物馆常设展厅内部",
    "old-city.webp": "白鹭市老城区与沿河街道历史照片",
    "collection-table.webp": "收音机、车票、搪瓷饭盒等普通居民捐赠物",
    "children-gallery.webp": "2016年孩子眼中的城市展厅与儿童水彩作品墙",
    "xiaoman-city.webp": "林小满儿童水彩作品我的城市",
    "xiaoman-people.webp": "林小满儿童水彩作品我认识的人",
    "xiaoman-future.webp": "林小满儿童水彩作品给未来的人看",
    "xiaoman-desk.webp": "林小满在博物馆活动桌前画画的旧照片",
    "xiaoman-workshop.webp": "林小满在铺有旧报纸的活动桌前调蓝色颜料",
    "xiaoman-palette.webp": "林小满使用过的水彩颜料盒，右侧蓝色颜料有反复调色痕迹",
    "xiaoman-bluehouse-back.webp": "蓝房子水彩画背面的铅笔补记与活动编号",
    "radio-catalog.webp": "一台米黄色与深棕色外壳的老式便携收音机，右上角有修补痕迹",
    "bus-pass.webp": "一张边缘有多处圆形打孔的旧公交月票",
    "yongan-family.webp": "1987年一家五口站在永安巷裁缝铺门前合影",
    "enamel-lunchbox.webp": "一只白色蓝边的旧搪瓷饭盒，边缘有使用造成的磕碰",
    "exhibition-sound.webp": "声音展厅设有四副耳机、口述史声波图与一台老式收音机",
    "exhibition-letters.webp": "展柜中陈列不同时期的家书、信封与明信片",
    "exhibition-chair.webp": "一把多次修补的旧木椅置于展台中央，墙上排列历任使用者的家庭照片",
    "exhibition-school.webp": "展厅按年代陈列旧书包、校服、课本、车票与木课桌",
  };
  function img(file, cls = "content-photo", caption = "", linkable = true) {
    const alt = imageAlt[file] || caption || "馆藏图片";
    const picture = `<img src="assets/images/${file}" alt="${esc(alt)}" loading="lazy">`;
    return `<figure class="archive-photo ${cls}">${linkable ? `<a href="assets/images/${file}" target="_blank" rel="noopener">${picture}</a>` : picture}${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
  }
  const TRANSITIONS = {
    "record-01": { no: "01", title: "对应", lines: ["馆藏详情误用图片：6项。", "编号、主体、来源、图注已经重新对应。", "永安巷的家庭合影里确实有五个人。", "没有图像的档案，也不再用别人的照片代替。"] },
    "record-02": { no: "02", title: "旧图", lines: ["2016儿童项目失效路径：5项。", "公开作品恢复：2项。限制索引恢复：2项。", "有个孩子在画背面写：蓝色要最后洗。", "她还说，新画笔太听话了。"] },
    "record-03": { no: "03", title: "画外", lines: ["修鞋的人。售票的人。值夜班的人。", "还有在展厅里替她捡起画笔的人。", "她记住了很多人。", "在她交来的三幅画里，没有一张画着她自己。"] },
    "record-04": { no: "04", title: "代存", lines: ["档案编号：D-001　文件总数：128", "接收方式：代存。公开授权：仅三幅活动作品。", "她已经离开这个世界八年了。", "母亲说：请把她自己愿意给别人看的留下。"] },
  };
  const SUPPORT_KEYS = { local: "_bailu_museum_support", session: "_bailu_museum_session", cookie: "_bailu_support_flag" };
  function isSafeLanding() {
    const p = page(), id = qs("id"), view = qs("view");
    return (p === "home" && !id && !view) || (p === "admin" && (!view || view === "log")) || (p === "archive" && !view && G.archiveAllowed()) || (p === "residents" && !id && G.archiveAllowed()) || (p === "children" && !id && G.childAllowed());
  }
  function removeNode(node) { if (node && node.parentNode) node.parentNode.removeChild(node); }
  function activateDialog(dialog, closeButton, onClose) {
    const previous = document.activeElement;
    const background = Array.from(document.body.children).filter((element) => element !== dialog).map((element) => ({
      element, hidden: element.getAttribute("aria-hidden"), inert: !!element.inert,
    }));
    const previousOverflow = document.body.style.overflow;
    background.forEach(({ element }) => { element.setAttribute("aria-hidden", "true"); element.inert = true; });
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(dialog.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')).filter((el) => !el.disabled && el.offsetParent !== null);
    const close = () => {
      dialog.removeEventListener("keydown", keydown);
      background.forEach(({ element, hidden, inert }) => {
        if (hidden === null) element.removeAttribute("aria-hidden"); else element.setAttribute("aria-hidden", hidden);
        element.inert = inert;
      });
      document.body.style.overflow = previousOverflow;
      onClose();
      if (previous && previous.focus) previous.focus();
    };
    const keydown = (event) => {
      if (event.key === "Escape") { event.preventDefault(); close(); return; }
      if (event.key !== "Tab") return;
      const items = focusable(); if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    dialog.addEventListener("keydown", keydown);
    if (closeButton) closeButton.onclick = close;
    requestAnimationFrame(() => (closeButton || focusable()[0] || dialog).focus());
    return close;
  }
  function showTransition(id, replay = false) {
    const item = TRANSITIONS[id];
    if (!item || $("#transitionOverlay")) return false;
    if (!replay) G.markTransition(id);
    document.body.insertAdjacentHTML("beforeend", `<div id="transitionOverlay" class="transition-overlay" role="dialog" aria-modal="true" aria-labelledby="transitionTitle" tabindex="-1"><div class="transition-window"><header><span>BAILU MUSEUM / DIGITAL ARCHIVE</span><button id="transitionClose" type="button">关闭记录</button></header><main><small>数字资料整理记录 ${item.no}</small><h1 id="transitionTitle">${esc(item.title)}</h1>${item.lines.map((line, i) => `<p class="transition-line" style="--line:${i}">${esc(line)}</p>`).join("")}</main><footer><span>本记录仅整理已经读取的资料，不改变原始档案。</span><button id="transitionReveal" type="button">完整显示文字</button></footer></div></div>`);
    const overlay = $("#transitionOverlay");
    activateDialog(overlay, $("#transitionClose"), () => removeNode(overlay));
    $("#transitionReveal").onclick = () => { overlay.classList.add("show-all"); $("#transitionReveal").disabled = true; };
    return true;
  }
  function maybeShowTransition() {
    if (!isSafeLanding()) return false;
    const id = G.nextTransition();
    return id ? showTransition(id) : false;
  }
  function readCookie(name) {
    try { return document.cookie.split(";").map((x) => x.trim()).find((x) => x.startsWith(`${name}=`)) || ""; } catch { return ""; }
  }
  function hasSupported() {
    try { return !!(localStorage.getItem(SUPPORT_KEYS.local) || sessionStorage.getItem(SUPPORT_KEYS.session) || readCookie(SUPPORT_KEYS.cookie)); } catch { return false; }
  }
  function supportToast(message) {
    document.body.insertAdjacentHTML("beforeend", `<div class="support-toast" role="status">${esc(message)}</div>`);
    const toast = document.body.lastElementChild;
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => { toast.classList.remove("show"); setTimeout(() => removeNode(toast), 350); }, 2600);
  }
  function markSupported() {
    const token = `${Date.now()}_${Math.random().toString(36).slice(2)}_bailu`;
    try { localStorage.setItem(SUPPORT_KEYS.local, token); } catch {}
    try { sessionStorage.setItem(SUPPORT_KEYS.session, token); } catch {}
    try { document.cookie = `${SUPPORT_KEYS.cookie}=${token};max-age=31536000;path=/`; } catch {}
  }
  function hideSupport() {
    const overlay = $("#supportOverlay");
    if (!overlay) return;
    overlay.classList.remove("show");
    setTimeout(() => removeNode(overlay), 330);
  }
  function showSupport(manual = false) {
    if ($("#supportOverlay")) return;
    if (hasSupported()) { if (manual) supportToast("已经收到你的支持，谢谢你让下一座城市继续留下档案。"); return; }
    S.supportAutoSeen = true;
    G.save();
    document.body.insertAdjacentHTML("beforeend", `<div id="supportOverlay" class="support-overlay" role="dialog" aria-modal="true" aria-labelledby="supportTitle" tabindex="-1"><div class="support-window"><header><b id="supportTitle">${esc(D.support.title)}</b><button id="supportClose" type="button" aria-label="关闭支持窗口">×</button></header><div class="support-inner"><div class="support-heading"><span aria-hidden="true">♡</span><strong>${esc(D.support.price)} 自愿打赏</strong><span aria-hidden="true">♡</span></div><div class="support-main"><figure><img src="assets/images/support-qr.png" alt="支持作品的收款二维码"></figure><p class="support-scan">请使用 <b>某宝</b> 扫码支持 ${esc(D.support.price)}</p><div class="support-copy"><p>你好，我是 ${esc(D.support.studio)} 的独立开发者。</p><p>为了让这座不存在的博物馆像真的存在过，我反复整理了每一条留言、每一张登记卡和每一幅画。如果你在浏览这些旧页面时感受到了一点触动，愿意支持1元，那会成为我继续创作的动力。</p><p class="support-note">1块钱买不到一张博物馆门票，但能让下一座不存在的城市继续留下档案。</p></div></div><footer><p>本作可以完整免费游玩。弹窗只自动出现一次，清除浏览器数据后可能重新出现。</p><div><button id="supportDone" class="support-primary" type="button">已完成支持 ♡</button><button id="supportLater" type="button">下次一定</button></div><small>${esc(D.support.studio)}</small></footer></div></div></div>`);
    const overlay = $("#supportOverlay");
    const closeSupport = activateDialog(overlay, $("#supportClose"), hideSupport);
    $("#supportLater").onclick = closeSupport;
    $("#supportDone").onclick = () => { markSupported(); closeSupport(); supportToast("感谢你的支持。蓝房子还会继续挂在这里。"); };
    requestAnimationFrame(() => overlay.classList.add("show"));
  }
  function maybeAutoSupport() {
    if (isSafeLanding() && G.ticketDone("BL-WEB-02") && G.transitionDone("record-02") && !S.supportAutoSeen && !hasSupported() && page() !== "ending") showSupport(false);
  }
  function maybeShowShiftBriefing() {
    if (page() !== "home" || qs("id") || qs("view") || S.staffReady || S.shiftBriefingSeen || $("#shiftBriefing")) return false;
    document.body.insertAdjacentHTML("beforeend", `<div id="shiftBriefing" class="transition-overlay" role="dialog" aria-modal="true" aria-labelledby="shiftTitle" tabindex="-1"><div class="shift-window"><small>白鹭市博物馆 · 临时维护交接</small><h1 id="shiftTitle">今天先把网站上几处放错的东西修好</h1><p>你受聘协助建馆30周年数字资料整理。工作包括核对图片与标题、恢复旧图路径、补录无障碍说明，以及复核资料公开范围。</p><p>公开网站可以自由浏览；工作台会始终保留当前事项，不需要寻找其他系统的账号和密码。</p><div><button id="shiftEnter" type="button">确认接班，打开工作台</button><button id="shiftBrowse" type="button">先浏览公开网站</button></div></div></div>`);
    const overlay = $("#shiftBriefing");
    const close = activateDialog(overlay, $("#shiftBrowse"), () => { S.shiftBriefingSeen = true; G.save(); removeNode(overlay); });
    $("#shiftEnter").onclick = () => { S.shiftBriefingSeen = true; G.save(); close(); go("admin.html"); };
    return true;
  }
  function highlight(text, query) {
    const safe = esc(text);
    if (!query) return safe;
    const terms = query.trim().split(/\s+/).filter(Boolean).sort((a, b) => b.length - a.length);
    if (!terms.length) return safe;
    const pattern = new RegExp(terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi");
    return safe.replace(pattern, (x) => `<mark>${x}</mark>`);
  }
  function nav() {
    const items = [
      ["index.html", "首页", "home"], ["museum.html", "本馆介绍", "museum"],
      ["exhibitions.html", "展览活动", "exhibitions"], ["collections.html", "馆藏资料", "collections"],
      ["memories.html", "城市记忆", "memories"], ["education.html", "教育推广", "education"],
      ["guestbook.html", "游客留言", "guestbook"], ["service.html", "游客服务", "service"],
    ];
    return `<a class="skip-link" href="#mainContent">跳到主要内容</a><div class="utility"><span>白鹭市文化和旅游局直属单位</span><span>今天是 2026年9月2日　星期三</span></div><header class="site-head"><div class="brand"><a href="index.html"><span class="egret">白鹭</span><b>${D.site.name}</b><small>${D.site.english}</small></a></div><div class="head-tools"><form id="headSearch"><label for="headQ">站内检索</label><input id="headQ" value="${esc(qs("q"))}" placeholder="请输入关键词"><button>搜索</button></form><span>中文　|　English</span></div></header><nav class="main-nav" aria-label="网站主导航">${items.map(([u, t, p]) => `<a ${page() === p ? 'aria-current="page"' : ""} class="${page() === p ? "current" : ""}" href="${u}">${t}</a>`).join("")}</nav><div class="pathbar"><span>当前位置：</span><a href="index.html">首页</a><b> &gt; ${document.title.split(" - ")[0]}</b></div>`;
  }
  function workStrip() {
    if (!S.staffReady || page() === "ending" || G.ticketDone("BL-WEB-05")) return "";
    const ticket = D.maintenance.tickets.find((x) => x.id === G.currentTicket());
    if (!ticket) return "";
    return `<aside class="current-work" aria-label="当前维护事项"><span>当前维护事项</span><b>${ticket.id} · ${esc(ticket.title)}</b><a href="admin.html?view=work&id=${ticket.id}">返回当前工单</a></aside>`;
  }
  function footer() {
    return `<footer class="site-footer"><div class="footer-info"><b>${D.site.name}</b><span>地址：${D.site.address}</span><span>电话：${D.site.phone}</span></div><div class="footer-tools"><a href="museum.html?view=contact">联系我们</a><a href="admin.html">网站维护</a><button data-support type="button">支持作品 1元</button><button id="soundToggle" type="button">网页声音：${S.sound ? "开" : "关"}</button><button id="resetSite" type="button">清除本机记录</button></div><p>© 2008-2026 白鹭市博物馆　网站最后改版：2016-05-08　访问人数 ${D.site.counter}</p></footer>`;
  }
  function shell(content, options = {}) {
    document.body.className = options.system ? "system-page" : "museum-site";
    $("#app").innerHTML = options.system ? content : `<div class="site-wrap">${nav()}${workStrip()}<main id="mainContent" class="site-main" tabindex="-1">${content}</main>${footer()}</div>`;
    bindCommon();
    if (!maybeShowShiftBriefing() && !maybeShowTransition()) maybeAutoSupport();
  }
  function bindCommon() {
    const search = $("#headSearch");
    if (search) search.onsubmit = (e) => { e.preventDefault(); const q = $("#headQ").value.trim(); if (q) go(`search.html?q=${encodeURIComponent(q)}`); };
    const sound = $("#soundToggle");
    if (sound) sound.onclick = () => { S.sound = !S.sound; G.save(); location.reload(); };
    const reset = $("#resetSite");
    if (reset) reset.onclick = () => { if (confirm("清除本设备上的整理记录并重新开始？")) { G.reset(); go("index.html"); } };
    $$('[data-support]').forEach((button) => button.onclick = () => showSupport(true));
    $$('[data-replay-transition]').forEach((button) => button.onclick = () => showTransition(button.dataset.replayTransition, true));
    if (S.sound) $$('a[href],button').forEach((el) => el.addEventListener("click", softClick, { once: true }));
  }
  function softClick() {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx(), osc = ctx.createOscillator(), gain = ctx.createGain();
      osc.type = "sine"; osc.frequency.value = 520; gain.gain.setValueAtTime(.018, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(.0001, ctx.currentTime + .035);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + .04); osc.onended = () => ctx.close();
    } catch {}
  }
  function side(title, links) {
    return `<aside class="left-menu"><h2>${esc(title)}</h2>${links.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join("")}</aside>`;
  }
  function pager(base, current, total) {
    if (total <= 1) return "";
    return `<div class="pager">${Array.from({ length: total }, (_, i) => `<a class="${i + 1 === current ? "on" : ""}" href="${base}${base.includes("?") ? "&" : "?"}p=${i + 1}">${i + 1}</a>`).join("")}</div>`;
  }
  function home() {
    G.visit("home");
    const top = D.notices.slice(0, 8);
    shell(`<section class="home-grid"><div class="home-main"><div class="banner">${img("museum-exterior.webp", "home-banner")}<div><b>保存城市变化　记录生活痕迹</b><span>白鹭市博物馆建馆30周年</span></div></div><div class="section-head"><h2>最新消息</h2><a href="index.html?view=notices">更多 &gt;&gt;</a></div><ul class="notice-list">${top.map((n) => `<li><span>[${esc(n.type)}]</span><a href="index.html?id=${n.id}">${esc(n.title)}</a><time>${n.date}</time></li>`).join("")}</ul><div class="home-columns"><section><div class="section-head"><h2>正在展出</h2><a href="exhibitions.html">全部展览</a></div>${D.exhibitions.slice(0, 3).map((e) => `<a class="picture-news" href="exhibitions.html?id=${e.id}">${img(e.image, "thumb-photo", "", false)}<span><b>${esc(e.title)}</b><small>${esc(e.desc)}</small></span></a>`).join("")}</section><section><div class="section-head"><h2>城市记忆</h2><a href="memories.html">进入栏目</a></div>${D.memories.slice(0, 5).map((m) => `<a class="text-news" href="memories.html?id=${m.id}"><b>${esc(m.title)}</b><small>${esc(m.person)} · ${esc(m.year)}</small></a>`).join("")}</section></div></div><aside class="home-side"><div class="quick"><h2>快速入口</h2><a href="collections.html">馆藏资料检索</a><a href="education.html">学校与儿童活动</a><a href="service.html">开放时间与预约</a><a href="guestbook.html">游客留言</a></div><div class="opening"><h2>今日开放</h2><b>09:00—17:00</b><span>16:30停止入馆</span><p>周一闭馆（节假日除外）</p></div><div class="anniversary"><span>1996—2026</span><b>建馆三十周年</b><p>数字资料整理计划正在进行</p><a href="index.html?id=n01">查看公告</a></div><div class="counter">网站访问人数：<b>${D.site.counter}</b></div></aside></section>`);
  }
  function noticePage() {
    const id = qs("id"), n = D.notices.find((x) => x.id === id);
    if (!n) { noticeList(); return; }
    G.visit(`notice:${id}`);
    shell(`<div class="two-col">${side("公告信息", [["index.html?view=notices", "全部公告"], ["index.html?id=n01", "整理计划"], ["index.html?id=n04", "服务器迁移"], ["index.html?id=n09", "图片异常"]])}<article class="article"><h1>${esc(n.title)}</h1><div class="article-meta">发布时间：${n.date}　来源：${esc(n.type)}　浏览：${318 + Number(id.slice(1)) * 17}</div>${n.body.map((p) => `<p>${esc(p)}</p>`).join("")}${id === "n04" ? `<div class="old-notice"><b>旧站启用资料</b><p>旧版网站于${D.site.anniversary}正式启用。维护人员由当前工单建立临时只读会话，不再使用共用账号。</p><a href="admin.html">返回维护工作台</a></div>` : ""}<p class="article-back"><a href="index.html?view=notices">返回公告列表</a></p></article></div>`);
  }
  function noticeList() {
    const p = Math.max(1, Number(qs("p")) || 1), rows = D.notices.slice((p - 1) * 8, p * 8);
    shell(`<div class="two-col">${side("公告信息", [["index.html?view=notices", "全部公告"], ["index.html?id=n01", "本馆公告"], ["education.html", "教育活动"], ["exhibitions.html", "展览活动"]])}<section class="listing"><h1>公告信息</h1>${rows.map((n) => `<a class="list-row" href="index.html?id=${n.id}"><span>[${esc(n.type)}]</span><b>${esc(n.title)}</b><time>${n.date}</time></a>`).join("")}${pager("index.html?view=notices", p, 2)}</section></div>`);
  }
  function museum() {
    G.visit("museum");
    const v = qs("view") || "history";
    const menu = side("本馆介绍", [["museum.html", "建馆历史"], ["museum.html?view=staff", "工作人员"], ["museum.html?view=mission", "本馆使命"], ["museum.html?view=contact", "联系我们"]]);
    let body = "";
    if (v === "staff") body = `<section class="staff-page"><h1>工作人员介绍</h1><p class="intro">以下为对外公开的主要工作人员信息。人员职责以馆内实际分工为准。</p>${D.staff.map((s) => `<article id="${s.id}"><div class="staff-initial">${s.name[0]}</div><div><h2>${esc(s.name)} <small>${esc(s.role)}</small></h2><p>${esc(s.bio)}</p><blockquote>${esc(s.quote)}</blockquote><span>${esc(s.years)}</span></div></article>`).join("")}</section>`;
    else if (v === "mission") body = `<article class="article"><h1>本馆使命</h1><h2>保存城市变化，记录生活痕迹</h2><p>本馆关注的不只是重大事件和著名人物，也包括家庭相册、普通劳动、儿童作品与日常声音。</p><p>资料进入馆藏并不自动等于公开。捐赠、代存、借展与数字复制具有不同授权范围，公众使用须遵守原始协议。</p><div class="quote-panel">“博物馆真正困难的工作，不是把东西留下，而是知道什么可以给未来的人看。”<span>— 2016年内部培训记录</span></div></article>`;
    else if (v === "contact") body = `<article class="article"><h1>联系我们</h1><table class="info-table"><tr><th>地址</th><td>${D.site.address}</td></tr><tr><th>电话</th><td>${D.site.phone}</td></tr><tr><th>典藏咨询</th><td>周二、周四 09:30—11:30</td></tr><tr><th>教育活动</th><td>edu@bailumuseum.example</td></tr><tr><th>网站维护</th><td><a href="admin.html">内部维护入口</a></td></tr></table></article>`;
    else body = `<article class="article"><h1>建馆历史</h1>${img("museum-interior.webp", "article-photo", "2016年改版后的常设展厅") }<p>白鹭市博物馆成立于1996年，馆址由原白鹭市第二文化馆改建。早期馆藏以城市建设照片、地方报刊和居民捐赠物为主。</p><p>2008年5月8日，本馆第一版独立网站正式启用。网站陆续上线城市记忆、居民故事和儿童教育活动资料。2016年完成最近一次大型改版，旧服务器保留只读访问。</p><p>截至2026年，本馆登记馆藏38,472件（组），其中数字影像、声音及网页资料7,913件。</p><h2>历任工作重点</h2><table class="history-table"><tr><th>1996—2007</th><td>建馆、纸质目录与居民实物征集</td></tr><tr><th>2008—2015</th><td>网站启用、城市记忆与口述史计划</td></tr><tr><th>2016—2025</th><td>数字化改版、教育项目与旧城影像整理</td></tr><tr><th>2026</th><td>建馆30周年数字资料整理计划</td></tr></table></article>`;
    shell(`<div class="two-col">${menu}${body}</div>`);
  }
  function exhibitions() {
    const id = qs("id"), x = D.exhibitions.find((e) => e.id === id);
    if (x) {
      G.visit(`exhibit:${id}`);
      const isChild = id === "e03";
      const repairState = G.ticketDone("BL-WEB-02") ? "已由 BL-WEB-02 恢复公开索引" : "部分路径失效，等待维护工单处理";
      shell(`<div class="two-col">${side("展览活动", [["exhibitions.html", "全部展览"], ["exhibitions.html?id=e01", "正在展出"], ["exhibitions.html?id=e03", "教育展览"], ["exhibitions.html?id=e05", "线上展览"]])}<article class="article exhibition-detail"><h1>${esc(x.title)}</h1><div class="article-meta">展览年份：${x.year}　状态：${esc(x.status)}</div>${img(x.image, "article-photo", `${x.year}年展览资料图`)}<p>${esc(x.desc)}</p>${isChild ? `<div class="broken-index"><b>旧图索引状态：${repairState}</b><p>本页原有48张作品索引。公开作品与限制记录必须分别恢复，文件存在不等于已经取得公开授权。</p><a href="${S.staffReady ? "admin.html?view=work&id=BL-WEB-02" : "index.html?id=n04"}">${S.staffReady ? "查看相关维护工单" : "查看服务器迁移说明"}</a></div><h2>展览说明</h2><p>孩子们先访问老街、车站和博物馆，再画下“希望未来还能看见的城市”。公开作品中包括林小满的《我的城市》。</p><a class="text-button" href="education.html?view=future2016">查看活动回顾</a>` : `<h2>策展说明</h2><p>展览资料来自公开征集、授权复制和馆藏数字化。个别家庭资料只展示获得许可的部分。</p>`}</article></div>`);
      return;
    }
    G.visit("exhibitions");
    shell(`<div class="two-col">${side("展览活动", [["exhibitions.html", "全部展览"], ["exhibitions.html?id=e01", "正在展出"], ["exhibitions.html?id=e03", "教育展览"], ["exhibitions.html?id=e05", "线上展览"]])}<section class="listing"><h1>展览活动</h1><div class="exhibition-list">${D.exhibitions.map((e) => `<a href="exhibitions.html?id=${e.id}">${img(e.image, "exhibit-thumb", "", false)}<span><small>${e.year} · ${esc(e.status)}</small><b>${esc(e.title)}</b><p>${esc(e.desc)}</p>${e.broken ? `<em>部分旧图无法显示</em>` : ""}</span></a>`).join("")}</div></section></div>`);
  }
  function collections() {
    const id = qs("id"), x = D.collections.find((c) => c.id === id);
    if (x) {
      G.visit(`collection:${id}`);
      const child = x.type === "儿童作品";
      const picture = D.collectionImages[x.id];
      const repairStep = D.maintenance.tickets[0].steps.find((step) => step.record === x.id);
      const repaired = !repairStep || G.stepDone("BL-WEB-01", repairStep.id) || G.ticketDone("BL-WEB-01");
      const authorizationPending = x.id === "BL-2016-0226" && !G.ticketDone("BL-WEB-05");
      const restricted = authorizationPending ? `<div class="catalog-no-image" role="img" aria-label="该作品尚未获得网站公开授权"><span>RESTRICTED IMAGE</span><b>原图暂不公开</b><p>原展览只保留了作品索引。完成来源与授权复核前，网站不显示扫描原图。</p></div>` : "";
      const pending = picture && !repaired ? `<div class="catalog-image-pending" role="img" aria-label="图片因著录异常暂时下线"><span>IMAGE TEMPORARILY UNAVAILABLE</span><b>图像著录异常，暂时下线</b><p>馆藏编号与图片主体尚未完成核对。维护人员请处理 BL-WEB-01，本站不会用其他馆藏图片临时代替。</p>${S.staffReady ? `<a href="admin.html?view=work&id=BL-WEB-01&step=${repairStep.id}">打开对应核对项</a>` : ""}</div>` : "";
      const media = restricted || pending || (picture ? img(picture.file, "object-photo", picture.caption) : `<div class="catalog-no-image" role="img" aria-label="该条目没有获准公开的数字图像"><span>${esc(x.type)}</span><b>数字影像未公开</b><p>本页只提供经过核对的著录信息，不使用其他馆藏图片代替。</p></div>`);
      const publicState = authorizationPending ? "仅显示索引，原件未公开" : picture && !repaired ? "著录核对中，图片暂时下线" : picture ? "馆内及网站展示" : "仅公开著录信息";
      shell(`<div class="two-col">${side("馆藏资料", [["collections.html", "馆藏检索"], ["collections.html?type=器物", "器物"], ["collections.html?type=照片", "照片"], ["collections.html?type=儿童作品", "儿童作品"]])}<article class="catalog-card"><div class="catalog-stamp">馆藏登记卡</div><h1>${esc(x.name)}</h1>${media}<table><tr><th>馆藏编号</th><td>${x.id}</td></tr><tr><th>年代</th><td>${x.year}</td></tr><tr><th>类别</th><td>${esc(x.type)}</td></tr><tr><th>著录说明</th><td>${esc(x.desc)}</td></tr><tr><th>公开范围</th><td>${publicState}</td></tr></table>${child ? `<p><a href="education.html?view=future2016">进入相关教育活动</a></p>` : ""}</article></div>`);
      return;
    }
    G.visit("collections");
    const type = qs("type"), term = qs("q").trim();
    const list = D.collections.filter((x) => (!type || x.type === type) && (!term || `${x.id}${x.name}${x.year}${x.desc}`.includes(term)));
    shell(`<div class="two-col">${side("馆藏资料", [["collections.html", "全部馆藏"], ["collections.html?type=器物", "器物"], ["collections.html?type=文书", "文书"], ["collections.html?type=儿童作品", "儿童作品"], ["collections.html?type=声音", "声音"]])}<section class="listing"><h1>馆藏资料检索</h1><form id="catalogSearch" class="old-form"><label>名称、编号或年份 <input id="catalogQ" value="${esc(term)}"></label><button>检索</button></form><p class="result-line">当前显示 ${list.length} 条公开记录</p><table class="catalog-table"><thead><tr><th>编号</th><th>名称</th><th>年代</th><th>类别</th></tr></thead><tbody>${list.map((x) => `<tr><td>${x.id}</td><td><a href="collections.html?id=${x.id}">${esc(x.name)}</a></td><td>${x.year}</td><td>${esc(x.type)}</td></tr>`).join("")}</tbody></table></section></div>`);
    $("#catalogSearch").onsubmit = (e) => { e.preventDefault(); go(`collections.html?q=${encodeURIComponent($("#catalogQ").value.trim())}`); };
  }
  function memories() {
    const id = qs("id"), x = D.memories.find((m) => m.id === id);
    G.visit(x ? `memory:${id}` : "memories");
    if (x) shell(`<div class="two-col">${side("城市记忆", D.memories.map((m) => [`memories.html?id=${m.id}`, m.title]))}<article class="memory-story"><span>居民口述 / ${x.year}</span><h1>${esc(x.title)}</h1><h2>${esc(x.person)}</h2><div class="waveform" aria-label="音频波形装饰">${Array.from({ length: 48 }, (_, i) => `<i style="height:${8 + ((i * 17) % 34)}px"></i>`).join("")}</div><p>${esc(x.text)}</p><p>音频原件仅在馆内阅览，本页为经受访者确认的文字摘要。</p></article></div>`);
    else shell(`<div class="two-col">${side("城市记忆", [["memories.html", "全部故事"], ["memories.html?id=m01", "交通"], ["memories.html?id=m03", "手艺"], ["memories.html?id=m04", "夜班"]])}<section class="listing"><h1>城市记忆</h1>${img("old-city.webp", "wide-photo", "白鹭市老城区公开影像") }<div class="memory-list">${D.memories.map((m) => `<a href="memories.html?id=${m.id}"><time>${m.year}</time><span><b>${esc(m.title)}</b><p>${esc(m.text)}</p><small>讲述人：${esc(m.person)}</small></span></a>`).join("")}</div></section></div>`);
  }
  function education() {
    const v = qs("view") || "home";
    G.visit(v === "future2016" ? "education:future2016" : "education");
    const menu = side("教育推广", [["education.html", "活动介绍"], ["education.html?view=future2016", "2016活动回顾"], ["children.html", "儿童作品旧库"], ["exhibitions.html?id=e03", "孩子眼中的城市"]]);
    if (v === "future2016") {
      shell(`<div class="two-col">${menu}<article class="article education-poster"><div class="poster-year">2016</div><h1>给未来的人看</h1><p class="poster-en">FOR THE FUTURE · CHILDREN'S CITY PROJECT</p>${img("children-gallery.webp", "article-photo", "2016年儿童作品展厅") }<p>活动邀请孩子访问白鹭旧城、公交站、居民店铺和博物馆，并用水彩记录“希望未来还能看见的人和地方”。</p><table class="info-table"><tr><th>活动时间</th><td>2016年5月—7月</td></tr><tr><th>合作学校</th><td>南桥小学等5所学校</td></tr><tr><th>展览名称</th><td>孩子眼中的城市</td></tr><tr><th>资料代号</th><td>FUTURE / 2016</td></tr></table><div class="archive-entry"><b>旧活动资料</b><p>部分作品仍在旧版儿童活动数据库。维护人员须从 BL-WEB-02 工单建立临时只读会话，旧共用账号已经停用。</p><a href="${S.staffReady ? "admin.html?view=work&id=BL-WEB-02" : "admin.html"}">${S.staffReady ? "查看路径恢复工单" : "进入维护工作台"}</a></div></article></div>`);
    } else {
      shell(`<div class="two-col">${menu}<section class="listing"><h1>教育推广</h1><div class="education-hero">${img("children-gallery.webp", "wide-photo")}<div><h2>让孩子用自己的眼睛记录城市</h2><p>本馆面向学校和家庭开展城市观察、口述史、水彩记录与藏品体验活动。</p></div></div><h2 class="subhead">近期与往期项目</h2><table class="event-table"><tr><th>2026</th><td><b>三十周年小小档案员</b><p>学习给家庭旧物编写一张完整登记卡。</p></td></tr><tr><th>2024</th><td><b>消失街道门牌拓印</b><p>从旧地图寻找已经改变的街巷。</p></td></tr><tr><th>2019</th><td><b>听见家里的声音</b><p>在家长许可下记录一段家庭声音。</p></td></tr><tr><th>2016</th><td><a href="education.html?view=future2016"><b>给未来的人看</b></a><p>儿童城市观察与水彩项目。</p></td></tr></table></section></div>`);
    }
  }
  function guestbook() {
    G.visit("guestbook");
    const p = Math.max(1, Math.min(5, Number(qs("p")) || 1));
    G.visit(`guestbook:p${p}`);
    const list = D.guestbook.slice((p - 1) * 10, p * 10);
    shell(`<div class="two-col">${side("游客留言", [["guestbook.html", "最新留言"], ["guestbook.html?p=2", "第2页"], ["guestbook.html?p=3", "第3页"], ["guestbook.html?p=4", "第4页"], ["guestbook.html?p=5", "历史留言"]])}<section class="listing"><h1>游客留言</h1><div class="guest-note">留言经审核后公开。涉及个人联系方式、证件及未成年人隐私的内容不予显示。</div><div class="guest-list">${list.map((g) => `<article class="${g.flagged ? "old-message" : ""}"><header><b>${esc(g.name)}</b><time>${g.date}</time><span>${g.id}</span></header><p>${esc(g.text)}</p>${g.reply ? `<div><b>馆方回复：</b>${esc(g.reply.replace(/^馆方回复：/, ""))}</div>` : ""}</article>`).join("")}</div>${pager("guestbook.html", p, 5)}</section></div>`);
  }
  function service() {
    G.visit("service");
    shell(`<div class="two-col">${side("游客服务", [["service.html", "参观须知"], ["service.html#hours", "开放时间"], ["service.html#traffic", "交通路线"], ["guestbook.html", "游客留言"]])}<article class="article"><h1>游客服务</h1><h2 id="hours">开放时间</h2><table class="info-table"><tr><th>周二至周日</th><td>09:00—17:00（16:30停止入馆）</td></tr><tr><th>周一</th><td>闭馆，节假日另行公告</td></tr><tr><th>门票</th><td>常设展免费，临展以公告为准</td></tr></table><h2>参观须知</h2><ol><li>常设展可关闭闪光灯拍照。</li><li>团体讲解需提前两个工作日预约。</li><li>儿童须由成年人陪同。</li><li>居民资料复制与学术使用请向典藏部申请。</li></ol><h2 id="traffic">交通路线</h2><p>12路、27路公交“永安路博物馆”站下车；东平码头公共停车场步行约8分钟。</p>${img("museum-exterior.webp", "article-photo", "白鹭市博物馆正门")}</article></div>`);
  }
  function search() {
    G.visit("search");
    const q = qs("q").trim();
    const rows = [];
    D.notices.forEach((x) => rows.push([x.title, x.body.join(" "), `index.html?id=${x.id}`, "公告"]));
    D.exhibitions.forEach((x) => rows.push([x.title, x.desc, `exhibitions.html?id=${x.id}`, "展览"]));
    D.collections.forEach((x) => rows.push([x.name, `${x.id} ${x.year} ${x.desc}`, `collections.html?id=${x.id}`, "馆藏"]));
    D.memories.forEach((x) => rows.push([x.title, `${x.person} ${x.text}`, `memories.html?id=${x.id}`, "城市记忆"]));
    D.guestbook.forEach((x, i) => rows.push([`游客留言 ${x.id}`, `${x.name} ${x.text} ${x.reply}`, `guestbook.html?p=${Math.floor(i / 10) + 1}`, "留言"]));
    D.staff.forEach((x) => rows.push([x.name, `${x.role} ${x.bio} ${x.quote}`, `museum.html?view=staff#${x.id}`, "工作人员"]));
    const hits = q ? rows.filter((r) => `${r[0]} ${r[1]}`.toLowerCase().includes(q.toLowerCase())) : [];
    shell(`<section class="search-page"><h1>站内检索</h1><form id="bigSearch" class="big-search"><input id="bigQ" value="${esc(q)}" placeholder="输入姓名、展览、馆藏编号或年份"><button>检索</button></form>${q ? `<p>关键词“${esc(q)}”共有 ${hits.length} 条公开结果</p><div class="search-results">${hits.map((r) => `<article><span>${r[3]}</span><a href="${r[2]}"><h2>${highlight(r[0], q)}</h2></a><p>${highlight(r[1].slice(0, 170), q)}</p></article>`).join("") || `<div class="empty">没有找到完全匹配的公开页面。旧资料可能未进入新版检索。</div>`}</div>` : `<div class="search-help"><p>可以检索展览名称、居民姓名、馆藏编号或年份。</p><p>旧版居民故事与儿童活动资料未全部进入当前网站索引。</p></div>`}</section>`);
    $("#bigSearch").onsubmit = (e) => { e.preventDefault(); const value = $("#bigQ").value.trim(); if (value) go(`search.html?q=${encodeURIComponent(value)}`); };
  }
  function systemFrame(title, content, navLinks = []) {
    const type = title.includes("CHILD") ? "child" : title.includes("SPECIAL") ? "special" : title.includes("ARCHIVE") || title.includes("RESIDENT") ? "archive" : title.includes("TEST") ? "test" : "maintenance";
    const origin = { maintenance: "网站维护服务器 / 2016", archive: "旧资料服务器 / 2008", child: "儿童项目服务器 / 2016", special: "特别保存档案 / 限制访问", test: "网页测试环境 / 只读" }[type];
    const taskLink = !S.staffReady ? `<a href="admin.html">维护接班</a>` : G.ticketDone("BL-WEB-05") ? `<a href="ending.html">完成页面</a>` : `<a href="admin.html?view=work&id=${G.currentTicket()}">当前工单</a>`;
    const supportControl = type === "special" ? "" : `<button data-support type="button">支持作品 1元</button>`;
    shell(`<a class="skip-link" href="#systemMain">跳到主要内容</a><div class="legacy-system system-${type}"><header><b>${esc(title)}</b><span>${origin}</span><em>${new Date().toISOString().slice(0, 10)}</em></header><nav aria-label="内部系统导航">${taskLink}<a href="admin.html">工作台</a>${navLinks.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join("")}<a href="index.html">返回公开网站</a>${supportControl}</nav><main id="systemMain" tabindex="-1">${content}</main><footer>当前系统：${esc(title)}　权限：TEMP STAFF / READ + REVIEW　状态仅保存在本机。</footer></div>`, { system: true });
  }
  function transitionLog() {
    const seen = Object.keys(TRANSITIONS).filter((id) => G.transitionDone(id));
    return `<section class="system-section"><h1>整理日志</h1><p>这些记录只整理你已经阅读过的资料，不提供新的档案内容。</p>${seen.length ? `<div class="transition-log">${seen.map((id) => `<article><span>${TRANSITIONS[id].no}</span><div><b>${esc(TRANSITIONS[id].title)}</b><p>${esc(TRANSITIONS[id].lines[TRANSITIONS[id].lines.length - 1])}</p></div><button type="button" data-replay-transition="${id}">重新查看</button></article>`).join("")}</div>` : `<div class="system-help">当前还没有形成可归纳的整理记录。继续核对公开网站和旧资料即可。</div>`}</section>`;
  }
  function ticketById(id) { return D.maintenance.tickets.find((ticket) => ticket.id === id); }
  function stepCount(ticket) { return (S.completedSteps[ticket.id] || []).length; }
  function ticketState(ticket) {
    if (G.ticketDone(ticket.id)) return ["已完成", "done"];
    if (G.ticketAvailable(ticket.id)) return [ticket.id === G.currentTicket() ? "当前处理" : "可处理", "active"];
    return ["等待前序工单", "waiting"];
  }
  function workItem(ticket, step) {
    const done = G.stepDone(ticket.id, step.id);
    const picture = step.image ? img(step.image, "work-review-image", `${step.record} 核对图`, false) : `<div class="work-document" role="img" aria-label="档案来源与授权字段核对页"><span>REVIEW COPY</span><b>${esc(step.record)}</b><p>来源字段、接收日志与授权说明</p></div>`;
    const checks = {
      "BL-WEB-01": ["画面主体与馆藏名称一致", "来源编号与登记卡能够互相指认", "未使用相似或无关图片临时代替"],
      "BL-WEB-02": ["原路径与迁移目标属于同一记录", "恢复文件位置时没有改写作品内容", "受限条目仍保持受限状态"],
      "BL-WEB-03": ["替代文字只描述画面可见事实", "关键叙事信息不只依赖颜色或构图", "人物关联没有超出原授权范围"],
      "BL-WEB-04": ["区分代存、复制、入藏与公开", "以原始提交表和资料提供者邮件为准", "无法确认授权的私人材料保持限制"],
    }[ticket.id] || ["核对原始记录", "保持授权边界", "写入维护日志"];
    systemFrame("BCM WEB MAINTENANCE 5.0", `<article class="work-item"><header><small>${ticket.id} / ${esc(ticket.team)}</small><h1>${esc(step.label)}</h1><p>${esc(ticket.title)}</p></header><div class="work-review-grid">${picture}<section><table class="system-table"><tr><th>记录编号</th><td>${esc(step.record)}</td></tr><tr><th>来源</th><td>${esc(step.source)}</td></tr><tr><th>当前状态</th><td class="problem-value">${esc(step.before || "旧路径或授权字段待核对")}</td></tr><tr><th>拟修正为</th><td class="correct-value">${esc(step.after)}</td></tr></table><div class="work-rule"><b>核对依据</b><p>${esc(step.note)}</p></div><details class="review-checklist"><summary>查看本项维护检查表</summary><ol>${checks.map((item) => `<li>${esc(item)}</li>`).join("")}</ol><p>${esc(ticket.lesson)}</p></details>${done ? `<div class="work-success" role="status">本项已写入维护日志。你可以返回工单处理下一项。</div>` : `<button id="applyStep" class="work-primary" type="button">确认来源并写入修正</button>`}</section></div><footer><a href="admin.html?view=work&id=${ticket.id}">返回 ${ticket.id}</a>${ticket.id === "BL-WEB-01" && step.record.startsWith("BL-") ? `<a href="collections.html?id=${step.record}">查看公开馆藏页</a>` : ""}${ticket.id === "BL-WEB-02" ? `<a href="children.html">打开儿童项目只读库</a>` : ""}${ticket.id === "BL-WEB-03" ? `<a href="archive.html">打开旧资料只读库</a>` : ""}${ticket.id === "BL-WEB-04" ? `<a href="archive.html?view=debates">查看访问范围记录</a>` : ""}</footer></article>`, [[`admin.html?view=work&id=${ticket.id}`, "返回工单"]]);
    if ($("#applyStep")) $("#applyStep").onclick = () => { G.completeStep(ticket.id, step.id); location.reload(); };
  }
  function workTicket(id) {
    const ticket = ticketById(id);
    if (!ticket) { go("admin.html"); return; }
    if (!G.ticketAvailable(ticket.id)) {
      const current = ticketById(G.currentTicket());
      systemFrame("BCM WEB MAINTENANCE 5.0", `<div class="source-gate"><h1>${esc(ticket.id)} 尚未交接</h1><p>前序维护记录还没有完成。系统不会要求你寻找额外账号或密码。</p><a href="admin.html?view=work&id=${current.id}">继续 ${current.id} · ${esc(current.title)}</a></div>`);
      return;
    }
    if (ticket.id === "BL-WEB-05") {
      systemFrame("BCM WEB MAINTENANCE 5.0", `<section class="system-section final-ticket"><small>${ticket.id} / ${esc(ticket.team)}</small><h1>${esc(ticket.title)}</h1><p>${esc(ticket.intro)}</p><div class="work-rule"><b>本项工作原则</b><p>${esc(ticket.lesson)}</p></div><div class="handoff-summary"><p>馆藏图文对应：已复核</p><p>2016旧图路径：已恢复</p><p>替代文字与人物关联：已补录</p><p>D-001来源与公开范围：已确认</p></div><a class="work-primary link-primary" href="special.html">打开最终授权复核页</a></section>`, [["admin.html", "工作台"], ["admin.html?view=log", "整理日志"]]);
      return;
    }
    const requestedStep = qs("step");
    if (requestedStep) {
      const step = ticket.steps.find((item) => item.id === requestedStep);
      if (!step) { go(`admin.html?view=work&id=${ticket.id}`); return; }
      workItem(ticket, step);
      return;
    }
    const complete = ticket.steps.every((step) => G.stepDone(ticket.id, step.id));
    const rows = ticket.steps.map((step) => {
      const done = G.stepDone(ticket.id, step.id);
      return `<tr><td>${done ? `<span class="status-check" aria-label="已完成">✓</span>` : `<span class="status-open" aria-label="待核对">待</span>`}</td><td><b>${esc(step.record)}</b><small>${esc(step.label)}</small></td><td>${esc(done ? step.after : step.before || "等待核对")}</td><td><a href="admin.html?view=work&id=${ticket.id}&step=${step.id}">${done ? "查看记录" : "开始核对"}</a></td></tr>`;
    }).join("");
    systemFrame("BCM WEB MAINTENANCE 5.0", `<section class="system-section work-ticket"><header><small>${ticket.id} / ${esc(ticket.team)}</small><h1>${esc(ticket.title)}</h1><span>${esc(ticket.estimate)}</span></header><p class="ticket-intro">${esc(ticket.intro)}</p><div class="work-rule"><b>本项工作原则</b><p>${esc(ticket.lesson)}</p></div><table class="system-table work-table"><thead><tr><th>状态</th><th>记录</th><th>当前说明</th><th>处理</th></tr></thead><tbody>${rows}</tbody></table>${G.ticketDone(ticket.id) ? `<div class="work-success">工单已完成并交接。<a href="admin.html">返回工作台</a></div>` : complete ? `<button id="completeTicket" class="work-primary" type="button">完成复核并提交工单</button>` : `<p class="system-help">已核对 ${stepCount(ticket)} 项，共 ${ticket.steps.length} 项。可以随时返回公开网站，当前进度不会丢失。</p>`}</section>`, [["admin.html", "工作台"], ["admin.html?view=log", "整理日志"]]);
    if ($("#completeTicket")) $("#completeTicket").onclick = () => { G.completeTicket(ticket.id); go("admin.html"); };
  }
  function admin() {
    G.visit("admin:entry");
    if (!S.staffReady) {
      systemFrame("BCM WEB MAINTENANCE 5.0", `<div class="onboarding"><small>2026年建馆30周年数字资料整理计划</small><h1>临时维护交接单</h1><p>今天需要处理五张工单：图像著录、旧图路径、替代文字、人物关联和公开范围。公开网站可以自由浏览；所有内部只读权限都由工单自动建立。</p><p><b>建议完整值班用时：55—70分钟。</b> 系统不设置倒计时，可随时离开并继续。</p><form id="setupForm"><label>员工代号<input value="TEMP-MAINT-24" disabled></label><label>值班显示名<input id="playerName" maxlength="12" value="临时维护员" aria-describedby="nameHelp"></label><small id="nameHelp">只保存在本设备，可直接使用默认名称。</small><button>确认接班</button></form><div class="paper-note"><b>重要说明</b><p>主流程不需要寻找、猜测或输入其他后台账号。你只修正网站副本，不改写原始档案。</p></div></div>`, []);
      $("#setupForm").onsubmit = (e) => { e.preventDefault(); S.playerName = $("#playerName").value.trim() || "临时维护员"; S.staffReady = true; S.shiftBriefingSeen = true; G.save(); go("admin.html"); };
      return;
    }
    if (qs("view") === "login" || qs("view") === "test") {
      const destination = G.ticketDone("BL-WEB-05") ? "ending.html" : `admin.html?view=work&id=${G.currentTicket()}`;
      systemFrame("BCM WEB MAINTENANCE 5.0", `<div class="source-gate"><h1>旧账号入口已经停用</h1><p>本期维护采用工单临时授权。无需寻找其他系统账号，也不会因为没有密码而卡住。</p><a href="${destination}">${G.ticketDone("BL-WEB-05") ? "返回完成页面" : "返回当前工单"}</a></div>`, [["admin.html", "工作台"]]);
      return;
    }
    if (qs("view") === "log") {
      systemFrame("BCM WEB MAINTENANCE 5.0", transitionLog(), [["admin.html", "工作台"]]);
      return;
    }
    if (qs("view") === "work") { workTicket(qs("id") || G.currentTicket()); return; }
    G.visit("admin:dashboard");
    const cards = D.maintenance.tickets.map((ticket) => {
      const [label, cls] = ticketState(ticket);
      const total = ticket.steps.length;
      const detail = total ? `${stepCount(ticket)} / ${total} 项已核对` : "最终发布复核";
      return `<article class="ticket-card ${cls}"><header><b>${ticket.id}</b><span>${label}</span></header><h2>${esc(ticket.title)}</h2><p>${esc(ticket.intro)}</p><footer><small>${esc(ticket.estimate)}　${detail}</small>${G.ticketAvailable(ticket.id) ? `<a href="admin.html?view=work&id=${ticket.id}">${G.ticketDone(ticket.id) ? "查看工单" : "继续处理"}</a>` : `<span>完成前序工单后自动交接</span>`}</footer></article>`;
    }).join("");
    const current = ticketById(G.currentTicket());
    const allDone = G.ticketDone("BL-WEB-05");
    const currentLink = allDone ? `<a href="ending.html">完成页面</a>` : `<a href="admin.html?view=work&id=${current.id}">当前工单</a>`;
    const status = allDone ? "五张工单均已完成；公开索引已经按原始授权更新" : `当前建议处理：${current.id} · ${esc(current.title)}　所有内部权限由工单自动建立`;
    systemFrame("BCM WEB MAINTENANCE 5.0", `<div class="system-dashboard"><aside><b>${esc(S.playerName)} / 临时维护员</b><span>权限：TEMP STAFF</span><a class="active" href="admin.html">今日工作</a>${currentLink}<a href="admin.html?view=log">整理日志</a><a href="index.html">浏览公开网站</a></aside><section><h1>30周年数字资料整理工作台</h1><div class="status-strip" role="status">${status}</div><p class="dashboard-intro">按交接顺序处理五张工单。你可以随时查看公开页面，返回时会继续当前事项；没有任何主线步骤要求输入其他后台账号或密码。</p><div class="ticket-list">${cards}</div></section></div>`, [["admin.html?view=log", "整理日志"]]);
  }
  function archive() {
    G.visit("archive:entry");
    if (!G.archiveAllowed()) {
      systemFrame("BCM ARCHIVE MANAGER 2.8", `<div class="source-gate"><h1>旧版资料管理系统</h1><p>该系统仅接受当前维护工单建立的临时只读会话，不使用共用账号。</p><p>完成图像著录与旧图路径工单后，BL-WEB-03 会自动开放这里的人物关联记录。</p><a href="admin.html?view=work&id=${G.currentTicket()}">返回当前工单</a></div>`, []);
      return;
    }
    if (qs("view") === "debates") {
      G.visit("debates");
      systemFrame("BCM ARCHIVE MANAGER 2.8", `<section class="system-section"><h1>访问范围复核记录 / D类</h1><div class="warning-strip">本页不是捐赠协议。内部意见不能替代资料提供者授权。</div>${D.debates.map((x) => `<article class="debate"><header><b>${esc(x.by)}</b><time>${x.date}</time></header><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></article>`).join("")}<p><a href="archive.html">返回旧资料首页</a></p></section>`, [["archive.html", "档案首页"], ["residents.html", "居民故事"]]);
      return;
    }
    G.visit("archive:home");
    const childModule = G.childAllowed() ? `<a class="system-handoff" href="children.html"><b>儿童活动数据库 ↗</b><span>独立服务器；工单临时只读会话</span></a>` : `<div class="system-module-disabled"><b>儿童活动数据库</b><span>等待 BL-WEB-02 工单交接</span></div>`;
    const handoff = G.ticketDone("BL-WEB-04") ? `<div class="dossier-ready"><b>D-001来源与公开范围已经复核</b><p>最后的发布操作必须从 BL-WEB-05 进入，旧资料系统不会直接开放特别档案。</p><a href="admin.html?view=work&id=BL-WEB-05">返回最终工单</a></div>` : `<div class="index-note"><b>本期工作</b><p>请按当前维护工单核对公开摘要。浏览更多居民记录不会成为隐藏的解锁条件。</p></div>`;
    systemFrame("BCM ARCHIVE MANAGER 2.8", `<section class="system-section"><h1>旧版资料索引</h1><div class="status-strip">SERVER: BCM-LEGACY-01　MODE: WORK-ORDER READ ONLY　LAST MIGRATION: 2016-05-12</div><div class="system-modules"><a href="residents.html"><b>居民故事数据库</b><span>18条公开摘要 / 旧编号 C</span></a><a href="archive.html?view=debates"><b>访问范围复核记录</b><span>D类内部意见 / 只读</span></a>${childModule}</div><h2>服务器迁移记录</h2><table class="system-table"><thead><tr><th>日期</th><th>内容</th></tr></thead><tbody>${D.migrationLogs.map((x) => `<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join("")}</tbody></table>${handoff}</section>`, [["residents.html", "居民故事"], ["archive.html?view=debates", "复核记录"]]);
  }
  function residents() {
    if (!G.archiveAllowed()) { go("archive.html"); return; }
    const id = qs("id"), x = D.residents.find((r) => r.id === id);
    if (x) {
      G.visit(`resident:${id}`);
      const childLink = (record, label) => G.childAllowed() ? `<a class="system-handoff" href="children.html?id=${record}">${label}（转至独立儿童项目服务器）</a>` : `<a href="admin.html?view=work&id=BL-WEB-02">从路径恢复工单建立会话</a>`;
      const links = id === "C-005" ? `<div class="cross-ref"><b>关联资料</b><a href="memories.html?id=m04">医院夜班窗户（公开摘要）</a>${childLink("K-2016-008", "儿童作品中的护士形象")}</div>` : id === "C-012" ? `<div class="cross-ref"><b>关联资料</b><a href="education.html?view=future2016">2016活动回顾</a>${childLink("K-2016-004", "林小满活动记录")}</div>` : "";
      systemFrame("RESIDENT STORY DATABASE 1.9", `<article class="resident-card"><div class="record-head"><span>${x.id}</span><b>居民故事摘要</b></div><h1>${esc(x.name)}</h1><h2>${esc(x.role)}</h2><p>${esc(x.bio)}</p><blockquote>${esc(x.quote)}</blockquote>${links}<table><tr><th>公开状态</th><td>摘要公开</td></tr><tr><th>原始材料</th><td>馆内申请阅览</td></tr><tr><th>最近复核</th><td>2016-05-12</td></tr></table></article>`, [["residents.html", "返回列表"], ["archive.html", "旧资料首页"]]);
      return;
    }
    G.visit("residents");
    const q = qs("q").trim(), list = D.residents.filter((x) => !q || `${x.id}${x.name}${x.role}${x.bio}`.includes(q));
    systemFrame("RESIDENT STORY DATABASE 1.9", `<section class="system-section"><h1>居民故事数据库</h1><form id="residentSearch" class="system-search"><label>姓名、编号或职业 <input id="residentQ" value="${esc(q)}"></label><button>查询</button></form><p>当前权限显示18条摘要。这里保存的是口述史，不是人物评价。</p><table class="system-table"><thead><tr><th>编号</th><th>姓名</th><th>身份</th><th>摘要</th></tr></thead><tbody>${list.map((x) => `<tr><td>${x.id}</td><td><a href="residents.html?id=${x.id}">${esc(x.name)}</a></td><td>${esc(x.role)}</td><td>${esc(x.bio)}</td></tr>`).join("")}</tbody></table></section>`, [["archive.html", "档案首页"]]);
    $("#residentSearch").onsubmit = (e) => { e.preventDefault(); go(`residents.html?q=${encodeURIComponent($("#residentQ").value.trim())}`); };
  }
  function children() {
    G.visit("children:entry");
    if (!G.childAllowed()) {
      systemFrame("CHILD PROJECT DB 1.4", `<div class="source-gate"><h1>儿童活动数据库</h1><p>该系统只接受 BL-WEB-02 及后续工单建立的临时只读会话，不使用共用账号。</p><p>请从当前维护事项进入；公开活动回顾仍可自由浏览。</p><a href="admin.html?view=work&id=${G.currentTicket()}">返回当前工单</a></div>`, [["education.html?view=future2016", "公开活动页"]]);
      return;
    }
    const id = qs("id"), x = D.children.find((c) => c.id === id);
    if (x) {
      G.visit(`child:${id}`);
      const isX = x.name === "林小满";
      const art = { "K-2016-004": "xiaoman-city.webp", "K-2016-008": "xiaoman-people.webp", "K-2016-013": "xiaoman-future.webp", "K-2017-021": "xiaoman-bluehouse-back.webp" }[id];
      let detail = `<article class="child-record"><header><span>${x.id}</span><em>${esc(x.status)}</em></header><h1>${esc(x.work)}</h1><table><tr><th>参与者</th><td>${esc(x.name)}</td><th>年龄</th><td>${esc(x.age)}</td></tr><tr><th>活动</th><td colspan="3">给未来的人看 / 2016</td></tr><tr><th>公开状态</th><td colspan="3">${esc(x.status)}</td></tr></table>${isX && art ? img(art, "child-art", `${x.name}，${x.age}岁，${x.work}`) : `<div class="unscanned">扫描件未获公开授权，本页仅显示经过核对的著录信息。</div>`}`;
      if (id === "K-2016-004") detail += `<section class="paper-scan"><h2>教师观察记录</h2><p>${esc(D.xiaoman.teacher)}</p><p>她在画的背面写：“房子是蓝的，因为王叔说展厅关灯以后，蓝色最后才看不见。”</p></section>`;
      if (id === "K-2016-008") detail += `<section class="paper-scan"><h2>作文节选：《我认识的人》</h2>${D.xiaoman.essay.map((p) => `<p>${esc(p)}</p>`).join("")}<div class="cross-ref"><b>人物索引 / 外部旧资料服务器</b>${G.archiveAllowed() ? `<a class="system-handoff" href="residents.html?id=C-005">林慧 / 护士 ↗</a><a class="system-handoff" href="residents.html?id=C-006">王建国 / 展厅管理员 ↗</a><a class="system-handoff" href="residents.html?id=C-012">苏玉兰 / 教师 ↗</a>` : `<span>人物关联将在 BL-WEB-03 工单中建立。</span>`}</div></section>`;
      if (id === "K-2016-013") detail += `<section class="paper-scan restricted"><h2>未展出原因</h2><p>作品背面同时写有五名居民姓名，2016年整理时未完成逐项授权，因此只保留索引。</p><p>2017年补录备注：母亲来信希望蓝房子继续保留，孩子因治疗暂停活动。</p><blockquote>${esc(D.xiaoman.motherPublic)}</blockquote></section>`;
      detail += `<p><a href="children.html">返回活动记录</a></p></article>`;
      systemFrame("CHILD PROJECT DB 1.4", detail, [["children.html", "作品列表"], ["education.html?view=future2016", "公开活动页"]]);
      return;
    }
    G.visit("children:home");
    const q = qs("q").trim(), list = D.children.filter((x) => !q || `${x.id}${x.name}${x.work}${x.status}`.includes(q));
    const xCount = ["child:K-2016-004", "child:K-2016-008", "child:K-2016-013"].filter(G.has).length;
    const childHelp = xCount >= 2 && !G.has("child:K-2016-013") ? "同一参与者还有一条未展出索引。可以按姓名查询；未展出不等于文件丢失，也不等于允许公开。" : "活动数据库支持按参与者姓名、作品名或页面中出现的编号查询。未展出不等于允许公开。";
    systemFrame("CHILD PROJECT DB 1.4", `<section class="system-section"><h1>2016儿童城市项目</h1><div class="status-strip">PROJECT: FUTURE-2016　RECORDS: ${D.children.length}　ACCESS: READ ONLY</div><form id="childSearch" class="system-search"><label>姓名、作品或编号 <input id="childQ" value="${esc(q)}"></label><button>查询</button></form><table class="system-table"><thead><tr><th>编号</th><th>参与者</th><th>年龄</th><th>作品</th><th>状态</th></tr></thead><tbody>${list.map((x) => `<tr class="${x.status !== "公开" ? "restricted-row" : ""}"><td>${x.id}</td><td>${esc(x.name)}</td><td>${x.age}</td><td><a href="children.html?id=${x.id}">${esc(x.work)}</a></td><td>${esc(x.status)}</td></tr>`).join("")}</tbody></table><div class="system-help">${childHelp}</div></section>`, [["education.html?view=future2016", "公开活动页"]]);
    $("#childSearch").onsubmit = (e) => { e.preventDefault(); go(`children.html?q=${encodeURIComponent($("#childQ").value.trim())}`); };
  }
  function special() {
    if (!G.specialAllowed()) {
      const current = ticketById(G.currentTicket());
      const status = current ? `${current.id} · ${esc(current.title)}` : "先到维护工作台确认接班";
      const target = current ? `admin.html?view=work&id=${current.id}` : "admin.html";
      systemFrame("SPECIAL ARCHIVE GATE", `<div class="locked-record"><h1>D类特别保存档案</h1><p>特别档案只能由最终发布工单建立会话。这里没有可供猜测的独立账号。</p><p class="gate-status">当前应处理：${status}</p><a href="${target}">${current ? "返回当前工单" : "打开维护工作台"}</a></div>`, []);
      return;
    }
    G.visit("special:D-001");
    const x = D.special;
    systemFrame("SPECIAL PRESERVATION ARCHIVE 1.1", `<article class="dossier"><div class="dossier-cover"><span>特别保存档案</span><b>${x.id}</b><h1>${esc(x.title)}</h1><p>接收日期 ${x.received}　文件 ${x.count}项　原始介质：移动硬盘</p></div><div class="privacy-warning"><b>请先阅读授权状态</b><p>${esc(x.note)}</p></div>${img("xiaoman-desk.webp", "dossier-photo", "2016年活动记录：林小满在展厅工作桌前") }<h2>档案内容构成</h2><table class="system-table"><thead><tr><th>类别</th><th>数量</th><th>授权状态</th></tr></thead><tbody>${x.categories.map((r) => `<tr class="${r[2].includes("未见") || r[2].includes("要求") ? "alert-row" : ""}"><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table><section class="life-timeline"><h2>从公开记录能够确认的事</h2><article><time>2016</time><p>九岁的林小满参加“给未来的人看”，主动提交三幅画。她在作文里写下自己为什么画普通人。</p></article><article><time>2017</time><p>她因治疗停止参加活动，请母亲转告博物馆：蓝房子的画要替她留着。</p></article><article><time>2018-04-12</time><p>林小满因病去世，终年十一岁。10月22日，林慧把家庭硬盘交给馆方临时代存，资料随后被完整复制为D-001。</p></article><article><time>2019—2026</time><p>档案一直没有正式公开，也没有完成归还。网站保存着它，却没有解决它属于谁。</p></article></section><section class="mother-letter"><small>原始邮件 / 访问级别：限制</small><h2>林慧写给馆方的话</h2><p>${esc(D.xiaoman.motherPrivate)}</p><span>状态：2026年整理时仍标记“待回复”</span></section><section class="final-work"><h2>她自己交给未来的东西</h2>${img("xiaoman-future.webp", "final-art", "《给未来的人看》，林小满，9岁") }<blockquote>“如果没有人画下来，以后可能就没人知道他们以前是什么样。”</blockquote></section><section class="final-review"><h2>原始授权复核</h2><p>馆方已联系林慧。根据她的书面确认，三幅由小满主动提交给活动的作品继续公开；私人录音、日记、通信和家庭硬盘登记归还。</p><p>这不是一道选择题。临时助理只需按原始授权完成最后一次复核。</p><button id="finalizeReview" type="button">按原始授权范围完成复核</button></section></article>`, []);
    $("#finalizeReview").onclick = () => { G.completeTicket("BL-WEB-05"); S.endingComplete = true; G.save(); go("ending.html"); };
  }
  function ending() {
    if (!S.endingComplete) { go("special.html"); return; }
    G.visit("ending:complete");
    const e = D.ending;
    const works = [["xiaoman-city.webp", "《我的城市》"], ["xiaoman-people.webp", "《我认识的人》"], ["xiaoman-future.webp", "《给未来的人看》"]];
    const address = ["当你看到这段文字时，", "小满已经离开这个世界八年了。", "你没有见过她。", "你只知道她不吃葱，", "会因为别人动她的颜料生气，", "画画的时候，总把自己留在纸外。", "你没有听见她所有的声音，", "没有读完她所有的信，", "也没有得到她完整的一生。", "但一个人不必交出全部秘密，", "才能证明自己来过。", "她留给未来的，只有三幅画。", "你看到这里，已经足够。"];
    shell(`<a class="skip-link" href="#endingMain">跳到结局正文</a><main id="endingMain" class="ending-page" tabindex="-1"><header><small>白鹭市博物馆 · 网站公告存档</small><time>${e.date}</time><h1>${esc(e.notice)}</h1></header><section class="ending-update"><p>三个月后，2016年“孩子眼中的城市”旧图索引重新上线。</p><p>${esc(e.result)}</p></section><div class="ending-works">${works.map(([file, title]) => img(file, "ending-work", `${title}，林小满，2016年`, false)).join("")}</div><section class="mother-revision"><small>公开页文字校对 / 林慧</small><p>“${esc(e.motherNote)}”</p></section><section class="ending-address" id="endingAddress" aria-live="polite">${address.map((line, i) => `<p class="ending-line" style="--line:${i}">${esc(line)}</p>`).join("")}<button id="endingReveal" type="button">立即显示完整文字</button></section><div class="ending-closing">${img("xiaoman-future.webp", "ending-final-art", "《给未来的人看》，林小满，9岁，2016年", false)}<p>儿童展厅照常开放。</p><p>蓝房子仍挂在原来的位置。</p></div><footer><button id="restart">清除记录并重新开始</button></footer></main>`, { system: true });
    $("#endingReveal").onclick = () => { $("#endingAddress").classList.add("show-all"); $("#endingReveal").disabled = true; };
    $("#restart").onclick = () => { G.reset(); go("index.html"); };
  }
  function notfound() { shell(`<div class="not-found"><b>404</b><h1>页面没有找到</h1><p>旧页面可能已经迁移，或没有进入2016年新版索引。</p><a href="search.html">站内检索</a>　<a href="index.html?id=n04">查看迁移公告</a></div>`); }

  const routes = { home, museum, exhibitions, collections, memories, education, guestbook, service, search, admin, archive, residents, children, special, ending, notfound };
  if (page() === "home" && qs("id")) noticePage();
  else if (page() === "home" && qs("view") === "notices") noticeList();
  else (routes[page()] || notfound)();
})();
