"use client";

interface Props {
  score: number;
  campaign: string;
  email: string;
  onRestart: () => void;
}

export default function ThankYouStep({ score, campaign, email, onRestart }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-6 text-center max-w-lg mx-auto">
      <div className="flex flex-col items-center gap-4">
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#5a9aaa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.3rem, 3vw, 1.8rem)",
            fontWeight: "400",
            color: "#2d2d2d",
          }}
        >
          Thank you for taking action!
        </h2>

        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "1rem",
            color: "#555",
            lineHeight: 1.7,
          }}
        >
          You scored <strong style={{ color: "#5a9aaa" }}>{score} points</strong> on your Social Impact Score.
          <br />
          We&apos;ll let you know when the first{" "}
          <strong style={{ color: "#2d2d2d" }}>{campaign}</strong> campaigns go live
          {email ? ` at ${email}` : ""}.
        </p>

        <p
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "0.95rem",
            color: "#777",
            letterSpacing: "0.05em",
          }}
        >
          GIVE. VOTE. SHINE.
        </p>
      </div>

      <button
        className="btn-primary"
        onClick={onRestart}
        style={{ minWidth: 160 }}
      >
        Start Over
      </button>
    </div>
  );
}
