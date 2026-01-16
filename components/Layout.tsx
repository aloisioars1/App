
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'workshop', label: 'Oficina de Piadas', icon: 'fa-pen-fancy' },
    { id: 'mentors', label: 'Chat com Mentores', icon: 'fa-comments' },
    { id: 'visuals', label: 'Estúdio Visual', icon: 'fa-icons' },
    { id: 'rehearsal', label: 'Ensaio ao Vivo', icon: 'fa-microphone-lines' },
    { id: 'trends', label: 'Busca de Material', icon: 'fa-magnifying-glass' },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 glass-panel border-r border-slate-800 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
            <i className="fa-solid fa-microphone-alt"></i> Comédia Lab
          </h1>
        </div>
        <nav className="flex-1 px-4 space-y-2 py-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5`}></i>
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center font-bold">JD</div>
            <div>
              <p className="text-sm font-semibold">User Comediante</p>
              <p className="text-xs text-slate-500">Plano Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="max-w-6xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
