
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";
import { registerAction } from "@/server/actions/register";

const registerTranslations: Record<
  Language,
  {
    personalInformation: string;
    loginInformation: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    phone: string;
    country: string;
    state: string;
    city: string;
    address: string;
    postalCode: string;
    email: string;
    password: string;
    confirmPassword: string;
    acceptedTerms: string;
    createAccount: string;
    creatingAccount: string;
    alreadyHaveAccount: string;
    signIn: string;
    showPassword: string;
    hidePassword: string;
    genericError: string;
  }
> = {
  en: {
    personalInformation: "Personal information",
    loginInformation: "Login information",
    firstName: "First name",
    middleName: "Middle name",
    lastName: "Last name",
    dateOfBirth: "Date of birth",
    phone: "Phone number",
    country: "Country",
    state: "State / Province",
    city: "City",
    address: "Address",
    postalCode: "Postal code",
    email: "Email address",
    password: "Password",
    confirmPassword: "Confirm password",
    acceptedTerms:
      "I agree to the terms and conditions and privacy policy.",
    createAccount: "Create account",
    creatingAccount: "Creating account...",
    alreadyHaveAccount: "Already have an account?",
    signIn: "Sign in",
    showPassword: "Show password",
    hidePassword: "Hide password",
    genericError: "Unable to create account.",
  },
  fr: {
    personalInformation: "Informations personnelles",
    loginInformation: "Informations de connexion",
    firstName: "Prénom",
    middleName: "Deuxième prénom",
    lastName: "Nom de famille",
    dateOfBirth: "Date de naissance",
    phone: "Numéro de téléphone",
    country: "Pays",
    state: "État / Province",
    city: "Ville",
    address: "Adresse",
    postalCode: "Code postal",
    email: "Adresse e-mail",
    password: "Mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    acceptedTerms:
      "J'accepte les conditions générales et la politique de confidentialité.",
    createAccount: "Créer un compte",
    creatingAccount: "Création du compte...",
    alreadyHaveAccount: "Vous avez déjà un compte ?",
    signIn: "Se connecter",
    showPassword: "Afficher le mot de passe",
    hidePassword: "Masquer le mot de passe",
    genericError: "Impossible de créer le compte.",
  },
  es: {
    personalInformation: "Información personal",
    loginInformation: "Información de acceso",
    firstName: "Nombre",
    middleName: "Segundo nombre",
    lastName: "Apellido",
    dateOfBirth: "Fecha de nacimiento",
    phone: "Número de teléfono",
    country: "País",
    state: "Estado / Provincia",
    city: "Ciudad",
    address: "Dirección",
    postalCode: "Código postal",
    email: "Correo electrónico",
    password: "Contraseña",
    confirmPassword: "Confirmar contraseña",
    acceptedTerms:
      "Acepto los términos y condiciones y la política de privacidad.",
    createAccount: "Crear cuenta",
    creatingAccount: "Creando cuenta...",
    alreadyHaveAccount: "¿Ya tienes una cuenta?",
    signIn: "Iniciar sesión",
    showPassword: "Mostrar contraseña",
    hidePassword: "Ocultar contraseña",
    genericError: "No se pudo crear la cuenta.",
  },
  de: {
    personalInformation: "Persönliche Angaben",
    loginInformation: "Anmeldedaten",
    firstName: "Vorname",
    middleName: "Zweiter Vorname",
    lastName: "Nachname",
    dateOfBirth: "Geburtsdatum",
    phone: "Telefonnummer",
    country: "Land",
    state: "Bundesland / Region",
    city: "Stadt",
    address: "Adresse",
    postalCode: "Postleitzahl",
    email: "E-Mail-Adresse",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    acceptedTerms:
      "Ich stimme den allgemeinen Geschäftsbedingungen und der Datenschutzerklärung zu.",
    createAccount: "Konto erstellen",
    creatingAccount: "Konto wird erstellt...",
    alreadyHaveAccount: "Sie haben bereits ein Konto?",
    signIn: "Anmelden",
    showPassword: "Passwort anzeigen",
    hidePassword: "Passwort verbergen",
    genericError: "Konto konnte nicht erstellt werden.",
  },
  pt: {
    personalInformation: "Informações pessoais",
    loginInformation: "Informações de acesso",
    firstName: "Primeiro nome",
    middleName: "Nome do meio",
    lastName: "Apelido",
    dateOfBirth: "Data de nascimento",
    phone: "Número de telefone",
    country: "País",
    state: "Estado / Província",
    city: "Cidade",
    address: "Morada",
    postalCode: "Código postal",
    email: "Endereço de e-mail",
    password: "Palavra-passe",
    confirmPassword: "Confirmar palavra-passe",
    acceptedTerms:
      "Concordo com os termos e condições e a política de privacidade.",
    createAccount: "Criar conta",
    creatingAccount: "A criar conta...",
    alreadyHaveAccount: "Já tem uma conta?",
    signIn: "Iniciar sessão",
    showPassword: "Mostrar palavra-passe",
    hidePassword: "Ocultar palavra-passe",
    genericError: "Não foi possível criar a conta.",
  },
};

