"use client";

import { useState } from "react";

interface Props {
  referralCode: string;
  emailSlug: string;
  email: string;
}

export default function ReferralStep({ referralCode, emailSlug, email }: Props) {
  const [copied, setCopied] = useState(false);

  const referralLink = `https://form.ohrya.org/?ref=${referralCode}`;
  const dashboardUrl = `https://dashboard.ohrya.org/dashboard/${emailSlug}`;

  // Encode WhatsApp text
  const whatsappText = encodeURIComponent(
    `I just took the OHRYA survey and earned my Social Impact Score! 🌟\nGIVE. VOTE. SHINE.\n\nTake it here and see yours: ${referralLink}`
  );

  // Encode email subject and body
  const emailSubject = encodeURIComponent("Join me on OHRYA — Where Advocacy & Philanthropy Earn the Iconic");
  const emailBody = encodeURIComponent(
    `Hi,\n\nI just completed the OHRYA survey and earned my Social Impact Score!\n\nEvery action builds your score — GIVE. VOTE. SHINE.\n\nUse my link to take the survey and we both earn more points:\n${referralLink}\n\nSee you there!`
  );

  // Copy link to clipboard
  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-lg mx-auto text-center mt-45 md:mt-10 lg:mt-40">

      {/* Icon */}
      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#FFC62B] to-[#FFE59F] flex items-center justify-center">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Heading */}
      <div className="flex flex-col gap-2 text-slate-900">
        <h2 className="text-2xl font-bold">
          Your unique referral link is ready!
        </h2>
        <p className="text-sm text-[#000000] tracking-[0.02em]">
          Share it with friends. Every time someone completes the survey using your link,
          you earn Social Impact Score points &amp; climb up the leaderboard.
        </p>
      </div>

      {/* Link container */}
      <div className="w-full flex items-center gap-2 border border-[#5A9AAA] rounded-lg p-3 bg-[#EEF5F6]">

        {/* Link */}
        <span className="flex-1 text-sm text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
          {referralLink}
        </span>

        {/* Copy button */}
        <button
          onClick={copyLink}
          className="flex-shrink-0 bg-[#5A9AAA] hover:bg-[#477D8A] text-white rounded-md px-4 py-2 text-sm transition-all duration-200 cursor-pointer"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      

      {/* CTA */}
      <a
        href={`/my-dashboard?email=${encodeURIComponent(email)}`}
        className="btn-primary text-[0.875rem] font-medium flex items-center justify-center gap-2"
      >
        View My Dashboard 
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="white" strokeWidth="2" />
        </svg>
      </a>
    </div>
  );
}
