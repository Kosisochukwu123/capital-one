
"use client";

import {
  AlertTriangle,
  Bell,
  Check,
  CheckCheck,
  CircleCheck,
  Info,
  Loader2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from "react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

import {
  deleteNotification,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/server/actions/notification-actions";

type NotificationType =
  | "INFO"
  | "SUCCESS"
  | "WARNING"
  | "SECURITY";

interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  notifications: NotificationItem[];
}

const MAX_SWIPE = 104;
const DELETE_THRESHOLD = 78;
const DIRECTION_LOCK_DISTANCE = 8;

const locales: Record<Language, string> = {
  en: "en-US",
  fr: "fr-FR",
  es: "es-ES",
  de: "de-DE",
  pt: "pt-PT",
};

const notificationTranslations = {
  en: {
    notifications: "Notifications",
    markAllRead: "Mark all read",
    markRead: "Mark read",
    delete: "Delete",
    deleteNotification: "Delete notification",
    swipeHint: "Swipe a notification left to delete it.",
    allCaughtUp: "You're all caught up.",
    emptyDescription:
      "Important account and security updates will appear here.",
    unreadSingle: "unread notification",
    unreadPlural: "unread notifications",
    justNow: "Just now",
    yesterday: "Yesterday",
    minutesAgo: (n: number) => `${n}m ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    daysAgo: (n: number) => `${n}d ago`,
    actionFailed: "Something went wrong. Please try again.",
  },
  fr: {
    notifications: "Notifications",
    markAllRead: "Tout marquer comme lu",
    markRead: "Marquer comme lu",
    delete: "Supprimer",
    deleteNotification: "Supprimer la notification",
    swipeHint:
      "Faites glisser une notification vers la gauche pour la supprimer.",
    allCaughtUp: "Vous êtes à jour.",
    emptyDescription:
      "Les mises à jour importantes de votre compte et de sécurité apparaîtront ici.",
    unreadSingle: "notification non lue",
    unreadPlural: "notifications non lues",
    justNow: "À l'instant",
    yesterday: "Hier",
    minutesAgo: (n: number) => `Il y a ${n} min`,
    hoursAgo: (n: number) => `Il y a ${n} h`,
    daysAgo: (n: number) => `Il y a ${n} j`,
    actionFailed: "Une erreur est survenue. Veuillez réessayer.",
  },
  es: {
    notifications: "Notificaciones",
    markAllRead: "Marcar todas como leídas",
    markRead: "Marcar como leída",
    delete: "Eliminar",
    deleteNotification: "Eliminar notificación",
    swipeHint:
      "Desliza una notificación hacia la izquierda para eliminarla.",
    allCaughtUp: "Estás al día.",
    emptyDescription:
      "Las actualizaciones importantes de tu cuenta y seguridad aparecerán aquí.",
    unreadSingle: "notificación sin leer",
    unreadPlural: "notificaciones sin leer",
    justNow: "Ahora mismo",
    yesterday: "Ayer",
    minutesAgo: (n: number) => `Hace ${n} min`,
    hoursAgo: (n: number) => `Hace ${n} h`,
    daysAgo: (n: number) => `Hace ${n} d`,
    actionFailed: "Algo salió mal. Inténtalo de nuevo.",
  },
  de: {
    notifications: "Benachrichtigungen",
    markAllRead: "Alle als gelesen markieren",
    markRead: "Als gelesen markieren",
    delete: "Löschen",
    deleteNotification: "Benachrichtigung löschen",
    swipeHint:
      "Wischen Sie eine Benachrichtigung nach links, um sie zu löschen.",
    allCaughtUp: "Sie sind auf dem neuesten Stand.",
    emptyDescription:
      "Wichtige Konto- und Sicherheitsupdates erscheinen hier.",
    unreadSingle: "ungelesene Benachrichtigung",
    unreadPlural: "ungelesene Benachrichtigungen",
    justNow: "Gerade eben",
    yesterday: "Gestern",
    minutesAgo: (n: number) => `Vor ${n} Min.`,
    hoursAgo: (n: number) => `Vor ${n} Std.`,
    daysAgo: (n: number) => `Vor ${n} Tagen`,
    actionFailed: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.",
  },
  pt: {
    notifications: "Notificações",
    markAllRead: "Marcar todas como lidas",
    markRead: "Marcar como lida",
    delete: "Eliminar",
    deleteNotification: "Eliminar notificação",
    swipeHint:
      "Deslize uma notificação para a esquerda para a eliminar.",
    allCaughtUp: "Está tudo em dia.",
    emptyDescription:
      "As atualizações importantes da conta e de segurança aparecerão aqui.",
    unreadSingle: "notificação não lida",
    unreadPlural: "notificações não lidas",
    justNow: "Agora mesmo",
    yesterday: "Ontem",
    minutesAgo: (n: number) => `Há ${n} min`,
    hoursAgo: (n: number) => `Há ${n} h`,
    daysAgo: (n: number) => `Há ${n} dias`,
    actionFailed: "Ocorreu um erro. Tente novamente.",
  },
};


type TransferNotificationKind = "completed" | "failed";

const transferNotificationTranslations: Record<
  Language,
  Record<
    TransferNotificationKind,
    {
      title: string;
      message: (amount: string, recipient: string) => string;
    }
  >
> = {
  en: {
    completed: {
      title: "Transfer completed",
      message: (amount, recipient) =>
        `${amount} transfer to ${recipient} has been completed successfully.`,
    },
    failed: {
      title: "Transfer failed",
      message: (amount, recipient) =>
        `${amount} transfer to ${recipient} could not be completed. The funds have been returned to your account.`,
    },
  },
  fr: {
    completed: {
      title: "Virement effectué",
      message: (amount, recipient) =>
        `Le virement de ${amount} vers ${recipient} a été effectué avec succès.`,
    },
    failed: {
      title: "Échec du virement",
      message: (amount, recipient) =>
        `Le virement de ${amount} vers ${recipient} n'a pas pu être effectué. Les fonds ont été recrédités sur votre compte.`,
    },
  },
  es: {
    completed: {
      title: "Transferencia completada",
      message: (amount, recipient) =>
        `La transferencia de ${amount} a ${recipient} se ha completado correctamente.`,
    },
    failed: {
      title: "Transferencia fallida",
      message: (amount, recipient) =>
        `No se pudo completar la transferencia de ${amount} a ${recipient}. Los fondos se han devuelto a tu cuenta.`,
    },
  },
  de: {
    completed: {
      title: "Überweisung abgeschlossen",
      message: (amount, recipient) =>
        `Die Überweisung von ${amount} an ${recipient} wurde erfolgreich abgeschlossen.`,
    },
    failed: {
      title: "Überweisung fehlgeschlagen",
      message: (amount, recipient) =>
        `Die Überweisung von ${amount} an ${recipient} konnte nicht abgeschlossen werden. Der Betrag wurde Ihrem Konto wieder gutgeschrieben.`,
    },
  },
  pt: {
    completed: {
      title: "Transferência concluída",
      message: (amount, recipient) =>
        `A transferência de ${amount} para ${recipient} foi concluída com sucesso.`,
    },
    failed: {
      title: "Transferência falhada",
      message: (amount, recipient) =>
        `Não foi possível concluir a transferência de ${amount} para ${recipient}. Os fundos foram devolvidos à sua conta.`,
    },
  },
};



