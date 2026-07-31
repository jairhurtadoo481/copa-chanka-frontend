"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

function ContadorEvento({ etiqueta, valor, onSumar, onRestar, colorActivo }) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onRestar}
        disabled={valor === 0}
        className="w-6 h-6 rounded bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 text-xs"
      >
        -
      </button>
      <button
        onClick={onSumar}
        className={`px-2 py-1 rounded text-xs font-semibold border ${colorActivo} hover:brightness-125 transition min-w-[52px]`}
      >
        {etiqueta} {valor > 0 ? `(${valor})` : ""}
      </button>
    </div>
  );
}

function FilaJugador({ jugador, stats, onEvento }) {
  const s = stats || { goles: 0, asistencias: 0, tarjetasAmarillas: 0, tarjetasRojas: 0 };

  return (
    <div className="flex items-center justify-between gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2.5">
      <div className="flex items-center gap-2 min-w-0">
        {jugador.fotoUrl ? (
          <img src={jugador.fotoUrl} alt={jugador.nombre} className="w-8 h-8 rounded-full object-cover bg-slate-800 flex-shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-slate-800 flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{jugador.nombre}</p>
          <p className="text-[10px] text-slate-500">#{jugador.dorsal || "-"} {jugador.posicion}</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap justify-end">
        <ContadorEvento
          etiqueta="Gol"
          valor={s.goles}
          colorActivo="border-teal-700 text-teal-400 bg-teal-950/40"
          onSumar={() => onEvento(jugador._id, "gol", "sumar")}
          onRestar={() => onEvento(jugador._id, "gol", "restar")}
        />
        <ContadorEvento
          etiqueta="Asist"
          valor={s.asistencias}
          colorActivo="border-sky-700 text-sky-400 bg-sky-950/40"
          onSumar={() => onEvento(jugador._id, "asistencia", "sumar")}
          onRestar={() => onEvento(jugador._id, "asistencia", "restar")}
        />
        <ContadorEvento
          etiqueta="TA"
          valor={s.tarjetasAmarillas}
          colorActivo="border-amber-700 text-amber-400 bg-amber-950/40"
          onSumar={() => onEvento(jugador._id, "amarilla", "sumar")}
          onRestar={() => onEvento(jugador._id, "amarilla", "restar")}
        />
        <ContadorEvento
          etiqueta="TR"
          valor={s.tarjetasRojas}
          colorActivo="border-red-700 text-red-400 bg-red-950/40"
          onSumar={() => onEvento(jugador._id, "roja", "sumar")}
          onRestar={() => onEvento(jugador._id, "roja", "restar")}
        />
      </div>
    </div>
  );
}

export default function PartidoEnVivoPage() {
  const { id } = useParams();
  const [partido, setPartido] = useState(null);
  const [jugadoresLocal, setJugadoresLocal] = useState([]);
  const [jugadoresVisitante, setJugadoresVisitante] = useState([]);
  const [statsPorJugador, setStatsPorJugador] = useState({});
  const [cargando, setCargando] = useState(true);
  const [accionando, setAccionando] = useState(false);

  const cargarTodo = useCallback(async () => {
    const [resPartidos, resJugadores, resEstadisticas] = await Promise.all([
      api.get("/partidos"),
      api.get("/jugadores"),
      api.get("/estadisticas"),
    ]);

    const partidoActual = resPartidos.data.find((p) => p._id === id);
    setPartido(partidoActual);

    if (partidoActual) {
      setJugadoresLocal(
        resJugadores.data.filter((j) => j.equipo?._id === partidoActual.equipoLocal?._id)
      );
      setJugadoresVisitante(
        resJugadores.data.filter((j) => j.equipo?._id === partidoActual.equipoVisitante?._id)
      );
    }

    const mapa = {};
    resEstadisticas.data
      .filter((e) => e.partido?._id === id)
      .forEach((e) => {
        mapa[e.jugador?._id] = {
          goles: e.goles,
          asistencias: e.asistencias,
          tarjetasAmarillas: e.tarjetasAmarillas,
          tarjetasRojas: e.tarjetasRojas,
        };
      });
    setStatsPorJugador(mapa);
    setCargando(false);
  }, [id]);

  useEffect(() => {
    cargarTodo();
  }, [cargarTodo]);

  const manejarEvento = async (jugadorId, tipo, accion) => {
    setAccionando(true);
    try {
      if (accion === "sumar") {
        await api.post(`/partidos/${id}/evento`, { jugadorId, tipo });
      } else {
        await api.delete(`/partidos/${id}/evento`, { data: { jugadorId, tipo } });
      }
      await cargarTodo();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al registrar el evento");
    } finally {
      setAccionando(false);
    }
  };

  const iniciarPartido = async () => {
    setAccionando(true);
    try {
      await api.patch(`/partidos/${id}/iniciar`);
      await cargarTodo();
    } finally {
      setAccionando(false);
    }
  };

  const finalizarPartido = async () => {
    if (!confirm("¿Finalizar el partido? Una vez finalizado, se contara para la tabla de posiciones.")) return;
    setAccionando(true);
    try {
      await api.patch(`/partidos/${id}/finalizar`);
      await cargarTodo();
    } finally {
      setAccionando(false);
    }
  };

  if (cargando || !partido) {
    return (
      <RutaProtegida>
        <main className="min-h-screen bg-slate-950 text-white p-8">
          <p>Cargando partido...</p>
        </main>
      </RutaProtegida>
    );
  }

  const enVivo = partido.estado === "EnVivo";
  const finalizado = partido.estado === "Jugado";

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-2xl font-bold mb-6">Centro de Partido en Vivo</h1>
        <AdminNav />

        <div
          className={`rounded-2xl border-2 p-6 mb-8 transition-colors ${
            enVivo
              ? "border-teal-500 bg-teal-950/20"
              : finalizado
              ? "border-slate-700 bg-slate-900"
              : "border-slate-800 bg-slate-900/50"
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            {enVivo && (
              <span className="flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                En vivo
              </span>
            )}
            {finalizado && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Finalizado
              </span>
            )}
            {partido.estado === "Programado" && (
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Programado
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-6 sm:gap-12">
            <div className="flex flex-col items-center gap-2 flex-1">
              {partido.equipoLocal?.escudoUrl ? (
                <img src={partido.equipoLocal.escudoUrl} alt="" className="w-14 h-14 object-contain rounded-full bg-slate-800" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-800" />
              )}
              <p className="font-semibold text-center text-sm">{partido.equipoLocal?.nombre}</p>
            </div>

            <div className="text-4xl sm:text-5xl font-extrabold tracking-wider">
              {partido.golesLocal} - {partido.golesVisitante}
            </div>

            <div className="flex flex-col items-center gap-2 flex-1">
              {partido.equipoVisitante?.escudoUrl ? (
                <img src={partido.equipoVisitante.escudoUrl} alt="" className="w-14 h-14 object-contain rounded-full bg-slate-800" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-slate-800" />
              )}
              <p className="font-semibold text-center text-sm">{partido.equipoVisitante?.nombre}</p>
            </div>
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {partido.estado === "Programado" && (
              <button
                onClick={iniciarPartido}
                disabled={accionando}
                className="bg-teal-600 hover:bg-teal-500 transition rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Iniciar partido en vivo
              </button>
            )}
            {enVivo && (
              <button
                onClick={finalizarPartido}
                disabled={accionando}
                className="bg-red-700 hover:bg-red-600 transition rounded-full px-6 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Finalizar partido
              </button>
            )}
            {finalizado && (
              <p className="text-sm text-slate-500">
                Este partido ya finalizo y cuenta para la tabla de posiciones.
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-bold mb-3 text-teal-400">
              {partido.equipoLocal?.nombre}
            </h2>
            <div className="space-y-2">
              {jugadoresLocal.length === 0 ? (
                <p className="text-slate-500 text-sm">Sin jugadores registrados en este equipo.</p>
              ) : (
                jugadoresLocal.map((j) => (
                  <FilaJugador
                    key={j._id}
                    jugador={j}
                    stats={statsPorJugador[j._id]}
                    onEvento={manejarEvento}
                  />
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3 text-rose-400">
              {partido.equipoVisitante?.nombre}
            </h2>
            <div className="space-y-2">
              {jugadoresVisitante.length === 0 ? (
                <p className="text-slate-500 text-sm">Sin jugadores registrados en este equipo.</p>
              ) : (
                jugadoresVisitante.map((j) => (
                  <FilaJugador
                    key={j._id}
                    jugador={j}
                    stats={statsPorJugador[j._id]}
                    onEvento={manejarEvento}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </RutaProtegida>
  );
}
