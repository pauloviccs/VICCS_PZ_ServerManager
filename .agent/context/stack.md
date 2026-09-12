# Stack Tecnológica

## Shell Desktop & Backend
- **Framework:** Tauri v2
- **Linguagem Backend:** Rust 2021
- **Crates Principais:**
  - `tauri` (v2): Shell do aplicativo, IPC e WebView.
  - `tokio`: Execução assíncrona, pipes de processo e streams de socket TCP.
  - `sysinfo`: Monitoramento de CPU global, RAM e métricas do processo `java.exe`.
  - `serde`, `serde_json`: Serialização e desserialização de dados para o frontend.
  - `chrono`: Gerador de timestamps para rotinas de backup.

## Frontend
- **Framework:** React 18
- **Linguagem:** TypeScript
- **Bundler:** Vite
- **Estilização:** Tailwind CSS (v3/v4 compatível) com variáveis CSS nativas (tokens Tactical Glass).
- **Ícones:** `lucide-react` (monocromáticos, sem emojis).
- **Animações:** `framer-motion` (transições de acordeões, modais e switches).
- **Gerenciamento de Estado:** `zustand` (leve e reativo).
