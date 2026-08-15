import { spawn } from "node:child_process";

const PORT = 9334;
const URL = process.argv[2] || "https://resumate-rouge-xi.vercel.app/";
const WAIT_MS = parseInt(process.argv[3] || "60000", 10);

const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-gpu",
  "--no-sandbox",
  `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-cdp-profile-" + Date.now(),
  "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getPageWs() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/list`);
      const list = await res.json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(200);
  }
  throw new Error("chrome devtools not reachable");
}

const ws = new WebSocket(await getPageWs());
await new Promise((r) => (ws.onopen = r));

let idc = 0;
const pending = new Map();
const consoleErrors = [];
const exceptions = [];
const failed = [];
let mobileCount = 0, mobileBytes = 0, framesCount = 0, framesBytes = 0;
let loadFired = false;
let lastErrorText = "";

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(JSON.stringify(msg.error)));
    else resolve(msg.result);
    return;
  }
  if (!msg.method) return;
  switch (msg.method) {
    case "Runtime.consoleAPICalled": {
      if (msg.params.type === "error") {
        const t = (msg.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ");
        if (t !== lastErrorText) { consoleErrors.push(t.slice(0, 400)); lastErrorText = t; }
      }
      break;
    }
    case "Runtime.exceptionThrown":
      exceptions.push((msg.params.exceptionDetails?.exception?.description || msg.params.exceptionDetails?.text || "").slice(0, 400));
      break;
    case "Log.entryAdded":
      if (msg.params.entry.level === "error") consoleErrors.push((msg.params.entry.text || "").slice(0, 400));
      break;
    case "Network.responseReceived": {
      const u = msg.params.response.url;
      const len = parseInt(msg.params.response.headers["content-length"] || "0", 10) || 0;
      if (u.includes("/mobile-frames/")) { mobileCount++; mobileBytes += len; }
      if (u.includes("/frames/frame_")) { framesCount++; framesBytes += len; }
      break;
    }
    case "Network.loadingFailed":
      failed.push({ error: msg.params.errorText, blockedReason: msg.params.blockedReason, canceled: msg.params.canceled });
      break;
    case "Page.loadEventFired":
      loadFired = true;
      break;
  }
};

function send(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++idc;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params }));
  });
}

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Log.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });

const t0 = Date.now();
await send("Page.navigate", { url: URL });

while (!loadFired && Date.now() - t0 < 30000) await sleep(250);
console.log(`loadEventFired=${loadFired} after ${Date.now() - t0}ms`);

const samples = [];
while (Date.now() - t0 < WAIT_MS) {
  await sleep(2500);
  try {
    const r = await send("Runtime.evaluate", {
      expression: `(() => {
        const c = document.querySelector('canvas[data-source]');
        const overlay = document.querySelector('canvas[data-source]')?.closest('div.relative')?.querySelector('div.absolute');
        return JSON.stringify({
          readyState: document.readyState,
          htmlLen: document.documentElement.outerHTML.length,
          canvas: c ? { source: c.dataset.source, ready: c.dataset.ready, total: c.dataset.total } : null,
          overlayText: overlay ? (overlay.textContent || '').trim().slice(0, 30) : null,
          btnFound: !!([...document.querySelectorAll('a,button')].find(el => (el.textContent||'').includes('Start Building Free'))),
          nav: location.pathname,
        });
      })()`,
      returnByValue: true,
    });
    if (r.result?.value) {
      const p = JSON.parse(r.result.value);
      samples.push(p);
      if (p.canvas?.ready === "1") break;
    }
  } catch (err) {
    samples.push({ evalError: String(err) });
  }
}

// hit test
const ht = await send("Runtime.evaluate", {
  expression: `(() => {
    const btn = [...document.querySelectorAll('a,button')].find(el => (el.textContent||'').includes('Start Building Free'));
    if (!btn) return JSON.stringify({found:false});
    const rect = btn.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
    return JSON.stringify({ found:true, rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) }, top: top ? { tag: top.tagName, cls: (top.className||'').toString().slice(0,140), txt: (top.textContent||'').slice(0,50) } : null });
  })()`,
  returnByValue: true,
});

console.log("===== SAMPLES =====");
for (const s of samples) console.log(JSON.stringify(s));
console.log("\n===== HIT TEST =====");
console.log(ht.result?.value ?? "n/a");
console.log("\n===== FRAMES NETWORK =====");
console.log(`mobile-frames: ${mobileCount} req, ${(mobileBytes/1024/1024).toFixed(1)} MB | frames: ${framesCount} req, ${(framesBytes/1024/1024).toFixed(1)} MB`);
console.log("\n===== FAILED REQUESTS =====");
for (const f of failed.slice(0, 15)) console.log(JSON.stringify(f));
console.log("\n===== CONSOLE ERRORS =====");
for (const c of consoleErrors.slice(0, 15)) console.log(c);
console.log("\n===== EXCEPTIONS =====");
for (const x of exceptions.slice(0, 15)) console.log(x);

chrome.kill();
process.exit(0);
