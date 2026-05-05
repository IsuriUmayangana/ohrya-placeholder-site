import type { Metadata } from "next";
import "./globals.css";
import { Suspense } from "react";
import Loading from "./loading";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "OHRYA",
  description: "Every action you take builds your Social Impact Score — GIVE. VOTE. SHINE.",

  /** Icon */
  icons: {
    icon: "/logo-icon.png",
  },
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
    <Suspense fallback={<Loading />}>
      <body className={`min-h-screen h-full bg-white ${poppins.className}`}>{children}</body>
    </Suspense>
  </html>
  );
}
