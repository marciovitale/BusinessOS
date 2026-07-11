import { Inter } from "next/font/google";

// Inter self-hosted via next/font (sem request externo em runtime).
// Exposta como CSS var `--font-sans`; o Tailwind mapeia `font-sans` -> var(--font-sans).
export const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
