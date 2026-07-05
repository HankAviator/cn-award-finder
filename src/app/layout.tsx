import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CN Award Finder",
  description: "Find how far Chinese airline miles can take you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
