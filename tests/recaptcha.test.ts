import { verifyRecaptchaToken } from "@/lib/recaptcha";
import { afterEach, describe, expect, it, vi } from "vitest";

const originalFetch = global.fetch;
const originalSecret = process.env.RECAPTCHA_SECRET_KEY;

afterEach(() => {
  global.fetch = originalFetch;
  if (originalSecret) process.env.RECAPTCHA_SECRET_KEY = originalSecret;
  else delete process.env.RECAPTCHA_SECRET_KEY;
  vi.restoreAllMocks();
});

describe("Google reCAPTCHA verification", () => {
  it("fails closed when the server secret is not configured", async () => {
    delete process.env.RECAPTCHA_SECRET_KEY;
    await expect(verifyRecaptchaToken("token")).resolves.toMatchObject({ success: false, status: 503 });
  });

  it("accepts a token only when Google Siteverify returns success", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));

    await expect(verifyRecaptchaToken("valid-token", "198.51.100.8")).resolves.toEqual({ success: true, status: 200 });
    expect(global.fetch).toHaveBeenCalledWith("https://www.google.com/recaptcha/api/siteverify", expect.objectContaining({ method: "POST" }));
  });

  it("rejects expired, reused, or invalid tokens", async () => {
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    global.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }), { status: 200 }));

    await expect(verifyRecaptchaToken("expired-token")).resolves.toMatchObject({ success: false, status: 403 });
  });
});
