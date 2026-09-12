import { create } from "zustand";
import { persist } from "zustand/middleware";
import { invoke } from "@tauri-apps/api/core";
import { ActiveTab, ResourceStats, ServerLog, ServerStatus } from "../types";

interface ServerState {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  status: ServerStatus;
  setStatus: (status: ServerStatus) => void;
  pid: number | null;
  setPid: (pid: number | null) => void;

  logs: ServerLog[];
  addLog: (source: "stdout" | "stderr" | "rcon", message: string, timestamp?: string) => void;
  clearLogs: () => void;

  stats: ResourceStats | null;
  setStats: (stats: ResourceStats) => void;

  // Ajustes Persistentes
  ram: string;
  setRam: (ram: string) => void;

  serverPath: string;
  setServerPath: (path: string) => void;

  serverName: string;
  setServerName: (name: string) => void;

  gamePort: number;
  setGamePort: (port: number) => void;

  maxPlayers: number;
  setMaxPlayers: (max: number) => void;

  rconPort: number;
  setRconPort: (port: number) => void;
  rconPassword: string;
  setRconPassword: (pwd: string) => void;
  rconConnected: boolean;
  setRconConnected: (connected: boolean) => void;

  // Discord Webhook Integrations (Persistentes)
  discordWebhook: string;
  setDiscordWebhook: (url: string) => void;
  discordRoleId: string;
  setDiscordRoleId: (id: string) => void;
  notifyOnStart: boolean;
  setNotifyOnStart: (val: boolean) => void;
  notifyOnStop: boolean;
  setNotifyOnStop: (val: boolean) => void;
  notifyOnSave: boolean;
  setNotifyOnSave: (val: boolean) => void;

  // Telemetria de Jogadores
  players: string[];
  playerCount: number;
  setPlayers: (players: string[]) => void;
  addPlayer: (nick: string) => void;
  removePlayer: (nick: string) => void;

  // Notificações Toast
  toast: { message: string; type: "success" | "error" | "info" } | null;
  showToast: (message: string, type?: "success" | "error" | "info") => void;
  hideToast: () => void;

  // Desligamento Programado (Opção 55)
  shutdownActive: boolean;
  shutdownCountdown: number | null;
  shutdownTotalSeconds: number | null;
  shutdownIncludesWindows: boolean;
  shutdownWindowsDelay: number;
  startScheduledShutdown: (minutes: number, includeWindows: boolean, windowsDelaySec?: number) => void;
  cancelScheduledShutdown: () => Promise<void>;
  tickShutdown: () => Promise<void>;

  // Ações Auxiliares
  sendDiscordWebhook: (message: string) => Promise<boolean>;
  syncFromIni: () => Promise<void>;
}

