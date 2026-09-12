# PZ Server Manager — Backlog & Roadmap (todos.md)

## Entregas Concluídas (Fase 1 & Fase 2)
- [x] Scaffolding do projeto em Tauri v2 (Rust + React 18 + Tailwind CSS).
- [x] Sistema de design tokens "Tactical Glass" (cores semânticas, blur, zero emojis).
- [x] Spawner assíncrono do processo `java.exe` com controle de RAM normalizada.
- [x] Stream em tempo real de logs (`stdout`/`stderr`) para o frontend via eventos Tauri.
- [x] Cliente Source RCON nativo em Rust (TCP socket com autenticação e comandos).
- [x] Dashboard operacional com HUD da regra dos 3 segundos (Status, RAM JVM, Players, CPU).
- [x] Botões de manutenção rápida (Backup, Abrir Pastas, Cancelar Shutdown, Wipe com CONFIRMAR).
- [x] Grade completa de ações de admin (11 a 99 do script legado) em modais padronizados.
- [x] Terminal de console interativo com filtros e histórico de comandos livres.
- [x] Monitor de recursos com telemetria contínua via `sysinfo`.
- [x] Editor do `servertest.ini` com categorias lógicas, busca em tempo real e backup `.bak`.
- [x] Editor do `servertest_SandboxVars.lua` com backup `.lua.bak`.
- [x] Gerenciador de Mods com scanner de Workshop e local, ordenação e separação estrita de IDs numéricos e nomes.
- [x] Tela de ajustes com caminhos configuráveis e webhooks do Discord opcionais.
- [x] Validação de compilação do Rust (`cargo check` = 0) e build de produção do frontend (`npm run build` = 0).
- [x] Documentação de arquitetura, stack, UI/UX e code style integradas ao córtex `.agent`.

## Próximos Passos (Fase 3 & Refinamentos)
- [ ] Testar execução em tempo real na máquina do usuário via `npm run tauri dev`.
- [ ] Gerar instalador final `.exe` (NSIS) via `npm run tauri build`.
- [ ] Editor assistido de coordenadas de spawn X/Y/Z para `spawnpoints.lua`.
- [ ] Auto-reconexão com retry progressivo em caso de timeout de rede RCON.
