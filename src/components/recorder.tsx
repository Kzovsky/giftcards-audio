"use client";
import { useEffect, useRef, useState } from "react";

export default function Recorder({
  maxSeconds = 60,
  onConfirm,
}: {
  maxSeconds?: number;
  onConfirm: (blob: Blob, duration: number) => void;
}) {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let timer: any;
    if (recording) {
      timer = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= maxSeconds) stop();
          return s + 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [recording]);

  async function start() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    setChunks([]);
    setSeconds(0);
    mr.ondataavailable = (e) => e.data.size && setChunks((c) => [...c, e.data]);
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      setPreviewUrl(URL.createObjectURL(blob));
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  }

  function stop() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  function confirm() {
    const blob = new Blob(chunks, { type: "audio/webm" });
    onConfirm(blob, seconds);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Botão de gravação/parada */}
      {!recording ? (
        <button
          className="px-6 py-3 rounded-xl bg-purple-600/80 hover:bg-purple-500 transition text-white shadow-lg cursor-pointer"
          onClick={start}
        >
          🎙️ Gravar
        </button>
      ) : (
        <button
          className="px-6 py-3 rounded-xl bg-red-600/80 hover:bg-red-500 transition text-white shadow-lg cursor-pointer"
          onClick={stop}
        >
          ⏹️ Parar
        </button>
      )}

      {/* Timer */}
      <div className="text-purple-200 font-medium">
        ⏱️ {seconds}s / {maxSeconds}s
      </div>

      {/* Preview centralizado */}
      {previewUrl && (
        <div className="flex flex-col items-center gap-3 w-full">
          <audio controls src={previewUrl} className="w-3/4" />
          <button
            className="px-6 py-3 rounded-xl bg-green-600/80 hover:bg-green-500 transition text-white shadow-lg cursor-pointer"
            onClick={confirm}
          >
            ✅ Confirmar Envio
          </button>
        </div>
      )}
    </div>
  );
}
