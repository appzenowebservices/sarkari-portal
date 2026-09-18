import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "APPZENO Sarkari Portal",
    short_name: "Sarkari Portal",
    description:
      "आधार, पैन, वोटर ID, बिजली बिल, सरकारी योजनाएं — सभी सरकारी सेवाओं के आधिकारिक लिंक एक ही पोर्टल पर।",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#122546",
    lang: "hi",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