const pendingTransferTranslations: Record<
  Language,
  {
    title: string;
    message: (amount: string, recipient: string) => string;
  }
> = {
  en: {
    title: "Transfer pending",
    message: (amount, recipient) =>
      `${amount} transfer to ${recipient} is being processed.`,
  },
  fr: {
    title: "Virement en attente",
    message: (amount, recipient) =>
      `Le virement de ${amount} vers ${recipient} est en cours de traitement.`,
  },
  es: {
    title: "Transferencia pendiente",
    message: (amount, recipient) =>
      `La transferencia de ${amount} a ${recipient} se está procesando.`,
  },
  de: {
    title: "Überweisung ausstehend",
    message: (amount, recipient) =>
      `Die Überweisung von ${amount} an ${recipient} wird bearbeitet.`,
  },
  pt: {
    title: "Transferência pendente",
    message: (amount, recipient) =>
      `A transferência de ${amount} para ${recipient} está a ser processada.`,
  },
};




function translatePendingTransfer(
  notification: NotificationItem,
  language: Language
): { title: string; message: string } | null {
  if (
    notification.type !== "INFO" ||
    notification.title !== "Transfer pending"
  ) {
    return null;
  }

  const separator = " transfer to ";
  const suffix = " is being processed.";

  const separatorIndex =
    notification.message.indexOf(separator);

  if (separatorIndex <= 0) {
    return null;
  }

  const amount = notification.message.slice(
    0,
    separatorIndex
  );

  const remainder = notification.message.slice(
    separatorIndex + separator.length
  );

  if (!remainder.endsWith(suffix)) {
    return null;
  }

  const recipient = remainder.slice(
    0,
    -suffix.length
  );

  if (!recipient.trim()) {
    return null;
  }

  const translation =
    pendingTransferTranslations[language];

  return {
    title: translation.title,
    message: translation.message(amount, recipient),
  };
}



