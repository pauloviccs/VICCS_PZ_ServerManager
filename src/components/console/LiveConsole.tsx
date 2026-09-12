import React, { useEffect, useRef, useState } from "react";
import {
  Pause,
  Play,
  Send,
  Terminal,
  Trash2,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { invoke } from "@tauri-apps/api/core";

export const LiveConsole: React.FC = () => {
  const { logs, clearLogs, rconConnected, showToast, addLog } = useServerStore();
  const [filter, setFilter] = useState<"all" | "stdout" | "stderr" | "rcon">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [commandInput, setCommandInput] = useState("");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [autoScroll, setAutoScroll] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleSendCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    if (!rconConnected) {
      showToast("RCON desconectado! Ative o RCON no cabeçalho.", "error");
      return;
    }

    setCommandHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommandInput("");

    try {
      addLog("rcon", `> ${cmd}`);
      const res: string = await invoke("rcon_execute", { command: cmd });
      if (res.trim()) {
        addLog("rcon", res.trim());
      }
    } catch (err: any) {
      addLog("rcon", `[FALHA RCON] ${err}`);
      showToast(`Erro ao enviar comando: ${err}`, "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const nextIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommandInput(commandHistory[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setCommandInput("");
      } else {
        setHistoryIndex(nextIndex);
        setCommandInput(commandHistory[nextIndex]);
      }
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter !== "all" && log.source !== filter) return false;
    if (searchTerm && !log.message.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col tactical-glass rounded-2xl border border-white/10 overflow-hidden">
      {/* Console Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-white/10 bg-black/40 select-none">
        <div className="flex items-center space-x-3">
          <div className="text-tactical-amber">
            <Terminal size={18} />
          </div>
          <span className="text-xs font-bold font-mono tracking-wider uppercase text-white">
            CONSOLE TÁTICO UNIFICADO
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-tactical-muted">
            {filteredLogs.length} linhas
          </span>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center space-x-2">
          {/* Search Box */}
          <input
            type="text"
            placeholder="Filtrar logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-black/50 text-tactical-text placeholder-tactical-muted/40 text-xs font-mono rounded-lg px-2.5 py-1.5 border border-white/10 focus:outline-none focus:border-tactical-amber w-36"
          />

          {/* Filter Chips */}
          <div className="flex rounded-lg bg-black/40 p-0.5 border border-white/10 text-[11px] font-mono">
            {(["all", "stdout", "stderr", "rcon"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded transition-colors uppercase ${
                  filter === f
                    ? "bg-tactical-amber text-black font-bold"
                    : "text-tactical-muted hover:text-white"
                }`}
              >
                {f === "all" ? "Todos" : f}
              </button>
            ))}
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Pausar rolagem automática" : "Ativar rolagem automática"}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center space-x-1 ${
              autoScroll
                ? "bg-tactical-green/10 text-tactical-green border-tactical-green/30"
                : "bg-white/5 text-tactical-muted border-white/10"
            }`}
          >
            {autoScroll ? <Play size={14} /> : <Pause size={14} />}
            <span className="text-[10px]">AUTO</span>
          </button>

          {/* Clear button */}
          <button
            onClick={clearLogs}
            title="Limpar tela do console"
            className="p-1.5 rounded-lg border border-white/10 text-tactical-muted hover:text-tactical-red hover:border-tactical-red/30 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Log Output Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs leading-relaxed bg-[#08090a]/90 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-tactical-muted/40 italic font-mono select-none">
            Aguardando inicialização do servidor ou emissão de logs...
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isError = log.source === "stderr" || log.message.includes("ERROR:") || log.message.includes("Exception");
            const isRcon = log.source === "rcon";
            const isWarning = log.message.includes("WARN:") || log.message.includes("WARNING:");

            return (
              <div
                key={log.id}
                className={`flex items-start space-x-2 py-0.5 px-2 rounded hover:bg-white/[0.02] ${
                  isError
                    ? "text-tactical-red bg-tactical-red/5"
                    : isRcon
                    ? "text-tactical-amber"
                    : isWarning
                    ? "text-yellow-400"
                    : "text-tactical-text/90"
                }`}
              >
                <span className="text-[10px] text-tactical-muted/60 select-none flex-shrink-0">
                  [{log.timestamp}]
                </span>
                <span
                  className={`text-[9px] uppercase px-1 py-0.2 rounded border font-bold select-none flex-shrink-0 ${
                    log.source === "stderr"
                      ? "border-tactical-red/40 text-tactical-red"
                      : log.source === "rcon"
                      ? "border-tactical-amber/40 text-tactical-amber"
                      : "border-white/10 text-tactical-muted"
                  }`}
                >
                  {log.source}
                </span>
                <span className="break-all whitespace-pre-wrap flex-1">{log.message}</span>
              </div>
            );
          })
        )}
      </div>

      {/* Console Input Footer */}
      <form
        onSubmit={handleSendCommand}
        className="flex items-center space-x-2 p-3 border-t border-white/10 bg-black/60"
      >
        <span className="text-tactical-amber font-mono font-bold text-sm pl-2 select-none">
          ❯
        </span>
        <input
          type="text"
          value={commandInput}
          onChange={(e) => setCommandInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            rconConnected
              ? "Digite um comando RCON livre (ex: players, save, servermsg Olá mundo)..."
              : "RCON desconectado — ative o RCON no cabeçalho para enviar comandos."
          }
          disabled={!rconConnected}
          className="flex-1 bg-transparent text-tactical-text placeholder-tactical-muted/40 font-mono text-xs focus:outline-none"
        />
        <TacticalButton
          variant="primary"
          size="sm"
          type="submit"
          disabled={!rconConnected || !commandInput.trim()}
          icon={<Send size={14} />}
        >
          Enviar
        </TacticalButton>
      </form>
    </div>
  );
};
