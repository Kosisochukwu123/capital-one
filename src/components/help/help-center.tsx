"use client";

import {
  ChevronDown,
  CircleHelp,
  CreditCard,
  Landmark,
  LockKeyhole,
  MessageCircle,
  Search,
  SendHorizontal,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useAppLoader } from "@/components/feedback/loading-provider";

type HelpItem = {
  question: string;
  answer: string;
};

type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: typeof CircleHelp;
  items: HelpItem[];
};

const helpCategories: HelpCategory[] = [
  {
    id: "transfers",
    title: "Transfers & payments",
    description:
      "Sending money, transfer status and payment issues.",
    icon: SendHorizontal,
    items: [
      {
        question:
          "Why is my transfer pending?",
        answer:
          "A pending transfer is still being processed. You can check its current status from Transactions. Once processing is complete, the transaction status will be updated.",
      },
      {
        question:
          "Why did my transfer fail?",
        answer:
          "A transfer may fail if the account is restricted, transfer access is unavailable, the balance is insufficient, or the transfer could not be completed. Check the transaction details for the reason provided.",
      },
      {
        question:
          "What happens when a transfer fails?",
        answer:
          "If money was already deducted for a transfer that later fails, the amount is returned to the account and the transaction history is updated.",
      },
      {
        question:
          "Where can I see my transfers?",
        answer:
          "Open Transactions from the navigation bar to view your transaction history and open an individual transaction for more information.",
      },
    ],
  },
  {
    id: "accounts",
    title: "Accounts",
    description:
      "Balances, account status and transfer access.",
    icon: Landmark,
    items: [
      {
        question:
          "Where can I see my balance?",
        answer:
          "Your total balance appears on At a glance. Individual Checking and Savings balances are displayed underneath the total.",
      },
      {
        question:
          "What does a frozen account mean?",
        answer:
          "A frozen account remains visible, but some account activity such as outgoing transfers may be unavailable until the restriction is removed.",
      },
      {
        question:
          "Why are transfers disabled?",
        answer:
          "Transfer access can be restricted separately from the account itself. Your Profile and At a glance pages show the current status of your accounts and transfer permissions.",
      },
      {
        question:
          "Where can I find my account information?",
        answer:
          "Your account information is available from At a glance and your Profile. Sensitive security information is not displayed.",
      },
    ],
  },
  {
    id: "cards",
    title: "Cards",
    description:
      "Card status and card-related information.",
    icon: CreditCard,
    items: [
      {
        question:
          "Where can I view my card?",
        answer:
          "Select My card from the bottom navigation to view your available card information and current card status.",
      },
      {
        question:
          "What does a frozen card mean?",
        answer:
          "A frozen card is temporarily unavailable for card activity until its status is restored.",
      },
      {
        question:
          "Is my full card information displayed?",
        answer:
          "For security, sensitive card information should not be unnecessarily exposed. The app displays only the information required for the banking experience.",
      },
    ],
  },
  {
    id: "security",
    title: "Security & PIN",
    description:
      "Transaction PIN and account security.",
    icon: LockKeyhole,
    items: [
      {
        question:
          "What is my transaction PIN for?",
        answer:
          "Your transaction PIN is used to authorize transfers and provides an additional security check before money is sent.",
      },
      {
        question:
          "Can support see my transaction PIN?",
        answer:
          "No. Your transaction PIN is stored securely and is not displayed to administrators or customer support.",
      },
      {
        question:
          "What if my PIN needs to be reset?",
        answer:
          "If your transaction PIN is reset, you may be required to configure a new PIN before making another transfer.",
      },
      {
        question:
          "Where do security alerts appear?",
        answer:
          "Important account and security alerts appear in Notifications. Use the bell icon at the top of the app to view them.",
      },
    ],
  },
  {
    id: "profile",
    title: "Profile",
    description:
      "Personal details and profile information.",
    icon: UserRound,
    items: [
      {
        question:
          "Where can I view my personal information?",
        answer:
          "Select the profile icon in the top navigation to view your registered personal information, customer ID and account access status.",
      },
      {
        question:
          "Can I add a profile photo?",
        answer:
          "Yes. Open your Profile and use the camera button on your profile picture to choose and upload an image.",
      },
      {
        question:
          "Where can I see my account restrictions?",
        answer:
          "Your Profile shows the current status and transfer availability of your Checking and Savings accounts.",
      },
    ],
  },
];

