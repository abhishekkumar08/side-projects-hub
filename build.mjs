import { mkdirSync, rmSync, writeFileSync, copyFileSync, cpSync } from "node:fs";

const OUT = new URL("./out/", import.meta.url).pathname;
rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
copyFileSync(new URL("./site.css", import.meta.url), OUT + "site.css");
copyFileSync(new URL("./site.js", import.meta.url), OUT + "site.js");
cpSync(new URL("./img/", import.meta.url).pathname, OUT + "img", { recursive: true });

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

const head = (title, desc, root) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${desc}">
<link rel="preconnect" href="https://api.fontshare.com"><link rel="preconnect" href="https://cdn.fontshare.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=switzer@400,500,600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${root}site.css"></head><body>`;

const bar = (root, cls = "") => `<header class="bar ${cls}"><a class="mark" href="${root}">Side projects</a><nav><a class="link" href="${root}#projects">All projects</a><a class="btn quiet" href="https://github.com/abhishekkumar08">GitHub</a></nav></header>`;

const foot = (root) => `<footer class="close"><div class="links"><a class="btn" href="${root}">All projects</a><a class="btn quiet" href="https://github.com/abhishekkumar08">GitHub</a></div><div class="name">Abhishek Kumar</div><small>Built as a personal showcase. Every demo on these pages runs in your browser; nothing is sent anywhere.</small></footer><script src="${root}site.js"></script></body></html>`;

const row = (say, show, cls = "") => `<div class="row ${cls}"><div class="say reveal">${say}</div><div class="show reveal" style="transition-delay:.12s">${show}</div></div>`;
const say = (h, p) => `<h2>${h}</h2><p>${p}</p>`;
const ui = (inner, extra = "") => `<div data-ui ${extra}>${inner}</div>`;
const code = (s) => `<div data-ui class="onDark"><pre class="code">${s}</pre></div>`;
const list = (rows) => `<div class="list">${rows.map(([a, b]) => `<div><span>${a}</span><b>${b}</b></div>`).join("")}</div>`;

function page(p) {
  const root = "../";
  const html = `${head(p.title, p.lede, root)}
<div class="dark" style="background:var(--dark);color:var(--dark-ink)">${bar(root, "dark")}
<main><section class="hero wrap"><h1 class="reveal">${p.h1}</h1><p class="lede reveal" style="transition-delay:.08s">${p.lede}</p>
<div class="actions reveal" style="transition-delay:.16s"><a class="btn" href="#run">${p.cta}</a><a class="btn quiet" href="#how">${p.cta2 ?? "How it works"}</a></div>
<div class="stage reveal" style="transition-delay:.24s">${p.hero}</div></section></main></div>
${p.bands ?? ""}
<section class="band" id="how"><div class="wrap">${p.rows.join("")}</div></section>
${p.dark ? `<section class="band dark"><div class="wrap">${p.dark}</div></section>` : ""}
<section class="band soft" id="run"><div class="wrap"><div class="row"><div class="say reveal"><h2>${p.runTitle}</h2><p>${p.runText}</p></div><div class="show reveal" style="transition-delay:.12s">${code(p.run)}</div></div></div></section>
${foot(root)}`;
  mkdirSync(OUT + p.slug, { recursive: true });
  writeFileSync(OUT + p.slug + "/index.html", html);
}

const bands = (items) => `<section><h2 class="sr">What it does</h2>${items.map(([s, more, tone], i) => `<button class="switchband" role="switch" aria-checked="${i < 2}" style="--tone:${tone}"><span><p class="s">${s}</p><span class="more">${more}</span></span><span class="toggle" aria-hidden="true"></span></button>`).join("")}</section>`;

/* ---------- yac meet ---------- */
page({
  slug: "yac-meet", title: "yac meet", h1: "Meetings on your own Mac",
  lede: "Browser video meetings with a lobby, screen share, whiteboard, captions, recordings and host controls. The media server runs on your machine.",
  cta: "Run it locally",
  hero: ui(`<div class="pad"><div class="grid2"><div id="me" style="background:#181715;color:#e8e8e3;border-radius:12px;min-height:220px;display:flex;align-items:center;justify-content:center;transition:opacity .3s"><span class="big" style="color:#bfb21a">AK</span></div>
