import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Divulga ai",
    short_name: "Divulga ai",
    description: "Encontre profissionais autônomos perto de você.",
    start_url: "/",
    display: "standalone",
    background_color: "#0F9DA8",
    theme_color: "#0F9DA8",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
