import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const alt = "NBA Moneyball - Who can buy the most wins?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const fontsDir = path.join(process.cwd(), "lib/fonts");
  const [bold, semibold, medium] = await Promise.all([
    fs.readFile(path.join(fontsDir, "Oswald-Bold.ttf")),
    fs.readFile(path.join(fontsDir, "Oswald-600.ttf")),
    fs.readFile(path.join(fontsDir, "Oswald-500.ttf")),
  ]);

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
          backgroundColor: "#F4F5F6",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 22,
            fontWeight: 600,
            color: "#CC0000",
            backgroundColor: "rgba(204,0,0,0.08)",
            border: "2px solid rgba(204,0,0,0.25)",
            borderRadius: 999,
            padding: "10px 26px",
            marginBottom: 36,
          }}
        >
          2026-27 NBA SEASON
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 120,
            fontWeight: 700,
            color: "#131518",
            textTransform: "uppercase",
            letterSpacing: -3,
            lineHeight: 1,
          }}
        >
          NBA Moneyball
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 42,
            fontWeight: 500,
            color: "#55595E",
            marginTop: 28,
          }}
        >
          Who can buy the most wins?
        </div>
        <div
          style={{
            display: "flex",
            width: 200,
            height: 10,
            backgroundColor: "#CC0000",
            borderRadius: 6,
            marginTop: 48,
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Oswald", data: bold, style: "normal", weight: 700 },
        { name: "Oswald", data: semibold, style: "normal", weight: 600 },
        { name: "Oswald", data: medium, style: "normal", weight: 500 },
      ],
    }
  );
}
