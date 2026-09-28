"use client";

import {
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { useEffect, useState } from "react";

import { mockCards } from "@/data/mock-card-data";

export function CardsView() {
  const [revealedCard, setRevealedCard] =
    useState<string | null>(null);

  useEffect(() => {
    if (!revealedCard) return;

    const timer = window.setTimeout(() => {
      setRevealedCard(null);
    }, 20_000);

    return () => window.clearTimeout(timer);
  }, [revealedCard]);

  async function copyCard(lastFour: string) {
    await navigator.clipboard.writeText(
      `Demo card ending ${lastFour}`
    );
  }

  return (
    <div>
      <h1 className="text-[30px] font-bold">
        Your cards
      </h1>

      <p className="mt-4 max-w-[650px] leading-6 text-[#68777e]">
        Sensitive details auto-hide after 20 seconds.
        Every reveal will later be recorded in your
        security activity.
      </p>

      <div className="mt-7 space-y-5">
        {mockCards.map((card) => {
          const revealed =
            revealedCard === card.id;

          return (
            <article
              key={card.id}
              className="
                relative overflow-hidden
                rounded-[24px]
                bg-[#003b4d]
                p-6
                text-white
                shadow-[0_16px_35px_rgba(0,49,65,0.18)]
              "
            >
              <div
                className="
                  absolute -right-12 -top-14
                  h-52 w-52
                  rounded-full
                  bg-white/[0.08]
                "
              />

              <div className="relative z-10">
                <div className="flex justify-between gap-4">
                  <p className="tracking-[0.15em] text-white/80">
                    {card.name}
                  </p>

                  <p className="font-semibold tracking-[0.12em] text-white/75">
                    VISA
                  </p>
                </div>

                <p
                  className="
                    mt-14
                    font-mono
                    text-[26px]
                    tracking-[0.14em]
                  "
                >
                  •••• •••• •••• {card.lastFour}
                </p>

                <div
                  className="
                    mt-8 flex
                    items-end justify-between
                    gap-5
                  "
                >
                  <div className="flex gap-12">
                    <div>
                      <p className="text-xs tracking-widest text-white/55">
                        EXPIRES
                      </p>

                      <p className="mt-2 font-mono text-lg">
                        {revealed
                          ? card.expiry
                          : "••/••"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs tracking-widest text-white/55">
                        CVV
                      </p>

                      <p className="mt-2 font-mono text-lg">
                        {revealed
                          ? card.cvv
                          : "•••"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCard(
                          revealed
                            ? null
                            : card.id
                        )
                      }
                      className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-full
                        bg-white/10
                      "
                      aria-label={
                        revealed
                          ? "Hide card details"
                          : "Show card details"
                      }
                    >
                      {revealed ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyCard(card.lastFour)
                      }
                      className="
                        flex h-11 w-11
                        items-center justify-center
                        rounded-full
                        bg-white/10
                      "
                      aria-label="Copy card"
                    >
                      <Copy size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}