type BalanceNotificationKind = "credited" | "debited";

const balanceNotificationTranslations: Record<
  Language,
  Record<
    BalanceNotificationKind,
    {
      title: string;
      message: (account: string, amount: string) => string;
    }
  >
> = {
  en: {
    credited: {
      title: "Account credited",
      message: (account, amount) =>
        `Your ${account} account has been credited with ${amount}.`,
    },
    debited: {
      title: "Account debited",
      message: (account, amount) =>
        `${amount} has been debited from your ${account} account.`,
    },
  },
  fr: {
    credited: {
      title: "Compte crédité",
      message: (account, amount) =>
        `Votre compte ${account} a été crédité de ${amount}.`,
    },
    debited: {
      title: "Compte débité",
      message: (account, amount) =>
        `Un montant de ${amount} a été débité de votre compte ${account}.`,
    },
  },
  es: {
    credited: {
      title: "Cuenta abonada",
      message: (account, amount) =>
        `Se han abonado ${amount} en tu cuenta ${account}.`,
    },
    debited: {
      title: "Cuenta debitada",
      message: (account, amount) =>
        `Se han debitado ${amount} de tu cuenta ${account}.`,
    },
  },
  de: {
    credited: {
      title: "Kontogutschrift",
      message: (account, amount) =>
        `Ihrem ${account}-Konto wurden ${amount} gutgeschrieben.`,
    },
    debited: {
      title: "Kontobelastung",
      message: (account, amount) =>
        `Ihr ${account}-Konto wurde mit ${amount} belastet.`,
    },
  },
  pt: {
    credited: {
      title: "Conta creditada",
      message: (account, amount) =>
        `A sua conta ${account} foi creditada com ${amount}.`,
    },
    debited: {
      title: "Conta debitada",
      message: (account, amount) =>
        `Foram debitados ${amount} da sua conta ${account}.`,
    },
  },
};



function translateBalanceNotification(
  notification: NotificationItem,
  language: Language
): { title: string; message: string } | null {
  if (language === "en") {
    return null;
  }

  const isCredit =
    notification.type === "SUCCESS" &&
    notification.title === "Account credited";

  const isDebit =
    notification.type === "INFO" &&
    notification.title === "Account debited";

  if (!isCredit && !isDebit) {
    return null;
  }

  const kind: BalanceNotificationKind = isCredit
    ? "credited"
    : "debited";

  const accountTypes = ["Checking", "Savings"] as const;

  for (const accountType of accountTypes) {
    let amount = "";

    if (isCredit) {
      const prefix =
        `Your ${accountType} account has been credited with `;

      if (
        !notification.message.startsWith(prefix) ||
        !notification.message.endsWith(".")
      ) {
        continue;
      }

      amount = notification.message.slice(
        prefix.length,
        -1
      );
    } else {
      const suffix =
        ` has been debited from your ${accountType} account.`;

      if (!notification.message.endsWith(suffix)) {
        continue;
      }

      amount = notification.message.slice(
        0,
        -suffix.length
      );
    }

    if (!amount.trim()) {
      continue;
    }

    const account =
      accountNameTranslations[language][accountType];

    const translation =
      balanceNotificationTranslations[language][kind];

    return {
      title: translation.title,
      message: translation.message(account, amount),
    };
  }

  return null;
}







function translatePinResetNotification(
  notification: NotificationItem,
  language: Language
): { title: string; message: string } | null {
  const original = pinResetTranslations.en;

  if (
    notification.type !== "SECURITY" ||
    notification.title !== original.title ||
    notification.message !== original.message
  ) {
    return null;
  }

  return pinResetTranslations[language];
}


const pinResetTranslations: Record<
  Language,
  {
    title: string;
    message: string;
  }
