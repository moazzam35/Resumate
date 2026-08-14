"use client";

export default function GlobalError({ error, unstable_retry }) {
  return (
    <html>
      <head>
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            color-scheme: light;
            --paper: #F5F6F1;
            --ink: #1C2430;
            --ink-soft: #3D4657;
            --border: #D8D3C7;
            --stamp: #2E4374;
            --muted: #7A7566;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              color-scheme: dark;
              --paper: #0F1116;
              --ink: #F1F2F5;
              --ink-soft: #A8AFBC;
              --border: #252B35;
              --stamp: #7B9AE0;
              --muted: #8A93A2;
            }
          }
        ` }} />
      </head>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            fontFamily: "system-ui, sans-serif",
            backgroundColor: "var(--paper)",
            color: "var(--ink)",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "420px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "8px" }}>
              Something went wrong
            </h1>
            <p style={{ color: "var(--ink-soft)", marginBottom: "20px" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={() => unstable_retry()}
              style={{
                padding: "10px 18px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--stamp)",
                color: "var(--paper)",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Try Again
            </button>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `console.error(${JSON.stringify(String(error?.message || "Unknown error"))});`,
          }}
        />
      </body>
    </html>
  );
}
