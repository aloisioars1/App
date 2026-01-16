
import React, { useState } from 'react';
import { analyzeJokeWithThinking, suggestJokeTags } from '../services/geminiService';
import { Mentor } from '../types';

const EXAMPLES = {
  [Mentor.GREG_DEAN]: {
    setup: "Eu estava em um restaurante e vi uma placa dizendo: 'Por favor, não alimente os animais'.",
    punchline: "O que é estranho, porque eu tinha acabado de pedir um bife e me senti pessoalmente atacado pelo garçom."
  },
  [Mentor.LEO_LINS]: {
    setup: "Vi uma notícia dizendo que cientistas criaram uma inteligência artificial que consegue sentir dor.",
    punchline: "Finalmente uma tecnologia que eu posso contratar pra ser meu estagiário e não me sentir mal por gritar com ela."
  }
};

const Workshop: React.FC = () => {
  const [setup, setSetup] = useState('');
  const [punchline, setPunchline] = useState('');
  const [mentor, setMentor] = useState<Mentor>(Mentor.GREG_DEAN);
  const [feedback, setFeedback] = useState('');
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleAnalyze = async () => {
    if (!setup || !punchline) return;
    setLoading(true);
    setFeedback('');
    setSuggestedTags([]);
    setCopySuccess(false);
    
    try {
      // Analyze joke and suggest tags concurrently
      const [feedbackRes, tagsRes] = await Promise.all([
        analyzeJokeWithThinking(`${setup} ... ${punchline}`, mentor),
        suggestJokeTags(setup, punchline)
      ]);
      
      setFeedback(feedbackRes || 'Sem feedback disponível.');
      setSuggestedTags(tagsRes);
    } catch (error) {
      console.error(error);
      setFeedback('Erro ao analisar piada.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const fillExample = () => {
    const example = EXAMPLES[mentor];
    setSetup(example.setup);
    setPunchline(example.punchline);
    setSuggestedTags([]);
    setSelectedTags([]);
    setFeedback('');
  };

  const handleCopy = () => {
    if (!feedback) return;
    navigator.clipboard.writeText(feedback);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold mb-2 text-white">Oficina de Piadas</h2>
          <p className="text-slate-400">Estruture suas piadas usando as melhores técnicas do mercado.</p>
        </div>
        <button
          onClick={fillExample}
          className="text-orange-500 hover:text-orange-400 text-sm font-semibold flex items-center gap-2 transition-colors pb-1 group"
        >
          <i className="fa-solid fa-lightbulb group-hover:animate-pulse"></i>
          Usar Exemplo de {mentor}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl shadow-xl">
            <label className="block text-sm font-medium mb-3 text-slate-300 uppercase tracking-wider">Escolha seu Mentor</label>
            <div className="flex gap-2 mb-4">
              {Object.values(Mentor).map((m) => (
                <button
                  key={m}
                  onClick={() => setMentor(m)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border transition-all duration-300 font-semibold ${
                    mentor === m 
                      ? 'border-orange-500 bg-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                      : 'border-slate-700 hover:border-slate-500 text-slate-400 bg-slate-800/30'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {mentor === Mentor.LEO_LINS && (
              <div className="mb-6 p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl animate-fadeIn">
                <p className="text-xs text-amber-500 flex items-start gap-3">
                  <i className="fa-solid fa-triangle-exclamation mt-0.5 text-sm"></i>
                  <span>
                    <strong>Aviso de Sensibilidade:</strong> O estilo de Léo Lins foca em humor negro. Esta técnica exige precisão cirúrgica para não ser confundida com ofensa gratuita.
                    <strong className="block mt-1 text-amber-400">Dica: Considere cuidadosamente o perfil do seu público e as características do local da apresentação antes de testar ou performar este material.</strong>
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Setup (Premissa)</label>
                  <span className="text-[10px] text-slate-600">{setup.length} caracteres</span>
                </div>
                <textarea
                  value={setup}
                  onChange={(e) => setSetup(e.target.value)}
                  className="w-full h-32 bg-slate-900/50 border border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none transition-all text-white placeholder-slate-700"
                  placeholder="Defina o cenário da sua piada..."
                />
              </div>
              <div className="relative group">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Punchline (Quebra)</label>
                  <span className="text-[10px] text-slate-600">{punchline.length} caracteres</span>
                </div>
                <textarea
                  value={punchline}
                  onChange={(e) => setPunchline(e.target.value)}
                  className="w-full h-24 bg-slate-900/50 border border-slate-800 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none transition-all text-white placeholder-slate-700"
                  placeholder="A reviravolta engraçada..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={handleAnalyze}
                disabled={loading || !setup || !punchline}
                className="col-span-2 py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    Processando com IA...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                    Solicitar Análise Técnica
                  </>
                )}
              </button>
              
              <button
                onClick={() => {setSetup(''); setPunchline(''); setFeedback(''); setSelectedTags([]); setSuggestedTags([]);}}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition-all border border-slate-700"
              >
                Limpar Tudo
              </button>
              
              <button
                disabled={!feedback}
                className="py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 font-semibold rounded-xl transition-all border border-slate-700 flex items-center justify-center gap-2"
              >
                <i className="fa-solid fa-floppy-disk"></i>
                Salvar Rascunho
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl flex flex-col h-[600px] shadow-2xl relative">
          <header className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <i className="fa-solid fa-clipboard-list text-orange-500"></i>
              Área de Feedback Dedicada
            </h3>
            {feedback && (
              <button
                onClick={handleCopy}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-2 ${
                  copySuccess 
                    ? 'bg-green-500/20 border-green-500 text-green-500' 
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                }`}
              >
                <i className={`fa-solid ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                {copySuccess ? 'Copiado!' : 'Copiar Feedback'}
              </button>
            )}
          </header>
          
          {suggestedTags.length > 0 && (
            <div className="mb-4 p-3 bg-slate-900/30 rounded-xl border border-slate-800 animate-fadeIn">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2 px-1">Tags Identificadas</p>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-500 border-orange-500 text-white shadow-lg'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-orange-500/50 hover:text-orange-400'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex-1 relative bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden group">
            {feedback ? (
              <div className="absolute inset-0 overflow-y-auto p-6 text-slate-300 leading-relaxed animate-fadeIn scroll-smooth custom-scrollbar">
                <div className="prose prose-invert max-w-none prose-sm md:prose-base whitespace-pre-wrap">
                  {feedback}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-8 space-y-6">
                <div className="relative">
                   <div className="absolute inset-0 bg-orange-500/10 blur-3xl rounded-full"></div>
                   <div className="relative w-24 h-24 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl">
                     <i className="fa-solid fa-robot text-4xl text-slate-700"></i>
                   </div>
                </div>
                <div>
                  <p className="font-bold text-slate-400 text-lg mb-2">Aguardando seu material...</p>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Insira o setup e a punchline à esquerda e clique em <strong>"Análise Técnica"</strong> para receber o mentoria da IA.
                  </p>
                </div>
                
                <div className="flex gap-4 opacity-30 grayscale pointer-events-none">
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center"><i className="fa-solid fa-list-check"></i></div>
                      <span className="text-[10px] uppercase font-bold">Estrutura</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center"><i className="fa-solid fa-bolt"></i></div>
                      <span className="text-[10px] uppercase font-bold">Timing</span>
                   </div>
                   <div className="flex flex-col items-center gap-2">
                      <div className="w-10 h-10 rounded-full border border-slate-700 flex items-center justify-center"><i className="fa-solid fa-face-laugh-squint"></i></div>
                      <span className="text-[10px] uppercase font-bold">Punch</span>
                   </div>
                </div>
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
                  <i className="fa-solid fa-brain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500"></i>
                </div>
                <p className="mt-4 text-orange-500 font-bold animate-pulse">O mentor está processando...</p>
              </div>
            )}
          </div>
          
          <footer className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                IA Ativa
             </div>
             <div>Model: Gemini 3 Pro (Thinking Mode)</div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Workshop;
