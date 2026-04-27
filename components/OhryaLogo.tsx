"use client";

import Image from "next/image";

export default function OhryaLogo() {
  return (
    <div className="flex items-center gap-2 justify-center">
      <Image src="/logo.png" alt="Ohrya Logo" className="w-auto h-auto" width={190} height={190} />
    </div>
  );
}
