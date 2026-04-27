"use client";

import { useState } from "react";
import WelcomeStep from "./steps/WelcomeStep";
import StepButton from "./ui/StepButton";

export default function StepContainer() {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 gap-8 min-h-screen bg-white">
        {/* Main Container */}
        <div className="flex flex-col items-center justify-center text-center px-6 gap-8">
            <WelcomeStep />
        </div>

        {/* Step Buttons */}
        <div className="flex flex-col items-center justify-center text-center px-6 gap-8">
            <StepButton onClick={() => { console.log("Get Started"); }}>Get Started</StepButton>
        </div>
    </div>
  );
}