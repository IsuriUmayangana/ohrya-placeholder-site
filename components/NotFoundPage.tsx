"use client";

import { useRouter } from "next/navigation";
import { buildAbsoluteSiteUrl } from "@/lib/site-urls";
import "./not-found.css";

const HOME_URL = buildAbsoluteSiteUrl("/");

export default function NotFoundPage() {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }
    router.push("/");
  }

  return (
    <div className="not-found-page">
      <div className="not-found-page__background" aria-hidden="true" />

      <div className="not-found-page__content">
        <img
          src="/logo-white.png"
          alt="OHRYA"
          className="not-found-page__logo"
          width={220}
          height={72}
        />

        <p className="not-found-page__code">404</p>
        <h1 className="not-found-page__title">Page not found</h1>
        <p className="not-found-page__description">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Head home or go back to continue.
        </p>

        <div className="not-found-page__actions">
          <button
            type="button"
            className="not-found-page__btn not-found-page__btn--back"
            onClick={handleBack}
          >
            Go back
          </button>
          <a href={HOME_URL} className="not-found-page__btn not-found-page__btn--home">
            Go to home
          </a>
        </div>
      </div>
    </div>
  );
}
