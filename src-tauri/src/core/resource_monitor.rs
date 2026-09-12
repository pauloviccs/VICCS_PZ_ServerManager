use serde::Serialize;
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, ProcessRefreshKind, RefreshKind, System};
use tauri::{AppHandle, Emitter};
use tokio::time::{sleep, Duration};

#[derive(Debug, Clone, Serialize)]
pub struct ResourceStats {
    pub cpu_global: f32,
    pub ram_global_used: u64,
    pub ram_global_total: u64,
    pub ram_global_percent: f32,
    pub server_ram_used: u64,
    pub server_cpu_percent: f32,
    pub server_running: bool,
}

pub struct ResourceMonitor {
    running: Arc<AtomicBool>,
    target_pid: Arc<AtomicU32>,
}

impl ResourceMonitor {
    pub fn new() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            target_pid: Arc::new(AtomicU32::new(0)),
        }
    }

    pub fn set_target_pid(&self, pid: u32) {
        self.target_pid.store(pid, Ordering::SeqCst);
    }

    pub fn start(&self, app: AppHandle) {
        if self.running.load(Ordering::SeqCst) {
            return;
        }

        self.running.store(true, Ordering::SeqCst);
        let is_running = self.running.clone();
        let target_pid = self.target_pid.clone();

        tauri::async_runtime::spawn(async move {
            let mut sys = System::new_with_specifics(
                RefreshKind::nothing()
                    .with_cpu(CpuRefreshKind::everything())
                    .with_memory(MemoryRefreshKind::everything())
                    .with_processes(ProcessRefreshKind::everything()),
            );

            while is_running.load(Ordering::SeqCst) {
                sys.refresh_cpu_usage();
                sys.refresh_memory();
                sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);

                let total_ram = sys.total_memory();
                let used_ram = sys.used_memory();
                let ram_percent = if total_ram > 0 {
                    (used_ram as f32 / total_ram as f32) * 100.0
                } else {
                    0.0
                };

                let cpu_global = sys.global_cpu_usage();

                // Busca processo Java pelo target_pid específico ou fallback por nome
                let mut server_ram = 0u64;
                let mut server_cpu = 0.0f32;
                let mut server_found = false;

                let specific_pid = target_pid.load(Ordering::SeqCst);
                if specific_pid > 0 {
                    let pid_val = sysinfo::Pid::from_u32(specific_pid);
                    if let Some(process) = sys.process(pid_val) {
                        server_ram = process.memory();
                        server_cpu = process.cpu_usage();
                        server_found = true;
                    }
                }

                // Fallback: se PID específico não foi fornecido ou já fechou, procura java.exe ativo
                if !server_found {
                    for (_pid, process) in sys.processes() {
                        let name = process.name().to_string_lossy().to_lowercase();
                        if name == "java.exe" || name == "java" {
                            server_ram = process.memory();
                            server_cpu = process.cpu_usage();
                            server_found = true;
                            break;
                        }
                    }
                }

                let stats = ResourceStats {
                    cpu_global,
                    ram_global_used: used_ram,
                    ram_global_total: total_ram,
                    ram_global_percent: ram_percent,
                    server_ram_used: server_ram,
                    server_cpu_percent: server_cpu,
                    server_running: server_found,
                };

                let _ = app.emit("resource-stats", stats);
                sleep(Duration::from_millis(1500)).await;
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }
}
