"use client";

import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Landmark,
  ReceiptText,
  XCircle,
} from "lucide-react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils";
import { useAppLoader } from "@/components/feedback/loading-provider";

type TransactionStatus =
  | "PENDING"
  | "COMPLETED"
  | "FAILED"
  | "REVERSED";

type TransactionDetails = {
  id: string;
  reference: string;
  title: string;
  type: "CREDIT" | "DEBIT";
  status: TransactionStatus;
  statusReason: string | null;
  amount: number;
  transactionDate: Date | string;
  description: string | null;
  memo: string | null;
  category: string | null;
  account: {
    type: "CHECKING" | "SAVINGS";
    accountNumber: string;
    currency: string;
  };
  transfer: {
    recipientName: string | null;
    recipientBankName: string | null;
    recipientAccountNumber: string;
  } | null;
};

interface TransactionDetailsViewProps {
  transaction: TransactionDetails;
}

const locales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

const detailTranslations = {
  en: {
    pageTitle: "Transaction details",
    recipientInformation: "Recipient information",
    transferDestination: "Transfer destination",
    recipient: "Recipient",
    bank: "Bank",
    transactionInformation: "Transaction information",
    referenceNumber: "Reference number",
    transactionType: "Transaction type",
    fromAccount: "From account",
    transactionDate: "Transaction date",
    currency: "Currency",
    additionalInformation: "Additional information",
    memo: "Memo",
    category: "Category",
    credit: "Credit",
    debit: "Debit",
    pending: "Pending",
    completed: "Completed",
    failed: "Failed",
    reversed: "Reversed",
    completedMessage: "This transaction has been completed.",
    pendingMessage: "This transaction is currently being processed.",
    failedMessage: "This transaction could not be completed.",
    reversedMessage: "This transaction has been reversed.",
  },
  fr: {
    pageTitle: "Détails de la transaction",
    recipientInformation: "Informations sur le bénéficiaire",
    transferDestination: "Destination du virement",
    recipient: "Bénéficiaire",
    bank: "Banque",
    transactionInformation: "Informations sur la transaction",
    referenceNumber: "Numéro de référence",
    transactionType: "Type de transaction",
    fromAccount: "Compte d'origine",
    transactionDate: "Date de la transaction",
    currency: "Devise",
    additionalInformation: "Informations complémentaires",
    memo: "Note",
    category: "Catégorie",
    credit: "Crédit",
    debit: "Débit",
    pending: "En attente",
    completed: "Terminée",
    failed: "Échouée",
    reversed: "Annulée",
    completedMessage: "Cette transaction a été effectuée.",
    pendingMessage: "Cette transaction est en cours de traitement.",
    failedMessage: "Cette transaction n'a pas pu être effectuée.",
    reversedMessage: "Cette transaction a été annulée.",
  },
  es: {
    pageTitle: "Detalles de la transacción",
    recipientInformation: "Información del destinatario",
    transferDestination: "Destino de la transferencia",
    recipient: "Destinatario",
    bank: "Banco",
    transactionInformation: "Información de la transacción",
    referenceNumber: "Número de referencia",
    transactionType: "Tipo de transacción",
    fromAccount: "Cuenta de origen",
    transactionDate: "Fecha de la transacción",
    currency: "Moneda",
    additionalInformation: "Información adicional",
    memo: "Nota",
    category: "Categoría",
    credit: "Crédito",
    debit: "Débito",
    pending: "Pendiente",
    completed: "Completada",
    failed: "Fallida",
    reversed: "Revertida",
    completedMessage: "Esta transacción se ha completado.",
    pendingMessage: "Esta transacción se está procesando.",
    failedMessage: "No se pudo completar esta transacción.",
    reversedMessage: "Esta transacción ha sido revertida.",
  },
  de: {
    pageTitle: "Transaktionsdetails",
    recipientInformation: "Empfängerinformationen",
    transferDestination: "Überweisungsziel",
    recipient: "Empfänger",
    bank: "Bank",
    transactionInformation: "Transaktionsinformationen",
    referenceNumber: "Referenznummer",
    transactionType: "Transaktionstyp",
    fromAccount: "Ausgangskonto",
    transactionDate: "Transaktionsdatum",
    currency: "Währung",
    additionalInformation: "Zusätzliche Informationen",
    memo: "Notiz",
    category: "Kategorie",
    credit: "Gutschrift",
    debit: "Belastung",
    pending: "Ausstehend",
    completed: "Abgeschlossen",
    failed: "Fehlgeschlagen",
    reversed: "Rückgängig gemacht",
    completedMessage: "Diese Transaktion wurde abgeschlossen.",
    pendingMessage: "Diese Transaktion wird derzeit bearbeitet.",
    failedMessage: "Diese Transaktion konnte nicht abgeschlossen werden.",
    reversedMessage: "Diese Transaktion wurde rückgängig gemacht.",
  },
  pt: {
    pageTitle: "Detalhes da transação",
    recipientInformation: "Informações do destinatário",
    transferDestination: "Destino da transferência",
    recipient: "Destinatário",
    bank: "Banco",
    transactionInformation: "Informações da transação",
    referenceNumber: "Número de referência",
    transactionType: "Tipo de transação",
    fromAccount: "Conta de origem",
    transactionDate: "Data da transação",
    currency: "Moeda",
    additionalInformation: "Informações adicionais",
    memo: "Nota",
    category: "Categoria",
    credit: "Crédito",
    debit: "Débito",
    pending: "Pendente",
    completed: "Concluída",
    failed: "Falhou",
    reversed: "Revertida",
    completedMessage: "Esta transação foi concluída.",
    pendingMessage: "Esta transação está sendo processada.",
    failedMessage: "Não foi possível concluir esta transação.",
    reversedMessage: "Esta transação foi revertida.",
  },
} satisfies Record<Language, Record<string, string>>;

