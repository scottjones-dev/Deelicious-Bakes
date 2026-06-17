import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import { brittanySignature } from "./fonts";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import { TailwindIndicator } from "@/components/ui/tailwind-indicator";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ["bakery", "cakes", "salisbury", "custom cakes", "cookies", "cupcakes"],
  authors: [{ name: "Deelicious Bakes" }],
  creator: "Deelicious Bakes",
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", brittanySignature.variable, inter.variable, "font-sans")} suppressHydrationWarning>
      <head>
        {env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && (
          <Script
            async
            src="https://cloud.umami.is/script.js"
            data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
          />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <TooltipProvider>
            <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
            {children}
            <Toaster closeButton expand position="bottom-right" richColors />
            <Analytics />
            <SpeedInsights />
            <TailwindIndicator />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
