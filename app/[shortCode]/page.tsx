/* Signal Ledger page: an intentionally invisible route endpoint directs reliably, never decorates. */
import { isPermittedShortCode, normalizeShortCode } from "@/lib/short-code";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
export const dynamic = "force-dynamic";
export default async function ShortLinkRedirect({ params }:{ params:Promise<{ shortCode:string }> }) { const { shortCode:raw } = await params; const shortCode = normalizeShortCode(raw); if (!isPermittedShortCode(shortCode)) notFound(); const link = await prisma.link.findUnique({ where:{ shortCode },select:{ id:true,originalUrl:true } }); if (!link) notFound(); await prisma.link.update({ where:{ id:link.id },data:{ clicks:{ increment:1 },lastVisitedAt:new Date() } }); redirect(link.originalUrl); }
