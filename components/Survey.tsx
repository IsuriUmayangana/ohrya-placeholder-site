"use client";

import { useState, useCallback, useRef, Suspense } from "react";
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
import EmailVerifyStep from "./steps/EmailVerifyStep";
import ReferralStep from "./steps/ReferralStep";
import StepButton from "./ui/StepButton";
import ProgressBar from "./ui/ProgressBar";
import MobileNavButton from "./ui/MobileNavButton";
import Loading from "@/app/loading";
import NavButton from "./ui/NavButton";
import Image from "next/image";
import ReferralBanner from "./ui/ReferralBanner";

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

  // Email OTP verification (survey)
  const [otpToken, setOtpToken] = useState("");
  const [surveyOtp, setSurveyOtp] = useState<string[]>(Array(6).fill(""));
  const [emailVerifyStatus, setEmailVerifyStatus] = useState<
    "idle" | "verifying" | "error" | "resending"
  >("idle");
  const [emailVerifyError, setEmailVerifyError] = useState("");
  const surveyVerifyingRef = useRef(false);

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

  const goNext = useCallback(() => {
    if (currentStep === "welcome" && !startedAt) {
      setStartedAt(new Date().toISOString());
    }
    setDirection(1);
    setStepIndex((i) => {
      const next = Math.min(i + 1, STEPS.length - 1);
      setMaxStepReached((max) => Math.max(max, next));
      return next;
    });
  }, [currentStep, startedAt]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  const [submitError, setSubmitError] = useState("");

  const submitAndShowReferral = useCallback(async () => {
    setSubmitting(true);
    setSubmitError("");
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
      if (!res.ok) throw new Error(data.error || "Failed to save response");
      if (data.response?.referralCode) setReferralCode(data.response.referralCode);
      if (data.response?.emailSlug) setEmailSlug(data.response.emailSlug);
      goNext();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  }, [answers, referredBy, startedAt, goNext]);

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
      const trimmed = answers.email.trim();

      if (!trimmed) {
        setStepError("Please enter your email address.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      if (!emailRegex.test(trimmed)) {
        setStepError("Please enter a valid email address (e.g. name@example.com).");
        return;
      }

      setStepError("");
      setSubmitting(true);

      try {
        // Duplicate check
        const check = await fetch(`/api/user/by-email?email=${encodeURIComponent(trimmed)}`);
        if (check.ok) {
          setStepError("This email has already completed the survey. Visit My Dashboard to view your results.");
          setSubmitting(false);
          return;
        }

        setAnswers((a) => ({ ...a, email: trimmed }));
      } catch {
        setStepError("Network error. Please check your connection.");
        setSubmitting(false);
        return;
      }

      setSubmitting(false);
      await submitAndShowReferral();
      return;
    }
  
    setStepError("");
    goNext();
  }

  // ── Survey email OTP handlers ────────────────────────────────────────────

  const handleSurveyOtpVerify = useCallback(
    async (code: string) => {
      if (surveyVerifyingRef.current) return;
      surveyVerifyingRef.current = true;
      setEmailVerifyStatus("verifying");
      setEmailVerifyError("");

      try {
        const res = await fetch("/api/user/verify-email-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: otpToken, code }),
        });

        if (res.ok) {
          await submitAndShowReferral();
        } else {
          const { error } = await res.json();
          setEmailVerifyError(error ?? "Invalid code. Please try again.");
          setEmailVerifyStatus("error");
          setSurveyOtp(Array(6).fill(""));
          surveyVerifyingRef.current = false;
        }
      } catch {
        setEmailVerifyError("Network error. Please check your connection.");
        setEmailVerifyStatus("error");
        surveyVerifyingRef.current = false;
      }
    },
    [otpToken, submitAndShowReferral]
  );

  function handleSurveyOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...surveyOtp];
    next[index] = digit;
    setSurveyOtp(next);
    if (emailVerifyStatus === "error") {
      setEmailVerifyStatus("idle");
      setEmailVerifyError("");
    }
    if (next.every((d) => d !== "") && digit) {
      handleSurveyOtpVerify(next.join(""));
    }
  }

  function handleSurveyOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (surveyOtp[index]) {
        const next = [...surveyOtp];
        next[index] = "";
        setSurveyOtp(next);
      } else if (index > 0) {
        const next = [...surveyOtp];
        next[index - 1] = "";
        setSurveyOtp(next);
      }
    }
  }

  function handleSurveyOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    const next = Array(6).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setSurveyOtp(next);
    if (text.length === 6) handleSurveyOtpVerify(text);
  }

  async function handleSurveyResendOtp() {
    setEmailVerifyStatus("resending");
    try {
      const res = await fetch("/api/user/send-verification-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: answers.email }),
      });
      if (res.ok) {
        const { token } = await res.json();
        setOtpToken(token);
        setSurveyOtp(Array(6).fill(""));
        setEmailVerifyError("");
        surveyVerifyingRef.current = false;
      }
    } catch {
      // silently ignore resend errors
    }
    setEmailVerifyStatus("idle");
  }

  function handleSurveyChangeEmail() {
    setOtpToken("");
    setSurveyOtp(Array(6).fill(""));
    setEmailVerifyStatus("idle");
    setEmailVerifyError("");
    surveyVerifyingRef.current = false;
    goPrev();
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
    <div className="min-h-screen bg-white flex flex-col gap-10">

      <div className="fixed z-20 flex flex-col gap-0 py-0 px-0 top-0 left-0 right-0">
        {/* Referral Banner */}
        <div className="flex-1">
          {showRefBanner && <ReferralBanner />}
        </div>
        <div className="flex-1">
          <ProgressBar pct={progressPct} show={showProgress} />
        </div>
        <div className="flex-1">
          {/* Header */}
          <header className="fixed left-0 right-0 z-20 backdrop-blur bg-white/80 flex flex-col items-center justify-center gap-2 ">
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
        </div>

          
  
      </div>
      

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-4">

        <div className="relative center-content-y flex flex-col items-center justify-center gap-8">
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

          {/* Submit Error */}
          {submitError && (
            <div className="flex flex-col items-center gap-2 px-4 py-3 mx-4 rounded-xl bg-red-50 border border-red-200">
              <p className="text-sm text-red-600 text-center">{submitError}</p>
              <button
                onClick={submitAndShowReferral}
                className="text-xs text-white bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Try again
              </button>
            </div>
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
              <StepButton onClick={handleStepNext}>
                Get Started
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
                </svg>
              </StepButton>
            )}
            {currentStep !== "welcome" && currentStep !== "referral-share" && (
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