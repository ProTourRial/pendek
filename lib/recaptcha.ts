type RecaptchaResponse = {
  success: boolean;
  hostname?: string;
  challenge_ts?: string;
  "error-codes"?: string[];
};

export type RecaptchaVerification = {
  success: boolean;
  status: number;
  message?: string;
};

const verificationUrl = "https://www.google.com/recaptcha/api/siteverify";

/** Verifies a single-use browser token. The secret is only ever read on the server. */
export async function verifyRecaptchaToken(token: string, remoteIp?: string): Promise<RecaptchaVerification> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.error("[recaptcha] RECAPTCHA_SECRET_KEY belum dikonfigurasi.");
    return { success: false, status: 503, message: "Verifikasi anti-spam belum dikonfigurasi. Coba lagi nanti." };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const response = await fetch(verificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("[recaptcha] Siteverify mengembalikan status", response.status);
      return { success: false, status: 503, message: "Verifikasi anti-spam sedang tidak tersedia. Coba lagi sebentar." };
    }

    const result = (await response.json()) as RecaptchaResponse;
    if (!result.success) {
      console.warn("[recaptcha] Token ditolak:", result["error-codes"]?.join(", ") ?? "unknown");
      return { success: false, status: 403, message: "Verifikasi anti-spam gagal atau kedaluwarsa. Silakan ulangi." };
    }

    return { success: true, status: 200 };
  } catch (error) {
    console.error("[recaptcha] Gagal menghubungi Siteverify.", error);
    return { success: false, status: 503, message: "Verifikasi anti-spam sedang tidak tersedia. Coba lagi sebentar." };
  } finally {
    clearTimeout(timeout);
  }
}