<div><label>Lobby preview</label><p class="big" style="font-size:1.6rem">Ready to join?</p><p class="small" id="mstate" style="margin:8px 0 16px"></p>
<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip" id="mic" aria-pressed="true">Microphone</button><button class="chip" id="cam" aria-pressed="true">Camera</button></div>
<p class="small" style="margin:18px 0 8px">Reactions</p><div style="display:flex;gap:8px;flex-wrap:wrap"><button class="chip" data-react="clap">Clap</button><button class="chip" data-react="raise hand">Raise hand</button><button class="chip" data-react="thumbs up">Thumbs up</button></div>
<div id="reactions" class="small" style="margin-top:14px;min-height:72px"></div></div></div></div>`, 'data-demo="meet"'),
  bands: bands([
    ["Start a meeting in one click", "Instant, scheduled and personal meetings. Guests join by link without an account.", "#bfb21a"],
    ["Check your camera before you join", "A lobby shows your camera and microphone preview first.", "#c9d5b8"],
    ["Share a screen or draw together", "Screen share and a shared whiteboard sit in the same call.", "#d9c4a6"],
    ["Read what was said", "Live captions during the call and recordings afterwards.", "#b8cfd0"],
    ["Run the room like a host", "Chat, polls, Q&A, reactions, breakout rooms and full host controls.", "#d6b8c4"],
  ]),
  rows: [
    row(say("Accounts for hosts, links for guests", "Creating and scheduling meetings needs an account. Joining does not: open the link in a second tab or browser."), ui(list([["Instant meeting", "no account for guests"], ["Scheduled meeting", "host account"], ["Personal meeting", "a link that stays yours"]]) .replace('class="list"', 'class="list pad"'))),
    row(say("Local by design", "Nothing is published. There is no remote, no outside media server, no TURN or STUN service and no analytics. An optional relay runs inside your own server for networks that block direct media."), ui(`<div class="pad">${list([["API and signalling", "127.0.0.1:3141"], ["Media server", "127.0.0.1:3144 (udp + tcp)"], ["The app", "http://127.0.0.1:3140"]])}</div>`), "flip"),
    row(say("Other devices on your Wi-Fi", "Browsers only allow the camera on localhost or HTTPS, so the LAN mode makes a self-signed certificate once and listens on your local network only."), code(`<span class="k">npm run</span> dev:lan\n<span class="d"># https://&lt;this-mac-ip&gt;:3140</span>\n<span class="d"># accept the certificate warning once per device</span>`)),
  ],
  runTitle: "Run it on your machine", runText: "This project is local only, so there is no public link. Clone, install and start it; the app opens on port 3140.",
  run: `<span class="k">npm</span> install\n<span class="k">npm run</span> dev\n<span class="d"># app          http://127.0.0.1:3140</span>\n<span class="d"># API + signal 127.0.0.1:3141</span>\n<span class="d"># media        127.0.0.1:3144</span>`,
});

