import { isPermittedShortCode, normalizeShortCode } from "@/lib/short-code";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
export const runtime = "nodejs";
export async function GET(_request: Request,{ params }:{ params:Promise<{ shortCode:string }> }) { const { shortCode:raw } = await params; const shortCode = normalizeShortCode(raw); if (!isPermittedShortCode(shortCode)) return NextResponse.json({ error:"Kode tautan tidak valid." },{ status:400 }); const link = await prisma.link.findUnique({ where:{ shortCode },select:{ originalUrl:true,shortCode:true,clicks:true,createdAt:true,lastVisitedAt:true } }); if (!link) return NextResponse.json({ error:"Tautan tidak ditemukan." },{ status:404 }); return NextResponse.json(link,{ headers:{ "Cache-Control":"no-store, max-age=0" } }); }
