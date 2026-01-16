
import React, { useState, useEffect } from 'react';
import { generateJokeImage, generateJokeVideo } from '../services/geminiService';

interface SavedAsset {
  id: string;
  url: string;
  type: 'image' | 'video';
  prompt: string;
  timestamp: number;
}

const VisualStudio: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [type, setType] = useState<'image' | 'video'>('image');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [aspect, setAspect] = useState<string>('16:9');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedAssets, setSavedAssets] = useState<SavedAsset[]>([]);

  // Load saved assets on mount
  useEffect(() => {
    const saved = localStorage.getItem('comedia_lab_assets');
    if (saved) {
      try {
        setSavedAssets(JSON.parse(saved));
      } catch (e) {
        console.error("Erro ao carregar ativos salvos", e);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setResultUrl(null);
    try {
      if (type === 'image') {
        const url = await generateJokeImage(prompt, aspect, size);
        setResultUrl(url);
      } else {
        const url = await generateJokeVideo(prompt, aspect as any);
        setResultUrl(url);
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar ativo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!resultUrl) return;

    const newAsset: SavedAsset = {
      id: crypto.randomUUID(),
      url: resultUrl,
      type: type,
      prompt: prompt,
      timestamp: Date.now()
    };

    const updated = [newAsset, ...savedAssets];
    setSavedAssets(updated);
    localStorage.setItem('comedia_lab_assets', JSON.stringify(updated));
  };

  const removeAsset = (id: string) => {
    const updated = savedAssets.filter(a => a.id !== id);
    setSavedAssets(updated);
    localStorage.setItem('comedia_lab_assets', JSON.stringify(updated));
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header>
        <h2 className="text-3xl font-bold mb-2">Estúdio Visual</h2>
        <p className="text-slate-400">Crie gags visuais e cenários para suas piadas.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">O que quer criar?</label>
              <div className="flex bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setType('image')}
                  className={`flex-1 py-2 rounded-md transition-all ${type === 'image' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                >
                  Imagem
                </button>
                <button
                  onClick={() => setType('video')}
                  className={`flex-1 py-2 rounded-md transition-all ${type === 'video' ? 'bg-orange-600 text-white' : 'text-slate-400'}`}
                >
                  Vídeo (Veo)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-300">Prompt da Piada</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full h-32 bg-slate-800 border border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                placeholder="Ex: Um papagaio usando um terno e julgando a plateia..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-400">Formato</label>
                <select
                  value={aspect}
                  onChange={(e) => setAspect(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="1:1">1:1 (Quadrado)</option>
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="9:16">9:16 (TikTok/Reels)</option>
                  <option value="4:3">4:3 (Clássico)</option>
                </select>
              </div>
              {type === 'image' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-400">Qualidade</label>
                  <select
                    value={size}
                    onChange={(e) => setSize(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              )}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-spinner animate-spin"></i>
                  {type === 'image' ? 'Desenhando...' : 'Animando...'}
                </span>
              ) : 'Gerar Ativo Visual'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 flex flex-col items-center justify-center bg-black/40 border-dashed border-2 border-slate-800 relative min-h-[400px] overflow-hidden">
          {resultUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-center animate-scaleIn">
              {type === 'image' ? (
                <img 
                  src={resultUrl} 
                  alt="Generated" 
                  className="max-w-full max-h-[500px] rounded-lg shadow-2xl transition-transform duration-500 hover:scale-[1.02]" 
                />
              ) : (
                <video 
                  src={resultUrl} 
                  controls 
                  className="max-w-full max-h-[500px] rounded-lg shadow-2xl transition-transform duration-500 hover:scale-[1.02]" 
                />
              )}
              
              <button
                onClick={handleSave}
                className="mt-6 px-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-full flex items-center gap-2 shadow-lg transition-all hover:scale-105 active:scale-95 animate-fadeIn stagger-1"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Salvar na Galeria
              </button>
            </div>
          ) : (
            <div className={`text-center transition-opacity duration-700 ${loading ? 'opacity-30' : 'opacity-100'}`}>
              <i className={`fa-solid ${type === 'image' ? 'fa-image' : 'fa-video'} text-6xl mb-4 opacity-20`}></i>
              <p className="text-slate-500">Seu conteúdo gerado aparecerá aqui.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery Section */}
      <section className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <i className="fa-solid fa-images text-orange-500"></i>
            Galeria de Salvos
          </h3>
          <span className="text-sm text-slate-500">{savedAssets.length} ativos salvos localmente</span>
        </div>

        {savedAssets.length === 0 ? (
          <div className="glass-panel p-12 rounded-2xl text-center text-slate-600 border-dashed border-2 border-slate-800 animate-fadeIn">
            <p>Você ainda não salvou nenhum ativo visual.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {savedAssets.map((asset, index) => (
              <div 
                key={asset.id} 
                className="group relative glass-panel rounded-xl overflow-hidden aspect-square border border-slate-800 hover:border-orange-500/50 transition-all shadow-md hover:shadow-orange-500/20 animate-scaleIn"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {asset.type === 'image' ? (
                  <img src={asset.url} alt={asset.prompt} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                ) : (
                  <video src={asset.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 group-hover:scale-110" />
                )}
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                  <p className="text-[11px] text-slate-200 line-clamp-2 mb-3 italic translate-y-4 group-hover:translate-y-0 transition-transform duration-300">"{asset.prompt}"</p>
                  <div className="flex gap-2 translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    <a 
                      href={asset.url} 
                      download={`joke-asset-${asset.id}.${asset.type === 'image' ? 'png' : 'mp4'}`}
                      className="flex-1 bg-white/10 hover:bg-orange-500 backdrop-blur-md text-white text-[10px] font-bold py-1.5 rounded text-center transition-colors"
                    >
                      Download
                    </a>
                    <button 
                      onClick={() => removeAsset(asset.id)}
                      className="bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white p-1.5 rounded transition-all"
                      title="Excluir"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>

                {asset.type === 'video' && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded-full w-6 h-6 flex items-center justify-center pointer-events-none">
                    <i className="fa-solid fa-play text-[10px] text-white ml-0.5"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default VisualStudio;
