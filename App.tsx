
import React, { useState } from 'react';
import Layout from './components/Layout';
import Workshop from './components/Workshop';
import VisualStudio from './components/VisualStudio';
import VoiceRehearsal from './components/VoiceRehearsal';
import TrendsSearch from './components/TrendsSearch';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('workshop');

  const renderContent = () => {
    switch (activeTab) {
      case 'workshop':
        return <Workshop />;
      case 'visuals':
        return <VisualStudio />;
      case 'rehearsal':
        return <VoiceRehearsal />;
      case 'mentors':
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-500">
            <i className="fa-solid fa-comments text-6xl mb-4"></i>
            <h2 className="text-2xl font-bold">Chat de Mentoria</h2>
            <p>Integração com Gemini 3 Pro para chats profundos disponível na próxima atualização.</p>
          </div>
        );
      case 'trends':
        return <TrendsSearch />;
      default:
        return <Workshop />;
    }
  };

  return (
    <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </Layout>
  );
};

export default App;
