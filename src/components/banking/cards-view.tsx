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

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import { mockCards } from "@/data/mock-card-data";

const cardTranslations = {
  en: {
    yourCards: "Your cards",
    description: "View and manage the cards connected to your accounts.",
    expires: "Expires",
    security: "Security",
    primary: "Primary",
    virtual: "Virtual",
    cardDetails: "Card details",
    autoHide: "Sensitive demo details hide automatically after 20 seconds.",
    hide: "Hide",
    show: "Show",
    copied: "Copied",
    copy: "Copy",
    cardControls: "Card controls",
    manageCards: "Manage your cards",
    freezeCard: "Freeze card",
    temporarilyLock: "Temporarily lock",
    cardProtection: "Card protection",
    more: "More",
    otherControls: "Other controls",
    protectedTitle: "Your card details are protected",
    protectedDescription:
      "Only limited card information is displayed here. Full payment card numbers are not stored or exposed.",
    copyValue: "Demo card ending",
    copyFailed: "Unable to copy card information.",
    controlsUnavailable: "This demo control is not available yet.",
  },
  fr: {
    yourCards: "Vos cartes",
    description: "Consultez et gérez les cartes associées à vos comptes.",
    expires: "Expiration",
    security: "Sécurité",
    primary: "Principale",
    virtual: "Virtuelle",
    cardDetails: "Détails de la carte",
    autoHide: "Les informations sensibles de démonstration sont masquées après 20 secondes.",
    hide: "Masquer",
    show: "Afficher",
    copied: "Copié",
    copy: "Copier",
    cardControls: "Contrôles des cartes",
    manageCards: "Gérer vos cartes",
    freezeCard: "Bloquer la carte",
    temporarilyLock: "Blocage temporaire",
    cardProtection: "Protection de la carte",
    more: "Plus",
    otherControls: "Autres options",
    protectedTitle: "Les informations de votre carte sont protégées",
    protectedDescription:
      "Seules des informations limitées sont affichées ici. Les numéros complets des cartes ne sont ni stockés ni exposés.",
    copyValue: "Carte de démonstration se terminant par",
    copyFailed: "Impossible de copier les informations de la carte.",
    controlsUnavailable: "Cette fonction de démonstration n'est pas encore disponible.",
  },
  es: {
    yourCards: "Tus tarjetas",
    description: "Consulta y administra las tarjetas vinculadas a tus cuentas.",
    expires: "Vence",
    security: "Seguridad",
    primary: "Principal",
    virtual: "Virtual",
    cardDetails: "Detalles de la tarjeta",
    autoHide: "Los datos sensibles de demostración se ocultan automáticamente después de 20 segundos.",
    hide: "Ocultar",
    show: "Mostrar",
    copied: "Copiado",
    copy: "Copiar",
    cardControls: "Controles de tarjetas",
    manageCards: "Administrar tus tarjetas",
    freezeCard: "Bloquear tarjeta",
    temporarilyLock: "Bloqueo temporal",
    cardProtection: "Protección de tarjeta",
    more: "Más",
    otherControls: "Otros controles",
    protectedTitle: "Los datos de tu tarjeta están protegidos",
    protectedDescription:
      "Aquí solo se muestra información limitada de la tarjeta. Los números completos no se almacenan ni se muestran.",
    copyValue: "Tarjeta de demostración terminada en",
    copyFailed: "No se pudo copiar la información de la tarjeta.",
    controlsUnavailable: "Esta función de demostración aún no está disponible.",
  },
  de: {
    yourCards: "Ihre Karten",
    description: "Sehen und verwalten Sie die mit Ihren Konten verbundenen Karten.",
    expires: "Gültig bis",
    security: "Sicherheit",
    primary: "Hauptkarte",
    virtual: "Virtuell",
    cardDetails: "Kartendetails",
    autoHide: "Vertrauliche Demodaten werden nach 20 Sekunden automatisch ausgeblendet.",
    hide: "Verbergen",
    show: "Anzeigen",
    copied: "Kopiert",
    copy: "Kopieren",
    cardControls: "Kartensteuerung",
    manageCards: "Karten verwalten",
    freezeCard: "Karte sperren",
    temporarilyLock: "Vorübergehend sperren",
    cardProtection: "Kartenschutz",
    more: "Mehr",
    otherControls: "Weitere Optionen",
    protectedTitle: "Ihre Kartendaten sind geschützt",
    protectedDescription:
      "Hier werden nur eingeschränkte Karteninformationen angezeigt. Vollständige Kartennummern werden weder gespeichert noch offengelegt.",
    copyValue: "Demokarte mit Endziffern",
    copyFailed: "Karteninformationen konnten nicht kopiert werden.",
    controlsUnavailable: "Diese Demofunktion ist noch nicht verfügbar.",
  },
  pt: {
    yourCards: "Os seus cartões",
    description: "Consulte e gira os cartões associados às suas contas.",
    expires: "Validade",
    security: "Segurança",
    primary: "Principal",
    virtual: "Virtual",
    cardDetails: "Detalhes do cartão",
    autoHide: "Os dados sensíveis de demonstração são ocultados automaticamente após 20 segundos.",
    hide: "Ocultar",
    show: "Mostrar",
    copied: "Copiado",
    copy: "Copiar",
    cardControls: "Controlos dos cartões",
    manageCards: "Gerir os seus cartões",
    freezeCard: "Bloquear cartão",
    temporarilyLock: "Bloqueio temporário",
    cardProtection: "Proteção do cartão",
    more: "Mais",
    otherControls: "Outros controlos",
    protectedTitle: "Os dados do seu cartão estão protegidos",
    protectedDescription:
      "Apenas são apresentadas informações limitadas do cartão. Os números completos dos cartões não são armazenados nem expostos.",
    copyValue: "Cartão de demonstração terminado em",
    copyFailed: "Não foi possível copiar as informações do cartão.",
    controlsUnavailable: "Esta funcionalidade de demonstração ainda não está disponível.",
  },
} satisfies Record<Language, Record<string, string>>;

function CardAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

export function CardsView() {
  const { language } = useLanguage();
  const t = cardTranslations[language];

  const [revealedCard, setRevealedCard] = useState<string | null>(null);
  const [copiedCard, setCopiedCard] = useState<string | null>(null);
  const [notice, setNotice] = useState<"unavailable" | "copyFailed" | null>(null);

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

  async function copyCard(cardId: string, lastFour: string) {
    try {
      await navigator.clipboard.writeText(
        `${t.copyValue} ${lastFour}`
      );

      setCopiedCard(cardId);
      setNotice(null);
    } catch {
      setNotice("copyFailed");
    }
  }

  function showUnavailableNotice() {
    setNotice("unavailable");
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
              {t.yourCards}
            </h1>

            <p className="mt-1 max-w-[620px] text-sm leading-6 text-[#718087]">
              {t.description}
            </p>
          </div>
        </div>
      </section>

      <div className="space-y-5">
        {mockCards.map((card, index) => {
          const revealed = revealedCard === card.id;
          const copied = copiedCard === card.id;

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
                              {t.expires}
                            </p>

                            <p className="mt-1.5 font-mono text-sm font-semibold">
                              {revealed ? card.expiry : "••/••"}
                            </p>
                          </div>

                          <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/45">
                              {t.security}
                            </p>

                            <p className="mt-1.5 font-mono text-sm font-semibold">
                              {revealed ? card.cvv : "•••"}
                            </p>
                          </div>
                        </div>

                        <p className="text-xs font-semibold text-white/45">
                          {index === 0 ? t.primary : t.virtual}
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
                      {t.cardDetails}
                    </p>

                    <p className="mt-1 text-xs text-[#718087]">
                      {t.autoHide}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setRevealedCard(
                          revealed ? null : card.id
                        )
                      }
                      aria-label={
                        revealed ? t.hide : t.show
                      }
                      aria-pressed={revealed}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#edf5f7] px-4 text-xs font-bold text-[#003b4d] transition hover:bg-[#e2eef1]"
                    >
                      {revealed ? (
                        <>
                          <EyeOff size={16} />
                          {t.hide}
                        </>
                      ) : (
                        <>
                          <Eye size={16} />
                          {t.show}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        copyCard(card.id, card.lastFour)
                      }
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dce6e9] px-4 text-xs font-bold text-[#173743] transition hover:bg-[#f5f8f9]"
                    >
                      <Copy size={15} />
                      {copied ? t.copied : t.copy}
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
              {t.cardControls}
            </p>

            <h2 className="mt-1 text-xl font-bold text-[#173743]">
              {t.manageCards}
            </h2>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#edf5f7] text-[#003b4d]">
            <ShieldCheck size={21} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CardAction
            icon={<Snowflake size={19} />}
            title={t.freezeCard}
            description={t.temporarilyLock}
            onClick={showUnavailableNotice}
          />

          <CardAction
            icon={<LockKeyhole size={19} />}
            title={t.security}
            description={t.cardProtection}
            onClick={showUnavailableNotice}
          />

          <CardAction
            icon={<MoreHorizontal size={20} />}
            title={t.more}
            description={t.otherControls}
            onClick={showUnavailableNotice}
          />
        </div>

        {notice && (
          <p
            role="status"
            className="mt-4 rounded-[14px] bg-[#edf5f7] px-4 py-3 text-sm text-[#173743]"
          >
            {notice === "copyFailed"
              ? t.copyFailed
              : t.controlsUnavailable}
          </p>
        )}
      </section>

      <div className="flex gap-3 rounded-[20px] border border-[#dce8eb] bg-[#f7fbfc] p-4">
        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-[#006b7d]"
        />

        <div>
          <p className="text-sm font-bold text-[#173743]">
            {t.protectedTitle}
          </p>

          <p className="mt-1 text-xs leading-5 text-[#718087]">
            {t.protectedDescription}
          </p>
        </div>
      </div>
    </div>
  );
}