"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import FondoRotativo from "@/components/FondoRotativo";

function TarjetaNoticia({ noticia }) {
  const fecha = new Date(noticia.createdAt).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-slate-900/70 backdrop-blur-sm rounded-xl border border-slate-800 overflow-hidden">
      {noticia.imagenUrl && (
        <img
          src={noticia.imagenUrl}
          alt={noticia.titulo}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        <h2 className="text-xl font-bold mb-2">{noticia.titulo}</h2>
        <p className="text-slate-400 text-sm mb-3 whitespace-pre-line">
          {noticia.contenido}
        </p>
        <p className="text-xs text-slate-500">
          {noticia.autor && `Por ${noticia.autor} - `}
          {fecha}
        </p>
      </div>
    </div>
  );
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api
      .get("/noticias")
      .then((res) => setNoticias(res.data))
      .finally(() => setCargando(false));
  }, []);

  return (
    <main className="min-h-screen text-white p-8 relative">
      <FondoRotativo imagenes={["/fondo.png", "/fondotabla3.png"]} />

      <h1 className="text-3xl font-bold mb-8">Noticias Copa Chanka</h1>

      {cargando ? (
        <p className="text-slate-400">Cargando noticias...</p>
      ) : noticias.length === 0 ? (
        <p className="text-slate-500">Aun no hay noticias publicadas.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {noticias.map((n) => (
            <TarjetaNoticia key={n._id} noticia={n} />
          ))}
        </div>
      )}
    </main>
  );
}
