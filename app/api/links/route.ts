import { createShortCode, normalizeShortCode } from "@/lib/short-code";
import { prisma } from "@/lib/prisma";
import { takeRateLimitToken } from "@/lib/rate-limit";
import { createLinkSchema } from "@/lib/validation";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function getClientIdentifier(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous";
}

function rateLimitHeaders(result: Awaited<ReturnType<typeof takeRateLimitToken>>): HeadersInit {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.reset / 1000)),
  };
}

function responseError(error: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error }, { status, headers });
}

export async function POST(request: NextRequest) {
  const rateLimit = await takeRateLimitToken(getClientIdentifier(request));
  const headers = rateLimitHeaders(rateLimit);

  if (!rateLimit.allowed) {
    return responseError("Terlalu banyak permintaan. Coba kembali sebentar lagi.", 429, {
      ...headers,
      "Retry-After": String(rateLimit.retryAfterSeconds),
    });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return responseError("Body permintaan harus berupa JSON yang valid.", 400, headers);
  }

  const parsed = createLinkSchema.safeParse(payload);
  if (!parsed.success) {
    return responseError(parsed.error.issues[0]?.message ?? "Data tautan tidak valid.", 422, headers);
  }

  const customCode = parsed.data.customCode ? normalizeShortCode(parsed.data.customCode) : null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = customCode ?? createShortCode();
    try {
      const link = await prisma.link.create({
        data: { originalUrl: parsed.data.originalUrl, shortCode },
        select: { originalUrl: true, shortCode: true, clicks: true, createdAt: true },
      });

      return NextResponse.json(
        { ...link, shortUrl: `${new URL(request.url).origin}/${link.shortCode}` },
        { status: 201, headers },
      );
    } catch (error) {
      const isUniqueCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (isUniqueCollision && customCode) return responseError("Kode kustom tersebut sudah dipakai. Coba kode lain.", 409, headers);
      if (!isUniqueCollision) {
        console.error("[links.create]", error);
        return responseError("Tautan belum dapat disimpan. Coba lagi beberapa saat.", 500, headers);
      }
    }
  }

  return responseError("Kode unik belum tersedia. Silakan coba lagi.", 503, headers);
}