> = {
  en: {
    title: "Transaction PIN reset",
    message:
      "Your transaction PIN has been reset. Create a new transaction PIN before making another transfer.",
  },
  fr: {
    title: "Code PIN de transaction réinitialisé",
    message:
      "Votre code PIN de transaction a été réinitialisé. Créez un nouveau code PIN de transaction avant d'effectuer un autre virement.",
  },
  es: {
    title: "PIN de transacciones restablecido",
    message:
      "Se ha restablecido tu PIN de transacciones. Crea un nuevo PIN de transacciones antes de realizar otra transferencia.",
  },
  de: {
    title: "Transaktions-PIN zurückgesetzt",
    message:
      "Ihre Transaktions-PIN wurde zurückgesetzt. Erstellen Sie eine neue Transaktions-PIN, bevor Sie eine weitere Überweisung durchführen.",
  },
  pt: {
    title: "PIN de transação redefinido",
    message:
      "O seu PIN de transação foi redefinido. Crie um novo PIN de transação antes de efetuar outra transferência.",
  },
};



function translateNotification(
  notification: NotificationItem,
  language: Language
): { title: string; message: string } {
  const original = {
    title: notification.title,
    message: notification.message,
  };

  // Keep the original notification for English.
  if (language === "en") {
    return original;
  }

  // 1. Transaction PIN reset notifications.
  const pinResetTranslation = translatePinResetNotification(
    notification,
    language
  );

  if (pinResetTranslation) {
    return pinResetTranslation;
  }

  // 2. Account frozen, restored, and transfer permissions.
  const accountTranslation = translateAccountNotification(
    notification,
    language
  );

  if (accountTranslation) {
    return accountTranslation;
  }

  // 3. Admin-created account credit and debit notifications.
  const balanceTranslation = translateBalanceNotification(
    notification,
    language
  );

  if (balanceTranslation) {
    return balanceTranslation;
  }

  // 4. Pending transfer notifications.
  const pendingTranslation = translatePendingTransfer(
    notification,
    language
  );

  if (pendingTranslation) {
    return pendingTranslation;
  }

  // 5. Completed and failed transfer notifications.
  let kind: TransferNotificationKind;
  let suffix: string;

  if (
    notification.type === "SUCCESS" &&
    notification.title === "Transfer completed"
  ) {
    kind = "completed";
    suffix = " has been completed successfully.";
  } else if (
    notification.type === "WARNING" &&
    notification.title === "Transfer failed"
  ) {
    kind = "failed";
    suffix =
      " could not be completed. The funds have been returned to your account.";
  } else {
    // Unknown notifications remain unchanged.
    return original;
  }

  const prefixEnd = notification.message.indexOf(
    " transfer to "
  );

  if (prefixEnd <= 0) {
    return original;
  }

  const amount = notification.message.slice(
    0,
    prefixEnd
  );

  const remainder = notification.message.slice(
    prefixEnd + " transfer to ".length
  );

  if (!remainder.endsWith(suffix)) {
    return original;
  }

  const recipient = remainder.slice(
    0,
    -suffix.length
  );

  if (!recipient.trim()) {
    return original;
  }

  const translation =
    transferNotificationTranslations[language][kind];

  return {
    title: translation.title,
    message: translation.message(amount, recipient),
  };
}





type AccountNotificationKind =
  | "frozen"
  | "restored"
  | "disabled"
  | "review"
  | "enabled";

type AccountNotificationCopy = {
  title: string;
  message: (
    accountName: string,
    reason: string
  ) => string;
};

const accountNotificationTranslations: Record<
  Language,
  Record<AccountNotificationKind, AccountNotificationCopy>
