import React, { useEffect, useState } from "react";
import { RefreshCw, Save, Search, Sliders } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalInput } from "../ui/TacticalInput";
import { TacticalSwitch } from "../ui/TacticalSwitch";
import { invoke } from "@tauri-apps/api/core";

export const IniConfigEditor: React.FC = () => {
  const { showToast, addLog } = useServerStore();
  const [options, setOptions] = useState<Record<string, string>>({});
  const [filePath, setFilePath] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<string>("identidade");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadIni = async () => {
    try {
      setIsLoading(true);
      const data: any = await invoke("read_ini");
      if (data && data.options) {
        setOptions(data.options);
        setFilePath(data.file_path);
        showToast("Configurações do servertest.ini carregadas com sucesso.", "success");
      }
    } catch (e: any) {
      showToast(`Aviso: ${e}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIni();
  }, []);

  const handleOptionChange = (key: string, value: string) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const savedPath: string = await invoke("save_ini", { data: options });
      showToast("Configurações salvas e backup .bak gerado com sucesso!", "success");
      addLog("stdout", `[CONFIG INI] Arquivo salvo em: ${savedPath}`);
    } catch (e: any) {
      showToast(`Erro ao salvar INI: ${e}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const sections: { id: string; label: string; keys: string[] }[] = [
    {
      id: "identidade",
      label: "Identidade & Mensagens",
      keys: ["PublicName", "PublicDescription", "Public", "ServerWelcomeMessage", "Map"],
    },
    {
      id: "rede",
      label: "Rede & Acesso",
      keys: [
        "DefaultPort",
        "UDPPort",
        "Open",
        "MaxPlayers",
        "PingLimit",
        "DenyLoginOnOverloadedServer",
        "MaxPacketsPerSecond",
      ],
    },
    {
      id: "rcon",
      label: "Protocolo RCON",
      keys: ["RCONPort", "RCONPassword"],
    },
    {
      id: "pvp",
      label: "PvP & Segurança",
      keys: [
        "PVP",
        "SafetySystem",
        "ShowSafety",
        "PVPMeleeDamageModifier",
        "PVPFirearmDamageModifier",
        "PlayerBumpPlayer",
      ],
    },
    {
      id: "safehouse",
      label: "Safehouses (Abrigos)",
      keys: [
        "PlayerSafehouse",
        "AdminSafehouse",
        "SafehouseAllowTrepass",
        "SafehouseAllowFire",
        "SafehouseAllowLoot",
        "SafehouseAllowRespawn",
        "SafehouseDaySurvivedToClaim",
      ],
    },
    {
      id: "discord",
      label: "Discord Nativo",
      keys: [
        "DiscordEnable",
        "DiscordToken",
        "DiscordChatChannel",
        "DiscordLogChannel",
      ],
    },
    {
      id: "sistema",
      label: "Mundo & Persistência",
      keys: [
        "SaveWorldEveryMinutes",
        "PauseEmpty",
        "FastForwardMultiplier",
        "BackupsCount",
        "BackupsOnStart",
        "BackupsPeriod",
        "DoLuaChecksum",
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 tactical-glass rounded-2xl border border-white/10">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
            <Sliders size={18} className="text-tactical-amber" />
            <span>CONFIGURAÇÃO GERAL (servertest.ini)</span>
          </h2>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Arquivo: {filePath || "%USERPROFILE%\\Zomboid\\Server\\servertest.ini"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <TacticalButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={loadIni}
            isLoading={isLoading}
          >
            Recarregar
          </TacticalButton>

          <TacticalButton
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSave}
            isLoading={isSaving}
          >
            Salvar no Servidor
          </TacticalButton>
        </div>
      </div>

      {/* Main Grid: Categories on Left, Fields on Right */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Sections Sidebar */}
        <div className="space-y-1 tactical-glass p-3 rounded-2xl border border-white/10">
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-tactical-muted" />
            <input
              type="text"
              placeholder="Buscar chave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 text-tactical-text text-xs rounded-xl pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-tactical-amber font-mono"
            />
          </div>

          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveSection(s.id);
                setSearchTerm("");
              }}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-mono transition-colors ${
                activeSection === s.id && !searchTerm
                  ? "bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/30 font-bold"
                  : "text-tactical-muted hover:text-white hover:bg-white/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Fields Panel */}
        <div className="md:col-span-3 tactical-glass p-6 rounded-2xl border border-white/10 max-h-[calc(100vh-16rem)] overflow-y-auto space-y-4">
          {(() => {
            const currentKeys = searchTerm
              ? Object.keys(options).filter((k) =>
                  k.toLowerCase().includes(searchTerm.toLowerCase())
                )
              : sections.find((s) => s.id === activeSection)?.keys || [];

            if (currentKeys.length === 0) {
              return (
                <div className="py-12 text-center text-tactical-muted font-mono text-xs">
                  Nenhuma chave de configuração encontrada para o filtro atual.
                </div>
              );
            }

            return currentKeys.map((key) => {
              const val = options[key] !== undefined ? options[key] : "";
              const isBool = val === "true" || val === "false";
              const isPassword = key.toLowerCase().includes("password") || key.toLowerCase().includes("token");

              return (
                <div
                  key={key}
                  className="p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {isBool ? (
                    <TacticalSwitch
                      checked={val === "true"}
                      onChange={(checked) => handleOptionChange(key, checked ? "true" : "false")}
                      label={key}
                      description={`Chave booleana do servertest.ini`}
                      color="amber"
                    />
                  ) : (
                    <TacticalInput
                      label={key}
                      type={isPassword ? "password" : "text"}
                      value={val}
                      onChange={(e) => handleOptionChange(key, e.target.value)}
                    />
                  )}
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
};
