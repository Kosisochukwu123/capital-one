"use client";

import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";

import { useAppLoader } from "@/components/feedback/loading-provider";
import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { translations } from "@/lib/i18n/translations";
import { formatCurrency } from "@/lib/utils";
import { submitTransferAction } from "@/server/actions/submit-transfer";

type PaymentAccount = {
  id: string;
  type: "CHECKING" | "SAVINGS";
  accountNumber: string;
  currency: string;
  balance: number;
  status: string;
  transferPermission: string;
};

interface PaymentFormProps {
  accounts: PaymentAccount[];
}

type Step =
  | "details"
  | "fetching"
  | "review"
  | "pin"
  | "sending"
  | "success";

const paymentTranslations = {
  en: {
    selectAccount: "Select an account...",
    recipientName: "Recipient name",
    recipientFullName: "Recipient full name",
    bankName: "Bank name",
    recipientBankName: "Recipient bank name",
    recipientAccountNumber: "Recipient account number",
    accountNumber: "Account number",
    amountUsd: "Amount (USD)",
    memoOptional: "Memo (optional)",
    memoPlaceholder: "What's this transfer for?",
    reviewHint: "You'll review the transfer before entering your transaction PIN.",
    transfersUnavailable: "Transfers unavailable",
    transfersUnavailableDescription:
      "You do not currently have an active account with transfers enabled.",
    fetchingTitle: "Fetching information",
    fetchingDescription:
      "Please wait while we prepare the transfer information for review.",
    sendingTitle: "Sending...",
    sendingDescription: "Please wait while we process your transfer.",
    successTitle: "Transfer submitted",
    successDescription:
      "Your transfer has been submitted and is currently pending.",
    recipient: "Recipient",
    bank: "Bank",
    account: "Account",
    reference: "Reference",
    pending: "Pending",
    viewTransaction: "View transaction",
    backHome: "Back to home",
    editTransfer: "Edit transfer",
    reviewTransfer: "Review transfer",
    reviewDescription: "Confirm the information before continuing.",
    from: "From",
    recipientAccount: "Recipient account",
    memo: "Memo",
    pinTitle: "Transaction PIN",
    pinDescription:
      "Enter your 4-digit transaction PIN to authorize this transfer.",
    showPin: "Show PIN",
    hidePin: "Hide PIN",
    submitting: "Submitting...",
    authorizeTransfer: "Authorize transfer",
    errorSelectAccount: "Select an account.",
    errorRecipientName: "Enter the recipient name.",
    errorBankName: "Enter the recipient bank name.",
    errorAccountNumber: "Enter a valid recipient account number.",
    errorAmount: "Enter a valid transfer amount.",
    errorBalance: "The selected account does not have enough balance.",
    errorPin: "Enter your 4-digit transaction PIN.",
    errorSubmit: "Unable to submit transfer.",
  },
  fr: {
    selectAccount: "Sélectionnez un compte...",
    recipientName: "Nom du bénéficiaire",
    recipientFullName: "Nom complet du bénéficiaire",
    bankName: "Nom de la banque",
    recipientBankName: "Banque du bénéficiaire",
    recipientAccountNumber: "Numéro de compte du bénéficiaire",
    accountNumber: "Numéro de compte",
    amountUsd: "Montant (USD)",
    memoOptional: "Note (facultative)",
    memoPlaceholder: "Quel est l'objet de ce virement ?",
    reviewHint: "Vous pourrez vérifier le virement avant de saisir votre code PIN.",
    transfersUnavailable: "Virements indisponibles",
    transfersUnavailableDescription:
      "Vous ne disposez actuellement d'aucun compte actif autorisé à effectuer des virements.",
    fetchingTitle: "Préparation des informations",
    fetchingDescription:
      "Veuillez patienter pendant la préparation des informations du virement.",
    sendingTitle: "Envoi en cours...",
    sendingDescription: "Veuillez patienter pendant le traitement du virement.",
    successTitle: "Virement soumis",
    successDescription:
      "Votre virement a été soumis et est actuellement en attente.",
    recipient: "Bénéficiaire",
    bank: "Banque",
    account: "Compte",
    reference: "Référence",
    pending: "En attente",
    viewTransaction: "Voir la transaction",
    backHome: "Retour à l'accueil",
    editTransfer: "Modifier le virement",
    reviewTransfer: "Vérifier le virement",
    reviewDescription: "Confirmez les informations avant de continuer.",
    from: "Depuis",
    recipientAccount: "Compte du bénéficiaire",
    memo: "Note",
    pinTitle: "Code PIN de transaction",
    pinDescription:
      "Saisissez votre code PIN à 4 chiffres pour autoriser ce virement.",
    showPin: "Afficher le PIN",
    hidePin: "Masquer le PIN",
    submitting: "Envoi en cours...",
    authorizeTransfer: "Autoriser le virement",
    errorSelectAccount: "Sélectionnez un compte.",
    errorRecipientName: "Saisissez le nom du bénéficiaire.",
    errorBankName: "Saisissez le nom de la banque du bénéficiaire.",
    errorAccountNumber: "Saisissez un numéro de compte valide.",
    errorAmount: "Saisissez un montant de virement valide.",
    errorBalance: "Le solde du compte sélectionné est insuffisant.",
    errorPin: "Saisissez votre code PIN de transaction à 4 chiffres.",
    errorSubmit: "Impossible de soumettre le virement.",
  },
  es: {
    selectAccount: "Selecciona una cuenta...",
    recipientName: "Nombre del destinatario",
    recipientFullName: "Nombre completo del destinatario",
    bankName: "Nombre del banco",
    recipientBankName: "Banco del destinatario",
    recipientAccountNumber: "Número de cuenta del destinatario",
    accountNumber: "Número de cuenta",
    amountUsd: "Importe (USD)",
    memoOptional: "Nota (opcional)",
    memoPlaceholder: "¿Para qué es esta transferencia?",
    reviewHint: "Podrás revisar la transferencia antes de introducir tu PIN.",
    transfersUnavailable: "Transferencias no disponibles",
    transfersUnavailableDescription:
      "Actualmente no tienes una cuenta activa con transferencias habilitadas.",
    fetchingTitle: "Preparando información",
    fetchingDescription:
      "Espera mientras preparamos los datos de la transferencia para revisarlos.",
    sendingTitle: "Enviando...",
    sendingDescription: "Espera mientras procesamos tu transferencia.",
    successTitle: "Transferencia enviada",
    successDescription:
      "Tu transferencia se ha enviado y actualmente está pendiente.",
    recipient: "Destinatario",
    bank: "Banco",
    account: "Cuenta",
    reference: "Referencia",
    pending: "Pendiente",
    viewTransaction: "Ver transacción",
    backHome: "Volver al inicio",
    editTransfer: "Editar transferencia",
    reviewTransfer: "Revisar transferencia",
    reviewDescription: "Confirma la información antes de continuar.",
    from: "Desde",
    recipientAccount: "Cuenta del destinatario",
    memo: "Nota",
    pinTitle: "PIN de transacción",
    pinDescription:
      "Introduce tu PIN de 4 dígitos para autorizar esta transferencia.",
    showPin: "Mostrar PIN",
    hidePin: "Ocultar PIN",
    submitting: "Enviando...",
    authorizeTransfer: "Autorizar transferencia",
    errorSelectAccount: "Selecciona una cuenta.",
    errorRecipientName: "Introduce el nombre del destinatario.",
    errorBankName: "Introduce el nombre del banco.",
    errorAccountNumber: "Introduce un número de cuenta válido.",
    errorAmount: "Introduce un importe válido.",
    errorBalance: "La cuenta seleccionada no tiene saldo suficiente.",
    errorPin: "Introduce tu PIN de transacción de 4 dígitos.",
    errorSubmit: "No se pudo enviar la transferencia.",
  },
  de: {
    selectAccount: "Konto auswählen...",
    recipientName: "Name des Empfängers",
    recipientFullName: "Vollständiger Name des Empfängers",
    bankName: "Name der Bank",
    recipientBankName: "Bank des Empfängers",
    recipientAccountNumber: "Kontonummer des Empfängers",
    accountNumber: "Kontonummer",
    amountUsd: "Betrag (USD)",
    memoOptional: "Verwendungszweck (optional)",
    memoPlaceholder: "Wofür ist diese Überweisung?",
    reviewHint: "Sie können die Überweisung vor Eingabe Ihrer PIN überprüfen.",
    transfersUnavailable: "Überweisungen nicht verfügbar",
    transfersUnavailableDescription:
      "Sie haben derzeit kein aktives Konto mit aktivierter Überweisungsfunktion.",
    fetchingTitle: "Informationen werden vorbereitet",
    fetchingDescription:
      "Bitte warten Sie, während wir die Überweisungsdaten zur Prüfung vorbereiten.",
    sendingTitle: "Wird gesendet...",
    sendingDescription: "Bitte warten Sie, während wir Ihre Überweisung bearbeiten.",
    successTitle: "Überweisung eingereicht",
    successDescription:
      "Ihre Überweisung wurde eingereicht und ist derzeit ausstehend.",
    recipient: "Empfänger",
    bank: "Bank",
    account: "Konto",
    reference: "Referenz",
    pending: "Ausstehend",
    viewTransaction: "Transaktion ansehen",
    backHome: "Zur Startseite",
    editTransfer: "Überweisung bearbeiten",
    reviewTransfer: "Überweisung prüfen",
    reviewDescription: "Bestätigen Sie die Angaben, bevor Sie fortfahren.",
    from: "Von",
    recipientAccount: "Empfängerkonto",
    memo: "Verwendungszweck",
    pinTitle: "Transaktions-PIN",
    pinDescription:
      "Geben Sie Ihre 4-stellige Transaktions-PIN ein, um diese Überweisung zu autorisieren.",
    showPin: "PIN anzeigen",
    hidePin: "PIN verbergen",
    submitting: "Wird eingereicht...",
    authorizeTransfer: "Überweisung autorisieren",
    errorSelectAccount: "Wählen Sie ein Konto aus.",
    errorRecipientName: "Geben Sie den Namen des Empfängers ein.",
    errorBankName: "Geben Sie den Namen der Empfängerbank ein.",
    errorAccountNumber: "Geben Sie eine gültige Kontonummer ein.",
    errorAmount: "Geben Sie einen gültigen Überweisungsbetrag ein.",
    errorBalance: "Das ausgewählte Konto verfügt nicht über genügend Guthaben.",
    errorPin: "Geben Sie Ihre 4-stellige Transaktions-PIN ein.",
    errorSubmit: "Die Überweisung konnte nicht eingereicht werden.",
  },
  pt: {
    selectAccount: "Selecione uma conta...",
    recipientName: "Nome do destinatário",
    recipientFullName: "Nome completo do destinatário",
    bankName: "Nome do banco",
    recipientBankName: "Banco do destinatário",
    recipientAccountNumber: "Número da conta do destinatário",
    accountNumber: "Número da conta",
    amountUsd: "Montante (USD)",
    memoOptional: "Nota (opcional)",
    memoPlaceholder: "Qual é o motivo desta transferência?",
    reviewHint: "Poderá rever a transferência antes de introduzir o seu PIN.",
    transfersUnavailable: "Transferências indisponíveis",
    transfersUnavailableDescription:
      "Atualmente não tem uma conta ativa com transferências autorizadas.",
    fetchingTitle: "A preparar informações",
    fetchingDescription:
      "Aguarde enquanto preparamos os dados da transferência para revisão.",
    sendingTitle: "A enviar...",
    sendingDescription: "Aguarde enquanto processamos a sua transferência.",
    successTitle: "Transferência submetida",
    successDescription:
      "A sua transferência foi submetida e encontra-se pendente.",
    recipient: "Destinatário",
    bank: "Banco",
    account: "Conta",
    reference: "Referência",
    pending: "Pendente",
    viewTransaction: "Ver transação",
    backHome: "Voltar ao início",
    editTransfer: "Editar transferência",
    reviewTransfer: "Rever transferência",
    reviewDescription: "Confirme as informações antes de continuar.",
    from: "De",
    recipientAccount: "Conta do destinatário",
    memo: "Nota",
    pinTitle: "PIN de transação",
    pinDescription:
      "Introduza o seu PIN de 4 dígitos para autorizar esta transferência.",
    showPin: "Mostrar PIN",
    hidePin: "Ocultar PIN",
    submitting: "A submeter...",
    authorizeTransfer: "Autorizar transferência",
    errorSelectAccount: "Selecione uma conta.",
    errorRecipientName: "Introduza o nome do destinatário.",
    errorBankName: "Introduza o nome do banco.",
    errorAccountNumber: "Introduza um número de conta válido.",
    errorAmount: "Introduza um montante válido.",
    errorBalance: "A conta selecionada não tem saldo suficiente.",
    errorPin: "Introduza o seu PIN de transação de 4 dígitos.",
    errorSubmit: "Não foi possível submeter a transferência.",
  },
} satisfies Record<Language, Record<string, string>>;

