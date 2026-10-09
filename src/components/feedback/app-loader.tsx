
import Image from "next/image";

interface AppLoaderProps {
  open: boolean;
}

export function AppLoader({ open }: AppLoaderProps) {
  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#e9f2f7]/80 backdrop-blur-[2px]"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-28 w-28 items-center justify-center">
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#b7ccd5] border-t-[#003b4d]" />

          <div className="flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full bg-white shadow-lg">
            <Image
              src="/northstar-icon.png"
              alt="NorthstarBank"
              width={96}
              height={96}
              priority
              className="h-[76px] w-[76px] object-contain"
            />
          </div>
        </div>

        <p className="text-sm font-semibold tracking-wide text-[#003b4d]">
          Loading...
        </p>
      </div>
    </div>
  );
}
