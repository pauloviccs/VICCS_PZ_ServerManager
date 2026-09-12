import React, { useState } from "react";
import {
  Check,
  Copy,
  Play,
  Search,
} from "lucide-react";
import { TacticalModal } from "../ui/TacticalModal";

interface NativeCommand {
  command: string;
  syntax: string;
  category: "moderation" | "world" | "system" | "players";
  description: string;
  example: string;
}

const B42_NATIVE_COMMANDS: NativeCommand[] = [
  // Moderação & Acessos
  {
    command: "setaccesslevel",
    syntax: 'setaccesslevel "<player>" <admin|moderator|overseer|gm|observer|none>',
    category: "moderation",
    description: "Altera a patente e os privilégios administrativos de um jogador.",
    example: 'setaccesslevel "Sobrevivente" admin',
  },
  {
    command: "kickuser",
    syntax: 'kickuser "<player>" [-r "motivo"]',
    category: "moderation",
    description: "Expulsa um jogador imediatamente da sessão atual.",
    example: 'kickuser "Troll" -r "Regra 1 violada"',
  },
  {
    command: "banuser",
    syntax: 'banuser "<player>" [-ip] [-r "motivo"]',
    category: "moderation",
    description: "Bane permanentemente o usuário por nome de conta e opcionalmente IP.",
    example: 'banuser "Cheater" -ip -r "Trapaça detectada"',
  },
  {
    command: "unbanuser",
    syntax: 'unbanuser "<player>"',
    category: "moderation",
    description: "Remove o banimento do jogador no banco de dados do servidor.",
    example: 'unbanuser "Cheater"',
  },
  {
    command: "godmodeplayer",
    syntax: 'godmodeplayer "<player>" -true|-false',
    category: "moderation",
    description: "Build 42: Concede invulnerabilidade e regeneração total de dano para outro jogador.",
    example: 'godmodeplayer "Sobrevivente" -true',
  },
  {
    command: "invisible",
    syntax: 'invisible "<player>" -true|-false',
    category: "moderation",
    description: "Torna o jogador completamente invisível para zumbis e outros jogadores.",
    example: 'invisible "Sobrevivente" -true',
  },

  // Jogadores & Itens
  {
    command: "additem",
    syntax: 'additem "<player>" <Base.ItemName> [count]',
    category: "players",
    description: "Gera e entrega itens diretamente no inventário do jogador.",
    example: 'additem "Sobrevivente" Base.Axe 1',
  },
  {
    command: "addxp",
    syntax: 'addxp "<player>" <PerkName>=<quantidade>',
    category: "players",
    description: "Adiciona pontos de experiência (XP) em uma habilidade específica (Ex: Woodwork, Doctor, Aiming).",
    example: 'addxp "Sobrevivente" Woodwork=5000',
  },
  {
    command: "teleport",
    syntax: 'teleport "<player1>" "<player2>"',
    category: "players",
    description: "Teleporta o primeiro jogador para a localização atual do segundo.",
    example: 'teleport "Amigo1" "Amigo2"',
  },
  {
    command: "teleportto",
    syntax: 'teleportto "<player>" <x>,<y>,<z>',
    category: "players",
    description: "Teleporta um jogador para as coordenadas mundiais exatas X, Y, Z.",
    example: 'teleportto "Sobrevivente" 10620,10140,0',
  },
  {
    command: "players",
    syntax: "players",
    category: "players",
    description: "Lista no console todos os jogadores conectados e respectivos pings.",
    example: "players",
  },

  // Mundo & Eventos
  {
    command: "servermsg",
    syntax: 'servermsg "<mensagem>"',
    category: "world",
    description: "Exibe um anúncio global em texto vermelho destacado para todos os jogadores online.",
    example: 'servermsg "O servidor reiniciará em 10 minutos!"',
  },
  {
    command: "startrain",
    syntax: "startrain",
    category: "world",
    description: "Inicia imediatamente uma precipitação de chuva no mapa.",
    example: "startrain",
  },
  {
    command: "stoprain",
    syntax: "stoprain",
    category: "world",
    description: "Interrompe qualquer tempestade ou chuva ativa no mundo.",
    example: "stoprain",
  },
  {
    command: "chopper",
    syntax: "chopper",
    category: "world",
    description: "Dispara o evento aéreo do helicóptero sobre um jogador aleatório.",
    example: "chopper",
  },
  {
    command: "gunshot",
    syntax: "gunshot",
    category: "world",
    description: "Gera o som de tiros à distância, atraindo hordas nas proximidades.",
    example: "gunshot",
  },
  {
    command: "createhorde",
    syntax: "createhorde <quantidade> [x,y,z]",
    category: "world",
    description: "Spawna uma quantidade definida de zumbis nas coordenadas ou perto do admin.",
    example: "createhorde 50",
  },
  {
    command: "spawnvehicle",
    syntax: 'spawnvehicle "<Base.CarScript>" [player]',
    category: "world",
    description: "Gera um veículo novo diretamente na frente do jogador selecionado.",
    example: 'spawnvehicle "Base.PickUpTruck" "Sobrevivente"',
  },

  // Sistema & Persistência
  {
    command: "save",
    syntax: "save",
    category: "system",
    description: "Força o salvamento imediato do mapa, construções e dados de jogadores no disco.",
    example: "save",
  },
  {
    command: "quit",
    syntax: "quit",
    category: "system",
    description: "Salva os chunks e encerra o processo do servidor de forma graciosa e segura.",
    example: "quit",
  },
  {
    command: "reloadoptions",
    syntax: "reloadoptions",
    category: "system",
    description: "Recarrega os arquivos servertest.ini e SandboxVars.lua sem derrubar os jogadores.",
    example: "reloadoptions",
  },
  {
    command: "showoptions",
    syntax: "showoptions",
    category: "system",
    description: "Imprime a lista de todas as variáveis e configurações ativas do servidor no console.",
    example: "showoptions",
  },
  {
    command: "help",
    syntax: "help [comando]",
    category: "system",
    description: "Exibe o manual de sintaxe nativo fornecido pelo motor do Project Zomboid.",
    example: "help additem",
  },
];

