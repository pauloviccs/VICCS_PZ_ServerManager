import React, { useState, useEffect } from "react";
import {
  Download,
  FileText,
  FolderOpen,
  RefreshCw,
  Search,
  Terminal,
  Trash2,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";

export const AppLogsView: React.FC = () => {
  const { logs, clearLogs, showToast } = useServerStore();
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [logDir, setLogDir] = useState<string>("");
  const [diskLogs, setDiskLogs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<"live" | "disk">("live");
  const [loadingDisk, setLoadingDisk] = useState<boolean>(false);

  useEffect(() => {
    invoke<string>("get_app_logs_dir")
      .then((dir) => setLogDir(dir))
      .catch((err) => console.warn("Erro ao obter diretório de logs:", err));
  }, []);

  const loadDiskLogs = async () => {
    setLoadingDisk(true);
    try {
      const lines = await invoke<string[]>("read_recent_app_logs");
      setDiskLogs(lines);
      showToast(`Carregadas ${lines.length} linhas do arquivo de log diário.`, "info");
    } catch (err) {
      showToast(`Erro ao ler logs do disco: ${err}`, "error");
    } finally {
      setLoadingDisk(false);
    }
  };

  const handleOpenLogFolder = async () => {
    try {
      await invoke("open_folder", { target: "app_logs" });
      showToast("Pasta de logs aberta no Windows Explorer!", "success");
    } catch (err) {
      showToast(`Erro ao abrir pasta: ${err}`, "error");
    }
  };

  const handleExportLogs = () => {
    const content =
      activeView === "live"
        ? logs
            .map((l) => `[${l.timestamp}] [${l.source.toUpperCase()}] ${l.message}`)
            .join("\n")
        : diskLogs.join("\n");

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pz_manager_export_${new Date().toISOString().replace(/[:.]/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Arquivo de log exportado com sucesso!", "success");
  };

  const filteredLiveLogs = logs.filter((log) => {
    const matchesSource = filterSource === "all" || log.source === filterSource;
    const matchesSearch =
      !searchTerm ||
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSource && matchesSearch;
  });

  const filteredDiskLogs = diskLogs.filter((line) => {
    return !searchTerm || line.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header Card */}
      <div className="p-4 tactical-glass rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
            <FileText size={18} className="text-tactical-cyan" />
            <span>DIAGNÓSTICOS & REGISTRO DE LOGS DO APP</span>
          </h2>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Logs persistentes gravados em disco:{" "}
            <span className="text-tactical-text font-bold">{logDir || "%USERPROFILE%\\Zomboid\\ServerManager_Logs"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Alternador Live / Arquivo em Disco */}
          <div className="flex items-center bg-[#12141A] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setActiveView("live")}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeView === "live"
                  ? "bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/40"
                  : "text-tactical-muted hover:text-white"
              }`}
            >
              Ao Vivo ({logs.length})
            </button>
            <button
              onClick={() => {
                setActiveView("disk");
                loadDiskLogs();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                activeView === "disk"
                  ? "bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/40"
                  : "text-tactical-muted hover:text-white"
              }`}
            >
              Arquivo em Disco
            </button>
          </div>

          <TacticalButton
            variant="secondary"
            size="sm"
            icon={<FolderOpen size={14} />}
            onClick={handleOpenLogFolder}
          >
            Abrir Pasta
          </TacticalButton>

          <TacticalButton
            variant="secondary"
            size="sm"
            icon={<Download size={14} />}
            onClick={handleExportLogs}
          >
            Exportar
          </TacticalButton>

          {activeView === "live" && (
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Trash2 size={14} className="text-tactical-red" />}
              onClick={clearLogs}
            >
              Limpar
            </TacticalButton>
          )}

          {activeView === "disk" && (
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<RefreshCw size={14} className={loadingDisk ? "animate-spin" : ""} />}
              onClick={loadDiskLogs}
              disabled={loadingDisk}
            >
              Recarregar
            </TacticalButton>
          )}
        </div>
      </div>

      {/* Barra de Filtro e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3 top-3 text-tactical-muted" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por texto, código de erro ou instrução..."
            className="w-full bg-[#12141A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-tactical-muted focus:border-tactical-cyan/50 focus:outline-none"
          />
        </div>

        {activeView === "live" && (
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto">
            {[
              { id: "all", label: "TODOS" },
              { id: "stdout", label: "STDOUT (JAVA)" },
              { id: "stderr", label: "STDERR (ERROS)" },
              { id: "rcon", label: "RCON" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterSource(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  filterSource === f.id
                    ? "bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/40"
                    : "bg-white/5 text-tactical-muted border border-white/10 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Janela de Logs com Formatação Tática */}
      <div className="h-[65vh] rounded-2xl bg-[#090A0F] border border-white/10 p-4 font-mono text-xs overflow-y-auto tactical-scroll shadow-inner">
        {activeView === "live" ? (
          filteredLiveLogs.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-tactical-muted space-y-2">
              <Terminal size={32} />
              <span>Nenhum log ao vivo gravado no momento.</span>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredLiveLogs.map((log) => {
                const isError =
                  log.source === "stderr" ||
                  log.message.toLowerCase().includes("error") ||
                  log.message.toLowerCase().includes("exception");
                const isRcon = log.source === "rcon";

                return (
                  <div
                    key={log.id}
                    className={`flex items-start space-x-2 py-0.5 px-2 rounded hover:bg-white/[0.03] transition-colors leading-relaxed ${
                      isError
                        ? "text-tactical-red bg-tactical-red/5"
                        : isRcon
                        ? "text-tactical-cyan"
                        : "text-tactical-text"
                    }`}
                  >
                    <span className="text-tactical-muted shrink-0 text-[10px] select-none">
                      [{log.timestamp}]
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 select-none font-bold ${
                        log.source === "stdout"
                          ? "bg-white/5 text-tactical-muted"
                          : log.source === "stderr"
                          ? "bg-tactical-red/20 text-tactical-red"
                          : "bg-tactical-cyan/20 text-tactical-cyan"
                      }`}
                    >
                      {log.source.toUpperCase()}
                    </span>
                    <span className="break-all whitespace-pre-wrap">{log.message}</span>
                  </div>
                );
              })}
            </div>
          )
        ) : filteredDiskLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-tactical-muted space-y-2">
            <FileText size={32} />
            <span>Nenhum log persistido encontrado no arquivo diário.</span>
            <TacticalButton variant="secondary" size="sm" onClick={loadDiskLogs}>
              Recarregar Arquivo
            </TacticalButton>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredDiskLogs.map((line, idx) => {
              const isError =
                line.includes("[STDERR]") ||
                line.toLowerCase().includes("error") ||
                line.toLowerCase().includes("exception");
              return (
                <div
                  key={idx}
                  className={`py-0.5 px-2 rounded hover:bg-white/[0.03] transition-colors leading-relaxed break-all whitespace-pre-wrap ${
                    isError ? "text-tactical-red bg-tactical-red/5" : "text-tactical-text"
                  }`}
                >
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
