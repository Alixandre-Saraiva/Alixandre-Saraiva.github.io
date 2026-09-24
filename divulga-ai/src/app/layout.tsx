import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { SplashScreen } from "@/components/layout/splash-screen";
import { themeScript } from "@/components/layout/theme-toggle";
import { ToastProvider } from "@/components/ui/toast";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Divulga ai — Encontre profissionais perto de você",
    template: "%s | Divulga ai",
  },
  description:
    "Pedreiros, eletricistas, diaristas, designers e muito mais. Encontre profissionais autônomos avaliados na sua cidade e contrate direto pelo WhatsApp.",
  keywords: ["serviços", "profissionais autônomos", "pedreiro", "eletricista", "diarista", "encanador", "contratar"],
  applicationName: "Divulga ai",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Divulga ai",
  },
  appleWebApp: { capable: true, title: "Divulga ai", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0F9DA8" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1517" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full">
        <ToastProvider>
          <SplashScreen />
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
