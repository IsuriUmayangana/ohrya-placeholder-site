"use client";

import { useState } from "react";
import "../referral/referral.css";

interface Props {
  referralCode: string;
  emailSlug: string;
  email: string;
  showLogo?: boolean;
}

export default function ReferralStep({ referralCode, email, showLogo = false }: Props) {
  const [copied, setCopied] = useState(false);
  const referralLink = `https://form.ohrya.org/?ref=${referralCode}`;

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const content = (
    <div className="referral-page__content">
      <div className="referral-page__share-icon" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <h1 className="referral-page__title">Your unique referral link is ready!</h1>
      <p className="referral-page__description">
        Share it with friends. Every time someone completes the survey using your link, you earn Social
        Impact Score points &amp; climb up the leaderboard.
      </p>

      <div className="referral-page__link-box">
        <span className="referral-page__link-text">{referralLink}</span>
        <button type="button" className="referral-page__copy-btn" onClick={copyLink}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      <a
        href={`/my-dashboard?email=${encodeURIComponent(email)}`}
        className="referral-page__dashboard-btn"
      >
        View My Dashboard
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>
    </div>
  );

  if (showLogo) {
    return <div className="referral-page">{content}</div>;
  }

  return content;
}
