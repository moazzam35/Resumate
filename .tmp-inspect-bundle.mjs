import { readFileSync, writeFileSync } from "node:fs";

const html = readFileSync("/tmp/deployed-home.html", "utf8");
const srcs = [...html.matchAll(/src="(\/_next\/static\/chunks\/[^"]*\.js)"/g)].map((m) => m[1]);

console.log(`chunks: ${srcs.length}`);

const results = [];
for (const src of srcs) {
  const url = "https://resumate-rouge-xi.vercel.app" + src;
  const res = await fetch(url);
  if (!res.ok) continue;
  const text = await res.text();
  const name = src.split("/").pop();
  const markers = {
    "failed to load frame": text.includes("failed to load frame"),
    "mobile-frames": text.includes("mobile-frames"),
    "HARD_TIMEOUT": text.includes("HARD_TIMEOUT"),
    "decoding": text.includes("decoding"),
  };
  if (Object.values(markers).some(Boolean)) {
    results.push({ name, len: text.length, markers });
  }
  // also save the chunk that mentions mobile-frames for deeper inspect
  if (text.includes("mobile-frames")) {
    writeFileSyncSafe(`/tmp/chunk-${name}.js`, text);
  }
}

console.log(JSON.stringify(results, null, 2));
