"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import RutaProtegida from "@/components/RutaProtegida";

function FormularioNoticia({ onCreado }) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [autor, setAutor] = useState("");
  const [archivo, setArchivo] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setMensaje(null);
    setCargando(true);

    try {
      let imagenUrl = "";

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagenUrl = resUpload.data.url;
      }

      await api.post("/noticias", { titulo, contenido, autor, imagenUrl });

      setMensaje("Noticia creada correctamente");
      setTitulo("");
      setContenido("");
      setAutor("");
      setArchivo(null);
      onCreado();
    } catch (err) {
      setMensaje(err.response?.data?.mensaje || "Error al crear la noticia");
    } finally {
      setCargando(false);
    }
  };

  return (
    <form
      onSubmit={manejarSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg"
    >
      <h2 className="text-xl font-bold mb-4">Nueva noticia</h2>

      {mensaje && <p className="text-teal-400 mb-4 text-sm">{mensaje}</p>}

      <label className="block text-sm text-slate-400 mb-1">Titulo</label>
      <input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <label className="block text-sm text-slate-400 mb-1">Contenido</label>
      <textarea
        value={contenido}
        onChange={(e) => setContenido(e.target.value)}
        rows={5}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        required
      />

      <label className="block text-sm text-slate-400 mb-1">Autor</label>
      <input
        value={autor}
        onChange={(e) => setAutor(e.target.value)}
        className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
      />

      <label className="block text-sm text-slate-400 mb-1">Imagen</label>
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
        {cargando ? "Guardando..." : "Publicar noticia"}
      </button>
    </form>
  );
}

function TarjetaNoticiaEditable({ noticia, onActualizado }) {
  const [editando, setEditando] = useState(false);
  const [titulo, setTitulo] = useState(noticia.titulo);
  const [contenido, setContenido] = useState(noticia.contenido);
  const [autor, setAutor] = useState(noticia.autor || "");
  const [archivo, setArchivo] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const guardarCambios = async () => {
    setGuardando(true);
    try {
      let imagenUrl = noticia.imagenUrl;

      if (archivo) {
        const formData = new FormData();
        formData.append("imagen", archivo);
        const resUpload = await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        imagenUrl = resUpload.data.url;
      }

      await api.patch(`/noticias/${noticia._id}`, {
        titulo,
        contenido,
        autor,
        imagenUrl,
      });

      setEditando(false);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al actualizar la noticia");
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async () => {
    if (!confirm(`¿Eliminar la noticia "${noticia.titulo}"?`)) return;
    try {
      await api.delete(`/noticias/${noticia._id}`);
      onActualizado();
    } catch (err) {
      alert(err.response?.data?.mensaje || "Error al eliminar la noticia");
    }
  };

  if (editando) {
    return (
      <div className="bg-slate-900 rounded-xl p-4 border border-teal-700">
        <label className="block text-sm text-slate-400 mb-1">Titulo</label>
        <input
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Contenido</label>
        <textarea
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          rows={4}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">Autor</label>
        <input
          value={autor}
          onChange={(e) => setAutor(e.target.value)}
          className="w-full mb-3 px-3 py-2 rounded bg-slate-800 border border-slate-700"
        />

        <label className="block text-sm text-slate-400 mb-1">
          Reemplazar imagen (opcional)
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
    <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex gap-4">
      {noticia.imagenUrl && (
        <img
          src={noticia.imagenUrl}
          alt={noticia.titulo}
          className="w-24 h-24 object-cover rounded-lg bg-slate-800 border border-slate-700"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold">{noticia.titulo}</p>
        <p className="text-sm text-slate-400 line-clamp-2">{noticia.contenido}</p>
        <p className="text-xs text-slate-500 mt-1">
          {noticia.autor && `Por ${noticia.autor} - `}
          {new Date(noticia.createdAt).toLocaleDateString("es-PE")}
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

export default function NoticiasAdminPage() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatos = () => {
    api
      .get("/noticias")
      .then((res) => setNoticias(res.data))
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  return (
    <RutaProtegida>
      <main className="min-h-screen bg-slate-950 text-white p-8">
        <h1 className="text-3xl font-bold mb-8">Noticias - Panel Admin</h1>

        <FormularioNoticia onCreado={cargarDatos} />

        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold mb-2">Noticias publicadas</h2>
          {cargando ? (
            <p>Cargando...</p>
          ) : (
            noticias.map((n) => (
              <TarjetaNoticiaEditable key={n._id} noticia={n} onActualizado={cargarDatos} />
            ))
          )}
        </div>
      </main>
    </RutaProtegida>
  );
}