export const useServerStore = create<ServerState>()(
  persist(
    (set, get) => ({
      activeTab: "dashboard",
      setActiveTab: (tab) => set({ activeTab: tab }),

      status: "offline",
      setStatus: (status) => set({ status }),
      pid: null,
      setPid: (pid) => set({ pid }),

      logs: [],
      addLog: (source, message, timestamp) =>
        set((state) => {
          const now = timestamp || new Date().toLocaleTimeString("pt-BR", { hour12: false });
          const newEntry: ServerLog = {
            id: Math.random().toString(36).substring(2, 9),
            source,
            message,
            timestamp: now,
          };
          const updated =
            state.logs.length > 1000
              ? [...state.logs.slice(-900), newEntry]
              : [...state.logs, newEntry];
          return { logs: updated };
        }),
      clearLogs: () => set({ logs: [] }),

      stats: null,
      setStats: (stats) => set({ stats }),

      // Defaults persistentes
      ram: "16g",
      setRam: (ram) => set({ ram }),

      serverPath: "C:\\pzserver",
      setServerPath: (serverPath) => set({ serverPath }),

      serverName: "servertest",
      setServerName: (serverName) => set({ serverName }),

      gamePort: 24554,
      setGamePort: (gamePort) => set({ gamePort }),

      maxPlayers: 32,
      setMaxPlayers: (maxPlayers) => set({ maxPlayers }),

      rconPort: 27020,
      setRconPort: (rconPort) => set({ rconPort }),
      rconPassword: "8827",
      setRconPassword: (rconPassword) => set({ rconPassword }),
      rconConnected: false,
      setRconConnected: (rconConnected) => set({ rconConnected }),

      // Discord
      discordWebhook: "https://discord.com/api/webhooks/1544010454785986600/8xOLijz33qE0AKYHPPeDeGeoYkvdMJb1rdxOCbc7_IChAAmb5ShG7ZyKB8k31pework8",
      setDiscordWebhook: (discordWebhook) => set({ discordWebhook }),
      discordRoleId: "1543427396244480160",
      setDiscordRoleId: (discordRoleId) => set({ discordRoleId }),
      notifyOnStart: true,
      setNotifyOnStart: (notifyOnStart) => set({ notifyOnStart }),
      notifyOnStop: true,
      setNotifyOnStop: (notifyOnStop) => set({ notifyOnStop }),
      notifyOnSave: false,
      setNotifyOnSave: (notifyOnSave) => set({ notifyOnSave }),

      // Jogadores
      players: [],
      playerCount: 0,
      setPlayers: (players) => set({ players, playerCount: players.length }),
      addPlayer: (nick) =>
        set((state) => {
          const clean = nick.trim();
          if (!clean || state.players.includes(clean)) return state;
          const updated = [...state.players, clean];
          return { players: updated, playerCount: updated.length };
        }),
      removePlayer: (nick) =>
        set((state) => {
          const clean = nick.trim();
          const updated = state.players.filter((p) => p.toLowerCase() !== clean.toLowerCase());
          return { players: updated, playerCount: updated.length };
        }),

      // Toast
      toast: null,
      showToast: (message, type = "info") => {
        set({ toast: { message, type } });
        setTimeout(() => {
          set((s) => (s.toast?.message === message ? { toast: null } : s));
        }, 4000);
      },
      hideToast: () => set({ toast: null }),

      // Opção 55 - Desligamento Programado
      shutdownActive: false,
      shutdownCountdown: null,
      shutdownTotalSeconds: null,
      shutdownIncludesWindows: false,
      shutdownWindowsDelay: 60,

      startScheduledShutdown: (minutes: number, includeWindows: boolean, windowsDelaySec = 60) => {
        const totalSec = Math.max(10, minutes * 60);
        set({
          shutdownActive: true,
          shutdownCountdown: totalSec,
          shutdownTotalSeconds: totalSec,
          shutdownIncludesWindows: includeWindows,
          shutdownWindowsDelay: windowsDelaySec,
        });

        const { rconConnected, sendDiscordWebhook, addLog } = get();
        addLog("stdout", `[DESLIGAMENTO PROGRAMADO] Agendado para ${minutes} minutos. Inclui Windows: ${includeWindows ? "SIM" : "NÃO"}`);
        if (rconConnected) {
          invoke("rcon_execute", {
            command: `servermsg "AVISO: O servidor sera desligado em ${minutes} minuto(s) para manutencao e backup."`,
          }).catch(() => {});
        }
        sendDiscordWebhook(`⚠️ **[Aviso de Encerramento]** O servidor será desligado em **${minutes} minuto(s)** para salvamento e backup.`);
      },

      cancelScheduledShutdown: async () => {
        const { rconConnected, sendDiscordWebhook, addLog, shutdownIncludesWindows } = get();
        set({
          shutdownActive: false,
          shutdownCountdown: null,
          shutdownTotalSeconds: null,
        });

        addLog("stdout", "[DESLIGAMENTO PROGRAMADO] Cancelado pela administração.");
        if (rconConnected) {
          invoke("rcon_execute", {
            command: `servermsg "AVISO: O desligamento programado foi CANCELADO pela administracao."`,
          }).catch(() => {});
        }
        if (shutdownIncludesWindows) {
          invoke("cancel_windows_shutdown").catch(() => {});
        }
        sendDiscordWebhook("🟢 **[Cancelamento]** O desligamento programado foi abortado.");
      },

      tickShutdown: async () => {
        const state = get();
        if (!state.shutdownActive || state.shutdownCountdown === null) return;

        const next = state.shutdownCountdown - 1;
        const { rconConnected, sendDiscordWebhook, addLog, shutdownIncludesWindows, shutdownWindowsDelay } = state;

        if (next > 0) {
          set({ shutdownCountdown: next });

          // Avisos a cada minuto
          if (next > 60 && next % 60 === 0) {
            const mins = Math.floor(next / 60);
            if (rconConnected) {
              invoke("rcon_execute", {
                command: `servermsg "AVISO: O servidor sera desligado em ${mins} minuto(s)."`,
              }).catch(() => {});
            }
          }
          // Avisos nos momentos críticos
          else if (next === 60) {
            if (rconConnected) {
              invoke("rcon_execute", {
                command: `servermsg "ATENCAO: Servidor desligando em 60 segundos! Encontre um local seguro."`,
              }).catch(() => {});
            }
            sendDiscordWebhook("⏳ **[Último Aviso]** O servidor de Project Zomboid será desligado em **60 segundos**.");
          } else if (next === 30) {
            if (rconConnected) {
              invoke("rcon_execute", {
                command: `servermsg "ATENCAO: 30 segundos restantes para encerramento!"`,
              }).catch(() => {});
            }
          } else if (next === 15) {
            if (rconConnected) {
              invoke("rcon_execute", {
                command: `servermsg "ATENCAO: 15 segundos restantes!"`,
              }).catch(() => {});
            }
          } else if (next <= 10 && next >= 1) {
            if (rconConnected) {
              invoke("rcon_execute", {
                command: `servermsg "Desligando em ${next}..."`,
              }).catch(() => {});
            }
          }
        } else {
          // Zero atingido! Executa salvamento, backup e encerramento
          set({ shutdownActive: false, shutdownCountdown: 0 });
          addLog("stdout", "[DESLIGAMENTO PROGRAMADO] Tempo esgotado. Iniciando rotina de encerramento seguro...");

          if (rconConnected) {
            try {
              await invoke("rcon_execute", {
                command: `servermsg "SALVANDO MUNDO E CRIANDO BACKUP AGORA..."`,
              });
              await invoke("rcon_execute", { command: "save" });
              addLog("stdout", "[DESLIGAMENTO PROGRAMADO] Mundo salvo via RCON.");
            } catch (e) {
              console.warn("Erro ao salvar RCON no shutdown:", e);
            }
          }

          // Criação de Backup
          try {
            addLog("stdout", "[DESLIGAMENTO PROGRAMADO] Criando snapshot de backup do servidor...");
            const backupPath: string = await invoke("create_backup");
            addLog("stdout", `[BACKUP CRIADO] ${backupPath}`);
          } catch (e) {
            addLog("stderr", `[FALHA NO BACKUP] ${e}`);
          }

          // Encerra servidor gracioso
          if (rconConnected) {
            try {
              await invoke("rcon_execute", { command: "quit" });
            } catch (e) {
              console.warn("Erro ao enviar quit:", e);
            }
          }
          await invoke("stop_server").catch(() => {});
          set({ shutdownCountdown: null });

          sendDiscordWebhook("🛑 **[Servidor Desligado]** Rotina de encerramento programado e backup concluída com sucesso.");

          // Se incluir Windows
          if (shutdownIncludesWindows) {
            addLog("stdout", `[WINDOWS SHUTDOWN] Agendando desligamento do Windows em ${shutdownWindowsDelay} segundos...`);
            try {
              await invoke("schedule_windows_shutdown", { seconds: shutdownWindowsDelay });
              sendDiscordWebhook(`💻 **[Windows Shutdown]** A máquina física será desligada em **${shutdownWindowsDelay} segundos**.`);
            } catch (e) {
              addLog("stderr", `[ERRO WINDOWS SHUTDOWN] ${e}`);
            }
          }
        }
      },

      // Disparo de Webhook para Discord
      sendDiscordWebhook: async (message: string) => {
        const { discordWebhook, discordRoleId } = get();
        if (!discordWebhook || !discordWebhook.trim()) return false;
        try {
          const mention =
            discordRoleId && discordRoleId.trim() ? `<@&${discordRoleId.trim()}> ` : "";
          const payload = {
            content: `${mention}${message}`,
            username: "PZ Server Manager",
          };
          await fetch(discordWebhook.trim(), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          return true;
        } catch (err) {
          console.error("Erro ao enviar webhook Discord:", err);
          return false;
        }
      },

      // Sincronização automática com servertest.ini
      syncFromIni: async () => {
        try {
          const res: any = await invoke("read_ini", { customPath: null });
          if (res && res.options) {
            const opts = res.options;
            const updates: Partial<ServerState> = {};
            if (opts["RCONPort"]) {
              const p = parseInt(opts["RCONPort"], 10);
              if (p) updates.rconPort = p;
            }
            if (opts["RCONPassword"]) {
              updates.rconPassword = opts["RCONPassword"];
            }
            if (opts["DefaultPort"]) {
              const dp = parseInt(opts["DefaultPort"], 10);
              if (dp) updates.gamePort = dp;
            }
            if (opts["MaxPlayers"]) {
              const mp = parseInt(opts["MaxPlayers"], 10);
              if (mp) updates.maxPlayers = mp;
            }
            set(updates);
          }
        } catch (err) {
          console.warn("Autodetect de servertest.ini:", err);
        }
      },
    }),
    {
      name: "pz-server-manager-settings",
      partialize: (state) => ({
        serverPath: state.serverPath,
        serverName: state.serverName,
        ram: state.ram,
        gamePort: state.gamePort,
        maxPlayers: state.maxPlayers,
        rconPort: state.rconPort,
        rconPassword: state.rconPassword,
        discordWebhook: state.discordWebhook,
        discordRoleId: state.discordRoleId,
        notifyOnStart: state.notifyOnStart,
        notifyOnStop: state.notifyOnStop,
        notifyOnSave: state.notifyOnSave,
      }),
    }
  )
);
