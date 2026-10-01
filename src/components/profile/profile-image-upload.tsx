"use client";

import {
  Camera,
  Loader2,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import {
  ChangeEvent,
  useRef,
  useState,
} from "react";

import { updateProfileImageAction } from "@/server/actions/update-profile-image";

interface ProfileImageUploadProps {
  initialImageUrl: string | null;
  initials: string;
}

export function ProfileImageUpload({
  initialImageUrl,
  initials,
}: ProfileImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [imageUrl, setImageUrl] =
    useState(initialImageUrl);

  const [uploading, setUploading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);
    setUploading(true);

    const formData = new FormData();
    formData.append("image", file);

    const result =
      await updateProfileImageAction(
        formData
      );

    if (!result.success) {
      setError(result.error);
      setUploading(false);
      event.target.value = "";
      return;
    }

    setImageUrl(result.imageUrl);
    setUploading(false);
    event.target.value = "";
  }

  return (
    <div className="shrink-0">
      <div className="relative">
        <div className="relative flex h-[84px] w-[84px] items-center justify-center overflow-hidden rounded-full bg-[#dce9ee] text-[26px] font-bold text-[#003b4d]">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Profile"
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
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
          onClick={() =>
            inputRef.current?.click()
          }
          aria-label="Change profile image"
          className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#003b4d] text-white shadow-md disabled:opacity-60"
        >
          <Camera size={15} />
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="mt-2 max-w-[150px] text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}