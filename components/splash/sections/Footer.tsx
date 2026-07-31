import Link from "next/link";

const SOCIALS = [
  {
    label: "OHRYA on LinkedIn",
    href: "https://www.linkedin.com/company/ohrya",
    icon: "/splash/assets/icon-linkedin.svg",
    width: 28,
    height: 27,
  },
  {
    label: "OHRYA on Facebook",
    href: "https://www.facebook.com/ohryafoundation",
    icon: "/splash/assets/icon-facebook.svg",
    width: 15,
    height: 27,
  },
  {
    label: "OHRYA on Instagram",
    href: "https://www.instagram.com/ohryafoundation/",
    icon: "/splash/assets/icon-instagram.svg",
    width: 28,
    height: 27,
  },
  {
    label: "OHRYA on TikTok",
    href: "https://www.tiktok.com/@ohryafoundation",
    icon: "/splash/assets/icon-tiktok.svg",
    width: 23,
    height: 27,
  },
];

export default function Footer() {
  return (
    <>
      <nav className="social-icons" aria-label="OHRYA on social media">
        {SOCIALS.map((social) => (
          <a
            key={social.label}
            href={social.href}
            className="social-icon"
            aria-label={social.label}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={social.icon}
              alt=""
              width={social.width}
              height={social.height}
              aria-hidden="true"
            />
          </a>
        ))}
      </nav>

      <p className="disclaimer footer-disclaimer">
        Terms and conditions apply. Participation, eligibility, referral qualification,
        <br className="mobile-display-br" />
        campaign dates, and recognition details are subject to the official campaign rules.
      </p>

      <footer className="site-footer">
        <p className="contact-info">
          <span className="contact-label">For media or partnership inquiries:</span>{" "}
          <span className="contact-links">
            <a href="mailto:hello@ohrya.org">hello@ohrya.org</a>
            <span className="divider">|</span>
            <a href="tel:9544000687">954-400-0687</a>
          </span>
        </p>
        <p className="footer-links">
          <Link href="/terms-of-service">Terms &amp; Conditions</Link>
          <Link href="/privacy-policy">Privacy Policy</Link>
        </p>
      </footer>
    </>
  );
}
