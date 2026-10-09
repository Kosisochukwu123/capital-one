
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
import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

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

type HelpCopy = {
  heading: string;
  introduction: string;
  searchPlaceholder: string;
  noResults: string;
  noResultsDescription: string;
  supportHeading: string;
  supportDescription: string;
  supportButton: string;
  categories: HelpCategory[];
};

const icons = {
  transfers: SendHorizontal,
  accounts: Landmark,
  cards: CreditCard,
  security: LockKeyhole,
  profile: UserRound,
};

const helpTranslations: Record<Language, HelpCopy> = {
  en: {
    heading: "How can we help?",
    introduction:
      "Find answers about your account, transfers, cards and security.",
    searchPlaceholder: "Search help topics",
    noResults: "No help topics found",
    noResultsDescription:
      "Try another search or contact customer support.",
    supportHeading: "Still need help?",
    supportDescription:
      "Send a message to customer support and continue the conversation from your support inbox.",
    supportButton: "Message support",
    categories: [
      {
        id: "transfers",
        title: "Transfers & payments",
        description:
          "Sending money, transfer status and payment issues.",
        icon: icons.transfers,
        items: [
          {
            question: "Why is my transfer pending?",
            answer:
              "A pending transfer is still being processed. You can check its current status from Transactions. Once processing is complete, the transaction status will be updated.",
          },
          {
            question: "Why did my transfer fail?",
            answer:
              "A transfer may fail if the account is restricted, transfer access is unavailable, the balance is insufficient, or the transfer could not be completed. Check the transaction details for the reason provided.",
          },
          {
            question: "What happens when a transfer fails?",
            answer:
              "If money was already deducted for a transfer that later fails, the amount is returned to the account and the transaction history is updated.",
          },
          {
            question: "Where can I see my transfers?",
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
        icon: icons.accounts,
        items: [
          {
            question: "Where can I see my balance?",
            answer:
              "Your total balance appears on At a glance. Individual Checking and Savings balances are displayed underneath the total.",
          },
          {
            question: "What does a frozen account mean?",
            answer:
              "A frozen account remains visible, but some account activity such as outgoing transfers may be unavailable until the restriction is removed.",
          },
          {
            question: "Why are transfers disabled?",
            answer:
              "Transfer access can be restricted separately from the account itself. Your Profile and At a glance pages show the current status of your accounts and transfer permissions.",
          },
          {
            question: "Where can I find my account information?",
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
        icon: icons.cards,
        items: [
          {
            question: "Where can I view my card?",
            answer:
              "Select My card from the bottom navigation to view your available card information and current card status.",
          },
          {
            question: "What does a frozen card mean?",
            answer:
              "A frozen card is temporarily unavailable for card activity until its status is restored.",
          },
          {
            question: "Is my full card information displayed?",
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
        icon: icons.security,
        items: [
          {
            question: "What is my transaction PIN for?",
            answer:
              "Your transaction PIN is used to authorize transfers and provides an additional security check before money is sent.",
          },
          {
            question: "Can support see my transaction PIN?",
            answer:
              "No. Your transaction PIN is stored securely and is not displayed to administrators or customer support.",
          },
          {
            question: "What if my PIN needs to be reset?",
            answer:
              "If your transaction PIN is reset, you may be required to configure a new PIN before making another transfer.",
          },
          {
            question: "Where do security alerts appear?",
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
        icon: icons.profile,
        items: [
          {
            question: "Where can I view my personal information?",
            answer:
              "Select the profile icon in the top navigation to view your registered personal information, customer ID and account access status.",
          },
          {
            question: "Can I add a profile photo?",
            answer:
              "Yes. Open your Profile and use the camera button on your profile picture to choose and upload an image.",
          },
          {
            question: "Where can I see my account restrictions?",
            answer:
              "Your Profile shows the current status and transfer availability of your Checking and Savings accounts.",
          },
        ],
      },
    ],
  },

  fr: {
    heading: "Comment pouvons-nous vous aider ?",
    introduction:
      "Trouvez des réponses concernant vos comptes, virements, cartes et votre sécurité.",
    searchPlaceholder: "Rechercher dans l'aide",
    noResults: "Aucun sujet trouvé",
    noResultsDescription:
      "Essayez une autre recherche ou contactez l'assistance.",
    supportHeading: "Besoin d'aide supplémentaire ?",
    supportDescription:
      "Envoyez un message à l'assistance et poursuivez la conversation depuis votre messagerie.",
    supportButton: "Contacter l'assistance",
    categories: [
      {
        id: "transfers",
        title: "Virements et paiements",
        description:
          "Envoi d'argent, suivi des virements et problèmes de paiement.",
        icon: icons.transfers,
        items: [
          {
            question: "Pourquoi mon virement est-il en attente ?",
            answer:
              "Un virement en attente est encore en cours de traitement. Consultez son statut dans Transactions. Le statut sera mis à jour une fois le traitement terminé.",
          },
          {
            question: "Pourquoi mon virement a-t-il échoué ?",
            answer:
              "Un virement peut échouer si le compte est restreint, si les virements sont indisponibles, si le solde est insuffisant ou si l'opération ne peut pas aboutir. Consultez les détails de la transaction.",
          },
          {
            question: "Que se passe-t-il lorsqu'un virement échoue ?",
            answer:
              "Si les fonds ont déjà été débités, ils sont restitués au compte et l'historique des transactions est mis à jour.",
          },
          {
            question: "Où consulter mes virements ?",
            answer:
              "Ouvrez Transactions dans la barre de navigation pour consulter votre historique et les détails de chaque opération.",
          },
        ],
      },
      {
        id: "accounts",
        title: "Comptes",
        description:
          "Soldes, état des comptes et autorisations de virement.",
        icon: icons.accounts,
        items: [
          {
            question: "Où consulter mon solde ?",
            answer:
              "Votre solde total figure dans Vue d'ensemble. Les soldes de vos comptes courant et d'épargne apparaissent en dessous.",
          },
          {
            question: "Que signifie un compte bloqué ?",
            answer:
              "Un compte bloqué reste visible, mais certaines opérations, notamment les virements sortants, peuvent être indisponibles jusqu'à la levée de la restriction.",
          },
          {
            question: "Pourquoi les virements sont-ils désactivés ?",
            answer:
              "Les virements peuvent être restreints indépendamment du compte. Consultez votre profil et votre vue d'ensemble pour connaître les autorisations actuelles.",
          },
          {
            question: "Où trouver les informations de mon compte ?",
            answer:
              "Les informations sont disponibles dans Vue d'ensemble et Profil. Les données de sécurité sensibles ne sont pas affichées.",
          },
        ],
      },
      {
        id: "cards",
        title: "Cartes",
        description:
          "État des cartes et informations associées.",
        icon: icons.cards,
        items: [
          {
            question: "Où consulter ma carte ?",
            answer:
              "Sélectionnez Ma carte dans la navigation inférieure pour voir les informations disponibles et son état actuel.",
          },
          {
            question: "Que signifie une carte bloquée ?",
            answer:
              "Une carte bloquée est temporairement indisponible pour les opérations par carte jusqu'à sa réactivation.",
          },
          {
            question: "Toutes les données de ma carte sont-elles visibles ?",
            answer:
              "Pour votre sécurité, les informations sensibles ne doivent pas être exposées inutilement. Seules les informations nécessaires sont affichées.",
          },
        ],
      },
      {
        id: "security",
        title: "Sécurité et code PIN",
        description:
          "Code PIN de transaction et sécurité du compte.",
        icon: icons.security,
        items: [
          {
            question: "À quoi sert mon code PIN de transaction ?",
            answer:
              "Il permet d'autoriser les virements et ajoute une vérification de sécurité avant l'envoi d'argent.",
          },
          {
            question: "L'assistance peut-elle voir mon code PIN ?",
            answer:
              "Non. Votre code PIN est conservé de manière sécurisée et n'est visible ni par les administrateurs ni par l'assistance.",
          },
          {
            question: "Que faire si mon code PIN est réinitialisé ?",
            answer:
              "Vous devrez peut-être configurer un nouveau code PIN avant d'effectuer un autre virement.",
          },
          {
            question: "Où apparaissent les alertes de sécurité ?",
            answer:
              "Les alertes importantes apparaissent dans Notifications. Utilisez l'icône en forme de cloche en haut de l'application.",
          },
        ],
      },
      {
        id: "profile",
        title: "Profil",
        description:
          "Données personnelles et informations de profil.",
        icon: icons.profile,
        items: [
          {
            question: "Où consulter mes informations personnelles ?",
            answer:
              "Sélectionnez l'icône de profil en haut pour consulter vos données, votre identifiant client et votre statut d'accès.",
          },
          {
            question: "Puis-je ajouter une photo de profil ?",
            answer:
              "Oui. Ouvrez Profil et utilisez le bouton appareil photo pour choisir et importer une image.",
          },
          {
            question: "Où voir les restrictions de mes comptes ?",
            answer:
              "Votre profil indique l'état et la disponibilité des virements de vos comptes courant et d'épargne.",
          },
        ],
      },
    ],
  },

  es: {
    heading: "¿Cómo podemos ayudarte?",
    introduction:
      "Encuentra respuestas sobre tus cuentas, transferencias, tarjetas y seguridad.",
    searchPlaceholder: "Buscar temas de ayuda",
    noResults: "No se encontraron temas",
    noResultsDescription:
      "Prueba otra búsqueda o contacta con soporte.",
    supportHeading: "¿Necesitas más ayuda?",
    supportDescription:
      "Envía un mensaje al equipo de soporte y continúa la conversación desde tu bandeja de mensajes.",
    supportButton: "Contactar con soporte",
    categories: [
      {
        id: "transfers",
        title: "Transferencias y pagos",
        description:
          "Envíos de dinero, estados de transferencias y problemas de pago.",
        icon: icons.transfers,
        items: [
          {
            question: "¿Por qué está pendiente mi transferencia?",
            answer:
              "Una transferencia pendiente sigue procesándose. Puedes consultar su estado en Transacciones. El estado se actualizará cuando finalice el procesamiento.",
          },
          {
            question: "¿Por qué falló mi transferencia?",
            answer:
              "Puede fallar si la cuenta está restringida, las transferencias no están disponibles, el saldo es insuficiente o no se puede completar la operación. Consulta los detalles de la transacción.",
          },
          {
            question: "¿Qué ocurre si falla una transferencia?",
            answer:
              "Si ya se descontó el dinero, el importe se devuelve a la cuenta y se actualiza el historial de transacciones.",
          },
          {
            question: "¿Dónde puedo ver mis transferencias?",
            answer:
              "Abre Transacciones desde la navegación para consultar el historial y los detalles de cada operación.",
          },
        ],
      },
      {
        id: "accounts",
        title: "Cuentas",
        description:
          "Saldos, estado de cuentas y permisos de transferencia.",
        icon: icons.accounts,
        items: [
          {
            question: "¿Dónde puedo ver mi saldo?",
            answer:
              "El saldo total aparece en Resumen. Debajo se muestran los saldos de las cuentas corriente y de ahorro.",
          },
          {
            question: "¿Qué significa que una cuenta esté bloqueada?",
            answer:
              "La cuenta sigue siendo visible, pero algunas operaciones, como las transferencias salientes, pueden estar deshabilitadas hasta que se retire la restricción.",
          },
          {
            question: "¿Por qué están deshabilitadas las transferencias?",
            answer:
              "El acceso a transferencias puede restringirse por separado. Consulta tu Perfil y Resumen para ver los permisos actuales.",
          },
          {
            question: "¿Dónde encuentro los datos de mi cuenta?",
            answer:
              "Los datos están disponibles en Resumen y Perfil. La información de seguridad sensible no se muestra.",
          },
        ],
      },
      {
        id: "cards",
        title: "Tarjetas",
        description:
          "Estado e información de las tarjetas.",
        icon: icons.cards,
        items: [
          {
            question: "¿Dónde puedo ver mi tarjeta?",
            answer:
              "Selecciona Mi tarjeta en la navegación inferior para consultar su información y estado.",
          },
          {
            question: "¿Qué significa una tarjeta bloqueada?",
            answer:
              "Una tarjeta bloqueada no está disponible temporalmente para operaciones hasta que se reactive.",
          },
          {
            question: "¿Se muestran todos los datos de mi tarjeta?",
            answer:
              "Por seguridad, los datos sensibles no deben exponerse innecesariamente. Solo se muestra la información necesaria.",
          },
        ],
      },
      {
        id: "security",
        title: "Seguridad y PIN",
        description:
          "PIN de transacciones y seguridad de la cuenta.",
        icon: icons.security,
        items: [
          {
            question: "¿Para qué sirve mi PIN de transacciones?",
            answer:
              "Se utiliza para autorizar transferencias y añade una comprobación de seguridad antes de enviar dinero.",
          },
          {
            question: "¿Puede soporte ver mi PIN?",
            answer:
              "No. Tu PIN se almacena de forma segura y no se muestra a administradores ni al equipo de soporte.",
          },
          {
            question: "¿Qué pasa si se restablece mi PIN?",
            answer:
              "Es posible que debas configurar un nuevo PIN antes de realizar otra transferencia.",
          },
          {
            question: "¿Dónde aparecen las alertas de seguridad?",
            answer:
              "Las alertas importantes aparecen en Notificaciones. Utiliza el icono de campana en la parte superior.",
          },
        ],
      },
      {
        id: "profile",
        title: "Perfil",
        description:
          "Datos personales e información del perfil.",
        icon: icons.profile,
        items: [
          {
            question: "¿Dónde veo mis datos personales?",
            answer:
              "Selecciona el icono de perfil en la parte superior para ver tus datos registrados, ID de cliente y estado de acceso.",
          },
          {
            question: "¿Puedo añadir una foto de perfil?",
            answer:
              "Sí. Abre Perfil y utiliza el botón de cámara para seleccionar y subir una imagen.",
          },
          {
            question: "¿Dónde veo las restricciones de mis cuentas?",
            answer:
              "Tu Perfil muestra el estado y la disponibilidad de transferencias de tus cuentas corriente y de ahorro.",
          },
        ],
      },
    ],
  },

  de: {
    heading: "Wie können wir Ihnen helfen?",
    introduction:
      "Hier finden Sie Antworten zu Konten, Überweisungen, Karten und Sicherheit.",
    searchPlaceholder: "Hilfethemen suchen",
    noResults: "Keine Hilfethemen gefunden",
    noResultsDescription:
      "Versuchen Sie eine andere Suche oder kontaktieren Sie den Support.",
    supportHeading: "Benötigen Sie weitere Hilfe?",
    supportDescription:
      "Senden Sie dem Kundensupport eine Nachricht und setzen Sie die Unterhaltung in Ihrem Posteingang fort.",
    supportButton: "Support kontaktieren",
    categories: [
      {
        id: "transfers",
        title: "Überweisungen und Zahlungen",
        description:
          "Geld senden, Überweisungsstatus und Zahlungsprobleme.",
        icon: icons.transfers,
        items: [
          {
            question: "Warum ist meine Überweisung ausstehend?",
            answer:
              "Eine ausstehende Überweisung wird noch bearbeitet. Den aktuellen Status finden Sie unter Transaktionen. Nach Abschluss wird der Status aktualisiert.",
          },
          {
            question: "Warum ist meine Überweisung fehlgeschlagen?",
            answer:
              "Eine Überweisung kann bei Kontoeinschränkungen, gesperrten Überweisungen, unzureichendem Guthaben oder technischen Problemen fehlschlagen. Prüfen Sie die Transaktionsdetails.",
          },
          {
            question: "Was passiert bei einer fehlgeschlagenen Überweisung?",
            answer:
              "Wurde der Betrag bereits abgebucht, wird er dem Konto zurückerstattet und der Transaktionsverlauf aktualisiert.",
          },
          {
            question: "Wo sehe ich meine Überweisungen?",
            answer:
              "Öffnen Sie Transaktionen in der Navigation, um Ihren Verlauf und die Details einzelner Transaktionen anzuzeigen.",
          },
        ],
      },
      {
        id: "accounts",
        title: "Konten",
        description:
          "Kontostände, Kontostatus und Überweisungsberechtigungen.",
        icon: icons.accounts,
        items: [
          {
            question: "Wo sehe ich meinen Kontostand?",
            answer:
              "Ihr Gesamtsaldo erscheint in der Übersicht. Darunter finden Sie die Salden Ihres Giro- und Sparkontos.",
          },
          {
            question: "Was bedeutet ein eingefrorenes Konto?",
            answer:
              "Das Konto bleibt sichtbar, aber bestimmte Aktivitäten wie ausgehende Überweisungen können bis zur Aufhebung der Einschränkung gesperrt sein.",
          },
          {
            question: "Warum sind Überweisungen deaktiviert?",
            answer:
              "Überweisungen können unabhängig vom Kontostatus eingeschränkt werden. Die aktuellen Berechtigungen finden Sie im Profil und in der Übersicht.",
          },
          {
            question: "Wo finde ich meine Kontoinformationen?",
            answer:
              "Die Informationen finden Sie in der Übersicht und im Profil. Sensible Sicherheitsdaten werden nicht angezeigt.",
          },
        ],
      },
      {
        id: "cards",
        title: "Karten",
        description:
          "Kartenstatus und Karteninformationen.",
        icon: icons.cards,
        items: [
          {
            question: "Wo kann ich meine Karte sehen?",
            answer:
              "Wählen Sie Meine Karte in der unteren Navigation, um die verfügbaren Informationen und den Kartenstatus anzuzeigen.",
          },
          {
            question: "Was bedeutet eine gesperrte Karte?",
            answer:
              "Eine gesperrte Karte kann vorübergehend nicht für Kartentransaktionen verwendet werden, bis sie wieder freigegeben wird.",
          },
          {
            question: "Werden alle Kartendaten angezeigt?",
            answer:
              "Aus Sicherheitsgründen werden sensible Kartendaten nicht unnötig offengelegt. Nur erforderliche Informationen werden angezeigt.",
          },
        ],
      },
      {
        id: "security",
        title: "Sicherheit und PIN",
        description:
          "Transaktions-PIN und Kontosicherheit.",
        icon: icons.security,
        items: [
          {
            question: "Wofür brauche ich meine Transaktions-PIN?",
            answer:
              "Sie autorisiert Überweisungen und bietet eine zusätzliche Sicherheitsprüfung vor dem Geldversand.",
          },
          {
            question: "Kann der Support meine PIN sehen?",
            answer:
              "Nein. Ihre PIN wird sicher gespeichert und weder Administratoren noch dem Kundensupport angezeigt.",
          },
          {
            question: "Was passiert, wenn meine PIN zurückgesetzt wird?",
            answer:
              "Möglicherweise müssen Sie vor der nächsten Überweisung eine neue PIN einrichten.",
          },
          {
            question: "Wo erscheinen Sicherheitswarnungen?",
            answer:
              "Wichtige Warnungen erscheinen unter Benachrichtigungen. Öffnen Sie sie über das Glockensymbol oben in der App.",
          },
        ],
      },
      {
        id: "profile",
        title: "Profil",
        description:
          "Persönliche Daten und Profilinformationen.",
        icon: icons.profile,
        items: [
          {
            question: "Wo sehe ich meine persönlichen Daten?",
            answer:
              "Wählen Sie oben das Profilsymbol, um Ihre registrierten Daten, Kunden-ID und den Zugangsstatus einzusehen.",
          },
          {
            question: "Kann ich ein Profilfoto hinzufügen?",
            answer:
              "Ja. Öffnen Sie Ihr Profil und verwenden Sie die Kameraschaltfläche, um ein Bild auszuwählen und hochzuladen.",
          },
          {
            question: "Wo sehe ich meine Kontoeinschränkungen?",
            answer:
              "Ihr Profil zeigt den Status und die Überweisungsverfügbarkeit Ihres Giro- und Sparkontos.",
          },
        ],
      },
    ],
  },

  pt: {
    heading: "Como podemos ajudar?",
    introduction:
      "Encontre respostas sobre contas, transferências, cartões e segurança.",
    searchPlaceholder: "Pesquisar tópicos de ajuda",
    noResults: "Nenhum tópico encontrado",
    noResultsDescription:
      "Tente outra pesquisa ou contacte o apoio ao cliente.",
    supportHeading: "Precisa de mais ajuda?",
    supportDescription:
      "Envie uma mensagem ao apoio ao cliente e continue a conversa na sua caixa de mensagens.",
    supportButton: "Contactar o apoio",
    categories: [
      {
        id: "transfers",
        title: "Transferências e pagamentos",
        description:
          "Envio de dinheiro, estado das transferências e problemas de pagamento.",
        icon: icons.transfers,
        items: [
          {
            question: "Porque está a minha transferência pendente?",
            answer:
              "Uma transferência pendente ainda está a ser processada. Consulte o estado em Transações. O estado será atualizado quando o processamento terminar.",
          },
          {
            question: "Porque falhou a minha transferência?",
            answer:
              "Uma transferência pode falhar devido a restrições na conta, indisponibilidade de transferências, saldo insuficiente ou impossibilidade de concluir a operação. Consulte os detalhes.",
          },
          {
            question: "O que acontece quando uma transferência falha?",
            answer:
              "Se o dinheiro já tiver sido debitado, o valor é devolvido à conta e o histórico de transações é atualizado.",
          },
          {
            question: "Onde posso ver as minhas transferências?",
            answer:
              "Abra Transações na navegação para consultar o histórico e os detalhes de cada operação.",
          },
        ],
      },
      {
        id: "accounts",
        title: "Contas",
        description:
          "Saldos, estado das contas e acesso a transferências.",
        icon: icons.accounts,
        items: [
          {
            question: "Onde posso ver o meu saldo?",
            answer:
              "O saldo total aparece em Visão geral. Os saldos das contas à ordem e poupança são apresentados abaixo.",
          },
          {
            question: "O que significa uma conta bloqueada?",
            answer:
              "A conta continua visível, mas algumas operações, como transferências de saída, podem ficar indisponíveis até a restrição ser removida.",
          },
          {
            question: "Porque estão as transferências desativadas?",
            answer:
              "O acesso a transferências pode ser restringido separadamente do estado da conta. Consulte o Perfil e a Visão geral para ver as permissões.",
          },
          {
            question: "Onde encontro os dados da minha conta?",
            answer:
              "Os dados estão disponíveis na Visão geral e no Perfil. As informações de segurança sensíveis não são apresentadas.",
          },
        ],
      },
      {
        id: "cards",
        title: "Cartões",
        description:
          "Estado dos cartões e informações relacionadas.",
        icon: icons.cards,
        items: [
          {
            question: "Onde posso ver o meu cartão?",
            answer:
              "Selecione O meu cartão na navegação inferior para consultar as informações disponíveis e o estado atual.",
          },
          {
            question: "O que significa um cartão bloqueado?",
            answer:
              "Um cartão bloqueado fica temporariamente indisponível para operações até ser reativado.",
          },
          {
            question: "São apresentados todos os dados do cartão?",
            answer:
              "Por segurança, os dados sensíveis não devem ser expostos desnecessariamente. Apenas as informações necessárias são apresentadas.",
          },
        ],
      },
      {
        id: "security",
        title: "Segurança e PIN",
        description:
          "PIN de transação e segurança da conta.",
        icon: icons.security,
        items: [
          {
            question: "Para que serve o meu PIN de transação?",
            answer:
              "É utilizado para autorizar transferências e acrescenta uma verificação de segurança antes do envio de dinheiro.",
          },
          {
            question: "O apoio ao cliente pode ver o meu PIN?",
            answer:
              "Não. O PIN é armazenado de forma segura e não é apresentado aos administradores nem ao apoio ao cliente.",
          },
          {
            question: "E se o meu PIN for redefinido?",
            answer:
              "Poderá ter de configurar um novo PIN antes de efetuar outra transferência.",
          },
          {
            question: "Onde aparecem os alertas de segurança?",
            answer:
              "Os alertas importantes aparecem em Notificações. Utilize o ícone de sino na parte superior da aplicação.",
          },
        ],
      },
      {
        id: "profile",
        title: "Perfil",
        description:
          "Dados pessoais e informações do perfil.",
        icon: icons.profile,
        items: [
          {
            question: "Onde posso consultar os meus dados pessoais?",
            answer:
              "Selecione o ícone de perfil no topo para consultar os seus dados, identificação de cliente e estado de acesso.",
          },
          {
            question: "Posso adicionar uma fotografia de perfil?",
            answer:
              "Sim. Abra o Perfil e utilize o botão da câmara para escolher e carregar uma imagem.",
          },
          {
            question: "Onde vejo as restrições das minhas contas?",
            answer:
              "O Perfil mostra o estado e a disponibilidade de transferências das suas contas à ordem e poupança.",
          },
        ],
      },
    ],
  },
};

export function HelpCenter() {
  const { navigateWithLoader } = useAppLoader();
  const { language } = useLanguage();

  const [search, setSearch] = useState("");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const copy = helpTranslations[language];

  const filteredCategories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase(language);

    if (!query) {
      return copy.categories;
    }

    return copy.categories
      .map((category) => {
        const categoryMatches =
          category.title.toLocaleLowerCase(language).includes(query) ||
          category.description.toLocaleLowerCase(language).includes(query);

        const matchingItems = category.items.filter(
          (item) =>
            item.question.toLocaleLowerCase(language).includes(query) ||
            item.answer.toLocaleLowerCase(language).includes(query)
        );

        if (categoryMatches) {
          return category;
        }

        if (matchingItems.length > 0) {
          return {
            ...category,
            items: matchingItems,
          };
        }

        return null;
      })
      .filter(
        (category): category is HelpCategory => category !== null
      );
  }, [copy, language, search]);

  function toggleQuestion(questionId: string) {
    setOpenQuestion((current) =>
      current === questionId ? null : questionId
    );
  }

  return (
    <div className="space-y-5">
      <section className="bank-card rounded-[24px] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dce9ee] text-[#003b4d]">
          <CircleHelp size={25} />
        </div>

        <h1 className="mt-5 text-[28px] font-bold text-[#173743]">
          {copy.heading}
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#718087]">
          {copy.introduction}
        </p>

        <div className="mt-6 flex h-[54px] items-center gap-3 rounded-[18px] border border-[#dce5e8] bg-[#f8fafb] px-4 focus-within:border-[#7ba1ae]">
          <Search size={20} className="shrink-0 text-[#718087]" />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchPlaceholder}
            aria-label={copy.searchPlaceholder}
            className="h-full min-w-0 flex-1 bg-transparent text-[15px] text-[#173743] outline-none placeholder:text-[#8a989e]"
          />
        </div>
      </section>

      {filteredCategories.length > 0 ? (
        filteredCategories.map((category) => {
          const Icon = category.icon;

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
                    {category.title}
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-[#718087]">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-[#e4eaec]">
                {category.items.map((item, index) => {
                  const questionId = `${category.id}-${index}`;
                  const isOpen = openQuestion === questionId;

                  return (
                    <div
                      key={questionId}
                      className={
                        index !== category.items.length - 1
                          ? "border-b border-[#e8edef]"
                          : ""
                      }
                    >
                      <button
                        type="button"
                        onClick={() => toggleQuestion(questionId)}
                        aria-expanded={isOpen}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-semibold leading-6 text-[#173743]">
                          {item.question}
                        </span>

                        <ChevronDown
                          size={19}
                          className={`shrink-0 text-[#718087] transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-5">
                          <p className="text-sm leading-6 text-[#66777e]">
                            {item.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      ) : (
        <section className="bank-card rounded-[24px] px-6 py-10 text-center">
          <Search size={32} className="mx-auto text-[#8a989e]" />

          <p className="mt-4 font-bold text-[#173743]">
            {copy.noResults}
          </p>

          <p className="mt-2 text-sm leading-6 text-[#718087]">
            {copy.noResultsDescription}
          </p>
        </section>
      )}

      <section className="overflow-hidden rounded-[24px] bg-[#003b4d] p-6 text-white">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
          <MessageCircle size={24} />
        </div>

        <h2 className="mt-5 text-[22px] font-bold">
          {copy.supportHeading}
        </h2>

        <p className="mt-2 text-sm leading-6 text-white/70">
          {copy.supportDescription}
        </p>

        <button
          type="button"
          onClick={() => navigateWithLoader("/messages")}
          className="mt-6 flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-white px-5 font-bold text-[#003b4d] transition hover:bg-[#f2f6f7]"
        >
          <MessageCircle size={19} />
          {copy.supportButton}
        </button>
      </section>
    </div>
  );
}
