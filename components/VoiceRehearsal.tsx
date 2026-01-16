
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';

const VoiceRehearsal: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: string, text: string}[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: "Você é um professor de stand-up. Ouça as piadas do usuário, analise o timing e sugira onde pausar para o riso. Seja encorajador mas crítico.",
          inputAudioTranscription: {},
          outputAudioTranscription: {}
        },
        callbacks: {
          onopen: () => {
            console.log('Live session opened');
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const base64 = btoa(String.fromCharCode(...new Uint8Array(int16.buffer)));
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { data: base64, mimeType: 'audio/pcm;rate=16000' } });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: (msg: any) => {
            if (msg.serverContent?.inputTranscription) {
              setTranscriptions(prev => [...prev, { role: 'Você', text: msg.serverContent.inputTranscription.text }]);
            }
            if (msg.serverContent?.outputTranscription) {
               setTranscriptions(prev => [...prev, { role: 'Mentor', text: msg.serverContent.outputTranscription.text }]);
            }
          },
          onerror: (e) => console.error('Live error', e),
          onclose: () => setIsActive(false)
        }
      });

      sessionRef.current = await sessionPromise;
      setIsActive(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com a Live API. Verifique as permissões de áudio.");
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsActive(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Ensaio ao Vivo</h2>
          <p className="text-slate-400">Converse com a IA em tempo real para testar seu texto.</p>
        </div>
        <button
          onClick={isActive ? stopSession : startSession}
          className={`px-8 py-3 rounded-full font-bold transition-all flex items-center gap-2 ${
            isActive ? 'bg-red-600 hover:bg-red-500 shadow-lg shadow-red-500/20' : 'bg-green-600 hover:bg-green-500 shadow-lg shadow-green-500/20'
          }`}
        >
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-white'}`}></div>
          {isActive ? 'Encerrar Ensaio' : 'Começar Ensaio'}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[500px]">
        <div className="glass-panel rounded-2xl p-6 flex flex-col overflow-hidden">
          <h3 className="text-lg font-bold mb-4">Feedback Visual e Transcrição</h3>
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {transcriptions.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600">
                <i className="fa-solid fa-microphone-lines text-5xl mb-4"></i>
                <p>O áudio será transcrito aqui enquanto você fala.</p>
              </div>
            ) : (
              transcriptions.map((t, i) => (
                <div key={i} className={`p-3 rounded-lg ${t.role === 'Você' ? 'bg-slate-800' : 'bg-orange-950/30 border border-orange-500/20'}`}>
                  <span className="text-xs font-bold uppercase block mb-1 opacity-50">{t.role}</span>
                  <p className="text-sm">{t.text}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center">
            <div className={`w-48 h-48 rounded-full border-4 flex items-center justify-center transition-all ${isActive ? 'border-orange-500 shadow-[0_0_50px_rgba(249,115,22,0.3)]' : 'border-slate-800'}`}>
               <i className={`fa-solid fa-brain text-6xl ${isActive ? 'text-orange-500 animate-pulse' : 'text-slate-800'}`}></i>
            </div>
            <p className="mt-8 text-slate-400 text-center max-w-xs">
              {isActive ? 'A IA está ouvindo sua entonação e ritmo. Continue falando seu set.' : 'Clique no botão acima para conectar com o Mentor de Voz.'}
            </p>
        </div>
      </div>
    </div>
  );
};

export default VoiceRehearsal;
