"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

const LIGAS = ["Copa Chanka", "Copa Capital"];

function fechaParaInput(fechaIso) {
  if (!fechaIso) return "";
  const d = new Date(fechaIso);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

function FormularioPartido({ equipos, arbitrosDisponibles, onCreado }) {
  const [equipoLocal, setEquipoLocal] = useState(equipos[0]?._id || "");
  const [equipoVisitante, setEquipoVisitante] = useState(equipos[1]?._id || "");
  const [fecha, setFecha] = useState("");
  const [jornada, setJornada] = useState("");
  const [sede, setSede] = useState("");
  const [arbitro1, setArbitro1] = useState("");
  const [arbitro2, setArbitro2] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setEquipoLocal(equipos[0]?._id || "");
    setEquipoVisitante(equipos[1]?._id || "");
  }, [equipos]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);

    if (equipoLocal === equipoVisitante) {
      setMensaje("El equipo local y visitante no pueden ser el mismo");
      return;
    }

    setCargando(true);
    try {
      const arbitros = [arbitro1, arbitro2].filter(Boolean);
      await api.post("/partidos", {
        equipoLocal,
        equipoVisitante,
        fecha,
        jornada: jornada ? Number(jornada) : undefined,
        sede,
        arbitros,
      });
      setMensaje("Partido creado correctamente");
      setFecha("");
      setJornada("");
      setSede("");
      setArbitro1("");
      setArbitro2("");
      onCreado();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al crear el partido");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nuevo partido</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Equipo local</label>
      <select
        value={equipoLocal}
        onChange={(e) => setEquipoLocal(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      >
        {equipos.map((eq) => (
          <option key={eq._id} value={eq._id}>
            {eq.nombre}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-400 mb-1">Equipo visitante</label>
      <select
        value={equipoVisitante}
        onChange={(e) => setEquipoVisitante(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      >
        {equipos.map((eq) => (
          <option key={eq._id} value={eq._id}>
            {eq.nombre}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-400 mb-1">Fecha y hora</label>
      <input
        type="datetime-local"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Jornada</label>
          <input
            type="number"
            value={jornada}
            onChange={(e) => setJornada(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Sede</label>
          <input
            value={sede}
            onChange={(e) => setSede(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Arbitro principal</label>
          <select
            value={arbitro1}
            onChange={(e) => setArbitro1(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          >
            <option value="">Sin asignar</option>
            {arbitrosDisponibles.map((a) => (
              <option key={a._id} value={a._id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Arbitro asistente</label>
          <select
            value={arbitro2}
            onChange={(e) => setArbitro2(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          >
            <option value="">Sin asignar</option>
            {arbitrosDisponibles.map((a) => (
              <option key={a._id} value={a._id}>
                {a.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-teal-600 hover:bg-teal-500 transition rounded py-2 font-semibold disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Crear partido"}
      </button>
    </form>
  );
}

function TarjetaPartido({ partido, equipos, arbitrosDisponibles, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [equipoLocal, setEquipoLocal] = useState(partido.equipoLocal?._id || "");
  const [equipoVisitante, setEquipoVisitante] = useState(partido.equipoVisitante?._id || "");
  const [fecha, setFecha] = useState(fechaParaInput(partido.fecha));
  const [jornada, setJornada] = useState(partido.jornada || "");
  const [sede, setSede] = useState(partido.sede || "");
  const [estado, setEstado] = useState(partido.estado);
  const [arbitro1, setArbitro1] = useState(partido.arbitros?.[0]?._id || "");
  const [arbitro2, setArbitro2] = useState(partido.arbitros?.[1]?._id || "");
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const guardarEdicion = async () => {
    setGuardandoEdicion(true);
    try {
      const arbitros = [arbitro1, arbitro2].filter(Boolean);
      await api.patch(`/partidos/${partido._id}`, {
        equipoLocal,
        equipoVisitante,
        fecha,
        jornada: jornada ? Number(jornada) : undefined,
        sede,
        estado,
        arbitros,
      });
      setEditando(false);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al actualizar el partido");
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const eliminar = async () => {
    if (
      !confirm(
        `¿Eliminar el partido "${partido.equipoLocal?.nombre} vs ${partido.equipoVisitante?.nombre}"?`
      )
    )
      return;
    try {
      await api.delete(`/partidos/${partido._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar el partido");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 border border-teal-700">
        <label className="block text-sm text-slate-400 mb-1">Equipo local</label>
        <select
          value={equipoLocal}
          onChange={(e) => setEquipoLocal(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          {equipos.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.nombre}
            </option>
          ))}
        </select>

        <label className="block text-sm text-slate-400 mb-1">Equipo visitante</label>
        <select
          value={equipoVisitante}
          onChange={(e) => setEquipoVisitante(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          {equipos.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.nombre}
            </option>
          ))}
        </select>

        <label className="block text-sm text-slate-400 mb-1">Fecha y hora</label>
        <input
          type="datetime-local"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Jornada</label>
            <input
              type="number"
              value={jornada}
              onChange={(e) => setJornada(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Sede</label>
            <input
              value={sede}
              onChange={(e) => setSede(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            />
          </div>
        </div>

        <label className="block text-sm text-slate-400 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="Programado">Programado</option>
          <option value="EnVivo">En vivo</option>
          <option value="Jugado">Jugado</option>
          <option value="Suspendido">Suspendido</option>
        </select>

        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Arbitro principal</label>
            <select
              value={arbitro1}
              onChange={(e) => setArbitro1(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            >
              <option value="">Sin asignar</option>
              {arbitrosDisponibles.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Arbitro asistente</label>
            <select
              value={arbitro2}
              onChange={(e) => setArbitro2(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            >
              <option value="">Sin asignar</option>
              {arbitrosDisponibles.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={guardarEdicion}
            disabled={guardandoEdicion}
            className="bg-teal-600 hover:bg-teal-500 transition rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {guardandoEdicion ? "Guardando..." : "Guardar cambios"}
          </button>
          <button
            onClick={() => setEditando(false)}
            className="border border-slate-700 rounded px-4 py-2 text-sm text-slate-400 hover:text-white"
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  const nombresArbitros = (partido.arbitros || []).map((a) => a.nombre).join(" / ");
  const colorEstado =
    partido.estado === "EnVivo"
      ? "text-teal-400"
      : partido.estado === "Jugado"
      ? "text-slate-400"
      : partido.estado === "Suspendido"
      ? "text-red-400"
      : "text-slate-500";

  return (
    <div
      className={`bg-slate-900 rounded-xl p-4 border ${
        partido.estado === "EnVivo" ? "border-teal-600" : "border-slate-800"
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-semibold">
            {partido.equipoLocal?.nombre} vs {partido.equipoVisitante?.nombre}
          </p>
          <p className="text-xs text-slate-400">
            Jornada {partido.jornada || "-"} - {partido.sede || "Sin sede"} -{" "}
            <span className={colorEstado}>{partido.estado}</span>
          </p>
          <p className="text-xs text-teal-400 mt-0.5">
            Arbitros: {nombresArbitros || "Sin asignar"}
          </p>
        </div>

        <div className="text-xl font-bold text-teal-400">
          {partido.golesLocal} - {partido.golesVisitante}
        </div>
      </div>

      <div className="flex gap-2 mt-3 flex-wrap">
        <Link
          href={`/admin/partidos/${partido._id}`}
          className="text-xs bg-teal-700 hover:bg-teal-600 transition rounded px-3 py-1 font-semibold"
        >
          Gestionar en vivo
        </Link>
        <button
          onClick={() => setEditando(true)}
          className="text-xs border border-slate-700 rounded px-3 py-1 hover:border-teal-500 hover:text-teal-400"
        >
          Editar partido
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

export default function PartidosAdminPage() {
  const [equipos, setEquipos] = useState([]);
  const [partidos, setPartidos] = useState([]);
  const [arbitrosDisponibles, setArbitrosDisponibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroLiga, setFiltroLiga] = useState("Copa Chanka");

  const cargarDatos = () => {
    Promise.all([api.get("/equipos"), api.get("/partidos"), api.get("/oficiales")])
      .then(([resEquipos, resPartidos, resOficiales]) => {
        setEquipos(resEquipos.data);
        setPartidos(resPartidos.data);
        setArbitrosDisponibles(resOficiales.data.filter((o) => o.tipo === "Arbitro"));
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposDeLaLiga = equipos.filter((e) => (e.liga || "Copa Chanka") === filtroLiga);
  const partidosDeLaLiga = partidos.filter(
    (p) => (p.equipoLocal?.liga || "Copa Chanka") === filtroLiga
  );

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Partidos - Panel Admin</h1>
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
        ) : equiposDeLaLiga.length < 2 ? (
          <p className="text-red-400">
            Necesitas al menos 2 equipos creados en {filtroLiga} para armar un partido.
          </p>
        ) : (
          <>
            <FormularioPartido
              equipos={equiposDeLaLiga}
              arbitrosDisponibles={arbitrosDisponibles}
              onCreado={cargarDatos}
            />

            <div className="mt-8 space-y-3">
              <h2 className="text-xl font-bold mb-2">
                Partidos de {filtroLiga} ({partidosDeLaLiga.length})
              </h2>
              {partidosDeLaLiga.map((p) => (
                <TarjetaPartido
                  key={p._id}
                  partido={p}
                  equipos={equiposDeLaLiga}
                  arbitrosDisponibles={arbitrosDisponibles}
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
