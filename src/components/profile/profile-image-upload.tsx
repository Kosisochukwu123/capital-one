
"use client";

import {
  Camera,
  Loader2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import {
  type ChangeEvent,
  useRef,
  useState,
} from "react";

import {
  useLanguage,
  type Language,
} from "@/contexts/language-context";

import { updateProfileImageAction } from "@/server/actions/update-profile-image";

interface ProfileImageUploadProps {
  initialImageUrl: string | null;
  initials: string;
}

const uploadTranslations = {
  en: {
    profileImage: "Profile image",
    changeImage: "Change profile image",
    uploading: "Uploading profile image",
    uploadFailed: "Unable to upload your profile image. Please try again.",
    uploadSuccess: "Profile image updated successfully.",
  },
  fr: {
    profileImage: "Photo de profil",
    changeImage: "Modifier la photo de profil",
    uploading: "Téléchargement de la photo de profil",
    uploadFailed: "Impossible de télécharger votre photo de profil. Veuillez réessayer.",
    uploadSuccess: "Photo de profil mise à jour avec succès.",
  },
  es: {
    profileImage: "Foto de perfil",
    changeImage: "Cambiar foto de perfil",
    uploading: "Subiendo foto de perfil",
    uploadFailed: "No se pudo subir tu foto de perfil. Inténtalo de nuevo.",
    uploadSuccess: "Foto de perfil actualizada correctamente.",
  },
  de: {
    profileImage: "Profilbild",
    changeImage: "Profilbild ändern",
    uploading: "Profilbild wird hochgeladen",
    uploadFailed: "Das Profilbild konnte nicht hochgeladen werden. Bitte versuchen Sie es erneut.",
    uploadSuccess: "Profilbild erfolgreich aktualisiert.",
  },
  pt: {
    profileImage: "Foto de perfil",
    changeImage: "Alterar foto de perfil",
    uploading: "A carregar a foto de perfil",
    uploadFailed: "Não foi possível carregar a foto de perfil. Tente novamente.",
    uploadSuccess: "Foto de perfil atualizada com sucesso.",
  },
} satisfies Record<
  Language,
  {
    profileImage: string;
    changeImage: string;
    uploading: string;
    uploadFailed: string;
    uploadSuccess: string;
  }
>;

export function ProfileImageUpload({
  initialImageUrl,
  initials,
}: ProfileImageUploadProps) {
  const { language } = useLanguage();
  const t = uploadTranslations[language];

  const inputRef = useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file || uploading) {
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const result = await updateProfileImageAction(formData);

      if (!result.success) {
        setError(result.error || t.uploadFailed);
        return;
      }

      setImageUrl(result.imageUrl);
      setSuccess(true);
    } catch {
      setError(t.uploadFailed);
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="shrink-0">
      <div className="relative">
        <div className="relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-[#dce9ee] text-[26px] font-bold text-[#003b4d]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={t.profileImage}
              fill
              sizes="84px"
              className="object-cover"
            />
          ) : initials ? (
            initials
          ) : (
            <UserRound size={32} />
          )}

          {uploading && (
            <div
              role="status"
              aria-label={t.uploading}
              className="absolute inset-0 flex items-center justify-center bg-black/40"
            >
              <Loader2
                size={25}
                className="animate-spin text-white"
              />
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          aria-label={t.changeImage}
          title={t.changeImage}
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#003b4d] text-white shadow-md disabled:opacity-60"
        >
          <Camera size={15} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          aria-label={t.changeImage}
          className="hidden"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-2 max-w-[180px] text-xs text-red-600"
        >
          {error}
        </p>
      )}

      {success && !error && (
        <p
          role="status"
          className="mt-2 max-w-[180px] text-xs text-emerald-700"
        >
          {t.uploadSuccess}
        </p>
      )}
    </div>
  );
}
