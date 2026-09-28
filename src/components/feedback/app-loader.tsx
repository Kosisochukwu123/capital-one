import { Landmark } from "lucide-react";

interface AppLoaderProps {
  open: boolean;
}

export function AppLoader({ open }: AppLoaderProps) {
  if (!open) return null;

  return (
    <div
      className="
        fixed inset-0 z-[9999]
        flex items-center justify-center
        bg-[#e9f2f7]/80
        backdrop-blur-[2px]
      "
    >
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div
          className="
            absolute inset-0
            animate-spin
            rounded-full
            border-[3px]
            border-[#b7ccd5]
            border-t-[#003b4d]
          "
        />

        <div
          className="
            flex h-[68px] w-[68px]
            items-center justify-center
            rounded-full bg-white
            shadow-lg
          "
        >
          <Landmark
            size={31}
            strokeWidth={2}
            className="text-[#003b4d]"
          />
        </div>
      </div>
    </div>
  );
}