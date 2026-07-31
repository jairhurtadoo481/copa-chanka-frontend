import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { LigaProvider } from "@/context/LigaContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Copa Chanka 2026",
  description: "Portal oficial de la Copa Chanka 2026 - Futsal Apurimac",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950">
        <LigaProvider>
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </LigaProvider>
      </body>
    </html>
  );
}
