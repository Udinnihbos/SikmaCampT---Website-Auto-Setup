import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata = {
  title: "Autosetup — Blueprint server Discord pakai AI",
  description: "Deskripsikan server Discord kamu, AI gambar blueprint-nya, bot yang bangun.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${display.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}
