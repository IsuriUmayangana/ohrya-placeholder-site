import Image from "next/image";

export default function Header() {
  return (
    <header className="sticky top-2 left-0 right-0 z-20 backdrop-blur bg-white/80 ">
        <div className="mx-auto px-4 sm:px-6 py-0 flex justify-center">
            <Image src="/logo.png" alt="Ohrya Logo" className="w-auto h-auto" width={190} height={190} />
        </div>
    </header>
  );
}