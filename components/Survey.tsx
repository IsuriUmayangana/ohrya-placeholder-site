"use client";

import { useState, useCallback, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import OhryaLogo from "./OhryaLogo";
import WelcomeStep from "./steps/WelcomeStep";
import CampaignStep from "./steps/CampaignStep";
import GiveStep from "./steps/GiveStep";
import ScoreStep from "./steps/ScoreStep";
import DonationStep from "./steps/DonationStep";
import VoteStep from "./steps/VoteStep";
import ShineStep from "./steps/ShineStep";
import RecognitionStep from "./steps/RecognitionStep";
import EmailStep from "./steps/EmailStep";
import ReferralStep from "./steps/ReferralStep";
import DashboardStep from "./steps/DashboardStep";

const STEPS = [
  "welcome",
  "campaign",
  "give",
  "score-brilliant",
  "donation",
  "vote",
  "score-almost",
  "shine",
  "score-welldone",
  "recognition",
  "email",
  "referral-share",
  "dashboard",
] as const;

type Step = (typeof STEPS)[number];

const QUESTION_STEPS = ["campaign", "give", "donation", "vote", "shine", "recognition", "email"];

interface Answers {
  campaign: string;
  willGive: string;
  donationAmount: string;
  willVote: string;
  willShine: string;
  prefersEarning: string;
  email: string;
}

function calcSurveyScore(answers: Answers): number {
  let s = 0;
  if (answers.willGive === "Yes") s += 2;
  if (answers.willVote === "Yes") s += 2;
  if (answers.willShine === "Yes") s += 2;
  return s;
}

function SurveyInner() {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") || "";

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    campaign: "",
    willGive: "",
    donationAmount: "",
    willVote: "",
    willShine: "",
    prefersEarning: "",
    email: "",
  });
  const [referralCode, setReferralCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Show a subtle "referred by" banner on the welcome screen
  const [showRefBanner] = useState(!!referredBy);

  const currentStep: Step = STEPS[stepIndex];

  function goNext() {
    setDirection(1);
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goPrev() {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submitAndGoToReferral() {
    setSubmitting(true);
    const surveyScore = calcSurveyScore(answers);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: Math.random().toString(36).slice(2),
          referredBy,
          ...answers,
          surveyScore,
        }),
      });
      const data = await res.json();
      if (data.response?.referralCode) {
        setReferralCode(data.response.referralCode);
      }
    } catch {
      // fail silently, generate a local fallback code
      setReferralCode(Math.random().toString(36).slice(2, 8).toUpperCase());
    } finally {
      setSubmitting(false);
      goNext();
    }
  }

  const restart = useCallback(() => {
    setAnswers({ campaign: "", willGive: "", donationAmount: "", willVote: "", willShine: "", prefersEarning: "", email: "" });
    setReferralCode("");
    setStepIndex(0);
    // Clear ref param from URL without reload
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  const surveyScore = calcSurveyScore(answers);

  const questionIdx = QUESTION_STEPS.indexOf(currentStep as string);
  const showProgress = questionIdx !== -1;
  const progressPct = showProgress ? ((questionIdx + 1) / QUESTION_STEPS.length) * 100 : 0;

  const showNav =
    currentStep !== "welcome" &&
    currentStep !== "dashboard" &&
    currentStep !== "referral-share";

  return (
    <div className="relative flex flex-col min-h-screen bg-white">
      {/* Referral banner */}
      {showRefBanner && stepIndex === 0 && (
        <div
          style={{
            background: "linear-gradient(90deg, #5a9aaa, #4a8798)",
            color: "white",
            textAlign: "center",
            padding: "10px 16px",
            fontFamily: "Georgia, serif",
            fontSize: "0.88rem",
          }}
        >
          ✨ A friend invited you to earn your Social Impact Score — GIVE. VOTE. SHINE.
        </div>
      )}

      {/* Header */}
      <header className="flex justify-center pt-8 pb-4 px-6">
        <OhryaLogo />
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, y: d > 0 ? 50 : -50 }),
              center: { opacity: 1, y: 0 },
              exit: (d: number) => ({ opacity: 0, y: d > 0 ? -50 : 50 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full max-w-2xl"
          >
            {currentStep === "welcome" && <WelcomeStep onNext={goNext} />}

            {currentStep === "campaign" && (
              <CampaignStep
                value={answers.campaign}
                onChange={(v) => setAnswers((a) => ({ ...a, campaign: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "give" && (
              <GiveStep
                value={answers.willGive}
                onChange={(v) => setAnswers((a) => ({ ...a, willGive: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "score-brilliant" && (
              <ScoreStep score={surveyScore} variant="brilliant" onNext={goNext} />
            )}

            {currentStep === "donation" && (
              <DonationStep
                value={answers.donationAmount}
                onChange={(v) => setAnswers((a) => ({ ...a, donationAmount: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "vote" && (
              <VoteStep
                value={answers.willVote}
                onChange={(v) => setAnswers((a) => ({ ...a, willVote: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "score-almost" && (
              <ScoreStep score={surveyScore} variant="almost" onNext={goNext} />
            )}

            {currentStep === "shine" && (
              <ShineStep
                value={answers.willShine}
                onChange={(v) => setAnswers((a) => ({ ...a, willShine: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "score-welldone" && (
              <ScoreStep score={surveyScore} variant="welldone" onNext={goNext} />
            )}

            {currentStep === "recognition" && (
              <RecognitionStep
                value={answers.prefersEarning}
                onChange={(v) => setAnswers((a) => ({ ...a, prefersEarning: v }))}
                onNext={goNext}
              />
            )}

            {currentStep === "email" && (
              <EmailStep
                value={answers.email}
                onChange={(v) => setAnswers((a) => ({ ...a, email: v }))}
                onNext={submitting ? () => {} : submitAndGoToReferral}
              />
            )}

            {currentStep === "referral-share" && (
              <ReferralStep referralCode={referralCode} onNext={goNext} />
            )}

            {currentStep === "dashboard" && (
              <DashboardStep
                referralCode={referralCode}
                initialSurveyScore={surveyScore}
                onRestart={restart}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Progress bar */}
      {showProgress && (
        <div className="fixed bottom-0 left-0 right-0 h-1" style={{ background: "#e8e8e8" }}>
          <motion.div
            style={{ height: "100%", background: "#c9a84c" }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      )}

      {/* Up/Down nav arrows */}
      {showNav && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 10 }}>
          <button
            onClick={goPrev}
            disabled={stepIndex <= 1}
            aria-label="Previous"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1.5px solid #5a9aaa",
              background: stepIndex <= 1 ? "#e8e8e8" : "#5a9aaa",
              cursor: stepIndex <= 1 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M18 15l-6-6-6 6" stroke={stepIndex <= 1 ? "#aaa" : "white"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            onClick={goNext}
            aria-label="Next"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "1.5px solid #5a9aaa",
              background: "#5a9aaa",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M6 9l6 6 6-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
export default function Survey() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <SurveyInner />
    </Suspense>
  );
}
