"use client";

import { useState } from "react";
import Image from "next/image";
import "../referral/referral.css";

interface Props {
  referralCode: string;
  emailSlug: string;
  email: string;
  showLogo?: boolean;
}

const SOCIAL_PLATFORMS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    iconSrc: "/social-icons/whatsapp_icon.svg",
  },
  {
    id: "instagram",
    label: "Instagram",
    iconSrc: "/social-icons/instagram_icon.svg",
  },
  {
    id: "facebook",
    label: "Facebook",
    iconSrc: "/social-icons/facebook_icon.svg",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    iconSrc: "/social-icons/linkedin_icon.svg",
  },
] as const;

export default function ReferralStep({ referralCode, email, showLogo = false }: Props) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://form.ohrya.org/?ref=${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // TODO: wire up actual social share actions for each platform
  function handleSocialShare(_platform: string) {
    // no-op for now
  }

  const content = (
    <div className="referral-page__content">
      <div className="referral-page__header">
        {showLogo && (
          <Image
            src="/logo-V2.png"
            alt="Ohrya"
            width={120}
            height={40}
            className="referral-page__logo"
            priority
          />
        )}

        <h1 className="referral-page__title">Your unique referral link is ready!</h1>
        <p className="referral-page__description">
          Share it with friends. Every time someone signs up using your link, you earn a Participation
          Score &amp; climb up the leaderboard.
        </p>
      </div>

      <div className="referral-page__step">
        <p className="referral-page__step-text">
          <span className="referral-page__step-label">Step 1 :</span> Choose a platform below to share
          your link
        </p>

        <div className="referral-page__social-row">
          {SOCIAL_PLATFORMS.map((platform) => (
            <button
              key={platform.id}
              type="button"
              className="referral-page__social-btn"
              aria-label={`Share on ${platform.label}`}
              onClick={() => handleSocialShare(platform.id)}
            >
              <Image
                src={platform.iconSrc}
                alt=""
                width={32}
                height={32}
                className="referral-page__social-icon"
                aria-hidden="true"
              />
            </button>
          ))}
        </div>

        <p className="referral-page__copy-hint">or copy it to your clipboard.</p>

        <div className="referral-page__link-box">
          <span className="referral-page__link-text">{referralLink}</span>
          <button type="button" className="referral-page__copy-btn" onClick={copyLink}>
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="referral-page__step">
        <p className="referral-page__step-text">
          <span className="referral-page__step-label">Step 2 :</span>
          {" "}Access your dashboard to view your Participation Score. You&apos;ll be prompted to
          enter a one-time password (OTP) sent to your registered email.
        </p>

        <a
          href={`/my-dashboard?email=${encodeURIComponent(email)}`}
          className="referral-page__dashboard-btn"
        >
          View My Dashboard
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M5 12h14M12 5l7 7-7 7"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );

  if (showLogo) {
    return <div className="referral-page">{content}</div>;
  }

  return content;
}
