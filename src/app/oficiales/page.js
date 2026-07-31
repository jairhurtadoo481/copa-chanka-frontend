"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useLiga } from "@/context/LigaContext";

function TarjetaOficial({ oficial }) {
  return (
    <div className="bg-slate-900/70 backdrop-blur-sm border border-slate-800 rounded-xl p-4 flex items-center gap-4">
      {oficial.fotoUrl ? (
        <img
          src={oficial.fotoUrl}
          alt={oficial.nombre}
          className="w-16 h-16 object-cover rounded-full bg-slate-800 border-2 border-teal-700"
        />
      ) : (
        <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700" />
      )}
      <div>
        <p className="font-semibold">{oficial.nombre}</p>
        <p className="text-xs text-slate-400">{oficial.cargo || oficial.tipo}</p>
        {oficial.telefono && (
          <p className="text-xs text-teal-400 mt-0.5">{oficial.telefono}</p>
        )}
      </div>
    </div>
  );
}

function TablaArbitrosPorJornada({ partidos }) {
  const jornadas = {};
  partidos.forEach((p) => {
    const j = p.jornada || "Sin jornada";
    if (!jornadas[j]) jornadas[j] = [];
    jornadas[j].push(p);
  });

  const numerosJornada = Object.keys(jornadas).sort((a, b) => Number(a) - Number(b));

  if (numerosJornada.length === 0) {
    return <p className="text-slate-500">Aun no hay partidos programados.</p>;
  }

  return (
    <div className="space-y-8">
      {numerosJornada.map((jornada) => (
        <div key={jornada}>
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wide mb-3">
            Jornada {jornada}
          </h3>
          <div className="space-y-2">
            {jornadas[jornada].map((p) => {
              const nombresArbitros = (p.arbitros || []).map((a) => a.nombre).join(" / ");
              return (
                <div
                  key={p._id}
                  className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <span className="text-sm font-medium">
                    {p.equipoLocal?.nombre} vs {p.equipoVisitante?.nombre}
                  </span>
                  <span className="text-xs text-slate-400">
                    Arbitros:{" "}
                    <span className={nombresArbitros ? "text-teal-300" : "text-slate-500"}>
                      {nombresArbitros || "Sin asignar"}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OficialesPage() {
  const { liga } = useLiga();
  const [oficiales, setOficiales] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [vista, setVista] = useState("perfiles");

  useEffect(() => {
    Promise.all([api.get("/oficiales"), api.get("/partidos")])
      .then(([resOficiales, resPartidos]) => {
        setOficiales(resOficiales.data);
        setPartidos(resPartidos.data);
      })
      .finally(() => setCargando(false));
  }, []);

  const organizadores = oficiales.filter((o) => o.tipo === "Organizador");
  const arbitros = oficiales.filter((o) => o.tipo === "Arbitro");
  const partidosDeLaLiga = partidos.filter(
    (p) => (p.equipoLocal?.liga || "Copa Chanka") === liga
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Organizadores y Arbitros</h1>
      <p className="text-slate-400 text-sm mb-6">
        Equipo organizador de la liga y arbitros asignados a cada jornada de {liga}
      </p>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setVista("perfiles")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            vista === "perfiles"
              ? "bg-teal-600 text-white"
              : "bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          Perfiles
        </button>
        <button
          onClick={() => setVista("jornadas")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            vista === "jornadas"
              ? "bg-teal-600 text-white"
              : "bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          Arbitros por jornada
        </button>
      </div>

      {cargando ? (
        <p className="text-slate-400">Cargando...</p>
      ) : vista === "perfiles" ? (
        <>
          <h2 className="text-xl font-bold mb-4">Organizadores</h2>
          {organizadores.length === 0 ? (
            <p className="text-slate-500 mb-8">Sin organizadores registrados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-10">
              {organizadores.map((o) => (
                <TarjetaOficial key={o._id} oficial={o} />
              ))}
            </div>
          )}

          <h2 className="text-xl font-bold mb-4">Arbitros</h2>
          {arbitros.length === 0 ? (
            <p className="text-slate-500">Sin arbitros registrados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {arbitros.map((a) => (
                <TarjetaOficial key={a._id} oficial={a} />
              ))}
            </div>
          )}
        </>
      ) : (
        <TablaArbitrosPorJornada partidos={partidosDeLaLiga} />
      )}
    </main>
  );
}
