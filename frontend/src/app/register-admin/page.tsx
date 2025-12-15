"use client";

import React, { useState } from "react";
import { LogIn, Key, Mail, User, Shield, Loader2 } from "lucide-react";

export default function RegisterAdmin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [masterKey, setMasterKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role, masterKey }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Erro ao criar usuário");
      } else {
        setMessage("✅ Usuário criado com sucesso!");
        setEmail("");
        setPassword("");
        setMasterKey("");
        setRole("user");
      }
    } catch (err) {
      console.error(err);
      setMessage("Erro de conexão com o servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      <div className="bg-slate-800/60 backdrop-blur-lg p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700">
        <div className="flex items-center justify-center mb-6">
          <Shield className="text-blue-400 mr-2" size={26} />
          <h1 className="text-2xl font-bold">Painel Administrativo</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full pl-10 pr-3 py-2 bg-slate-700 rounded-xl outline-none border border-slate-600 focus:border-blue-400 transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Key className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Senha"
              className="w-full pl-10 pr-3 py-2 bg-slate-700 rounded-xl outline-none border border-slate-600 focus:border-blue-400 transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <select
              className="w-full pl-10 pr-3 py-2 bg-slate-700 rounded-xl outline-none border border-slate-600 focus:border-blue-400 transition appearance-none"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="relative">
            <Shield className="absolute left-3 top-3 text-slate-400" size={18} />
            <input
              type="password"
              placeholder="Senha mestre"
              className="w-full pl-10 pr-3 py-2 bg-slate-700 rounded-xl outline-none border border-slate-600 focus:border-blue-400 transition"
              value={masterKey}
              onChange={(e) => setMasterKey(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 py-2 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
            Criar usuário
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 text-center font-medium ${
              message.startsWith("✅") ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
