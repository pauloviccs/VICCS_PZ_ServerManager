import React, { useState } from "react";
import {
  CloudRain,
  Eye,
  Heart,
  HelpCircle,
  MessageSquare,
  Navigation,
  PackagePlus,
  Power,
  Save,
  Shield,
  Skull,
  UserCheck,
  UserMinus,
  UserX,
  Zap,
} from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalCard } from "../ui/TacticalCard";
import { TacticalInput } from "../ui/TacticalInput";
import { TacticalModal } from "../ui/TacticalModal";
import { TacticalSwitch } from "../ui/TacticalSwitch";
import { NativeCommandsModal } from "./NativeCommandsModal";
import { ScheduledShutdownModal } from "./ScheduledShutdownModal";
import { invoke } from "@tauri-apps/api/core";

export const AdminActionsGrid: React.FC = () => {
  const { rconConnected, showToast, addLog } = useServerStore();

  // Estados dos Modais
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showCommandsModal, setShowCommandsModal] = useState(false);
  const [showShutdownModal, setShowShutdownModal] = useState(false);
  const [isRaining, setIsRaining] = useState(false);

  // Form states
  const [targetNick, setTargetNick] = useState("");
  const [targetNick2, setTargetNick2] = useState("");
  const [reason, setReason] = useState("");
  const [accessLevel, setAccessLevel] = useState("admin");
  const [broadcastMsg, setBroadcastMsg] = useState("");
  const [skillName, setSkillName] = useState("Woodwork");
  const [xpAmount, setXpAmount] = useState("1000");
  const [hordeLocation, setHordeLocation] = useState("Muldraugh");
  const [hordeCount, setHordeCount] = useState("50");
  const [vehicleScript, setVehicleScript] = useState("Base.CarNormal");
  const [godModeState, setGodModeState] = useState(false);
  const [invisibleState, setInvisibleState] = useState(false);

  const executeRcon = async (cmd: string, successMsg?: string) => {
    if (!rconConnected) {
      showToast("RCON desconectado! Ative o RCON no topo para enviar comandos.", "error");
      return;
    }
    try {
      setModalLoading(true);
      addLog("rcon", `> ${cmd}`);
      const res: string = await invoke("rcon_execute", { command: cmd });
      if (res.trim()) {
        addLog("rcon", res.trim());
      }
      showToast(successMsg || "Comando executado com sucesso!", "success");
      setActiveModal(null);
    } catch (e: any) {
      showToast(`Erro RCON: ${e}`, "error");
      addLog("rcon", `[FALHA] ${e}`);
    } finally {
      setModalLoading(false);
    }
  };

  const citiesCoordinates: Record<string, string> = {
    Muldraugh: "10620,10140,0",
    WestPoint: "11900,6850,0",
    Riverside: "6380,5340,0",
    Rosewood: "8200,11600,0",
    MarchRidge: "10150,12750,0",
    Louisville: "12800,2800,0",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold font-mono tracking-widest uppercase text-tactical-muted">
          COMANDOS ADMINISTRATIVOS IN-GAME (RCON)
        </h2>
        {!rconConnected && (
          <span className="text-xs font-mono text-tactical-amber bg-tactical-amber/10 px-2.5 py-1 rounded-lg border border-tactical-amber/30">
            Atenção: Conecte o RCON no cabeçalho para habilitar ações em tempo real
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Moderação & Punições */}
        <TacticalCard
          title="MODERAÇÃO"
          subtitle="Punições e gestão de acessos"
          icon={<Shield size={18} />}
        >
          <div className="space-y-2">
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<UserCheck size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("set_access");
              }}
              className="w-full justify-start"
            >
              Definir Cargo Admin
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<UserMinus size={14} />}
              onClick={() => {
                setTargetNick("");
                setReason("");
                setActiveModal("kick");
              }}
              className="w-full justify-start"
            >
              Kickar Jogador
            </TacticalButton>

            <TacticalButton
              variant="danger"
              size="sm"
              icon={<UserX size={14} />}
              onClick={() => {
                setTargetNick("");
                setReason("");
                setActiveModal("ban");
              }}
              className="w-full justify-start"
            >
              Banir Jogador
            </TacticalButton>

            <TacticalButton
              variant="ghost"
              size="sm"
              onClick={() => {
                setTargetNick("");
                setActiveModal("unban");
              }}
              className="w-full justify-start"
            >
              Desbanir Jogador
            </TacticalButton>
          </div>
        </TacticalCard>

        {/* Card 2: Intervenção & QoL */}
        <TacticalCard
          title="INTERVENÇÃO"
          subtitle="Teleporte, cura e suporte"
          icon={<Zap size={18} />}
        >
          <div className="space-y-2">
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Navigation size={14} />}
              onClick={() => {
                setTargetNick("");
                setTargetNick2("");
                setActiveModal("teleport");
              }}
              className="w-full justify-start"
            >
              Teleportar A ➔ B
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Shield size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("godmode");
              }}
              className="w-full justify-start"
            >
              GodMode / Imortal
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Eye size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("invisible");
              }}
              className="w-full justify-start"
            >
              Invisibilidade
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Heart size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("heal");
              }}
              className="w-full justify-start"
            >
              Curar Jogador
            </TacticalButton>
          </div>
        </TacticalCard>

        {/* Card 3: Itens, XP & Spawn */}
        <TacticalCard
          title="PROGRESSÃO"
          subtitle="Itens, veículos e skills"
          icon={<PackagePlus size={18} />}
        >
          <div className="space-y-2">
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<PackagePlus size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("survival_kit");
              }}
              className="w-full justify-start"
            >
              Kit Sobrevivência
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Zap size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("add_xp");
              }}
              className="w-full justify-start"
            >
              Adicionar XP
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Navigation size={14} />}
              onClick={() => {
                setTargetNick("");
                setActiveModal("spawn_vehicle");
              }}
              className="w-full justify-start"
            >
              Spawnar Veículo
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Skull size={14} />}
              onClick={() => setActiveModal("spawn_horde")}
              className="w-full justify-start text-tactical-amber"
            >
              Spawnar Horda
            </TacticalButton>
          </div>
        </TacticalCard>

        {/* Card 4: Mundo & Sistema */}
        <TacticalCard
          title="MUNDO & SISTEMA"
          subtitle="Clima, salvamento e avisos"
          icon={<Save size={18} />}
        >
          <div className="space-y-2">
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Save size={14} />}
              onClick={() => executeRcon("save", "Mundo do jogo salvo com sucesso!")}
              className="w-full justify-start"
            >
              Salvar Mundo (save)
            </TacticalButton>

            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<MessageSquare size={14} />}
              onClick={() => {
                setBroadcastMsg("");
                setActiveModal("servermsg");
              }}
              className="w-full justify-start"
            >
              Mensagem Global
            </TacticalButton>

            {/* Controle de Chuva Unificado (Slide Toggle) */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
              <div className="flex items-center space-x-2">
                <CloudRain size={14} className={isRaining ? "text-tactical-cyan" : "text-tactical-muted"} />
                <span className="text-xs font-mono text-tactical-muted">Chuva In-Game</span>
              </div>
              <TacticalSwitch
                checked={isRaining}
                onChange={async (val) => {
                  setIsRaining(val);
                  if (val) {
                    await executeRcon("startrain", "Precipitação de chuva iniciada.");
                  } else {
                    await executeRcon("stoprain", "Precipitação de chuva interrompida.");
                  }
                }}
              />
            </div>

            {/* Listar Comandos Nativos (Abre Modal Interativo) */}
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<HelpCircle size={14} />}
              onClick={() => setShowCommandsModal(true)}
              className="w-full justify-start text-tactical-cyan"
            >
              Manual de Comandos B42
            </TacticalButton>

            {/* Desligamento Programado (Opção 55) */}
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Power size={14} className="text-tactical-red" />}
              onClick={() => setShowShutdownModal(true)}
              className="w-full justify-start text-tactical-red border-tactical-red/30 hover:bg-tactical-red/10"
            >
              Desligamento Programado (Opção 55)
            </TacticalButton>
          </div>
        </TacticalCard>
      </div>

      {/* ========================================================================= */}
      {/* MODAIS DE CONFIGURAÇÃO E ENVIO DE COMANDOS */}
      {/* ========================================================================= */}

      {/* 1. Definir Cargo */}
      <TacticalModal
        isOpen={activeModal === "set_access"}
        onClose={() => setActiveModal(null)}
        title="Definir Cargo de Acesso"
        subtitle="setaccesslevel"
        icon={<UserCheck size={18} />}
        primaryActionLabel="Aplicar Cargo"
        onPrimaryAction={() =>
          executeRcon(
            `setaccesslevel "${targetNick}" "${accessLevel}"`,
            `Cargo de ${targetNick} atualizado para ${accessLevel}`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: Fulano"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
              Cargo Desejado
            </label>
            <select
              value={accessLevel}
              onChange={(e) => setAccessLevel(e.target.value)}
              className="w-full bg-black/40 text-tactical-text rounded-xl px-3.5 py-2.5 text-sm border border-white/10 font-mono focus:outline-none"
            >
              <option value="admin">admin (Acesso Total)</option>
              <option value="moderator">moderator (Moderação)</option>
              <option value="overseer">overseer (Vigilante)</option>
              <option value="gm">gm (Game Master)</option>
              <option value="observer">observer (Observador)</option>
              <option value="none">none (Jogador Padrão / Resetar)</option>
            </select>
          </div>
        </div>
      </TacticalModal>

      {/* 2. Kickar Jogador */}
      <TacticalModal
        isOpen={activeModal === "kick"}
        onClose={() => setActiveModal(null)}
        title="Expulsar Jogador"
        subtitle="kick"
        icon={<UserMinus size={18} />}
        primaryActionLabel="Expulsar (Kick)"
        onPrimaryAction={() =>
          executeRcon(
            reason.trim()
              ? `kick "${targetNick}" -r "${reason}"`
              : `kick "${targetNick}"`,
            `Jogador ${targetNick} foi expulso do servidor.`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: Arruaceiro123"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <TacticalInput
            label="Motivo (Opcional)"
            placeholder="Ex: Violação das regras de conduta"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>
      </TacticalModal>

      {/* 3. Banir Jogador */}
      <TacticalModal
        isOpen={activeModal === "ban"}
        onClose={() => setActiveModal(null)}
        title="Banir Jogador"
        subtitle="banuser"
        icon={<UserX size={18} />}
        isDestructive={true}
        primaryActionLabel="Confirmar Banimento"
        onPrimaryAction={() =>
          executeRcon(
            reason.trim()
              ? `banuser "${targetNick}" -ip -r "${reason}"`
              : `banuser "${targetNick}" -ip`,
            `Jogador ${targetNick} banido por IP e conta.`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: Hacker404"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <TacticalInput
            label="Motivo do Ban"
            placeholder="Ex: Uso de cheats / Griefing severo"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <p className="text-xs text-tactical-red/80 font-mono">
            * O banimento será aplicado na conta e no IP do usuário.
          </p>
        </div>
      </TacticalModal>

      {/* 4. Teleporte */}
      <TacticalModal
        isOpen={activeModal === "teleport"}
        onClose={() => setActiveModal(null)}
        title="Teleportar Jogadores"
        subtitle="teleport"
        icon={<Navigation size={18} />}
        primaryActionLabel="Teleportar"
        onPrimaryAction={() =>
          executeRcon(
            `teleport "${targetNick}" "${targetNick2}"`,
            `Jogador ${targetNick} teleportado até ${targetNick2}`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim() || !targetNick2.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Jogador de Origem (Quem vai ser teleportado)"
            placeholder="Ex: JogadorA"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <TacticalInput
            label="Jogador de Destino (Onde vai parar)"
            placeholder="Ex: JogadorB"
            value={targetNick2}
            onChange={(e) => setTargetNick2(e.target.value)}
          />
        </div>
      </TacticalModal>

      {/* 5. GodMode */}
      <TacticalModal
        isOpen={activeModal === "godmode"}
        onClose={() => setActiveModal(null)}
        title="Modo Deus (GodMode)"
        subtitle="godmodeplayer"
        icon={<Shield size={18} />}
        primaryActionLabel="Aplicar"
        onPrimaryAction={() =>
          executeRcon(
            `godmodeplayer "${targetNick}" ${godModeState ? "-true" : "-false"}`,
            `GodMode de ${targetNick} definido para ${godModeState ? "ATIVO" : "INATIVO"}`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-4">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: NickAdmin"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <TacticalSwitch
              checked={godModeState}
              onChange={setGodModeState}
              label="Ativar Modo Deus"
              description="Torna o jogador invulnerável a mordidas, quedas e dano geral."
              color="amber"
            />
          </div>
        </div>
      </TacticalModal>

      {/* 6. Invisibilidade */}
      <TacticalModal
        isOpen={activeModal === "invisible"}
        onClose={() => setActiveModal(null)}
        title="Invisibilidade"
        subtitle="invisible"
        icon={<Eye size={18} />}
        primaryActionLabel="Aplicar"
        onPrimaryAction={() =>
          executeRcon(
            `invisible "${targetNick}" ${invisibleState ? "-true" : "-false"}`,
            `Invisibilidade de ${targetNick} definida para ${
              invisibleState ? "ATIVA" : "INATIVA"
            }`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-4">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: NickAdmin"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <div className="p-3 bg-black/40 rounded-xl border border-white/10">
            <TacticalSwitch
              checked={invisibleState}
              onChange={setInvisibleState}
              label="Ativar Invisibilidade"
              description="Zumbis e outros jogadores não enxergarão este personagem."
              color="green"
            />
          </div>
        </div>
      </TacticalModal>

      {/* 7. Curar Jogador */}
      <TacticalModal
        isOpen={activeModal === "heal"}
        onClose={() => setActiveModal(null)}
        title="Curar Jogador"
        subtitle="Restaura saúde alternando Godmode nativo"
        icon={<Heart size={18} />}
        primaryActionLabel="Curar Agora"
        onPrimaryAction={async () => {
          if (!targetNick.trim()) return;
          try {
            setModalLoading(true);
            await invoke("rcon_execute", { command: `godmodeplayer "${targetNick}" -true` });
            await invoke("rcon_execute", { command: `godmodeplayer "${targetNick}" -false` });
            showToast(`Jogador ${targetNick} curado com sucesso!`, "success");
            addLog("rcon", `[CURA] godmodeplayer toggle executado para ${targetNick}.`);
            setActiveModal(null);
          } catch (e: any) {
            showToast(`Erro ao curar: ${e}`, "error");
          } finally {
            setModalLoading(false);
          }
        }}
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador a ser Curado"
            placeholder="Ex: Ferido123"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <p className="text-xs text-tactical-muted">
            Na Build 42, ativa e desativa rapidamente o godmodeplayer para regenerar 100% da vida, estancar sangramentos e limpar infecções.
          </p>
        </div>
      </TacticalModal>

      {/* 8. Kit Sobrevivência */}
      <TacticalModal
        isOpen={activeModal === "survival_kit"}
        onClose={() => setActiveModal(null)}
        title="Entregar Kit de Sobrevivência"
        subtitle="additem"
        icon={<PackagePlus size={18} />}
        primaryActionLabel="Enviar Kit"
        onPrimaryAction={async () => {
          if (!targetNick.trim()) return;
          try {
            setModalLoading(true);
            await invoke("rcon_execute", {
              command: `additem "${targetNick}" "Base.CannedBeans" 2`,
            });
            await invoke("rcon_execute", {
              command: `additem "${targetNick}" "Base.WaterBottleFull" 1`,
            });
            await invoke("rcon_execute", {
              command: `additem "${targetNick}" "Base.FirstAidKit" 1`,
            });
            showToast(`Kit enviado com sucesso para ${targetNick}!`, "success");
            setActiveModal(null);
          } catch (e: any) {
            showToast(`Erro ao enviar kit: ${e}`, "error");
          } finally {
            setModalLoading(false);
          }
        }}
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador Beneficiário"
            placeholder="Ex: Sobrevivente"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <p className="text-xs text-tactical-muted font-mono">
            Conteúdo: 2x Feijão Enlatado, 1x Garrafa de Água Cheia, 1x Kit de Primeiros Socorros.
          </p>
        </div>
      </TacticalModal>

      {/* 9. Adicionar XP */}
      <TacticalModal
        isOpen={activeModal === "add_xp"}
        onClose={() => setActiveModal(null)}
        title="Adicionar Experiência (XP)"
        subtitle="addxp"
        icon={<Zap size={18} />}
        primaryActionLabel="Adicionar XP"
        onPrimaryAction={() =>
          executeRcon(
            `addxp "${targetNick}" ${skillName}=${xpAmount}`,
            `Adicionado ${xpAmount} de XP em ${skillName} para ${targetNick}`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador"
            placeholder="Ex: Fulano"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
              Habilidade (Skill)
            </label>
            <select
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              className="w-full bg-black/40 text-tactical-text rounded-xl px-3.5 py-2.5 text-sm border border-white/10 font-mono focus:outline-none"
            >
              <optgroup label="Sobrevivência & Ofícios (B42 Nativo)">
                <option value="Woodwork">Carpintaria (Woodwork)</option>
                <option value="Doctor">Primeiros Socorros (Doctor)</option>
                <option value="Cooking">Culinária (Cooking)</option>
                <option value="Farming">Agricultura (Farming)</option>
                <option value="Fishing">Pesca (Fishing)</option>
                <option value="Trapping">Armadilhas (Trapping)</option>
                <option value="Foraging">Coleta / Sobrevivência (Foraging)</option>
                <option value="Electricity">Eletricidade (Electricity)</option>
                <option value="MetalWelding">Metalurgia (MetalWelding)</option>
                <option value="Mechanics">Mecânica (Mechanics)</option>
                <option value="Tailoring">Costura (Tailoring)</option>
              </optgroup>

              <optgroup label="Novas Perícias Build 42">
                <option value="Blacksmith">Ferraria (Blacksmith)</option>
                <option value="Masonry">Alvenaria (Masonry)</option>
                <option value="Pottery">Cerâmica / Oleiro (Pottery)</option>
                <option value="Glassmaking">Vidraria (Glassmaking)</option>
                <option value="Carving">Entalhe em Madeira (Carving)</option>
                <option value="FlintKnapping">Lascamento Pederneira (FlintKnapping)</option>
                <option value="Tracking">Rastreamento Animal (Tracking)</option>
                <option value="Husbandry">Criação / Pecuária (Husbandry)</option>
                <option value="Butchering">Açougue / Abate (Butchering)</option>
              </optgroup>

              <optgroup label="Combate & Armas">
                <option value="Aiming">Pontaria / Mira (Aiming)</option>
                <option value="Reloading">Recarga (Reloading)</option>
                <option value="Axe">Machados (Axe)</option>
                <option value="Blunt">Contundente Longo (Blunt)</option>
                <option value="SmallBlunt">Contundente Curto (SmallBlunt)</option>
                <option value="LongBlade">Lâmina Longa (LongBlade)</option>
                <option value="SmallBlade">Lâmina Curta (SmallBlade)</option>
                <option value="Spear">Lanças (Spear)</option>
                <option value="Maintenance">Manutenção (Maintenance)</option>
              </optgroup>

              <optgroup label="Agilidade & Físico">
                <option value="Sneak">Furtividade (Sneak)</option>
                <option value="Lightfoot">Passos Leves (Lightfoot)</option>
                <option value="Nimble">Destreza / Agilidade (Nimble)</option>
                <option value="Sprinting">Corrida (Sprinting)</option>
                <option value="Fitness">Aptidão Física (Fitness)</option>
                <option value="Strength">Força (Strength)</option>
              </optgroup>
            </select>
          </div>
          <TacticalInput
            label="Quantidade de XP"
            type="number"
            value={xpAmount}
            onChange={(e) => setXpAmount(e.target.value)}
          />
        </div>
      </TacticalModal>

      {/* 10. Spawnar Horda */}
      <TacticalModal
        isOpen={activeModal === "spawn_horde"}
        onClose={() => setActiveModal(null)}
        title="Invocar Horda de Zumbis"
        subtitle="createhorde"
        icon={<Skull size={18} />}
        primaryActionLabel="Invocar Horda"
        onPrimaryAction={() => {
          const coords = citiesCoordinates[hordeLocation] || "10620,10140,0";
          executeRcon(
            `createhorde ${hordeCount} "" ${coords}`,
            `Horda de ${hordeCount} zumbis invocada em ${hordeLocation}!`
          );
        }}
        isLoading={modalLoading}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
              Localidade / Cidade
            </label>
            <select
              value={hordeLocation}
              onChange={(e) => setHordeLocation(e.target.value)}
              className="w-full bg-black/40 text-tactical-text rounded-xl px-3.5 py-2.5 text-sm border border-white/10 font-mono focus:outline-none"
            >
              <option value="Muldraugh">Muldraugh</option>
              <option value="WestPoint">West Point</option>
              <option value="Riverside">Riverside</option>
              <option value="Rosewood">Rosewood</option>
              <option value="MarchRidge">March Ridge</option>
              <option value="Louisville">Louisville</option>
            </select>
          </div>
          <TacticalInput
            label="Quantidade de Zumbis"
            type="number"
            value={hordeCount}
            onChange={(e) => setHordeCount(e.target.value)}
          />
        </div>
      </TacticalModal>

      {/* 11. Spawnar Veículo */}
      <TacticalModal
        isOpen={activeModal === "spawn_vehicle"}
        onClose={() => setActiveModal(null)}
        title="Spawnar Veículo"
        subtitle="addvehicle"
        icon={<Navigation size={18} />}
        primaryActionLabel="Spawnar Veículo"
        onPrimaryAction={() =>
          executeRcon(
            `addvehicle "${vehicleScript}" "${targetNick}"`,
            `Veículo ${vehicleScript} spawnado junto a ${targetNick}`
          )
        }
        isLoading={modalLoading}
        disablePrimary={!targetNick.trim()}
      >
        <div className="space-y-3">
          <TacticalInput
            label="Nick do Jogador (Destino do Spawn)"
            placeholder="Ex: Piloto"
            value={targetNick}
            onChange={(e) => setTargetNick(e.target.value)}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
              Modelo do Veículo
            </label>
            <select
              value={vehicleScript}
              onChange={(e) => setVehicleScript(e.target.value)}
              className="w-full bg-black/40 text-tactical-text rounded-xl px-3.5 py-2.5 text-sm border border-white/10 font-mono focus:outline-none"
            >
              <option value="Base.CarNormal">Carro Normal (Sedan)</option>
              <option value="Base.CarLights">Carro de Polícia (Sirene)</option>
              <option value="Base.PickUpTruck">Picape (PickUp Truck)</option>
              <option value="Base.Van">Van de Carga</option>
              <option value="Base.StepVan_Mail">Van dos Correios</option>
              <option value="Base.Ambulance">Ambulância</option>
              <option value="Base.FireTruck">Caminhão de Bombeiro</option>
            </select>
          </div>
        </div>
      </TacticalModal>

      {/* 12. Mensagem Global */}
      <TacticalModal
        isOpen={activeModal === "servermsg"}
        onClose={() => setActiveModal(null)}
        title="Transmitir Mensagem Global"
        subtitle="servermsg"
        icon={<MessageSquare size={18} />}
        primaryActionLabel="Transmitir no Chat"
        onPrimaryAction={() =>
          executeRcon(
            `servermsg "${broadcastMsg}"`,
            "Mensagem global transmitida a todos os jogadores!"
          )
        }
        isLoading={modalLoading}
        disablePrimary={!broadcastMsg.trim()}
      >
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-tactical-muted">
            Texto da Mensagem
          </label>
          <textarea
            rows={4}
            value={broadcastMsg}
            onChange={(e) => setBroadcastMsg(e.target.value)}
            placeholder="Aviso: O servidor será reiniciado para manutenção em 15 minutos..."
            className="w-full bg-black/40 text-tactical-text placeholder-tactical-muted/50 rounded-xl p-3.5 text-sm border border-white/10 font-mono focus:border-tactical-amber focus:outline-none"
          />
        </div>
      </TacticalModal>

      {/* 13. Manual de Comandos Nativos (Build 42) */}
      <NativeCommandsModal
        isOpen={showCommandsModal}
        onClose={() => setShowCommandsModal(false)}
        onExecuteCommand={(cmd) => executeRcon(cmd)}
      />

      {/* 14. Desligamento Programado (Opção 55) */}
      <ScheduledShutdownModal
        isOpen={showShutdownModal}
        onClose={() => setShowShutdownModal(false)}
      />
    </div>
  );
};
