"use client";

import { Eye } from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";

export function AccountDetails() {
  const { showLoader, hideLoader } = useAppLoader();

  function handleShow() {
    showLoader();

    setTimeout(() => {
      hideLoader();
    }, 700);
  }

  return (
    <section className="bank-card rounded-[24px] p-5 sm:p-7">
      <div className="flex items-center justify-between gap-5">
        <div>
          <h2 className="text-[24px] font-bold">
            Account details
          </h2>

          <p className="mt-1 text-sm text-[#68787f]">
            Routing and account numbers for deposits
          </p>
        </div>

        <button
          onClick={handleShow}
          className="
            flex shrink-0 items-center
            gap-2 font-semibold
            text-[#c94951]
          "
        >
          <Eye size={19} />

          Show
        </button>
      </div>
    </section>
  );
}