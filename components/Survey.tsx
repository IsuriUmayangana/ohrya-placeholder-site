"use client";

import { useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
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
import StepButton from "./ui/StepButton";
import ProgressBar from "./ui/ProgressBar";
import MobileNavButton from "./ui/MobileNavButton";
import Loading from "@/app/loading";
import NavButton from "./ui/NavButton";
import Image from "next/image";

const STEPS = [
  "welcome",
  "campaign",
  "give",
  "score-brilliant",
  "donation",
  "vote",
  "score-almost",
  "shine",
  "recognition",
  "score-welldone",
  "email",
  "referral-share",
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

function calcSurveyScore(a: Answers): number {
  let s = 0;
  if (a.willGive === "Yes") s += 2;
  if (a.willVote === "Yes") s += 2;
  if (a.willShine === "Yes") s += 2;
  return s;
}

function SurveyInner() {
  const searchParams = useSearchParams();
  const referredBy = searchParams.get("ref") || "";

  const [emailError, setEmailError] = useState("");

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<Answers>({
    campaign: "", willGive: "", donationAmount: "",
    willVote: "", willShine: "", prefersEarning: "", email: "",
  });
  const [referralCode, setReferralCode] = useState("");
  const [emailSlug, setEmailSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState<string>("");
  const showRefBanner = !!referredBy && stepIndex === 0;

  const currentStep: Step = STEPS[stepIndex];
  const [maxStepReached, setMaxStepReached] = useState(0);

  const [stepError, setStepError] = useState("");

  function goNext() {
    if (currentStep === "welcome" && !startedAt) {
      setStartedAt(new Date().toISOString());
    }
    setDirection(1);
    setStepIndex((i) => {
      const next = Math.min(i + 1, STEPS.length - 1);
      setMaxStepReached((max) => Math.max(max, next));
      return next;
    });
  }

  function goPrev() {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function submitAndShowReferral() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: Math.random().toString(36).slice(2),
          referredBy,
          ...answers,
          surveyScore: calcSurveyScore(answers),
          startedAt,
        }),
      });
      const data = await res.json();
      if (data.response?.referralCode) setReferralCode(data.response.referralCode);
      if (data.response?.emailSlug) setEmailSlug(data.response.emailSlug);
    } catch {
      const fallback = Math.random().toString(36).slice(2, 8).toUpperCase();
      setReferralCode(fallback);
      setEmailSlug(`user-${fallback.toLowerCase()}`);
    } finally {
      setSubmitting(false);
      goNext();
    }
  }

  async function handleStepNext() {
    // Validate required question steps
    if (currentStep === "campaign" && !answers.campaign) {
      setStepError("Please select a campaign to continue.");
      return;
    }
    if (currentStep === "give" && !answers.willGive) {
      setStepError("Please make a selection to continue.");
      return;
    }
    if (currentStep === "donation" && !answers.donationAmount) {
      setStepError("Please make a selection to continue.");
      return;
    }
    if (currentStep === "vote" && !answers.willVote) {
      setStepError("Please make a selection to continue.");
      return;
    }
    if (currentStep === "shine" && !answers.willShine) {
      setStepError("Please make a selection to continue.");
      return;
    }
    if (currentStep === "recognition" && !answers.prefersEarning) {
      setStepError("Please make a selection to continue.");
      return;
    }
    if (currentStep === "email") {
      if (!answers.email || !answers.email.includes("@")) {
        setStepError("Please enter a valid email address.");
        return;
      }
      setStepError("");
      await submitAndShowReferral();
      return;
    }
  
    setStepError("");
    goNext();
  }

  const restart = useCallback(() => {
    setAnswers({ campaign: "", willGive: "", donationAmount: "", willVote: "", willShine: "", prefersEarning: "", email: "" });
    setReferralCode("");
    setEmailSlug("");
    setStepIndex(0);
    if (typeof window !== "undefined") window.history.replaceState({}, "", "/");
  }, []);

  const surveyScore = calcSurveyScore(answers);
  const questionIdx = QUESTION_STEPS.indexOf(currentStep as string);
  const showProgress = questionIdx !== -1;
  const progressPct = showProgress ? ((questionIdx + 1) / QUESTION_STEPS.length) * 100 : 0;
  const showNav = currentStep !== "welcome" && currentStep !== "referral-share";

  return (
    <div className="relative flex flex-col bg-white">

      {/* Progress Bar */}
      <ProgressBar pct={progressPct} show={showProgress} />

      {/* Header */}
      <header className="fixed top-2 left-0 right-0 z-20 backdrop-blur bg-white/80 flex flex-col items-center justify-center gap-2 ">
        <div className="mx-auto px-4 sm:px-6 py-0 flex justify-center">
            <Image src="/logo.png" alt="Ohrya Logo" className="w-auto h-auto" width={190} height={190} />
        </div>

        {/* Nav Buttons - Desktop */}
        <div className="w-full flex flex-row items-center gap-2 fixed px-6">
          { currentStep !== "welcome" && currentStep !== "campaign" && currentStep !== "referral-share" && (
            <NavButton action={goPrev}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </NavButton>
          )}
          { currentStep !== "welcome" && stepIndex < maxStepReached && (
            <NavButton action={goNext}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#ffffff" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </NavButton>
          )}
        </div>
    </header>

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">

        {/* Step Container */}
        <div className="flex flex-col items-center justify-center text-center lg:px-6 lg:gap-8">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, y: d > 0 ? 50 : -50 }),
                center: { opacity: 1, y: 0 },
                exit: (d: number) => ({ opacity: 0, y: d > 0 ? -50 : 50 }),
              }}
              initial="enter" animate="center" exit="exit"
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="w-full"
            >
              {currentStep === "welcome" && <WelcomeStep />}
              {currentStep === "campaign" && (
                <CampaignStep value={answers.campaign} onChange={(v) => { setAnswers((a) => ({ ...a, campaign: v })); setStepError(""); }} />
              )}
              {currentStep === "give" && (
                <GiveStep value={answers.willGive} onChange={(v) => { setAnswers((a) => ({ ...a, willGive: v })); setStepError(""); }}  />
              )}
              {currentStep === "score-brilliant" && (
                <ScoreStep score={surveyScore} variant="brilliant"  />
              )}
              {currentStep === "donation" && (
                <DonationStep value={answers.donationAmount} onChange={(v) => { setAnswers((a) => ({ ...a, donationAmount: v })); setStepError(""); }}  />
              )}
              {currentStep === "vote" && (
                <VoteStep value={answers.willVote} onChange={(v) => { setAnswers((a) => ({ ...a, willVote: v })); setStepError(""); }} />
              )}
              {currentStep === "score-almost" && (
                <ScoreStep score={surveyScore} variant="almost"  />
              )}
              {currentStep === "shine" && (
                <ShineStep value={answers.willShine} onChange={(v) => { setAnswers((a) => ({ ...a, willShine: v })); setStepError(""); }}  />
              )}
              {currentStep === "score-welldone" && (
                <ScoreStep score={surveyScore} variant="welldone"  />
              )}
              {currentStep === "recognition" && (
                <RecognitionStep value={answers.prefersEarning} onChange={(v) => { setAnswers((a) => ({ ...a, prefersEarning: v })); setStepError(""); }} />
              )}
              {currentStep === "email" && (
                <EmailStep
                value={answers.email}
                onChange={(v) => {
                  setAnswers((a) => ({ ...a, email: v }));
                  setStepError("");
                }}
                error={emailError}
              />
              )}
              {currentStep === "referral-share" && (
                <ReferralStep referralCode={referralCode} emailSlug={emailSlug} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Step Error */}
        {stepError && (
          <p className="error-message">
            {stepError}
          </p>
        )}

        {/* Step Buttons */}
        <div className="flex lg:flex-col flex-row items-center lg:justify-center text-center gap-2 lg:px-6 lg:gap-8 w-full fixed bottom-0 lg:static p-4">

          {/* Previous Button */}
          {currentStep !== "welcome" && currentStep !== "campaign" && currentStep !== "referral-share" && (<MobileNavButton action={goPrev}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
          </MobileNavButton>)}

          {currentStep === "welcome" && (
            <StepButton onClick={handleStepNext}>Get Started</StepButton>
          )}
          {currentStep !== "welcome" && currentStep !== "email" && currentStep !== "referral-share" && (
            <StepButton onClick={handleStepNext}>OK</StepButton>
          )}
          {currentStep === "email" && (
            <StepButton onClick={handleStepNext}>OK</StepButton>
          )}

          {/* Next Button */}
          {currentStep !== "welcome" && stepIndex < maxStepReached && (
            <MobileNavButton action={goNext}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </MobileNavButton>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Survey() {
  return (
    <Suspense fallback={<Loading />}>
      <SurveyInner />
    </Suspense>
  );
}
