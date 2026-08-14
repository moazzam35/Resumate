import { ImageResponse } from "next/og";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "Resumate – AI Resume Builder & ATS Resume Checker";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F5F6F1";
const INK = "#1C2430";
const STAMP = "#2E4374";
const MUTED = "#7A7566";
const LINE = "#DFE1D6";

function BrandMark({ size: s }) {
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: s * 0.25,
        background: STAMP,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: s * 0.46,
          height: s * 0.55,
          background: "#FFFFFF",
          borderRadius: s * 0.09,
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: s * 0.14,
            left: s * 0.1,
            right: s * 0.1,
            height: s * 0.05,
            background: "#C9CDD9",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: s * 0.28,
            left: s * 0.1,
            right: s * 0.1,
            height: s * 0.05,
            background: "#C9CDD9",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: s * 0.42,
            left: s * 0.1,
            width: s * 0.24,
            height: s * 0.05,
            background: "#C9CDD9",
            borderRadius: 2,
          }}
        />
      </div>
    </div>
  );
}

export default async function OpengraphImage() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          fontFamily: "Public Sans, sans-serif",
          padding: "72px 84px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <BrandMark size={52} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: 20,
            }}
          >
            <div
              style={{
                fontSize: 34,
                fontWeight: 700,
                fontFamily: "Space Grotesk, sans-serif",
                letterSpacing: "-0.5px",
              }}
            >
              Resumate
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.32em",
                color: MUTED,
                textTransform: "uppercase",
                marginTop: 4,
              }}
            >
              AI Resume Builder
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 960 }}>
          <div
            style={{
              fontSize: 92,
              fontWeight: 700,
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: 1.04,
              letterSpacing: "-2px",
            }}
          >
            Build an ATS-Friendly Resume with AI
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 400,
              color: MUTED,
              lineHeight: 1.45,
              marginTop: 28,
              maxWidth: 860,
            }}
          >
            Create professional resumes, tailored cover letters, and interview prep — all in one platform.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 28,
          }}
        >
          <div
            style={{
              fontSize: 22,
              fontWeight: 600,
              fontFamily: "Space Grotesk, sans-serif",
              letterSpacing: "-0.2px",
            }}
          >
            resumate.ai
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.28em",
              color: MUTED,
              textTransform: "uppercase",
            }}
          >
            ATS Checker&ensp;&middot;&ensp;Templates&ensp;&middot;&ensp;AI Writing
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
