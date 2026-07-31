"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

const LIGAS = ["Copa Chanka", "Copa Capital"];

function FormularioEquipo({ ligaSeleccionada, onCreado }) {
  const [nombre, setNombre] = useState("");
  const [distrito, setDistrito] = useState("");
  const [capitan, setCapitan] = useState("");
  const [grupo, setGrupo] = useState("A");
  const [liga, setLiga] = useState(ligaSeleccionada);
  const [colorPrincipal, setColorPrincipal] = useState("#0F6E56");
  const [colorSecundario, setColorSecundario] = useState("#FFFFFF");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    setLiga(ligaSeleccionada);
  }, [ligaSeleccionada]);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    try {
      let escudoUrl = "";

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        escudoUrl = resUpload.data.url;
      }

      await api.post("/equipos", {
        nombre,
        distrito,
        capitan,
        grupo,
        liga,
        colorPrincipal,
        colorSecundario,
        escudoUrl,
      });

      setMensaje("Equipo creado correctamente");
      setNombre("");
      setDistrito("");
      setCapitan("");
      setArchivo(null);
      onCreado();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al crear el equipo");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nuevo equipo</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Liga</label>
      <select
        value={liga}
        onChange={(e) => setLiga(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      >
        {LIGAS.map((l) => (
          <option key={l} value={l}>
            {l}
          </option>
        ))}
      </select>

      <label className="block text-sm text-slate-400 mb-1">Nombre</label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <label className="block text-sm text-slate-400 mb-1">Distrito</label>
      <input
        value={distrito}
        onChange={(e) => setDistrito(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Capitan</label>
      <input
        value={capitan}
        onChange={(e) => setCapitan(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Grupo</label>
      <select
        value={grupo}
        onChange={(e) => setGrupo(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      >
        <option value="A">Grupo A</option>
        <option value="B">Grupo B</option>
      </select>

      <label className="block text-sm text-slate-400 mb-1">Color principal</label>
      <input
        type="color"
        value={colorPrincipal}
        onChange={(e) => setColorPrincipal(e.target.value)}
        className="w-full mb-3 h-10 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Color secundario</label>
      <input
        type="color"
        value={colorSecundario}
        onChange={(e) => setColorSecundario(e.target.value)}
        className="w-full mb-3 h-10 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Escudo</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setArchivo(e.target.files[0])}
        className="w-full mb-4 text-sm"
      />

      <button
        type="submit"
        disabled={cargando}
        className="w-full bg-teal-600 hover:bg-teal-500 transition rounded py-2 font-semibold disabled:opacity-50"
      >
        {cargando ? "Guardando..." : "Crear equipo"}
      </button>
    </form>
  );
}

function TarjetaEquipoEditable({ equipo, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(equipo.nombre);
  const [distrito, setDistrito] = useState(equipo.distrito || "");
  const [capitan, setCapitan] = useState(equipo.capitan || "");
  const [grupo, setGrupo] = useState(equipo.grupo || "A");
  const [liga, setLiga] = useState(equipo.liga || "Copa Chanka");
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      let escudoUrl = equipo.escudoUrl;

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        escudoUrl = resUpload.data.url;
      }

      await api.patch(`/equipos/${equipo._id}`, {
        nombre,
        distrito,
        capitan,
        grupo,
        liga,
        escudoUrl,
      });

      setEditando(false);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al actualizar el equipo");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm(`¿Eliminar el equipo "${equipo.nombre}"? Esto no elimina sus jugadores ni partidos asociados.`)) return;
    try {
      await api.delete(`/equipos/${equipo._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar el equipo");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 border border-teal-700">
        <label className="block text-sm text-slate-400 mb-1">Liga</label>
        <select
          value={liga}
          onChange={(e) => setLiga(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          {LIGAS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <label className="block text-sm text-slate-400 mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Distrito</label>
        <input
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Capitan</label>
        <input
          value={capitan}
          onChange={(e) => setCapitan(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Grupo</label>
        <select
          value={grupo}
          onChange={(e) => setGrupo(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="A">Grupo A</option>
          <option value="B">Grupo B</option>
        </select>

        <label className="block text-sm text-slate-400 mb-1">
          Reemplazar escudo (opcional)
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
            {guardando ? "Guardando..." : "Guardar cambios"}
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
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
      {equipo.escudoUrl ? (
        <img
          src={equipo.escudoUrl}
          alt={equipo.nombre}
          className="w-14 h-14 object-contain rounded-full bg-slate-800 border border-slate-700"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700" />
      )}

      <div className="flex-1">
        <h3 className="font-semibold">{equipo.nombre}</h3>
        <p className="text-xs text-slate-400">
          {equipo.distrito} - Capitan: {equipo.capitan || "-"}
        </p>
        <div className="flex gap-2 mt-1">
          {equipo.grupo && (
            <span className="inline-block text-xs bg-teal-900 text-teal-300 px-2 py-0.5 rounded">
              Grupo {equipo.grupo}
            </span>
          )}
          <span className="inline-block text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
            {equipo.liga || "Copa Chanka"}
          </span>
        </div>

        <div className="flex gap-2 mt-2">
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

export default function AdminPage() {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroLiga, setFiltroLiga] = useState("Copa Chanka");

  const cargarDatos = () => {
    api
      .get("/equipos")
      .then((res) => setEquipos(res.data))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const equiposFiltrados = equipos.filter((e) => (e.liga || "Copa Chanka") === filtroLiga);

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Panel Admin - Equipos</h1>
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

        <FormularioEquipo ligaSeleccionada={filtroLiga} onCreado={cargarDatos} />

        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold mb-2">
            Equipos de {filtroLiga} ({equiposFiltrados.length})
          </h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : (
            equiposFiltrados.map((eq) => (
              <TarjetaEquipoEditable key={eq._id} equipo={eq} onActualizado={cargarDatos} />
            ))
          )}
        </div>
      </main>
    </RutaProtegida>
  );
}
