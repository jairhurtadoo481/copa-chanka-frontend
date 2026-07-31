"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

const LIGAS = ["Copa Chanka", "Copa Capital"];

function FormularioJugador({ equipos, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [posicion, setPosicion] = useState("Arquero");
  const [edad, setEdad] = useState("");
  const [dorsal, setDorsal] = useState("");
  const [equipo, setEquipo] = useState(equipos[0]?._id || "");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setEquipo(equipos[0]?._id || "");
  }, [equipos]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    try {
      let fotoUrl = "";

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fotoUrl = resUpload.data.url;
      }

      await api.post("/jugadores", {
        nombre,
        posicion,
        edad: edad ? Number(edad) : undefined,
        dorsal: dorsal ? Number(dorsal) : undefined,
        equipo,
        fotoUrl,
      });

      setMensaje("Jugador creado correctamente");
      setNombre("");
      setEdad("");
      setDorsal("");
      setArchivo(null);
      onCreado();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al crear el jugador");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nuevo jugador</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Nombre</label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <label className="block text-sm text-slate-400 mb-1">Equipo</label>
      <select
        value={equipo}
        onChange={(e) => setEquipo(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      >
        {equipos.map((eq) => (
          <option key={eq._id} value={eq._id}>
            {eq.nombre}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-400 mb-1">Posicion</label>
      <select
        value={posicion}
        onChange={(e) => setPosicion(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      >
        <option value="Arquero">Arquero</option>
        <option value="Cierre">Cierre</option>
        <option value="Ala">Ala</option>
        <option value="Pivot">Pivot</option>
      </select>

      <div className="flex gap-3 mb-3">
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Edad</label>
          <input
            type="number"
            value={edad}
            onChange={(e) => setEdad(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm text-slate-400 mb-1">Dorsal</label>
          <input
            type="number"
            value={dorsal}
            onChange={(e) => setDorsal(e.target.value)}
            className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
        </div>
      </div>

      <label className="block text-sm text-slate-400 mb-1">Foto</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setArchivo(e.target.files[0])}
        className="w-full mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={cargando || equipos.length === 0}
        className="w-full bg-teal-600 hover:bg-teal-500 transition rounded py-2 font-semibold disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Crear jugador"}
      </button>
    </form>
  );
}

function TarjetaJugadorEditable({ jugador, equipos, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(jugador.nombre);
  const [posicion, setPosicion] = useState(jugador.posicion);
  const [edad, setEdad] = useState(jugador.edad || "");
  const [dorsal, setDorsal] = useState(jugador.dorsal || "");
  const [equipo, setEquipo] = useState(jugador.equipo?._id || "");
  const [estado, setEstado] = useState(jugador.estado);
  const [representante, setRepresentante] = useState(jugador.representante || "");
  const [representanteActivo, setRepresentanteActivo] = useState(
    jugador.representanteActivo || false
  );
  const [valorMercado, setValorMercado] = useState(jugador.valorMercado || "");
  const [valorMercadoActivo, setValorMercadoActivo] = useState(
    jugador.valorMercadoActivo || false
  );
  const [caracteristicas, setCaracteristicas] = useState(jugador.caracteristicas || "");
  const [trayectoria, setTrayectoria] = useState(
    jugador.trayectoria && jugador.trayectoria.length > 0
      ? jugador.trayectoria.map((t) => ({ club: t.club, torneo: t.torneo || "" }))
      : []
  );
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const agregarFilaTrayectoria = () => {
    setTrayectoria([...trayectoria, { club: "", torneo: "" }]);
  };

  const actualizarFilaTrayectoria = (index, campo, valor) => {
    const copia = [...trayectoria];
    copia[index][campo] = valor;
    setTrayectoria(copia);
  };

  const eliminarFilaTrayectoria = (index) => {
    setTrayectoria(trayectoria.filter((_, i) => i !== index));
  };

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      let fotoUrl = jugador.fotoUrl;

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fotoUrl = resUpload.data.url;
      }

      const trayectoriaLimpia = trayectoria.filter((t) => t.club.trim() !== "");

      await api.patch(`/jugadores/${jugador._id}`, {
        nombre,
        posicion,
        edad: edad ? Number(edad) : undefined,
        dorsal: dorsal ? Number(dorsal) : undefined,
        equipo,
        estado,
        fotoUrl,
        representante,
        representanteActivo,
        valorMercado: valorMercado ? Number(valorMercado) : undefined,
        valorMercadoActivo,
        caracteristicas,
        trayectoria: trayectoriaLimpia,
      });

      setEditando(false);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al actualizar el jugador");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm(`¿Eliminar al jugador "${jugador.nombre}"?`)) return;
    try {
      await api.delete(`/jugadores/${jugador._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar el jugador");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 border border-teal-700 col-span-full sm:col-span-1">
        <label className="block text-sm text-slate-400 mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Equipo</label>
        <select
          value={equipo}
          onChange={(e) => setEquipo(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          {equipos.map((eq) => (
            <option key={eq._id} value={eq._id}>
              {eq.nombre}
            </option>
          ))}
        </select>

        <label className="block text-sm text-slate-400 mb-1">Posicion</label>
        <select
          value={posicion}
          onChange={(e) => setPosicion(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="Arquero">Arquero</option>
          <option value="Cierre">Cierre</option>
          <option value="Ala">Ala</option>
          <option value="Pivot">Pivot</option>
        </select>

        <label className="block text-sm text-slate-400 mb-1">Estado</label>
        <select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="Activo">Activo</option>
          <option value="Lesionado">Lesionado</option>
          <option value="Suspendido">Suspendido</option>
        </select>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Edad</label>
            <input
              type="number"
              value={edad}
              onChange={(e) => setEdad(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-slate-400 mb-1">Dorsal</label>
            <input
              type="number"
              value={dorsal}
              onChange={(e) => setDorsal(e.target.value)}
              className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700"
            />
          </div>
        </div>

        <div className="border-t border-slate-800 pt-3 mb-3">
          <label className="block text-sm text-slate-400 mb-1">Representante</label>
          <input
            value={representante}
            onChange={(e) => setRepresentante(e.target.value)}
            placeholder="Nombre del representante"
            className="w-full mb-2 px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={representanteActivo}
              onChange={(e) => setRepresentanteActivo(e.target.checked)}
            />
            Representante activo
          </label>
        </div>

        <div className="border-t border-slate-800 pt-3 mb-3">
          <label className="block text-sm text-slate-400 mb-1">Valor de mercado (S/)</label>
          <input
            type="number"
            value={valorMercado}
            onChange={(e) => setValorMercado(e.target.value)}
            placeholder="Ej: 5000"
            className="w-full mb-2 px-3 py-2 rounded bg-slate-800 border border-slate-700"
          />
          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={valorMercadoActivo}
              onChange={(e) => setValorMercadoActivo(e.target.checked)}
            />
            Valor activo (vigente)
          </label>
        </div>

        <div className="border-t border-slate-800 pt-3 mb-3">
          <label className="block text-sm text-slate-400 mb-1">
            Caracteristicas de juego
          </label>
          <textarea
            value={caracteristicas}
            onChange={(e) => setCaracteristicas(e.target.value)}
            rows={3}
            placeholder="Ej: Buen juego de cierre/defensa, marca personal"
            className="w-full mb-2 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
          />
        </div>

        <div className="border-t border-slate-800 pt-3 mb-3">
          <label className="block text-sm text-slate-400 mb-2">
            Trayectoria (clubes anteriores)
          </label>
          {trayectoria.map((fila, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                value={fila.club}
                onChange={(e) => actualizarFilaTrayectoria(index, "club", e.target.value)}
                placeholder="Club"
                className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
              />
              <input
                value={fila.torneo}
                onChange={(e) => actualizarFilaTrayectoria(index, "torneo", e.target.value)}
                placeholder="Torneo"
                className="flex-1 px-3 py-2 rounded bg-slate-800 border border-slate-700 text-sm"
              />
              <button
                type="button"
                onClick={() => eliminarFilaTrayectoria(index)}
                className="text-red-400 border border-red-900 rounded px-2 hover:bg-red-950"
              >
                x
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={agregarFilaTrayectoria}
            className="text-xs border border-slate-700 rounded px-3 py-1 hover:border-teal-500 hover:text-teal-400 mt-1"
          >
            + Agregar club anterior
          </button>
        </div>

        <label className="block text-sm text-slate-400 mb-1">
          Reemplazar foto (opcional)
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setArchivo(e.target.files[0])}
          className="w-full mb-4 text-sm"
        />

        <div className="flex gap-2">
          <button
            onClick={guardarCambios}
            disabled={guardando}
            className="bg-teal-600 hover:bg-teal-500 transition rounded px-4 py-2 text-sm disabled:opacity-50"
          >
            {guardando ? "Guardando..." : "Guardar"}
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

  return (
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-3">
      {jugador.fotoUrl ? (
        <img
          src={jugador.fotoUrl}
          alt={jugador.nombre}
          className="w-12 h-12 object-cover rounded-full bg-slate-800 border border-slate-700"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700" />
      )}
      <div className="flex-1">
        <p className="font-semibold">{jugador.nombre}</p>
        <p className="text-xs text-slate-400">
          {jugador.posicion} - #{jugador.dorsal || "-"} - {jugador.equipo?.nombre}
        </p>
        <div className="flex gap-2 mt-1">
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
    </div>
  );
}

export default function JugadoresAdminPage() {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroLiga, setFiltroLiga] = useState("Copa Chanka");

  const cargarDatos = () => {
    Promise.all([api.get("/equipos"), api.get("/jugadores")])
      .then(([resEquipos, resJugadores]) => {
        setEquipos(resEquipos.data);
        setJugadores(resJugadores.data);
      })
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposDeLaLiga = equipos.filter((e) => (e.liga || "Copa Chanka") === filtroLiga);
  const jugadoresDeLaLiga = jugadores.filter(
    (j) => (j.equipo?.liga || "Copa Chanka") === filtroLiga
  );

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Jugadores - Panel Admin</h1>
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
        ) : equiposDeLaLiga.length === 0 ? (
          <p className="text-red-400">
            Primero necesitas crear al menos un equipo en {filtroLiga} antes de agregar jugadores.
          </p>
        ) : (
          <>
            <FormularioJugador equipos={equiposDeLaLiga} onCreado={cargarDatos} />

            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">
                Jugadores de {filtroLiga} ({jugadoresDeLaLiga.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {jugadoresDeLaLiga.map((j) => (
                  <TarjetaJugadorEditable
                    key={j._id}
                    jugador={j}
                    equipos={equiposDeLaLiga}
                    onActualizado={cargarDatos}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </RutaProtegida>
  );
}
