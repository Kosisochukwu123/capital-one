"use client";

import {
  Check,
  ChevronDown,
  Fingerprint,
  Globe2,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  X,
} from "lucide-react";

import Image from "next/image";

import { useState } from "react";

import { LoginForm } from "@/components/auth/login-form";

export type LoginLanguage = "en" | "fr" | "es" | "de" | "pt";

export const loginTranslations = {
  en: {
    signIn: "Sign In",
    email: "Email address",
    emailPlaceholder: "Enter your email",
    password: "Password",
    passwordPlaceholder: "Enter your password",
    forgotPassword: "Forgot password?",
    rememberMe: "Remember me",
    signingIn: "Signing in...",
    createAccount: "Create account",
    noAccount: "Don't have an account?",
    passkeyTitle: "Go passwordless with a passkey",
    passkeyDescription:
      "No more having to remember a password. Use a passkey to sign in with your face, fingerprint, or device screen lock.",
    createPasskey: "Create a passkey",
    comingSoon: "Passkey sign-in is coming soon.",
    downloadTitle: "Banking wherever you go",
    downloadDescription:
      "Manage your banking experience securely from your device.",
    appStore: "App Store",
    googlePlay: "Google Play",
    downloadOn: "Download on the",
    getItOn: "GET IT ON",
    unavailableTitle: "Not available in your region",
    unavailableDescription:
      "The Northstar Banking mobile app is currently unavailable in your region. You can continue using our web application.",
    gotIt: "Got it",
    secureBanking: "Secure online banking",
    privacy: "Privacy",
    terms: "Terms",
    support: "Support",
    error: "Incorrect email address or password.",
  },
  fr: {
    signIn: "Connexion",
    email: "Adresse e-mail",
    emailPlaceholder: "Saisissez votre e-mail",
    password: "Mot de passe",
    passwordPlaceholder: "Saisissez votre mot de passe",
    forgotPassword: "Mot de passe oublié ?",
    rememberMe: "Se souvenir de moi",
    signingIn: "Connexion...",
    createAccount: "Créer un compte",
    noAccount: "Vous n'avez pas de compte ?",
    passkeyTitle: "Connectez-vous sans mot de passe",
    passkeyDescription:
      "Utilisez votre visage, votre empreinte digitale ou le verrouillage de votre appareil pour vous connecter.",
    createPasskey: "Créer une clé d'accès",
    comingSoon: "La connexion par clé d'accès arrive bientôt.",
    downloadTitle: "Votre banque partout",
    downloadDescription:
      "Gérez vos opérations bancaires depuis votre appareil.",
    appStore: "App Store",
    googlePlay: "Google Play",
    downloadOn: "Télécharger sur",
    getItOn: "DISPONIBLE SUR",
    unavailableTitle: "Indisponible dans votre région",
    unavailableDescription:
      "L'application mobile Northstar Banking n'est pas encore disponible dans votre région. Vous pouvez utiliser notre application web.",
    gotIt: "Compris",
    secureBanking: "Banque en ligne sécurisée",
    privacy: "Confidentialité",
    terms: "Conditions",
    support: "Assistance",
    error: "Adresse e-mail ou mot de passe incorrect.",
  },
  es: {
    signIn: "Iniciar sesión",
    email: "Correo electrónico",
    emailPlaceholder: "Introduce tu correo",
    password: "Contraseña",
    passwordPlaceholder: "Introduce tu contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    rememberMe: "Recordarme",
    signingIn: "Iniciando sesión...",
    createAccount: "Crear cuenta",
    noAccount: "¿No tienes una cuenta?",
    passkeyTitle: "Accede sin contraseña",
    passkeyDescription:
      "Utiliza tu rostro, huella digital o bloqueo del dispositivo para iniciar sesión.",
    createPasskey: "Crear una clave de acceso",
    comingSoon: "El acceso con clave estará disponible pronto.",
    downloadTitle: "Tu banco donde estés",
    downloadDescription:
      "Gestiona tu banca de forma segura desde tu dispositivo.",
    appStore: "App Store",
    googlePlay: "Google Play",
    downloadOn: "Descargar en",
    getItOn: "DISPONIBLE EN",
    unavailableTitle: "No disponible en tu región",
    unavailableDescription:
      "La aplicación móvil Northstar Banking aún no está disponible en tu región. Puedes seguir utilizando nuestra aplicación web.",
    gotIt: "Entendido",
    secureBanking: "Banca en línea segura",
    privacy: "Privacidad",
    terms: "Términos",
    support: "Soporte",
    error: "Correo o contraseña incorrectos.",
  },
  de: {
    signIn: "Anmelden",
    email: "E-Mail-Adresse",
    emailPlaceholder: "E-Mail eingeben",
    password: "Passwort",
    passwordPlaceholder: "Passwort eingeben",
    forgotPassword: "Passwort vergessen?",
    rememberMe: "Angemeldet bleiben",
    signingIn: "Anmeldung...",
    createAccount: "Konto erstellen",
    noAccount: "Noch kein Konto?",
    passkeyTitle: "Ohne Passwort anmelden",
    passkeyDescription:
      "Melden Sie sich mit Gesichtserkennung, Fingerabdruck oder Gerätesperre an.",
    createPasskey: "Passkey erstellen",
    comingSoon: "Passkey-Anmeldung kommt bald.",
    downloadTitle: "Banking für unterwegs",
    downloadDescription:
      "Verwalten Sie Ihre Bankgeschäfte sicher auf Ihrem Gerät.",
    appStore: "App Store",
    googlePlay: "Google Play",
    downloadOn: "Laden im",
    getItOn: "JETZT BEI",
    unavailableTitle: "In Ihrer Region nicht verfügbar",
    unavailableDescription:
      "Die Northstar Banking App ist in Ihrer Region derzeit nicht verfügbar. Sie können weiterhin unsere Webanwendung nutzen.",
    gotIt: "Verstanden",
    secureBanking: "Sicheres Online-Banking",
    privacy: "Datenschutz",
    terms: "Bedingungen",
    support: "Support",
    error: "E-Mail-Adresse oder Passwort falsch.",
  },
  pt: {
    signIn: "Entrar",
    email: "E-mail",
    emailPlaceholder: "Digite seu e-mail",
    password: "Senha",
    passwordPlaceholder: "Digite sua senha",
    forgotPassword: "Esqueceu a senha?",
    rememberMe: "Lembrar de mim",
    signingIn: "Entrando...",
    createAccount: "Criar conta",
    noAccount: "Não tem uma conta?",
    passkeyTitle: "Entre sem senha",
    passkeyDescription:
      "Use seu rosto, impressão digital ou bloqueio do dispositivo para entrar.",
    createPasskey: "Criar chave de acesso",
    comingSoon: "O acesso por chave estará disponível em breve.",
    downloadTitle: "Seu banco onde você estiver",
    downloadDescription:
      "Gerencie suas operações bancárias com segurança.",
    appStore: "App Store",
    googlePlay: "Google Play",
    downloadOn: "Baixar na",
    getItOn: "DISPONÍVEL NO",
    unavailableTitle: "Indisponível na sua região",
    unavailableDescription:
      "O aplicativo Northstar Banking ainda não está disponível na sua região. Continue usando nosso aplicativo web.",
    gotIt: "Entendi",
    secureBanking: "Banco online seguro",
    privacy: "Privacidade",
    terms: "Termos",
    support: "Suporte",
    error: "E-mail ou senha incorretos.",
  },
};

