# Arquitetura do PZ Server Manager

## Visão Geral
O **PZ Server Manager** é um aplicativo desktop projetado em **Tauri v2 (Rust + React)** para unificar todas as operações do servidor dedicado de Project Zomboid (substituindo scripts `.bat`, `.py` de console RCON, e edição manual de `.ini`/`.lua`).

## Componentes Arquiteturais

### 1. Frontend (React 18 + TypeScript + Tailwind CSS)
- **Layout & Navegação:** Sidebar fixa estilo HUD militar com 6 abas principais:
  1. *Dashboard:* Status do servidor, botão dinâmico Iniciar/Parar com RAM, cards de manutenção rápida e grade de ações administrativas (11-99).
  2. *Console:* Terminal ao vivo com stream de stdout/stderr e respostas RCON, com input de comandos livres.
  3. *Monitor de Recursos:* Gráficos em tempo real de CPU global, RAM global e RAM específica do processo Java (`zombie.network.GameServer`).
  4. *Configuração do Servidor:* Sub-abas para edição de `servertest.ini` e `servertest_SandboxVars.lua`.
  5. *Mods & Workshop:* Duas colunas com ordenação de carregamento e separação estrita de WorkshopItems e Mods.
  6. *Ajustes do App:* Caminhos do servidor/workshop, credenciais RCON e notificações Discord opcionais.
- **Design System "Tactical Glass":**
  - Paleta base ultra-escura (`#0B0D0C`), cartões translúcidos com blur e borda sutil.
  - Acentos em Âmbar (`#E4A94A`), Verde (`#7CFFB2`), Vermelho (`#FF5C5C`) e Ciano (`#38BDF8`).
  - Ícones vetoriais monocromáticos (`lucide-react`). **Zero emojis**.
  - Toggles em pílula única (Framer Motion).

### 2. Backend Nativo (Rust / Tauri v2)
- **Process Manager (`process_manager.rs`):**
  - Invoca `.\jre64\bin\java.exe` com classpath e parâmetros de otimização (`-XX:+UseZGC`, etc.).
  - Captura stdout/stderr em pipes assíncronos e transmite para o frontend via eventos Tauri (`server-log`).
  - Encerramento gracioso via sequência RCON `save` ➔ `quit` antes de terminar o processo.
- **Cliente Source RCON Nativo (`rcon_client.rs`):**
  - Conexão TCP direta com o servidor PZ implementando o protocolo Source RCON.
  - Autenticação e execução de comandos sem necessidade de interpretador Python externo.
- **Resource Monitor (`resource_monitor.rs`):**
  - Coleta de métricas do sistema e do PID do `java.exe` via crate `sysinfo`.
- **Parser/Serializer Engine (`ini_engine.rs` & `lua_engine.rs`):**
  - Leitura e serialização de `servertest.ini` e `servertest_SandboxVars.lua` preservando metadados e comentários.
  - Criação de backup automático (`.bak`) antes de qualquer gravação no disco.
- **Mod Scanner (`mod_scanner.rs`):**
  - Varredura de pastas de mods do Steam Workshop e locais, garantindo separação estrita de `WorkshopItems=` (numérico) e `Mods=` (nome interno).
