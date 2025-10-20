"use client";
import { createPortal } from "react-dom";
import React, { useEffect, useState, useMemo } from "react";
import QRCode from "qrcode";
import { toast } from 'react-toastify';
import {
  Eye, EyeOff, Lock, Shield, LogOut, Check, X, AlertCircle, QrCode, Download, Plus, Filter, Trash2, CheckSquare, Square, Loader2, LogIn,
} from "lucide-react";

interface GiftLink {
  _id: string;
  linkId: string;
  status: "PENDING_VALIDATION" | "VALIDATED" | "RECORDED" | "REVOKED";
  createdAt: string;
  recordedAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}


export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [links, setLinks] = useState<GiftLink[]>([]);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterVisible, setFilterVisible] = useState(false);
 
  const [qrPreview, setQrPreview] = useState<{ id: string; img: string } | null>(null); 
  

  const [filters, setFilters] = useState({
    id: "",
    status: "",
    startDate: "",
    endDate: "",
  });

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [authError, setAuthError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
const [confirmData, setConfirmData] = useState<{
  open: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void;
}>({ open: false });
const showConfirm = (title: string, message: string, onConfirm: () => void) => {
  setConfirmData({
    open: true,
    title,
    message,
    onConfirm,
  });
};


  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      console.log("🔐 Token encontrado, buscando links...");
      setToken(savedToken);
      fetchLinks(savedToken); 
    } else {
      console.log("⚠️ Nenhum token encontrado.");
    }
  }, []);


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoadingLogin(true);

    const url = `${API_URL}/api/auth/login`;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Erro ao parsear resposta de login:", text);
        throw new Error("Resposta não é JSON válido");
      }

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        fetchLinks(data.token);
      } else {
        setAuthError(data.error || "Credenciais inválidas");
      }
    } catch (err) {
      console.error("❌ Erro ao autenticar:", err);
      setAuthError("Erro ao autenticar. Verifique o console.");
    } finally {
      setLoadingLogin(false);
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setLinks([]);
    setSelected([]);
    setAuthError("Você foi desconectado.");
  };


  const fetchLinks = async (tokenParam?: string) => {
    const authToken = tokenParam || token;

    if (!authToken) {
      setLinks([]);
      return;
    }

    try {
      setLoadingLinks(true);
      const url = `${API_URL}/api/gift-links`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const text = await res.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error("Resposta de gift-links não é JSON válido");
      }

      if (!res.ok) {
        if (res.status === 401) {
          setAuthError("Sessão expirada. Faça login novamente.");
          localStorage.removeItem("token");
          setToken(null);
          return;
        }
        throw new Error(data.error || "Erro ao carregar links");
      }

      if (Array.isArray(data)) {
        setLinks(data);
      } else {
        setLinks([]);
      }
    } catch (err) {
      console.error("❌ Erro ao buscar links:", err);
      setAuthError("Erro ao buscar links. Veja o console.");
    } finally {
      setLoadingLinks(false);
    }
  };


  const generateLink = async () => {
if (!token) {
  toast.error("Token não disponível. Faça login novamente.", {
    position: "top-left",
    className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
  });
  return;
}
    try {
      setLoadingLinks(true);
      const url = `${API_URL}/api/gift-links`;
      console.log("🌐 Tentando gerar novo link em:", url);

      const res = await fetch(url, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({}), 
      });
      
      const text = await res.text();
      
      if (res.ok) {
  toast.success("✅ Link gerado com sucesso!", {
    position: "top-left",
    className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
  });
  await fetchLinks(token);
} else {
          let errorData = { message: res.statusText };
          try {
             errorData = text ? JSON.parse(text) : errorData;
          } catch (e) {
             console.error("Resposta de erro não JSON:", text);
          }
          toast.error(`Erro ao gerar link: ${errorData.message || res.statusText}`, {
    position: "top-left",
    className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
  });
}

} catch (error) {
    console.error("❌ Erro de rede ao criar link:", error);
    toast.error("Erro de rede ao criar link.", {
      position: "top-left",
      className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
    });
  } finally {
    setLoadingLinks(false);
  }
};


  const validateLink = async (id: string) => {
  if (!token) return;
  try {
    setLoadingLinks(true);
    const url = `${API_URL}/api/gift-links/${id}/activate`;

    const res = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      await fetchLinks(token);
      toast.success("✅ Link validado com sucesso!", {
        position: "top-left",
        className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
      });
    } else {
      const errorData = await res.json();
      toast.error(`Erro ao validar link: ${errorData.message || res.statusText}`, {
        position: "top-left",
        className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
      });
    }
  } catch (error) {
    console.error("❌ Erro ao validar link:", error);
    toast.error("Erro inesperado ao validar link.", {
      position: "top-left",
      className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
    });
  } finally {
    setLoadingLinks(false);
  }
};