> = {
  en: {
    frozen: {
      title: "Account frozen",
      message: (account, reason) =>
        `Your ${account} account has been temporarily frozen.${reason}`,
    },
    restored: {
      title: "Account restored",
      message: (account) =>
        `Your ${account} account is active again.`,
    },
    disabled: {
      title: "Transfers disabled",
      message: (account, reason) =>
        `Outgoing transfers have been disabled for your ${account} account.${reason}`,
    },
    review: {
      title: "Transfer access under review",
      message: (account, reason) =>
        `Transfer access for your ${account} account is currently under review.${reason}`,
    },
    enabled: {
      title: "Transfers available",
      message: (account) =>
        `Outgoing transfers are now available for your ${account} account.`,
    },
  },
  fr: {
    frozen: {
      title: "Compte bloqué",
      message: (account, reason) =>
        `Votre compte ${account} a été temporairement bloqué.${reason}`,
    },
    restored: {
      title: "Compte réactivé",
      message: (account) =>
        `Votre compte ${account} est de nouveau actif.`,
    },
    disabled: {
      title: "Virements désactivés",
      message: (account, reason) =>
        `Les virements sortants ont été désactivés pour votre compte ${account}.${reason}`,
    },
    review: {
      title: "Accès aux virements en cours d'examen",
      message: (account, reason) =>
        `L'accès aux virements de votre compte ${account} est actuellement en cours d'examen.${reason}`,
    },
    enabled: {
      title: "Virements disponibles",
      message: (account) =>
        `Les virements sortants sont désormais disponibles pour votre compte ${account}.`,
    },
  },
  es: {
    frozen: {
      title: "Cuenta bloqueada",
      message: (account, reason) =>
        `Tu cuenta ${account} ha sido bloqueada temporalmente.${reason}`,
    },
    restored: {
      title: "Cuenta reactivada",
      message: (account) =>
        `Tu cuenta ${account} vuelve a estar activa.`,
    },
    disabled: {
      title: "Transferencias deshabilitadas",
      message: (account, reason) =>
        `Las transferencias salientes se han deshabilitado para tu cuenta ${account}.${reason}`,
    },
    review: {
      title: "Acceso a transferencias en revisión",
      message: (account, reason) =>
        `El acceso a transferencias de tu cuenta ${account} está actualmente en revisión.${reason}`,
    },
    enabled: {
      title: "Transferencias disponibles",
      message: (account) =>
        `Las transferencias salientes ya están disponibles para tu cuenta ${account}.`,
    },
  },
  de: {
    frozen: {
      title: "Konto gesperrt",
      message: (account, reason) =>
        `Ihr ${account}-Konto wurde vorübergehend gesperrt.${reason}`,
    },
    restored: {
      title: "Konto wieder aktiviert",
      message: (account) =>
        `Ihr ${account}-Konto ist wieder aktiv.`,
    },
    disabled: {
      title: "Überweisungen deaktiviert",
      message: (account, reason) =>
        `Ausgehende Überweisungen wurden für Ihr ${account}-Konto deaktiviert.${reason}`,
    },
    review: {
      title: "Überweisungszugang wird überprüft",
      message: (account, reason) =>
        `Der Überweisungszugang für Ihr ${account}-Konto wird derzeit überprüft.${reason}`,
    },
    enabled: {
      title: "Überweisungen verfügbar",
      message: (account) =>
        `Ausgehende Überweisungen sind für Ihr ${account}-Konto wieder verfügbar.`,
    },
  },
  pt: {
    frozen: {
      title: "Conta bloqueada",
      message: (account, reason) =>
        `A sua conta ${account} foi temporariamente bloqueada.${reason}`,
    },
    restored: {
      title: "Conta reativada",
      message: (account) =>
        `A sua conta ${account} está novamente ativa.`,
    },
    disabled: {
      title: "Transferências desativadas",
      message: (account, reason) =>
        `As transferências de saída foram desativadas para a sua conta ${account}.${reason}`,
    },
    review: {
      title: "Acesso a transferências em análise",
      message: (account, reason) =>
        `O acesso a transferências da sua conta ${account} está atualmente em análise.${reason}`,
    },
    enabled: {
      title: "Transferências disponíveis",
      message: (account) =>
        `As transferências de saída estão agora disponíveis para a sua conta ${account}.`,
    },
  },
};

const accountNameTranslations: Record<
  Language,
  Record<"Checking" | "Savings", string>
> = {
  en: {
    Checking: "Checking",
    Savings: "Savings",
  },
  fr: {
    Checking: "courant",
    Savings: "épargne",
  },
  es: {
    Checking: "corriente",
    Savings: "de ahorros",
  },
  de: {
    Checking: "Giro",
    Savings: "Spar",
  },
  pt: {
    Checking: "à ordem",
    Savings: "poupança",
  },
};

const accountNotificationPatterns: Record<
  AccountNotificationKind,
  {
    title: string;
    type: NotificationType;
    prefix: (account: string) => string;
    hasReason: boolean;
  }
