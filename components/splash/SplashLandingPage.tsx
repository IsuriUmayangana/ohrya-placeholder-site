"use client";

import { FormEvent, useState, useEffect, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  checkEmailAlreadyRegistered,
  referralSuccessUrl,
  submitSurveyResponse,
} from "@/lib/submit-survey-response";
import { navigateAfterSignup } from "@/lib/navigate-after-signup";
import { getSurveyCampaignValue, type CampaignId } from "./JoinCampaignSurface";
import CharityNavigator from "./sections/CharityNavigator";
import Faq from "./sections/Faq";
import InstagramFeed from "./sections/InstagramFeed";
import Footer from "./sections/Footer";
import Header from "./sections/Header";
import Hero from "./sections/Hero";
import Impact from "./sections/Impact";
import JoinFormSection from "./sections/JoinFormSection";
import Steps from "./sections/Steps";
import VideoSection from "./sections/VideoSection";
import "./splash.css";

export default function SplashLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") || "";
  const [selectedCampaign, setSelectedCampaign] = useState<CampaignId>("Pets");

  useEffect(() => {
    if (!referredBy) return;
    fetch("/api/referral/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: referredBy }),
    }).catch(() => {});
  }, [referredBy]);

  useEffect(() => {
    if (typeof window === "undefined" || window.location.hash !== "#join-form") return;

    const scrollToJoinForm = () => {
      document.getElementById("join-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    scrollToJoinForm();
    const timeoutId = window.setTimeout(scrollToJoinForm, 400);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<ReactNode>("");
  const [submitting, setSubmitting] = useState(false);

  async function handleJoinSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    if (!trimmedName) {
      setFormError("Please enter your name.");
      return;
    }
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setSubmitting(true);

    try {
      if (await checkEmailAlreadyRegistered(trimmedEmail)) {
        setFormError(
          <>
            This email has already completed sign up.{" "}
            <a href={`/dashboard?email=${encodeURIComponent(trimmedEmail)}`}>
              Visit My Dashboard
            </a>{" "}
            to view your results.
          </>
        );
        return;
      }

      const result = await submitSurveyResponse({
        campaign: getSurveyCampaignValue(selectedCampaign),
        name: trimmedName,
        email: trimmedEmail,
        referredBy,
        startedAt: new Date().toISOString(),
      });

      navigateAfterSignup(referralSuccessUrl(result, trimmedEmail), router);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="landing-page">
      <div className="hero-background" aria-hidden="true" />
      <Header />
      <Hero />
      <Steps />
      <JoinFormSection
        selectedCampaign={selectedCampaign}
        onCampaignChange={setSelectedCampaign}
        name={name}
        onNameChange={(value) => {
          setName(value);
          setFormError("");
        }}
        email={email}
        onEmailChange={(value) => {
          setEmail(value);
          setFormError("");
        }}
        onSubmit={handleJoinSubmit}
        error={formError}
        submitting={submitting}
      />
      <CharityNavigator />
      <VideoSection />
      <Impact />
      <Faq />
      <InstagramFeed />
      <Footer />
    </div>
  );
}
