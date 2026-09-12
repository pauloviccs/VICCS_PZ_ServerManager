# Diretrizes de Estilo de Código (Code Style)

## Frontend (React 18 + TypeScript + Tailwind CSS)

1. **TypeScript Rigoroso:**
   - Tipagem estrita para todos os componentes, props, eventos e retornos. Evite `any` a todo custo.
   - Interfaces e tipos centralizados em `src/types/index.ts` para dados de domínio (métricas, mods, configs, logs).

2. **Componentização & Clean Code:**
   - Componentes pequenos, funcionais e focados em uma única responsabilidade.
   - Componentes UI genéricos em `src/components/ui/` (`TacticalCard`, `TacticalButton`, `TacticalInput`, `TacticalSwitch`, `TacticalModal`).
   - Componentes de domínio organizados por recurso em `src/components/<feature>/`.
   - Gerenciamento de estado global com Zustand em `src/store/serverStore.ts`.

3. **Design System & Tailwind:**
   - Usar classes utilitárias e tokens definidos no `index.css` e `tailwind.config.js`.
   - Preservar o visual tático militar ("Tactical Glass") com `backdrop-blur`, transparências suaves e bordas sutis.
   - **Zero Emojis:** Todos os ícones devem vir de `lucide-react`.

## Backend (Rust 2021 / Tauri v2)

1. **Idiomática Rust:**
   - Seguir convenções de `clippy` e formatação oficial (`rustfmt`).
   - Tipagem forte, uso explícito de `Result<T, E>` com strings de erro descritivas ou tipos dedicados para comandos Tauri.
   - Nenhum `unwrap()` ou `expect()` em fluxos de runtime que possam causar panic; tratar erros com `?` ou mapeamento gracioso.

2. **Assincronicidade e Segurança:**
   - Uso de `tokio` para tarefas de I/O assíncronas (process spawn, pipes de logs, TCP sockets).
   - Manipulação segura de arquivos de configuração com backups automáticos defensivos (`.bak`) antes de qualquer sobrescrita no disco.
   - Sanitização de argumentos de inicialização da JVM (normalização de valores de RAM, paths do Windows).

3. **Arquitetura Modular:**
   - `core/`: Process Manager, RCON Client, Resource Monitor e Maintenance.
   - `parser/`: Motores de leitura e gravação para `.ini` e `.lua`.
   - `scanner/`: Varredura e indexação de mods do Steam Workshop e locais.
