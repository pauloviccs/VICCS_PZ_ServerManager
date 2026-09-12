import React from "react";
import {
  Activity,
  LayoutDashboard,
  Package,
  Server,
  Settings,
  Sliders,
  Terminal,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { ActiveTab } from "../../types";

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, status, stats } = useServerStore();

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    {
      id: "console",
      label: "Console",
      icon: <Terminal size={18} />,
    },
    {
      id: "monitor",
      label: "Recursos",
      icon: <Activity size={18} />,
    },
    {
      id: "config",
      label: "Configuração",
      icon: <Sliders size={18} />,
    },
    {
      id: "mods",
      label: "Mods & Workshop",
      icon: <Package size={18} />,
    },
    {
      id: "settings",
      label: "Ajustes",
      icon: <Settings size={18} />,
    },
  ];

  const statusColors = {
    online: "bg-tactical-green shadow-green-glow",
    starting: "bg-tactical-amber shadow-amber-glow animate-pulse",
    stopping: "bg-tactical-red shadow-red-glow animate-pulse",
    offline: "bg-white/20",
  };

  const statusLabels = {
    online: "OPERACIONAL",
    starting: "INICIANDO...",
    stopping: "ENCERRANDO...",
    offline: "DESCONECTADO",
  };

  return (
    <aside className="w-64 h-screen flex flex-col justify-between tactical-glass border-r border-white/10 z-20 select-none">
      {/* Brand Header */}
      <div>
        <div className="flex items-center space-x-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-tactical-amber/15 border border-tactical-amber/40 flex items-center justify-center text-tactical-amber shadow-amber-glow/20">
            <Server size={20} />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider uppercase text-white font-mono">
              PZ MANAGER
            </h1>
            <p className="text-[10px] text-tactical-muted tracking-widest font-mono">
              TACTICAL OPS v1.0
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="px-3 py-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-tactical-amber/15 text-tactical-amber border border-tactical-amber/30 shadow-amber-glow/10 font-semibold"
                    : "text-tactical-muted hover:text-tactical-text hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className={isActive ? "text-tactical-amber" : "text-tactical-muted"}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-4 border-t border-white/10 m-3 rounded-2xl bg-black/40 border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-mono uppercase text-tactical-muted tracking-wider">
            STATUS DO NÚCLEO
          </span>
          <div className="flex items-center space-x-1.5">
            <span className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
            <span className="text-[10px] font-mono font-bold tracking-wider text-tactical-text">
              {statusLabels[status]}
            </span>
          </div>
        </div>

        {stats && (
          <div className="space-y-1.5 pt-2 border-t border-white/5">
            <div className="flex justify-between text-[11px] font-mono text-tactical-muted">
              <span>RAM PC:</span>
              <span className="text-tactical-text">{stats.ram_global_percent.toFixed(0)}%</span>
            </div>
            {stats.server_running && (
              <div className="flex justify-between text-[11px] font-mono text-tactical-muted">
                <span>JVM PZ:</span>
                <span className="text-tactical-green font-semibold">
                  {(stats.server_ram_used / 1024 / 1024 / 1024).toFixed(1)} GB
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
