import { isPermittedShortCode, normalizeShortCode } from "@/lib/short-code";
import { z } from "zod";

const urlMessage = "Masukkan URL http:// atau https:// yang valid.";

export function isPublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const createLinkSchema = z
  .object({
    originalUrl: z.string().trim().min(1, "URL tujuan wajib diisi.").max(2048, "URL tujuan maksimal 2.048 karakter.").refine(isPublicHttpUrl, urlMessage),
    customCode: z.string().trim().max(32, "Kode kustom maksimal 32 karakter.").optional(),
    recaptchaToken: z.string().trim().min(1, "Selesaikan verifikasi anti-spam terlebih dahulu.").max(4096, "Token verifikasi tidak valid."),
  })
  .superRefine((value, context) => {
    if (!value.customCode) return;
    const code = normalizeShortCode(value.customCode);
    if (!isPermittedShortCode(code)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["customCode"],
        message: "Kode kustom gunakan 3–32 huruf kecil, angka, tanda hubung, atau garis bawah; pilih nama selain rute sistem.",
      });
    }
  });

export type CreateLinkInput = z.infer<typeof createLinkSchema>;
