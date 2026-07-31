import type { Metadata } from "next";
import ReferralSuccessPage from "@/components/referral/ReferralSuccessPage";

export const metadata: Metadata = {
  title: "OHRYA - Your Referral Link",
  description: "Share your unique OHRYA referral link and grow your impact.",
};

export default function ReferralPage() {
  return <ReferralSuccessPage />;
}
