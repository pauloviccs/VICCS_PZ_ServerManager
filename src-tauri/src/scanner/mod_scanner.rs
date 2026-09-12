use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DetectedMod {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub workshop_id: Option<String>,
    pub path: String,
    pub is_workshop: bool,
}

fn parse_mod_info(info_path: &Path, workshop_id: Option<String>) -> Option<DetectedMod> {
    let content = fs::read_to_string(info_path).ok()?;
    let mut id = None;
    let mut name = None;
    let mut description = None;

    for line in content.lines() {
        let trimmed = line.trim();
        if let Some((k, v)) = trimmed.split_once('=') {
            let key = k.trim().to_lowercase();
            let val = v.trim().to_string();
            match key.as_str() {
                "id" => id = Some(val),
                "name" => name = Some(val),
                "description" => description = Some(val),
                _ => {}
            }
        }
    }

    if let (Some(mod_id), Some(mod_name)) = (id, name) {
        Some(DetectedMod {
            id: mod_id,
            name: mod_name,
            description,
            workshop_id: workshop_id.clone(),
            path: info_path.parent().unwrap_or(info_path).to_string_lossy().to_string(),
            is_workshop: workshop_id.is_some(),
        })
    } else {
        None
    }
}

pub fn scan_workshop_mods(workshop_dir: Option<String>) -> Vec<DetectedMod> {
    let base = workshop_dir
        .map(PathBuf::from)
        .unwrap_or_else(|| PathBuf::from("C:\\pzserver\\steamapps\\workshop\\content\\108600"));

    let mut detected = Vec::new();
    if !base.exists() {
        return detected;
    }

    if let Ok(entries) = fs::read_dir(&base) {
        for entry in entries.flatten() {
            let item_path = entry.path();
            if item_path.is_dir() {
                let workshop_id = item_path.file_name().and_then(|n| n.to_str()).map(|s| s.to_string());
                let mods_sub = item_path.join("mods");

                let search_dirs = if mods_sub.exists() {
                    vec![mods_sub]
                } else {
                    vec![item_path]
                };

                for search_dir in search_dirs {
                    if let Ok(sub_entries) = fs::read_dir(&search_dir) {
                        for sub_entry in sub_entries.flatten() {
                            let mod_folder = sub_entry.path();
                            if mod_folder.is_dir() {
                                let info_file = mod_folder.join("mod.info");
                                if info_file.exists() {
                                    if let Some(m) = parse_mod_info(&info_file, workshop_id.clone()) {
                                        detected.push(m);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    detected
}

pub fn scan_local_mods(local_dir: Option<String>) -> Vec<DetectedMod> {
    let base = local_dir.map(PathBuf::from).unwrap_or_else(|| {
        let userprofile = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string());
        PathBuf::from(userprofile).join("Zomboid").join("mods")
    });

    let mut detected = Vec::new();
    if !base.exists() {
        return detected;
    }

    if let Ok(entries) = fs::read_dir(&base) {
        for entry in entries.flatten() {
            let mod_folder = entry.path();
            if mod_folder.is_dir() {
                let info_file = mod_folder.join("mod.info");
                if info_file.exists() {
                    if let Some(m) = parse_mod_info(&info_file, None) {
                        detected.push(m);
                    }
                }
            }
        }
    }

    detected
}
