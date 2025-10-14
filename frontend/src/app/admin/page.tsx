"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Filter,
  Trash2,
  CheckSquare,
  Square,
  Loader2,
  LogIn,
} from "lucide-react";

interface GiftLink {
  _id: string;
  linkId: string;
  status: "PENDING_VALIDATION" | "VALIDATED" | "RECORDED" | "REVOKED";
  createdAt: string;
  recordedAt?: string;
}

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [links, setLinks] = useState<GiftLink[]>([]);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    id: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);

  // 🔹 Verifica token salvo
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      console.log("🔐 Token encontrado no localStorage, buscando links...");
      setToken(savedToken);
      fetchLinks(savedToken);
    } else {
      console.log("⚠️ Nenhum token encontrado no localStorage.");
    }
  }, []);

  // 🔹 Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoadingLogin(true);

    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`;
    console.log("🔗 Tentando login em:", url);

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      console.log("📡 Status da resposta login:", res.status);

      const text = await res.text();
      console.log("📄 Texto bruto da resposta:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Resposta não é JSON válido");
      }

      if (res.ok && data.token) {
        console.log("✅ Login bem-sucedido!");
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchLinks(data.token);
      } else {
        console.warn("🚫 Erro no login:", data);
        setAuthError(data.error || "Credenciais inválidas");
      }
    } catch (err) {
      console.error("❌ Erro ao autenticar:", err);
      setAuthError("Erro ao autenticar. Verifique o console.");
    } finally {
      setLoadingLogin(false);
    }
  };

  // 🔹 Busca links
  const fetchLinks = async (tokenParam?: string) => {
    const authToken = tokenParam || token;
    console.log("🔍 Buscando links com token:", authToken);

    if (!authToken) {
      console.warn("⚠️ Nenhum token encontrado. Usuário precisa logar novamente.");
      setLinks([]);
      setAuthError("Sessão expirada. Faça login novamente.");
      setToken(null);
      localStorage.removeItem("token");
      return;
    }

    try {
      setLoadingLinks(true);
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/gift-links`;
      console.log("🌐 Requisição para:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      console.log("📡 Status da resposta:", res.status);

      const text = await res.text();
      console.log("📦 Resposta bruta da API:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Resposta de gift-links não é JSON válido");
      }

      if (!res.ok) {
        if (res.status === 401) {
          console.warn("🚫 Token inválido ou expirado.");
          setAuthError("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
        throw new Error(data.error || "Erro ao carregar links");
      }

      if (Array.isArray(data)) {
        console.log(`✅ ${data.length} links recebidos.`);
        setLinks(data);
      } else {
        console.warn("⚠️ API não retornou um array:", data);
        setLinks([]);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar links:", err);
      setAuthError("Erro ao buscar links. Veja o console.");
    } finally {
      setLoadingLinks(false);
    }
  };

  // 🔹 Exclusão
  const deleteSelected = async () => {
    if (!token) return;
    if (selected.length === 0) return alert("Selecione links para excluir.");

    if (!confirm(`Excluir ${selected.length} link(s)?`)) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gift-links/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selected }),
      });

      if (res.ok) {
        alert("Links excluídos com sucesso!");
        setSelected([]);
        fetchLinks(token);
      } else {
        alert("Erro ao excluir links.");
      }
    } catch (err) {
      console.error("Erro ao excluir links:", err);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🔹 Tela de login (quando não há token)
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white">
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-light mb-4">🔐 Login de Administrador</h1>
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}

          <input
            type="email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            placeholder="Email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-4 text-white placeholder-white/50 focus:outline-none"
          />

          <input
            type="password"
            placeholder="Senha"
            value={loginData.password}
            onChange={(e) =>
              setLoginData({ ...loginData, password: e.target.value })
            }
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 mb-4 text-white placeholder-white/50 focus:outline-none"
          />

          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-purple-500/80 hover:bg-purple-600 rounded-xl py-3 flex justify-center items-center gap-2 transition-all cursor-pointer "
          >
            {loadingLogin ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin disabled:cursor-not-allowed disabled:opacity-50" /> Entrando...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" /> Entrar
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // 🔹 Painel admin
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white p-8">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light">🎁 Painel de Links</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center gap-2 bg-purple-500/80 hover:bg-purple-600 px-4 py-2 rounded-xl shadow-lg transition-all"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>
            <button
              onClick={deleteSelected}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all ${
                selected.length > 0
                  ? "bg-red-500/80 hover:bg-red-600"
                  : "bg-gray-500/40 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-4 h-4" /> Excluir
            </button>
          </div>
        </div>

        {loadingLinks ? (
          <div className="flex items-center justify-center py-20 text-purple-200">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Carregando links...
          </div>
        ) : links.length === 0 ? (
          <p className="text-center text-purple-200 py-12">
            Nenhum link encontrado.
          </p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/20 text-white/70">
                <th className="p-3 text-left">Selecionar</th>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Criado em</th>
                <th className="p-3 text-left">Gravado em</th>
                <th className="p-3 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr
                  key={link._id}
                  className="border-b border-white/10 hover:bg-white/10 transition-all"
                >
                  <td className="p-3 text-center">
                    <button onClick={() => toggleSelect(link._id)}>
                      {selected.includes(link._id) ? (
                        <CheckSquare className="w-5 h-5 text-green-400" />
                      ) : (
                        <Square className="w-5 h-5 text-white/50" />
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-white/90">{link.linkId}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        link.status === "RECORDED"
                          ? "bg-green-500/40 text-green-200"
                          : link.status === "VALIDATED"
                          ? "bg-blue-500/40 text-blue-200"
                          : link.status === "PENDING_VALIDATION"
                          ? "bg-yellow-500/40 text-yellow-200"
                          : "bg-red-500/40 text-red-200"
                      }`}
                    >
                      {link.status}
                    </span>
                  </td>
                  <td className="p-3 text-white/70">
                    {new Date(link.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-white/70">
                    {link.recordedAt
                      ? new Date(link.recordedAt).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
