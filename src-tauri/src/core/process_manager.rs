use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::{Child, Command};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerLogEvent {
    pub source: String,
    pub message: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServerStatusEvent {
    pub status: String, // "offline", "starting", "online", "stopping"
    pub pid: Option<u32>,
}

pub struct ProcessManagerState {
    child: Arc<Mutex<Option<Child>>>,
    server_status: Arc<Mutex<String>>,
}

impl ProcessManagerState {
    pub fn new() -> Self {
        Self {
            child: Arc::new(Mutex::new(None)),
            server_status: Arc::new(Mutex::new("offline".to_string())),
        }
    }

    pub fn normalize_ram(input: &str) -> String {
        let mut clean = input.to_lowercase();
        clean = clean.replace("gb", "");
        clean = clean.replace("g", "");
        clean = clean.trim().to_string();

        if let Ok(num) = clean.parse::<u32>() {
            if num > 0 && num <= 128 {
                return format!("{}g", num);
            }
        }
        "16g".to_string()
    }

    pub async fn get_status(&self) -> String {
        let status = self.server_status.lock().await;
        status.clone()
    }

    pub async fn start(
        &self,
        app: AppHandle,
        server_path: Option<String>,
        ram: Option<String>,
        server_name: Option<String>,
    ) -> Result<u32, String> {
        let mut child_guard = self.child.lock().await;
        if child_guard.is_some() {
            return Err("O servidor já está em execução!".to_string());
        }

        let base_path = server_path.unwrap_or_else(|| "C:\\pzserver".to_string());
        let server_dir = PathBuf::from(&base_path);
        let java_exec = server_dir.join("jre64").join("bin").join("java.exe");

        if !java_exec.exists() {
            return Err(format!(
                "Executável Java não encontrado em: {}",
                java_exec.display()
            ));
        }

        let allocated_ram = Self::normalize_ram(&ram.unwrap_or_else(|| "16g".to_string()));
        let name = server_name.unwrap_or_else(|| "servertest".to_string());

        let mut cmd = Command::new(&java_exec);
        cmd.current_dir(&server_dir);
        cmd.arg("-Djava.awt.headless=true");
        cmd.arg("-Dzomboid.steam=1");
        cmd.arg("-Dzomboid.znetlog=1");
        cmd.arg("-XX:+UseZGC");
        cmd.arg("-XX:-CreateCoredumpOnCrash");
        cmd.arg("-XX:-OmitStackTraceInFastThrow");
        cmd.arg(format!("-Xms{}", allocated_ram));
        cmd.arg(format!("-Xmx{}", allocated_ram));
        cmd.arg("-Djava.library.path=natives/");
        cmd.arg("-cp");
        cmd.arg("java/;java/projectzomboid.jar");
        cmd.arg("zombie.network.GameServer");
        cmd.arg("-statistic");
        cmd.arg("0");
        cmd.arg("-servername");
        cmd.arg(&name);

        cmd.stdout(std::process::Stdio::piped());
        cmd.stderr(std::process::Stdio::piped());

        #[cfg(windows)]
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW (Esconde janela cmd/console no Windows)

        // Spawn do processo
        let mut child = cmd.spawn().map_err(|e| format!("Falha ao iniciar processo: {}", e))?;
        let pid = child.id().ok_or("Não foi possível obter PID do processo")?;

        let stdout = child.stdout.take().ok_or("Falha ao capturar stdout")?;
        let stderr = child.stderr.take().ok_or("Falha ao capturar stderr")?;

        *self.server_status.lock().await = "starting".to_string();
        let _ = app.emit(
            "server-status",
            ServerStatusEvent {
                status: "starting".to_string(),
                pid: Some(pid),
            },
        );

        let app_stdout = app.clone();
        let status_arc = self.server_status.clone();

        crate::core::maintenance::write_to_app_log(
            "system",
            &format!("Iniciando servidor PZ (PID: {}) com {} de RAM...", pid, allocated_ram),
        );

        // Leitor assíncrono de stdout
        tauri::async_runtime::spawn(async move {
            let mut reader = BufReader::new(stdout).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                let now = chrono::Local::now().format("%H:%M:%S").to_string();

                crate::core::maintenance::write_to_app_log("stdout", &line);

                if line.contains("*** SERVER STARTED ****") {
                    let mut st = status_arc.lock().await;
                    *st = "online".to_string();
                    let _ = app_stdout.emit(
                        "server-status",
                        ServerStatusEvent {
                            status: "online".to_string(),
                            pid: Some(pid),
                        },
                    );
                }

                let _ = app_stdout.emit(
                    "server-log",
                    ServerLogEvent {
                        source: "stdout".to_string(),
                        message: line,
                        timestamp: now,
                    },
                );
            }
        });

        // Leitor assíncrono de stderr
        let app_stderr = app.clone();
        tauri::async_runtime::spawn(async move {
            let mut reader = BufReader::new(stderr).lines();
            while let Ok(Some(line)) = reader.next_line().await {
                let now = chrono::Local::now().format("%H:%M:%S").to_string();

                crate::core::maintenance::write_to_app_log("stderr", &line);

                let _ = app_stderr.emit(
                    "server-log",
                    ServerLogEvent {
                        source: "stderr".to_string(),
                        message: line,
                        timestamp: now,
                    },
                );
            }
        });

        *child_guard = Some(child);
        Ok(pid)
    }

    pub async fn stop(&self, app: AppHandle) -> Result<(), String> {
        let mut child_guard = self.child.lock().await;
        if let Some(mut child) = child_guard.take() {
            *self.server_status.lock().await = "stopping".to_string();
            let _ = app.emit(
                "server-status",
                ServerStatusEvent {
                    status: "stopping".to_string(),
                    pid: child.id(),
                },
            );

            // Tenta aguardar ou finaliza
            let _ = child.kill().await;

            *self.server_status.lock().await = "offline".to_string();
            let _ = app.emit(
                "server-status",
                ServerStatusEvent {
                    status: "offline".to_string(),
                    pid: None,
                },
            );
            Ok(())
        } else {
            *self.server_status.lock().await = "offline".to_string();
            Err("Nenhum servidor em execução para encerrar".to_string())
        }
    }
}
