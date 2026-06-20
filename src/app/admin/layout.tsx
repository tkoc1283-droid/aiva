import React from "react";
import "../globals.css";

export const metadata = {
  title: "Aiva Stüdyo | Panel",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-bone text-ink min-h-screen">
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