export function HelpCenter() {
  const { navigateWithLoader } =
    useAppLoader();

  const [search, setSearch] =
    useState("");

  const [openQuestion, setOpenQuestion] =
    useState<string | null>(null);

  const filteredCategories =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return helpCategories;
      }

      return helpCategories
        .map((category) => {
          const categoryMatches =
            category.title
              .toLowerCase()
              .includes(query) ||
            category.description
              .toLowerCase()
              .includes(query);

          const matchingItems =
            category.items.filter(
              (item) =>
                item.question
                  .toLowerCase()
                  .includes(query) ||
                item.answer
                  .toLowerCase()
                  .includes(query)
            );

          if (categoryMatches) {
            return category;
          }

          if (
            matchingItems.length > 0
          ) {
            return {
              ...category,
              items: matchingItems,
            };
          }

          return null;
        })
        .filter(
          (
            category
          ): category is HelpCategory =>
            category !== null
        );
    }, [search]);

  function toggleQuestion(
    questionId: string
  ) {
    setOpenQuestion((current) =>
      current === questionId
        ? null
        : questionId
    );
  }

  return (
    <div className="space-y-5">
      <section className="bank-card rounded-[24px] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce9ee] text-[#003b4d]">
          <CircleHelp size={25} />
        </div>

        <h1 className="mt-5 text-[28px] font-bold text-[#173743]">
          How can we help?
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          Find answers about your
          account, transfers, cards and
          security.
        </p>

        <div className="mt-6 flex h-[54px] items-center gap-3 rounded-[18px] border border-[#dce5e8] bg-[#f8fafb] px-4 focus-within:border-[#7ba1ae]">
          <Search
            size={20}
            className="shrink-0 text-[#718087]"
          />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search help topics"
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#173743] outline-none placeholder:text-[#8a989e]"
          />
        </div>
      </section>

      {filteredCategories.length >
      0 ? (
        filteredCategories.map(
          (category) => {
            const Icon =
              category.icon;

            return (
              <section
                key={category.id}
                className="bank-card overflow-hidden rounded-[24px]"
              >
                <div className="flex gap-4 p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e7f0f4] text-[#003b4d]">
                    <Icon size={21} />
                  </div>

                  <div>
                    <h2 className="text-[18px] font-bold text-[#173743]">
                      {
                        category.title
                      }
                    </h2>

                    <p className="mt-1 text-sm leading-5 text-[#718087]">
                      {
                        category.description
                      }
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#e4eaec]">
                  {category.items.map(
                    (
                      item,
                      index
                    ) => {
                      const questionId = `${category.id}-${index}`;

                      const isOpen =
                        openQuestion ===
                        questionId;

                      return (
                        <div
                          key={
                            questionId
                          }
                          className={
                            index !==
                            category
                              .items
                              .length -
                              1
                              ? "border-b border-[#e8edef]"
                              : ""
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              toggleQuestion(
                                questionId
                              )
                            }
                            aria-expanded={
                              isOpen
                            }
                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                          >
                            <span className="text-sm font-semibold leading-6 text-[#173743]">
                              {
                                item.question
                              }
                            </span>

                            <ChevronDown
                              size={19}
                              className={`shrink-0 text-[#718087] transition-transform ${
                                isOpen
                                  ? "rotate-180"
                                  : ""
                              }`}
                            />
                          </button>

                          {isOpen && (
                            <div className="px-5 pb-5">
                              <p className="text-sm leading-6 text-[#66777e]">
                                {
                                  item.answer
                                }
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    }
                  )}
                </div>
              </section>
            );
          }
        )
      ) : (
        <section className="bank-card rounded-[24px] px-6 py-10 text-center">
          <Search
            size={32}
            className="mx-auto text-[#8a989e]"
          />

          <p className="mt-4 font-bold text-[#173743]">
            No help topics found
          </p>

          <p className="mt-2 text-sm leading-6 text-[#718087]">
            Try another search or
            contact customer support.
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-[24px] bg-[#003b4d] p-6 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <MessageCircle
            size={24}
          />
        </div>

        <h2 className="mt-5 text-[22px] font-bold">
          Still need help?
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/70">
          Send a message to customer
          support and continue the
          conversation from your support
          inbox.
        </p>

        <button
          type="button"
          onClick={() =>
            navigateWithLoader(
              "/messages"
            )
          }
          className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-[#003b4d] transition hover:bg-[#f2f6f7]"
        >
          <MessageCircle
            size={19}
          />
          Message support
        </button>
      </section>
    </div>
  );
}