/* ---------- yac notes ---------- */
page({
  slug: "yac-notes", title: "YAC Notes", h1: "Handwriting notes for Android",
  lede: "Notebooks with ruled, squared, dotted or blank paper, pens and a highlighter, PDF import and vector PDF export. Built with Expo and Skia.",
  cta: "Try the pen", cta2: "What is inside",
  hero: ui(`<div class="pad"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="chip" data-tool="pen" aria-pressed="true">Pen</button><button class="chip" data-tool="highlighter" aria-pressed="false">Highlighter</button><button class="chip" data-tool="eraser" aria-pressed="false">Eraser</button><span style="width:12px"></span><button class="chip" data-paper="ruled" aria-pressed="true">Ruled</button><button class="chip" data-paper="squared" aria-pressed="false">Squared</button><button class="chip" data-paper="dotted" aria-pressed="false">Dotted</button><button class="chip" data-paper="yellow" aria-pressed="false">Yellow</button><button class="chip" data-paper="dark" aria-pressed="false">Dark</button><button class="act alt" id="undo">Undo</button><button class="act alt" id="clear">Clear</button></div><div class="canvas-wrap"><canvas aria-label="Drawing pad: write with a pen, finger or mouse"></canvas></div><p class="small" style="margin-top:10px">This pad is a web sketch of the editor. The app itself draws with Skia and stylus pressure.</p></div>`, 'data-demo="notes"'),
  rows: [
    row(say("Ink that follows the stylus", "Fountain and ballpoint pens, a highlighter under the ink, a whole-stroke eraser, and a rectangle and freeform lasso. The palm is ignored while the pen hovers; fingers scroll once a stylus has been used."), ui(list([["Pens", "fountain, ballpoint"], ["Highlighter", "under the ink"], ["Eraser", "whole stroke"], ["Lasso", "rectangle, freeform"]]).replace('class="list"', 'class="list pad"'))),
    row(say("Write on your PDFs", "Import a PDF and write on it, then export any document as a vector PDF. Folders, Favorites, Trash and search keep a growing library in order."), ui(`<div class="pad">${list([["Import", "PDF pages as images (1600 px)"], ["Export", "vector PDF"], ["Library", "folders, favorites, trash, search"]])}</div>`), "flip"),
    row(say("Safe saving", "The library saves atomically to files with a backup copy, and the editor autosaves."), code(`<span class="d">src/ink      stroke model, outlines, history</span>\n<span class="d">src/store    library, atomic persistence + .bak</span>\n<span class="d">src/editor   Skia canvas, gestures, autosave</span>\n<span class="d">src/pdf      PDF pages to images</span>\n<span class="d">src/export   vector PDF export</span>`)),
  ],
  dark: `<div class="row"><div class="say"><h2>Known limits, stated plainly</h2><p>A palm that lands mid-stroke ends the stroke, PDF pages are 1600 px images so deep zoom looks soft, and added pages are not part of undo. Per-pointer palm rejection needs a native build.</p></div><div class="show">${ui(`<div class="pad">${list([["Runs in", "Expo Go over Wi-Fi"], ["Platform", "Android"], ["Tests", "npm test (ink, history, layout, store, export)"]])}</div>`, 'class="onDark"')}</div></div>`,
  runTitle: "Run it on your phone", runText: "Install Expo Go from the Play Store (SDK 58), keep phone and computer on the same Wi-Fi, and scan the QR code.",
  run: `<span class="k">npm</span> install\n<span class="k">npx</span> expo start\n<span class="d"># no Wi-Fi path between phone and Mac?</span>\n<span class="k">npx</span> expo start --tunnel\n<span class="d"># browser preview</span>\n<span class="k">npm run</span> web`,
});

/* ---------- yac crm mobile ---------- */
page({
  slug: "yac-crm-mobile", title: "YAC CRM mobile", h1: "Your CRM, in your pocket",
  lede: "A native iOS app for the YAC CRM: lists, records, chatter, tasks and approvals over the CRM's own REST API.",
  cta: "Run it", cta2: "What is inside",
  hero: `<div class="phone">${ui(`<div class="pad"><label for="q">Opportunities</label><input id="q" type="text" placeholder="Search" style="margin-bottom:10px"><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><button class="chip" data-view="all" aria-pressed="true">All</button><button class="chip" data-view="mine" aria-pressed="false">My open</button><button class="chip" data-view="q" aria-pressed="false">This quarter</button></div><div class="list" id="deals"></div><p class="small" id="count" style="margin-top:12px"></p><p class="small">Sample records for the demo.</p></div>`, 'data-demo="crm"')}</div>`,
  rows: [
    row(say("Every screen is the CRM's own", "No separate mobile backend. The app signs in with the same cookie session as the web app and reads the same REST API."), ui(`<div class="pad">${list([["Home", "quarter totals, tasks, events, approvals"], ["List views", "saved views, search, sort, infinite scroll"], ["Record page", "details, related, chatter, activity"]])}</div>`)),
    row(say("Forms built from the page layout", "Create and edit run from the object's layout: text, number, currency, percent, date, picklist, checkbox and lookup search, with field errors from the API."), ui(`<div class="pad">${list([["Log a call", "prefilled task linked to the record"], ["Chatter", "post, comment, like, @mention"], ["Approvals", "approve or reject with a comment"]])}</div>`), "flip"),
    row(say("Alerts and approvals", "An Alerts tab with an unread badge polls every 60 seconds; tapping opens the record."), code(`<span class="d">GET  /notifications</span>\n<span class="d">POST /notifications/read</span>\n<span class="d">GET  /approvals/pending</span>\n<span class="d">POST /approvals/:id/decide</span>`)),
  ],
  runTitle: "Run it in the simulator", runText: "Start the CRM API first, then the Expo dev server. The iOS Simulator needs a full Xcode install; a browser preview works without it.",
  run: `<span class="d"># in yac-crm</span>\n<span class="k">npm</span> start\n<span class="d"># in yac-crm-mobile</span>\n<span class="k">npm</span> install\n<span class="k">npm run</span> ios\n<span class="d"># browser preview, no Xcode</span>\n<span class="k">npx</span> expo start --web --port 8081`,
});

