import { spawn } from "node:child_process";

const PORT = 9348;
const URL = "http://localhost:3000/";

const chrome = spawn(process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-cdp-bp-" + Date.now(), "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function getPageWs() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("no page ws");
}

const ws = new WebSocket(await getPageWs());
await new Promise((r) => (ws.onopen = r));
let idc = 0;
const pending = new Map();
const logs = [];
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    logs.push("EXCEPTION: " + (msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text));
  }
  if (msg.method === "Runtime.consoleAPICalled" && msg.params.type === "error") {
    logs.push("CONSOLE ERROR: " + msg.params.args.map((a) => a.value ?? a.description ?? "").join(" "));
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++idc; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) return "EVAL ERR: " + (r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");

async function snapshot() {
  return JSON.parse(await ev(`JSON.stringify((() => {
    const box = document.querySelector('[data-pl-box]');
    const icon = document.querySelector('[data-pl-icon-path]');
    const letter = document.querySelector('[data-pl-letter]');
    const overlay = document.querySelector('div[class*="z-[100]"]');
    const lockup = box ? box.closest('div[class*="relative flex"]') : null;
    const lr = lockup ? lockup.getBoundingClientRect() : null;
    return {
      hasOverlay: !!overlay,
      boxOpacity: box ? getComputedStyle(box).opacity : null,
      iconDash: icon ? icon.getAttribute('stroke-dashoffset') : null,
      iconOpacity: icon ? getComputedStyle(icon).opacity : null,
      letterClip: letter ? getComputedStyle(letter).clipPath : null,
      lettersVisible: document.querySelectorAll('[data-pl-letter]').length,
      lockupCenter: lr ? Math.round(lr.left + lr.width/2) : null,
      vpCenter: Math.round(innerWidth/2),
      overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
    };
  })())`));
}

// ---- Full animation lifecycle (poll) ----
await send("Page.navigate", { url: URL });
const samples = [];
let prev = null;
for (let i = 0; i < 26; i++) {
  await sleep(260);
  const s = await snapshot();
  if (i % 3 === 0 || (s.hasOverlay && prev && !prev.hasOverlay)) {
    samples.push({ t: (i * 0.26).toFixed(1), ...s });
  }
  if (s.hasOverlay === false && prev && prev.hasOverlay === true) break;
  prev = s;
}
for (const s of samples) console.log("lifecycle:", JSON.stringify(s));

// ---- Reduced motion ----
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Page.navigate", { url: URL });
await sleep(1300);
console.log("reduced t≈1.3s:", JSON.stringify(await snapshot()));
await sleep(1200);
console.log("reduced t≈2.5s (expect gone):", JSON.stringify(await snapshot()));

// ---- Width sweep ----
await send("Emulation.setEmulatedMedia", { features: [] });
for (const width of [360, 768, 1024, 1920]) {
  await send("Emulation.setDeviceMetricsOverride", { width, height: 800, deviceScaleFactor: 1, mobile: width < 768 });
  await send("Page.navigate", { url: URL });
  let snap = null;
  for (let i = 0; i < 26; i++) {
    await sleep(240);
    const s = await snapshot();
    if (s.letterClip && s.letterClip.includes("0%") && s.hasOverlay) { snap = s; break; }
    if (!s.hasOverlay && i > 4) break;
  }
  console.log("width", width, ":", JSON.stringify({ ...snap, w: width }));
}

console.log("--- errors ---");
for (const l of logs) console.log(" ", l);

chrome.kill();
process.exit(0);
