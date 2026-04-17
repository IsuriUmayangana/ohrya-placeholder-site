import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OHRYA — Where Advocacy and Philanthropy Earn the Iconic",
  description: "Every action you take builds your Social Impact Score — GIVE. VOTE. SHINE.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  );
}
