import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./showroom-overrides.css";

export const metadata: Metadata = {
  title: "Choose Your Porsche — by Marcos",
  description:
    "An unofficial interactive 911 GT3 RS configurator learning concept by Marcos.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f2f4f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
