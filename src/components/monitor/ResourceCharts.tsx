import React, { useEffect, useState } from "react";
import { Cpu, HardDrive, Package, Server } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalCard } from "../ui/TacticalCard";
import { invoke } from "@tauri-apps/api/core";

export const ResourceCharts: React.FC = () => {
  const { stats } = useServerStore();
  const [activeMods, setActiveMods] = useState<string[]>([]);
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(20).fill(0));

  // Histórico de CPU
  useEffect(() => {
    if (stats) {
      setCpuHistory((prev) => [...prev.slice(1), Math.round(stats.cpu_global)]);
    }
  }, [stats]);

  // Lê mods ativos do servertest.ini para exibir os badges
  useEffect(() => {
    const loadIniMods = async () => {
      try {
        const res: any = await invoke("read_ini");
        if (res && res.options && res.options["Mods"]) {
          const rawMods = res.options["Mods"];
          const list = rawMods
            .split(";")
            .map((m: string) => m.trim())
            .filter((m: string) => m.length > 0);
          setActiveMods(list);
        }
      } catch {
        // se não encontrar ini local, ignora
      }
    };
    loadIniMods();
  }, []);

  const totalRamGB = stats ? (stats.ram_global_total / 1024 / 1024 / 1024).toFixed(1) : "0";
  const usedRamGB = stats ? (stats.ram_global_used / 1024 / 1024 / 1024).toFixed(1) : "0";
  const serverRamMB = stats ? (stats.server_ram_used / 1024 / 1024).toFixed(0) : "0";
  const serverRamGB = stats ? (stats.server_ram_used / 1024 / 1024 / 1024).toFixed(2) : "0";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU Global */}
        <TacticalCard
          title="USO DE CPU DO HOST"
          subtitle="Carga geral do processador"
          icon={<Cpu size={18} />}
          badge={
            <span className="text-xs font-mono font-bold text-tactical-amber">
              {stats ? `${stats.cpu_global.toFixed(1)}%` : "0%"}
            </span>
          }
        >
          <div className="space-y-4">
            {/* Gráfico Sparkline em Barras */}
            <div className="flex items-end space-x-1 h-28 pt-4 pb-2 border-b border-white/5">
              {cpuHistory.map((val, idx) => (
                <div
                  key={idx}
                  className="flex-1 bg-tactical-amber/20 hover:bg-tactical-amber/40 rounded-t transition-all duration-300 relative group"
                  style={{ height: `${Math.max(6, val)}%` }}
                >
                  <div
                    className="w-full bg-tactical-amber rounded-t transition-all"
                    style={{ height: `${Math.min(100, val)}%` }}
                  />
                </div>
              ))}
            </div>
            <p className="text-[11px] font-mono text-tactical-muted text-right">
              Atualização a cada 1.5s via sysinfo
            </p>
          </div>
        </TacticalCard>

        {/* RAM Global do PC */}
        <TacticalCard
          title="MEMÓRIA RAM GLOBAL"
          subtitle="Memória física do sistema operacional"
          icon={<HardDrive size={18} />}
          badge={
            <span className="text-xs font-mono font-bold text-tactical-green">
              {stats ? `${stats.ram_global_percent.toFixed(0)}%` : "0%"}
            </span>
          }
        >
          <div className="space-y-4 pt-2">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-3xl font-bold text-white">
                {usedRamGB} <span className="text-xs text-tactical-muted">GB Usado</span>
              </span>
              <span className="text-xs text-tactical-muted">
                Total: <strong className="text-white">{totalRamGB} GB</strong>
              </span>
            </div>

            <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden border border-white/10 p-0.5">
              <div
                className="h-full bg-tactical-green rounded-full shadow-green-glow transition-all duration-500"
                style={{ width: `${stats ? stats.ram_global_percent : 0}%` }}
              />
            </div>

            <div className="flex justify-between text-xs font-mono text-tactical-muted pt-2 border-t border-white/5">
              <span>Disponível:</span>
              <span className="text-tactical-text">
                {stats
                  ? (
                      (stats.ram_global_total - stats.ram_global_used) /
                      1024 /
                      1024 /
                      1024
                    ).toFixed(1)
                  : "0"}{" "}
                GB
              </span>
            </div>
          </div>
        </TacticalCard>

        {/* Processo do Servidor (Java) */}
        <TacticalCard
          title="PROCESSO DEDICADO PZ"
          subtitle="java.exe (zombie.network.GameServer)"
          icon={<Server size={18} />}
          badge={
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full ${
                stats?.server_running
                  ? "bg-tactical-green/20 text-tactical-green border border-tactical-green/40"
                  : "bg-white/10 text-tactical-muted"
              }`}
            >
              {stats?.server_running ? "PROCESS RUNNING" : "INATIVO"}
            </span>
          }
        >
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-baseline font-mono">
              <span className="text-3xl font-bold text-tactical-amber">
                {serverRamGB} <span className="text-xs text-tactical-muted">GB</span>
              </span>
              <span className="text-xs text-tactical-muted">
                ({serverRamMB} MB alocados)
              </span>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-tactical-muted">Uso de CPU da JVM:</span>
                <span className="text-white font-bold">
                  {stats ? `${stats.server_cpu_percent.toFixed(1)}%` : "0%"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-tactical-muted">Engine:</span>
                <span className="text-tactical-text">Java OpenJDK 64-bit</span>
              </div>
            </div>
          </div>
        </TacticalCard>
      </div>

      {/* Grade de Mods Ativos (como Chips/Badges) */}
      <TacticalCard
        title="MODS ATIVOS NO SERVIDOR"
        subtitle={`Total de ${activeMods.length} mods carregados a partir da chave Mods= do servertest.ini`}
        icon={<Package size={18} />}
      >
        {activeMods.length === 0 ? (
          <p className="text-xs font-mono text-tactical-muted/60 italic py-4 text-center">
            Nenhum mod configurado ou arquivo servertest.ini ainda não lido.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2">
            {activeMods.map((mod, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-white/5 border border-white/10 text-tactical-text hover:border-tactical-amber/50 transition-colors"
              >
                <span className="text-tactical-amber/70 mr-1.5 font-bold">#{i + 1}</span>
                {mod}
              </span>
            ))}
          </div>
        )}
      </TacticalCard>
    </div>
  );
};
