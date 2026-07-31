import Button from "../Button";

export default function Hero() {
  return (
    <section className="hero-section">
      <h1 className="hero-title">
        Change Lives. Create Impact.
        <br />
        Earn an Amazing Reward.
      </h1>
      <p className="hero-subtitle">
        Every share has the power to help a charity reach more people.
        <br />
        Join a campaign, spread the word, and be rewarded for the impact you create.
      </p>

      <div className="reward-cards">
        <article className="reward-card glass-panel">
          <span className="reward-amount">$2,500</span>
          <span className="reward-label">
            To the charity
            <br />
            you choose
          </span>
        </article>
        <span className="reward-plus" aria-hidden="true">
          +
        </span>
        <article className="reward-card glass-panel">
          <span className="reward-amount">$2,500</span>
          <span className="reward-label">
            For
            <br />
            yourself
          </span>
        </article>
      </div>

      <p className="hero-tagline">Free to join • Verified charities • Real rewards</p>

      <Button href="#join-form" className="join-campaign-btn">
        Join a Campaign
      </Button>

      <p className="hero-advocate">
        The top performing participant will receive $2,500 and help direct another $2,500 from OHRYA to charity.
      </p>
    </section>
  );
}
