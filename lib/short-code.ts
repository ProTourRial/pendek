import { customAlphabet } from "nanoid";

export const SHORT_CODE_LENGTH = 6;
export const SHORT_CODE_PATTERN = /^[a-z0-9_-]{3,32}$/;

const alphabet = "23456789abcdefghjkmnpqrstuvwxyz";
const createNanoid = customAlphabet(alphabet, SHORT_CODE_LENGTH);

/** Paths owned by the application that cannot become public short links. */
export const RESERVED_SHORT_CODES = new Set([
  "api", "insight", "admin", "dashboard", "login", "logout", "favicon.ico", "robots.txt", "sitemap.xml", "manifest.webmanifest",
]);

export function normalizeShortCode(value: string) {
  return value.trim().toLowerCase();
}

export function isPermittedShortCode(value: string) {
  return SHORT_CODE_PATTERN.test(value) && !RESERVED_SHORT_CODES.has(value);
}

export function createShortCode() {
  return createNanoid();
}
