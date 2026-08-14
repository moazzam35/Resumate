export type OgFont = {
  name: string;
  data: ArrayBuffer;
  weight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  style: "normal";
};

const FONT_CSS_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Public+Sans:wght@400;500;600;700&display=swap";

// UA that gets WOFF instead of WOFF2: the bundled OpenType parser
// supports ttf/otf/woff but rejects WOFF2 ("Unsupported OpenType signature wOF2").
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 6.3; Trident/7.0; rv:11.0) like Gecko";

export async function loadOgFonts(): Promise<OgFont[]> {
  try {
    const res = await fetch(FONT_CSS_URL, {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) return [];
    const css = await res.text();
    const fonts: OgFont[] = [];
    const seen = new Set<string>();
    for (const block of css.split("@font-face")) {
      const family = /font-family:\s*'([^']+)'/.exec(block)?.[1];
      const weight = /font-weight:\s*(\d+)/.exec(block)?.[1];
      const src = /src:\s*url\(([^)]+)\)/.exec(block)?.[1];
      if (!family || !weight || !src) continue;
      const key = `${family}:${weight}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const url = src.replace(/["']/g, "");
      const fontRes = await fetch(url);
      if (!fontRes.ok) continue;
      fonts.push({
        name: family,
        data: await fontRes.arrayBuffer(),
        weight: Number(weight) as 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900,
        style: "normal",
      });
    }
    return fonts;
  } catch {
    return [];
  }
}
