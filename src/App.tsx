import React, { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { LiveConsole } from "./components/console/LiveConsole";
import { ConfigTabsView } from "./components/config/ConfigTabsView";
import { AdminActionsGrid } from "./components/dashboard/AdminActionsGrid";
import { MaintenanceCards } from "./components/dashboard/MaintenanceCards";
import { ServerStatusHUD } from "./components/dashboard/ServerStatusHUD";
import { Sidebar } from "./components/layout/Sidebar";
import { TopHeader } from "./components/layout/TopHeader";
import { ModManagerView } from "./components/mods/ModManagerView";
import { ResourceCharts } from "./components/monitor/ResourceCharts";
import { AppSettingsView } from "./components/settings/AppSettingsView";
import { AppLogsView } from "./components/diagnostics/AppLogsView";
import { useServerStore } from "./store/serverStore";
import { ResourceStats, ServerStatus } from "./types";

export const App: React.FC = () => {
  const {
    activeTab,
    setStatus,
    setPid,
    addLog,
    setStats,
    toast,
    syncFromIni,
    addPlayer,
    removePlayer,
    notifyOnStart,
    sendDiscordWebhook,
    rconPort,
    rconPassword,
    setRconConnected,
    shutdownActive,
    shutdownCountdown,
    shutdownIncludesWindows,
    tickShutdown,
    cancelScheduledShutdown,
  } = useServerStore();

  useEffect(() => {
    // Sincroniza portas e dados do servertest.ini na inicialização
    syncFromIni();
  }, [syncFromIni]);

  // Intervalo do Desligamento Programado (Opção 55)
  useEffect(() => {
    if (!shutdownActive) return;
    const interval = setInterval(() => {
      tickShutdown();
    }, 1000);
    return () => clearInterval(interval);
  }, [shutdownActive, tickShutdown]);

  useEffect(() => {
    // 1. Escuta logs do servidor (stdout/stderr)
    const unlistenLog = listen<any>("server-log", (event) => {
      const payload = event.payload;
      addLog(payload.source, payload.message, payload.timestamp);

      const msg = payload.message || "";

      // Detecção de Servidor Totalmente Inicializado
      if (msg.includes("*** SERVER STARTED ****")) {
        if (notifyOnStart) {
          sendDiscordWebhook(
            "🟢 **O Servidor de Project Zomboid está ONLINE!** Inicialização concluída e pronto para conexões."
          );
        }

        // Tenta auto-conectar no RCON se tiver senha
        if (rconPassword) {
          invoke("rcon_connect", {
            host: "127.0.0.1",
            port: rconPort,
            password: rconPassword,
          })
            .then(() => setRconConnected(true))
            .catch((e) => console.warn("Auto-connect RCON:", e));
        }
      }

      // Detecção de Conexão de Jogador via logs de stdout
      // Padrões comuns no PZ:
      // user "NICK" fully connected
      // Player NICK connected
      const connectMatch =
        msg.match(/user\s+"([^"]+)"\s+fully\s+connected/i) ||
        msg.match(/Player\s+"?([^"\s]+)"?\s+connected/i) ||
        msg.match(/connected\s+user\s+"([^"]+)"/i);

      if (connectMatch && connectMatch[1]) {
        addPlayer(connectMatch[1]);
      }

      // Detecção de Desconexão de Jogador via logs de stdout
      const disconnectMatch =
        msg.match(/disconnected\s+player\s+"([^"]+)"/i) ||
        msg.match(/Player\s+"?([^"\s]+)"?\s+has\s+disconnected/i) ||
        msg.match(/User\s+"([^"]+)"\s+disconnected/i);

      if (disconnectMatch && disconnectMatch[1]) {
        removePlayer(disconnectMatch[1]);
      }
    });

    // 2. Escuta mudanças de status do servidor
    const unlistenStatus = listen<{ status: ServerStatus; pid?: number }>(
      "server-status",
      (event) => {
        const payload = event.payload;
        setStatus(payload.status);
        if (payload.pid !== undefined) {
          setPid(payload.pid);
        }
      }
    );

    // 3. Escuta métricas de recursos do sistema e JVM
    const unlistenStats = listen<ResourceStats>("resource-stats", (event) => {
      setStats(event.payload);
    });

    return () => {
      unlistenLog.then((f) => f());
      unlistenStatus.then((f) => f());
      unlistenStats.then((f) => f());
    };
  }, [
    addLog,
    setStatus,
    setPid,
    setStats,
    addPlayer,
    removePlayer,
    notifyOnStart,
    sendDiscordWebhook,
    rconPort,
    rconPassword,
    setRconConnected,
  ]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-tactical-bg text-tactical-text font-sans select-none relative">
      {/* Sidebar Fixa */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <TopHeader />

        {/* Banner de Aviso de Desligamento Programado Ativo */}
        {shutdownActive && shutdownCountdown !== null && (
          <div className="bg-tactical-red/20 border-b border-tactical-red/40 px-6 py-2.5 flex items-center justify-between text-xs font-mono shrink-0 animate-pulse">
            <div className="flex items-center space-x-3 text-tactical-red">
              <span className="w-2.5 h-2.5 rounded-full bg-tactical-red animate-ping" />
              <span className="font-bold tracking-wider">
                [DESLIGAMENTO PROGRAMADO ATIVO]
              </span>
              <span className="text-white">
                O servidor será salvo e encerrado em{" "}
                <span className="text-tactical-amber font-bold text-sm underline">
                  {Math.floor(shutdownCountdown / 60)}m {shutdownCountdown % 60}s
                </span>
                {shutdownIncludesWindows ? " (com desligamento do Windows)" : ""}
              </span>
            </div>
            <button
              onClick={() => cancelScheduledShutdown()}
              className="px-3 py-1 bg-tactical-red hover:bg-tactical-red-light text-white rounded-lg font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              ABORTAR AGORA
            </button>
          </div>
        )}

        {/* Scrollable Main View Container */}
        <main className="flex-1 overflow-y-auto p-8">
          {activeTab === "dashboard" && (
            <div className="max-w-7xl mx-auto space-y-6">
              <ServerStatusHUD />
              <MaintenanceCards />
              <AdminActionsGrid />
            </div>
          )}

          {activeTab === "console" && (
            <div className="max-w-7xl mx-auto">
              <LiveConsole />
            </div>
          )}

          {activeTab === "monitor" && (
            <div className="max-w-7xl mx-auto">
              <ResourceCharts />
            </div>
          )}

          {activeTab === "config" && (
            <div className="max-w-7xl mx-auto">
              <ConfigTabsView />
            </div>
          )}

          {activeTab === "mods" && (
            <div className="max-w-7xl mx-auto">
              <ModManagerView />
            </div>
          )}

          {activeTab === "diagnostics" && (
            <div className="max-w-7xl mx-auto">
              <AppLogsView />
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-7xl mx-auto">
              <AppSettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Toast Notification Container Global (Sem ser afetado por backdrop-filter do header) */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 pointer-events-auto animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "bg-tactical-green/20 border-tactical-green/40 text-tactical-green"
                : toast.type === "error"
                ? "bg-tactical-red/20 border-tactical-red/40 text-tactical-red"
                : "bg-tactical-amber/20 border-tactical-amber/40 text-tactical-amber"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 size={18} />}
            {toast.type === "error" && <AlertTriangle size={18} />}
            {toast.type === "info" && <Info size={18} />}
            <span className="text-xs font-mono font-medium text-white">
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
