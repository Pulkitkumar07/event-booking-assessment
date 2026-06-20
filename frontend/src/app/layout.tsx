import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookIt",
  description: "Discover and book live events"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
