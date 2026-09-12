import React, { useEffect, useState } from "react";
import { Code, RefreshCw, Save, Sliders } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { invoke } from "@tauri-apps/api/core";

export const SandboxConfigEditor: React.FC = () => {
  const { showToast, addLog } = useServerStore();
  const [rawLua, setRawLua] = useState("");
  const [filePath, setFilePath] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadSandbox = async () => {
    try {
      setIsLoading(true);
      const res: any = await invoke("read_sandbox");
      if (res && res.raw_content) {
        setRawLua(res.raw_content);
        setFilePath(res.file_path);
        showToast("Arquivo de Sandbox carregado com sucesso.", "success");
      }
    } catch (e: any) {
      showToast(`Aviso: ${e}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSandbox();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const savedPath: string = await invoke("save_sandbox", { content: rawLua });
      showToast("Variáveis de Sandbox salvas com backup .lua.bak!", "success");
      addLog("stdout", `[SANDBOX LUA] Arquivo salvo em: ${savedPath}`);
    } catch (e: any) {
      showToast(`Erro ao salvar Sandbox: ${e}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 tactical-glass rounded-2xl border border-white/10">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
            <Sliders size={18} className="text-tactical-amber" />
            <span>EDITOR DE SANDBOX (servertest_SandboxVars.lua)</span>
          </h2>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Arquivo: {filePath || "%USERPROFILE%\\Zomboid\\Server\\servertest_SandboxVars.lua"}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <TacticalButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={loadSandbox}
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
            Salvar Sandbox
          </TacticalButton>
        </div>
      </div>

      {/* Editor Container */}
      <div className="tactical-glass p-4 rounded-2xl border border-white/10">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10 text-xs font-mono text-tactical-muted">
          <span className="flex items-center space-x-1.5">
            <Code size={14} className="text-tactical-amber" />
            <span>EDITOR DE TABELAS LUA (VANILLA + 80+ MODS)</span>
          </span>
          <span>{rawLua.split("\n").length} linhas</span>
        </div>

        <textarea
          value={rawLua}
          onChange={(e) => setRawLua(e.target.value)}
          rows={26}
          placeholder="Carregando tabela SandboxVars = { ... }..."
          className="w-full bg-[#08090A] text-tactical-text p-4 rounded-xl font-mono text-xs leading-relaxed border border-white/10 focus:border-tactical-amber focus:outline-none select-text resize-none"
          spellCheck={false}
        />

        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 text-[11px] font-mono text-tactical-muted">
          <span>* Toda gravação gera automaticamente uma cópia de segurança .lua.bak</span>
          <span>Sintaxe: Lua 5.1 / Project Zomboid DSL</span>
        </div>
      </div>
    </div>
  );
};
