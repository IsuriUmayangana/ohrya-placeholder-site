import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "OHRYA — Give • Vote • Shine";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logoPath = join(process.cwd(), "public", "email", "ohrya-logo-primary.png");
  const logoPng = await readFile(logoPath);
  const logoSrc = `data:image/png;base64,${logoPng.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #F1FBFF 0%, #FFFFFF 100%)",
          padding: "48px",
        }}
      >
        <img src={logoSrc} width={360} height={308} alt="" />
        <div
          style={{
            marginTop: 28,
            fontSize: 34,
            fontWeight: 600,
            color: "#2F718B",
            letterSpacing: "0.02em",
          }}
        >
          Give • Vote • Shine
        </div>
      </div>
    ),
    { ...size }
  );
}
