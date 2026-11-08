import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Quiz",
    short_name: "Quiz",
    description: "Make a quiz people actually finish. Free to start, simple to share.",
    start_url: "/",
    display: "standalone",
    background_color: "#F7F9FB",
    theme_color: "#334155",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
