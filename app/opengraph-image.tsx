import { ImageResponse } from "next/og";

export const alt =
  "Samuel Russell Prajasantosa — Software QA Team Lead, Jakarta → Berlin";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#09090b";
const FG = "#fafaf9";
const MUTED = "#a1a1aa";
const SUBTLE = "#71717a";
const DIM = "#52525b";
const ACCENT = "#10b981";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BG,
          color: FG,
          padding: "72px 80px",
          fontFamily: "Inter",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            background:
              "radial-gradient(900px circle at 50% -12%, rgba(16,185,129,0.22), transparent 55%)",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 20,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: MUTED,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 999,
                background: ACCENT,
                boxShadow: `0 0 18px ${ACCENT}`,
              }}
            />
            <span style={{ color: FG }}>Available</span>
            <span style={{ color: DIM }}>·</span>
            <span>Jakarta · WIB</span>
          </div>
          <span>samuelrussellp.com</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 40,
            lineHeight: 0.92,
            fontWeight: 600,
            letterSpacing: -4,
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: 140, color: FG }}>Samuel</span>
          <span style={{ fontSize: 140, color: MUTED }}>Russell</span>
          <span style={{ fontSize: 104, color: SUBTLE }}>Prajasantosa</span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 28, color: FG }}>
              Software QA Team Lead
            </span>
            <span style={{ fontSize: 20, color: MUTED }}>
              Paul&apos;s Job · Remote · Berlin HQ
            </span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: ACCENT,
            }}
          >
            ID &nbsp;→&nbsp; MY &nbsp;→&nbsp; DE
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
