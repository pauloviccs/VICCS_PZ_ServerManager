import React, { useState } from "react";
import {
  Clock,
  HardDrive,
  Power,
  ShieldAlert,
  XCircle,
  Play,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalModal } from "../ui/TacticalModal";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalInput } from "../ui/TacticalInput";
import { TacticalSwitch } from "../ui/TacticalSwitch";

interface ScheduledShutdownModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduledShutdownModal: React.FC<ScheduledShutdownModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    shutdownActive,
    shutdownCountdown,
    shutdownIncludesWindows,
    startScheduledShutdown,
    cancelScheduledShutdown,
    rconConnected,
    showToast,
  } = useServerStore();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(10);
  const [customInput, setCustomInput] = useState<string>("10");
  const [includeWindows, setIncludeWindows] = useState<boolean>(false);
  const [windowsDelaySec, setWindowsDelaySec] = useState<number>(60);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  if (!isOpen) return null;

  const presets = [
    { label: "5 min", value: 5 },
    { label: "10 min", value: 10 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hora", value: 60 },
    { label: "2 horas", value: 120 },
  ];

  const handleSelectPreset = (mins: number) => {
    setSelectedMinutes(mins);
    setCustomInput(mins.toString());
  };

  const handleCustomChange = (val: string) => {
    setCustomInput(val);
    const parsed = parseInt(val, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setSelectedMinutes(parsed);
    }
  };

  const handleStart = () => {
    if (!rconConnected) {
      showToast("Aviso: RCON desconectado. Os avisos in-game não serão emitidos.", "info");
    }
    if (selectedMinutes <= 0) {
      showToast("Selecione um tempo válido maior que 0 minutos.", "error");
      return;
    }

    startScheduledShutdown(selectedMinutes, includeWindows, windowsDelaySec);
    showToast(`Desligamento programado iniciado para daqui a ${selectedMinutes} minutos!`, "success");
    onClose();
  };

  const handleAbort = async () => {
    setIsCancelling(true);
    await cancelScheduledShutdown();
    setIsCancelling(false);
    showToast("Desligamento programado foi abortado com sucesso.", "info");
    onClose();
  };

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="OPÇÃO 55: ENCERRAMENTO PROGRAMADO DO SERVIDOR"
      maxWidth="max-w-xl"
    >
      <div className="space-y-5">
        {/* Status Ativo de Contagem Regressiva */}
        {shutdownActive && shutdownCountdown !== null ? (
          <div className="p-4 rounded-xl bg-tactical-red/10 border border-tactical-red/30 space-y-3">
            <div className="flex items-center space-x-2 text-tactical-red">
              <ShieldAlert size={20} className="animate-pulse" />
              <span className="text-xs font-mono font-bold tracking-wider uppercase">
                DESLIGAMENTO ATIVO EM ANDAMENTO
              </span>
            </div>

            <div className="text-center py-3 bg-black/40 rounded-lg border border-tactical-red/20">
              <div className="text-4xl font-mono font-bold text-tactical-red tracking-widest animate-pulse">
                {formatCountdown(shutdownCountdown)}
              </div>
              <p className="text-[11px] font-mono text-tactical-muted mt-1">
                {shutdownIncludesWindows
                  ? "Servidor e Máquina Windows serão desligados após contagem e backup"
                  : "Servidor será salvo e finalizado após contagem"}
              </p>
            </div>

            <TacticalButton
              variant="danger"
              size="md"
              className="w-full justify-center"
              icon={<XCircle size={16} />}
              onClick={handleAbort}
              isLoading={isCancelling}
            >
              ABORTAR / CANCELAR DESLIGAMENTO
            </TacticalButton>
          </div>
        ) : (
          <>
            {/* Escolha do Tempo */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-tactical-muted flex items-center space-x-1.5">
                <Clock size={14} className="text-tactical-amber" />
                <span>SELECIONE O TEMPO ATÉ O ENCERRAMENTO:</span>
              </label>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPreset(preset.value)}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all ${
                      selectedMinutes === preset.value
                        ? "bg-tactical-amber/20 text-tactical-amber border border-tactical-amber/40 shadow-amber-glow/20"
                        : "bg-[#12141A] text-tactical-muted border border-white/10 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <TacticalInput
                  label="Ou digite o tempo personalizado (em minutos):"
                  type="number"
                  value={customInput}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  helperText="Exemplo: 10 para dez minutos, 90 para 1h30m"
                />
              </div>
            </div>

            {/* Opção Windows Shutdown */}
            <div className="p-3.5 rounded-xl bg-[#12141A] border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <Power size={14} className="text-tactical-red" />
                    <span className="text-xs font-mono font-bold text-white">
                      Desligar também o Windows
                    </span>
                  </div>
                  <p className="text-[11px] text-tactical-muted">
                    Executa o comando nativo 'shutdown /s' do Windows com atraso seguro
                  </p>
                </div>
                <TacticalSwitch
                  checked={includeWindows}
                  onChange={setIncludeWindows}
                />
              </div>

              {includeWindows && (
                <div className="pt-2 border-t border-white/5">
                  <TacticalInput
                    label="Atraso do desligamento do Windows após servidor fechar (segundos):"
                    type="number"
                    value={windowsDelaySec.toString()}
                    onChange={(e) => setWindowsDelaySec(parseInt(e.target.value, 10) || 60)}
                    helperText="Tempo para o Windows fechar serviços e arquivos com folga (Padrão: 60s)"
                  />
                </div>
              )}
            </div>

            {/* Caixa Explicativa da Rotina Segura */}
            <div className="p-3.5 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-tactical-muted text-xs font-mono">
              <div className="text-tactical-cyan font-bold flex items-center space-x-1.5">
                <HardDrive size={14} />
                <span>FLUXO DE SEGURANÇA EXECUTADO AO ZERAR:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-tactical-text pl-1">
                <li>Avisos in-game globais periódicos a cada minuto e contagem nos últimos 60s.</li>
                <li>Envio de notificação de alerta para o canal do Discord.</li>
                <li>Comando RCON <code className="text-tactical-amber">save</code> para persistir todo o progresso do mapa.</li>
                <li>Criação de Backup completo e seguro com data e hora.</li>
                <li>Comando RCON <code className="text-tactical-amber">quit</code> para encerrar o processo Java sem corrupção.</li>
                {includeWindows && (
                  <li className="text-tactical-red">
                    Comando <code className="text-tactical-red">shutdown /s /t {windowsDelaySec}</code> disparado no Windows.
                  </li>
                )}
              </ol>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <TacticalButton variant="secondary" onClick={onClose}>
                Cancelar
              </TacticalButton>
              <TacticalButton
                variant="primary"
                icon={<Play size={14} fill="currentColor" />}
                onClick={handleStart}
              >
                Engatilhar Desligamento ({selectedMinutes}m)
              </TacticalButton>
            </div>
          </>
        )}
      </div>
    </TacticalModal>
  );
};
