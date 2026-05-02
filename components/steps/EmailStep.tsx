"use client";

interface Props {
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function EmailStep({ value, onChange, error }: Props) {
  return (
    <div className="flex flex-col items-center gap-8 px-6 w-full max-w-xl mx-auto">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-[20px] lg:text-[28px] font-normal leading-[26px] lg:leading-[36px] tracking-[-0.25px] lg:tracking-[-0.5px] lg:whitespace-nowrap"
        >
          Want to hear when the first campaigns go live?*
        </h2>
        <p className="text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#777]">
          Register with your email now*
        </p>
      </div>

      <div className="w-full flex flex-col gap-1">
        <input
          type="email"
          placeholder="name@example.com"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
          className="w-full border-b-[1.5px] border-[#b0b0b0] focus:border-[#5a9aaa] outline-none text-[16px] lg:text-[18px] leading-[22px] lg:leading-[24px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#2d2d2d] p-[10px] 4px bg-transparent"
        />
        {error && (
          <p className="text-[14px] lg:text-[16px] leading-[20px] lg:leading-[22px] text-thin-text tracking-[0px] lg:tracking-[0.5px] text-[#c0392b]">{error}</p>
        )}
      </div>
    </div>
  );
}