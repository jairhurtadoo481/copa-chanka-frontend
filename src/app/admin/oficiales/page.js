"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";
import AdminNav from "@/components/AdminNav";

function FormularioOficial({ onCreado }) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("Arbitro");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

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

      await api.post("/oficiales", { nombre, tipo, cargo, telefono, fotoUrl });

      setMensaje("Oficial creado correctamente");
      setNombre("");
      setCargo("");
      setTelefono("");
      setArchivo(null);
      onCreado();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al crear el oficial");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nuevo organizador/arbitro</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Nombre</label>
      <input
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <label className="block text-sm text-slate-400 mb-1">Tipo</label>
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      >
        <option value="Arbitro">Arbitro</option>
        <option value="Organizador">Organizador</option>
      </select>

      <label className="block text-sm text-slate-400 mb-1">Cargo</label>
      <input
        value={cargo}
        onChange={(e) => setCargo(e.target.value)}
        placeholder='Ej: "Arbitro principal" o "Presidente de la liga"'
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Telefono</label>
      <input
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Foto</label>
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
        {cargando ? "Guardando..." : "Crear"}
      </button>
    </form>
  );
}

function TarjetaOficialEditable({ oficial, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState(oficial.nombre);
  const [tipo, setTipo] = useState(oficial.tipo);
  const [cargo, setCargo] = useState(oficial.cargo || "");
  const [telefono, setTelefono] = useState(oficial.telefono || "");
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      let fotoUrl = oficial.fotoUrl;

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        fotoUrl = resUpload.data.url;
      }

      await api.patch(`/oficiales/${oficial._id}`, {
        nombre,
        tipo,
        cargo,
        telefono,
        fotoUrl,
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
    if (!confirm(`¿Eliminar a "${oficial.nombre}"?`)) return;
    try {
      await api.delete(`/oficiales/${oficial._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 border border-teal-700">
        <label className="block text-sm text-slate-400 mb-1">Nombre</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />
        <label className="block text-sm text-slate-400 mb-1">Tipo</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        >
          <option value="Arbitro">Arbitro</option>
          <option value="Organizador">Organizador</option>
        </select>
        <label className="block text-sm text-slate-400 mb-1">Cargo</label>
        <input
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />
        <label className="block text-sm text-slate-400 mb-1">Telefono</label>
        <input
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />
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
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center gap-4">
      {oficial.fotoUrl ? (
        <img
          src={oficial.fotoUrl}
          alt={oficial.nombre}
          className="w-14 h-14 object-cover rounded-full bg-slate-800 border border-slate-700"
        />
      ) : (
        <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700" />
      )}
      <div className="flex-1">
        <h3 className="font-semibold">{oficial.nombre}</h3>
        <p className="text-xs text-slate-400">
          {oficial.tipo} - {oficial.cargo || "Sin cargo especificado"}
        </p>
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

export default function OficialesAdminPage() {
  const [oficiales, setOficiales] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    api
      .get("/oficiales")
      .then((res) => setOficiales(res.data))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-6">Organizadores y Arbitros - Panel Admin</h1>
        <AdminNav />

        <FormularioOficial onCreado={cargarDatos} />

        <div className="mt-8 space-y-3">
          <h2 className="text-xl font-bold mb-2">Registrados</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : (
            oficiales.map((o) => (
              <TarjetaOficialEditable key={o._id} oficial={o} onActualizado={cargarDatos} />
            ))
          )}
        </div>
      </main>
    </RutaProtegida>
  );
}
