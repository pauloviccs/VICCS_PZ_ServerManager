// Previne abrir janela de terminal em release builds no Windows
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    pz_server_manager_lib::run();
}
