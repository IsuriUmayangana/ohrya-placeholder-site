'use client';

import ReferralBanner from "@/components/ui/ReferralBanner";
import { useSearchParams } from "next/navigation";

export default function Layout({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") || "";
  const showRefBanner = !!referredBy;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Referral Banner */}
      {showRefBanner && <ReferralBanner />}

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        {children}
      </main>
    </div>
  );
}