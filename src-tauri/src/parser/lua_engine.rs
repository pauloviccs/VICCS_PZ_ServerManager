use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LuaSandboxData {
    pub file_path: String,
    pub raw_content: String,
}

fn get_default_sandbox_path() -> PathBuf {
    let userprofile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string());
    PathBuf::from(userprofile).join("Zomboid").join("Server").join("servertest_SandboxVars.lua")
}

pub fn read_sandbox_lua(custom_path: Option<String>) -> Result<LuaSandboxData, String> {
    let path = custom_path
        .map(PathBuf::from)
        .unwrap_or_else(get_default_sandbox_path);

    if !path.exists() {
        return Err(format!("Arquivo Lua Sandbox não encontrado em: {}", path.display()));
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Erro ao ler arquivo Lua Sandbox: {}", e))?;

    Ok(LuaSandboxData {
        file_path: path.to_string_lossy().to_string(),
        raw_content: content,
    })
}

pub fn save_sandbox_lua(
    content: String,
    custom_path: Option<String>,
) -> Result<String, String> {
    let path = custom_path
        .map(PathBuf::from)
        .unwrap_or_else(get_default_sandbox_path);

    if path.exists() {
        let bak_path = path.with_extension("lua.bak");
        let _ = fs::copy(&path, &bak_path);
    } else {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
    }

    fs::write(&path, content)
        .map_err(|e| format!("Erro ao salvar arquivo Lua: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}
