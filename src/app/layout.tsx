import type { Metadata, Viewport } from "next";
import { Mukta, Rajdhani } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { TRPCReactProvider } from "@/trpc/react";
import { PWABootstrap } from "@/components/pwa";
import { CookieBanner } from "@/components/cookie-banner";
import Script from "next/script";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin", "devanagari"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-mukta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "APPZENO Sarkari Portal — हर सरकारी काम, एक ही जगह",
    template: "%s | APPZENO Sarkari Portal",
  },
  description:
    "आधार, पैन, वोटर ID, बिजली बिल, ड्राइविंग लाइसेंस, सरकारी योजनाएं, लोन और सब्सिडी — सभी सरकारी सेवाओं के आधिकारिक लिंक एक ही पोर्टल पर।",
  applicationName: "APPZENO Sarkari Portal",
  manifest: "/manifest.webmanifest",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#122546",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="hi"
      data-lang="hi"
      suppressHydrationWarning
      className={`${rajdhani.variable} ${mukta.variable}`}
    >
      <head>
        <Script id="lang-init" strategy="beforeInteractive">
          {`(function(){try{var l=localStorage.getItem("addies-lang");if(l!=="en"){l="hi";}document.documentElement.dataset.lang=l;}catch(e){document.documentElement.dataset.lang="hi";}})();`}
        </Script>
      </head>
      <body className="min-h-screen font-body">
        <SessionProvider>
          <TRPCReactProvider>
            <PWABootstrap />
            {children}
            <CookieBanner />
          </TRPCReactProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
