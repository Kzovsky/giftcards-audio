"use client";

import React, { useState } from "react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [role, setRole] = useState("user");
	const [masterKey, setMasterKey] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-100 to-slate-200">
			<div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
				<h2 className="text-2xl font-bold mb-6">Criar Conta</h2>

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

					<select
						value={role}
						onChange={(e) => setRole(e.target.value)}
						className="w-full px-4 py-2 border rounded-lg"
					>
						<option value="user">Usuário</option>
						<option value="admin">Administrador</option>
					</select>

					<input
						type="password"
						placeholder="Chave mestre (apenas para admins)"
						className="w-full px-4 py-2 border rounded-lg"
						value={masterKey}
						onChange={(e) => setMasterKey(e.target.value)}
					/>

					<div className="flex items-center justify-between">
						<a href="/login" className="text-sm text-purple-600 hover:underline">
							Já tem conta?
						</a>
						<button
							type="submit"
							disabled={loading}
							className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
						>
							{loading ? "Carregando..." : "Criar"}
						</button>
					</div>
				</form>

				{message && <div className="mt-4 text-center">{message}</div>}
			</div>
		</div>
	);
}
