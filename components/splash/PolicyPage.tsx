"use client";

import Link from "next/link";
import { useEffect } from "react";
import "./splash.css";

type PolicyPageProps = {
  html: string;
};

export default function PolicyPage({ html }: PolicyPageProps) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="privacy-page">
      <div className="policy-container">
        <p className="policy-back">
          <Link href="/">← Back to OHRYA</Link>
        </p>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
}

export { type PolicyPageProps };
