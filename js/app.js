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
  };
  function img(file, cls = "content-photo", caption = "") {
    const alt = imageAlt[file] || caption || "馆藏图片";
    return `<figure class="archive-photo ${cls}"><a href="assets/images/${file}" target="_blank" rel="noopener"><img src="assets/images/${file}" alt="${esc(alt)}" loading="lazy"></a>${caption ? `<figcaption>${esc(caption)}</figcaption>` : ""}</figure>`;
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
    return `<div class="utility"><span>白鹭市文化和旅游局直属单位</span><span>今天是 2026年9月2日　星期三</span></div><header class="site-head"><div class="brand"><a href="index.html"><span class="egret">白鹭</span><b>${D.site.name}</b><small>${D.site.english}</small></a></div><div class="head-tools"><form id="headSearch"><label for="headQ">站内检索</label><input id="headQ" value="${esc(qs("q"))}" placeholder="请输入关键词"><button>搜索</button></form><span>中文　|　English</span></div></header><nav class="main-nav">${items.map(([u, t, p]) => `<a class="${page() === p ? "current" : ""}" href="${u}">${t}</a>`).join("")}</nav><div class="pathbar"><span>当前位置：</span><a href="index.html">首页</a><b> &gt; ${document.title.split(" - ")[0]}</b></div>`;
  }
  function footer() {
    return `<footer class="site-footer"><div><b>${D.site.name}</b><span>地址：${D.site.address}</span><span>电话：${D.site.phone}</span></div><div><a href="museum.html?view=contact">联系我们</a><a href="admin.html">网站维护</a><button id="soundToggle" type="button">网页声音：${S.sound ? "开" : "关"}</button><button id="resetSite" type="button">清除本机记录</button></div><p>© 2008-2026 白鹭市博物馆　网站最后改版：2016-05-08　访问人数 ${D.site.counter}</p></footer>`;
  }
  function shell(content, options = {}) {
    document.body.className = options.system ? "system-page" : "museum-site";
    $("#app").innerHTML = options.system ? content : `<div class="site-wrap">${nav()}<main class="site-main">${content}</main>${footer()}</div>`;
    bindCommon();
  }
  function bindCommon() {
    const search = $("#headSearch");
    if (search) search.onsubmit = (e) => { e.preventDefault(); const q = $("#headQ").value.trim(); if (q) go(`search.html?q=${encodeURIComponent(q)}`); };
    const sound = $("#soundToggle");
    if (sound) sound.onclick = () => { S.sound = !S.sound; G.save(); location.reload(); };
    const reset = $("#resetSite");
    if (reset) reset.onclick = () => { if (confirm("清除本设备上的整理记录并重新开始？")) { G.reset(); go("index.html"); } };
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
    shell(`<section class="home-grid"><div class="home-main"><div class="banner">${img("museum-exterior.webp", "home-banner")}<div><b>保存城市变化　记录生活痕迹</b><span>白鹭市博物馆建馆30周年</span></div></div><div class="section-head"><h2>最新消息</h2><a href="index.html?view=notices">更多 &gt;&gt;</a></div><ul class="notice-list">${top.map((n) => `<li><span>[${esc(n.type)}]</span><a href="index.html?id=${n.id}">${esc(n.title)}</a><time>${n.date}</time></li>`).join("")}</ul><div class="home-columns"><section><div class="section-head"><h2>正在展出</h2><a href="exhibitions.html">全部展览</a></div>${D.exhibitions.slice(0, 3).map((e) => `<a class="picture-news" href="exhibitions.html?id=${e.id}">${img(e.image, "thumb-photo")}<span><b>${esc(e.title)}</b><small>${esc(e.desc)}</small></span></a>`).join("")}</section><section><div class="section-head"><h2>城市记忆</h2><a href="memories.html">进入栏目</a></div>${D.memories.slice(0, 5).map((m) => `<a class="text-news" href="memories.html?id=${m.id}"><b>${esc(m.title)}</b><small>${esc(m.person)} · ${esc(m.year)}</small></a>`).join("")}</section></div></div><aside class="home-side"><div class="quick"><h2>快速入口</h2><a href="collections.html">馆藏资料检索</a><a href="education.html">学校与儿童活动</a><a href="service.html">开放时间与预约</a><a href="guestbook.html">游客留言</a></div><div class="opening"><h2>今日开放</h2><b>09:00—17:00</b><span>16:30停止入馆</span><p>周一闭馆（节假日除外）</p></div><div class="anniversary"><span>1996—2026</span><b>建馆三十周年</b><p>数字资料整理计划正在进行</p><a href="index.html?id=n01">查看公告</a></div><div class="counter">网站访问人数：<b>${D.site.counter}</b></div></aside></section>`);
  }
  function noticePage() {
    const id = qs("id"), n = D.notices.find((x) => x.id === id);
    if (!n) { noticeList(); return; }
    G.visit(`notice:${id}`);
    shell(`<div class="two-col">${side("公告信息", [["index.html?view=notices", "全部公告"], ["index.html?id=n01", "整理计划"], ["index.html?id=n04", "服务器迁移"], ["index.html?id=n09", "图片异常"]])}<article class="article"><h1>${esc(n.title)}</h1><div class="article-meta">发布时间：${n.date}　来源：${esc(n.type)}　浏览：${318 + Number(id.slice(1)) * 17}</div>${n.body.map((p) => `<p>${esc(p)}</p>`).join("")}${id === "n04" ? `<div class="old-notice"><b>旧站启用资料</b><p>旧版网站于${D.site.anniversary}正式启用。纪念光盘馆藏编号为 BL-2008-0058。</p><a href="archive.html">进入旧版资料管理系统</a></div>` : ""}<p class="article-back"><a href="index.html?view=notices">返回公告列表</a></p></article></div>`);
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
      shell(`<div class="two-col">${side("展览活动", [["exhibitions.html", "全部展览"], ["exhibitions.html?id=e01", "正在展出"], ["exhibitions.html?id=e03", "教育展览"], ["exhibitions.html?id=e05", "线上展览"]])}<article class="article exhibition-detail"><h1>${esc(x.title)}</h1><div class="article-meta">展览年份：${x.year}　状态：${esc(x.status)}</div>${img(x.image, "article-photo", `${x.year}年展览资料图`)}<p>${esc(x.desc)}</p>${isChild ? `<div class="broken-index"><b>旧图索引状态：部分路径失效</b><p>本页原有48张作品图，现显示12张。原始图片仍在2016年服务器，具体迁移方式见网站维护公告。</p><a href="index.html?id=n04">查看《2016年旧服务器迁移与只读访问说明》</a></div><h2>展览说明</h2><p>孩子们先访问老街、车站和博物馆，再画下“希望未来还能看见的城市”。公开作品中包括林小满的《我的城市》。</p><a class="text-button" href="education.html?view=future2016">查看活动回顾</a>` : `<h2>策展说明</h2><p>展览资料来自公开征集、授权复制和馆藏数字化。个别家庭资料只展示获得许可的部分。</p>`}</article></div>`);
      return;
    }
    G.visit("exhibitions");
    shell(`<div class="two-col">${side("展览活动", [["exhibitions.html", "全部展览"], ["exhibitions.html?id=e01", "正在展出"], ["exhibitions.html?id=e03", "教育展览"], ["exhibitions.html?id=e05", "线上展览"]])}<section class="listing"><h1>展览活动</h1><div class="exhibition-list">${D.exhibitions.map((e) => `<a href="exhibitions.html?id=${e.id}">${img(e.image, "exhibit-thumb")}<span><small>${e.year} · ${esc(e.status)}</small><b>${esc(e.title)}</b><p>${esc(e.desc)}</p>${e.broken ? `<em>部分旧图无法显示</em>` : ""}</span></a>`).join("")}</div></section></div>`);
  }
  function collections() {
    const id = qs("id"), x = D.collections.find((c) => c.id === id);
    if (x) {
      G.visit(`collection:${id}`);
      const child = x.type === "儿童作品";
      const art = x.id.endsWith("224") ? "xiaoman-city.webp" : x.id.endsWith("225") ? "xiaoman-people.webp" : "xiaoman-future.webp";
      shell(`<div class="two-col">${side("馆藏资料", [["collections.html", "馆藏检索"], ["collections.html?type=器物", "器物"], ["collections.html?type=照片", "照片"], ["collections.html?type=儿童作品", "儿童作品"]])}<article class="catalog-card"><div class="catalog-stamp">馆藏登记卡</div><h1>${esc(x.name)}</h1>${child ? img(art, "object-photo", `馆藏编号 ${x.id}`) : img("collection-table.webp", "object-photo", "普通居民捐赠物资料图")}<table><tr><th>馆藏编号</th><td>${x.id}</td></tr><tr><th>年代</th><td>${x.year}</td></tr><tr><th>类别</th><td>${esc(x.type)}</td></tr><tr><th>著录说明</th><td>${esc(x.desc)}</td></tr><tr><th>公开范围</th><td>${x.id.endsWith("226") ? "仅显示索引，原件未公开" : "馆内及网站展示"}</td></tr></table>${child ? `<p><a href="education.html?view=future2016">进入相关教育活动</a></p>` : ""}</article></div>`);
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
      shell(`<div class="two-col">${menu}<article class="article education-poster"><div class="poster-year">2016</div><h1>给未来的人看</h1><p class="poster-en">FOR THE FUTURE · CHILDREN'S CITY PROJECT</p>${img("children-gallery.webp", "article-photo", "2016年儿童作品展厅") }<p>活动邀请孩子访问白鹭旧城、公交站、居民店铺和博物馆，并用水彩记录“希望未来还能看见的人和地方”。</p><table class="info-table"><tr><th>活动时间</th><td>2016年5月—7月</td></tr><tr><th>合作学校</th><td>南桥小学等5所学校</td></tr><tr><th>展览名称</th><td>孩子眼中的城市</td></tr><tr><th>资料代号</th><td>FUTURE / 2016</td></tr></table><div class="archive-entry"><b>旧活动资料</b><p>部分作品仍在旧版儿童活动数据库。迁移记录显示只读账号为 child_project，活动代号沿用英文名称与举办年份。</p><a href="children.html">进入儿童活动数据库</a></div></article></div>`);
    } else {
      shell(`<div class="two-col">${menu}<section class="listing"><h1>教育推广</h1><div class="education-hero">${img("children-gallery.webp", "wide-photo")}<div><h2>让孩子用自己的眼睛记录城市</h2><p>本馆面向学校和家庭开展城市观察、口述史、水彩记录与藏品体验活动。</p></div></div><h2 class="subhead">近期与往期项目</h2><table class="event-table"><tr><th>2026</th><td><b>三十周年小小档案员</b><p>学习给家庭旧物编写一张完整登记卡。</p></td></tr><tr><th>2024</th><td><b>消失街道门牌拓印</b><p>从旧地图寻找已经改变的街巷。</p></td></tr><tr><th>2019</th><td><b>听见家里的声音</b><p>在家长许可下记录一段家庭声音。</p></td></tr><tr><th>2016</th><td><a href="education.html?view=future2016"><b>给未来的人看</b></a><p>儿童城市观察与水彩项目。</p></td></tr></table></section></div>`);
    }
  }
  function guestbook() {
    G.visit("guestbook");
    const p = Math.max(1, Math.min(5, Number(qs("p")) || 1));
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
    shell(`<div class="legacy-system"><header><b>${esc(title)}</b><span>白鹭市博物馆 / 内部系统</span><em>${new Date().toISOString().slice(0, 10)}</em></header><nav>${navLinks.map(([u, t]) => `<a href="${u}">${esc(t)}</a>`).join("")}<a href="index.html">返回公开网站</a></nav><main>${content}</main><footer>本系统仅用于资料整理。所有读取操作均写入本机工作记录。</footer></div>`, { system: true });
  }
  function loginBox(system, label, accountHint, extra = "") {
    return `<div class="login-box"><h1>${esc(label)}</h1><p>${extra}</p><form id="loginForm"><label>账号<input id="loginAccount" value="${esc(accountHint)}" autocomplete="username"></label><label>密码<input id="loginPassword" type="password" autocomplete="current-password"></label><button>登录</button></form><div id="loginMsg" class="login-msg" aria-live="polite"></div><small>系统：${esc(system)}　连续输入错误不会锁定账号。</small></div>`;
  }
  async function authenticate(account, password) {
    const normalized = account.trim().toLowerCase();
    if (normalized === "old_admin") return { error: "该账号已于2021年停用。" };
    if (normalized === "admin2026") return { error: "账号不存在。" };
    if (normalized === "temp_staff24") {
      if (!S.staffReady) return { setup: true };
      const ok = (await G.hash(password)) === S.staffPassword;
      return ok ? { staff: true } : { error: "密码不正确。首次登录时设置的密码只保存在本设备。" };
    }
    const expected = D.auth[normalized];
    if (!expected) return { error: "账号不存在或不属于当前系统。" };
    const ok = (await G.hash(password)) === expected;
    return ok ? { [normalized]: true } : { error: "账号或密码不正确。请从网站公开资料核对，不需要查看网页源代码。" };
  }
  function admin() {
    G.visit("admin:entry");
    if (!S.staffReady) {
      systemFrame("BCM WEB MAINTENANCE 4.6", `<div class="onboarding"><h1>30周年数字资料整理计划</h1><p>临时员工账号已由人事系统建立。首次登录需填写姓名并设置本机密码。</p><form id="setupForm"><label>临时账号<input value="temp_staff24" disabled></label><label>整理助理姓名<input id="playerName" maxlength="12" required placeholder="请输入姓名"></label><label>设置本机密码<input id="staffPass" type="password" minlength="4" required></label><button>建立工作会话</button></form><div id="setupMsg" class="login-msg"></div><div class="paper-note"><b>权限说明</b><p>临时助理可以浏览公开网站管理记录、核对旧图索引和提出访问级别建议，不能修改原始文件。</p></div></div>`, []);
      $("#setupForm").onsubmit = async (e) => { e.preventDefault(); const name = $("#playerName").value.trim(), pass = $("#staffPass").value; if (!name || pass.length < 4) { $("#setupMsg").textContent = "请填写姓名，并设置至少4位本机密码。"; return; } S.playerName = name; S.staffPassword = await G.hash(pass); S.staffReady = true; G.save(); location.reload(); };
      return;
    }
    if (qs("view") === "login") {
      systemFrame("BCM ACCOUNT GATEWAY", loginBox("WEB/AUTH 2016", "其他系统账号登录", qs("account"), "用于测试账号与旧系统账号核对。账号来源应出现在维护记录或活动资料中。"), [["admin.html", "维护首页"]]);
      $("#loginForm").onsubmit = async (e) => { e.preventDefault(); const result = await authenticate($("#loginAccount").value, $("#loginPassword").value); if (result.test_user) { S.testAccess = true; G.save(); go("admin.html?view=test"); } else if (result.archive_guest) { S.archiveAccess = true; G.save(); go("archive.html"); } else if (result.child_project) { S.childAccess = true; G.save(); go("children.html"); } else $("#loginMsg").textContent = result.error || "该账号不能用于此入口。"; };
      return;
    }
    if (qs("view") === "test") {
      if (!S.testAccess) { go("admin.html?view=login&account=test_user"); return; }
      G.visit("admin:test");
      systemFrame("BCM WEB TEST CONSOLE", `<section class="system-section"><h1>测试留言与上传记录</h1><div class="status-strip">账号 test_user　权限 TEST / READ ONLY　记录 ${D.testMessages.length}</div><table class="system-table"><thead><tr><th>ID</th><th>测试内容</th><th>状态</th></tr></thead><tbody>${D.testMessages.map((x) => `<tr><td>${x[0]}</td><td>${esc(x[1])}</td><td>PASS</td></tr>`).join("")}</tbody></table><p class="system-help">测试记录中的校验串、馆藏号和音频编号不是登录密码。</p></section>`, [["admin.html", "维护首页"], ["archive.html", "旧资料"]]);
      return;
    }
    G.visit("admin:dashboard");
    const ready = G.archiveReady();
    systemFrame("BCM WEB MAINTENANCE 4.6", `<div class="system-dashboard"><aside><b>${esc(S.playerName)} / 临时助理</b><span>权限：READ / REVIEW</span><a class="active" href="admin.html">工作首页</a><a href="admin.html?view=messages">留言状态</a><a href="archive.html">旧资料核对</a><a href="admin.html?view=login">其他账号登录</a></aside><section><h1>数字资料整理工作台</h1><div class="status-strip">网站状态：正常　旧图索引：17项待核　特别档案：${ready ? "可提出公开级别建议" : "交叉索引未完成"}</div><h2>本期工作说明</h2><p>请核对2016年前后旧资料的图片路径、人物索引和公开范围。资料之间存在引用时，应阅读原始记录，不要只根据标题判断。</p><table class="system-table"><thead><tr><th>区域</th><th>说明</th><th>入口</th></tr></thead><tbody><tr><td>公开网站</td><td>公告、展览、馆藏、留言与教育活动</td><td><a href="index.html">查看</a></td></tr><tr><td>旧版资料</td><td>2016年前图片索引与居民故事</td><td><a href="archive.html">核对</a></td></tr><tr><td>儿童项目</td><td>旧活动作品与参与者记录</td><td><a href="children.html">核对</a></td></tr>${ready ? `<tr class="alert-row"><td>D-001</td><td>特别保存档案公开范围待建议</td><td><a href="special.html">打开</a></td></tr>` : ""}</tbody></table><h2>最近维护记录</h2><ul class="system-log"><li>2026-07-21 临时整理权限启用</li><li>2026-07-18 e03展览旧图路径仍指向 /legacy/image</li><li>2026-07-09 留言 G-0050 被标记为待审核</li><li>2026-06-30 旧服务器只读状态确认</li></ul></section></div>`, [["admin.html", "工作台"], ["archive.html", "旧资料"], ["admin.html?view=login", "账号入口"]]);
  }
  function archive() {
    G.visit("archive:entry");
    if (!S.archiveAccess) {
      systemFrame("BCM ARCHIVE MANAGER 2.8", loginBox("LEGACY/ARCHIVE", "旧版资料管理系统", "archive_guest", "账号见2016服务器迁移公告。密码由旧站启用纪念日月日与系统名组成。"), [["index.html?id=n04", "迁移公告"]]);
      $("#loginForm").onsubmit = async (e) => { e.preventDefault(); const result = await authenticate($("#loginAccount").value, $("#loginPassword").value); if (result.archive_guest) { S.archiveAccess = true; G.save(); location.reload(); } else { const n = G.fail("archive"); $("#loginMsg").innerHTML = `${esc(result.error || "登录失败")}${n >= 2 ? `<small>提示：旧站于2008年5月8日启用，密码格式为 MMDD + museum。</small>` : ""}`; } };
      return;
    }
    if (qs("view") === "debates") {
      G.visit("debates");
      systemFrame("BCM ARCHIVE MANAGER 2.8", `<section class="system-section"><h1>访问范围复核记录 / D类</h1><div class="warning-strip">本页不是捐赠协议。内部意见不能替代资料提供者授权。</div>${D.debates.map((x) => `<article class="debate"><header><b>${esc(x.by)}</b><time>${x.date}</time></header><h2>${esc(x.title)}</h2><p>${esc(x.text)}</p></article>`).join("")}<p><a href="archive.html">返回旧资料首页</a></p></section>`, [["archive.html", "档案首页"], ["residents.html", "居民故事"], ["children.html", "儿童项目"]]);
      return;
    }
    G.visit("archive:home");
    const ready = G.archiveReady();
    systemFrame("BCM ARCHIVE MANAGER 2.8", `<section class="system-section"><h1>旧版资料索引</h1><div class="status-strip">SERVER: BCM-LEGACY-01　MODE: READ ONLY　LAST MIGRATION: 2016-05-12</div><div class="system-modules"><a href="residents.html"><b>居民故事数据库</b><span>18条公开摘要 / 旧编号 C</span></a><a href="children.html"><b>儿童活动数据库</b><span>需要独立项目账号</span></a><a href="archive.html?view=debates"><b>访问范围复核记录</b><span>D类内部意见 / 只读</span></a><a href="admin.html?view=login&account=test_user"><b>网站测试记录</b><span>测试账号由迁移维护人员使用</span></a></div><h2>服务器迁移记录</h2><table class="system-table"><thead><tr><th>日期</th><th>内容</th></tr></thead><tbody>${D.migrationLogs.map((x) => `<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join("")}</tbody></table>${ready ? `<div class="dossier-ready"><b>D-001索引关联完成</b><p>居民、教育活动和访问范围记录已经形成完整交叉引用。临时助理可以提出公开级别建议。</p><a href="special.html">打开特别保存档案 D-001</a></div>` : `<div class="index-note"><b>索引说明</b><p>D类档案不会出现在普通搜索结果中。只有当居民、儿童作品和访问范围记录形成可核对的交叉引用时，系统才显示对应条目。</p></div>`}</section>`, [["admin.html", "维护工作台"], ["residents.html", "居民故事"], ["children.html", "儿童项目"], ["archive.html?view=debates", "复核记录"]]);
  }
  function residents() {
    if (!S.archiveAccess) { go("archive.html"); return; }
    const id = qs("id"), x = D.residents.find((r) => r.id === id);
    if (x) {
      G.visit(`resident:${id}`);
      const links = id === "C-005" ? `<div class="cross-ref"><b>关联资料</b><a href="memories.html?id=m04">医院夜班窗户（公开摘要）</a><a href="children.html?id=K-2016-008">儿童作品中的护士形象</a></div>` : id === "C-012" ? `<div class="cross-ref"><b>关联资料</b><a href="education.html?view=future2016">2016活动回顾</a><a href="children.html?id=K-2016-004">林小满活动记录</a></div>` : "";
      systemFrame("RESIDENT STORY DATABASE 1.9", `<article class="resident-card"><div class="record-head"><span>${x.id}</span><b>居民故事摘要</b></div><h1>${esc(x.name)}</h1><h2>${esc(x.role)}</h2><p>${esc(x.bio)}</p><blockquote>${esc(x.quote)}</blockquote>${links}<table><tr><th>公开状态</th><td>摘要公开</td></tr><tr><th>原始材料</th><td>馆内申请阅览</td></tr><tr><th>最近复核</th><td>2016-05-12</td></tr></table></article>`, [["residents.html", "返回列表"], ["archive.html", "旧资料首页"]]);
      return;
    }
    G.visit("residents");
    const q = qs("q").trim(), list = D.residents.filter((x) => !q || `${x.id}${x.name}${x.role}${x.bio}`.includes(q));
    systemFrame("RESIDENT STORY DATABASE 1.9", `<section class="system-section"><h1>居民故事数据库</h1><form id="residentSearch" class="system-search"><label>姓名、编号或职业 <input id="residentQ" value="${esc(q)}"></label><button>查询</button></form><p>当前权限显示18条摘要。这里保存的是口述史，不是人物评价。</p><table class="system-table"><thead><tr><th>编号</th><th>姓名</th><th>身份</th><th>摘要</th></tr></thead><tbody>${list.map((x) => `<tr><td>${x.id}</td><td><a href="residents.html?id=${x.id}">${esc(x.name)}</a></td><td>${esc(x.role)}</td><td>${esc(x.bio)}</td></tr>`).join("")}</tbody></table></section>`, [["archive.html", "档案首页"], ["children.html", "儿童项目"]]);
    $("#residentSearch").onsubmit = (e) => { e.preventDefault(); go(`residents.html?q=${encodeURIComponent($("#residentQ").value.trim())}`); };
  }
  function children() {
    G.visit("children:entry");
    if (!S.childAccess) {
      systemFrame("CHILD PROJECT DB 1.4", loginBox("EDU/CHILD-2016", "儿童活动数据库", "child_project", "账号见旧服务器迁移记录。密码由活动英文名与举办年份组成。"), [["education.html?view=future2016", "活动回顾"], ["archive.html", "旧资料"]]);
      $("#loginForm").onsubmit = async (e) => { e.preventDefault(); const result = await authenticate($("#loginAccount").value, $("#loginPassword").value); if (result.child_project) { S.childAccess = true; G.save(); location.reload(); } else { const n = G.fail("child"); $("#loginMsg").innerHTML = `${esc(result.error || "登录失败")}${n >= 2 ? `<small>提示：活动英文代号为 FUTURE，举办年份为2016，全部小写。</small>` : ""}`; } };
      return;
    }
    const id = qs("id"), x = D.children.find((c) => c.id === id);
    if (x) {
      G.visit(`child:${id}`);
      const isX = x.name === "林小满";
      const art = id === "K-2016-004" ? "xiaoman-city.webp" : id === "K-2016-008" ? "xiaoman-people.webp" : "xiaoman-future.webp";
      let detail = `<article class="child-record"><header><span>${x.id}</span><em>${esc(x.status)}</em></header><h1>${esc(x.work)}</h1><table><tr><th>参与者</th><td>${esc(x.name)}</td><th>年龄</th><td>${esc(x.age)}</td></tr><tr><th>活动</th><td colspan="3">给未来的人看 / 2016</td></tr><tr><th>公开状态</th><td colspan="3">${esc(x.status)}</td></tr></table>${isX ? img(art, "child-art", `${x.name}，${x.age}岁，${x.work}`) : `<div class="unscanned">普通作品扫描件未纳入本次演示缓存，著录信息完整。</div>`}`;
      if (id === "K-2016-004") detail += `<section class="paper-scan"><h2>教师观察记录</h2><p>${esc(D.xiaoman.teacher)}</p><p>她在画的背面写：“房子是蓝的，因为王叔说展厅关灯以后，蓝色最后才看不见。”</p></section>`;
      if (id === "K-2016-008") detail += `<section class="paper-scan"><h2>作文节选：《我认识的人》</h2>${D.xiaoman.essay.map((p) => `<p>${esc(p)}</p>`).join("")}<div class="cross-ref"><b>人物索引</b><a href="residents.html?id=C-005">林慧 / 护士</a><a href="residents.html?id=C-006">王建国 / 展厅管理员</a><a href="residents.html?id=C-012">苏玉兰 / 教师</a></div></section>`;
      if (id === "K-2016-013") detail += `<section class="paper-scan restricted"><h2>未展出原因</h2><p>作品背面同时写有五名居民姓名，2016年整理时未完成逐项授权，因此只保留索引。</p><p>2017年补录备注：母亲来信希望蓝房子继续保留，孩子因治疗暂停活动。</p><blockquote>${esc(D.xiaoman.motherPublic)}</blockquote></section>`;
      detail += `<p><a href="children.html">返回活动记录</a></p></article>`;
      systemFrame("CHILD PROJECT DB 1.4", detail, [["children.html", "作品列表"], ["education.html?view=future2016", "公开活动页"], ["archive.html", "旧资料"]]);
      return;
    }
    G.visit("children:home");
    const q = qs("q").trim(), list = D.children.filter((x) => !q || `${x.id}${x.name}${x.work}${x.status}`.includes(q));
    systemFrame("CHILD PROJECT DB 1.4", `<section class="system-section"><h1>2016儿童城市项目</h1><div class="status-strip">PROJECT: FUTURE-2016　RECORDS: ${D.children.length}　ACCESS: READ ONLY</div><form id="childSearch" class="system-search"><label>姓名、作品或编号 <input id="childQ" value="${esc(q)}"></label><button>查询</button></form><table class="system-table"><thead><tr><th>编号</th><th>参与者</th><th>年龄</th><th>作品</th><th>状态</th></tr></thead><tbody>${list.map((x) => `<tr class="${x.status !== "公开" ? "restricted-row" : ""}"><td>${x.id}</td><td>${esc(x.name)}</td><td>${x.age}</td><td><a href="children.html?id=${x.id}">${esc(x.work)}</a></td><td>${esc(x.status)}</td></tr>`).join("")}</tbody></table><div class="system-help">活动数据库记录所有参与者。未展出不等于文件丢失，也不等于允许公开。</div></section>`, [["archive.html", "档案首页"], ["education.html?view=future2016", "公开活动页"]]);
    $("#childSearch").onsubmit = (e) => { e.preventDefault(); go(`children.html?q=${encodeURIComponent($("#childQ").value.trim())}`); };
  }
  function special() {
    if (!S.archiveAccess || !S.childAccess || !G.archiveReady()) {
      systemFrame("SPECIAL ARCHIVE GATE", `<div class="locked-record"><h1>D类特别保存档案</h1><p>当前交叉索引不足，系统不能确认你已经阅读相关居民、儿童作品和访问范围记录。</p><p>请从旧资料首页继续核对原始记录。</p><a href="archive.html">返回旧版资料管理系统</a></div>`, [["archive.html", "档案首页"]]);
      return;
    }
    G.visit("special:D-001");
    const x = D.special;
    systemFrame("SPECIAL PRESERVATION ARCHIVE 1.1", `<article class="dossier"><div class="dossier-cover"><span>特别保存档案</span><b>${x.id}</b><h1>${esc(x.title)}</h1><p>接收日期 ${x.received}　文件 ${x.count}项　原始介质：移动硬盘</p></div><div class="privacy-warning"><b>请先阅读授权状态</b><p>${esc(x.note)}</p></div>${img("xiaoman-desk.webp", "dossier-photo", "2016年活动记录：林小满在展厅工作桌前") }<h2>档案内容构成</h2><table class="system-table"><thead><tr><th>类别</th><th>数量</th><th>授权状态</th></tr></thead><tbody>${x.categories.map((r) => `<tr class="${r[2].includes("未见") || r[2].includes("要求") ? "alert-row" : ""}"><td>${esc(r[0])}</td><td>${r[1]}</td><td>${esc(r[2])}</td></tr>`).join("")}</tbody></table><section class="life-timeline"><h2>从公开记录能够确认的事</h2><article><time>2016</time><p>九岁的林小满参加“给未来的人看”，主动提交三幅画。她在作文里写下自己为什么画普通人。</p></article><article><time>2017</time><p>她因治疗停止参加活动，请母亲转告博物馆：蓝房子的画要替她留着。</p></article><article><time>2018</time><p>林小满离开后，林慧把家庭硬盘交给馆方临时代存。资料被完整复制为D-001。</p></article><article><time>2019—2026</time><p>档案一直没有正式公开，也没有完成归还。网站保存着它，却没有解决它属于谁。</p></article></section><section class="mother-letter"><small>原始邮件 / 访问级别：限制</small><h2>林慧写给馆方的话</h2><p>${esc(D.xiaoman.motherPrivate)}</p><span>状态：2026年整理时仍标记“待回复”</span></section><section class="final-work"><h2>她自己交给未来的东西</h2>${img("xiaoman-future.webp", "final-art", "《给未来的人看》，林小满，9岁") }<blockquote>“如果没有人画下来，以后可能就没人知道他们以前是什么样。”</blockquote></section><section class="access-choice"><h2>访问级别建议</h2><p>临时助理不能删除原件。你的建议会决定30周年数字展如何处理D-001。</p><div><button data-ending="limited"><b>只公开她主动提交的作品</b><span>保留三幅画、活动说明与必要姓名索引；其余资料归还家属。</span></button><button data-ending="public"><b>公开完整人生档案</b><span>公开D-001全部内容，并对私人材料做基础遮盖。</span></button><button data-ending="closed"><b>关闭整份特别档案</b><span>不公开姓名与家庭材料，只保留无名作品登记。</span></button></div></section></article>`, [["archive.html", "档案首页"], ["archive.html?view=debates", "复核意见"], ["children.html?id=K-2016-013", "作品记录"]]);
    $$('[data-ending]').forEach((button) => button.onclick = () => { S.ending = button.dataset.ending; G.save(); go("ending.html"); });
  }
  function ending() {
    const e = D.endings[S.ending];
    if (!e) { go("special.html"); return; }
    G.visit(`ending:${S.ending}`);
    const isLimited = S.ending === "limited";
    shell(`<div class="ending-page"><header><small>白鹭市博物馆 · 30周年数字资料整理计划</small><h1>${esc(e.title)}</h1></header>${img("xiaoman-future.webp", "ending-art", "《给未来的人看》，林小满，9岁") }<section><p>${esc(e.lead)}</p><hr><p>${esc(e.after)}</p><p>${esc(e.last)}</p></section><div class="ending-quote"><p>总有一天，我们都会被遗忘。</p><p>但一个人被记住，不应该以失去所有秘密为代价。</p><span>${isLimited ? "档案 D-001：部分公开 / 私人材料归还" : S.ending === "public" ? "档案 D-001：公开后撤回" : "档案 D-001：限制访问"}</span></div><div class="child-note">谢谢你来看我的画。</div><footer><button id="reconsider">重新提出访问建议</button><button id="restart">清除记录并重新开始</button></footer></div>`, { system: true });
    $("#reconsider").onclick = () => { S.ending = ""; G.save(); go("special.html"); };
    $("#restart").onclick = () => { G.reset(); go("index.html"); };
  }
  function notfound() { shell(`<div class="not-found"><b>404</b><h1>页面没有找到</h1><p>旧页面可能已经迁移，或没有进入2016年新版索引。</p><a href="search.html">站内检索</a>　<a href="index.html?id=n04">查看迁移公告</a></div>`); }

  const routes = { home, museum, exhibitions, collections, memories, education, guestbook, service, search, admin, archive, residents, children, special, ending, notfound };
  if (page() === "home" && qs("id")) noticePage();
  else if (page() === "home" && qs("view") === "notices") noticeList();
  else (routes[page()] || notfound)();
})();