type PaymentTranslationKey = keyof typeof paymentTranslations.en;

type PaymentError =
  | { kind: "translated"; key: PaymentTranslationKey }
  | { kind: "server"; message: string }
  | null;

const inputStyles =
  "h-[60px] w-full rounded-[17px] border border-[#d6dfe3] bg-white px-4 text-[16px] outline-none transition focus:border-[#7697a4] focus:ring-2 focus:ring-[#003b4d]/10";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[16px] font-semibold">
        {label}
      </span>
      {children}
    </label>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-5 border-b border-[#dfe7ea] py-3 first:pt-0 last:border-b-0 last:pb-0">
      <span className="text-sm text-[#718087]">
        {label}
      </span>
      <strong className="max-w-[65%] break-words text-right text-sm text-[#173743]">
        {value}
      </strong>
    </div>
  );
}

export function PaymentForm({
  accounts,
}: PaymentFormProps) {
  const { navigateWithLoader } = useAppLoader();
  const { language } = useLanguage();

  const t = translations[language];
  const pt = paymentTranslations[language];

  const availableAccounts = accounts.filter(
    (item) =>
      item.status === "ACTIVE" &&
      item.transferPermission === "ENABLED"
  );

  const [step, setStep] = useState<Step>("details");
  const [account, setAccount] = useState(
    availableAccounts[0]?.id ?? ""
  );

  const [recipientName, setRecipientName] = useState("");
  const [recipientBankName, setRecipientBankName] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState<PaymentError>(null);
  const [submitting, setSubmitting] = useState(false);
  const [reference, setReference] = useState("");
  const [transactionId, setTransactionId] = useState("");

  const selectedAccount = availableAccounts.find(
    (item) => item.id === account
  );

  const numericAmount = Number(amount);

  function showTranslatedError(key: PaymentTranslationKey) {
    setError({ kind: "translated", key });
  }

  const errorMessage =
    error?.kind === "translated"
      ? pt[error.key]
      : error?.kind === "server"
        ? error.message
        : null;

  async function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError(null);

    if (!account) {
      showTranslatedError("errorSelectAccount");
      return;
    }

    if (recipientName.trim().length < 2) {
      showTranslatedError("errorRecipientName");
      return;
    }

    if (recipientBankName.trim().length < 2) {
      showTranslatedError("errorBankName");
      return;
    }

    if (!/^\d{6,20}$/.test(recipient)) {
      showTranslatedError("errorAccountNumber");
      return;
    }

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      showTranslatedError("errorAmount");
      return;
    }

    if (
      selectedAccount &&
      numericAmount > selectedAccount.balance
    ) {
      showTranslatedError("errorBalance");
      return;
    }

    setStep("fetching");

    // UI preparation only; no external bank verification.
    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 1400);
    });

    setStep("review");
  }

  async function handleTransferSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setError(null);

    if (!/^\d{4}$/.test(pin)) {
      showTranslatedError("errorPin");
      return;
    }

    setSubmitting(true);
    setStep("sending");

    const startedAt = Date.now();

    try {
      const result = await submitTransferAction({
        fromAccountId: account,
        recipientName: recipientName.trim(),
        recipientAccountNumber: recipient,
        recipientBankName: recipientBankName.trim(),
        amount: numericAmount,
        memo: memo.trim() || undefined,
        pin,
      });

      // Minimum visible processing time, not an extra delay.
      const elapsed = Date.now() - startedAt;
      const minimumSendingTime = 1200;

      if (elapsed < minimumSendingTime) {
        await new Promise<void>((resolve) => {
          window.setTimeout(
            resolve,
            minimumSendingTime - elapsed
          );
        });
      }

      if (!result.success) {
        if (result.error) {
          setError({
            kind: "server",
            message: result.error,
          });
        } else {
          showTranslatedError("errorSubmit");
        }

        setPin("");
        setSubmitting(false);
        setStep("pin");
        return;
      }

      setReference(result.reference ?? "");
      setTransactionId(result.transactionId ?? "");
      setPin("");
      setSubmitting(false);
      setStep("success");
    } catch (error) {
      console.error("Transfer submission error:", error);
      showTranslatedError("errorSubmit");
      setPin("");
      setSubmitting(false);
      setStep("pin");
    }
  }

  function accountLabel(item: PaymentAccount) {
    const name =
      item.type === "CHECKING"
        ? t.dashboard.checking
        : t.dashboard.savings;

    return `${name} •••• ${item.accountNumber.slice(-4)}`;
  }

  if (availableAccounts.length === 0) {
    return (
      <div className="bank-card rounded-[24px] p-6 text-center">
        <p className="font-bold text-[#173743]">
          {pt.transfersUnavailable}
        </p>
        <p className="mt-2 text-sm leading-6 text-[#718087]">
          {pt.transfersUnavailableDescription}
        </p>
      </div>
    );
  }

  if (step === "fetching") {
    return (
      <div className="bank-card rounded-[24px] p-8 text-center sm:p-10" role="status" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
          <Search size={27} className="animate-pulse" />
        </div>
        <div className="mx-auto mt-6 h-11 w-11 animate-spin rounded-full border-4 border-[#d9e5e8] border-t-[#003b4d]" />
        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          {pt.fetchingTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-[#718087]">
          {pt.fetchingDescription}
        </p>
      </div>
    );
  }

  if (step === "sending") {
    return (
      <div className="bank-card rounded-[24px] p-8 text-center sm:p-10" role="status" aria-live="polite">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-[#d9e5e8] border-t-[#003b4d]" />
        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          {pt.sendingTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#718087]">
          {pt.sendingDescription}
        </p>
      </div>
    );
  }

  if (step === "success") {
    return (
      <div className="bank-card rounded-[24px] p-6 sm:p-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf7f2] text-[#159873]">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="mt-5 text-2xl font-bold text-[#173743]">
            {pt.successTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#718087]">
            {pt.successDescription}
          </p>
          <p className="mt-6 text-3xl font-bold text-[#173743]">
            {formatCurrency(numericAmount)}
          </p>
        </div>

        <div className="mt-7 rounded-[18px] bg-[#f3f7f8] p-5">
          <SummaryRow label={pt.recipient} value={recipientName} />
          <SummaryRow label={pt.bank} value={recipientBankName} />
          <SummaryRow label={pt.account} value={recipient} />
          <SummaryRow label={t.common.status} value={pt.pending} />
          <SummaryRow label={pt.reference} value={reference} />
        </div>

        <button
          type="button"
          onClick={() =>
            navigateWithLoader(
              `/transactions/${transactionId}`
            )
          }
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          {pt.viewTransaction}
        </button>

        <button
          type="button"
          onClick={() => navigateWithLoader("/")}
          className="mt-3 h-[54px] w-full rounded-full border border-[#d6dfe3] bg-white font-bold text-[#173743]"
        >
          {pt.backHome}
        </button>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="bank-card rounded-[24px] p-5 sm:p-7">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("details");
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b7d]"
        >
          <ArrowLeft size={17} />
          {pt.editTransfer}
        </button>

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          {pt.reviewTransfer}
        </h2>
        <p className="mt-2 text-sm text-[#718087]">
          {pt.reviewDescription}
        </p>

        <div className="mt-6 rounded-[18px] bg-[#f3f7f8] p-5">
          <SummaryRow
            label={pt.from}
            value={
              selectedAccount
                ? accountLabel(selectedAccount)
                : "—"
            }
          />
          <SummaryRow label={pt.recipient} value={recipientName} />
          <SummaryRow label={pt.bank} value={recipientBankName} />
          <SummaryRow label={pt.recipientAccount} value={recipient} />
          <SummaryRow
            label={t.common.amount}
            value={formatCurrency(numericAmount)}
          />
          <SummaryRow label={pt.memo} value={memo || "—"} />
        </div>

        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep("pin");
          }}
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          {t.common.continue}
        </button>
      </div>
    );
  }

  if (step === "pin") {
    return (
      <form
        onSubmit={handleTransferSubmit}
        className="bank-card rounded-[24px] p-5 sm:p-7"
      >
        <button
          type="button"
          onClick={() => {
            setError(null);
            setPin("");
            setStep("review");
          }}
          disabled={submitting}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#006b7d]"
        >
          <ArrowLeft size={17} />
          {t.common.back}
        </button>

        <h2 className="mt-6 text-2xl font-bold text-[#173743]">
          {pt.pinTitle}
        </h2>
        <p className="mt-2 text-sm leading-6 text-[#718087]">
          {pt.pinDescription}
        </p>

        <div className="mt-7">
          <Field label={pt.pinTitle}>
            <div className="relative">
              <input
                value={pin}
                onChange={(event) => {
                  const value = event.target.value.replace(
                    /\D/g,
                    ""
                  );
                  setPin(value.slice(0, 4));
                }}
                type={showPin ? "text" : "password"}
                inputMode="numeric"
                autoComplete="off"
                maxLength={4}
                placeholder="••••"
                disabled={submitting}
                className={`${inputStyles} pr-14`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPin((current) => !current)
                }
                disabled={submitting}
                aria-label={
                  showPin ? pt.hidePin : pt.showPin
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#66777e]"
              >
                {showPin ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>
            </div>
          </Field>
        </div>

        {errorMessage && (
          <div role="alert" className="mt-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || pin.length !== 4}
          className="mt-6 h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting
            ? pt.submitting
            : pt.authorizeTransfer}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={handleDetailsSubmit}
      className="bank-card rounded-[24px] p-5 sm:p-7"
    >
      <div className="space-y-5">
        <Field label={pt.from}>
          <select
            value={account}
            onChange={(event) =>
              setAccount(event.target.value)
            }
            className={inputStyles}
          >
            <option value="">
              {pt.selectAccount}
            </option>

            {availableAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {accountLabel(item)} —{" "}
                {formatCurrency(item.balance)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={pt.recipientName}>
          <input
            value={recipientName}
            onChange={(event) =>
              setRecipientName(event.target.value)
            }
            placeholder={pt.recipientFullName}
            className={inputStyles}
          />
        </Field>

        <Field label={pt.bankName}>
          <input
            value={recipientBankName}
            onChange={(event) =>
              setRecipientBankName(event.target.value)
            }
            maxLength={100}
            placeholder={pt.recipientBankName}
            className={inputStyles}
          />
        </Field>

        <Field label={pt.recipientAccountNumber}>
          <input
            value={recipient}
            onChange={(event) => {
              const value = event.target.value.replace(
                /\D/g,
                ""
              );
              setRecipient(value.slice(0, 20));
            }}
            inputMode="numeric"
            placeholder={pt.accountNumber}
            className={inputStyles}
          />
        </Field>

        <Field label={pt.amountUsd}>
          <input
            value={amount}
            onChange={(event) =>
              setAmount(event.target.value)
            }
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            className={inputStyles}
          />
        </Field>

        <Field label={pt.memoOptional}>
          <input
            value={memo}
            onChange={(event) =>
              setMemo(event.target.value)
            }
            maxLength={250}
            placeholder={pt.memoPlaceholder}
            className={inputStyles}
          />
        </Field>

        {errorMessage && (
          <div role="alert" className="rounded-[14px] border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <button
          type="submit"
          className="h-[58px] w-full rounded-full bg-[#003b4d] text-[17px] font-bold text-white transition hover:bg-[#002f3e] active:scale-[0.99]"
        >
          {t.common.next}
        </button>

        <p className="text-center text-sm text-[#718087]">
          {pt.reviewHint}
        </p>
      </div>
    </form>
  );
}