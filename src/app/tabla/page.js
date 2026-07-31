"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import FondoRotativo from "@/components/FondoRotativo";
import { useLiga } from "@/context/LigaContext";

function TablaGrupo({ titulo, equipos, colorTexto, colorFondo, colorBorde }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${colorFondo} ${colorTexto}`}
        >
          {titulo}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${colorFondo}`} />
          Clasifican los primeros 6
        </span>
      </div>

      <div className={`overflow-x-auto rounded-xl border ${colorBorde} bg-slate-900/70 backdrop-blur-sm`}>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="text-left py-3 px-3">#</th>
              <th className="text-left py-3 px-3">Equipo</th>
              <th className="text-center py-3 px-2">PJ</th>
              <th className="text-center py-3 px-2">G</th>
              <th className="text-center py-3 px-2">E</th>
              <th className="text-center py-3 px-2">P</th>
              <th className="text-center py-3 px-2">GF</th>
              <th className="text-center py-3 px-2">GC</th>
              <th className="text-center py-3 px-2">DG</th>
              <th className="text-center py-3 px-3 font-bold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {equipos.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-8 text-slate-500">
                  Sin equipos en este grupo todavia
                </td>
              </tr>
            ) : (
              equipos.map((eq, i) => (
                <tr
                  key={eq.equipoId}
                  className={`border-b border-slate-900 opacity-0 animate-rise transition-colors hover:bg-slate-800/50 ${
                    i < 6 ? "bg-teal-950/30" : ""
                  }`}
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold ${
                        i < 6 ? "bg-teal-600 text-white" : "text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <Link
                      href={`/equipos/${eq.equipoId}`}
                      className="flex items-center gap-2 hover:text-teal-400 transition-colors"
                    >
                      {eq.escudoUrl ? (
                        <img
                          src={eq.escudoUrl}
                          alt={eq.nombre}
                          className="w-7 h-7 object-contain rounded-full bg-slate-800"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800" />
                      )}
                      <span className="font-medium">{eq.nombre}</span>
                    </Link>
                  </td>
                  <td className="text-center py-2.5 px-2 text-slate-300">{eq.jugados}</td>
                  <td className="text-center py-2.5 px-2 text-slate-300">{eq.ganados}</td>
                  <td className="text-center py-2.5 px-2 text-slate-300">{eq.empatados}</td>
                  <td className="text-center py-2.5 px-2 text-slate-300">{eq.perdidos}</td>
                  <td className="text-center py-2.5 px-2 text-slate-400">{eq.golesFavor}</td>
                  <td className="text-center py-2.5 px-2 text-slate-400">{eq.golesContra}</td>
                  <td className="text-center py-2.5 px-2 text-slate-400">
                    {eq.diferenciaGoles > 0 ? `+${eq.diferenciaGoles}` : eq.diferenciaGoles}
                  </td>
                  <td className="text-center py-2.5 px-3 font-bold text-teal-400 text-base">
                    {eq.puntos}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function TablaPage() {
  const { liga } = useLiga();
  const [tabla, setTabla] = useState({ grupoA: [], grupoB: [] });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    api
      .get(`/tabla?liga=${encodeURIComponent(liga)}`)
      .then((res) => setTabla(res.data))
      .finally(() => setCargando(false));
  }, [liga]);

  return (
    <main className="min-h-screen text-white p-8 relative">
      <FondoRotativo
        imagenes={["/fondotabla.png", "/fondotabla2.png", "/fondotabla3.png"]}
      />

      <h1 className="text-3xl font-bold mb-2">Tabla de Posiciones - {liga}</h1>
      <p className="text-slate-400 text-sm mb-8">
        Clasifican los 6 primeros de cada grupo, mas 1 cupo adicional
      </p>

      {cargando ? (
        <p className="text-slate-400">Cargando tabla...</p>
      ) : (
        <>
          <TablaGrupo
            titulo="Grupo A"
            equipos={tabla.grupoA}
            colorTexto="text-amber-300"
            colorFondo="bg-amber-900/40"
            colorBorde="border-amber-900/40"
          />
          <TablaGrupo
            titulo="Grupo B"
            equipos={tabla.grupoB}
            colorTexto="text-rose-300"
            colorFondo="bg-rose-900/40"
            colorBorde="border-rose-900/40"
          />
        </>
      )}
    </main>
  );
}