interface NativeCommandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExecuteCommand?: (cmd: string) => void;
}

export const NativeCommandsModal: React.FC<NativeCommandsModalProps> = ({
  isOpen,
  onClose,
  onExecuteCommand,
}) => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = B42_NATIVE_COMMANDS.filter((item) => {
    const matchesCat = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      item.command.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.syntax.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case "moderation":
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-red/10 text-tactical-red border border-tactical-red/20">MODERAÇÃO</span>;
      case "players":
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-cyan/10 text-tactical-cyan border border-tactical-cyan/20">JOGADORES</span>;
      case "world":
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-amber/10 text-tactical-amber border border-tactical-amber/20">MUNDO</span>;
      case "system":
        return <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-tactical-green/10 text-tactical-green border border-tactical-green/20">SISTEMA</span>;
      default:
        return null;
    }
  };

  return (
    <TacticalModal
      isOpen={isOpen}
      onClose={onClose}
      title="MANUAL DE COMANDOS NATIVOS RCON (BUILD 42)"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-4">
        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full relative">
            <Search className="absolute left-3 top-3 text-tactical-muted" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar comando, sintaxe ou utilidade..."
              className="w-full bg-[#12141A] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-tactical-muted focus:border-tactical-cyan/50 focus:outline-none"
            />
          </div>

          {/* Filtro de Categoria */}
          <div className="flex items-center space-x-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { id: "all", label: "TODOS" },
              { id: "moderation", label: "MODERAÇÃO" },
              { id: "players", label: "JOGADORES" },
              { id: "world", label: "MUNDO" },
              { id: "system", label: "SISTEMA" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-tactical-cyan/20 text-tactical-cyan border border-tactical-cyan/40 shadow-cyan-glow/20"
                    : "bg-white/5 text-tactical-muted border border-white/10 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Comandos */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2.5 pr-1 tactical-scroll">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-tactical-muted font-mono text-xs">
              Nenhum comando encontrado para o termo pesquisado.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.command}
                className="p-3.5 rounded-xl bg-[#0D0F14] border border-white/10 hover:border-tactical-cyan/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono font-bold text-tactical-cyan group-hover:text-tactical-cyan-light">
                        {item.command}
                      </span>
                      {getCategoryBadge(item.category)}
                    </div>

                    <p className="text-xs text-tactical-text font-sans leading-relaxed">
                      {item.description}
                    </p>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-[11px] font-mono pt-1">
                      <span className="text-tactical-muted">Sintaxe:</span>
                      <code className="bg-black/60 px-2 py-0.5 rounded text-tactical-amber border border-white/5 break-all">
                        {item.syntax}
                      </code>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-[11px] font-mono">
                      <span className="text-tactical-muted">Exemplo:</span>
                      <code className="bg-black/40 px-2 py-0.5 rounded text-tactical-green border border-white/5 break-all">
                        {item.example}
                      </code>
                    </div>
                  </div>

                  {/* Ações: Copiar e Executar */}
                  <div className="flex items-center space-x-1.5 shrink-0 pt-1">
                    <button
                      onClick={() => handleCopy(item.example)}
                      title="Copiar comando de exemplo"
                      className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-tactical-cyan/50 text-tactical-muted hover:text-tactical-cyan transition-all"
                    >
                      {copiedCmd === item.example ? (
                        <Check size={14} className="text-tactical-green" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>

                    {onExecuteCommand && (
                      <button
                        onClick={() => {
                          onExecuteCommand(item.example);
                          onClose();
                        }}
                        title="Inserir comando para execução"
                        className="px-2.5 py-1.5 rounded-lg bg-tactical-cyan/15 border border-tactical-cyan/30 text-tactical-cyan hover:bg-tactical-cyan/25 text-xs font-mono font-bold flex items-center space-x-1 transition-all"
                      >
                        <Play size={12} fill="currentColor" />
                        <span>Usar</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-tactical-muted">
          <span>Total: {filtered.length} comandos indexados</span>
          <span>Compatível com Project Zomboid Build 42 RCON</span>
        </div>
      </div>
    </TacticalModal>
  );
};
