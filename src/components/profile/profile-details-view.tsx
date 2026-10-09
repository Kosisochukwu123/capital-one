"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

import { ProfileImageUpload } from "@/components/profile/profile-image-upload";

type ProfileAccount = {
  id: string;
  type: string;
  accountNumber: string;
  status: string;
  transferPermission: string;
  openedAt: Date;
};

type ProfileDetailsViewProps = {
  user: {
    email: string;
    customerId: string | null;
    createdAt: Date;
    requiresPinSetup: boolean;
    profile: {
      firstName: string;
      middleName: string | null;
      lastName: string;
      dateOfBirth: Date | null;
      phone: string | null;
      country: string | null;
      state: string | null;
      city: string | null;
      address: string | null;
      postalCode: string | null;
      avatarUrl: string | null;
    } | null;
    accounts: ProfileAccount[];
  };
};

const locales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

const profileTranslations = {
  en: {
    customer: "Customer",
    customerId: "Customer ID",
    notAssigned: "Not assigned",
    transferActive: "Transfer status: Active",
    transferAvailable: "Your accounts are available for transfers.",
    restrictionsActive: "Account restrictions active",
    restrictionsDescription:
      "One or more accounts currently have restricted transfer access.",
    noTransferAccounts: "No transfer accounts available.",
    accountAccess: "Account access",
    accountAccessDescription: "Current status of your banking accounts.",
    checking: "Checking",
    savings: "Savings",
    active: "ACTIVE",
    transfersDisabled: "TRANSFERS DISABLED",
    suspended: "SUSPENDED",
    pending: "PENDING",
    restricted: "RESTRICTED",
    frozen: "FROZEN",
    inactive: "INACTIVE",
    personalInformation: "Personal information",
    personalDescription: "Your registered customer information.",
    surname: "SURNAME",
    middleName: "MIDDLE NAME",
    firstName: "FIRST NAME",
    email: "EMAIL",
    dateOfBirth: "DATE OF BIRTH",
    phone: "PHONE",
    country: "COUNTRY",
    state: "STATE / PROVINCE",
    city: "CITY",
    address: "ADDRESS",
    postalCode: "POSTAL CODE",
    accountOpened: "ACCOUNT OPENED",
    security: "Security",
    transactionPin: "Transaction PIN",
    pinDescription: "Used to authorize transfers.",
    setupRequired: "SETUP REQUIRED",
    configured: "CONFIGURED",
  },
  fr: {
    customer: "Client",
    customerId: "Identifiant client",
    notAssigned: "Non attribué",
    transferActive: "Statut des virements : actif",
    transferAvailable: "Vos comptes sont disponibles pour les virements.",
    restrictionsActive: "Restrictions de compte actives",
    restrictionsDescription:
      "Un ou plusieurs comptes ont actuellement un accès restreint aux virements.",
    noTransferAccounts: "Aucun compte disponible pour les virements.",
    accountAccess: "Accès aux comptes",
    accountAccessDescription: "État actuel de vos comptes bancaires.",
    checking: "Compte courant",
    savings: "Épargne",
    active: "ACTIF",
    transfersDisabled: "VIREMENTS DÉSACTIVÉS",
    suspended: "SUSPENDU",
    pending: "EN ATTENTE",
    restricted: "RESTREINT",
    frozen: "BLOQUÉ",
    inactive: "INACTIF",
    personalInformation: "Informations personnelles",
    personalDescription: "Vos informations client enregistrées.",
    surname: "NOM",
    middleName: "DEUXIÈME PRÉNOM",
    firstName: "PRÉNOM",
    email: "E-MAIL",
    dateOfBirth: "DATE DE NAISSANCE",
    phone: "TÉLÉPHONE",
    country: "PAYS",
    state: "ÉTAT / PROVINCE",
    city: "VILLE",
    address: "ADRESSE",
    postalCode: "CODE POSTAL",
    accountOpened: "OUVERTURE DU COMPTE",
    security: "Sécurité",
    transactionPin: "Code PIN de transaction",
    pinDescription: "Utilisé pour autoriser les virements.",
    setupRequired: "CONFIGURATION REQUISE",
    configured: "CONFIGURÉ",
  },
  es: {
    customer: "Cliente",
    customerId: "ID de cliente",
    notAssigned: "No asignado",
    transferActive: "Estado de transferencias: activo",
    transferAvailable: "Tus cuentas están disponibles para transferencias.",
    restrictionsActive: "Restricciones de cuenta activas",
    restrictionsDescription:
      "Una o más cuentas tienen actualmente restricciones para realizar transferencias.",
    noTransferAccounts: "No hay cuentas disponibles para transferencias.",
    accountAccess: "Acceso a cuentas",
    accountAccessDescription: "Estado actual de tus cuentas bancarias.",
    checking: "Cuenta corriente",
    savings: "Ahorros",
    active: "ACTIVA",
    transfersDisabled: "TRANSFERENCIAS DESHABILITADAS",
    suspended: "SUSPENDIDA",
    pending: "PENDIENTE",
    restricted: "RESTRINGIDA",
    frozen: "BLOQUEADA",
    inactive: "INACTIVA",
    personalInformation: "Información personal",
    personalDescription: "Tu información de cliente registrada.",
    surname: "APELLIDO",
    middleName: "SEGUNDO NOMBRE",
    firstName: "NOMBRE",
    email: "CORREO ELECTRÓNICO",
    dateOfBirth: "FECHA DE NACIMIENTO",
    phone: "TELÉFONO",
    country: "PAÍS",
    state: "ESTADO / PROVINCIA",
    city: "CIUDAD",
    address: "DIRECCIÓN",
    postalCode: "CÓDIGO POSTAL",
    accountOpened: "APERTURA DE CUENTA",
    security: "Seguridad",
    transactionPin: "PIN de transacción",
    pinDescription: "Se utiliza para autorizar transferencias.",
    setupRequired: "CONFIGURACIÓN REQUERIDA",
    configured: "CONFIGURADO",
  },
  de: {
    customer: "Kunde",
    customerId: "Kundennummer",
    notAssigned: "Nicht zugewiesen",
    transferActive: "Überweisungsstatus: Aktiv",
    transferAvailable: "Ihre Konten stehen für Überweisungen zur Verfügung.",
    restrictionsActive: "Kontoeinschränkungen aktiv",
    restrictionsDescription:
      "Bei einem oder mehreren Konten ist der Überweisungszugang derzeit eingeschränkt.",
    noTransferAccounts: "Keine Konten für Überweisungen verfügbar.",
    accountAccess: "Kontozugang",
    accountAccessDescription: "Aktueller Status Ihrer Bankkonten.",
    checking: "Girokonto",
    savings: "Sparkonto",
    active: "AKTIV",
    transfersDisabled: "ÜBERWEISUNGEN DEAKTIVIERT",
    suspended: "GESPERRT",
    pending: "AUSSTEHEND",
    restricted: "EINGESCHRÄNKT",
    frozen: "EINGEFROREN",
    inactive: "INAKTIV",
    personalInformation: "Persönliche Informationen",
    personalDescription: "Ihre registrierten Kundendaten.",
    surname: "NACHNAME",
    middleName: "ZWEITER VORNAME",
    firstName: "VORNAME",
    email: "E-MAIL",
    dateOfBirth: "GEBURTSDATUM",
    phone: "TELEFON",
    country: "LAND",
    state: "BUNDESLAND / PROVINZ",
    city: "STADT",
    address: "ADRESSE",
    postalCode: "POSTLEITZAHL",
    accountOpened: "KONTOERÖFFNUNG",
    security: "Sicherheit",
    transactionPin: "Transaktions-PIN",
    pinDescription: "Wird zur Autorisierung von Überweisungen verwendet.",
    setupRequired: "EINRICHTUNG ERFORDERLICH",
    configured: "EINGERICHTET",
  },
  pt: {
    customer: "Cliente",
    customerId: "ID de cliente",
    notAssigned: "Não atribuído",
    transferActive: "Estado das transferências: ativo",
    transferAvailable: "As suas contas estão disponíveis para transferências.",
    restrictionsActive: "Restrições de conta ativas",
    restrictionsDescription:
      "Uma ou mais contas têm atualmente acesso restrito a transferências.",
    noTransferAccounts: "Nenhuma conta disponível para transferências.",
    accountAccess: "Acesso às contas",
    accountAccessDescription: "Estado atual das suas contas bancárias.",
    checking: "Conta à ordem",
    savings: "Poupança",
    active: "ATIVA",
    transfersDisabled: "TRANSFERÊNCIAS DESATIVADAS",
    suspended: "SUSPENSA",
    pending: "PENDENTE",
    restricted: "RESTRITA",
    frozen: "BLOQUEADA",
    inactive: "INATIVA",
    personalInformation: "Informações pessoais",
    personalDescription: "Os seus dados de cliente registados.",
    surname: "APELIDO",
    middleName: "NOME DO MEIO",
    firstName: "PRIMEIRO NOME",
    email: "E-MAIL",
    dateOfBirth: "DATA DE NASCIMENTO",
    phone: "TELEFONE",
    country: "PAÍS",
    state: "ESTADO / PROVÍNCIA",
    city: "CIDADE",
    address: "MORADA",
    postalCode: "CÓDIGO POSTAL",
    accountOpened: "ABERTURA DA CONTA",
    security: "Segurança",
    transactionPin: "PIN de transação",
    pinDescription: "Utilizado para autorizar transferências.",
    setupRequired: "CONFIGURAÇÃO NECESSÁRIA",
    configured: "CONFIGURADO",
  },
} satisfies Record<Language, Record<string, string>>;

