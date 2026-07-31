import type { Metadata } from "next";
import PolicyPage from "@/components/splash/PolicyPage";
import { pageTitle, policyHtml } from "@/lib/splash/termsContent";

export const metadata: Metadata = {
  title: pageTitle,
};

export default function TermsOfServicePage() {
  return <PolicyPage html={policyHtml} />;
}
