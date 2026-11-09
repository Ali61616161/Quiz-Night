import type { MetadataRoute } from "next";
import { BRAND } from "@config/brand";

export default function manifest(): MetadataRoute.Manifest {
  return { name: BRAND.name, short_name: BRAND.name, start_url: "/", display: "standalone", background_color: "#17483B", theme_color: "#17483B", lang: "tr", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }] };
}