/* ---------- sysim ---------- */
page({
  slug: "sysim", title: "sysim", h1: "System design, in your idle time",
  lede: "A small simulator that pops up in your terminal when you step away from the keyboard. One scenario, a few choices, a real explanation for each.",
  cta: "Try a scenario", cta2: "How it works",
  hero: ui(`<div class="pad"><label>Design a URL Shortener · easy · 4 minutes</label><p class="big" style="font-size:1.7rem;margin-bottom:6px">How should we generate the short key?</p><p class="small">100M new URLs a day, 10B redirects a day.</p><div id="choices"></div><p id="result" style="margin-top:16px;min-height:72px"></p></div>`, 'data-demo="sysim"'),
  rows: [
    row(say("Only when you are away", "A daemon watches system idle time and opens the overlay in the terminal. Any keypress that is not part of the scenario dismisses it."), code(`<span class="k">sysim</span> start     <span class="d"># daemon in the background</span>\n<span class="k">sysim</span> status    <span class="d"># status and daily budget</span>\n<span class="k">sysim</span> play -s url-shortener\n<span class="k">sysim</span> stats     <span class="d"># learning stats</span>`)),
    row(say("Hard limits so it stays small", "Five minutes per scenario and fifteen minutes a day, enforced in code."), ui(`<div class="pad">${list([["Per scenario", "5 minutes"], ["Per day", "15 minutes"], ["Scenarios", "url shortener, rate limiter, chat system"]])}</div>`), "flip"),
    row(say("Learning that comes back", "Each choice carries a score, tags and an explanation; the state machine is pure logic and results feed spaced repetition."), code(`<span class="d">src/engine     scenario state machine (pure)</span>\n<span class="d">src/overlay    blessed terminal UI</span>\n<span class="d">src/daemon     idle polling</span>\n<span class="d">src/spaced-repetition</span>`)),
  ],
  runTitle: "Build and run", runText: "TypeScript on Node with a blessed terminal UI and sqlite storage. Idle detection is a native module and works on macOS only.",
  run: `<span class="k">npm</span> install\n<span class="k">npm run</span> build\n<span class="k">node</span> dist/bin/sysim.js setup\n<span class="k">node</span> dist/bin/sysim.js play`,
});

/* ---------- inkan ---------- */
page({
  slug: "inkan", title: "inkan", h1: "Sign-in for React apps",
  lede: "@inkan/auth: an API client that refreshes tokens, an auth context, and a one-time handoff that carries a session between apps.",
  cta: "See it work", cta2: "The API",
  hero: ui(`<div class="pad"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="act" id="signin">Sign in</button><button class="act alt" id="call">Call the API</button><button class="act alt" id="mint">Open another app</button><button class="act alt" id="redeem">Redeem the code</button></div><p class="small" id="tok" style="margin-bottom:10px">no tokens</p><pre id="log" style="min-height:190px;max-height:240px;overflow:auto"></pre><p class="small" id="url" style="margin-top:10px;word-break:break-all"></p><p class="small" style="margin-top:6px">A simulation of the behaviour, with an 8 second access token so you can watch a refresh.</p></div>`, 'data-demo="inkan"'),
  rows: [
    row(say("Refresh once, retry the call", "When a call returns 401 the client refreshes the token and retries, so components never see the expiry."), code(`<span class="k">import</span> { apiClient } <span class="k">from</span> <span class="g">"@inkan/auth/api-client"</span>;\n\n<span class="k">const</span> res = <span class="k">await</span> apiClient(<span class="g">"/api/me"</span>);`)),
    row(say("Handoff without leaking tokens", "Apps on different origins cannot share storage. Instead of putting tokens in the URL, the API mints a single-use code that expires in a minute and is worthless once redeemed."), ui(`<div class="pad">${list([["Mint", "POST /api/auth/handoff"], ["Carry", "#mwHandoff=<code>"], ["Redeem", "once, then it is dead"]])}</div>`), "flip"),
    row(say("A small, typed surface", "A provider, a hook, a client and the token store."), code(`<span class="k">import</span> { AuthProvider, useAuth } <span class="k">from</span> <span class="g">"@inkan/auth"</span>;\n<span class="k">import</span> { appendAuthHandoff, consumeAuthHandoff } <span class="k">from</span> <span class="g">"@inkan/auth"</span>;`)),
  ],
  runTitle: "Use it in an app", runText: "Local only: not published. Apps install it from this folder, so edits show up in them immediately.",
  run: `<span class="d"># from an app</span>\n<span class="k">npm</span> install ../inkan\n<span class="d"># work on it</span>\n<span class="k">npm</span> install\n<span class="k">npm run</span> check`,
});

