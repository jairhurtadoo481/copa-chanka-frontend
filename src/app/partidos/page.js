"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import FondoRotativo from "@/components/FondoRotativo";
import { useLiga } from "@/context/LigaContext";

function EscudoMini({ equipo }) {
  return equipo?.escudoUrl ? (
    <img
      src={equipo.escudoUrl}
      alt={equipo?.nombre}
      className="w-9 h-9 object-contain rounded-full bg-slate-800"
    />
  ) : (
    <div className="w-9 h-9 rounded-full bg-slate-800" />
  );
}

function TarjetaPartido({ partido, index }) {
  const fecha = new Date(partido.fecha).toLocaleString("es-PE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const enVivo = partido.estado === "EnVivo";
  const jugado = partido.estado === "Jugado";
  const muestraMarcador = enVivo || jugado;

  const estiloEstado = enVivo
    ? "bg-teal-500/20 text-teal-300 border-teal-500"
    : jugado
    ? "bg-teal-900/60 text-teal-300 border-teal-800"
    : partido.estado === "Suspendido"
    ? "bg-red-900/60 text-red-300 border-red-800"
    : "bg-slate-800 text-slate-400 border-slate-700";

  return (
    <div
      className={`bg-slate-900/70 backdrop-blur-sm rounded-xl p-4 border opacity-0 animate-rise transition-colors duration-300 ${
        enVivo ? "border-teal-500" : "border-slate-800 hover:border-teal-700"
      }`}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex justify-between items-center text-xs text-slate-500 mb-3">
        <span className="font-medium">Jornada {partido.jornada || "-"}</span>
        <span>{fecha}</span>
      </div>

      <div className="flex items-center justify-between">
        <Link
          href={`/equipos/${partido.equipoLocal?._id}`}
          className="flex items-center gap-2 flex-1 hover:text-teal-400 transition-colors"
        >
          <EscudoMini equipo={partido.equipoLocal} />
          <span className="font-medium truncate text-sm">{partido.equipoLocal?.nombre}</span>
        </Link>

        <div className="px-3 text-center flex-shrink-0">
          {muestraMarcador ? (
            <span
              className={`text-xl font-extrabold tracking-wider ${
                enVivo ? "text-teal-300" : "text-teal-400"
              }`}
            >
              {partido.golesLocal} - {partido.golesVisitante}
            </span>
          ) : (
            <span className="text-xs text-slate-500 font-medium">VS</span>
          )}
        </div>

        <Link
          href={`/equipos/${partido.equipoVisitante?._id}`}
          className="flex items-center gap-2 flex-1 justify-end hover:text-teal-400 transition-colors"
        >
          <span className="font-medium truncate text-sm text-right">
            {partido.equipoVisitante?.nombre}
          </span>
          <EscudoMini equipo={partido.equipoVisitante} />
        </Link>
      </div>

      <div className="flex justify-between items-center mt-4 text-xs">
        <span className="text-slate-500">{partido.sede || "Sede por confirmar"}</span>
        <span className={`px-2 py-0.5 rounded border flex items-center gap-1.5 ${estiloEstado}`}>
          {enVivo && <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
          {enVivo ? "EN VIVO" : partido.estado}
        </span>
      </div>
    </div>
  );
}

export default function PartidosPage() {
  const { liga } = useLiga();
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("Todos");

  useEffect(() => {
    let activo = true;

    const cargar = () => {
      api.get("/partidos").then((res) => {
        if (activo) setPartidos(res.data);
      });
    };

    cargar();
    setCargando(false);

    const intervalo = setInterval(cargar, 8000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, []);

  const partidosDeLaLiga = partidos.filter(
    (p) => (p.equipoLocal?.liga || "Copa Chanka") === liga
  );

  const hayPartidosEnVivo = partidosDeLaLiga.some((p) => p.estado === "EnVivo");

  const partidosFiltrados = partidosDeLaLiga.filter((p) => {
    if (filtro === "Todos") return true;
    return p.estado === filtro;
  });

  const ordenados = [...partidosFiltrados].sort((a, b) => {
    if (a.estado === "EnVivo" && b.estado !== "EnVivo") return -1;
    if (b.estado === "EnVivo" && a.estado !== "EnVivo") return 1;
    return 0;
  });

  return (
    <main className="min-h-screen text-white p-8 relative">
      <FondoRotativo
        imagenes={[
          "/fondopartido.png",
          "/fondopartido2.png",
          "/fondopartido3.png",
          "/fondopartido4.png",
          "/fondopartido5.png",
        ]}
      />

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold">Calendario de Partidos - {liga}</h1>
        {hayPartidosEnVivo && (
          <span className="flex items-center gap-1.5 text-xs font-bold text-teal-300 bg-teal-500/20 border border-teal-500 rounded-full px-3 py-1 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Hay partidos en vivo
          </span>
        )}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["Todos", "Programado", "EnVivo", "Jugado", "Suspendido"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filtro === f
                ? "bg-teal-600 text-white"
                : "bg-slate-900/70 backdrop-blur-sm border border-slate-800 text-slate-400 hover:border-slate-600"
            }`}
          >
            {f === "EnVivo" ? "En vivo" : f}
          </button>
        ))}
      </div>

      {cargando ? (
        <p className="text-slate-400">Cargando partidos...</p>
      ) : ordenados.length === 0 ? (
        <p className="text-slate-500">No hay partidos en esta categoria.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ordenados.map((p, i) => (
            <TarjetaPartido key={p._id} partido={p} index={i} />
          ))}
        </div>
      )}
    </main>
  );
}