> = {
  frozen: {
    title: "Account frozen",
    type: "WARNING",
    prefix: (account) =>
      `Your ${account} account has been temporarily frozen.`,
    hasReason: true,
  },
  restored: {
    title: "Account restored",
    type: "SUCCESS",
    prefix: (account) =>
      `Your ${account} account is active again.`,
    hasReason: false,
  },
  disabled: {
    title: "Transfers disabled",
    type: "WARNING",
    prefix: (account) =>
      `Outgoing transfers have been disabled for your ${account} account.`,
    hasReason: true,
  },
  review: {
    title: "Transfer access under review",
    type: "INFO",
    prefix: (account) =>
      `Transfer access for your ${account} account is currently under review.`,
    hasReason: true,
  },
  enabled: {
    title: "Transfers available",
    type: "SUCCESS",
    prefix: (account) =>
      `Outgoing transfers are now available for your ${account} account.`,
    hasReason: false,
  },
};

function translateAccountNotification(
  notification: NotificationItem,
  language: Language
): { title: string; message: string } | null {
  if (language === "en") {
    return null;
  }

  const kinds: AccountNotificationKind[] = [
    "frozen",
    "restored",
    "disabled",
    "review",
    "enabled",
  ];

  const accountTypes = [
    "Checking",
    "Savings",
  ] as const;

  for (const kind of kinds) {
    const pattern = accountNotificationPatterns[kind];

    if (
      notification.title !== pattern.title ||
      notification.type !== pattern.type
    ) {
      continue;
    }

    for (const accountType of accountTypes) {
      const prefix = pattern.prefix(accountType);

      if (!notification.message.startsWith(prefix)) {
        continue;
      }

      const remainder = notification.message.slice(
        prefix.length
      );

      if (!pattern.hasReason && remainder !== "") {
        continue;
      }

      if (
        pattern.hasReason &&
        remainder !== "" &&
        !remainder.startsWith(" ")
      ) {
        continue;
      }

      const account =
        accountNameTranslations[language][accountType];

      const translation =
        accountNotificationTranslations[language][kind];

      return {
        title: translation.title,
        message: translation.message(account, remainder),
      };
    }
  }

  return null;
}



function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return (
        <CircleCheck
          size={22}
          className="text-emerald-700"
        />
      );

    case "WARNING":
      return (
        <AlertTriangle
          size={22}
          className="text-amber-700"
        />
      );

    case "SECURITY":
      return (
        <ShieldCheck
          size={22}
          className="text-[#003b4d]"
        />
      );

    default:
      return (
        <Info
          size={22}
          className="text-[#52666e]"
        />
      );
  }
}

function getIconBackground(type: NotificationType) {
  switch (type) {
    case "SUCCESS":
      return "bg-emerald-50";

    case "WARNING":
      return "bg-amber-50";

    case "SECURITY":
      return "bg-[#dce9ee]";

    default:
      return "bg-[#edf3f5]";
  }
}