function formatDateTime(
  date: Date | string | null,
  language: Language
) {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parsed);
}

function maskAccountNumber(accountNumber: string) {
  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  return `••••••${accountNumber.slice(-4)}`;
}

function StatusIcon({
  status,
}: {
  status: TransactionStatus;
}) {
  if (status === "COMPLETED") {
    return <CheckCircle2 size={25} />;
  }

  if (status === "FAILED") {
    return <XCircle size={25} />;
  }

  return <Clock3 size={25} />;
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <span className="text-sm text-[#718087]">
        {label}
      </span>

      <strong className="max-w-[65%] break-words text-right text-sm text-[#173743]">
        {value}
      </strong>
    </div>
  );
}

function TextDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-[#173743]">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#66777e]">
        {value}
      </p>
    </div>
  );
}

export function TransactionDetailsView({
  transaction,
}: TransactionDetailsViewProps) {
  const { language } = useLanguage();
  const { navigateWithLoader } = useAppLoader();

  const t = translations[language];
  const dt = detailTranslations[language];

  const statusLabels: Record<TransactionStatus, string> = {
    PENDING: dt.pending,
    COMPLETED: dt.completed,
    FAILED: dt.failed,
    REVERSED: dt.reversed,
  };

  const statusMessages: Record<TransactionStatus, string> = {
    PENDING: dt.pendingMessage,
    COMPLETED: dt.completedMessage,
    FAILED: dt.failedMessage,
    REVERSED: dt.reversedMessage,
  };

  const accountName =
    transaction.account.type === "CHECKING"
      ? t.dashboard.checking
      : t.dashboard.savings;

  return (
    <>
      <Link
        href="/transactions"
        onClick={(event) => {
          event.preventDefault();
          navigateWithLoader("/transactions");
        }}
        className="inline-flex items-center gap-2 font-semibold text-[#006b7d]"
      >
        <ArrowLeft size={18} />
        {t.navigation.transactions}
      </Link>

      <section className="mt-5 overflow-hidden rounded-[26px] bg-white">
        <div className="px-6 py-7 sm:px-8">
          <div className="flex items-start justify-between gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                <ReceiptText size={23} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-[#173743]">
                  {transaction.title}
                </p>

                <p className="mt-1 break-all font-mono text-xs text-[#718087]">
                  {transaction.reference}
                </p>
              </div>
            </div>

            <div className="shrink-0 text-right">
              <p
                className={`text-xl font-bold ${transaction.type === "CREDIT" ? "text-[#159873]" : "text-[#173743]"}`}
              >
                {transaction.type === "CREDIT" ? "+" : "-"}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          <div className="mt-7 flex items-center gap-3 rounded-[18px] bg-[#f3f7f8] p-4 text-[#173743]">
            <StatusIcon status={transaction.status} />

            <div>
              <p className="font-bold">
                {statusLabels[transaction.status]}
              </p>

              <p className="mt-1 text-sm text-[#66777e]">
                {transaction.statusReason &&
                transaction.status !== "COMPLETED"
                  ? transaction.statusReason
                  : statusMessages[transaction.status]}
              </p>
            </div>
          </div>
        </div>

        {transaction.transfer && (
          <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
                <Landmark size={20} />
              </div>

              <div>
                <h2 className="font-bold text-[#173743]">
                  {dt.recipientInformation}
                </h2>

                <p className="mt-0.5 text-xs text-[#718087]">
                  {dt.transferDestination}
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <Detail
                label={dt.recipient}
                value={
                  transaction.transfer.recipientName || "—"
                }
              />

              <Detail
                label={dt.bank}
                value={
                  transaction.transfer.recipientBankName || "—"
                }
              />

              <Detail
                label={t.dashboard.accountNumber}
                value={maskAccountNumber(
                  transaction.transfer.recipientAccountNumber
                )}
              />
            </div>
          </div>
        )}

        <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
          <h2 className="font-bold text-[#173743]">
            {dt.transactionInformation}
          </h2>

          <div className="mt-5 space-y-4">
            <Detail
              label={dt.referenceNumber}
              value={transaction.reference}
            />

            <Detail
              label={dt.transactionType}
              value={
                transaction.type === "CREDIT"
                  ? dt.credit
                  : dt.debit
              }
            />

            <Detail
              label={t.common.status}
              value={statusLabels[transaction.status]}
            />

            <Detail
              label={t.common.amount}
              value={formatCurrency(transaction.amount)}
            />

            <Detail
              label={dt.fromAccount}
              value={`${accountName} •••• ${transaction.account.accountNumber.slice(-4)}`}
            />

            <Detail
              label={dt.transactionDate}
              value={formatDateTime(
                transaction.transactionDate,
                language
              )}
            />

            <Detail
              label={dt.currency}
              value={transaction.account.currency}
            />
          </div>
        </div>

        {(transaction.description ||
          transaction.memo ||
          transaction.category) && (
          <div className="border-t border-[#e5ebed] px-6 py-6 sm:px-8">
            <h2 className="font-bold text-[#173743]">
              {dt.additionalInformation}
            </h2>

            <div className="mt-5 space-y-5">
              {transaction.description && (
                <TextDetail
                  label={t.common.description}
                  value={transaction.description}
                />
              )}

              {transaction.memo && (
                <TextDetail
                  label={dt.memo}
                  value={transaction.memo}
                />
              )}

              {transaction.category && (
                <Detail
                  label={dt.category}
                  value={transaction.category}
                />
              )}
            </div>
          </div>
        )}
      </section>
    </>
  );
}