export function RegisterForm() {
  const router = useRouter();
  const { language } = useLanguage();
  const t = registerTranslations[language];

  const [serverError, setServerError] = useState<string | null>(
    null
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      country: "",
      state: "",
      city: "",
      address: "",
      postalCode: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false,
    },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError(null);

    try {
      const result = await registerAction(values);

      if (!result.success) {
        setServerError(result.error ?? t.genericError);
        return;
      }

      router.push("/login");
    } catch {
      setServerError(t.genericError);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bank-card rounded-[26px] p-5 sm:p-8"
    >
      <SectionTitle>{t.personalInformation}</SectionTitle>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input
          label={t.firstName}
          error={errors.firstName?.message}
          {...register("firstName")}
        />

        <Input
          label={t.middleName}
          error={errors.middleName?.message}
          {...register("middleName")}
        />

        <Input
          label={t.lastName}
          error={errors.lastName?.message}
          {...register("lastName")}
        />

        <Input
          label={t.dateOfBirth}
          type="date"
          error={errors.dateOfBirth?.message}
          {...register("dateOfBirth")}
        />

        <Input
          label={t.phone}
          type="tel"
          error={errors.phone?.message}
          {...register("phone")}
        />

        <Input
          label={t.country}
          error={errors.country?.message}
          {...register("country")}
        />

        <Input
          label={t.state}
          error={errors.state?.message}
          {...register("state")}
        />

        <Input
          label={t.city}
          error={errors.city?.message}
          {...register("city")}
        />

        <div className="sm:col-span-2">
          <Input
            label={t.address}
            error={errors.address?.message}
            {...register("address")}
          />
        </div>

        <Input
          label={t.postalCode}
          error={errors.postalCode?.message}
          {...register("postalCode")}
        />
      </div>

      <div className="my-8 h-px bg-[#e2e8eb]" />

      <SectionTitle>{t.loginInformation}</SectionTitle>

      <div className="mt-5 space-y-5">
        <Input
          label={t.email}
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <PasswordInput
          label={t.password}
          visible={showPassword}
          onToggle={() =>
            setShowPassword((current) => !current)
          }
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
          error={errors.password?.message}
          {...register("password")}
        />

        <PasswordInput
          label={t.confirmPassword}
          visible={showConfirmPassword}
          onToggle={() =>
            setShowConfirmPassword((current) => !current)
          }
          showLabel={t.showPassword}
          hideLabel={t.hidePassword}
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <label className="mt-6 flex items-start gap-3">
        <input
          type="checkbox"
          {...register("acceptedTerms")}
          className="mt-1 h-4 w-4"
        />

        <span className="text-sm leading-6 text-[#5f7077]">
          {t.acceptedTerms}
        </span>
      </label>

      {errors.acceptedTerms && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {errors.acceptedTerms.message}
        </p>
      )}

      {serverError && (
        <div
          role="alert"
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {serverError}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 h-[58px] w-full rounded-full bg-[#003b4d] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t.creatingAccount : t.createAccount}
      </button>

      <p className="mt-7 text-center text-sm text-[#66777e]">
        {t.alreadyHaveAccount}{" "}
        <Link
          href="/login"
          className="font-bold text-[#006b7d]"
        >
          {t.signIn}
        </Link>
      </p>
    </form>
  );
}

function SectionTitle({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <h2 className="text-xl font-bold">{children}</h2>
  );
}

type InputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
  };

function Input({
  label,
  error,
  ...props
}: InputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        {...props}
        className="h-[54px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
      />

      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}

type PasswordInputProps =
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
    visible: boolean;
    onToggle: () => void;
    showLabel: string;
    hideLabel: string;
  };

function PasswordInput({
  label,
  error,
  visible,
  onToggle,
  showLabel,
  hideLabel,
  ...props
}: PasswordInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          className="h-[54px] w-full rounded-[15px] border border-[#d5dfe3] bg-white px-4 pr-12 outline-none transition focus:border-[#668b99] focus:ring-2 focus:ring-[#003b4d]/10"
        />

        <button
          type="button"
          onClick={onToggle}
          aria-label={visible ? hideLabel : showLabel}
          className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-[#66777e]"
        >
          {visible ? <EyeOff size={19} /> : <Eye size={19} />}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </label>
  );
}
