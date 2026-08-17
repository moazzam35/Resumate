import { spawn } from "node:child_process";

const CHROME_PATH =
  process.env.CHROME_PATH ||
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const proc = spawn(
  CHROME_PATH,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--remote-debugging-port=0",
    "--user-data-dir=" + "C:\\tmp\\chrome-probe-" + Math.random().toString(36).slice(2),
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "pipe"] }
);
let err = "";
proc.stderr.on("data", (d) => {
  err += d.toString();
  const m = err.match(/DevTools listening on (ws:\/\/[^\s]+)/);
  if (m) {
    console.log("WS OK:", m[1].slice(0, 40));
    proc.kill();
    process.exit(0);
  }
});
proc.on("error", (e) => {
  console.log("SPAWN ERROR:", e.message);
  process.exit(1);
});
proc.on("exit", (c) => {
  console.log("EXITED code", c);
  console.log(err.slice(0, 1200));
  process.exit(1);
});
setTimeout(() => {
  console.log("TIMEOUT, stderr:", err.slice(0, 1200));
  proc.kill();
  process.exit(1);
}, 12000);
