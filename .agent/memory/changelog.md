# Changelog

Todas as alterações relevantes e marcos de desenvolvimento do PZ Server Manager são registrados neste arquivo.

## [1.1.0] - 2026-09-12
### Adicionado & Melhorias (Build 42 & Opção 55)
- **RAM Customizada:** Seletor de memória RAM no cabeçalho com presets comuns (4G a 64G) e modo de edição inline permitindo selecionar qualquer quantidade de 1 a 128 GB.
- **Opção 55 (Encerramento Programado & Backup Automático):**
  - Modal interativo para programar encerramento em minutos ou horas.
  - Avisos in-game via RCON `servermsg` a cada minuto e contagem regressiva crítica nos momentos finais (60s, 30s, 15s, 10s... 1s).
  - Notificações automáticas integradas no canal do Discord.
  - Salvamento automático de chunks (`save`), geração de snapshot de backup timestamped em `Zomboid_Backups` e finalização segura do processo (`quit`).
  - Integração com `shutdown /s /t <sec>` do Windows com atraso configurável e botão global de abortar/cancelar (`shutdown /a`).
- **Engenharia Reversa & Correção de Skills B42:**
  - Identificadores Java nativos corrigidos: `Woodwork` (Carpintaria), `Doctor` (Primeiros Socorros) e `Sneak` (Furtividade).
  - Adicionadas 9 novas perícias da Build 42 (`Blacksmith`, `Masonry`, `Pottery`, `Glassmaking`, `Carving`, `FlintKnapping`, `Tracking`, `Husbandry`, `Butchering`).
- **Cura de Jogador na B42:** Comando RCON atualizado para o padrão nativo `godmodeplayer "<nick>" -true/-false`.
- **Controle de Chuva Unificado:** Slide toggle `TacticalSwitch` substituindo botões separados.
- **Manual Interativo de Comandos B42:** Interface com busca instantânea, divisão por categorias e cópia/execução rápida.
- **Logs do App Persistentes em Disco:** Gravação em `%USERPROFILE%\Zomboid\ServerManager_Logs\pz_manager_<data>.log` e nova aba "Logs do App" na Sidebar.
- **Compilação de Instaladores:** Geração dos pacotes de produção NSIS `.exe` e `.msi` via Tauri v2.

## [1.0.0] - 2026-09-12
### Adicionado
- **Arquitetura & Shell:** Inicialização do workspace Tauri v2 com Rust 2021 e React 18 / Vite 6.
- **Design System "Tactical Glass":** Implementação de componentes de interface reutilizáveis (`TacticalCard`, `TacticalButton`, `TacticalSwitch`, `TacticalInput`, `TacticalModal`) com tokens dark military, liquid glass blur e tipografia monoesperada (`JetBrains Mono`). Zero emojis na UI.
- **Process Manager em Rust:** Motor assíncrono para inicialização de `java.exe` do PZ com argumentos otimizados (`-XX:+UseZGC`, etc.), normalização de memória RAM (`Ng`) e canais assíncronos de stdout/stderr transmitidos via eventos Tauri.
- **Cliente Source RCON Nativo:** Implementação pura em Rust do protocolo Source RCON via TCP com autenticação little-endian e execução de comandos sem depender de Python externo.
- **Dashboard Operacional:**
  - HUD de 3 segundos com status do servidor (Operacional/Bootando/Offline), barra de uso de memória da JVM, contador de jogadores ativos e recursos do host.
  - Botão principal dinâmico Iniciar / Parar Servidor com salvamento preventivo (`save` ➔ `quit`).
  - Ações rápidas de manutenção do `Zomboid.bat`: Backup com timestamp em `%USERPROFILE%\Zomboid_Backups`, atalhos de pastas, cancelamento de shutdown do Windows e Wipe de saves protegido por digitação da palavra `CONFIRMAR`.
  - Grade de 25 comandos administrativos in-game (11 a 99) em modais padronizados com validação inline.
- **Console Tático em Tempo Real:** Terminal com auto-scroll inteligente, filtros por tipo (stdout, stderr, rcon), busca textual em tempo real e linha de comando RCON livre com histórico via teclas de seta.
- **Monitor de Recursos:** Telemetria contínua a cada 1.5s via `sysinfo` com sparkline de CPU, consumo de RAM da máquina e processo Java, e visualização dos mods ativos em chips.
- **Editores de Configuração:**
  - Sub-aba Geral para `servertest.ini` categorizada em seções lógicas, com busca instantânea e backup automático `.bak`.
  - Sub-aba Sandbox para `servertest_SandboxVars.lua` com suporte a 80+ mods e backup `.lua.bak`.
- **Gerenciador de Mods:** Scanner assíncrono para pastas do Steam Workshop e mods locais, visualização em duas colunas (Disponíveis vs Ativos) e garantia de gravação estrita de `WorkshopItems=` (IDs numéricos) e `Mods=` (nomes internos).
- **Ajustes:** Configuração de diretórios locais e webhook opcional do Discord protegido por `.gitignore`.
- **Ícones do App:** Geração de ícones de alta resolução e múltiplos formatos para o Windows (`icon.ico`, etc.).

### Sincronização & Governança (.agent Cortex)
- **Status do Projeto Atualizado:** Mapeamento completo de árvore de diretórios, stack e arquivos-chave em `PROJECT_STATUS.md`.
- **Preenchimento de Nó Faltante:** Criação do arquivo de diretrizes `code_style.md` formalizando convenções de Rust (Tauri) e TypeScript (React).
- **Validação Cruzada de Compilação:** `cargo check` (Rust) e `npm run build` (TypeScript/Vite) validados com sucesso sem erros.
