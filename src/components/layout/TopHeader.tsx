import React, { useState } from "react";
import {
  Play,
  Square,
  Wifi,
  WifiOff,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";

export const TopHeader: React.FC = () => {
  const {
    status,
    setStatus,
    ram,
    setRam,
    serverPath,
    serverName,
    gamePort,
    rconConnected,
    rconPort,
    rconPassword,
    notifyOnStop,
    sendDiscordWebhook,
    showToast,
    addLog,
  } = useServerStore();

  const presetRams = ["4g", "6g", "8g", "10g", "12g", "16g", "20g", "24g", "32g", "48g", "64g"];
  const [isCustomRam, setIsCustomRam] = useState(!presetRams.includes(ram));

  const handleStartServer = async () => {
    try {
      showToast(`Iniciando servidor com ${ram} de RAM...`, "info");
      addLog("stdout", `[PZ MANAGER] Iniciando processo Java com ${ram} de memória...`);
      setStatus("starting");
      await invoke("start_server", {
        serverPath,
        ram,
        serverName,
      });
      showToast("Processo Java iniciado em segundo plano.", "success");
    } catch (err: any) {
      setStatus("offline");
      showToast(String(err), "error");
      addLog("stderr", `[ERRO AO INICIAR] ${err}`);
    }
  };

  const handleStopServer = async () => {
    try {
      showToast("Encerrando servidor com salvamento prévio...", "info");
      addLog("stdout", "[PZ MANAGER] Enviando comandos de salvamento e desligamento gracioso...");
      setStatus("stopping");
      await invoke("stop_server");
      showToast("Servidor finalizado com sucesso.", "success");
      if (notifyOnStop) {
        sendDiscordWebhook("🛑 **O Servidor de Project Zomboid foi finalizado.**");
      }
    } catch (err: any) {
      showToast(String(err), "error");
      addLog("stderr", `[ERRO AO ENCERRAR] ${err}`);
    }
  };

  const handleRconToggle = async () => {
    if (rconConnected) {
      await invoke("rcon_disconnect");
      useServerStore.getState().setRconConnected(false);
      showToast("RCON desconectado.", "info");
    } else {
      if (status !== "online") {
        showToast(
          "O servidor ainda está inicializando. Aguarde o status OPERACIONAL para conectar o RCON.",
          "info"
        );
        return;
      }
      try {
        showToast(`Conectando ao RCON (Porta: ${rconPort})...`, "info");
        await invoke("rcon_connect", {
          host: "127.0.0.1",
          port: rconPort,
          password: rconPassword,
        });
        useServerStore.getState().setRconConnected(true);
        showToast("Conectado e autenticado no RCON com sucesso!", "success");
      } catch (e: any) {
        showToast(`Falha RCON: ${e}`, "error");
      }
    }
  };

  return (
    <header className="h-20 tactical-glass border-b border-white/10 px-8 flex items-center justify-between z-10 select-none">
      {/* Left info */}
      <div className="flex items-center space-x-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-base font-bold text-white font-mono tracking-wide">
              {serverName}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-tactical-muted">
              PORT {gamePort}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-tactical-muted">
              RCON {rconPort}
            </span>
          </div>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Path: <span className="text-tactical-text">{serverPath}</span>
          </p>
        </div>

        {/* RCON Status Button */}
        <button
          onClick={handleRconToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-mono border transition-all duration-150 ${
            rconConnected
              ? "bg-tactical-green/10 text-tactical-green border-tactical-green/30 hover:bg-tactical-green/20 shadow-green-glow/20"
              : "bg-white/5 text-tactical-muted border-white/10 hover:border-white/20 hover:text-white"
          }`}
        >
          {rconConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
          <span>{rconConnected ? "RCON ATIVO" : "RCON OFFLINE"}</span>
        </button>
      </div>

      {/* Right Controls: RAM + Main Start/Stop Action */}
      <div className="flex items-center space-x-4">
        {status === "offline" && (
          <div className="flex items-center space-x-2 bg-black/40 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs font-mono text-tactical-muted">RAM:</span>
            {!isCustomRam ? (
              <select
                value={presetRams.includes(ram) ? ram : "custom"}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomRam(true);
                  } else {
                    setRam(e.target.value);
                  }
                }}
                className="bg-transparent text-tactical-amber font-mono font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="4g" className="bg-[#12141A] text-white">4 GB</option>
                <option value="6g" className="bg-[#12141A] text-white">6 GB</option>
                <option value="8g" className="bg-[#12141A] text-white">8 GB</option>
                <option value="10g" className="bg-[#12141A] text-white">10 GB</option>
                <option value="12g" className="bg-[#12141A] text-white">12 GB</option>
                <option value="16g" className="bg-[#12141A] text-white">16 GB (Padrão)</option>
                <option value="20g" className="bg-[#12141A] text-white">20 GB</option>
                <option value="24g" className="bg-[#12141A] text-white">24 GB</option>
                <option value="32g" className="bg-[#12141A] text-white">32 GB</option>
                <option value="48g" className="bg-[#12141A] text-white">48 GB</option>
                <option value="64g" className="bg-[#12141A] text-white">64 GB</option>
                <option value="custom" className="bg-[#12141A] text-tactical-cyan">✏️ Customizada...</option>
              </select>
            ) : (
              <div className="flex items-center space-x-1.5">
                <input
                  type="number"
                  min="1"
                  max="128"
                  value={ram.replace(/[^0-9]/g, "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setRam(`${val}g`);
                  }}
                  className="w-12 bg-black/60 border border-tactical-amber/50 rounded px-1.5 py-0.5 text-tactical-amber font-mono font-bold text-xs text-center focus:outline-none"
                  placeholder="16"
                  autoFocus
                />
                <span className="text-xs font-mono text-tactical-amber font-bold">GB</span>
                <button
                  type="button"
                  onClick={() => setIsCustomRam(false)}
                  title="Voltar para lista de opções de RAM"
                  className="text-[10px] text-tactical-muted hover:text-white px-1 font-mono hover:bg-white/10 rounded"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {status === "offline" ? (
          <TacticalButton
            variant="primary"
            size="md"
            icon={<Play size={16} fill="currentColor" />}
            onClick={handleStartServer}
          >
            INICIAR SERVIDOR
          </TacticalButton>
        ) : status === "starting" ? (
          <TacticalButton
            variant="secondary"
            size="md"
            isLoading={true}
            disabled
          >
            INICIANDO NÚCLEO...
          </TacticalButton>
        ) : (
          <TacticalButton
            variant="danger"
            size="md"
            icon={<Square size={16} fill="currentColor" />}
            onClick={handleStopServer}
          >
            PARAR SERVIDOR
          </TacticalButton>
        )}
      </div>
    </header>
  );
};
