"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Loading from "@/app/loading";
import ReferralStep from "@/components/steps/ReferralStep";

function ReferralSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code") || "";
  const email = searchParams.get("email") || "";
  const slug = searchParams.get("slug") || "";

  useEffect(() => {
    if (!code || !email) {
      router.replace("/");
    }
  }, [code, email, router]);

  if (!code || !email) {
    return <Loading />;
  }

  return <ReferralStep referralCode={code} emailSlug={slug} email={email} showLogo />;
}

export default function ReferralSuccessPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ReferralSuccessInner />
    </Suspense>
  );
}
