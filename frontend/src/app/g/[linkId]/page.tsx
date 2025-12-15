"use client";

import React, { useEffect, useState, useRef } from "react";

interface GiftLinkResponse {
  linkId: string;
  status: "PENDING_VALIDATION" | "VALIDATED" | "RECORDED" | "REVOKED";
  audioUrl: string | null;
  recordedAt: string | null;
  createdAt: string;
  theme?: string;
}

const themes = [
  { id: "default", name: "Padrão", bg: "bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900" },
  { id: "natal", name: "Natal", bg: "bg-gradient-to-br from-green-700 via-red-700 to-red-900" },
  { id: "romantico", name: "Romântico", bg: "bg-gradient-to-br from-pink-500 via-rose-600 to-red-500" },
  { id: "aniversario", name: "Aniversário", bg: "bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500" },
];

export default function GiftPage({ params }: { params: { linkId: string } }) {
  const [status, setStatus] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const [selectedTheme, setSelectedTheme] = useState("default");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Carrega dados do GiftLink
  useEffect(() => {
    const loadLink = async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/gift-links/${params.linkId}`
        );
        const data: GiftLinkResponse = await res.json();

        setStatus(data.status);
        setAudioUrl(data.audioUrl);
        setRecordedAt(data.recordedAt);
        setSelectedTheme(data.theme || "default");
      } catch (err) {
        console.error(err);
        setError("Erro ao buscar informações do link.");
      }

      setLoading(false);
    };

    loadLink();
  }, [params.linkId]);

  // Salvar tema no backend
  const handleThemeChange = async (theme: string) => {
    setSelectedTheme(theme);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gift-links/${params.linkId}/theme`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme }),
        }
      );
    } catch (err) {
      console.error("Erro ao salvar tema:", err);
    }
  };

  // Iniciar gravação
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: "audio/webm" });
        await uploadRecording(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      console.error(err);
      setError("Erro ao acessar o microfone.");
    }
  };

  // Parar gravação
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  // Envia o áudio para o backend
  const uploadRecording = async (blob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("audio", blob);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/gift-links/${params.linkId}/record`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (data.success) {
        setAudioUrl(data.audioUrl);
        setStatus("RECORDED");
        setRecordedAt(new Date().toISOString());
      }
    } catch (err) {
      console.error("Erro ao enviar áudio:", err);
      setError("Erro ao enviar o áudio.");
    }
  };

  // ========================= RENDER ========================= //

  const themeObj = themes.find((t) => t.id === selectedTheme) || themes[0];

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-white text-xl ${themeObj.bg}`}
      >
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center text-red-200 text-xl ${themeObj.bg}`}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col items-center justify-center text-white p-4 ${themeObj.bg} transition-all`}
    >
      {/* Seletor de Tema */}
      <div className="flex gap-3 mb-6">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleThemeChange(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium border border-white/20 backdrop-blur-lg transition-all shadow-lg ${
              selectedTheme === t.id
                ? "bg-white/30 text-white"
                : "bg-white/10 text-purple-200 hover:bg-white/20"
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-white text-purple-900 rounded-xl shadow-xl p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Gravar Mensagem</h1>

        {status === "REVOKED" && (
          <p className="text-red-500 font-semibold">
            Este link foi revogado e não pode ser usado.
          </p>
        )}

        {status === "PENDING_VALIDATION" && (
          <p className="text-yellow-600 font-semibold">
            Este link ainda não foi ativado.
          </p>
        )}

        {status === "VALIDATED" && (
          <div className="space-y-4">
            {!recording ? (
              <button
                onClick={startRecording}
                className="w-full py-3 bg-purple-600 text-white rounded-lg"
              >
                🎙️ Iniciar Gravação
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="w-full py-3 bg-red-600 text-white rounded-lg"
              >
                ⏹️ Parar Gravação
              </button>
            )}
          </div>
        )}

        {status === "RECORDED" && audioUrl && (
          <div className="space-y-4">
            <p className="font-semibold">Sua mensagem foi gravada!</p>

            <audio
              ref={audioRef}
              controls
              src={`${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${audioUrl}`}
              className="w-full"
            ></audio>
          </div>
        )}
      </div>
    </div>
  );
}
