export type ServerStatus = "offline" | "starting" | "online" | "stopping";

export interface ServerLog {
  id: string;
  source: "stdout" | "stderr" | "rcon";
  message: string;
  timestamp: string;
}

export interface ResourceStats {
  cpu_global: number;
  ram_global_used: number;
  ram_global_total: number;
  ram_global_percent: number;
  server_ram_used: number;
  server_cpu_percent: number;
  server_running: boolean;
}

export interface DetectedMod {
  id: string;
  name: string;
  description?: string;
  workshop_id?: string;
  path: string;
  is_workshop: boolean;
}

export interface IniConfigData {
  file_path: string;
  options: Record<string, string>;
}

export interface LuaSandboxData {
  file_path: string;
  raw_content: string;
}

export type ActiveTab = "dashboard" | "console" | "monitor" | "config" | "mods" | "settings" | "diagnostics";