/* ---------- mimamori ---------- */
page({
  slug: "mimamori", title: "mimamori", h1: "Watch over your users, quietly",
  lede: "@mimamori/rum: real-user monitoring for the browser. Uncaught errors, Web Vitals and page views, batched and sent to your API.",
  cta: "Fill the buffer", cta2: "How it works",
  hero: ui(`<div class="pad"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px"><button class="act alt" data-ev="error">Throw an error</button><button class="act alt" data-ev="cls">Layout shift</button><button class="act alt" data-ev="inp">Slow click</button><button class="act alt" data-ev="view">Page view</button><button class="act" id="burst">Add 20 events</button><button class="act" id="hide">Hide the tab</button></div><div style="background:#dcdcd6;border-radius:8px;height:14px;overflow:hidden"><div id="fill" style="height:100%;width:0;background:#bfb21a;transition:width .2s"></div></div><p class="small" id="size" style="margin:8px 0 14px"></p><pre id="batch" style="min-height:200px">Nothing sent yet.</pre></div>`, 'data-demo="mimamori"'),
  rows: [
    row(say("Batches, not chatter", "Events collect in a buffer and go out when it reaches 20 or when the page is hidden. An empty buffer never sends."), code(`<span class="k">const</span> buffer = createRumBuffer({ maxSize: <span class="k">20</span>, flush });\nbuffer.add(event);\n<span class="d">// pagehide / visibilitychange</span>\nbuffer.flush();`)),
    row(say("Survives the page closing", "Batches go out with sendBeacon when it is available and fall back to a keepalive fetch. Sending never throws: telemetry must not show errors to users."), ui(`<div class="pad">${list([["Sent with", "sendBeacon"], ["Fallback", "fetch keepalive"], ["On failure", "silent"]])}</div>`), "flip"),
    row(say("The vitals that matter", "LCP, CLS, INP, FCP and TTFB come from web-vitals, alongside errors and page views."), code(`<span class="k">import</span> { initObservability } <span class="k">from</span> <span class="g">"@mimamori/rum"</span>;\n\ninitObservability({ app: <span class="g">"host"</span>, apiBaseUrl });`)),
  ],
  runTitle: "Use it in an app", runText: "Local only: not published. Apps install it from this folder.",
  run: `<span class="d"># from an app</span>\n<span class="k">npm</span> install ../mimamori\n<span class="d"># work on it</span>\n<span class="k">npm</span> install\n<span class="k">npm run</span> check`,
});

/* ---------- soroban ---------- */
page({
  slug: "soroban", title: "soroban", h1: "Money formatted the Indian way",
  lede: "@soroban/format: locale-aware money, number and date formatting with INR first, so every app prints the same thing.",
  cta: "Format a number", cta2: "Why it exists",
  hero: ui(`<div class="pad"><div class="grid2"><div><label for="amt">Amount</label><input id="amt" type="number" value="1234567.5" step="0.01"><label for="dt" style="margin-top:14px">Date</label><input id="dt" type="text" value="2026-01-05"></div><div><label>formatCurrency</label><p class="big" id="out"></p><label style="margin-top:14px">formatDate</label><p class="big" id="date-out" style="font-size:1.8rem"></p></div></div>
<div class="list" style="margin-top:18px"><div><span>Raw template string</span><b id="naive"></b></div><div><span>en-US formatting</span><b id="us"></b></div></div></div>`, 'data-demo="soroban"'),
  rows: [
    row(say("One implementation to import", "The package started as an empty scaffold while every app reimplemented formatCurrency on its own. One app printed raw rupee amounts with no digit grouping; two drifted to different decimals and date styles."), code(`<span class="k">import</span> { formatCurrency } <span class="k">from</span> <span class="g">"@soroban/format"</span>;\n\nformatCurrency(<span class="k">1234567.5</span>);  <span class="d">// ₹12,34,567.50</span>`)),
    row(say("Indian digit grouping", "Lakhs and crores group the way people read them, always with two decimals."), ui(`<div class="pad">${list([["Locale", "en-IN"], ["Currency", "INR"], ["Decimals", "2, always"], ["Sign", "never on the number"]])}</div>`), "flip"),
    row(say("Day-first dates", "5 Jan 2026, matching how the apps already show dates."), code(`formatDate(<span class="g">"2026-01-05"</span>);  <span class="d">// 5 Jan 2026</span>`)),
  ],
  runTitle: "Use it in an app", runText: "Local only: not published. Apps install it from this folder.",
  run: `<span class="d"># from an app</span>\n<span class="k">npm</span> install ../soroban\n<span class="d"># work on it</span>\n<span class="k">npm</span> install\n<span class="k">npm run</span> check`,
});

