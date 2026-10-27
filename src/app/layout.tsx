import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { MotionProvider, SmoothScroll } from "@/animation";
import { AgeGate } from "@/components/AgeGate";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { TransitionProvider } from "@/components/transition/TransitionProvider";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const manrope = Manrope({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Gamber Valley — Indian Single Malt Whisky",
  description: "Born in the Himalayas. An immersive expedition into the valley behind Gamber Valley Indian Single Malt Whisky.",
  robots: { index: false, follow: false }, // concept build — remove before launch
};

export const viewport: Viewport = { themeColor: "#07100c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        <MotionProvider>
          <SmoothScroll>
            <TransitionProvider>
              <a href="#main" className="skip-link">
                Skip to content
              </a>
              <AgeGate>
                <Nav />
                <main id="main" tabIndex={-1}>{children}</main>
                <Footer />
              </AgeGate>
              <div className="grain" aria-hidden="true" />
            </TransitionProvider>
          </SmoothScroll>
        </MotionProvider>
      </body>
    </html>
  );
}
