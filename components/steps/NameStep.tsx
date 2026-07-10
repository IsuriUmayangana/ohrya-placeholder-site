"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const inputClassName =
  "w-full border-b-[1.5px] border-[#b0b0b0] focus:border-[#5a9aaa] outline-none text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#2d2d2d] p-[10px] 4px bg-transparent";

export default function NameStep({ value, onChange, error }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-4 sm:px-6 w-full max-w-2xl mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] lg:whitespace-nowrap">
          Tell us who you are.
        </h2>
        <p className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#777]">
          Enter your name below.
        </p>
      </div>

      <div className="w-full min-w-[280px] sm:min-w-[360px] md:min-w-[480px] flex flex-col gap-1">
        <input
          type="text"
          placeholder="Name"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          autoComplete="name"
          className={inputClassName}
        />
        {error && (
          <p className="text-[14px] lg:text-[16px] leading-[20px] lg:leading-[22px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#c0392b]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
