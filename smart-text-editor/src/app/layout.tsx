import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Caveat,
  Patrick_Hand,
  Permanent_Marker,
  Oswald,
  Playfair_Display
} from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });
const patrickHand = Patrick_Hand({ weight: "400", variable: "--font-patrick-hand", subsets: ["latin"] });
const permanentMarker = Permanent_Marker({ weight: "400", variable: "--font-permanent-marker", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Text Editor",
  description: "Edit text in images using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased 
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${caveat.variable} 
          ${patrickHand.variable} 
          ${permanentMarker.variable} 
          ${oswald.variable} 
          ${playfair.variable}
        `}
      >
        {children}
      </body>
    </html>
  );
}
