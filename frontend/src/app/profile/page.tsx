"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_URL}/api/clients/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Faça login para atualizar o perfil");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/clients/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ firstName, lastName, phone }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Perfil atualizado com sucesso");
      } else {
        toast.error(data.error || "Erro ao atualizar perfil");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Configurações do Perfil</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Nome" className="px-4 py-2 border rounded-lg" required />
            <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Sobrenome" className="px-4 py-2 border rounded-lg" required />
          </div>

          <input value={email} disabled placeholder="E-mail" className="w-full px-4 py-2 border rounded-lg bg-gray-100" />

          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" className="w-full px-4 py-2 border rounded-lg" />

          <div className="flex justify-end">
            <button type="submit" disabled={saving} className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
