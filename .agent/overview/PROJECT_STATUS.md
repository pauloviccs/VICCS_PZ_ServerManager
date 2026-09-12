# Project Overview

## Project Name
PZ Server Manager

## Description
Aplicativo desktop nativo para Windows (Tauri v2 + Rust + React 18 + Vite) com design system tático militar ("Tactical Glass"). Unifica e substitui completamente todos os scripts legados (`StartServer64.bat`, `Zomboid.bat`, `Painel_Admin_Remoto.bat`, `Admin_Console.py`) de um servidor dedicado de *Project Zomboid*. O software integra controle de ciclo de vida do processo Java (`zombie.network.GameServer`), cliente Source RCON nativo em Rust (TCP socket direto), monitoramento de telemetria contínua de hardware e JVM (`sysinfo`), editores visuais com busca e backup automático `.bak` para `servertest.ini` e `servertest_SandboxVars.lua`, além de scanner e organizador de mods do Steam Workshop.

## Tech Stack
- **Languages:** Rust (2021 edition), TypeScript, JavaScript, CSS3, HTML5
- **Frameworks:** Tauri v2, React 18, Vite 6, Tailwind CSS v3
- **Tools:** Cargo, npm, Lucide React (sem emojis), Framer Motion, Zustand
- **Services & Protocols:** Protocolo Source RCON (TCP Socket little-endian nativo), Process Management OS/JVM (`tokio::process`), Monitor de Recursos (`sysinfo` v0.33)

