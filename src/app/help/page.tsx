import { Bell, CheckCheck } from "lucide-react";

import { BankingPage } from "@/components/banking/banking-page";

export default function HelpPage() {
  return (
    <BankingPage title="Help & messages">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-[30px] font-bold">
            Notifications
          </h1>

          <button
            type="button"
            className="
              flex items-center gap-2
              rounded-full
              border border-[#d5dfe3]
              bg-white
              px-5 py-3
              font-semibold
            "
          >
            <CheckCheck size={19} />
            Mark all read
          </button>
        </div>

        <section
          className="
            bank-card mt-6
            flex min-h-[250px]
            flex-col items-center
            justify-center
            rounded-[24px]
            px-5 text-center
          "
        >
          <Bell
            size={38}
            strokeWidth={1.6}
            className="text-[#8b989d]"
          />

          <p className="mt-5 text-[18px] text-[#52666e]">
            You&apos;re all caught up.
          </p>
        </section>
      </div>
    </BankingPage>
  );
}