"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Props {
  /** Referrer first name — banner is hidden when omitted. */
  announceName?: string;
}

const LEADERBOARD_PATH = "/leaderboard";
const DASHBOARD_PATH = "/dashboard";

function NavButtons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <Link
        className="site-nav-btn site-nav-btn-leaderboard"
        href={LEADERBOARD_PATH}
        onClick={onNavigate}
      >
        Leaderboard
      </Link>
      <Link
        className="site-nav-btn site-nav-btn-dashboard"
        href={DASHBOARD_PATH}
        onClick={onNavigate}
      >
        Visit Dashboard
      </Link>
    </>
  );
}

export default function Header({ announceName }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const announceRef = useRef<HTMLDivElement>(null);
  const [announceHeight, setAnnounceHeight] = useState<number | null>(null);
  const showAnnounce = Boolean(announceName?.trim());

  useEffect(() => {
    if (!showAnnounce) {
      setAnnounceHeight(0);
      return undefined;
    }

    const el = announceRef.current;
    if (!el) return undefined;

    const observer = new ResizeObserver(() => {
      setAnnounceHeight(el.offsetHeight);
    });

    observer.observe(el);
    setAnnounceHeight(el.offsetHeight);

    return () => observer.disconnect();
  }, [announceName, showAnnounce]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className="header"
      style={
        announceHeight === null && showAnnounce
          ? undefined
          : ({ "--announce-h": `${announceHeight ?? 0}px` } as React.CSSProperties)
      }
    >
      <div className="site-header-fixed">
        {showAnnounce && (
          <div className="site-announce" ref={announceRef}>
            <p className="site-announce-text">
              {`${announceName} invited you to OHRYA!`}
            </p>
          </div>
        )}

        <nav className="site-nav" aria-label="Main">
          <div className="site-nav-inner">
            <Link href="/" className="site-nav-brand" onClick={closeMenu}>
              <Image
                src="/splash/assets/ohrya-wordmark.svg"
                alt="OHRYA"
                width={152}
                height={40}
                className="site-nav-wordmark"
                priority
              />
            </Link>

            <button
              type="button"
              className={`site-nav-toggle${menuOpen ? " is-open" : ""}`}
              aria-expanded={menuOpen}
              aria-controls="site-nav-drawer"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
              <span className="site-nav-toggle-bar" aria-hidden="true" />
              <span className="site-nav-toggle-bar" aria-hidden="true" />
              <span className="site-nav-toggle-bar" aria-hidden="true" />
            </button>

            <div className="site-nav-actions">
              <NavButtons />
            </div>
          </div>

          <div
            id="site-nav-drawer"
            className={`site-nav-drawer${menuOpen ? " is-open" : ""}`}
          >
            <div className="site-nav-drawer-track">
              <div className="site-nav-drawer-inner">
                <NavButtons onNavigate={closeMenu} />
              </div>
            </div>
          </div>
        </nav>
      </div>

      <button
        type="button"
        className={`site-nav-backdrop${menuOpen ? " is-open" : ""}`}
        tabIndex={-1}
        aria-hidden="true"
        onClick={closeMenu}
      />

      <div className="site-nav-spacer" aria-hidden="true" />

      <div className="logo">
        <img
          src="/splash/assets/ohrya-logo.svg"
          alt="OHRYA - Hearts • Advocacy • Rewards"
          className="logo-svg"
          width={250}
          height={213}
        />
      </div>
    </header>
  );
}
