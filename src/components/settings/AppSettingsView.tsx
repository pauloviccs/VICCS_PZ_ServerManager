import React, { useState } from "react";
import { Folder, Key, MessageSquare, RefreshCw, Save, Send, Settings } from "lucide-react";
import { useServerStore } from "../../store/serverStore";
import { TacticalButton } from "../ui/TacticalButton";
import { TacticalCard } from "../ui/TacticalCard";
import { TacticalInput } from "../ui/TacticalInput";
import { TacticalSwitch } from "../ui/TacticalSwitch";

export const AppSettingsView: React.FC = () => {
  const {
    serverPath,
    setServerPath,
    serverName,
    setServerName,
    ram,
    setRam,
    gamePort,
    setGamePort,
    rconPort,
    setRconPort,
    rconPassword,
    setRconPassword,
    discordWebhook,
    setDiscordWebhook,
    discordRoleId,
    setDiscordRoleId,
    notifyOnStart,
    setNotifyOnStart,
    notifyOnStop,
    setNotifyOnStop,
    notifyOnSave,
    setNotifyOnSave,
    sendDiscordWebhook,
    syncFromIni,
    showToast,
  } = useServerStore();

  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [isSyncingIni, setIsSyncingIni] = useState(false);

  const handleSaveSettings = () => {
    showToast("Ajustes operacionais salvos e persistidos com sucesso!", "success");
  };

  const handleTestWebhook = async () => {
    if (!discordWebhook.trim()) {
      showToast("Insira a URL do Webhook do Discord antes de testar.", "error");
      return;
    }
    setIsTestingWebhook(true);
    const ok = await sendDiscordWebhook(
      "🟢 **[PZ SERVER MANAGER] Teste de Conexão Bem-Sucedido!** As notificações de moderação e status estão integradas."
    );
    setIsTestingWebhook(false);
    if (ok) {
      showToast("Mensagem de teste enviada para o Discord com sucesso!", "success");
    } else {
      showToast("Falha ao enviar webhook. Verifique a URL e sua conexão.", "error");
    }
  };

  const handleSyncFromIni = async () => {
    setIsSyncingIni(true);
    await syncFromIni();
    setIsSyncingIni(false);
    showToast("Portas e credenciais sincronizadas com servertest.ini!", "success");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Barra de Ações Superior */}
      <div className="p-4 tactical-glass rounded-2xl border border-white/10 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold font-mono text-white flex items-center space-x-2">
            <Settings size={18} className="text-tactical-amber" />
            <span>AJUSTES GERAIS DO APLICATIVO</span>
          </h2>
          <p className="text-xs text-tactical-muted font-mono mt-0.5">
            Configurações de diretórios, credenciais locais e integrações persistidas no disco
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <TacticalButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw size={14} className={isSyncingIni ? "animate-spin" : ""} />}
            onClick={handleSyncFromIni}
            disabled={isSyncingIni}
          >
            Sincronizar com .ini
          </TacticalButton>

          <TacticalButton
            variant="primary"
            size="sm"
            icon={<Save size={14} />}
            onClick={handleSaveSettings}
          >
            Salvar Ajustes
          </TacticalButton>
        </div>
      </div>

      {/* 1. Caminhos do Servidor */}
      <TacticalCard
        title="DIRETÓRIO DO SERVIDOR"
        subtitle="Localização dos binários e pasta raiz do PZ"
        icon={<Folder size={18} />}
      >
        <div className="space-y-4">
          <TacticalInput
            label="Caminho da Pasta do Servidor"
            value={serverPath}
            onChange={(e) => setServerPath(e.target.value)}
            helperText="Padrão: C:\pzserver (deve conter jre64\bin\java.exe e a pasta java/)"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TacticalInput
              label="Nome do Servidor (-servername)"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              helperText="Usado para localizar servertest.ini e SandboxVars.lua"
            />

            <TacticalInput
              label="Porta do Jogo (DefaultPort)"
              type="number"
              value={gamePort.toString()}
              onChange={(e) => setGamePort(parseInt(e.target.value, 10) || 24554)}
              helperText="Porta de conexão dos jogadores (ex: 24554 ou 16261)"
            />

            <TacticalInput
              label="Memória RAM Padrão"
              value={ram}
              onChange={(e) => setRam(e.target.value)}
              helperText="Exemplos aceitos: 8g, 16g, 24g, 32g"
            />
          </div>
        </div>
      </TacticalCard>

      {/* 2. Credenciais RCON */}
      <TacticalCard
        title="CONEXÃO RCON (CONSOLE REMOTO)"
        subtitle="Porta e senha para administração in-game nativa"
        icon={<Key size={18} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TacticalInput
            label="Porta RCON"
            type="number"
            value={rconPort.toString()}
            onChange={(e) => setRconPort(parseInt(e.target.value, 10) || 27020)}
            helperText="Definida em RCONPort no servertest.ini (Padrão: 27020 ou 27015)"
          />

          <TacticalInput
            label="Senha RCON"
            type="password"
            value={rconPassword}
            onChange={(e) => setRconPassword(e.target.value)}
            placeholder="Digite a senha RCON do servertest.ini"
            helperText="Definida em RCONPassword no servertest.ini (Salva apenas na máquina local)"
          />
        </div>
      </TacticalCard>

      {/* 3. Notificações Discord */}
      <TacticalCard
        title="WEBHOOK DO DISCORD"
        subtitle="Notificações automáticas para sua equipe de moderação no Discord"
        icon={<MessageSquare size={18} />}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
            <div className="md:col-span-2">
              <TacticalInput
                label="URL do Webhook do Discord"
                type="password"
                value={discordWebhook}
                onChange={(e) => setDiscordWebhook(e.target.value)}
                placeholder="https://discord.com/api/webhooks/..."
                helperText="Deixe em branco para desativar qualquer comunicação externa"
              />
            </div>

            <div>
              <TacticalInput
                label="ID do Cargo a Mencionar (Opcional)"
                value={discordRoleId}
                onChange={(e) => setDiscordRoleId(e.target.value)}
                placeholder="Ex: 1543427396244480160"
                helperText="Menciona o cargo automaticamente nos alertas"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-tactical-muted font-mono">
              Gatilhos automáticos de notificação:
            </div>
            <TacticalButton
              variant="secondary"
              size="sm"
              icon={<Send size={14} />}
              onClick={handleTestWebhook}
              isLoading={isTestingWebhook}
              disabled={isTestingWebhook || !discordWebhook}
            >
              Testar Webhook no Discord
            </TacticalButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <TacticalSwitch
                checked={notifyOnStart}
                onChange={setNotifyOnStart}
                label="Servidor Online"
                description="Avisa quando o server terminar o boot"
                color="green"
              />
            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <TacticalSwitch
                checked={notifyOnSave}
                onChange={setNotifyOnSave}
                label="Mundo Salvo"
                description="Avisa quando o comando save for executado"
                color="amber"
              />
            </div>

            <div className="p-3 bg-black/30 rounded-xl border border-white/5">
              <TacticalSwitch
                checked={notifyOnStop}
                onChange={setNotifyOnStop}
                label="Servidor Parado"
                description="Avisa se o servidor for encerrado"
                color="amber"
              />
            </div>
          </div>
        </div>
      </TacticalCard>
    </div>
  );
};
