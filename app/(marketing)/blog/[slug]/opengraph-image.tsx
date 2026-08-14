import { ImageResponse } from "next/og";
import { blogPosts } from "@/lib/blog-posts";
import { loadOgFonts } from "@/lib/og-fonts";

export const alt = "Resumate Blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#F5F6F1";
const PAPER_ALT = "#ECEDE6";
const INK = "#1C2430";
const STAMP = "#2E4374";
const MUTED = "#7A7566";
const LINE = "#DFE1D6";

export default async function BlogOpengraphImage({ params }) {
  const { slug } = await params;
  const post = blogPosts.find((p) => p.slug === slug);
  const fonts = await loadOgFonts();

  const title = post?.title ?? "Resumate Blog – Career Tips & Resume Advice";
  const category = post?.category ?? "Career";
  const metaLine = post
    ? `${post.author}  ·  ${post.date}  ·  ${post.readTime}`
    : "Resumate Team";

  const titleFontSize =
    title.length > 50 ? 58 : title.length > 40 ? 64 : 72;

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
          padding: "64px 76px 56px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: STAMP,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 19,
                  height: 23,
                  background: "#FFFFFF",
                  borderRadius: 4,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "stretch",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 5,
                    left: 4,
                    right: 4,
                    height: 2,
                    background: "#C9CDD9",
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 11,
                    left: 4,
                    right: 4,
                    height: 2,
                    background: "#C9CDD9",
                    borderRadius: 1,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 17,
                    left: 4,
                    width: 9,
                    height: 2,
                    background: "#C9CDD9",
                    borderRadius: 1,
                  }}
                />
              </div>
            </div>
            <div
              style={{
                fontSize: 26,
                fontWeight: 700,
                fontFamily: "Space Grotesk, sans-serif",
                letterSpacing: "-0.4px",
                marginLeft: 14,
              }}
            >
              Resumate
            </div>
          </div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.3em",
              color: "#FFFFFF",
              background: STAMP,
              borderRadius: 6,
              padding: "8px 16px",
              textTransform: "uppercase",
            }}
          >
            Blog
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", maxWidth: 1040 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              background: PAPER_ALT,
              borderRadius: 999,
              padding: "8px 18px",
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: STAMP,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          </div>
          <div
            style={{
              fontSize: titleFontSize,
              fontWeight: 700,
              fontFamily: "Space Grotesk, sans-serif",
              lineHeight: 1.12,
              letterSpacing: "-1.4px",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 500,
              color: MUTED,
              marginTop: 26,
            }}
          >
            {metaLine}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `1px solid ${LINE}`,
            paddingTop: 26,
          }}
        >
          <div
            style={{
              fontSize: 20,
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
              letterSpacing: "0.26em",
              color: MUTED,
              textTransform: "uppercase",
            }}
          >
            Career Tips &amp; Resume Advice
          </div>
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
