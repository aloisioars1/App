
import React, { useState } from 'react';
import { searchTrends } from '../services/geminiService';

const TrendsSearch: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ text: string; sources: any[] } | null>(null);

  const handleSearch = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    try {
      const data = await searchTrends(topic);
      setResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      alert("Falha ao buscar tendências. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <header>
        <h2 className="text-3xl font-bold mb-2 text-white">Busca de Material</h2>
        <p className="text-slate-400">Encontre notícias e tendências recentes para transformar em piadas.</p>
      </header>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"></i>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Digite um tema (ex: Oscar 2024, Elon Musk, Dieta Low Carb)..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !topic.trim()}
            className="bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center gap-2"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-bolt"></i>}
            Buscar
          </button>
        </div>
      </div>

      {results && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
            <h3 className="text-xl font-bold mb-4 text-orange-500 flex items-center gap-2">
              <i className="fa-solid fa-lightbulb"></i>
              Ideias para Material
            </h3>
            <div className="prose prose-invert max-w-none text-slate-300 whitespace-pre-wrap leading-relaxed">
              {results.text}
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <i className="fa-solid fa-link text-slate-400"></i>
                Fontes e Referências
              </h3>
              <div className="space-y-3">
                {results.sources.length > 0 ? (
                  results.sources.map((chunk, idx) => {
                    const title = chunk.web?.title || `Fonte ${idx + 1}`;
                    const uri = chunk.web?.uri;
                    if (!uri) return null;
                    return (
                      <a
                        key={idx}
                        href={uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300 hover:text-orange-400 transition-all truncate"
                      >
                        <i className="fa-solid fa-external-link mr-2 text-xs opacity-50"></i>
                        {title}
                      </a>
                    );
                  })
                ) : (
                  <p className="text-slate-500 text-sm italic text-center py-4">Nenhuma fonte direta encontrada.</p>
                )}
              </div>
            </div>

            <div className="bg-orange-600/10 border border-orange-500/20 p-6 rounded-2xl">
              <h4 className="font-bold text-orange-500 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-circle-info"></i>
                Dica do Lab
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Use os detalhes das notícias para criar setups específicos. Quanto mais real o detalhe, mais fácil o público se identifica.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendsSearch;