function formatDate(
  date: Date | null | undefined,
  language: Language
) {
  if (!date) return "—";

  return new Intl.DateTimeFormat(locales[language], {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

export function ProfileDetailsView({
  user,
}: ProfileDetailsViewProps) {
  const { language } = useLanguage();
  const t = profileTranslations[language];

  const firstName = user.profile?.firstName ?? t.customer;
  const middleName = user.profile?.middleName ?? null;
  const lastName = user.profile?.lastName ?? "";

  const fullName = [firstName, middleName, lastName]
    .filter(Boolean)
    .join(" ");

  const initials = getInitials(firstName, lastName);

  const hasRestrictedAccount = user.accounts.some(
    (account) =>
      account.status !== "ACTIVE" ||
      account.transferPermission !== "ENABLED"
  );

  const allTransfersEnabled =
    user.accounts.length > 0 &&
    user.accounts.every(
      (account) =>
        account.status === "ACTIVE" &&
        account.transferPermission === "ENABLED"
    );

  const accountOpeningDate =
    user.accounts.length > 0
      ? user.accounts[0].openedAt
      : user.createdAt;

  const fields = [
    [t.surname, lastName || "—"],
    [t.middleName, middleName || "—"],
    [t.firstName, firstName || "—"],
    [t.customerId.toUpperCase(), user.customerId || "—"],
    [t.email, user.email],
    [
      t.dateOfBirth,
      formatDate(user.profile?.dateOfBirth, language),
    ],
    [t.phone, user.profile?.phone || "—"],
    [t.country, user.profile?.country || "—"],
    [t.state, user.profile?.state || "—"],
    [t.city, user.profile?.city || "—"],
    [t.address, user.profile?.address || "—"],
    [t.postalCode, user.profile?.postalCode || "—"],
    [
      t.accountOpened,
      formatDate(accountOpeningDate, language),
    ],
  ];

  function getAccountStatus(
    status: string,
    transferPermission: string
  ) {
    if (status !== "ACTIVE") {
      const key = status.toLowerCase() as
        | "suspended"
        | "pending"
        | "restricted"
        | "frozen"
        | "inactive";

      if (key in t) {
        return t[key];
      }

      return status;
    }

    return transferPermission === "ENABLED"
      ? t.active
      : t.transfersDisabled;
  }

  return (
    <div className="space-y-5">
      <section className="bank-card flex items-center gap-4 rounded-[24px] p-5">
        <ProfileImageUpload
          initialImageUrl={user.profile?.avatarUrl ?? null}
          initials={initials}
        />

        <div className="min-w-0">
          <h1 className="truncate text-[25px] font-bold text-[#173743]">
            {fullName}
          </h1>

          <p className="mt-1 text-sm text-[#66767d]">
            {t.customerId}:{" "}
            {user.customerId || t.notAssigned}
          </p>

          <p className="mt-1 truncate text-[#52666e] underline">
            {user.email}
          </p>
        </div>
      </section>

      {allTransfersEnabled ? (
        <div className="flex items-center gap-3 rounded-[20px] bg-[#d8f0e9] px-5 py-5 font-bold text-[#168565]">
          <ShieldCheck size={25} />

          <div>
            <p>{t.transferActive}</p>

            <p className="mt-1 text-xs font-medium opacity-80">
              {t.transferAvailable}
            </p>
          </div>
        </div>
      ) : hasRestrictedAccount ? (
        <div className="flex items-start gap-3 rounded-[20px] border border-amber-100 bg-amber-50 px-5 py-5 text-amber-800">
          <AlertTriangle
            size={24}
            className="mt-0.5 shrink-0"
          />

          <div>
            <p className="font-bold">
              {t.restrictionsActive}
            </p>

            <p className="mt-1 text-sm leading-6 text-amber-700">
              {t.restrictionsDescription}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-[20px] bg-[#f3f7f8] px-5 py-5 font-bold text-[#52666e]">
          <ShieldCheck size={25} />
          {t.noTransferAccounts}
        </div>
      )}

      <section className="bank-card rounded-[24px] p-6">
        <h2 className="text-[23px] font-bold text-[#173743]">
          {t.accountAccess}
        </h2>

        <p className="mt-2 text-sm text-[#718087]">
          {t.accountAccessDescription}
        </p>

        <div className="mt-6 space-y-3">
          {user.accounts.map((account) => {
            const available =
              account.status === "ACTIVE" &&
              account.transferPermission === "ENABLED";

            return (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-[18px] border border-[#dfe7ea] p-4"
              >
                <div>
                  <p className="font-bold text-[#173743]">
                    {account.type === "CHECKING"
                      ? t.checking
                      : t.savings}
                  </p>

                  <p className="mt-1 text-sm text-[#718087]">
                    •••• {account.accountNumber.slice(-4)}
                  </p>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${available ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {available && (
                      <CheckCircle2 size={14} />
                    )}

                    {getAccountStatus(
                      account.status,
                      account.transferPermission
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="bank-card rounded-[24px] p-6">
        <h2 className="text-[23px] font-bold text-[#173743]">
          {t.personalInformation}
        </h2>

        <p className="mt-2 text-sm text-[#718087]">
          {t.personalDescription}
        </p>

        <div className="mt-8 space-y-7">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold tracking-[0.12em] text-[#77848a]">
                {label}
              </p>

              <p className="mt-2 break-words text-[18px] text-[#173743]">
                {value}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bank-card rounded-[24px] p-6">
        <h2 className="text-[23px] font-bold text-[#173743]">
          {t.security}
        </h2>

        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <p className="font-bold text-[#173743]">
              {t.transactionPin}
            </p>

            <p className="mt-1 text-sm text-[#718087]">
              {t.pinDescription}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${user.requiresPinSetup ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
          >
            {user.requiresPinSetup
              ? t.setupRequired
              : t.configured}
          </span>
        </div>
      </section>
    </div>
  );
}