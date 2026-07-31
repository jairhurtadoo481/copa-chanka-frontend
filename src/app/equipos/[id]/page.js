"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";

export default function DetalleEquipoPage() {
  const { id } = useParams();
  const [equipo, setEquipo] = useState(null);
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/equipos"), api.get("/jugadores")])
      .then(([resEquipos, resJugadores]) => {
        const encontrado = resEquipos.data.find((e) => e._id === id);
        if (!encontrado) {
          setError("Equipo no encontrado");
        } else {
          setEquipo(encontrado);
          setJugadores(
            resJugadores.data.filter((j) => j.equipo?._id === id)
          );
        }
      })
      .catch((err) => setError(err.response?.data?.mensaje || "Error al cargar el equipo"))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <p>Cargando...</p>
      </main>
    );
  }

  if (error || !equipo) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <p className="text-red-400">{error || "Equipo no encontrado"}</p>
      </main>
    );
  }

  const acento = equipo.colorPrincipal || "#0F6E56";

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div
        className="h-40 sm:h-52 w-full"
        style={{
          background: `linear-gradient(135deg, ${acento}, ${equipo.colorSecundario || "#0f172a"})`,
        }}
      />

      <div className="max-w-4xl mx-auto px-8 -mt-16">
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8">
          {equipo.escudoUrl ? (
            <img
              src={equipo.escudoUrl}
              alt={equipo.nombre}
              className="w-32 h-32 object-contain rounded-full bg-slate-900 border-4 shadow-xl"
              style={{ borderColor: acento }}
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full bg-slate-900 border-4 shadow-xl flex items-center justify-center text-slate-600 text-xs"
              style={{ borderColor: acento }}
            >
              Sin escudo
            </div>
          )}

          <div className="text-center sm:text-left pb-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold">{equipo.nombre}</h1>
            <p className="text-slate-400 mt-1">{equipo.distrito || "Distrito no especificado"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Capitan</p>
            <p className="font-semibold text-lg">{equipo.capitan || "No definido"}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Grupo</p>
            <p className="font-semibold text-lg">{equipo.grupo || "-"}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 mb-1">Jugadores registrados</p>
            <p className="font-semibold text-lg">{jugadores.length}</p>
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Plantilla</h2>
        {jugadores.length === 0 ? (
          <p className="text-slate-500 mb-10">Aun no hay jugadores registrados.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-10">
            {jugadores.map((j) => (
              <Link
                key={j._id}
                href={`/jugadores/${j._id}`}
                className="bg-slate-900 rounded-lg border border-slate-800 hover:border-teal-600 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
              >
                <div className="aspect-[3/4] w-full bg-slate-800">
                  {j.fotoUrl ? (
                    <img
                      src={j.fotoUrl}
                      alt={j.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600 text-[10px]">
                      Sin foto
                    </div>
                  )}
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs font-semibold truncate">{j.nombre}</p>
                  <p className="text-[10px] text-slate-500">
                    {j.posicion} #{j.dorsal || "-"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
