import type { Metadata } from "next";
import PolicyPage from "@/components/splash/PolicyPage";
import { pageTitle, policyHtml } from "@/lib/splash/privacyContent";

export const metadata: Metadata = {
  title: pageTitle,
};

export default function PrivacyPolicyPage() {
  return <PolicyPage html={policyHtml} />;
}
