use font_kit::source::SystemSource;
use serde::Serialize;
use std::sync::OnceLock;

#[derive(Serialize, Clone)]
pub struct FontFamily {
    family: String,
    styles: Vec<String>,
}

static FONT_CACHE: OnceLock<Vec<FontFamily>> = OnceLock::new();

#[cfg(target_os = "windows")]
fn windows_font_aliases(family: &str) -> &'static [&'static str] {
    match family {
        "Microsoft YaHei" => &["Microsoft YaHei UI", "Noto Sans SC", "DengXian", "SimHei"],
        "Microsoft JhengHei" => &["Microsoft JhengHei UI", "Microsoft YaHei UI"],
        "Yu Gothic" => &["Microsoft YaHei UI"],
        "Malgun Gothic" => &["Microsoft YaHei UI"],
        "SimSun" => &["NSimSun", "SimHei", "Noto Sans SC"],
        _ => &[],
    }
}

#[cfg(not(target_os = "windows"))]
fn windows_font_aliases(_family: &str) -> &'static [&'static str] {
    &[]
}

fn select_family_handle(source: &SystemSource, family: &str) -> Result<font_kit::family_handle::FamilyHandle, String> {
    if let Ok(handle) = source.select_family_by_name(family) {
        return Ok(handle);
    }

    for alias in windows_font_aliases(family) {
        if let Ok(handle) = source.select_family_by_name(alias) {
            return Ok(handle);
        }
    }

    let requested = family.to_ascii_lowercase();
    if let Ok(families) = source.all_families() {
        for candidate in families {
            let normalized = candidate.to_ascii_lowercase();
            if normalized == requested {
                if let Ok(handle) = source.select_family_by_name(&candidate) {
                    return Ok(handle);
                }
            }
            if normalized.starts_with(&requested)
                || requested.starts_with(&normalized)
                || normalized.replace(" ui", "") == requested
            {
                if let Ok(handle) = source.select_family_by_name(&candidate) {
                    return Ok(handle);
                }
            }
        }
    }

    Err(format!("Font family not found: {family}"))
}

fn enumerate_system_fonts() -> Vec<FontFamily> {
    let source = SystemSource::new();
    let mut families: Vec<FontFamily> = Vec::new();

    if let Ok(family_names) = source.all_families() {
        for name in family_names {
            // Names only — loading every font file at startup OOMs WebView2 on Windows.
            families.push(FontFamily {
                family: name,
                styles: vec!["Regular".to_string()],
            });
        }
    }

    families.sort_by(|a, b| a.family.cmp(&b.family));
    families
}

#[tauri::command]
pub async fn list_system_fonts() -> Vec<FontFamily> {
    if let Some(cached) = FONT_CACHE.get() {
        return cached.clone();
    }

    let families = tauri::async_runtime::spawn_blocking(enumerate_system_fonts)
        .await
        .unwrap_or_default();
    let _ = FONT_CACHE.set(families.clone());
    families
}

fn load_system_font_blocking(family: String, style: String) -> Result<Vec<u8>, String> {
    let source = SystemSource::new();
    let family_handle = select_family_handle(&source, &family)?;

    let is_italic = style.contains("Italic");
    let weight_str = style.replace(" Italic", "");
    let weight = match weight_str.as_str() {
        "Thin" => font_kit::properties::Weight::THIN,
        "ExtraLight" => font_kit::properties::Weight::EXTRA_LIGHT,
        "Light" => font_kit::properties::Weight::LIGHT,
        "Regular" | "" => font_kit::properties::Weight::NORMAL,
        "Medium" => font_kit::properties::Weight::MEDIUM,
        "SemiBold" => font_kit::properties::Weight::SEMIBOLD,
        "Bold" => font_kit::properties::Weight::BOLD,
        "ExtraBold" => font_kit::properties::Weight::EXTRA_BOLD,
        "Black" => font_kit::properties::Weight::BLACK,
        _ => font_kit::properties::Weight::NORMAL,
    };
    let style_prop = if is_italic {
        font_kit::properties::Style::Italic
    } else {
        font_kit::properties::Style::Normal
    };

    for handle in family_handle.fonts() {
        if let Ok(font) = handle.load() {
            let props = font.properties();
            let w_diff = (props.weight.0 - weight.0).abs();
            if w_diff < 50.0 && props.style == style_prop {
                if let Some(data) = font.copy_font_data() {
                    return Ok((*data).clone());
                }
            }
        }
    }

    if let Some(handle) = family_handle.fonts().first() {
        if let Ok(font) = handle.load() {
            if let Some(data) = font.copy_font_data() {
                return Ok((*data).clone());
            }
        }
    }

    Err(format!("Could not load font {family} {style}"))
}

#[cfg(test)]
mod tests {
    use super::windows_font_aliases;

    #[test]
    fn windows_aliases_prefer_ui_or_cjk_fallbacks() {
        assert_eq!(
            windows_font_aliases("Microsoft YaHei"),
            ["Microsoft YaHei UI", "Noto Sans SC", "DengXian", "SimHei"]
        );
        assert_eq!(
            windows_font_aliases("SimSun"),
            ["NSimSun", "SimHei", "Noto Sans SC"]
        );
    }
}

#[tauri::command]
pub async fn load_system_font(family: String, style: String) -> Result<Vec<u8>, String> {
    tauri::async_runtime::spawn_blocking(move || load_system_font_blocking(family, style))
        .await
        .map_err(|e| format!("Font load task failed: {e}"))?
}
