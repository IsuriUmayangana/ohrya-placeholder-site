const STEPS = [
  {
    number: "1",
    title: "Join a Campaign",
    description: "Create your free account and choose the campaign you want to support.",
  },
  {
    number: "2",
    title: "Share Your Link",
    description:
      "Invite friends, family, and your community to participate using your unique referral link.",
  },
  {
    number: "3",
    title: "Grow Your Impact",
    description:
      "Referrals help increase your performance, support your charity, and move you up the leaderboard.",
  },
];

export default function Steps() {
  return (
    <section className="steps-section">
      <h2 className="steps-heading">Joining an OHRYA campaign takes less than a minute.</h2>

      {STEPS.map((step) => (
        <article key={step.number} className="step-card glass-panel">
          <div className="step-number" aria-hidden="true">
            {step.number}
          </div>
          <div className="step-content">
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