const revokeLink = (id: string) => {
  if (!token) return;
  showConfirm(
    "Revogar Link",
    `Tem certeza que deseja REVOGAR o link ${id}?`,
    async () => {
      setConfirmData({ open: false });
      try {
        setLoadingLinks(true);
        const url = `${API_URL}/api/gift-links/${id}/revoke`;

        const res = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          await fetchLinks(token);
          toast.info("🔒 Link revogado com sucesso!", {
            position: "top-left",
            className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
          });
        } else {
          const errorData = await res.json();
          toast.error(`Erro ao revogar link: ${errorData.message || res.statusText}`, {
            position: "top-left",
            className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
          });
        }
      } catch (error) {
        console.error("❌ Erro ao revogar link:", error);
        toast.error("Erro inesperado ao revogar link.", {
          position: "top-left",
          className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
        });
      } finally {
        setLoadingLinks(false);
      }
    }
  );
};

  
 
  const showQRCode = async (id: string) => {
    const linkUrl = `${window.location.origin}/g/${id}`;
    try {
      const img = await QRCode.toDataURL(linkUrl, { errorCorrectionLevel: 'H', type: 'image/png' });
      setQrPreview({ id, img });
    } catch (error) {
  console.error("❌ Erro ao gerar QR Code:", error);
  toast.error("Não foi possível gerar o QR Code. Verifique o console.", {
    position: "top-left",
    className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
  });
    }
  };

  const downloadQR = async (id: string) => {
    const linkUrl = `${window.location.origin}/g/${id}`;
    try {
      const imgDataUrl = await QRCode.toDataURL(linkUrl, { errorCorrectionLevel: 'H', type: 'image/png' });
      const a = document.createElement("a");
      a.href = imgDataUrl;
      a.download = `giftcard-${id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("✅ QR Code baixado com sucesso!", {
        position: "top-left",
        className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
      });
      console.log(`✅ QR Code para ${id} baixado.`);
    } catch (error) {
  console.error("❌ Erro ao criar QR Code para download:", error);
  toast.error("Erro ao gerar a imagem para download.", {
    position: "top-left",
    className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
  });
    }
  };


const deleteSelected = async () => {
  if (!token) return;
  if (selected.length === 0) {
    toast.warn("Selecione links para excluir.", {
      position: "top-left",
      className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
    });
    return;
  }

  showConfirm(
    "Excluir Links",
    `Excluir ${selected.length} link(s) selecionado(s)? Esta ação é irreversível.`,
    async () => {
      setConfirmData({ open: false });
      try {
        setLoadingLinks(true);
        const res = await fetch(`${API_URL}/api/gift-links/delete`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: selected }),
        });

        if (res.ok) {
          toast.success("🗑️ Links excluídos com sucesso!", {
            position: "top-left",
            className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
          });
          await fetchLinks(token);
          setSelected([]); 
        } else {
          const text = await res.text();
          let errorData = { message: res.statusText };
          try {
            errorData = text ? JSON.parse(text) : errorData;
          } catch {}
          toast.error(`Erro ao excluir links: ${errorData.message || res.statusText}`, {
            position: "top-left",
            className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
          });
        }
      } catch (err) {
        console.error(" Erro ao excluir links:", err);
        toast.error("Erro de rede ao excluir links.", {
          position: "top-left",
          className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
        });
      } finally {
        setLoadingLinks(false);
      }
    }
  );
};



  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  const filteredLinks = useMemo(() => {
    return links.filter(link => {
 
        if (filters.status && link.status !== filters.status) return false;

        if (filters.id && !link.linkId.toLowerCase().includes(filters.id.toLowerCase())) return false;
        
        return true;
    });
  }, [links, filters]);



  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white p-4 sm:p-8">
        <form
          onSubmit={handleLogin}
          className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20 shadow-2xl w-full max-w-md text-center"
        >
          <h1 className="text-2xl font-light mb-6 flex items-center justify-center gap-2">
            <Lock className="w-6 h-6"/> Login de Administrador
          </h1>
          {authError && <p className="text-red-400 text-sm mb-4 bg-red-900/50 p-2 rounded-lg border border-red-500/50 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4"/> {authError}
          </p>}

          <input
            type="email"
            value={loginData.email}
            onChange={(e) =>
              setLoginData({ ...loginData, email: e.target.value })
            }
            placeholder="Email"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 mb-4 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
            required
          />

          <div className="relative mb-6">
            <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={loginData.password}
                onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
                }
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors"
                required
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                aria-label={showPassword ? "Ocultar Senha" : "Mostrar Senha"}
            >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loadingLogin}
            className="w-full bg-purple-500/80 hover:bg-purple-600 rounded-xl py-3 flex justify-center items-center gap-2 transition-all shadow-lg font-semibold disabled:bg-gray-500/40 disabled:cursor-not-allowed"
          >
            {loadingLogin ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Entrando...
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


  return (
    
    <div className="min-h-screen bg-gradient-to-br from-purple-700 via-purple-800 to-purple-900 text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-light flex items-center gap-3">
            <Shield className="w-7 h-7 text-purple-300"/> Painel de Links
          </h1>
          <div className="flex gap-3 flex-wrap justify-end">

            <button
                onClick={generateLink}
                disabled={loadingLinks}
                className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all bg-green-500/80 hover:bg-green-600 font-semibold text-sm disabled:bg-gray-500/40 disabled:cursor-not-allowed cursor-pointer"
            >
                <Plus className="w-4 h-4" /> Novo Link
            </button>

            <button
              onClick={() => setFilterVisible(!filterVisible)}
              className="flex items-center gap-2 bg-purple-500/80 hover:bg-purple-600 px-4 py-2 rounded-xl shadow-lg transition-all font-semibold text-sm cursor-pointer"
            >
              <Filter className="w-4 h-4" />
              Filtros
            </button>

            <button
              onClick={deleteSelected}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all font-semibold text-sm ${
                selected.length > 0
                  ? "bg-red-500/80 hover:bg-red-600"
                  : "bg-gray-500/40 cursor-not-allowed"
              }`}
            >
              <Trash2 className="w-4 h-4" /> Excluir ({selected.length})
            </button>

             <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg transition-all bg-gray-600/80 hover:bg-gray-700 font-semibold text-sm cursor-pointer"
            >
                <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
        

        {filterVisible && (
            <div className="bg-white/10 p-4 mb-6 rounded-xl border border-white/20">
                <h3 className="text-lg font-semibold mb-3">Opções de Filtro</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Filtrar por ID"
                        value={filters.id}
                        onChange={(e) => setFilters({...filters, id: e.target.value})}
                        className="bg-purple-700/80 border border-white/50 rounded-lg p-2 text-white placeholder-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                        className="bg-purple-700/80 border border-white/50 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                        <option value="">Todos os Status</option>
                        <option value="PENDING_VALIDATION">Pendente</option>
                        <option value="VALIDATED">Validado</option>
                        <option value="RECORDED">Gravado</option>
                        <option value="REVOKED">Revogado</option>
                    </select>
                </div>
                {/* <div className="flex justify-end mt-4">
                    <button
                        onClick={() => fetchLinks(token)}
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-sm font-semibold"
                    >
                        Aplicar Filtros
                    </button>
                </div> */}
            </div>
        )}



{qrPreview &&
  createPortal(
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) setQrPreview(null);
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl text-center w-[400px] max-w-[90%] p-6 animate-[fadeIn_0.2s_ease-out]">
        <h2 className="text-lg font-bold mb-3 text-gray-800">
          QR Code para: {qrPreview.id.substring(0, 8)}...
        </h2>

        <img
          src={qrPreview.img}
          alt={`QR Code para ${qrPreview.id}`}
          className="mx-auto mb-4 border border-gray-200 p-2 rounded w-48 h-48 object-contain"
        />

        <p className="text-gray-600 mb-4 text-xs break-all">
          Link:{" "}
          <a
            target="blank"
            href={`${window.location.origin}/g/${qrPreview.id}`}
            className="text-blue-600 font-medium"
          >
            {window.location.origin}/g/{qrPreview.id}
          </a>
        </p>

        <button
          onClick={() => setQrPreview(null)}
          className="mt-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold cursor-pointer"
        >
          Fechar
        </button>
      </div>
    </div>,
    document.body
  )}

        {loadingLinks ? (
          <div className="flex items-center justify-center py-20 text-purple-200">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            Carregando links...
          </div>
        ) : filteredLinks.length === 0 ? (
          <p className="text-center text-purple-200 py-12">
            Nenhum link encontrado. Clique em "Novo Link" para começar ou ajuste os filtros.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-white/20 text-white/90 uppercase text-center">
                  <th className="p-3">Sel.</th>
                  <th className="p-3">ID</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Criado em</th>
                  <th className="p-3 hidden sm:table-cell">Gravado em</th>
                  <th className="p-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredLinks.map((link) => (
                  <tr
                    key={link._id}
                    className="border-b border-white/10 hover:bg-white/10 transition-all"
                  >
                    <td className="p-3 text-center w-12">
                      <button onClick={() => toggleSelect(link._id)} aria-label={`Selecionar link ${link.linkId}`}>
                        {selected.includes(link._id) ? (
                          <CheckSquare className="w-5 h-5 text-green-400" />
                        ) : (
                          <Square className="w-5 h-5 text-white/50" />
                        )}
                      </button>
                    </td>
                    <td className="p-3 text-white/90 font-mono text-xs max-w-xs truncate">{link.linkId}</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          link.status === "RECORDED"
                            ? "bg-green-500/40 text-green-200"
                            : link.status === "VALIDATED"
                            ? "bg-blue-500/40 text-blue-200"
                            : link.status === "PENDING_VALIDATION"
                            ? "bg-yellow-500/40 text-yellow-200"
                            : "bg-red-500/40 text-red-200"
                        }`}
                      >
                        {link.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="p-3 text-white/70 whitespace-nowrap">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-white/70 hidden sm:table-cell whitespace-nowrap">
                      {link.recordedAt
                        ? new Date(link.recordedAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">

                        {link.status === "PENDING_VALIDATION" && (
                            <button
                                onClick={() => validateLink(link.linkId)}
                                className="px-3 py-1 bg-green-500/80 hover:bg-green-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                title="Validar Link"
                            >
                                <Check className="w-4 h-4" /> Validar
                            </button>
                        )}

                        {link.status !== "REVOKED" && (
                            <button
                                onClick={() => revokeLink(link.linkId)}
                                className="px-3 py-1 bg-red-500/80 hover:bg-red-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                title="Revogar Link"
                            >
                                <X className="w-4 h-4" /> Revogar
                            </button>
                        )}
                        <button
                            onClick={() => showQRCode(link.linkId)}
                            className="px-3 py-1 bg-purple-500/80 hover:bg-purple-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Ver QR Code"
                        >
                            <QrCode className="w-4 h-4" /> Ver QR
                        </button>
                        <button
                            onClick={() => downloadQR(link.linkId)}
                            className="px-3 py-1 bg-indigo-500/80 hover:bg-indigo-600 text-white rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                            title="Baixar QR Code"
                        >
                            <Download className="w-4 h-4" /> Baixar
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ConfirmDialog
  open={confirmData.open}
  title={confirmData.title || ""}
  message={confirmData.message || ""}
  onConfirm={confirmData.onConfirm || (() => setConfirmData({ open: false }))}
  onCancel={() => setConfirmData({ open: false })}
/>

    </div>
  );
}
