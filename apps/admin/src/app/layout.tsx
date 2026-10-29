import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Touchline Admin",
  description: "Moderation console for Touchline.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
