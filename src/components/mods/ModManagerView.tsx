import React, { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { DetectedMod } from "../../types";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalCard } from "../ui/TacticalCard";
import { invoke } from "@tauri-apps/api/core";

export const ModManagerView: React.FC = () => {
  const { showToast, addLog } = useServerStore();
  const [detectedMods, setDetectedMods] = useState<DetectedMod[]>([]);
  const [activeMods, setActiveMods] = useState<{ id: string; workshopId?: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      // 1. Escaneia mods do disco
      const detected: DetectedMod[] = await invoke("scan_all_mods", {
        workshopDir: null,
        localDir: null,
      });
      setDetectedMods(detected);

      // 2. Lê mods do INI
      const iniData: any = await invoke("read_ini");
      if (iniData && iniData.options) {
        const rawMods = iniData.options["Mods"] || "";
        const rawWorkshop = iniData.options["WorkshopItems"] || "";

        const modList = rawMods
          .split(";")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        const workshopList = rawWorkshop
          .split(";")
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        const combined = modList.map((modId: string, idx: number) => {
          const found = detected.find((d) => d.id === modId);
          return {
            id: modId,
            workshopId: found?.workshop_id || workshopList[idx] || undefined,
          };
        });

        setActiveMods(combined);
      }
      showToast(`Varredura concluída: ${detected.length} mods detectados.`, "info");
    } catch (e: any) {
      showToast(`Aviso ao carregar mods: ${e}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddMod = (mod: DetectedMod) => {
    if (activeMods.some((m) => m.id === mod.id)) {
      showToast(`O mod '${mod.name}' já está ativado.`, "info");
      return;
    }
    setActiveMods((prev) => [...prev, { id: mod.id, workshopId: mod.workshop_id }]);
    showToast(`Mod '${mod.name}' adicionado à lista de ativos.`, "success");
  };

  const handleRemoveMod = (id: string) => {
    setActiveMods((prev) => prev.filter((m) => m.id !== id));
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setActiveMods((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index >= activeMods.length - 1) return;
    setActiveMods((prev) => {
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleSaveToIni = async () => {
    try {
      setIsSaving(true);
      // Separa estritamente Mods= (nomes) e WorkshopItems= (apenas IDs numéricos únicos)
      const modsValue = activeMods.map((m) => m.id).join(";");
      const workshopIds = Array.from(
        new Set(
          activeMods
            .map((m) => m.workshopId)
            .filter((w) => w && /^\d+$/.test(w))
        )
      ).join(";");

      const currentIni: any = await invoke("read_ini");
      const updatedOptions = { ...currentIni.options };
      updatedOptions["Mods"] = modsValue;
      updatedOptions["WorkshopItems"] = workshopIds;

      await invoke("save_ini", { data: updatedOptions });
      showToast("Mods e WorkshopItems gravados com sucesso no servertest.ini!", "success");
      addLog("stdout", `[MODS SALVOS] Total: ${activeMods.length} mods ativos gravados.`);
    } catch (e: any) {
      showToast(`Erro ao salvar mods no INI: ${e}`, "error");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredDetected = detectedMods.filter((m) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(term) ||
      m.id.toLowerCase().includes(term) ||
      (m.workshop_id && m.workshop_id.includes(term))
    );
  });

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 tactical-glass rounded-2xl border border-white/10">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
            <Package size={18} className="text-tactical-amber" />
            <span>GERENCIADOR TÁTICO DE MODS & WORKSHOP</span>
          </h2>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Sincronização estrita de Mods= e WorkshopItems= para evitar falhas de carregamento
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <TacticalButton
            variant="ghost"
            size="sm"
            icon={<RefreshCw size={14} />}
            onClick={loadData}
            isLoading={isLoading}
          >
            Re-escanear
          </TacticalButton>

          <TacticalButton
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSaveToIni}
            isLoading={isSaving}
          >
            Salvar no Servidor
          </TacticalButton>
        </div>
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Detected Mods */}
        <TacticalCard
          title="MODS DISPONÍVEIS NO DISCO"
          subtitle={`${detectedMods.length} encontrados na pasta do Workshop e mods locais`}
          icon={<Package size={18} />}
          badge={
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-tactical-muted">
              {filteredDetected.length} exibidos
            </span>
          }
        >
          {/* Search */}
          <div className="relative mb-3">
            <Search size={14} className="absolute left-3 top-2.5 text-tactical-muted" />
            <input
              type="text"
              placeholder="Buscar por nome, id ou workshop id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/40 text-tactical-text text-xs rounded-xl pl-8 pr-3 py-2 border border-white/10 focus:outline-none focus:border-tactical-amber font-mono"
            />
          </div>

          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto space-y-2 pr-1">
            {filteredDetected.length === 0 ? (
              <p className="text-xs font-mono text-tactical-muted italic text-center py-8">
                Nenhum mod detectado no disco com os critérios atuais.
              </p>
            ) : (
              filteredDetected.map((mod) => {
                const isAlreadyActive = activeMods.some((m) => m.id === mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isAlreadyActive
                        ? "bg-black/20 border-white/5 opacity-50"
                        : "bg-black/40 border-white/10 hover:border-tactical-amber/40 hover:bg-black/60"
                    }`}
                  >
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-tactical-text truncate">
                          {mod.name}
                        </span>
                        {mod.workshop_id && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-tactical-amber/10 border border-tactical-amber/30 text-tactical-amber">
                            ID: {mod.workshop_id}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] font-mono text-tactical-muted truncate mt-0.5">
                        id: {mod.id}
                      </p>
                    </div>

                    <TacticalButton
                      variant={isAlreadyActive ? "ghost" : "secondary"}
                      size="sm"
                      icon={<Plus size={14} />}
                      onClick={() => handleAddMod(mod)}
                      disabled={isAlreadyActive}
                    >
                      {isAlreadyActive ? "Ativado" : "Adicionar"}
                    </TacticalButton>
                  </div>
                );
              })
            )}
          </div>
        </TacticalCard>

        {/* Right Column: Active Mods (Ordered) */}
        <TacticalCard
          title="MODS ATIVOS NO SERVIDOR"
          subtitle="A ordem da lista determina a sequência de carregamento do PZ"
          icon={<Package size={18} />}
          badge={
            <span className="text-xs font-mono font-bold text-tactical-green">
              {activeMods.length} ATIVOS
            </span>
          }
        >
          <div className="max-h-[calc(100vh-17rem)] overflow-y-auto space-y-2 pr-1">
            {activeMods.length === 0 ? (
              <p className="text-xs font-mono text-tactical-muted italic text-center py-8">
                Nenhum mod ativo no momento. Adicione mods a partir da lista ao lado.
              </p>
            ) : (
              activeMods.map((mod, idx) => {
                const detected = detectedMods.find((d) => d.id === mod.id);
                return (
                  <div
                    key={mod.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-center space-x-3 min-w-0 mr-2">
                      <span className="text-xs font-mono font-bold text-tactical-amber/80 w-6 text-center">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-tactical-text truncate">
                          {detected?.name || mod.id}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] font-mono text-tactical-muted truncate">
                            {mod.id}
                          </span>
                          {mod.workshopId && (
                            <span className="text-[9px] font-mono text-tactical-amber">
                              ({mod.workshopId})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        title="Mover para cima"
                        className="p-1.5 rounded-lg text-tactical-muted hover:text-white hover:bg-white/5 disabled:opacity-20"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === activeMods.length - 1}
                        title="Mover para baixo"
                        className="p-1.5 rounded-lg text-tactical-muted hover:text-white hover:bg-white/5 disabled:opacity-20"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        onClick={() => handleRemoveMod(mod.id)}
                        title="Remover mod"
                        className="p-1.5 rounded-lg text-tactical-muted hover:text-tactical-red hover:bg-tactical-red/10"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TacticalCard>
      </div>
    </div>
  );
};
