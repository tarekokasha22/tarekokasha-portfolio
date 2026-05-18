import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Tarek Okasha — AI Systems & Custom Software";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0B0B0C",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ color: "#C9A961", fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            TAREK OKASHA
          </span>
          <div style={{ flex: 1, height: "1px", background: "rgba(244,239,230,0.12)" }} />
          <span style={{ color: "rgba(244,239,230,0.4)", fontSize: "12px", letterSpacing: "0.1em" }}>
            CAIRO · REMOTE
          </span>
        </div>

        {/* Main headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ color: "#F4EFE6", fontSize: "72px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.04em" }}>
            Software that
          </div>
          <div style={{ color: "#C9A961", fontSize: "72px", fontWeight: 300, lineHeight: 1, letterSpacing: "-0.04em", fontStyle: "italic" }}>
            pays for itself.
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div style={{ color: "rgba(244,239,230,0.5)", fontSize: "18px", maxWidth: "480px", lineHeight: 1.5 }}>
            AI systems and custom software for founders who need them working in weeks, not quarters.
          </div>
          <div style={{ color: "rgba(244,239,230,0.3)", fontSize: "14px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            tarekokasha.com
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
