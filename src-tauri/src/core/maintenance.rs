use std::fs;
use std::path::{Path, PathBuf};
use std::process::Command;

fn get_userprofile() -> PathBuf {
    match std::env::var("USERPROFILE") {
        Ok(val) => PathBuf::from(val),
        Err(_) => PathBuf::from("C:\\Users\\Default"),
    }
}

fn copy_dir_all(src: impl AsRef<Path>, dst: impl AsRef<Path>) -> std::io::Result<()> {
    fs::create_dir_all(&dst)?;
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let ty = entry.file_type()?;
        if ty.is_dir() {
            copy_dir_all(entry.path(), dst.as_ref().join(entry.file_name()))?;
        } else {
            fs::copy(entry.path(), dst.as_ref().join(entry.file_name()))?;
        }
    }
    Ok(())
}

pub fn create_backup() -> Result<String, String> {
    let userprofile = get_userprofile();
    let zomboid_dir = userprofile.join("Zomboid");
    let now = chrono::Local::now().format("%Y-%m-%d_%H-%M-%S").to_string();
    let backup_dir = userprofile.join("Zomboid_Backups").join(format!("Backup_{}", now));

    fs::create_dir_all(&backup_dir)
        .map_err(|e| format!("Falha ao criar pasta de backup: {}", e))?;

    let server_config_dir = zomboid_dir.join("Server");
    if server_config_dir.exists() {
        let dest_server = backup_dir.join("Server");
        let _ = copy_dir_all(&server_config_dir, &dest_server);
    }

    let saves_dir = zomboid_dir.join("Saves").join("Multiplayer");
    if saves_dir.exists() {
        let dest_saves = backup_dir.join("Saves").join("Multiplayer");
        let _ = copy_dir_all(&saves_dir, &dest_saves);
    }

    Ok(backup_dir.to_string_lossy().to_string())
}

pub fn open_folder(target: &str) -> Result<(), String> {
    let userprofile = get_userprofile();
    let path = match target {
        "server_config" => userprofile.join("Zomboid").join("Server"),
        "saves" => userprofile.join("Zomboid").join("Saves").join("Multiplayer"),
        "backups" => userprofile.join("Zomboid_Backups"),
        "server_root" => PathBuf::from("C:\\pzserver"),
        custom => PathBuf::from(custom),
    };

    if !path.exists() {
        let _ = fs::create_dir_all(&path);
    }

    Command::new("explorer")
        .arg(&path)
        .spawn()
        .map_err(|e| format!("Falha ao abrir o Windows Explorer: {}", e))?;

    Ok(())
}

pub fn wipe_world(confirmation: &str) -> Result<(), String> {
    if confirmation.trim() != "CONFIRMAR" {
        return Err("Confirmação de segurança inválida. É obrigatório digitar 'CONFIRMAR'.".to_string());
    }

    let userprofile = get_userprofile();
    let saves_dir = userprofile.join("Zomboid").join("Saves").join("Multiplayer");

    if saves_dir.exists() {
        fs::remove_dir_all(&saves_dir)
            .map_err(|e| format!("Falha ao limpar pasta Saves/Multiplayer: {}", e))?;
    }

    fs::create_dir_all(&saves_dir)
        .map_err(|e| format!("Falha ao recriar pasta limpa Saves/Multiplayer: {}", e))?;

    Ok(())
}

pub fn cancel_windows_shutdown() -> Result<String, String> {
    let output = Command::new("cmd")
        .args(["/C", "shutdown", "/a"])
        .output()
        .map_err(|e| format!("Falha ao executar comando shutdown /a: {}", e))?;

    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    if output.status.success() {
        Ok("Desligamento agendado do Windows cancelado com sucesso!".to_string())
    } else {
        if stderr.contains("1116") || stderr.to_lowercase().contains("não foi possível") {
            Ok("Nenhum desligamento do Windows estava agendado.".to_string())
        } else {
            Err(format!("Aviso: {}", stderr.trim()))
        }
    }
}

pub fn schedule_windows_shutdown(seconds: u32) -> Result<String, String> {
    let output = Command::new("cmd")
        .args(["/C", "shutdown", "/s", "/t", &seconds.to_string()])
        .output()
        .map_err(|e| format!("Falha ao executar shutdown /s: {}", e))?;

    if output.status.success() {
        Ok(format!("Desligamento do Windows agendado para daqui a {} segundos.", seconds))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Erro ao agendar desligamento: {}", stderr))
    }
}
