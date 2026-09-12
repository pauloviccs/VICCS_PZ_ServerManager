mod core;
mod parser;
mod scanner;

use core::maintenance;
use core::process_manager::ProcessManagerState;
use core::rcon_client::RconClient;
use core::resource_monitor::ResourceMonitor;
use parser::ini_engine::{self, IniConfigData};
use parser::lua_engine::{self, LuaSandboxData};
use scanner::mod_scanner::{self, DetectedMod};
use std::collections::HashMap;
use std::sync::Arc;
use tauri::{AppHandle, State};

pub struct AppState {
    pub process_manager: ProcessManagerState,
    pub rcon: RconClient,
    pub resource_monitor: ResourceMonitor,
}

#[tauri::command]
async fn start_server(
    app: AppHandle,
    state: State<'_, Arc<AppState>>,
    server_path: Option<String>,
    ram: Option<String>,
    server_name: Option<String>,
) -> Result<u32, String> {
    let pid = state.process_manager.start(app, server_path, ram, server_name).await?;
    state.resource_monitor.set_target_pid(pid);
    Ok(pid)
}

#[tauri::command]
async fn stop_server(
    app: AppHandle,
    state: State<'_, Arc<AppState>>,
) -> Result<(), String> {
    state.resource_monitor.set_target_pid(0);
    // Tenta primeiro salvar via RCON se estiver conectado
    if state.rcon.is_connected().await {
        let _ = state.rcon.execute("save").await;
        tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
        let _ = state.rcon.execute("quit").await;
        tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
    }
    state.process_manager.stop(app).await
}

#[tauri::command]
async fn get_server_status(state: State<'_, Arc<AppState>>) -> Result<String, String> {
    Ok(state.process_manager.get_status().await)
}

#[tauri::command]
async fn rcon_connect(
    state: State<'_, Arc<AppState>>,
    host: String,
    port: u16,
    password: String,
) -> Result<String, String> {
    state.rcon.connect(&host, port, &password).await
}

#[tauri::command]
async fn rcon_disconnect(state: State<'_, Arc<AppState>>) -> Result<(), String> {
    state.rcon.disconnect().await;
    Ok(())
}

#[tauri::command]
async fn rcon_execute(
    state: State<'_, Arc<AppState>>,
    command: String,
) -> Result<String, String> {
    state.rcon.execute(&command).await
}

#[tauri::command]
async fn rcon_is_connected(state: State<'_, Arc<AppState>>) -> Result<bool, String> {
    Ok(state.rcon.is_connected().await)
}

#[tauri::command]
fn create_backup() -> Result<String, String> {
    maintenance::create_backup()
}

#[tauri::command]
fn open_folder(target: String) -> Result<(), String> {
    maintenance::open_folder(&target)
}

#[tauri::command]
fn wipe_world(confirmation: String) -> Result<(), String> {
    maintenance::wipe_world(&confirmation)
}

#[tauri::command]
fn cancel_windows_shutdown() -> Result<String, String> {
    maintenance::cancel_windows_shutdown()
}

#[tauri::command]
fn schedule_windows_shutdown(seconds: u32) -> Result<String, String> {
    maintenance::schedule_windows_shutdown(seconds)
}

#[tauri::command]
fn read_ini(custom_path: Option<String>) -> Result<IniConfigData, String> {
    ini_engine::read_ini_file(custom_path)
}

#[tauri::command]
fn save_ini(
    data: HashMap<String, String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    ini_engine::save_ini_file(data, custom_path)
}

#[tauri::command]
fn read_sandbox(custom_path: Option<String>) -> Result<LuaSandboxData, String> {
    lua_engine::read_sandbox_lua(custom_path)
}

#[tauri::command]
fn save_sandbox(content: String, custom_path: Option<String>) -> Result<String, String> {
    lua_engine::save_sandbox_lua(content, custom_path)
}

#[tauri::command]
fn scan_all_mods(
    workshop_dir: Option<String>,
    local_dir: Option<String>,
) -> Result<Vec<DetectedMod>, String> {
    let mut all = mod_scanner::scan_workshop_mods(workshop_dir);
    all.extend(mod_scanner::scan_local_mods(local_dir));
    Ok(all)
}

pub fn run() {
    let app_state = Arc::new(AppState {
        process_manager: ProcessManagerState::new(),
        rcon: RconClient::new(),
        resource_monitor: ResourceMonitor::new(),
    });

    tauri::Builder::default()
        .manage(app_state.clone())
        .setup(move |app| {
            // Inicia o monitor de recursos em background
            app_state.resource_monitor.start(app.handle().clone());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_server,
            stop_server,
            get_server_status,
            rcon_connect,
            rcon_disconnect,
            rcon_execute,
            rcon_is_connected,
            create_backup,
            open_folder,
            wipe_world,
            cancel_windows_shutdown,
            schedule_windows_shutdown,
            read_ini,
            save_ini,
            read_sandbox,
            save_sandbox,
            scan_all_mods
        ])
        .run(tauri::generate_context!())
        .expect("Erro ao executar Tauri application");
}