const languages: {
  code: LoginLanguage;
  name: string;
  flag: string;
}[] = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
    { code: "pt", name: "Português", flag: "🇵🇹" },
  ];

export default function LoginPage() {
  const [language, setLanguage] = useState<LoginLanguage>("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const [storeDialogOpen, setStoreDialogOpen] = useState(false);
  const [passkeyDialogOpen, setPasskeyDialogOpen] = useState(false);

  const t = loginTranslations[language];
  const selectedLanguage = languages.find((item) => item.code === language)!;

  return (
    <main className="min-h-screen bg-[#f7f9fa] text-[#173743]">
      <header className="border-b border-[#e5eaed] bg-white">
        <div className="mx-auto flex h-[78px] max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#003b4d] text-xl font-extrabold text-white">
              N
            </div>
            <div>
              <p className="text-[18px] font-extrabold tracking-tight text-[#003b4d] sm:text-[21px]">
                Northstar
              </p>
              <p className="-mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#00799a]">
                Banking
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLanguageOpen((current) => !current)}
              aria-expanded={languageOpen}
              aria-label="Select language"
              className="flex items-center gap-2 rounded-xl border border-[#e2e8eb] px-3 py-2.5 text-sm font-semibold text-[#173743] hover:bg-[#f4f8fa]"
            >
              <span className="text-xl">{selectedLanguage.flag}</span>
              <span>{selectedLanguage.name}</span>
              <ChevronDown size={16} />
            </button>

            {languageOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[205px] overflow-hidden rounded-xl border border-[#e2e8eb] bg-white py-1 shadow-xl">
                {languages.map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => {
                      setLanguage(item.code);
                      setLanguageOpen(false);
                    }}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-[#f2f7f9]"
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{item.flag}</span>
                      {item.name}
                    </span>
                    {language === item.code && <Check size={16} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1180px] px-4 pb-12 pt-10 sm:px-8 sm:pt-16">
        <section className="mx-auto w-full max-w-[540px] rounded-[22px] border border-[#e1e6e9] bg-white px-5 py-8 shadow-[0_12px_35px_rgba(0,42,58,0.04)] sm:px-10 sm:py-10">
          <div className="mb-9 text-center">
            <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#003b4d] text-[36px] font-extrabold text-white">
              N
            </div>
            <p className="mt-3 text-[23px] font-extrabold tracking-tight text-[#003b4d]">
              Northstar Banking
            </p>
            <h1 className="mt-8 text-[29px] font-semibold text-[#151d21]">
              {t.signIn}
            </h1>
          </div>

          <LoginForm language={language} />

          <div className="mt-9 rounded-[16px] border border-[#e0e6e9] p-5 sm:p-6">
            <h2 className="text-center text-[17px] font-bold text-[#172c36]">
              {t.passkeyTitle}
            </h2>

            <div className="mt-5 flex items-center gap-4">
              <div className="flex shrink-0 items-center gap-2 text-[#00799a]">
                <Smartphone size={30} strokeWidth={1.7} />
                <Fingerprint size={35} strokeWidth={1.7} />
              </div>
              <p className="text-sm leading-6 text-[#586b73]">
                {t.passkeyDescription}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setPasskeyDialogOpen(true)}
              className="mt-5 font-bold text-[#00799a] hover:underline"
            >
              {t.createPasskey}
            </button>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-[540px] text-center">
          <h2 className="text-[23px] font-bold text-[#173743]">
            {t.downloadTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-[390px] text-sm leading-6 text-[#66777e]">
            {t.downloadDescription}
          </p>



          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {/* Apple App Store */}
            <button
              type="button"
              onClick={() => setStoreDialogOpen(true)}
              aria-label="App Store availability"
              className="flex h-[54px] w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-lg transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00799a]"
            >
              <Image
                src="/images/app-store-badge.png"
                alt="Download on the App Store"
                width={170}
                height={54}
                className="h-full w-full object-contain"
              />
            </button>

            {/* Google Play */}
            <button
              type="button"
              onClick={() => setStoreDialogOpen(true)}
              aria-label="Google Play availability"
              className="flex h-[54px] w-[170px] shrink-0 items-center justify-center overflow-hidden rounded-lg transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#00799a]"
            >
              <Image
                src="/images/google-play-badge.png"
                alt="Get it on Google Play"
                width={170}
                height={54}
                className="h-full w-full object-contain"
              />
            </button>
          </div>




        </section>
      </div>

      <footer className="border-t border-[#e1e8eb] bg-white px-4 py-7">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 text-center text-xs text-[#718087] sm:flex-row sm:px-4">
          <span>© {new Date().getFullYear()} Northstar Banking</span>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-[#006b7d]" />
            {t.secureBanking}
          </div>
          <div className="flex items-center gap-4">
            <span>{t.privacy}</span>
            <span>{t.terms}</span>
            <span>{t.support}</span>
          </div>
        </div>
      </footer>

      {(storeDialogOpen || passkeyDialogOpen) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#001d29]/65 p-4">
          <div role="dialog" aria-modal="true" className="relative w-full max-w-[420px] rounded-[24px] bg-white p-7 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setStoreDialogOpen(false);
                setPasskeyDialogOpen(false);
              }}
              aria-label="Close dialog"
              className="absolute right-4 top-4 rounded-full p-2 text-[#718087] hover:bg-[#eef4f6]"
            >
              <X size={20} />
            </button>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f3f6] text-[#006b7d]">
              {storeDialogOpen ? <Globe2 size={30} /> : <LockKeyhole size={30} />}
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#173743]">
              {storeDialogOpen ? t.unavailableTitle : t.passkeyTitle}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#66777e]">
              {storeDialogOpen ? t.unavailableDescription : t.comingSoon}
            </p>

            <button
              type="button"
              onClick={() => {
                setStoreDialogOpen(false);
                setPasskeyDialogOpen(false);
              }}
              className="mt-7 h-12 w-full rounded-xl bg-[#003b4d] font-bold text-white hover:bg-[#002c3a]"
            >
              {t.gotIt}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}