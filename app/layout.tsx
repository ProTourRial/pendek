import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pendek — Modern URL Shortener",
  description: "Ringkas URL panjang menjadi tautan pendek yang mudah dibagikan.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id" suppressHydrationWarning><body>{children}<Toaster position="bottom-center" toastOptions={{ duration:3600, style:{ background:"#173a34", color:"#f4f0e8", borderRadius:"4px", fontFamily:"Manrope, sans-serif", fontWeight:700 } }} /></body></html>;
}
