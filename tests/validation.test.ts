import { createLinkSchema, isPublicHttpUrl } from "@/lib/validation";
import { describe, expect, it } from "vitest";
describe("destination validation",()=>{ it("allows valid web destinations",()=>{ expect(isPublicHttpUrl("https://example.com/docs?a=1")).toBe(true); expect(createLinkSchema.safeParse({ originalUrl:"http://example.com",customCode:"docs_2026" }).success).toBe(true); }); it("rejects non-web protocols and malformed aliases",()=>{ expect(isPublicHttpUrl("javascript:alert(1)")).toBe(false); expect(isPublicHttpUrl("not a url")).toBe(false); expect(createLinkSchema.safeParse({ originalUrl:"https://example.com",customCode:"API" }).success).toBe(false); }); });

