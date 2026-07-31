"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import FondoRotativo from "@/components/FondoRotativo";
import { useLiga } from "@/context/LigaContext";

export default function JugadoresPage() {
  const { liga } = useLiga();
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get("/jugadores")
      .then((res) => setJugadores(res.data))
      .finally(() => setCargando(false));
  }, []);

  const jugadoresFiltrados = jugadores.filter(
    (j) => (j.equipo?.liga || "Copa Chanka") === liga
  );

  return (
    <main className="min-h-screen text-white p-8 relative">
      <FondoRotativo
        imagenes={["/fondo.png", "/fondoestadisticas4.png", "/fondo3.png", "/fondotabla.png"]}
      />

      <h1 className="text-3xl font-bold mb-8">Jugadores - {liga}</h1>

      {cargando ? (
        <p className="text-slate-400">Cargando jugadores...</p>
      ) : jugadoresFiltrados.length === 0 ? (
        <p className="text-slate-500">Aun no hay jugadores registrados en {liga}.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {jugadoresFiltrados.map((j) => (
            <Link
              key={j._id}
              href={`/jugadores/${j._id}`}
              className="bg-slate-900/70 backdrop-blur-sm rounded-lg border border-slate-800 hover:border-teal-600 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
            >
              <div className="aspect-[3/4] w-full bg-slate-800 relative">
                {j.fotoUrl ? (
                  <img
                    src={j.fotoUrl}
                    alt={j.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
                    Sin foto
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent h-10" />
              </div>
              <div className="p-2 text-center">
                <p className="font-semibold text-sm truncate">{j.nombre}</p>
                <p className="text-xs text-slate-400">
                  {j.posicion} - #{j.dorsal || "-"}
                </p>
                <p className="text-xs text-teal-400 mt-0.5 truncate">{j.equipo?.nombre}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
