"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Download, Check } from 'lucide-react';


type MediaRecorderRef = MediaRecorder | null;

type AudioElementRef = HTMLAudioElement | null;

type TimerRef = number | null | ReturnType<typeof setInterval>;

export default function AudioRecorderPage() {
  const [hasRecording, setHasRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioURL, setAudioURL] = useState<string | null>(null); 
 
  const mediaRecorderRef = useRef<MediaRecorderRef>(null);
  const audioChunksRef = useRef<BlobPart[]>([]); 
  const timerRef = useRef<TimerRef>(null);
  const audioRef = useRef<AudioElementRef>(null);

  useEffect(() => {
  
    const savedAudio: string | null = null; 
    if (savedAudio) {
      setHasRecording(true);
      setAudioURL(savedAudio);
    }
  }, []);

  const startRecording = async () => {
    try {
  
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
 
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];


      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setIsPaused(false);
      

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000) as unknown as number; 

    } catch (error) {
      console.error('Erro ao acessar microfone:', error);
      alert('Não foi possível acessar o microfone');
    }
  };

  const pauseRecording = () => {

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }
  };

  const resumeRecording = () => {

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000) as unknown as number; 
    }
  };

  const stopRecording = () => {

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    }
  };

  const submitRecording = () => {

    setHasRecording(true);
    setRecordingTime(0);
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
  
        audioRef.current.play().catch(error => {
          console.error("Erro ao tentar reproduzir:", error);

        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const downloadAudio = () => {
    if (audioURL) {
      const a = document.createElement('a');
      a.href = audioURL;
      a.download = 'gravacao.wav';
      a.click();
    }
  };

  const formatTime = (seconds: number) => { 
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8">
          <h1 className="text-2xl font-light text-white text-center mb-2">
            Mensagem de Áudio
          </h1>
          <p className="text-purple-200 text-center text-sm mb-8">
            {hasRecording 
              ? 'Sua gravação está pronta para ouvir' 
              : 'Grave sua mensagem de áudio'}
          </p>

          {!hasRecording ? (
            <div className="space-y-6">
              {!isRecording && !audioURL && (
                <button
                  onClick={startRecording}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur text-white rounded-2xl py-6 px-6 transition-all duration-300 flex items-center justify-center gap-3 border border-white/30 shadow-lg"
                >
                  <Mic className="w-6 h-6" />
                  <span className="text-lg font-light">Iniciar Gravação</span>
                </button>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-2xl p-6 text-center border border-white/20">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm font-light">Gravando</span>
                    </div>
                    <div className="text-3xl font-light text-white">
                      {formatTime(recordingTime)}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!isPaused ? (
                      <button
                        onClick={pauseRecording}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30"
                      >
                        <Pause className="w-5 h-5" />
                        <span>Pausar</span>
                      </button>
                    ) : (
                      <button
                        onClick={resumeRecording}
                        className="flex-1 bg-white/20 hover:bg-white/30 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30"
                      >
                        <Play className="w-5 h-5" />
                        <span>Continuar</span>
                      </button>
                    )}
                    
                    <button
                      onClick={stopRecording}
                      className="flex-1 bg-red-500/80 hover:bg-red-500 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-2 border border-red-400/30"
                    >
                      <Square className="w-5 h-5" />
                      <span>Parar</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Se o audioURL estiver definido e não estiver gravando */}
              {audioURL && !isRecording && (
                <div className="space-y-4">
                  <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                    <p className="text-white text-center mb-4 font-light">
                      Prévia da gravação
                    </p>
                    {/* Correção de tipagem na tag <audio> */}
                    <audio
                      ref={audioRef}
                      src={audioURL} // audioURL é do tipo string | null, mas TS precisa saber que não é null aqui.
                      onEnded={() => setIsPlaying(false)}
                      className="hidden"
                    />
                    <button
                      onClick={togglePlayPause}
                      className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-3 transition-all duration-300 flex items-center justify-center gap-2 border border-white/30"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-5 h-5" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5" />
                          <span>Reproduzir</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setAudioURL(null);
                        setRecordingTime(0);
                      }}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-xl py-4 transition-all duration-300 border border-white/20"
                    >
                      Regravar
                    </button>
                    <button
                      onClick={submitRecording}
                      className="flex-1 bg-purple-500/80 hover:bg-purple-500 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-2 border border-purple-400/30 shadow-lg"
                    >
                      <Check className="w-5 h-5" />
                      <span>Enviar</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/10 rounded-2xl p-6 border border-white/20">
                {/* Correção de tipagem na tag <audio> */}
                <audio
                  ref={audioRef}
                  src={audioURL || ''} // Usar || '' para garantir que o src seja uma string, resolvendo o último erro.
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <button
                  onClick={togglePlayPause}
                  className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-3 border border-white/30"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-6 h-6" />
                      <span className="text-lg">Pausar Áudio</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-6 h-6" />
                      <span className="text-lg">Reproduzir Áudio</span>
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={downloadAudio}
                className="w-full bg-purple-500/80 hover:bg-purple-500 text-white rounded-xl py-4 transition-all duration-300 flex items-center justify-center gap-3 border border-purple-400/30 shadow-lg"
              >
                <Download className="w-5 h-5" />
                <span>Baixar Gravação</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-purple-200 text-center text-xs mt-6 opacity-70">
          Esta mensagem só pode ser gravada uma vez
        </p>
      </div>
    </div>
  );
}