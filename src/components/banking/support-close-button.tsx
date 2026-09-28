"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export function SupportCloseButton() {
  const router = useRouter();

  function handleClose() {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  }

  return (
    <button
      type="button"
      onClick={handleClose}
      aria-label="Close customer care"
      title="Close"
      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#173743] transition hover:bg-[#dfecef] active:scale-95"
    >
      <X size={20} />
    </button>
  );
}