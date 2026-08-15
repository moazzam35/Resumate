import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const pages = [
  ["/", "home"],
  ["/features", "features"],
  ["/templates", "templates"],
  ["/blog", "blog"],
  ["/blog/ats-friendly-resume-2026", "blog-post"],
];

const modes = [
  ["desktop", "--preset=desktop"],
  ["mobile", "--screenEmulation.mobile=true --screenEmulation.width=390 --screenEmulation.height=844 --screenEmulation.deviceScaleFactor=3 --throttling-method=simulate"],
];

function run(label, url, flags) {
  const out = `.lh-${label}.json`;
  try {
    execSync(
      `npx --yes lighthouse ${url} --quiet --chrome-flags="--headless=new --no-sandbox --disable-gpu" --output=json --output-path=${out} --only-categories=performance ${flags} 2>&1`,
      { stdio: "pipe", timeout: 180000, shell: "bash" }
    );
  } catch (e) {
    // lighthouse exits non-zero on cleanup errors even when it wrote JSON
  }
  if (!existsSync(out)) {
    console.log(label, "NO OUTPUT");
    return;
  }
  const d = JSON.parse(readFileSync(out, "utf8"));
  const get = (id) => d.audits?.[id]?.displayValue ?? "n/a";
  console.log(
    `${label.padEnd(24)} perf=${((d.categories?.performance?.score ?? 0) * 100).toFixed(0).padStart(3)} LCP=${get("largest-contentful-paint").padEnd(8)} CLS=${get("cumulative-layout-shift").padEnd(8)} INP=${get("interaction-to-next-paint").padEnd(10)} TTFB=${get("server-response-time").padEnd(8)} TBT=${get("total-blocking-time").padEnd(8)} FCP=${get("first-contentful-paint").padEnd(8)}`
  );
}

for (const [path, name] of pages) {
  for (const [mode, flags] of modes) {
    run(`${name}-${mode}`, `http://localhost:3000${path}`, flags);
  }
}
