"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

export default function RegisterPage() {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const res = await fetch(`${API_URL}/api/clients/register`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ firstName, lastName, email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				toast.error(data.error || "Erro ao criar usuário");
			} else {
				toast.success("✅ Usuário criado com sucesso!");
				setFirstName("");
				setLastName("");
				setEmail("");
				setPassword("");
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
				<h2 className="text-2xl font-bold mb-6">Criar Conta</h2>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<input
							type="text"
							placeholder="Nome"
							className="w-full px-4 py-2 border rounded-lg"
							value={firstName}
							onChange={(e) => setFirstName(e.target.value)}
							required
						/>

						<input
							type="text"
							placeholder="Sobrenome"
							className="w-full px-4 py-2 border rounded-lg"
							value={lastName}
							onChange={(e) => setLastName(e.target.value)}
							required
						/>
					</div>

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
			</div>
		</div>
	);
}
