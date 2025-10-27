"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Check,
  RefreshCcw,
  AlertTriangle,
} from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from 'react-toastify';
type MediaRecorderRef = MediaRecorder | null;
type AudioElementRef = HTMLAudioElement | null;
type TimerRef = number | null | ReturnType<typeof setInterval>;

interface GiftLinkData {
  status: "PENDING_VALIDATION" | "VALIDATED" | "RECORDED" | "REVOKED";
  audioUrl?: string | null;
}

export default function AudioRecorderPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [linkData, setLinkData] = useState<GiftLinkData | null>(null);
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorderRef>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<TimerRef>(null);
  const audioRef = useRef<AudioElementRef>(null);


  useEffect(() => {
    async function fetchLink() {
      try {
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/gift-links/${linkId}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("🔢 Status HTTP:", res.status, "🧾 Dados:", data);

        if (res.ok) {
          setLinkData(data);
          if (data.status === "RECORDED" && data.audioUrl) {
            setHasRecording(true);
          const r2Url = `https://pub-6523bdac96844be89e288477677478f8.r2.dev/${data.audioUrl}`;


            setAudioURL(r2Url);
          }
        } else {
          setLinkData({ status: "REVOKED" });
        }
      } catch (err) {
        console.error("❌ Erro ao carregar link:", err);
        setLinkData({ status: "REVOKED" });
      }
    }
    fetchLink();
  }, [linkId]);

  useEffect(() => {
    if (audioRef.current && audioURL) audioRef.current.load();
  }, [audioURL]);


  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    } catch (error) {
      console.error("Erro ao acessar microfone:", error);
       toast.error("Microfone não disponível. Verifique as permissões", {
          position: "top-center",
          className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
        });
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const reRecord = () => {
    setAudioURL(null);
    setRecordingTime(0);
    setHasRecording(false);
    setIsRecording(false);
    setIsPaused(false);
  };

  const submitRecording = async () => {
    if (!audioURL) return;
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", audioBlob, "mensagem.webm");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/gift-links/${linkId}/record`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("🎉 Gravação enviada com sucesso!", {
          position: "top-center",
          className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
        });
        setHasRecording(true);
        setLinkData({ ...linkData!, status: "RECORDED", audioUrl: data.audioUrl });
      } else {
        toast.error(`Erro: ${data.error}`,{
          position: "top-center",
          className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
        });
      }
    } catch (err) {
      console.error("Erro ao enviar áudio:", err);
      toast.error("Erro ao enviar áudio", {
        position: "top-center",
        className: "bg-purple-500 text-white font-medium rounded-lg shadow-lg",
      });
    }
  };


  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => console.error("Erro ao reproduzir:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const total = audioRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;


  if (!linkData)
    return <div className="flex h-screen items-center justify-center text-white">Carregando...</div>;

  if (linkData.status === "REVOKED" || linkData.status === "PENDING_VALIDATION") {
    return (
      <div className="flex flex-col h-screen items-center justify-center text-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 text-white p-8">
        <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Link inválido</h1>
        <p className="text-purple-200 max-w-sm">
          {linkData.status === "REVOKED"
            ? "Este link foi revogado pela loja."
            : "Este link ainda não foi ativado."}
        </p>
      </div>
    );
  }


  if (hasRecording && audioURL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 text-center w-full max-w-md">
          <h1 className="text-2xl font-light text-white mb-4">🎧 Ouça sua mensagem</h1>

          <audio
            ref={audioRef}
            src={audioURL}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <button
            onClick={togglePlayPause}
            className="p-4 rounded-full bg-purple-500/80 hover:bg-purple-600 transition-all shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
          </button>


          <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
            <div
              className="h-2 bg-purple-400 transition-all duration-200"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = audioURL;
              a.download = "mensagem-presente.webm";
              a.click();
            }}
            className="mt-6 w-full bg-green-500/80 hover:bg-green-500 text-white rounded-xl py-3 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" /> Baixar áudio
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex flex-col items-center justify-center text-white p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 p-8 shadow-xl text-center w-full max-w-md">
        <h1 className="text-2xl font-light mb-4">🎙️ Grave sua mensagem</h1>


        {!audioURL ? (
          <div className="flex flex-col items-center justify-center gap-4">
            {!isRecording && (
              <button
                onClick={startRecording}
                className="p-4 rounded-full bg-green-500/80 hover:bg-green-600 transition-all shadow-lg"
              >
                <Mic className="w-6 h-6 text-white" />
              </button>
            )}

            {isRecording && !isPaused && (
              <button
                onClick={pauseRecording}
                className="p-4 rounded-full bg-yellow-500/80 hover:bg-yellow-600 transition-all shadow-lg"
              >
                <Pause className="w-6 h-6 text-white" />
              </button>
            )}

            {isPaused && (
              <button
                onClick={resumeRecording}
                className="p-4 rounded-full bg-blue-500/80 hover:bg-blue-600 transition-all shadow-lg"
              >
                <Play className="w-6 h-6 text-white" />
              </button>
            )}

            {isRecording && (
              <button
                onClick={stopRecording}
                className="p-4 rounded-full bg-red-500/80 hover:bg-red-600 transition-all shadow-lg"
              >
                <Square className="w-6 h-6 text-white" />
              </button>
            )}

            <p className="text-sm mt-2">{formatTime(recordingTime)}</p>
          </div>
        ) : (
          <>
            <audio
              ref={audioRef}
              src={audioURL}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full bg-purple-500/80 hover:bg-purple-600 transition-all shadow-lg"
            >
              {isPlaying ? <Pause className="w-6 h-6 text-white" /> : <Play className="w-6 h-6 text-white" />}
            </button>

            <div className="w-full h-2 bg-white/20 rounded-full mt-4 overflow-hidden">
              <div
                className="h-2 bg-purple-400 transition-all duration-200"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <div className="flex flex-col gap-3 mt-6">
              <button
                onClick={submitRecording}
                className="w-full bg-green-500/80 hover:bg-green-500 text-white rounded-xl py-3 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" /> Enviar gravação
              </button>

              <button
                onClick={reRecord}
                className="w-full bg-red-500/80 hover:bg-red-500 text-white rounded-xl py-3 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCcw className="w-5 h-5" /> Regravar
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
