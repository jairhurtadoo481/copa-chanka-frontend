"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";

export default function DetalleJugadorPage() {
  const { id } = useParams();
  const [jugador, setJugador] = useState(null);
  const [estadisticas, setEstadisticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([api.get(`/jugadores/${id}`), api.get("/estadisticas")])
      .then(([resJugador, resEstadisticas]) => {
        setJugador(resJugador.data);
        const propias = resEstadisticas.data.filter(
          (e) => e.jugador?._id === id
        );
        setEstadisticas(propias);
      })
      .catch((err) => setError(err.response?.data?.mensaje || "Error al cargar el jugador"))
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <p>Cargando...</p>
      </main>
    );
  }

  if (error || !jugador) {
    return (
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <p className="text-red-400">{error || "Jugador no encontrado"}</p>
      </main>
    );
  }

  const totales = estadisticas.reduce(
    (acc, e) => ({
      goles: acc.goles + (e.goles || 0),
      asistencias: acc.asistencias + (e.asistencias || 0),
      amarillas: acc.amarillas + (e.tarjetasAmarillas || 0),
      rojas: acc.rojas + (e.tarjetasRojas || 0),
    }),
    { goles: 0, asistencias: 0, amarillas: 0, rojas: 0 }
  );

  const colorEstado =
    jugador.estado === "Activo"
      ? "bg-teal-900 text-teal-300"
      : jugador.estado === "Lesionado"
      ? "bg-red-900 text-red-300"
      : "bg-amber-900 text-amber-300";

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="w-40 aspect-[3/4] rounded-lg overflow-hidden border-2 border-teal-700 bg-slate-800 flex-shrink-0">
          {jugador.fotoUrl ? (
            <img
              src={jugador.fotoUrl}
              alt={jugador.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">
              Sin foto
            </div>
          )}
        </div>

        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{jugador.nombre}</h1>
          <p className="text-teal-400 font-medium mt-1">
            {jugador.posicion} {jugador.dorsal ? `- #${jugador.dorsal}` : ""}
          </p>

          <div className="flex flex-wrap gap-3 mt-3 justify-center sm:justify-start text-sm text-slate-400">
            {jugador.edad && <span>{jugador.edad} anios</span>}
            {jugador.equipo && (
              <span className="flex items-center gap-2">
                {jugador.equipo.escudoUrl && (
                  <img
                    src={jugador.equipo.escudoUrl}
                    alt={jugador.equipo.nombre}
                    className="w-5 h-5 object-contain rounded-full bg-slate-800"
                  />
                )}
                {jugador.equipo.nombre}
              </span>
            )}
            <span className={`px-2 py-0.5 rounded ${colorEstado}`}>
              {jugador.estado}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Representante</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {jugador.representante || "Sin representante"}
            </p>
            {jugador.representante && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  jugador.representanteActivo
                    ? "bg-teal-900 text-teal-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {jugador.representanteActivo ? "Activo" : "Inactivo"}
              </span>
            )}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 mb-1">Valor de mercado</p>
          <div className="flex items-center justify-between">
            <p className="font-medium">
              {jugador.valorMercado
                ? `S/ ${jugador.valorMercado.toLocaleString("es-PE")}`
                : "No definido"}
            </p>
            {jugador.valorMercado && (
              <span
                className={`text-xs px-2 py-0.5 rounded ${
                  jugador.valorMercadoActivo
                    ? "bg-teal-900 text-teal-300"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {jugador.valorMercadoActivo ? "Activo" : "Inactivo"}
              </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Estadisticas de la temporada</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-teal-400">{totales.goles}</p>
          <p className="text-xs text-slate-400 mt-1">Goles</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-teal-400">{totales.asistencias}</p>
          <p className="text-xs text-slate-400 mt-1">Asistencias</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-amber-400">{totales.amarillas}</p>
          <p className="text-xs text-slate-400 mt-1">Tarjetas amarillas</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-400">{totales.rojas}</p>
          <p className="text-xs text-slate-400 mt-1">Tarjetas rojas</p>
        </div>
      </div>

      {jugador.trayectoria && jugador.trayectoria.length > 0 && (
        <>
          <h2 className="text-xl font-bold mb-4">Trayectoria</h2>
          <div className="mb-8 relative pl-6">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-800" />
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-teal-500" />
                <p className="font-semibold">{jugador.equipo?.nombre}</p>
                <p className="text-xs text-slate-500">Club actual</p>
              </div>

              {jugador.trayectoria.map((t, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-600" />
                  <p className="font-medium text-slate-300">{t.club}</p>
                  {t.torneo && <p className="text-xs text-slate-500">{t.torneo}</p>}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">Partido por partido</h2>
      {estadisticas.length === 0 ? (
        <p className="text-slate-500">Aun no hay estadisticas registradas.</p>
      ) : (
        <div className="space-y-2">
          {estadisticas.map((e) => (
            <div
              key={e._id}
              className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex justify-between text-sm"
            >
              <span className="text-slate-400">
                Jornada {e.partido?.jornada || "-"} -{" "}
                {e.partido?.fecha &&
                  new Date(e.partido.fecha).toLocaleDateString("es-PE")}
              </span>
              <span>
                {e.goles} goles, {e.asistencias} asist., {e.tarjetasAmarillas} TA,{" "}
                {e.tarjetasRojas} TR
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
