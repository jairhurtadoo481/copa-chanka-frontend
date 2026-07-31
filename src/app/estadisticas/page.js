"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import FondoRotativo from "@/components/FondoRotativo";
import { useLiga } from "@/context/LigaContext";

function TarjetaPodio({ jugador, puesto, valor, etiqueta }) {
  const alturas = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const colores = {
    1: "border-amber-400 bg-amber-950/30",
    2: "border-slate-400 bg-slate-800/50",
    3: "border-orange-800 bg-orange-950/20",
  };
  const video = puesto === 1 ? "/video2.mp4" : "/video.mp4";

  return (
    <Link
      href={`/jugadores/${jugador._id}`}
      className="relative flex flex-col items-center opacity-0 animate-rise"
      style={{ animationDelay: `${puesto * 100}ms` }}
    >
      <div className="relative w-32 sm:w-40 rounded-xl overflow-hidden mb-2">
        <video
          src={video}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/30" />

        <div className="relative flex flex-col items-center py-4">
          <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 mb-2 ${colores[puesto]}`}>
            {jugador.jugadorInfo?.fotoUrl ? (
              <img
                src={jugador.jugadorInfo.fotoUrl}
                alt={jugador.jugadorInfo.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-800" />
            )}
          </div>
          <p className="text-sm font-semibold text-center max-w-[100px] truncate drop-shadow">
            {jugador.jugadorInfo?.nombre}
          </p>
          <p className="text-2xl font-extrabold text-teal-300 drop-shadow">{valor}</p>
          <p className="text-[10px] text-slate-200 uppercase tracking-wide drop-shadow">
            {etiqueta}
          </p>
        </div>
      </div>

      <div
        className={`w-16 sm:w-20 ${alturas[puesto]} rounded-t-lg border-t-2 ${colores[puesto]} flex items-start justify-center pt-1`}
      >
        <span className="text-lg font-bold text-slate-300">{puesto}</span>
      </div>
    </Link>
  );
}

export default function EstadisticasPage() {
  const { liga } = useLiga();
  const [goleadores, setGoleadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [orden, setOrden] = useState("goles");

  useEffect(() => {
    setCargando(true);
    api
      .get(`/estadisticas/goleadores?liga=${encodeURIComponent(liga)}`)
      .then((res) => setGoleadores(res.data))
      .finally(() => setCargando(false));
  }, [liga]);

  const ordenados = [...goleadores].sort((a, b) => {
    if (orden === "goles") return b.totalGoles - a.totalGoles;
    return b.totalAsistencias - a.totalAsistencias;
  });

  const top3 = ordenados.slice(0, 3);
  const resto = ordenados.slice(3);

  return (
    <main className="min-h-screen text-white p-8 relative">
      <FondoRotativo
        imagenes={[
          "/fondoestadisticas.png",
          "/fondoestadisticas2.png",
          "/fondoestadisticas3.png",
          "/fondoestadisticas4.png",
        ]}
      />

      <h1 className="text-3xl font-bold mb-2">Estadisticas - {liga}</h1>
      <p className="text-slate-400 text-sm mb-6">
        Goleadores y asistencias acumuladas de la temporada
      </p>

      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setOrden("goles")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            orden === "goles"
              ? "bg-teal-600 text-white"
              : "bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          Goleadores
        </button>
        <button
          onClick={() => setOrden("asistencias")}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            orden === "asistencias"
              ? "bg-teal-600 text-white"
              : "bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-slate-400 hover:border-slate-600"
          }`}
        >
          Asistencias
        </button>
      </div>

      {cargando ? (
        <p className="text-slate-400">Cargando estadisticas...</p>
      ) : ordenados.length === 0 ? (
        <p className="text-slate-500">Aun no hay estadisticas registradas en {liga}.</p>
      ) : (
        <>
          {top3.length > 0 && (
            <div className="flex items-end justify-center gap-4 sm:gap-8 mb-10 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-xl py-8">
              {top3[1] && (
                <TarjetaPodio
                  jugador={top3[1]}
                  puesto={2}
                  valor={orden === "goles" ? top3[1].totalGoles : top3[1].totalAsistencias}
                  etiqueta={orden}
                />
              )}
              {top3[0] && (
                <TarjetaPodio
                  jugador={top3[0]}
                  puesto={1}
                  valor={orden === "goles" ? top3[0].totalGoles : top3[0].totalAsistencias}
                  etiqueta={orden}
                />
              )}
              {top3[2] && (
                <TarjetaPodio
                  jugador={top3[2]}
                  puesto={3}
                  valor={orden === "goles" ? top3[2].totalGoles : top3[2].totalAsistencias}
                  etiqueta={orden}
                />
              )}
            </div>
          )}

          {resto.length > 0 && (
            <div className="overflow-x-auto bg-slate-900/50 backdrop-blur-sm rounded-xl p-2">
              <table className="w-full text-sm border-collapse max-w-2xl">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-800">
                    <th className="text-left py-2 px-2">#</th>
                    <th className="text-left py-2 px-2">Jugador</th>
                    <th className="text-center py-2 px-2">Goles</th>
                    <th className="text-center py-2 px-2">Asistencias</th>
                  </tr>
                </thead>
                <tbody>
                  {resto.map((g, i) => (
                    <tr
                      key={g._id}
                      className="border-b border-slate-900 opacity-0 animate-rise hover:bg-slate-900/50 transition-colors"
                      style={{ animationDelay: `${i * 40}ms` }}
                    >
                      <td className="py-2 px-2 text-slate-500">{i + 4}</td>
                      <td className="py-2 px-2">
                        <Link
                          href={`/jugadores/${g._id}`}
                          className="flex items-center gap-2 hover:text-teal-400 transition-colors"
                        >
                          {g.jugadorInfo?.fotoUrl ? (
                            <img
                              src={g.jugadorInfo.fotoUrl}
                              alt={g.jugadorInfo.nombre}
                              className="w-8 h-8 object-cover rounded-full bg-slate-800"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-800" />
                          )}
                          <span className="font-medium">{g.jugadorInfo?.nombre}</span>
                        </Link>
                      </td>
                      <td className="text-center py-2 px-2 font-bold text-teal-400">
                        {g.totalGoles}
                      </td>
                      <td className="text-center py-2 px-2">{g.totalAsistencias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </main>
  );
}
