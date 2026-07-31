import type { FormEvent, ReactNode } from "react";
import JoinCampaignSurface, { type CampaignId } from "../JoinCampaignSurface";

type JoinFormSectionProps = {
  selectedCampaign: CampaignId;
  onCampaignChange: (campaign: CampaignId) => void;
  name: string;
  onNameChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  error?: ReactNode;
  submitting?: boolean;
};

export default function JoinFormSection({
  selectedCampaign,
  onCampaignChange,
  name,
  onNameChange,
  email,
  onEmailChange,
  onSubmit,
  error,
  submitting,
}: JoinFormSectionProps) {
  return (
    <section className="join-section" id="join-form">
      <div className="join-card glass-panel">
        <JoinCampaignSurface
          selectedCampaign={selectedCampaign}
          onCampaignChange={onCampaignChange}
          name={name}
          onNameChange={onNameChange}
          email={email}
          onEmailChange={onEmailChange}
          onSubmit={onSubmit}
          error={error}
          submitting={submitting}
        />
      </div>
    </section>
  );
}
