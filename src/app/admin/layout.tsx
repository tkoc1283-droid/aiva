import React from "react";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import "../globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  weight: ["400", "500", "600", "700"],
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500"],
});

export const metadata = {
  title: "Aiva Stüdyo | Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${archivo.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bone text-ink min-h-screen">
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
