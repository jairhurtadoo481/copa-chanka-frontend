"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { guardarSesion } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      guardarSesion(res.data);
      router.push("/admin");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al iniciar sesion");
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-8">
      <form
        onSubmit={manejarSubmit}
        className="bg-slate-900 border border-slate-800 rounded-xl p-8 w-full max-w-sm"
      >
        <h1 className="text-2xl font-bold mb-6">Panel Admin - Copa Chanka</h1>

        {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

        <label className="block text-sm text-slate-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-3 py-2 rounded bg-slate-800 border border-slate-700 outline-none focus:border-teal-500"
          required
        />

        <label className="block text-sm text-slate-400 mb-1">Contrasena</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-3 py-2 rounded bg-slate-800 border border-slate-700 outline-none focus:border-teal-500"
          required
        />

        <button
          type="submit"
          disabled={cargando}
          className="w-full bg-teal-600 hover:bg-teal-500 transition rounded py-2 font-semibold disabled:opacity-50"
        >
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