## Folder Structure
```text
VICCS_PZ_ServerManager/
├── .agent/
│   ├── context/
│   │   ├── architecture.md
│   │   └── stack.md
│   ├── guidelines/
│   │   ├── code_style.md
│   │   └── ui_ux.md
│   ├── memory/
│   │   ├── active_task.md
│   │   ├── changelog.md
│   │   └── todos.md
│   └── overview/
│       └── PROJECT_STATUS.md
├── dist/
├── node_modules/
├── src-tauri/
│   ├── Cargo.lock
│   ├── Cargo.toml
│   ├── build.rs
│   ├── capabilities/
│   │   └── default.json
│   ├── icons/
│   ├── tauri.conf.json
│   └── src/
│       ├── lib.rs
│       ├── main.rs
│       ├── core/
│       │   ├── mod.rs
│       │   ├── maintenance.rs
│       │   ├── process_manager.rs
│       │   ├── rcon_client.rs
│       │   └── resource_monitor.rs
│       ├── parser/
│       │   ├── mod.rs
│       │   ├── ini_engine.rs
│       │   └── lua_engine.rs
│       └── scanner/
│           ├── mod.rs
│           └── mod_scanner.rs
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── components/
│   │   ├── config/
│   │   │   ├── ConfigTabsView.tsx
│   │   │   ├── IniConfigEditor.tsx
│   │   │   └── SandboxConfigEditor.tsx
│   │   ├── console/
│   │   │   └── LiveConsole.tsx
│   │   ├── dashboard/
│   │   │   ├── AdminActionsGrid.tsx
│   │   │   ├── MaintenanceCards.tsx
│   │   │   ├── NativeCommandsModal.tsx
│   │   │   ├── ScheduledShutdownModal.tsx
│   │   │   └── ServerStatusHUD.tsx
│   │   ├── diagnostics/
│   │   │   └── AppLogsView.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopHeader.tsx
│   │   ├── mods/
│   │   │   └── ModManagerView.tsx
│   │   ├── monitor/
│   │   │   └── ResourceCharts.tsx
│   │   ├── settings/
│   │   │   └── AppSettingsView.tsx
│   │   └── ui/
│   │       ├── TacticalButton.tsx
│   │       ├── TacticalCard.tsx
│   │       ├── TacticalInput.tsx
│   │       ├── TacticalModal.tsx
│   │       └── TacticalSwitch.tsx
│   ├── store/
│   │   └── serverStore.ts
│   └── types/
│       └── index.ts
├── app-icon.png
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Key Files
- `src-tauri/src/core/process_manager.rs`: Spawn e gerenciamento assíncrono do processo `java.exe` com sanitização de memória RAM (`-Xms`/`-Xmx`), pipes assíncronos e stream de stdout/stderr para o frontend via eventos Tauri e gravação em disco.
- `src-tauri/src/core/rcon_client.rs`: Implementação nativa do protocolo Source RCON via TCP com autenticação e execução direta de comandos in-game sem dependência de Python.
- `src-tauri/src/core/resource_monitor.rs`: Coleta contínua de métricas de uso de CPU global, memória RAM do host e memória da JVM (`zombie.network.GameServer`).
- `src-tauri/src/core/maintenance.rs`: Funções de backup com timestamp em `%USERPROFILE%\Zomboid_Backups`, atalhos de pastas do sistema, cancelamento de shutdown do Windows (`shutdown /a`), agendamento de shutdown (`shutdown /s /t`) e wipe de saves com confirmação em caixa alta.
- `src-tauri/src/parser/ini_engine.rs`: Leitura e escrita de `servertest.ini` com preservação estrutural e backup automático defensivo (`.bak`).
- `src-tauri/src/parser/lua_engine.rs`: Manipulação e gravação segura de tabelas Lua de `SandboxVars.lua` com backup defensivo.
- `src-tauri/src/scanner/mod_scanner.rs`: Varredura de pastas de mods do Steam Workshop e diretórios locais, separando estritamente IDs numéricos e nomes de mods.
- `src/components/dashboard/ServerStatusHUD.tsx`: HUD tático seguindo a regra dos 3 segundos com status (Operacional/Bootando/Offline), consumo de memória da JVM, contagem de jogadores e métricas da máquina.
- `src/components/dashboard/AdminActionsGrid.tsx`: Ações administrativas (11 a 99) com compatibilidade Build 42, slide toggle de chuva, e abertura de modais táticos.
- `src/components/dashboard/ScheduledShutdownModal.tsx`: Opção 55 completa com contagem regressiva em minutos/horas, avisos periódicos in-game e Discord, save, backup automático e desligamento seguro do Windows.
- `src/components/dashboard/NativeCommandsModal.tsx`: Manual de comandos nativos da Build 42 indexado com busca, categorias e execução rápida.
- `src/components/diagnostics/AppLogsView.tsx`: Central de diagnósticos do app com visualização ao vivo e leitura de arquivos persistidos no disco.
- `src/components/console/LiveConsole.tsx`: Terminal tático em tempo real com stream de logs, filtros, busca instantânea e histórico de comandos com setas.
- `src/store/serverStore.ts`: Store reativo Zustand centralizando o estado do servidor, logs, telemetria, configurações, rotina de desligamento programado e modais.

## Current Features Implemented
- [x] Scaffolding completo do projeto em Tauri v2 + React 18 + TypeScript + Tailwind CSS.
- [x] Design System "Tactical Glass" com paleta dark military, liquid glass blur, tipografia técnica (`JetBrains Mono` + `Inter`) e zero emojis na interface.
- [x] Backend Rust compilado sem erros (`cargo check` verificado com exit code 0).
- [x] Frontend React compilado e validado em bundle de produção (`npm run build` verificado com exit code 0).
- [x] Geração dos instaladores de produção `.exe` (NSIS) e `.msi` via `npx tauri build`.
- [x] Launcher com seleção de RAM customizada (presets de 4G a 64G ou digitação livre de 1 a 128 GB).
- [x] Opção 55: Encerramento programado em minutos/horas, avisos in-game `servermsg`, alertas Discord, `save` prévio, snapshot de backup, `quit` e comando `shutdown /s` do Windows com abortagem imediata.
- [x] Engenharia reversa e correção de chaves de Skills da Build 42 (`Woodwork`, `Doctor`, `Sneak` e 9 novos ofícios).
- [x] Cura de jogador no RCON via `godmodeplayer` na Build 42.
- [x] Controle unificado de clima (chuva ON/OFF via slide switch).
- [x] Manual interativo de comandos nativos com busca instantânea e divisão por categorias.
- [x] Persistência automática de logs em disco (`%USERPROFILE%\Zomboid\ServerManager_Logs\`) e tela de diagnósticos.
- [x] Dashboard operacional completo (HUD de 3 segundos, ações rápidas de manutenção e grade RCON).
- [x] Terminal de Console em tempo real com streaming de stdout/stderr e envio de comandos livres.
- [x] Monitor de Recursos em tempo real com gráfico de CPU e listagem de mods ativos em chips.
- [x] Editor de configuração geral (`servertest.ini`) com busca instantânea e backup automático.
- [x] Editor de Sandbox Lua com suporte ao bloco Vanilla e tabelas de mais de 80 mods.
- [x] Gerenciador de Mods com detecção automática do Steam Workshop e ordenação de prioridade de carregamento.
- [x] Tela de Ajustes do app com diretórios customizáveis e credenciais RCON locais.

## Work-in-Progress & Known TODOs
- [ ] Editor assistido de coordenadas X/Y/Z para `spawnpoints.lua` (Fase 3).
- [ ] Auto-reconexão com retry progressivo em caso de timeout de rede RCON.
