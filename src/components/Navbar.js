"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLiga } from "@/context/LigaContext";

const enlaces = [
  { href: "/", label: "Inicio" },
  { href: "/tabla", label: "Tabla" },
  { href: "/partidos", label: "Partidos" },
  { href: "/jugadores", label: "Jugadores" },
  { href: "/estadisticas", label: "Estadisticas" },
  { href: "/oficiales", label: "Oficiales" },
  { href: "/noticias", label: "Noticias" },
];

const LIGAS = ["Copa Chanka", "Copa Capital"];

export default function Navbar() {
  const pathname = usePathname();
  const { liga, cambiarLiga } = useLiga();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="bg-slate-950/40 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4 flex-wrap">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-chanka.png"
            alt="Copa Chanka 2026"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-teal-400 font-bold text-lg tracking-wide hidden sm:inline drop-shadow">
            COPA CHANKA
          </span>
        </Link>

        <select
          value={liga}
          onChange={(e) => cambiarLiga(e.target.value)}
          className="bg-slate-900/80 border border-slate-700 text-sm rounded-full px-3 py-1.5 text-teal-300 font-medium"
        >
          {LIGAS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <nav className="flex gap-1 sm:gap-2 flex-wrap justify-end">
          {enlaces.map((enlace) => {
            const activo = pathname === enlace.href;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                className={`text-sm px-3 py-1.5 rounded transition ${
                  activo
                    ? "bg-teal-600 text-white"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
              >
                {enlace.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
