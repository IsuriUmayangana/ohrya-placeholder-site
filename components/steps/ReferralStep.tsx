"use client";


import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { buildWhatsAppShareUrl } from "@/lib/referral-share";

import { buildReferralSignupUrl, ensureAbsoluteReferralLink } from "@/lib/site-urls";

import "../referral/referral.css";



interface Props {

  referralCode: string;

  emailSlug: string;

  email: string;

  showLogo?: boolean;

}



const SHARE_MESSAGE = "Join me on OHRYA! GIVE. VOTE. SHINE.";

const OTP_LENGTH = 6;

const RESEND_COOLDOWN_SEC = 30;



type OtpStage = "idle" | "otp";

type OtpStatus = "idle" | "sending" | "verifying" | "error";



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

  const [otpStage, setOtpStage] = useState<OtpStage>("idle");

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));

  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");

  const [otpError, setOtpError] = useState("");

  const [resendCooldown, setResendCooldown] = useState(0);



  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const resendIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);



  const referralLink = ensureAbsoluteReferralLink(buildReferralSignupUrl(referralCode));

  const whatsAppShareUrl = buildWhatsAppShareUrl(referralLink);

  const shareText = `${SHARE_MESSAGE}\n${referralLink}`;

  const encodedLink = encodeURIComponent(referralLink);

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



  function copyLink() {

    navigator.clipboard.writeText(referralLink).then(() => {

      setCopied(true);

      setTimeout(() => setCopied(false), 2500);

    });

  }



  function copyForInstagram() {

    navigator.clipboard.writeText(shareText).then(() => {

      setCopied(true);

      setTimeout(() => setCopied(false), 2500);

    });

  }



  const content = (

    <div className="referral-page__content">

      {/* Header */}
      <div className="referral-page__header">

        {showLogo && (

          <Image
            src="/logo-v2.png"
            alt="Ohrya"
            width={171}
            height={40}
            className="referral-page__logo"
            style={{ width: "auto", height: 40 }}
            priority
          />

        )}



        <h1 className="referral-page__title">Your unique referral link is ready!</h1>
        <p className="referral-page__description">
          Share it with friends. Every time someone signs up using your link, you earn a Participation
          Score &amp; climb up the leaderboard.
        </p>
      </div>



      {/* Step 1 */}
      <div className="referral-page__step">

        <p className="referral-page__step-text">
          <span className="referral-page__step-label">Step 1 :</span> Choose a platform below to share
          your link
        </p>



        <div className="referral-page__social-row">

          <a

            href={whatsAppShareUrl}

            className="referral-page__social-btn"

            target="_blank"

            rel="noopener noreferrer"

            aria-label="Share on WhatsApp"

          >

            <Image
              src="/referral-share/whatsapp_icon.png"
              alt=""
              width={46}
              height={46}
              className="referral-page__social-icon"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            />

          </a>

          <button

            type="button"

            className="referral-page__social-btn"

            onClick={copyForInstagram}

            aria-label="Copy link for Instagram"

          >

            <Image
              src="/referral-share/instagram_icon.png"
              alt=""
              width={46}
              height={46}
              className="referral-page__social-icon"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            />

          </button>

          <a

            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`}

            className="referral-page__social-btn"

            target="_blank"

            rel="noopener noreferrer"

            aria-label="Share on Facebook"

          >

            <Image
              src="/referral-share/facebook_icon.png"
              alt=""
              width={46}
              height={46}
              className="referral-page__social-icon"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            />

          </a>

          <a

            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedLink}`}

            className="referral-page__social-btn"

            target="_blank"

            rel="noopener noreferrer"

            aria-label="Share on LinkedIn"

          >

            <Image
              src="/referral-share/linkedin_icon.png"
              alt=""
              width={44}
              height={44}
              className="referral-page__social-icon"
              style={{ width: 48, height: 48 }}
              aria-hidden="true"
            />

          </a>

        </div>

        <p className="referral-page__copy-hint">or copy it to your clipboard.</p>

        <div className="referral-page__link-box">
          <span className="referral-page__link-text">{referralLink}</span>
          <button type="button" className="referral-page__copy-btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

      </div>


      {/* Step 2 */}
      <div className="referral-page__step">

        <p className="referral-page__step-text">
          <span className="referral-page__step-label">Step 2 :</span>
          {" "}Access your dashboard to view your Participation Score. You&apos;ll be prompted to
          enter a one-time password (OTP) sent to your registered email.
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

        {/* OTP Error */}
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


