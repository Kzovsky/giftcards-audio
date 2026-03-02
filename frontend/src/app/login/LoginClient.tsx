"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginClient() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const router = useRouter();
    const search = useSearchParams();
    const from = search?.get("from") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${API_URL}/api/clients/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Erro ao fazer login");
            } else {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    toast.success("✅ Logado com sucesso");
                    try { window.dispatchEvent(new Event('authChanged')); } catch (e) {}
                    router.push(from);
                } else {
                    toast.success("Login bem-sucedido");
                    try { window.dispatchEvent(new Event('authChanged')); } catch (e) {}
                    router.push(from);
                }
            }
        } catch (err) {
            console.error(err);
            toast.error("Erro de conexão com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6">Entrar</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="E-mail"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Senha"
                        className="w-full px-4 py-2 border rounded-lg"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="flex items-center justify-between">
                        <a href="/register" className="text-sm text-purple-600 hover:underline">
                            Criar conta
                        </a>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                        >
                            {loading ? "Carregando..." : "Entrar"}
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
}