/* ---------- hub ---------- */
const projects = [
  ["bitepath", "BitePath", "3D food-to-body digestion visualizer.", "Live app", true],
  ["kinora", "Kinora", "A streaming site with a small DRM license server.", "Live app", true],
  ["sales-pipeline", "Sales pipeline", "A sales pipeline board.", "Live app", true],
  ["youtube-feed", "YouTube feed", "A feed UI.", "Live app", true],
  ["yac-crm", "YAC CRM", "A CRM with records, views, automations and an API.", "Live app", true],
  ["yac-stays", "YAC Stays", "Stays and experiences booking.", "Live app", true],
  ["yac-tunes", "YAC Tunes", "A music app with 55 generated songs.", "Live app", true],
  ["yac-canvas", "YAC Canvas", "A shared whiteboard with a websocket relay.", "Live app", true],
  ["lilly-pro", "Lilly Pro", "Product website for Lilly-Pro XL sanitary pads.", "Website", true],
  ["acelab", "AceLab", "Interview-prep practice app.", "Live app", false],
  ["projects/yac-meet", "yac meet", "Video meetings hosted on your own machine.", "Showcase page", false],
  ["projects/yac-notes", "YAC Notes", "Handwriting notes for Android.", "Showcase page", false],
  ["projects/yac-crm-mobile", "YAC CRM mobile", "A native iOS app for the CRM.", "Showcase page", false],
  ["projects/sysim", "sysim", "System design practice in your idle time.", "Showcase page", false],
  ["projects/inkan", "inkan", "Sign-in for React apps.", "Showcase page", false],
  ["projects/mimamori", "mimamori", "Browser real-user monitoring.", "Showcase page", false],
  ["projects/soroban", "soroban", "Indian money and date formatting.", "Showcase page", false],
];
const tile = ([slug, name, desc, kind, site]) => {
  const href = slug.startsWith("projects/") ? `${slug.split("/")[1]}/` : "#";
  const attr = slug.startsWith("projects/") ? `href="${href}"` : slug === "acelab" ? `href="https://acelab.abhishekkumar08.me"` : `data-site="${slug}" href="#"`;
  const pic = ["bitepath","kinora","sales-pipeline","youtube-feed","yac-crm","lilly-pro"].includes(slug) ? `<img src="img/${slug}.jpg" width="1280" height="800" alt="Screenshot of ${name}" loading="lazy">` : "";
  return `<a class="tile reveal" ${attr}>${pic}<h3>${name}</h3><p>${desc}</p><p class="kind">${kind}</p></a>`;
};
const hub = `${head("Abhishek Kumar: side projects", "Apps, libraries and sites built on the side.", "./")}
<div class="dark" style="background:var(--dark);color:var(--dark-ink)">${bar("./", "dark")}
<main><section class="hero wrap"><h1 class="reveal">Things I build on the side</h1><p class="lede reveal" style="transition-delay:.08s">Seventeen projects: live apps, a website, mobile apps and small libraries. Open one and use it.</p>
<div class="actions"><a class="btn" href="#projects">See the projects</a><a class="btn quiet" href="https://github.com/abhishekkumar08">GitHub</a></div><div class="collage reveal" style="transition-delay:.2s"><img src="img/bitepath.jpg" width="1280" height="800" alt="BitePath, the 3D digestion visualizer"><img src="img/sales-pipeline.jpg" width="1280" height="800" alt="Sales pipeline board"><img src="img/kinora.jpg" width="1280" height="800" alt="Kinora streaming site"></div></section></main></div>
<section class="band" id="projects"><div class="wrap"><div class="tiles">${projects.map(tile).join("")}</div></div></section>
${foot("./")}`;
writeFileSync(OUT + "index.html", hub);
console.log("built", projects.length, "tiles");
