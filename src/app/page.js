"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { useLiga } from "@/context/LigaContext";

const fondos = [
  "/fondo.png",
  "/fondo2.png",
  "/fondo3.png",
  "/fondo4.png",
  "/fondo5.png",
  "/fondo6.png",
];

function HeroRotativo() {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setIndice((prev) => (prev + 1) % fondos.length);
    }, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="relative h-[420px] sm:h-[480px] overflow-hidden">
      {fondos.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${src})`,
            opacity: i === indice ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />

      <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
        <span className="text-teal-400 text-sm sm:text-base font-semibold tracking-widest uppercase mb-2 animate-fade-in">
          Segunda Edicion
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white drop-shadow-lg mb-3">
          COPA CHANKA 2026
        </h1>
        <p className="text-slate-300 max-w-xl text-sm sm:text-base">
          Liga Superior de Futbol de Salon - Apurimac, Andahuaylas
        </p>

        <div className="flex gap-3 mt-6">
          <Link
            href="/tabla"
            className="bg-teal-600 hover:bg-teal-500 transition rounded-full px-6 py-2 text-sm font-semibold"
          >
            Ver tabla de posiciones
          </Link>
          <Link
            href="/partidos"
            className="border border-slate-600 hover:border-teal-500 hover:text-teal-400 transition rounded-full px-6 py-2 text-sm font-semibold"
          >
            Calendario
          </Link>
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {fondos.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndice(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === indice ? "bg-teal-400 w-6" : "bg-slate-600"
            }`}
            aria-label={`Fondo ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function TarjetaEquipo({ equipo, index }) {
  const acento = equipo.colorPrincipal || "#0F6E56";

  return (
    <Link
      href={`/equipos/${equipo._id}`}
      className="group relative bg-gradient-to-br from-slate-900 to-slate-900/60 rounded-xl p-4 border border-slate-800 flex items-center gap-4 opacity-0 animate-rise hover:-translate-y-1 hover:shadow-lg transition-all duration-300 overflow-hidden"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-1 group-hover:w-1.5 transition-all"
        style={{ backgroundColor: acento }}
      />

      {equipo.escudoUrl ? (
        <img
          src={equipo.escudoUrl}
          alt={equipo.nombre}
          className="w-14 h-14 object-contain rounded-full bg-slate-800 border-2 ml-1"
          style={{ borderColor: acento }}
        />
      ) : (
        <div
          className="w-14 h-14 rounded-full bg-slate-800 border-2 ml-1 flex items-center justify-center text-slate-600 text-[9px] text-center"
          style={{ borderColor: acento }}
        >
          Sin escudo
        </div>
      )}

      <div>
        <h2 className="font-semibold group-hover:text-white transition-colors">
          {equipo.nombre}
        </h2>
        <p className="text-slate-400 text-xs">{equipo.distrito}</p>
      </div>
    </Link>
  );
}

function SeccionGrupo({ titulo, equipos, colorTexto, colorFondo }) {
  if (equipos.length === 0) return null;

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <span
          className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${colorFondo} ${colorTexto}`}
        >
          {titulo}
        </span>
        <div className="flex-1 h-px bg-slate-800" />
        <span className="text-xs text-slate-500">{equipos.length} equipos</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {equipos.map((equipo, i) => (
          <TarjetaEquipo key={equipo._id} equipo={equipo} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { liga } = useLiga();
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setCargando(true);
    api
      .get("/equipos")
      .then((res) => {
        const filtrados = res.data.filter((e) => (e.liga || "Copa Chanka") === liga);
        setEquipos(filtrados);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, [liga]);

  const grupoA = equipos.filter((e) => e.grupo === "A");
  const grupoB = equipos.filter((e) => e.grupo === "B");
  const sinGrupo = equipos.filter((e) => !e.grupo);

  return (
    <main className="bg-slate-950 text-white">
      <HeroRotativo />

      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-bold mb-6">Equipos participantes - {liga}</h2>

        {cargando && <p className="text-slate-400">Cargando equipos...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}

        {!cargando && equipos.length === 0 && (
          <p className="text-slate-500">Aun no hay equipos registrados en {liga}.</p>
        )}

        <SeccionGrupo
          titulo="Grupo A"
          equipos={grupoA}
          colorTexto="text-amber-300"
          colorFondo="bg-amber-900/40"
        />
        <SeccionGrupo
          titulo="Grupo B"
          equipos={grupoB}
          colorTexto="text-rose-300"
          colorFondo="bg-rose-900/40"
        />
        <SeccionGrupo
          titulo="Sin grupo asignado"
          equipos={sinGrupo}
          colorTexto="text-slate-300"
          colorFondo="bg-slate-800"
        />
      </div>
    </main>
  );
}
