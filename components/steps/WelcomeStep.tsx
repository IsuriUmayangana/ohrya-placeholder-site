"use client";

interface Props {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: Props) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 gap-8">
      <div className="flex flex-col items-center gap-5 max-w-lg">
        <h1
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
            fontWeight: "400",
            color: "#2d2d2d",
            lineHeight: 1.4,
          }}
        >
          Where Advocacy and Philanthropy Earn the Iconic.
        </h1>
        <p
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(0.9rem, 2vw, 1rem)",
            color: "#555",
            lineHeight: 1.7,
          }}
        >
          Every action you take builds your Social Impact Score — it&apos;s as simple as
          <br />
          <strong style={{ color: "#2d2d2d" }}>GIVE. VOTE. SHINE.</strong>
        </p>
      </div>
      <button className="btn-primary" onClick={onNext} style={{ minWidth: 140 }}>
        Get Started
      </button>
    </div>
  );
}
