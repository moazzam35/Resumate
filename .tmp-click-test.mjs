import { spawn } from "node:child_process";

const PORT = 9335;
const URL = "https://resumate-rouge-xi.vercel.app/";

const chrome = spawn(process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", [
  "--headless=new", "--disable-gpu", "--no-sandbox", `--remote-debugging-port=${PORT}`,
  "--user-data-dir=/tmp/chrome-cdp-click-" + Date.now(), "about:blank",
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
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const p = pending.get(msg.id); pending.delete(msg.id);
    msg.error ? p.reject(new Error(JSON.stringify(msg.error))) : p.resolve(msg.result);
  }
};
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const id = ++idc; pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params }));
});
const ev = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  return r.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 3, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.navigate", { url: URL });
await sleep(12000); // let hydration + initial render happen

console.log("state:", await ev(`JSON.stringify((()=>{const c=document.querySelector('canvas[data-source]');return {path:location.pathname,canvas:c?{src:c.dataset.source,ready:c.dataset.ready}:null};})())`));

// Click "Start Building Free"
console.log("clicking Start Building Free...");
const r1 = await ev(`(()=>{
  const btn = [...document.querySelectorAll('a,button')].find(el=>(el.textContent||'').includes('Start Building Free'));
  if(!btn) return 'btn not found';
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width/2, y = rect.top + rect.height/2;
  const top = document.elementFromPoint(x,y);
  const note = top && top !== btn && !btn.contains(top) ? 'COVERED BY ' + top.tagName + '.' + (top.className||'').toString().slice(0,60) : 'clear';
  btn.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
  return JSON.stringify({note, href: btn.getAttribute('href'), tag: btn.tagName});
})()`);
console.log("start-btn:", r1);
await sleep(8000);
console.log("after start click:", await ev(`JSON.stringify({path:location.pathname, title:document.title})`));

// go back to home
await send("Page.navigate", { url: URL });
await sleep(10000);
console.log("back home:", await ev(`location.pathname`));

// Click "Watch Demo"
console.log("clicking Watch Demo...");
const r2 = await ev(`(()=>{
  const btn = [...document.querySelectorAll('a,button')].find(el=>(el.textContent||'').includes('Watch Demo'));
  if(!btn) return 'btn not found';
  const rect = btn.getBoundingClientRect();
  const x = rect.left + rect.width/2, y = rect.top + rect.height/2;
  const top = document.elementFromPoint(x,y);
  const note = top && top !== btn && !btn.contains(top) ? 'COVERED BY ' + top.tagName + '.' + (top.className||'').toString().slice(0,60) : 'clear';
  btn.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true, view:window}));
  return JSON.stringify({note, href: btn.getAttribute('href'), tag: btn.tagName, path: location.pathname});
})()`);
console.log("demo-btn:", r2);
await sleep(4000);
console.log("after demo click:", await ev(`JSON.stringify({path:location.pathname, hash:location.hash, scrollY:Math.round(scrollY), liveDemoVisible:(()=>{const el=document.getElementById('live-demo');if(!el)return null;const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),vh:innerHeight};})()})`));

// Also check: register page loads?
console.log("register page check:", await ev(`fetch('/register',{redirect:'manual'}).then(r=>JSON.stringify({status:r.status,type:r.type})).catch(e=>'ERR '+e)`));

chrome.kill();
process.exit(0);
