import React, { useState } from "react";
import {
  Archive,
  FolderOpen,
  PowerOff,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalCard } from "../ui/TacticalCard";
import { TacticalInput } from "../ui/TacticalInput";
import { TacticalModal } from "../ui/TacticalModal";
import { invoke } from "@tauri-apps/api/core";

export const MaintenanceCards: React.FC = () => {
  const { showToast, addLog } = useServerStore();

  const [isWipeModalOpen, setIsWipeModalOpen] = useState(false);
  const [wipeConfirmText, setWipeConfirmText] = useState("");
  const [isWiping, setIsWiping] = useState(false);

  const handleBackup = async () => {
    try {
      showToast("Criando backup com timestamp...", "info");
      addLog("stdout", "[BACKUP] Iniciando cópia de segurança de Server/ e Saves/Multiplayer...");
      const backupPath: string = await invoke("create_backup");
      showToast("Backup concluído com sucesso!", "success");
      addLog("stdout", `[BACKUP CONCLUÍDO] Pasta: ${backupPath}`);
    } catch (e: any) {
      showToast(`Erro no backup: ${e}`, "error");
      addLog("stderr", `[ERRO BACKUP] ${e}`);
    }
  };

  const handleOpenFolder = async (target: string) => {
    try {
      await invoke("open_folder", { target });
      showToast("Pasta aberta no Windows Explorer.", "info");
    } catch (e: any) {
      showToast(`Erro ao abrir pasta: ${e}`, "error");
    }
  };

  const handleCancelShutdown = async () => {
    try {
      const res: string = await invoke("cancel_windows_shutdown");
      showToast(res, "success");
      addLog("stdout", `[SISTEMA] ${res}`);
    } catch (e: any) {
      showToast(String(e), "error");
    }
  };

  const handleWipeConfirm = async () => {
    if (wipeConfirmText.trim() !== "CONFIRMAR") {
      showToast("Digite exatamente 'CONFIRMAR' para prosseguir.", "error");
      return;
    }
    try {
      setIsWiping(true);
      addLog("stdout", "[WIPE] Executando reset do mundo multiplayer...");
      await invoke("wipe_world", { confirmation: wipeConfirmText });
      showToast("Wipe do mundo concluído! Saves resetados.", "success");
      addLog("stdout", "[WIPE CONCLUÍDO] A pasta Saves/Multiplayer foi recriada vazia.");
      setIsWipeModalOpen(false);
      setWipeConfirmText("");
    } catch (e: any) {
      showToast(`Erro no wipe: ${e}`, "error");
      addLog("stderr", `[ERRO WIPE] ${e}`);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <>
      <TacticalCard
        title="AÇÕES RÁPIDAS DE MANUTENÇÃO"
        subtitle="Ferramentas herdadas do Zomboid.bat e atalhos operacionais"
        icon={<Archive size={18} />}
        className="mb-6"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Backup */}
          <TacticalButton
            variant="secondary"
            size="md"
            icon={<Archive size={16} />}
            onClick={handleBackup}
            className="w-full justify-start"
          >
            Fazer Backup
          </TacticalButton>

          {/* Abrir Pasta Server */}
          <TacticalButton
            variant="secondary"
            size="md"
            icon={<FolderOpen size={16} />}
            onClick={() => handleOpenFolder("server_config")}
            className="w-full justify-start"
          >
            Pasta do Servidor
          </TacticalButton>

          {/* Abrir Pasta Backups */}
          <TacticalButton
            variant="secondary"
            size="md"
            icon={<FolderOpen size={16} />}
            onClick={() => handleOpenFolder("backups")}
            className="w-full justify-start"
          >
            Pasta de Backups
          </TacticalButton>

          {/* Cancelar Desligamento */}
          <TacticalButton
            variant="secondary"
            size="md"
            icon={<PowerOff size={16} />}
            onClick={handleCancelShutdown}
            className="w-full justify-start"
          >
            Abortar Shutdown
          </TacticalButton>

          {/* Wipe do Mundo (Ação Crítica) */}
          <TacticalButton
            variant="danger"
            size="md"
            icon={<Trash2 size={16} />}
            onClick={() => setIsWipeModalOpen(true)}
            className="w-full justify-start font-semibold"
          >
            Wipe do Mundo
          </TacticalButton>
        </div>
      </TacticalCard>

      {/* Modal de Confirmação Extrema de Wipe */}
      <TacticalModal
        isOpen={isWipeModalOpen}
        onClose={() => {
          setIsWipeModalOpen(false);
          setWipeConfirmText("");
        }}
        title="WIPE TOTAL DO MUNDO MULTIPLAYER"
        subtitle="AÇÃO DESTRUTIVA IRREVERSÍVEL"
        icon={<ShieldAlert size={20} />}
        isDestructive={true}
        primaryActionLabel="APAGAR MUNDO DEFINITIVAMENTE"
        onPrimaryAction={handleWipeConfirm}
        isLoading={isWiping}
        disablePrimary={wipeConfirmText !== "CONFIRMAR"}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-tactical-red/15 border border-tactical-red/30 text-tactical-red text-xs leading-relaxed font-mono">
            <strong>ATENÇÃO:</strong> Esta ação apagará todos os arquivos de progresso,
            construções e itens da pasta <code>Zomboid\Saves\Multiplayer</code>. Todos os
            jogadores perderão o mundo atual.
          </div>

          <p className="text-xs text-tactical-text">
            Para autorizar esta operação crítica, digite a palavra{" "}
            <strong className="text-tactical-red font-mono font-bold">CONFIRMAR</strong> no
            campo abaixo:
          </p>

          <TacticalInput
            placeholder="Digite CONFIRMAR"
            value={wipeConfirmText}
            onChange={(e) => setWipeConfirmText(e.target.value)}
            className="text-center font-bold tracking-widest text-tactical-red"
            autoFocus
          />
        </div>
      </TacticalModal>
    </>
  );
};
