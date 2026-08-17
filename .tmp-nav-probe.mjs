import { spawn } from "node:child_process";

const PORT = 3100;
const BASE = `http://localhost:${PORT}`;
const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function launchChrome() {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      CHROME_PATH,
      [
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--remote-debugging-port=0",
        "--user-data-dir=" + "C:\\tmp\\chrome-probe2-" + Math.random().toString(36).slice(2),
        "about:blank",
      ],
      { stdio: ["ignore", "ignore", "pipe"] }
    );
    let stderr = "";
    proc.stderr.on("data", (d) => {
      stderr += d.toString();
      const m = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (m) {
        proc.off("exit", onExit);
        resolve({ proc, wsUrl: m[1] });
      }
    });
    const onExit = () => reject(new Error("Chrome exited early"));
    proc.on("exit", onExit);
    setTimeout(() => reject(new Error("Chrome launch timeout")), 15000).unref();
  });
}

let msgId = 0;
function cdp(ws, method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = ++msgId;
    const onMsg = (ev) => {
      const msg = JSON.parse(ev.data.toString());
      if (msg.id === id) {
        ws.removeEventListener("message", onMsg);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    };
    ws.addEventListener("message", onMsg);
    ws.send(JSON.stringify(sessionId ? { id, method, params, sessionId } : { id, method, params }));
  });
}

async function main() {
  const { proc, wsUrl } = await launchChrome();
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => ws.addEventListener("open", r));

  const { targetId } = await cdp(ws, "Target.createTarget", { url: "about:blank" });
  const { sessionId } = await cdp(ws, "Target.attachToTarget", { targetId, flatten: true });
  const send = (m, p) => cdp(ws, m, p, sessionId);

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Fetch.enable", {
    patterns: [{ urlPattern: "*://localhost:3100/api/auth/me*", requestStage: "Request" }],
  });
  ws.addEventListener("message", async (ev) => {
    const msg = JSON.parse(ev.data.toString());
    if (msg.method === "Fetch.requestPaused" && msg.sessionId === sessionId) {
      const body = JSON.stringify({
        user: { id: "u1", name: "Test User", email: "test@resumate.app", avatar: null, subscription: { plan: "FREE" } },
        role: "USER",
      });
      await send("Fetch.fulfillRequest", {
        requestId: msg.params.requestId,
        responseCode: 200,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }],
        body: Buffer.from(body).toString("base64"),
      });
    }
  });

  const evalJs = async (expr) => {
    const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true });
    return r.result.value;
  };

  await send("Emulation.setDeviceMetricsOverride", { width: 768, height: 1024, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: `${BASE}/blog` });
  for (let i = 0; i < 80; i++) {
    await sleep(150);
    const ready = await evalJs("document.readyState === 'complete' && !!document.querySelector('header')");
    if (ready) break;
  }
  await sleep(800);

  const report = await evalJs(`(() => {
    const rect = (el) => { const r = el.getBoundingClientRect(); return Math.round(r.width); };
    const header = document.querySelector('header');
    const inner = header.querySelector('.max-w-7xl').firstElementChild;
    const kids = [...inner.children].map((c) => ({
      tag: c.tagName,
      w: rect(c),
      scrollW: c.scrollWidth,
      cls: c.className.slice(0, 45),
    }));
    const nav = header.querySelector('nav');
    const navLinks = [...nav.querySelectorAll('a')].map((a) => ({ t: a.textContent.trim(), w: rect(a) }));
    return { headerW: rect(header), kids, nav: { w: rect(nav), scrollW: nav.scrollWidth }, navLinks };
  })()`);

  console.log(JSON.stringify(report, null, 2));

  proc.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error("ERR", e.message);
  process.exit(1);
});
