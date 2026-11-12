import type { Metadata } from "next";
import "./globals.css";
import BackgroundMusic from "@/components/BackgroundMusic";

export const metadata: Metadata = {
  title: "Forever With You ♡",
  description: "A little book of our memories — Dita & Ego."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body> <BackgroundMusic /> {children}</body></html>;
}