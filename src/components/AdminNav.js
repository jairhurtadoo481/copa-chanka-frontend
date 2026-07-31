"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/lib/auth";
import { useRouter } from "next/navigation";

const enlaces = [
  { href: "/admin", label: "Equipos" },
  { href: "/admin/jugadores", label: "Jugadores" },
  { href: "/admin/partidos", label: "Partidos" },
  { href: "/admin/estadisticas", label: "Estadisticas" },
  { href: "/admin/noticias", label: "Noticias" },
  { href: "/admin/oficiales", label: "Organizadores/Arbitros" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const manejarLogout = () => {
    cerrarSesion();
    router.push("/admin/login");
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <nav className="flex gap-2 flex-wrap">
        {enlaces.map((enlace) => {
          const activo = pathname === enlace.href;
          return (
            <Link
              key={enlace.href}
              href={enlace.href}
              className={`text-sm px-3 py-1.5 rounded transition ${
                activo
                  ? "bg-teal-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {enlace.label}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={manejarLogout}
        className="text-sm text-slate-400 hover:text-white border border-slate-700 rounded px-3 py-1 self-start sm:self-auto"
      >
        Cerrar sesion
      </button>
    </div>
  );
}
