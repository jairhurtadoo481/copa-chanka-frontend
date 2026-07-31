"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-950 border-t border-slate-800 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-8 text-sm text-slate-500">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-teal-400 font-bold mb-1">COPA CHANKA 2026</p>
            <p>Segunda Edicion - Liga Superior de Futsal Apurimac-Andahuaylas</p>
          </div>

          <div className="text-left sm:text-right">
            <p>Informes e inscripciones:</p>
            <p className="text-slate-300">973 825 445 - 920 330 845</p>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-6 pt-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-600">
          <span>
            © {new Date().getFullYear()} Copa Chanka. Organiza: La Liga Superior de Futbol de Salon Apurimac-Andahuaylas.
          </span>
          <Link href="/admin/login" className="text-slate-700 hover:text-slate-500 transition">
            Acceso administrador
          </Link>
        </div>
      </div>
    </footer>
  );
}
