"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  buildFacebookPostShareUrl,
  buildLinkedInPostShareUrl,
  buildWhatsAppShareUrl,
  openSharePopup,
  shareReferralToInstagramStory,
} from "@/lib/referral-share";
import { buildReferralSignupUrl, ensureAbsoluteReferralLink } from "@/lib/site-urls";
import "../referral/referral.css";

interface Props {
  referralCode: string;
  emailSlug: string;
  email: string;
  showLogo?: boolean;
}

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SEC = 30;

type OtpStage = "idle" | "otp";
type OtpStatus = "idle" | "sending" | "verifying" | "error";

function WhatsAppIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.88 1.94 7.02L2 30l7.17-1.88A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.26 0-4.47-.61-6.4-1.77l-.46-.27-4.25 1.11 1.14-4.13-.3-.48A11.47 11.47 0 014.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.32-.12-.54-.17-.77.17-.22.34-.87 1.11-1.07 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.89-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.21-.64-.38z"
        fill="currentColor"
      />
    </svg>
  );
}

function DashboardArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12h14M12 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ReferralStep({ referralCode, email, showLogo = false }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [shareFeedback, setShareFeedback] = useState("");
  const [otpStage, setOtpStage] = useState<OtpStage>("idle");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const referralLink = ensureAbsoluteReferralLink(buildReferralSignupUrl(referralCode));
  const whatsAppShareUrl = buildWhatsAppShareUrl(referralLink);
  const facebookShareUrl = buildFacebookPostShareUrl(referralLink);
  const linkedInShareUrl = buildLinkedInPostShareUrl(referralLink);
  const otpComplete = otp.every((digit) => digit !== "");

  useEffect(() => {
    return () => {
      if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    };
  }, []);

  function startResendCooldown() {
    if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
    setResendCooldown(RESEND_COOLDOWN_SEC);
    resendIntervalRef.current = setInterval(() => {
      setResendCooldown((seconds) => {
        if (seconds <= 1) {
          if (resendIntervalRef.current) clearInterval(resendIntervalRef.current);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
  }

  const sendOtp = useCallback(async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setOtpStatus("sending");
    setOtpError("");

    try {
      const res = await fetch("/api/user/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });
      const data = await res.json();

      if (res.ok) {
        setOtpStage("otp");
        setOtpStatus("idle");
        setOtp(Array(OTP_LENGTH).fill(""));
        startResendCooldown();
        setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
      } else {
        setOtpError(data.error ?? "Failed to send code. Please try again.");
        setOtpStatus("error");
      }
    } catch {
      setOtpError("Network error. Please check your connection.");
      setOtpStatus("error");
    }
  }, [email]);

  async function handleSendOtpClick() {
    if (otpStatus === "sending") return;
    await sendOtp();
  }

  async function handleVerifyOtp() {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH || otpStatus === "verifying") return;

    setOtpStatus("verifying");
    setOtpError("");

    try {
      const res = await fetch("/api/user/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code }),
      });
      const data = await res.json();

      if (res.ok && data.emailSlug) {
        router.push(`/dashboard/${data.emailSlug}`);
        return;
      }

      setOtpError(data.error ?? "Invalid or expired code. Please try again.");
      setOtpStatus("error");
      setOtp(Array(OTP_LENGTH).fill(""));
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch {
      setOtpError("Network error. Please check your connection.");
      setOtpStatus("error");
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0 || otpStatus === "sending") return;
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    setOtpStatus("idle");
    await sendOtp();
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const digit = value.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (otpStatus === "error") {
      setOtpStatus("idle");
      setOtpError("");
    }
    if (digit && index < OTP_LENGTH - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace") {
      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        otpInputRefs.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!text) return;
    const next = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setOtp(next);
    if (otpStatus === "error") {
      setOtpStatus("idle");
      setOtpError("");
    }
    const focusIndex = Math.min(text.length, OTP_LENGTH - 1);
    otpInputRefs.current[focusIndex]?.focus();
  }

  function showShareFeedback(message: string) {
    setShareFeedback(message);
    window.setTimeout(() => setShareFeedback(""), 4000);
  }

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function shareToFacebook() {
    openSharePopup(facebookShareUrl);
  }

  async function shareToLinkedIn() {
    openSharePopup(linkedInShareUrl);
  }

  async function shareToInstagramStory() {
    const result = await shareReferralToInstagramStory(referralLink);
    if (result.copied) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    }
    showShareFeedback(result.message);
  }

  const content = (
    <div className="referral-page__content">
      {showLogo && (
        <img
          className="referral-page__logo"
          src="/email/ohrya-logo-primary.png"
          alt="OHRYA — Give • Vote • Shine"
          width={170}
        />
      )}

      <h1 className="referral-page__title">Your unique referral link is ready!</h1>
      <p className="referral-page__description">
        Share it with friends. Every time someone signs up using your link, you earn a
        Participation Score &amp; climb up the leaderboard.
      </p>

      <div className="referral-page__step">
        <p className="referral-page__step-label">
          <strong>Step 1 :</strong> Choose a platform below to share your link
        </p>

        <div className="referral-page__social-row">
          <a
            href={whatsAppShareUrl}
            className="referral-page__social-btn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Share on WhatsApp"
          >
            <WhatsAppIcon />
          </a>
          <button
            type="button"
            className="referral-page__social-btn"
            onClick={shareToInstagramStory}
            aria-label="Share to Instagram story"
          >
            <img src="/splash/assets/icon-instagram.svg" alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="referral-page__social-btn"
            onClick={shareToFacebook}
            aria-label="Share as Facebook post"
          >
            <img src="/splash/assets/icon-facebook.svg" alt="" aria-hidden="true" />
          </button>
          <button
            type="button"
            className="referral-page__social-btn"
            onClick={shareToLinkedIn}
            aria-label="Share as LinkedIn post"
          >
            <img src="/splash/assets/icon-linkedin.svg" alt="" aria-hidden="true" />
          </button>
        </div>

        {shareFeedback && <p className="referral-page__share-hint">{shareFeedback}</p>}

        <p className="referral-page__copy-hint">or copy it to your clipboard.</p>

        <div className="referral-page__link-box">
          <span className="referral-page__link-text">{referralLink}</span>
          <button type="button" className="referral-page__copy-btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="referral-page__step referral-page__step--two">
        <p className="referral-page__step-label">
          <strong>Step 2 :</strong> Access your dashboard to view your Participation Score.
          You&apos;ll be prompted to enter a one-time password (OTP) sent to your registered email.
        </p>

        {otpStage === "idle" ? (
          <button
            type="button"
            className="referral-page__dashboard-btn"
            onClick={handleSendOtpClick}
            disabled={otpStatus === "sending"}
          >
            {otpStatus === "sending" ? "Sending OTP…" : "Send OTP to View My Dashboard"}
            <DashboardArrow />
          </button>
        ) : (
          <div className="referral-page__otp-panel">
            <div className="referral-page__otp-row" onPaste={handleOtpPaste}>
              {Array.from({ length: OTP_LENGTH }).map((_, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpInputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={otp[index]}
                  disabled={otpStatus === "verifying" || otpStatus === "sending"}
                  className={`referral-page__otp-box${otp[index] ? " referral-page__otp-box--filled" : ""}${otpStatus === "error" ? " referral-page__otp-box--error" : ""}`}
                  aria-label={`OTP digit ${index + 1}`}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                />
              ))}
            </div>

            <button
              type="button"
              className="referral-page__otp-resend"
              onClick={handleResendOtp}
              disabled={resendCooldown > 0 || otpStatus === "sending" || otpStatus === "verifying"}
            >
              {resendCooldown > 0
                ? `Resend OTP (${resendCooldown} Seconds)`
                : "Resend OTP"}
            </button>

            {otpError && <p className="referral-page__otp-error">{otpError}</p>}

            <button
              type="button"
              className="referral-page__dashboard-btn"
              onClick={handleVerifyOtp}
              disabled={!otpComplete || otpStatus === "verifying" || otpStatus === "sending"}
            >
              {otpStatus === "verifying" ? "Verifying…" : "View My Dashboard"}
              <DashboardArrow />
            </button>
          </div>
        )}

        {otpStage === "idle" && otpError && (
          <p className="referral-page__otp-error">{otpError}</p>
        )}
      </div>
    </div>
  );

  if (showLogo) {
    return <div className="referral-page">{content}</div>;
  }

  return content;
}