function formatNotificationDate(
  value: string,
  language: Language,
  now: number
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const t = notificationTranslations[language];

  const difference = Math.max(
    0,
    now - date.getTime()
  );

  const minutes = Math.floor(difference / 60000);

  if (minutes < 1) {
    return t.justNow;
  }

  if (minutes < 60) {
    return t.minutesAgo(minutes);
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return t.hoursAgo(hours);
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return t.yesterday;
  }

  if (days < 7) {
    return t.daysAgo(days);
  }

  return new Intl.DateTimeFormat(
    locales[language],
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

type SwipeDirection =
  | "horizontal"
  | "vertical"
  | null;

interface SwipeableNotificationProps {
  notification: NotificationItem;
  isLast: boolean;
  loadingId: string | null;
  deletingId: string | null;
  now: number;
  language: Language;
  onMarkRead: (
    notificationId: string
  ) => Promise<void>;
  onDelete: (
    notificationId: string
  ) => Promise<boolean>;
}

function SwipeableNotification({
  notification,
  isLast,
  loadingId,
  deletingId,
  now,
  language,
  onMarkRead,
  onDelete,
}: SwipeableNotificationProps) {
  const t = notificationTranslations[language];

  const translatedNotification = translateNotification(
    notification,
    language
  );

  const [offsetX, setOffsetX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);

  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const directionRef = useRef<SwipeDirection>(null);
  const pointerIdRef = useRef<number | null>(null);

  const isDeleting =
    deletingId === notification.id;

  function handlePointerDown(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      isDeleting ||
      loadingId === notification.id
    ) {
      return;
    }

    if (
      event.pointerType === "mouse" &&
      event.button !== 0
    ) {
      return;
    }

    startXRef.current = event.clientX;
    startYRef.current = event.clientY;
    startOffsetRef.current = offsetX;

    directionRef.current = null;
    pointerIdRef.current = event.pointerId;

    setDragging(true);
  }

  function handlePointerMove(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      !dragging ||
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    const deltaX =
      event.clientX - startXRef.current;

    const deltaY =
      event.clientY - startYRef.current;

    if (!directionRef.current) {
      if (
        Math.abs(deltaX) <
        DIRECTION_LOCK_DISTANCE &&
        Math.abs(deltaY) <
        DIRECTION_LOCK_DISTANCE
      ) {
        return;
      }

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        directionRef.current = "vertical";

        setDragging(false);
        setOffsetX(0);

        return;
      }

      directionRef.current = "horizontal";
    }

    if (
      directionRef.current !== "horizontal"
    ) {
      return;
    }

    event.preventDefault();

    const nextOffset =
      startOffsetRef.current + deltaX;

    const clampedOffset = Math.max(
      -MAX_SWIPE,
      Math.min(0, nextOffset)
    );

    setOffsetX(clampedOffset);
  }

  async function finishSwipe(
    event: ReactPointerEvent<HTMLElement>
  ) {
    if (
      pointerIdRef.current !== event.pointerId
    ) {
      return;
    }

    pointerIdRef.current = null;

    const wasHorizontal =
      directionRef.current === "horizontal";

    directionRef.current = null;
    setDragging(false);

    if (!wasHorizontal) {
      setOffsetX(0);
      return;
    }

    if (
      Math.abs(offsetX) < DELETE_THRESHOLD
    ) {
      setOffsetX(0);
      return;
    }

    setRemoving(true);
    setOffsetX(-500);

    const success = await onDelete(
      notification.id
    );

    if (!success) {
      setRemoving(false);
      setOffsetX(0);
    }
  }

  function handlePointerCancel() {
    pointerIdRef.current = null;
    directionRef.current = null;

    setDragging(false);
    setOffsetX(0);
  }

  async function handleDeleteButton() {
    if (isDeleting) {
      return;
    }

    setRemoving(true);
    setOffsetX(-500);

    const success = await onDelete(
      notification.id
    );

    if (!success) {
      setRemoving(false);
      setOffsetX(0);
    }
  }

  return (
    <div
      className={`relative overflow-hidden bg-red-600 ${!isLast ? "border-b border-[#e3e9eb]" : ""}`}
    >
      <div className="absolute inset-y-0 right-0 flex w-[104px] items-center justify-center bg-red-600">
        <button
          type="button"
          disabled={isDeleting}
          onClick={handleDeleteButton}
          aria-label={t.deleteNotification}
          className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-white disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2
              size={22}
              className="animate-spin"
            />
          ) : (
            <Trash2 size={22} />
          )}

          <span className="text-xs font-bold">
            {t.delete}
          </span>
        </button>
      </div>

      <article
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishSwipe}
        onPointerCancel={handlePointerCancel}
        style={{
          transform: `translateX(${offsetX}px)`,
          touchAction: "pan-y",
          transition: dragging
            ? "none"
            : removing
              ? "transform 220ms ease-in"
              : "transform 220ms ease-out",
        }}
        className={`relative flex select-none gap-4 p-5 ${notification.read ? "bg-white" : "bg-[#f5fafb]"}`}
      >
        {!notification.read && (
          <span className="absolute left-0 top-0 h-full w-1 bg-[#003b4d]" />
        )}

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${getIconBackground(notification.type)}`}
        >
          {getNotificationIcon(notification.type)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p
                className={`text-[16px] text-[#173743] ${notification.read ? "font-semibold" : "font-bold"}`}
              >
                {translatedNotification.title}
              </p>

              <p className="mt-1 text-sm leading-6 text-[#65777e]">
                {translatedNotification.message}
              </p>
            </div>

            {!notification.read && (
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[#003b4d]" />
            )}
          </div>

          <div className="mt-3 flex items-center justify-between gap-4">
            <span className="text-xs font-medium text-[#8a979c]">
              {formatNotificationDate(
                notification.createdAt,
                language,
                now
              )}
            </span>

            {!notification.read && (
              <button
                type="button"
                disabled={
                  loadingId === notification.id ||
                  isDeleting
                }
                onPointerDown={(event) => {
                  event.stopPropagation();
                }}
                onClick={(event) => {
                  event.stopPropagation();

                  void onMarkRead(notification.id);
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-[#00627a] disabled:opacity-50"
              >
                {loadingId === notification.id ? (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                ) : (
                  <Check size={14} />
                )}

                {t.markRead}
              </button>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

export function NotificationCenter({
  notifications,
}: NotificationCenterProps) {
  return (
    <NotificationCenterContent
      key={JSON.stringify(notifications)}
      notifications={notifications}
    />
  );
}

function NotificationCenterContent({
  notifications,
}: NotificationCenterProps) {
  const router = useRouter();


  const { language } = useLanguage();
  const t = notificationTranslations[language];

  const [items, setItems] =
    useState<NotificationItem[]>(notifications);

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [actionError, setActionError] =
    useState(false);

  const [now] = useState(() => Date.now());


  const unreadCount = items.filter(
    (notification) => !notification.read
  ).length;

  async function handleMarkRead(
    notificationId: string
  ) {
    if (loadingId) {
      return;
    }

    setLoadingId(notificationId);
    setActionError(false);

    try {
      const result =
        await markNotificationRead(notificationId);

      if (!result.success) {
        setActionError(true);
        return;
      }

      setItems((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
              ...notification,
              read: true,
            }
            : notification
        )
      );

      router.refresh();
    } catch {
      setActionError(true);
    } finally {
      setLoadingId(null);
    }
  }

  async function handleMarkAllRead() {
    if (unreadCount === 0 || markingAll) {
      return;
    }

    setMarkingAll(true);
    setActionError(false);

    try {
      const result =
        await markAllNotificationsRead();

      if (!result.success) {
        setActionError(true);
        return;
      }

      setItems((current) =>
        current.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      router.refresh();
    } catch {
      setActionError(true);
    } finally {
      setMarkingAll(false);
    }
  }

  async function handleDelete(
    notificationId: string
  ): Promise<boolean> {
    if (deletingId) {
      return false;
    }

    setDeletingId(notificationId);
    setActionError(false);

    try {
      const result =
        await deleteNotification(notificationId);

      if (!result.success) {
        setActionError(true);
        return false;
      }

      setItems((current) =>
        current.filter(
          (notification) =>
            notification.id !== notificationId
        )
      );

      router.refresh();

      return true;
    } catch {
      setActionError(true);
      return false;
    } finally {
      setDeletingId(null);
    }
  }

  const errorMessage = actionError ? (
    <p
      role="alert"
      className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {t.actionFailed}
    </p>
  ) : null;

  if (items.length === 0) {
    return (
      <>
        {errorMessage}

        <section className="bank-card mt-6 flex min-h-[250px] flex-col items-center justify-center rounded-[24px] px-5 text-center">
          <Bell
            size={38}
            strokeWidth={1.6}
            className="text-[#8b989d]"
          />

          <p className="mt-5 text-[18px] font-semibold text-[#52666e]">
            {t.allCaughtUp}
          </p>

          <p className="mt-2 max-w-[300px] text-sm leading-6 text-[#819096]">
            {t.emptyDescription}
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      {errorMessage}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-bold text-[#173743]">
            {t.notifications}
          </h1>

          <p className="mt-1 text-sm text-[#718087]">
            {unreadCount > 0
              ? `${unreadCount} ${unreadCount === 1
                ? t.unreadSingle
                : t.unreadPlural
              }`
              : t.allCaughtUp}
          </p>
        </div>

        <button
          type="button"
          disabled={
            markingAll || unreadCount === 0
          }
          onClick={handleMarkAllRead}
          aria-label={t.markAllRead}
          className="flex shrink-0 items-center gap-2 rounded-full border border-[#d5dfe3] bg-white px-4 py-3 text-sm font-semibold text-[#173743] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {markingAll ? (
            <Loader2
              size={18}
              className="animate-spin"
            />
          ) : (
            <CheckCheck size={18} />
          )}

          <span className="hidden sm:inline">
            {t.markAllRead}
          </span>
        </button>
      </div>

      <p className="mt-4 text-xs font-medium text-[#8a979c]">
        {t.swipeHint}
      </p>

      <section className="bank-card mt-3 overflow-hidden rounded-[24px]">
        {items.map((notification, index) => (
          <SwipeableNotification
            key={notification.id}
            notification={notification}
            isLast={index === items.length - 1}
            loadingId={loadingId}
            deletingId={deletingId}
            now={now}
            language={language}
            onMarkRead={handleMarkRead}
            onDelete={handleDelete}
          />
        ))}
      </section>
    </>
  );
}
