const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LOCALE = "en-IN";

const io = "IntersectionObserver" in window ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0, rootMargin: "0px 0px -10% 0px" }) : null;
$$(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

const YAC_HOST = { "yac-crm": "crm.yac", "yac-stays": "stays.yac", "yac-tunes": "tunes.yac", "yac-canvas": "canvas.yac" };
const base = location.hostname.split(".").slice(1).join(".");
$$("[data-site]").forEach((a) => {
  a.href = base && location.hostname.includes(".") && !/^\d+$/.test(location.hostname.split(".")[0]) ? `${location.protocol}//${YAC_HOST[a.dataset.site] || a.dataset.site}.${base}/` : "#";
});

$$(".switchband").forEach((b) => {
  const flip = () => b.setAttribute("aria-checked", b.getAttribute("aria-checked") === "true" ? "false" : "true");
  b.addEventListener("click", flip);
});

const demos = {
  soroban(root) {
    const amt = $("#amt", root), out = $("#out", root), dt = $("#dt", root), loc = $("#loc", root);
    const render = () => {
      const v = Number(amt.value);
      const cur = `₹${Math.abs(Number.isFinite(v) ? v : 0).toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      out.textContent = cur;
      const d = new Date(dt.value);
      $("#date-out", root).textContent = Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(LOCALE, { day: "numeric", month: "short", year: "numeric" });
      $("#naive", root).textContent = `₹${Number.isFinite(v) ? v : 0}`;
      $("#us", root).textContent = `$${Math.abs(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
    };
    [amt, dt].forEach((i) => i.addEventListener("input", render));
    render();
  },
  inkan(root) {
    const log = $("#log", root), tok = $("#tok", root);
    let access = 0, used = false, code = "";
    const say = (t, cls = "") => { const d = document.createElement("div"); d.innerHTML = cls ? `<span class="${cls}">${t}</span>` : t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    const rand = () => Math.random().toString(36).slice(2, 10);
    const sync = () => { tok.textContent = access > Date.now() ? `access token valid for ${Math.ceil((access - Date.now()) / 1000)}s` : "access token expired"; };
    setInterval(sync, 500);
    $("#signin", root).addEventListener("click", () => { access = Date.now() + 8000; log.innerHTML = ""; say("POST /auth/login → 200", "g"); say("tokens stored (access 8s for this demo, refresh long-lived)", "d"); sync(); });
    $("#call", root).addEventListener("click", () => {
      if (!access) return say("no tokens: user is signed out", "r");
      if (access > Date.now()) say("GET /api/me → 200", "g");
      else { say("GET /api/me → 401", "r"); say("refresh token sent once, shared by every waiting call", "d"); say("POST /auth/refresh → 200", "g"); access = Date.now() + 8000; say("GET /api/me retried → 200", "g"); sync(); }
    });
    $("#mint", root).addEventListener("click", () => {
      if (!access) return say("sign in first", "r");
      code = rand(); used = false;
      say(`POST /api/auth/handoff → one-time code`, "g");
      $("#url", root).textContent = `https://other-app.example/#mwHandoff=${code}`;
      say("URL carries a code that expires in a minute, never the tokens", "d");
    });
    $("#redeem", root).addEventListener("click", () => {
      if (!code) return say("mint a handoff first", "r");
      if (used) return say(`redeem ${code} → 400 already used`, "r");
      used = true; say(`redeem ${code} → 200, session continues in the other app`, "g");
    });
  },
  mimamori(root) {
    const out = $("#batch", root), size = $("#size", root);
    const buf = (() => { let events = []; const max = 20; const drain = () => { if (!events.length) return; const b = events; events = []; out.textContent = JSON.stringify({ app: "host", events: b.slice(-4) }, null, 2) + (b.length > 4 ? `\n… ${b.length} events in this batch` : ""); update(); }; return { add(e) { events.push(e); if (events.length >= max) drain(); update(); }, flush: drain, size: () => events.length }; })();
    function update() { size.textContent = `${buf.size()} of 20 in the buffer`; $("#fill", root).style.width = `${(buf.size() / 20) * 100}%`; }
    const ev = { error: () => ({ type: "error", message: "TypeError: x is undefined", t: Date.now() }), cls: () => ({ type: "web-vital", name: "CLS", value: +(Math.random() * 0.2).toFixed(3), t: Date.now() }), inp: () => ({ type: "web-vital", name: "INP", value: Math.round(80 + Math.random() * 180), t: Date.now() }), view: () => ({ type: "page_view", path: "/" + ["home", "pricing", "docs", "about"][Math.floor(Math.random() * 4)], t: Date.now() }) };
    $$("[data-ev]", root).forEach((b) => b.addEventListener("click", () => buf.add(ev[b.dataset.ev]())));
    $("#burst", root).addEventListener("click", () => { for (let i = 0; i < 20; i++) buf.add(ev[["error", "cls", "inp", "view"][i % 4]]()); });
    $("#hide", root).addEventListener("click", () => { if (!buf.size()) { out.textContent = "buffer empty: nothing is sent, so no empty beacons"; return; } buf.flush(); });
    update();
  },
  sysim(root) {
    const choices = [
      ["MD5 hash of long URL, take first 7 chars", 3, "Hash collisions at scale: two URLs can produce the same key. MD5 is deterministic, so no custom aliases either."],
      ["Auto-increment counter + Base62 encoding", 8, "Correct. A counter guarantees uniqueness. Base62 gives 62^7 = 3.5 trillion keys in 7 characters. Predictable, though."],
      ["Random 7-char alphanumeric string", 5, "Works, but without a database check there is no uniqueness guarantee. Better as a fallback for custom aliases."],
    ];
    const box = $("#choices", root), res = $("#result", root);
    choices.forEach(([label, score, why], i) => {
      const b = document.createElement("button");
      b.className = "act alt"; b.style.cssText = "display:block;width:100%;text-align:left;margin-top:8px";
      b.textContent = `${i + 1}. ${label}`;
      b.addEventListener("click", () => { res.innerHTML = `<b>${score}/10</b> · ${why}`; $$("button", box).forEach((x) => (x.className = "act alt")); b.className = "act"; });
      box.appendChild(b);
    });
  },
  notes(root) {
    const cv = $("canvas", root), ctx = cv.getContext("2d");
    let tool = "pen", paper = "ruled", drawing = false, last = null, strokes = [];
    const fit = () => { const r = cv.getBoundingClientRect(); const d = devicePixelRatio || 1; cv.width = r.width * d; cv.height = r.height * d; ctx.setTransform(d, 0, 0, d, 0, 0); redraw(); };
    const bg = () => { const w = cv.clientWidth, h = cv.clientHeight; ctx.fillStyle = paper === "dark" ? "#26241f" : paper === "yellow" ? "#f4ecb8" : "#fbfbf8"; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = paper === "dark" ? "#4a4740" : "#c9cdd6"; ctx.fillStyle = ctx.strokeStyle; ctx.lineWidth = 1; if (paper === "ruled" || paper === "yellow" || paper === "dark") for (let y = 40; y < h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } if (paper === "squared") { for (let y = 0; y < h; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } for (let x = 0; x < w; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); } } if (paper === "dotted") for (let y = 20; y < h; y += 28) for (let x = 20; x < w; x += 28) ctx.fillRect(x, y, 2, 2); };
    const stroke = (s) => { if (s.pts.length < 2) return; ctx.save(); ctx.lineCap = "round"; ctx.lineJoin = "round"; if (s.tool === "highlighter") { ctx.globalAlpha = 0.35; ctx.strokeStyle = "#e5d12a"; ctx.lineWidth = 16; } else { ctx.strokeStyle = paper === "dark" ? "#e8e8e3" : "#181715"; ctx.lineWidth = 2.4; } ctx.beginPath(); ctx.moveTo(s.pts[0][0], s.pts[0][1]); for (let i = 1; i < s.pts.length - 1; i++) { const mx = (s.pts[i][0] + s.pts[i + 1][0]) / 2, my = (s.pts[i][1] + s.pts[i + 1][1]) / 2; ctx.quadraticCurveTo(s.pts[i][0], s.pts[i][1], mx, my); } ctx.stroke(); ctx.restore(); };
    function redraw() { bg(); strokes.forEach(stroke); }
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    cv.addEventListener("pointerdown", (e) => { cv.setPointerCapture(e.pointerId); drawing = true; last = { tool, pts: [pos(e)] }; if (tool !== "eraser") strokes.push(last); else erase(pos(e)); });
    cv.addEventListener("pointermove", (e) => { if (!drawing) return; const p = pos(e); if (tool === "eraser") return erase(p); last.pts.push(p); redraw(); });
    const up = () => { drawing = false; }; cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    function erase([x, y]) { const n = strokes.length; strokes = strokes.filter((s) => !s.pts.some(([a, b]) => Math.hypot(a - x, b - y) < 14)); if (strokes.length !== n) redraw(); }
    $$("[data-tool]", root).forEach((b) => b.addEventListener("click", () => { tool = b.dataset.tool; $$("[data-tool]", root).forEach((x) => x.setAttribute("aria-pressed", x === b)); }));
    $$("[data-paper]", root).forEach((b) => b.addEventListener("click", () => { paper = b.dataset.paper; $$("[data-paper]", root).forEach((x) => x.setAttribute("aria-pressed", x === b)); redraw(); }));
    $("#undo", root).addEventListener("click", () => { strokes.pop(); redraw(); });
    $("#clear", root).addEventListener("click", () => { strokes = []; redraw(); });
    addEventListener("resize", fit); fit();
  },
  crm(root) {
    const deals = [["Northwind renewal", "Negotiation", 480000, "mine", "q"], ["Contoso pilot", "Prospecting", 120000, "mine", ""], ["Fabrikam platform", "Proposal", 950000, "", "q"], ["Litware upsell", "Qualification", 210000, "mine", ""], ["Adventure Works", "Closed won", 330000, "", "q"], ["Tailspin expansion", "Proposal", 640000, "mine", "q"]];
    const list = $("#deals", root), q = $("#q", root); let view = "all";
    const fmt = (n) => `₹${n.toLocaleString(LOCALE)}`;
    const render = () => { const t = q.value.toLowerCase(); list.innerHTML = ""; const rows = deals.filter((d) => (view === "all" || (view === "mine" && d[3]) || (view === "q" && d[4])) && d[0].toLowerCase().includes(t)); if (!rows.length) list.innerHTML = '<div class="small" style="padding:14px">No records match</div>'; rows.forEach((d) => { const r = document.createElement("div"); r.innerHTML = `<span><b>${d[0]}</b><br><span class="small">${d[1]}</span></span><span>${fmt(d[2])}</span>`; list.appendChild(r); }); $("#count", root).textContent = `${rows.length} records · ${fmt(rows.reduce((s, d) => s + d[2], 0))}`; };
    $$("[data-view]", root).forEach((b) => b.addEventListener("click", () => { view = b.dataset.view; $$("[data-view]", root).forEach((x) => x.setAttribute("aria-pressed", x === b)); render(); }));
    q.addEventListener("input", render); render();
  },
  meet(root) {
    const state = { mic: true, cam: true };
    const tile = $("#me", root), note = $("#mstate", root);
    const paint = () => { tile.style.opacity = state.cam ? 1 : .35; note.textContent = `${state.mic ? "Mic on" : "Mic muted"} · ${state.cam ? "Camera on" : "Camera off"}`; $("#mic", root).setAttribute("aria-pressed", state.mic); $("#cam", root).setAttribute("aria-pressed", state.cam); };
    $("#mic", root).addEventListener("click", () => { state.mic = !state.mic; paint(); });
    $("#cam", root).addEventListener("click", () => { state.cam = !state.cam; paint(); });
    const feed = $("#reactions", root);
    $$("[data-react]", root).forEach((b) => b.addEventListener("click", () => { const d = document.createElement("div"); d.textContent = `You: ${b.dataset.react}`; feed.prepend(d); while (feed.children.length > 4) feed.lastChild.remove(); }));
    paint();
  },
};
$$("[data-demo]").forEach((el) => demos[el.dataset.demo]?.(el));
