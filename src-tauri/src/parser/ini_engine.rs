use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IniOption {
    pub key: String,
    pub value: String,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IniConfigData {
    pub file_path: String,
    pub options: HashMap<String, String>,
}

fn get_default_ini_path() -> PathBuf {
    let userprofile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string());
    PathBuf::from(userprofile).join("Zomboid").join("Server").join("servertest.ini")
}

pub fn read_ini_file(custom_path: Option<String>) -> Result<IniConfigData, String> {
    let path = custom_path
        .map(PathBuf::from)
        .unwrap_or_else(get_default_ini_path);

    if !path.exists() {
        return Err(format!("Arquivo INI não encontrado em: {}", path.display()));
    }

    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Erro ao ler arquivo INI: {}", e))?;

    let mut options = HashMap::new();

    for line in content.lines() {
        let trimmed = line.trim();
        if trimmed.is_empty() || trimmed.starts_with('#') {
            continue;
        }

        if let Some((k, v)) = trimmed.split_once('=') {
            let key = k.trim().to_string();
            let value = v.trim().to_string();
            options.insert(key, value);
        }
    }

    Ok(IniConfigData {
        file_path: path.to_string_lossy().to_string(),
        options,
    })
}

pub fn save_ini_file(
    data: HashMap<String, String>,
    custom_path: Option<String>,
) -> Result<String, String> {
    let path = custom_path
        .map(PathBuf::from)
        .unwrap_or_else(get_default_ini_path);

    // Cria backup prévio (.bak) se o arquivo existir
    if path.exists() {
        let bak_path = path.with_extension("ini.bak");
        let _ = fs::copy(&path, &bak_path);
    }

    let mut lines = Vec::new();

    // Se arquivo já existe, preserva comentários e estrutura
    if path.exists() {
        if let Ok(existing_content) = fs::read_to_string(&path) {
            let mut seen_keys = HashMap::new();
            for line in existing_content.lines() {
                let trimmed = line.trim();
                if trimmed.starts_with('#') || trimmed.is_empty() {
                    lines.push(line.to_string());
                    continue;
                }

                if let Some((k, _)) = trimmed.split_once('=') {
                    let key = k.trim();
                    seen_keys.insert(key.to_string(), true);
                    if let Some(new_val) = data.get(key) {
                        lines.push(format!("{}={}", key, new_val));
                    } else {
                        lines.push(line.to_string());
                    }
                } else {
                    lines.push(line.to_string());
                }
            }

            // Adiciona novas chaves que não existiam antes
            for (k, v) in &data {
                if !seen_keys.contains_key(k) {
                    lines.push(format!("{}={}", k, v));
                }
            }
        }
    } else {
        // Arquivo novo: grava direto
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        for (k, v) in &data {
            lines.push(format!("{}={}", k, v));
        }
    }

    let output = lines.join("\r\n");
    fs::write(&path, output)
        .map_err(|e| format!("Erro ao salvar arquivo INI: {}", e))?;

    Ok(path.to_string_lossy().to_string())
}
