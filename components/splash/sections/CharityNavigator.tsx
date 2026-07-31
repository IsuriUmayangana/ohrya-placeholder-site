const CHARITY_URL = "https://www.charitynavigator.org/ein/394301898";

export default function CharityNavigator() {
  return (
    <section className="charity-navigator-section">
      <a
        className="charity-navigator-logo"
        href={CHARITY_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="View OHRYA Foundation on Charity Navigator"
      >
        <img
          src="/splash/assets/charity-navigator-logo.png"
          alt="Charity Navigator"
          width={217}
          height={105}
        />
      </a>
      <p className="charity-navigator-text">
        OHRYA Foundation Inc. is a registered 501(c)(3) nonprofit organization. To support transparency and public
        access to our nonprofit information,{" "}
        <a href={CHARITY_URL} target="_blank" rel="noopener noreferrer">
          our organizational profile
        </a>{" "}
        is available on Charity Navigator.
      </p>
    </section>
  );
}
