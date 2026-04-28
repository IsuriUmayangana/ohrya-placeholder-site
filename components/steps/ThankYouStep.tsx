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
        <div className="w-18 h-18 rounded-full bg-[#5a9aaa] flex items-center justify-center"
        >
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h2
          className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] text-balance"
        >
          Thank you for taking action!
        </h2>

        <p
          className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px]"
        >
          You scored <strong className="text-[#5a9aaa]">{score} points</strong> on your Social Impact Score.
          <br />
          We&apos;ll let you know when the first{" "}
          <strong className="text-[#2d2d2d]">{campaign}</strong> campaigns go live
          {email ? ` at ${email}` : ""}.
        </p>

        <p
          className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#777]"
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
