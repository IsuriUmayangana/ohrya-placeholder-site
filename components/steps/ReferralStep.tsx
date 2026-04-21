"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  referralCode: string;
  emailSlug: string;
}

export default function ReferralStep({ referralCode, emailSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const referralLink = `${baseUrl}/?ref=${referralCode}`;
  const dashboardUrl = `/dashboard/${emailSlug}`;

  const whatsappText = encodeURIComponent(
    `I just took the OHRYA survey and earned my Social Impact Score! 🌟\nGIVE. VOTE. SHINE.\n\nTake it here and see yours: ${referralLink}`
  );
  const emailSubject = encodeURIComponent("Join me on OHRYA — Where Advocacy & Philanthropy Earn the Iconic");
  const emailBody = encodeURIComponent(
    `Hi,\n\nI just completed the OHRYA survey and earned my Social Impact Score!\n\nEvery action builds your score — GIVE. VOTE. SHINE.\n\nUse my link to take the survey and we both earn more points:\n${referralLink}\n\nSee you there!`
  );

  function copyLink() {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-lg mx-auto text-center">
      {/* Icon */}
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #c9a84c, #e8c97a)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <div className="flex flex-col gap-2">
        <h2 style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)", fontWeight: "400", color: "#2d2d2d" }}>
          Your unique referral link is ready!
        </h2>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.95rem", color: "#666", lineHeight: 1.6 }}>
          Share it with friends. Every time someone completes the survey using your link,
          you earn <strong style={{ color: "#5a9aaa" }}>+1 point</strong> on your Social Impact Score.
        </p>
      </div>

      {/* Link box */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, border: "1.5px solid #d0d9dc", borderRadius: 8, padding: "10px 14px", background: "#f8fbfc" }}>
        <span style={{ flex: 1, fontFamily: "monospace", fontSize: "0.85rem", color: "#5a9aaa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {referralLink}
        </span>
        <button
          onClick={copyLink}
          style={{ flexShrink: 0, background: copied ? "#5a9aaa" : "white", border: "1.5px solid #5a9aaa", borderRadius: 6, padding: "6px 14px", fontSize: "0.8rem", color: copied ? "white" : "#5a9aaa", cursor: "pointer", fontFamily: "Georgia, serif", transition: "all 0.2s" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Share buttons */}
      <div className="flex flex-col gap-3 w-full">
        <a
          href={`https://wa.me/?text=${whatsappText}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "#25D366", color: "white", borderRadius: 9999, padding: "13px 24px", fontFamily: "Georgia, serif", fontSize: "0.95rem", textDecoration: "none" }}
        >
          <svg width="20" height="20" viewBox="0 0 32 32" fill="white"><path d="M16 2C8.28 2 2 8.28 2 16c0 2.46.67 4.88 1.94 7.02L2 30l7.17-1.88A13.94 13.94 0 0016 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.26 0-4.47-.61-6.4-1.77l-.46-.27-4.25 1.11 1.14-4.13-.3-.48A11.47 11.47 0 014.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zm6.3-8.6c-.34-.17-2.02-1-2.33-1.11-.32-.12-.54-.17-.77.17-.22.34-.87 1.11-1.07 1.34-.2.22-.4.25-.74.08-.34-.17-1.44-.53-2.74-1.69-1.01-.9-1.7-2.02-1.89-2.36-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.6.17-.2.22-.34.34-.57.11-.22.06-.42-.03-.59-.08-.17-.77-1.86-1.06-2.55-.28-.67-.56-.58-.77-.59h-.65c-.22 0-.57.08-.87.42-.3.34-1.14 1.11-1.14 2.71s1.17 3.14 1.33 3.36c.17.22 2.3 3.51 5.57 4.92.78.34 1.38.54 1.85.69.78.25 1.49.21 2.05.13.62-.09 1.92-.78 2.19-1.54.27-.76.27-1.41.19-1.54-.08-.13-.3-.21-.64-.38z"/></svg>
          Share via WhatsApp
        </a>

        <a
          href={`mailto:?subject=${emailSubject}&body=${emailBody}`}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "white", color: "#5a9aaa", border: "1.5px solid #5a9aaa", borderRadius: 9999, padding: "13px 24px", fontFamily: "Georgia, serif", fontSize: "0.95rem", textDecoration: "none" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#5a9aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Share via Email
        </a>
      </div>

      {/* CTA */}
      <button
        className="btn-primary"
        onClick={() => router.push(dashboardUrl)}
        style={{ minWidth: 200 }}
      >
        View My Dashboard →
      </button>

      <p style={{ fontFamily: "Georgia, serif", fontSize: "0.78rem", color: "#bbb" }}>
        Your dashboard will be at: <span style={{ color: "#5a9aaa" }}>{typeof window !== "undefined" ? window.location.origin : ""}{dashboardUrl}</span>
      </p>
    </div>
  );
}
