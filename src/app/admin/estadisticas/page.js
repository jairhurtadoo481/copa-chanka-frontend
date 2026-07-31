"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

const LIGAS = ["Copa Chanka", "Copa Capital"];

function FormularioEstadistica({ jugadores, partidos, onCreado }) {
  const [jugador, setJugador] = useState(jugadores[0]?._id || "");
  const [partido, setPartido] = useState(partidos[0]?._id || "");
  const [goles, setGoles] = useState(0);
  const [asistencias, setAsistencias] = useState(0);
  const [tarjetasAmarillas, setTarjetasAmarillas] = useState(0);
  const [tarjetasRojas, setTarjetasRojas] = useState(0);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setJugador(jugadores[0]?._id || "");
    setPartido(partidos[0]?._id || "");
  }, [jugadores, partidos]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    try {
      await api.post("/estadisticas", {
        jugador,
        partido,
        goles: Number(goles),
        asistencias: Number(asistencias),
        tarjetasAmarillas: Number(tarjetasAmarillas),
        tarjetasRojas: Number(tarjetasRojas),
      });

      setMensaje("Estadistica registrada correctamente");
      setGoles(0);
      setAsistencias(0);
      setTarjetasAmarillas(0);
      setTarjetasRojas(0);
      onCreado();
    } catch (err) {
      setMensaje(
        err.response?.data?.mensaje || "Error al registrar la estadistica"
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nueva estadistica</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Jugador</label>
      <select
        value={jugador}
        onChange={(e) => setJugador(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      >
        {jugadores.map((j) => (
          <option key={j._id} value={j._id}>
            {j.nombre} ({j.equipo?.nombre})
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-400 mb-1">Partido</label>
      <select
        value={partido}
        onChange={(e) => setPartido(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      >
        {partidos.map((p) => (
          <option key={p._id} value={p._id}>
            {p.equipoLocal?.nombre} vs {p.equipoVisitante?.nombre} (Jornada{" "}
            {p.jornada || "-"})
          </option>
        ))}
      </select>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm text-slate-400 mb-1">Goles</label>
          <input
            type="number"
            min="0"
            value={goles}
            onChange={(e) => setGoles(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Asistencias</label>
          <input
            type="number"
            min="0"
            value={asistencias}
            onChange={(e) => setAsistencias(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">
            Tarjetas amarillas
          </label>
          <input
            type="number"
            min="0"
            value={tarjetasAmarillas}
            onChange={(e) => setTarjetasAmarillas(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Tarjetas rojas</label>
          <input
            type="number"
            min="0"
            value={tarjetasRojas}
            onChange={(e) => setTarjetasRojas(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando || jugadores.length === 0 || partidos.length === 0}
        className="w-full bg-teal-600 hover:bg-teal-500 transition rounded py-2 font-semibold disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Registrar estadistica"}
      </button>
    </form>
  );
}

function FilaEstadistica({ estadistica, jugadores, partidos, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [jugador, setJugador] = useState(estadistica.jugador?._id || "");
  const [partido, setPartido] = useState(estadistica.partido?._id || "");
  const [goles, setGoles] = useState(estadistica.goles);
  const [asistencias, setAsistencias] = useState(estadistica.asistencias);
  const [tarjetasAmarillas, setTarjetasAmarillas] = useState(
    estadistica.tarjetasAmarillas
  );
  const [tarjetasRojas, setTarjetasRojas] = useState(estadistica.tarjetasRojas);
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      await api.patch(`/estadisticas/${estadistica._id}`, {
        jugador,
        partido,
        goles: Number(goles),
        asistencias: Number(asistencias),
        tarjetasAmarillas: Number(tarjetasAmarillas),
        tarjetasRojas: Number(tarjetasRojas),
      });
      setEditando(false);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al actualizar");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm("¿Eliminar este registro de estadistica?")) return;
    try {
      await api.delete(`/estadisticas/${estadistica._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 border border-teal-700 rounded-xl p-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select
            value={jugador}
            onChange={(e) => setJugador(e.target.value)}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          >
            {jugadores.map((j) => (
              <option key={j._id} value={j._id}>
                {j.nombre}
              </option>
            ))}
          </select>
          <select
            value={partido}
            onChange={(e) => setPartido(e.target.value)}
            className="px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          >
            {partidos.map((p) => (
              <option key={p._id} value={p._id}>
                {p.equipoLocal?.nombre} vs {p.equipoVisitante?.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-4 gap-2 mb-3">
          <input
            type="number"
            value={goles}
            onChange={(e) => setGoles(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-center"
          />
          <input
            type="number"
            value={asistencias}
            onChange={(e) => setAsistencias(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-center"
          />
          <input
            type="number"
            value={tarjetasAmarillas}
            onChange={(e) => setTarjetasAmarillas(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-center"
          />
          <input
            type="number"
            value={tarjetasRojas}
            onChange={(e) => setTarjetasRojas(e.target.value)}
            className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm text-center"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="bg-teal-600 hover:bg-teal-500 transition rounded px-4 py-1.5 text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={() => setEditando(false)}
            className="border border-slate-700 rounded px-4 py-1.5 text-sm text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="font-semibold">{estadistica.jugador?.nombre}</p>
        <p className="text-xs text-slate-400">
          Jornada {estadistica.partido?.jornada || "-"} -{" "}
          {estadistica.goles} goles, {estadistica.asistencias} asist.,{" "}
          {estadistica.tarjetasAmarillas} TA, {estadistica.tarjetasRojas} TR
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setEditando(true)}
          className="text-xs border border-slate-700 rounded px-3 py-1 hover:border-teal-500 hover:text-teal-400"
        >
          Editar
        </button>
        <button
          onClick={eliminar}
          className="text-xs border border-red-900 text-red-400 rounded px-3 py-1 hover:bg-red-950"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default function EstadisticasAdminPage() {
  const [jugadores, setJugadores] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [estadisticas, setEstadisticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroLiga, setFiltroLiga] = useState("Copa Chanka");

  const cargarDatos = () => {
    Promise.all([
      api.get("/jugadores"),
      api.get("/partidos"),
      api.get("/estadisticas"),
    ])
      .then(([resJugadores, resPartidos, resEstadisticas]) => {
        setJugadores(resJugadores.data);
        setPartidos(resPartidos.data);
        setEstadisticas(resEstadisticas.data);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const jugadoresDeLaLiga = jugadores.filter(
    (j) => (j.equipo?.liga || "Copa Chanka") === filtroLiga
  );
  const partidosDeLaLiga = partidos.filter(
    (p) => (p.equipoLocal?.liga || "Copa Chanka") === filtroLiga
  );
  const idsJugadoresLiga = new Set(jugadoresDeLaLiga.map((j) => j._id));
  const estadisticasDeLaLiga = estadisticas.filter((e) =>
    idsJugadoresLiga.has(e.jugador?._id)
  );

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Estadisticas - Panel Admin</h1>
        <AdminNav />

        <div className="flex gap-2 mb-6">
          {LIGAS.map((l) => (
            <button
              key={l}
              onClick={() => setFiltroLiga(l)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filtroLiga === l
                  ? "bg-teal-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600"
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {cargando ? (
          <p>Cargando...</p>
        ) : jugadoresDeLaLiga.length === 0 || partidosDeLaLiga.length === 0 ? (
          <p className="text-red-400">
            Necesitas al menos un jugador y un partido creados en {filtroLiga} antes
            de registrar estadisticas.
          </p>
        ) : (
          <>
            <FormularioEstadistica
              jugadores={jugadoresDeLaLiga}
              partidos={partidosDeLaLiga}
              onCreado={cargarDatos}
            />

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-bold mb-2">
                Registros de {filtroLiga} ({estadisticasDeLaLiga.length})
              </h2>
              {estadisticasDeLaLiga.map((e) => (
                <FilaEstadistica
                  key={e._id}
                  estadistica={e}
                  jugadores={jugadoresDeLaLiga}
                  partidos={partidosDeLaLiga}
                  onActualizado={cargarDatos}
                />
              ))}
            </div>
          </>
        )}
      </main>
    </RutaProtegida>
  );
}
