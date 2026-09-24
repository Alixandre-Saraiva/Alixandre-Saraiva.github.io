"use client";

import { Camera, Loader2 } from "lucide-react";
import { useRef, useTransition } from "react";
import { uploadAvatar } from "@/actions/profile";
import { Avatar } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/toast";

/** Reduz a imagem no navegador (máx. 512 px, JPEG) antes do envio. */
async function resize(file: File, max = 512): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.85));
}

export function AvatarUploader({ src, name }: { src: string | null; name: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    start(async () => {
      const blob = await resize(file).catch(() => file);
      const data = new FormData();
      data.set("foto", new File([blob], "avatar.jpg", { type: "image/jpeg" }));
      const res = await uploadAvatar(data);
      toast(res.message ?? "", res.ok ? "success" : "error");
    });
    e.target.value = "";
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button type="button" onClick={() => input.current?.click()} className="group relative rounded-full" aria-label="Alterar foto">
        <Avatar src={src} name={name} size="xl" />
        <span className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-accent text-[#222] shadow-soft transition group-hover:scale-110">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
        </span>
      </button>
      <span className="text-xs text-muted">Toque para alterar a foto</span>
      <input ref={input} type="file" accept="image/*" className="hidden" onChange={onChange} />
    </div>
  );
}
