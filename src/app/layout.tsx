import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "../context/ThemeContext";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-outfit",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PharmaChain | Counterfeit Medicine Tracking System",
  description: "Secure, blockchain-powered medicine supply chain tracking, verification, and authentication system preventing counterfeit pharmaceutical products globally.",
  keywords: ["Blockchain", "PharmaChain", "Counterfeit Medicine", "Supply Chain Tracking", "Polygon Amoy", "Next.js", "Firestore"],
  authors: [{ name: "PharmaChain Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
  modal
}: Readonly<{
  children: React.ReactNode;
  modal?: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable} h-full antialiased`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex-1 flex flex-col">
              {children}
              {modal}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
