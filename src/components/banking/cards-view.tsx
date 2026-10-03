"use client";

import {
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  LockKeyhole,
  MoreHorizontal,
  ShieldCheck,
  Snowflake,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";

import { mockCards } from "@/data/mock-card-data";

export function CardsView() {
  const [revealedCard, setRevealedCard] =
    useState<string | null>(null);

  const [copiedCard, setCopiedCard] =
    useState<string | null>(null);

  useEffect(() => {
    if (!revealedCard) return;

    const timer = window.setTimeout(() => {
      setRevealedCard(null);
    }, 20_000);

    return () => window.clearTimeout(timer);
  }, [revealedCard]);

  useEffect(() => {
    if (!copiedCard) return;

    const timer = window.setTimeout(() => {
      setCopiedCard(null);
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copiedCard]);

  async function copyCard(
    cardId: string,
    lastFour: string
  ) {
    await navigator.clipboard.writeText(
      `Demo card ending ${lastFour}`
    );

    setCopiedCard(cardId);
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[15px] bg-[#e8f3f6] text-[#003b4d]">
            <CreditCard size={21} />
          </div>

          <div>
            <h1 className="text-[28px] font-bold tracking-tight text-[#173743]">
              Your cards
            </h1>

            <p className="mt-1 max-w-[620px] text-sm leading-6 text-[#718087]">
              View and manage the cards connected to your accounts.
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {mockCards.map((card, index) => {
          const revealed =
            revealedCard === card.id;

          const copied =
            copiedCard === card.id;

          return (
            <section
              key={card.id}
              className="overflow-hidden rounded-[26px] bg-white shadow-[0_8px_30px_rgba(23,55,67,0.06)]"
            >
              <div className="p-4 sm:p-5">
                <article className="relative min-h-[260px] overflow-hidden rounded-[24px] bg-gradient-to-br from-[#00667d] via-[#004b61] to-[#002f3e] p-6 text-white shadow-[0_18px_40px_rgba(0,49,65,0.22)] sm:p-7">
                  <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-white/[0.07]" />
                  <div className="pointer-events-none absolute -bottom-32 -left-20 h-64 w-64 rounded-full border-[42px] border-white/[0.05]" />
                  <div className="pointer-events-none absolute -bottom-24 right-6 h-52 w-80 rotate-[-15deg] rounded-[50%] border-[32px] border-white/[0.04]" />

                  <div className="relative z-10 flex min-h-[210px] flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">
                          Northstar Banking
                        </p>

                        <p className="mt-2 text-lg font-bold">
                          {card.name}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Wifi
                          size={22}
                          className="rotate-90 text-white/75"
                        />

                        <p className="text-lg font-black italic tracking-wide">
                          VISA
                        </p>
                      </div>
                    </div>

                    <div>
                      <div className="mb-5 flex h-10 w-12 items-center justify-center rounded-lg border border-white/25 bg-gradient-to-br from-[#e7d49b]/80 to-[#bda967]/70">
                        <div className="h-5 w-7 rounded border border-white/30" />
                      </div>

                      <p className="font-mono text-[21px] font-semibold tracking-[0.15em] sm:text-[25px]">
                        •••• •••• •••• {card.lastFour}
                      </p>

                      <div className="mt-6 flex items-end justify-between gap-5">
                        <div className="flex gap-8 sm:gap-12">
                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                              Expires
                            </p>

                            <p className="mt-1.5 font-mono text-sm font-semibold">
                              {revealed
                                ? card.expiry
                                : "••/••"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                              Security
                            </p>

                            <p className="mt-1.5 font-mono text-sm font-semibold">
                              {revealed
                                ? card.cvv
                                : "•••"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-white/45">
                          {index === 0
                            ? "Primary"
                            : "Virtual"}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              </div>

              <div className="px-5 pb-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-[#173743]">
                      Card details
                    </p>

                    <p className="mt-1 text-xs text-[#718087]">
                      Sensitive demo details hide automatically after 20 seconds.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCard(
                          revealed
                            ? null
                            : card.id
                        )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#edf5f7] px-4 text-xs font-bold text-[#003b4d] transition hover:bg-[#e2eef1]"
                    >
                      {revealed ? (
                        <>
                          <EyeOff size={16} />
                          Hide
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          Show
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyCard(
                          card.id,
                          card.lastFour
                        )
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dce6e9] px-4 text-xs font-bold text-[#173743] transition hover:bg-[#f5f8f9]"
                    >
                      <Copy size={15} />

                      {copied
                        ? "Copied"
                        : "Copy"}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <section className="rounded-[24px] bg-white p-5 shadow-[0_8px_30px_rgba(23,55,67,0.05)]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[#718087]">
              Card controls
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#173743]">
              Manage your cards
            </h2>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
            <ShieldCheck size={21} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CardAction
            icon={<Snowflake size={19} />}
            title="Freeze card"
            description="Temporarily lock"
          />

          <CardAction
            icon={<LockKeyhole size={19} />}
            title="Security"
            description="Card protection"
          />

          <CardAction
            icon={<MoreHorizontal size={20} />}
            title="More"
            description="Other controls"
          />
        </div>
      </section>

      <div className="flex gap-3 rounded-[20px] border border-[#dce8eb] bg-[#f7fbfc] p-4">
        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-[#006b7d]"
        />

        <div>
          <p className="text-sm font-bold text-[#173743]">
            Your card details are protected
          </p>

          <p className="mt-1 text-xs leading-5 text-[#718087]">
            Only limited simulator card information is displayed here. Full payment card numbers are not stored or exposed.
          </p>
        </div>
      </div>
    </div>
  );
}

function CardAction({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      className="rounded-[18px] border border-[#e2e9eb] bg-white p-4 text-left transition hover:border-[#bfd2d8] hover:bg-[#f8fbfc]"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#006b7d]">
        {icon}
      </div>

      <p className="mt-4 text-sm font-bold text-[#173743]">
        {title}
      </p>

      <p className="mt-1 text-xs text-[#829096]">
        {description}
      </p>
    </button>
  );
}