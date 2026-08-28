"use client";

import { FormEvent, type ReactNode } from "react";

export type CampaignId = "Children" | "Pets" | "Veterans";

export const JOIN_CAMPAIGNS: {
  id: CampaignId;
  label: string;
  image: string;
  surveyValue: string;
}[] = [
  {
    id: "Children",
    label: "Children",
    surveyValue: "Children",
    image: "/splash/assets/campaign-children.png",
  },
  {
    id: "Pets",
    label: "Animals",
    surveyValue: "Animals",
    image: "/splash/assets/campaign-pets.png",
  },
  {
    id: "Veterans",
    label: "Veterans",
    surveyValue: "Veterans",
    image: "/splash/assets/campaign-veterans.png",
  },
];

type JoinCampaignSurfaceProps = {
  selectedCampaign: CampaignId;
  onCampaignChange: (campaign: CampaignId) => void;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error?: ReactNode;
  submitting?: boolean;
  showHeading?: boolean;
};

export default function JoinCampaignSurface({
  selectedCampaign,
  onCampaignChange,
  name,
  onNameChange,
  email,
  onEmailChange,
  onSubmit,
  error,
  submitting = false,
  showHeading = true,
}: JoinCampaignSurfaceProps) {
  return (
    <div className="join-surface">
      {showHeading && (
        <>
          <h2 className="join-title">Join a Campaign</h2>
          <p className="join-subtitle">Select a campaign you want to support</p>
        </>
      )}

      <div className="campaign-options">
        {JOIN_CAMPAIGNS.map((campaign) => {
          const selected = selectedCampaign === campaign.id;
          return (
            <button
              key={campaign.id}
              type="button"
              className={`campaign-option${selected ? " is-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => onCampaignChange(campaign.id)}
            >
              <span className="campaign-thumb">
                <img src={campaign.image} alt={`${campaign.label} campaign`} />
              </span>
              <span className="campaign-name">{campaign.label}</span>
            </button>
          );
        })}
      </div>

      <form className="join-form" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label className="form-label" htmlFor="join-name">
            Name
          </label>
          <input
            className="form-input"
            type="text"
            id="join-name"
            name="name"
            placeholder="e.g. Alex Doe"
            autoComplete="name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            required
            suppressHydrationWarning
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="join-email">
            Email address
          </label>
          <input
            className="form-input"
            type="email"
            id="join-email"
            name="email"
            placeholder="alex@email.com"
            autoComplete="email"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            suppressHydrationWarning
          />
        </div>

        <button type="submit" className="join-submit-btn" disabled={submitting}>
          <span>{submitting ? "Continuing…" : "Sign up & Get Your Link"}</span>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 11h12.17l-3.58-3.59L14 6l6 6-6 6-1.41-1.41L16.17 13H4z" fill="currentColor" />
          </svg>
        </button>

        {error && <p className="join-form-error">{error}</p>}
      </form>

      <p className="join-disclaimer">
        We never sell your data. No purchase or donation required.
        <br />
        Qualified referrals are tracked on the leaderboard.
      </p>
    </div>
  );
}

export function getSurveyCampaignValue(campaignId: CampaignId): string {
  return JOIN_CAMPAIGNS.find((c) => c.id === campaignId)?.surveyValue ?? "Animals";
}
