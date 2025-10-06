"use client";
import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, User, Shield, LogOut, Check, X, AlertCircle, Plus, QrCode, Download } from "lucide-react";
import QRCode from "qrcode";

interface GiftLink {
  linkId: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [qrPreview, setQrPreview] = useState<{ id: string; img: string } | null>(null);

  // ---------------- LOGIN ----------------
  async function login(email: string, password: string) {
    const res = await fetch("http://localhost:4000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error("Credenciais inválidas");
    const data = await res.json();
    setToken(data.token);
    setIsAuthenticated(true);
  }

  // ---------------- DASHBOARD ----------------
  function Dashboard() {
    const [links, setLinks] = useState<GiftLink[]>([]);
    const [loading, setLoading] = useState(true);

    async function load() {
      setLoading(true);
      const res = await fetch("http://localhost:4000/api/gift-links", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLinks(data);
      setLoading(false);
    }

    async function createLink() {
      await fetch("http://localhost:4000/api/gift-links", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
    }

    async function validateLink(id: string) {
      await fetch(`http://localhost:4000/api/gift-links/${id}/activate`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
    }

    async function revokeLink(id: string) {
      await fetch(`http://localhost:4000/api/gift-links/${id}/revoke`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      load();
    }

    async function showQRCode(id: string) {
      const linkUrl = `${window.location.origin}/g/${id}`;
      const img = await QRCode.toDataURL(linkUrl);
      setQrPreview({ id, img });
    }

    function downloadQR(id: string) {
      const canvas = document.createElement("canvas");
      const linkUrl = `${window.location.origin}/g/${id}`;

      QRCode.toCanvas(canvas, linkUrl, { width: 300 }, () => {
        const a = document.createElement("a");
        a.href = canvas.toDataURL("image/png");
        a.download = `giftcard-${id}.png`;
        a.click();
      });
    }

    useEffect(() => {
      load();
    }, []);

    if (loading) return <div>Carregando...</div>;

    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">Painel Admin</h1>
          <button
            onClick={createLink}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            <Plus className="w-4 h-4" /> Novo Link
          </button>
        </div>

        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">ID</th>
              <th className="p-2">Status</th>
              <th className="p-2">Criado em</th>
              <th className="p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.linkId} className="border-t hover:bg-gray-50">
                <td className="p-2">{l.linkId}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2">{new Date(l.createdAt).toLocaleDateString()}</td>
                <td className="p-2 flex flex-wrap gap-2">
                  {l.status === "PENDING_VALIDATION" && (
                    <button
                      onClick={() => validateLink(l.linkId)}
                      className="px-2 py-1 bg-green-500 text-white rounded flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" /> Validar
                    </button>
                  )}
                  {l.status !== "REVOKED" && (
                    <button
                      onClick={() => revokeLink(l.linkId)}
                      className="px-2 py-1 bg-red-500 text-white rounded flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Revogar
                    </button>
                  )}
                  <button
                    onClick={() => showQRCode(l.linkId)}
                    className="px-2 py-1 bg-purple-500 text-white rounded flex items-center gap-1"
                  >
                    <QrCode className="w-4 h-4" /> Ver QR
                  </button>
                  <button
                    onClick={() => downloadQR(l.linkId)}
                    className="px-2 py-1 bg-indigo-500 text-white rounded flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" /> Baixar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {qrPreview && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <h2 className="text-lg font-bold mb-4">QR Code para {qrPreview.id}</h2>
              <img src={qrPreview.img} alt="QR Code" className="mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Escaneie ou acesse:{" "}
                <span className="text-blue-600">
                  {window.location.origin}/g/{qrPreview.id}
                </span>
              </p>
              <button
                onClick={() => setQrPreview(null)}
                className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- LOGIN FORM ----------------
  function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      try {
        await login(email, password);
      } catch (err) {
        setError("Credenciais inválidas");
      }
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md w-96 space-y-4"
        >
          <h1 className="text-xl font-bold">Login Admin</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="border p-2 w-full rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha"
            className="border p-2 w-full rounded"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button className="w-full bg-blue-600 text-white py-2 rounded">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <LoginForm />;
}
