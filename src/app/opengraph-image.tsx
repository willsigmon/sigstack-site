import { ImageResponse } from "next/og";
import { generateOgImage } from "@/lib/og-image-generator";

export const runtime = "edge";

export const alt = "sigstack - Claude Code Stack";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(generateOgImage(), { ...size });
}
