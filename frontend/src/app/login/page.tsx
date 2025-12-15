"use client";

import React, { useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setMessage(null);

		try {
			const res = await fetch(`${API_URL}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				setMessage(data.error || "Erro ao fazer login");
			} else {
				if (data.token) {
					localStorage.setItem("token", data.token);
					setMessage("✅ Logado com sucesso");
				} else {
					setMessage("Login bem-sucedido");
				}
			}
		} catch (err) {
			console.error(err);
			setMessage("Erro de conexão com o servidor");
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

				{message && <div className="mt-4 text-center">{message}</div>}
			</div>
		</div>
	);
}
