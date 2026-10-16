import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Launchday — Your moment is coming",
  description: "A cinematic countdown and virtual ribbon-cutting experience for your website launch."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
