"use client";

import React from "react";
import { Gift, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white p-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-10 text-center w-full max-w-md animate-fade-in">
        <div className="flex flex-col items-center gap-3 mb-6">
          <Gift className="w-12 h-12 text-pink-300" />
          <h1 className="text-3xl font-bold tracking-tight">
            🎁 GiftCards com Áudio
          </h1>
        </div>

        <p className="text-purple-100 mb-6 leading-relaxed">
          Envie presentes com mensagens de voz únicas.  
          Personalize, grave e compartilhe momentos especiais com quem você ama.
        </p>

        <a
          href="https://giftcards-audio.vercel.app/admin"
          className="inline-flex items-center justify-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-xl py-3 px-6 transition-all duration-300 shadow-lg hover:scale-[1.03]"
        >
          <Shield className="w-5 h-5" />
          Acessar painel admin
        </a>
      </div>

      <footer className="mt-8 text-purple-200 text-sm">
        © {new Date().getFullYear()} GiftCards Audio — Todos os direitos reservados.
      </footer>
    </div>
  );
}
