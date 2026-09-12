import React, { useEffect, useState } from "react";
import { Activity, Cpu, HardDrive, Users } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalCard } from "../ui/TacticalCard";
import { invoke } from "@tauri-apps/api/core";

export const ServerStatusHUD: React.FC = () => {
  const {
    status,
    pid,
    stats,
    ram,
    rconConnected,
    maxPlayers,
    playerCount,
    players,
    setPlayers,
  } = useServerStore();

  const [uptimeSeconds, setUptimeSeconds] = useState<number>(0);

  // Contador de uptime
  useEffect(() => {
    let interval: any;
    if (status === "online" || status === "starting") {
      interval = setInterval(() => {
        setUptimeSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setUptimeSeconds(0);
    }
    return () => clearInterval(interval);
  }, [status]);

  // Consulta jogadores via RCON a cada 5s se estiver online
  useEffect(() => {
    let interval: any;
    if (rconConnected && status === "online") {
      const fetchPlayers = async () => {
        try {
          const res: string = await invoke("rcon_execute", { command: "players" });
          // Formato típico PZ:
          // "Players connected (2):"
          // "- NickA"
          // "- NickB"
          const matchCount = res.match(/Players connected \((\d+)\)/i);
          const foundNicks: string[] = [];

          const lines = res.split("\n");
          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith("-")) {
              const nick = trimmed.replace(/^-\s*/, "").trim();
              if (nick) foundNicks.push(nick);
            }
          }

          if (foundNicks.length > 0) {
            setPlayers(foundNicks);
          } else if (matchCount && matchCount[1]) {
            const count = parseInt(matchCount[1], 10);
            if (count === 0) {
              setPlayers([]);
            }
          }
        } catch {
          // silencia se comando falhar momentaneamente
        }
      };
      fetchPlayers();
      interval = setInterval(fetchPlayers, 5000);
    }
    return () => clearInterval(interval);
  }, [rconConnected, status, setPlayers]);

  const formatUptime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  const ramNum = parseInt(ram.replace("g", ""), 10) || 16;
  const javaRamGB = stats ? stats.server_ram_used / 1024 / 1024 / 1024 : 0;
  const ramPercent = Math.min(100, Math.max(0, (javaRamGB / ramNum) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Status do Servidor */}
      <TacticalCard
        title="STATUS DO NÚCLEO"
        icon={<Activity size={18} />}
        badge={
          <span
            className={`w-2.5 h-2.5 rounded-full ml-1 ${
              status === "online"
                ? "bg-tactical-green shadow-green-glow"
                : status === "starting"
                ? "bg-tactical-amber shadow-amber-glow animate-pulse"
                : status === "stopping"
                ? "bg-tactical-red shadow-red-glow animate-pulse"
                : "bg-tactical-muted opacity-50"
            }`}
          />
        }
      >
        <div className="space-y-2">
          <div className="text-2xl font-bold tracking-wider font-mono">
            {status === "online" ? (
              <span className="text-tactical-green">OPERACIONAL</span>
            ) : status === "starting" ? (
              <span className="text-tactical-amber animate-pulse">INICIANDO...</span>
            ) : status === "stopping" ? (
              <span className="text-tactical-red">ENCERRANDO...</span>
            ) : (
              <span className="text-tactical-muted">OFFLINE</span>
            )}
          </div>
          <div className="flex justify-between items-center text-xs font-mono text-tactical-muted">
            <span>Uptime: {formatUptime(uptimeSeconds)}</span>
            {pid && <span>PID: {pid}</span>}
          </div>
        </div>
      </TacticalCard>

      {/* 2. Memória da JVM */}
      <TacticalCard title="MEMÓRIA DA JVM" icon={<HardDrive size={18} />}>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-white">
              {status === "offline" ? "0.0" : javaRamGB.toFixed(1)}{" "}
              <span className="text-xs font-normal text-tactical-muted">GB</span>
            </span>
            <span className="text-xs text-tactical-muted">
              Limite: <strong className="text-white">{ramNum} GB</strong>
            </span>
          </div>
          <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/5">
            <div
              className={`h-full transition-all duration-500 ${
                ramPercent > 90
                  ? "bg-tactical-red shadow-red-glow"
                  : ramPercent > 75
                  ? "bg-tactical-amber"
                  : "bg-tactical-cyan"
              }`}
              style={{
                width: `${status === "online" || status === "starting" ? ramPercent : 0}%`,
              }}
            />
          </div>
          <div className="text-[11px] font-mono text-tactical-muted text-right">
            {status === "online" || status === "starting"
              ? `${ramPercent.toFixed(1)}% alocado (${stats?.server_cpu_percent.toFixed(1) || 0}% CPU)`
              : "Inativo"}
          </div>
        </div>
      </TacticalCard>

      {/* 3. Jogadores Conectados */}
      <TacticalCard title="PLAYERS ATIVOS" icon={<Users size={18} />}>
        <div className="space-y-2">
          <div className="flex items-baseline justify-between font-mono">
            <span className="text-2xl font-bold text-tactical-green">
              {playerCount}
            </span>
            <span className="text-xs text-tactical-muted">
              Capacidade: <strong className="text-white">{maxPlayers}</strong>
            </span>
          </div>

          {players.length > 0 ? (
            <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto py-1">
              {players.map((nick) => (
                <span
                  key={nick}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-green/10 border border-tactical-green/20 text-tactical-green"
                >
                  {nick}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs font-mono text-tactical-muted pt-2 border-t border-white/5 flex justify-between">
              <span>Status RCON:</span>
              <span className={rconConnected ? "text-tactical-green" : "text-tactical-muted"}>
                {rconConnected ? "Sincronizado" : "Desconectado"}
              </span>
            </div>
          )}
        </div>
      </TacticalCard>

      {/* 4. Recursos Host (PC) */}
      <TacticalCard title="RECURSOS DO HOST" icon={<Cpu size={18} />}>
        <div className="space-y-2 font-mono">
          <div className="flex justify-between items-center text-sm">
            <span className="text-tactical-muted text-xs">CPU Host:</span>
            <span className="font-bold text-tactical-text">
              {stats ? `${stats.cpu_global.toFixed(1)}%` : "0.0%"}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-tactical-muted text-xs">RAM Host:</span>
            <span className="font-bold text-tactical-text">
              {stats
                ? `${(stats.ram_global_used / 1024 / 1024 / 1024).toFixed(1)} / ${(
                    stats.ram_global_total / 1024 / 1024 / 1024
                  ).toFixed(1)} GB`
                : "-- / --"}
            </span>
          </div>
          <div className="text-[11px] text-tactical-muted pt-1 border-t border-white/5 flex justify-between">
            <span>RAM Total Usada:</span>
            <span className="text-tactical-amber font-bold">
              {stats ? `${stats.ram_global_percent.toFixed(1)}%` : "0%"}
            </span>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
};
