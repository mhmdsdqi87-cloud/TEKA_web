import type { MetadataRoute } from "next";
import { TEKA } from "@/lib/teka/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${TEKA.name} — ${TEKA.tagline}`,
    short_name: TEKA.name,
    description: TEKA.brandStatement,
    start_url: "/",
    display: "standalone",
    background_color: "#050505",
    theme_color: "#050505",
    icons: [
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/favicon.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}
