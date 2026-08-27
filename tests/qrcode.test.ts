import QRCode from "qrcode";
import { describe, expect, it } from "vitest";

describe("QR code export", () => {
  it("renders a short URL as a downloadable PNG data URL", async () => {
    const dataUrl = await QRCode.toDataURL("https://pendek.example/a8m2ky", {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 512,
      color: { dark: "#173A34", light: "#F4F0E8" },
    });

    expect(dataUrl).toMatch(/^data:image\/png;base64,/);
    expect(dataUrl.length).toBeGreaterThan(100);
  });
});
