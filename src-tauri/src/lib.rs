use serde::Serialize;
use std::{
    cmp::Reverse,
    path::Path,
    process::Command,
    sync::Mutex,
    time::{Duration, Instant},
};
use sysinfo::{Networks, ProcessesToUpdate, System};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

mod tray_status;

use tray_status::{start_tray_status_worker, TrayStatusController, TrayStatusSettings};

// フロントに返すデータの形。Serializeを付けるとJSONに変換できるようになる
#[derive(Serialize)]
struct SystemUsage {
    cpu_usage: f32, // 全体CPU使用率(%)
    cpu_name: String,
    top_cpu_processes: Vec<ProcessUsage>,
    top_memory_processes: Vec<ProcessUsage>,
    mem_used: u64,  // 使用中メモリ(バイト)
    mem_total: u64, // 総メモリ(バイト)
}

// アプリ全体で共有する状態。Mutexで包むことで複数スレッドから安全に書き換えられる
#[derive(Clone, Serialize)]
struct ProcessUsage {
    pid: String,
    name: String,
    cpu_usage: f32,
    memory_bytes: u64,
}

#[derive(Serialize)]
struct NetworkUsage {
    download_mbps: f64,
    upload_mbps: f64,
}

#[derive(serde::Deserialize)]
struct PingTarget {
    host: String,
}

#[derive(Serialize)]
struct PingResult {
    latency_ms: u64,
}

#[derive(serde::Deserialize)]
struct ShortcutAction {
    action_type: ShortcutActionType,
    target: String,
}

#[derive(serde::Deserialize)]
#[serde(rename_all = "lowercase")]
enum ShortcutActionType {
    Url,
    File,
    App,
}

struct AppState {
    sys: Mutex<System>,
    networks: Mutex<Networks>,
    last_network_refresh: Mutex<Instant>,
}

#[tauri::command]
fn get_system_usage(state: tauri::State<AppState>) -> SystemUsage {
    // ロックを取得して中身を書き換え可能にする
    let mut sys = state.sys.lock().unwrap();

    sys.refresh_cpu_all();
    sys.refresh_memory();
    sys.refresh_processes(ProcessesToUpdate::All, true);

    let cpus = sys.cpus();
    let cpu_usage = if cpus.is_empty() {
        0.0
    } else {
        cpus.iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / cpus.len() as f32
    };
    let process_cpu_scale = if cpus.is_empty() {
        1.0
    } else {
        cpus.len() as f32
    };
    let cpu_name = cpus
        .first()
        .map(|cpu| cpu.brand().trim())
        .filter(|brand| !brand.is_empty())
        .unwrap_or("Unknown CPU")
        .to_string();
    let processes = sys
        .processes()
        .iter()
        .map(|(pid, process)| ProcessUsage {
            pid: pid.to_string(),
            name: process.name().to_string_lossy().into_owned(),
            cpu_usage: process.cpu_usage() / process_cpu_scale,
            memory_bytes: process.memory(),
        })
        .collect::<Vec<_>>();
    let mut top_cpu_processes = processes.clone();
    top_cpu_processes.sort_by(|a, b| b.cpu_usage.total_cmp(&a.cpu_usage));
    top_cpu_processes.truncate(3);

    let mut top_memory_processes = processes;
    top_memory_processes.sort_by_key(|process| Reverse(process.memory_bytes));
    top_memory_processes.truncate(3);

    SystemUsage {
        cpu_usage,
        cpu_name,
        top_cpu_processes,
        top_memory_processes,
        mem_used: sys.used_memory(),
        mem_total: sys.total_memory(),
    }
}

#[tauri::command]
fn get_network_usage(state: tauri::State<AppState>) -> NetworkUsage {
    let mut networks = state.networks.lock().unwrap();
    let mut last_network_refresh = state.last_network_refresh.lock().unwrap();
    let now = Instant::now();
    let elapsed = now.duration_since(*last_network_refresh);

    networks.refresh(true);
    *last_network_refresh = now;

    let received_bytes = networks
        .values()
        .map(|network| network.received())
        .sum::<u64>();
    let transmitted_bytes = networks
        .values()
        .map(|network| network.transmitted())
        .sum::<u64>();

    NetworkUsage {
        download_mbps: bytes_to_mbps(received_bytes, elapsed),
        upload_mbps: bytes_to_mbps(transmitted_bytes, elapsed),
    }
}

#[tauri::command]
fn measure_ping(target: PingTarget) -> Result<PingResult, String> {
    let host = target.host.trim();
    if host.is_empty() {
        return Err("Ping target host is empty".to_string());
    }

    let mut command = Command::new("ping");

    #[cfg(target_os = "windows")]
    command.args(["-n", "1", "-w", "1000"]).arg(host);

    #[cfg(target_os = "linux")]
    command.args(["-c", "1", "-W", "1"]).arg(host);

    #[cfg(target_os = "macos")]
    command.args(["-c", "1", "-W", "1000"]).arg(host);

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    command.args(["-c", "1"]).arg(host);

    let output = command
        .output()
        .map_err(|err| format!("Failed to execute ping command: {err}"))?;
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);

    if !output.status.success() {
        let message = [stdout.trim(), stderr.trim()]
            .into_iter()
            .filter(|part| !part.is_empty())
            .collect::<Vec<_>>()
            .join("\n");

        return Err(if message.is_empty() {
            "Ping command failed".to_string()
        } else {
            format!("Ping command failed: {message}")
        });
    }

    let latency_ms = parse_ping_latency_ms(&output.stdout)
        .ok_or_else(|| "Failed to parse ping command latency".to_string())?;

    Ok(PingResult { latency_ms })
}
fn parse_ping_latency_ms(output: &[u8]) -> Option<u64> {
    output
        .windows(2)
        .enumerate()
        .filter(|(_, bytes)| bytes.eq_ignore_ascii_case(b"ms"))
        .find_map(|(index, _)| parse_latency_before_ms(&output[..index]))
}

fn parse_latency_before_ms(value: &[u8]) -> Option<u64> {
    let mut end = value.len();
    while end > 0 && value[end - 1].is_ascii_whitespace() {
        end -= 1;
    }

    let mut start = end;
    while start > 0 && (value[start - 1].is_ascii_digit() || value[start - 1] == b'.') {
        start -= 1;
    }

    if start == end {
        return None;
    }

    let mut operator_index = start;
    while operator_index > 0 && value[operator_index - 1].is_ascii_whitespace() {
        operator_index -= 1;
    }

    if operator_index == 0 {
        return None;
    }

    let operator = value[operator_index - 1];
    if operator != b'=' && operator != b'<' {
        return None;
    }

    let numeric_text = std::str::from_utf8(&value[start..end]).ok()?;
    let latency = numeric_text.parse::<f64>().ok()?;

    if operator == b'<' {
        return Some(latency.ceil().max(1.0) as u64 - 1);
    }

    Some(latency.round().max(0.0) as u64)
}
#[cfg(test)]
mod tests {
    use super::parse_ping_latency_ms;

    #[test]
    fn parses_windows_ping_latency() {
        let output = "Reply from 8.8.8.8: bytes=32 time=4ms TTL=118";

        assert_eq!(parse_ping_latency_ms(output.as_bytes()), Some(4));
    }

    #[test]
    fn parses_windows_sub_millisecond_latency() {
        let output = "Reply from 127.0.0.1: bytes=32 time<1ms TTL=128";

        assert_eq!(parse_ping_latency_ms(output.as_bytes()), Some(0));
    }

    #[test]
    fn parses_japanese_windows_ping_latency() {
        let output = "8.8.8.8 からの応答: バイト数 =32 時間 =4ms TTL=118";

        assert_eq!(parse_ping_latency_ms(output.as_bytes()), Some(4));
    }

    #[test]
    fn parses_linux_ping_latency() {
        let output = "64 bytes from 8.8.8.8: icmp_seq=1 ttl=118 time=4.23 ms";

        assert_eq!(parse_ping_latency_ms(output.as_bytes()), Some(4));
    }

    #[test]
    fn parses_latency_from_non_utf8_windows_output() {
        let output = [
            0x82, 0xa9, 0x82, 0xe7, 0x82, 0xcc, b' ', b'=', b'4', b'm', b's', b' ', b'T', b'T',
            b'L', b'=', b'1', b'1', b'8',
        ];

        assert_eq!(parse_ping_latency_ms(&output), Some(4));
    }
}

fn bytes_to_mbps(bytes: u64, elapsed: Duration) -> f64 {
    let elapsed_seconds = elapsed.as_secs_f64();
    if elapsed_seconds <= 0.0 {
        return 0.0;
    }

    bytes as f64 * 8.0 / elapsed_seconds / 1_000_000.0
}

fn show_main_window_inner(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window was not found".to_string())?;

    window
        .show()
        .map_err(|err| format!("Failed to show main window: {err}"))?;
    window
        .set_focus()
        .map_err(|err| format!("Failed to focus main window: {err}"))?;

    Ok(())
}

fn hide_main_window_inner(app: &AppHandle) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "Main window was not found".to_string())?;

    window
        .hide()
        .map_err(|err| format!("Failed to hide main window: {err}"))
}

fn setup_tray(
    app: &mut tauri::App,
) -> tauri::Result<(tauri::tray::TrayIcon, tauri::menu::MenuItem<tauri::Wry>)> {
    let status_item = MenuItem::with_id(app, "status", "CPU: --", false, None::<&str>)?;
    let open_item = MenuItem::with_id(app, "open", "Open", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let status_separator = PredefinedMenuItem::separator(app)?;
    let quit_separator = PredefinedMenuItem::separator(app)?;
    let menu = Menu::with_items(
        app,
        &[
            &status_item,
            &status_separator,
            &open_item,
            &quit_separator,
            &quit_item,
        ],
    )?;

    let mut tray_builder = TrayIconBuilder::with_id("main-tray")
        .tooltip("pure_board")
        .menu(&menu)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "open" => {
                let _ = show_main_window_inner(app);
            }
            "quit" => app.exit(0),
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let _ = show_main_window_inner(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon() {
        tray_builder = tray_builder.icon(icon.clone());
    }

    let tray = tray_builder.build(app)?;

    Ok((tray, status_item))
}

#[tauri::command]
fn configure_tray_status(
    controller: tauri::State<TrayStatusController>,
    settings: TrayStatusSettings,
) -> Result<(), String> {
    controller.configure(settings)
}

#[tauri::command]
fn show_main_window(app: AppHandle) -> Result<(), String> {
    show_main_window_inner(&app)
}

#[tauri::command]
fn hide_main_window(app: AppHandle) -> Result<(), String> {
    hide_main_window_inner(&app)
}

#[tauri::command]
fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
fn run_shortcut_action(action: ShortcutAction) -> Result<(), String> {
    let target = action.target.trim();
    if target.is_empty() {
        return Err("Shortcut target is empty".to_string());
    }

    match action.action_type {
        ShortcutActionType::Url => {
            if !target.starts_with("https://") && !target.starts_with("http://") {
                return Err("Shortcut URL must start with http:// or https://".to_string());
            }

            open_with_default_app(target)
        }
        ShortcutActionType::File => {
            if !Path::new(target).exists() {
                return Err("Shortcut file target does not exist".to_string());
            }

            open_with_default_app(target)
        }
        ShortcutActionType::App => {
            if !Path::new(target).exists() {
                return Err("Shortcut app target does not exist".to_string());
            }

            Command::new(target)
                .spawn()
                .map(|_| ())
                .map_err(|err| format!("Failed to launch shortcut app: {err}"))
        }
    }
}

fn open_with_default_app(target: &str) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    let result = Command::new("rundll32")
        .args(["url.dll,FileProtocolHandler", target])
        .spawn();

    #[cfg(target_os = "macos")]
    let result = Command::new("open").arg(target).spawn();

    #[cfg(target_os = "linux")]
    let result = Command::new("xdg-open").arg(target).spawn();

    #[cfg(not(any(target_os = "windows", target_os = "linux", target_os = "macos")))]
    let result = Err(std::io::Error::new(
        std::io::ErrorKind::Unsupported,
        "opening shortcuts is not supported on this platform",
    ));

    result
        .map(|_| ())
        .map_err(|err| format!("Failed to open shortcut target: {err}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let tray_status_controller = TrayStatusController::default();

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(tray_status_controller.clone())
        .setup(move |app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))?;
                let default_icon = app.default_window_icon().map(|icon| {
                    tauri::image::Image::new_owned(
                        icon.rgba().to_vec(),
                        icon.width(),
                        icon.height(),
                    )
                });
                let (tray, status_item) = setup_tray(app)?;
                start_tray_status_worker(
                    tray_status_controller.clone(),
                    tray,
                    status_item,
                    default_icon,
                );
            }

            Ok(())
        })
        .manage(AppState {
            sys: Mutex::new(System::new_all()),
            networks: Mutex::new(Networks::new_with_refreshed_list()),
            last_network_refresh: Mutex::new(Instant::now()),
        })
        .invoke_handler(tauri::generate_handler![
            get_system_usage,
            get_network_usage,
            measure_ping,
            show_main_window,
            hide_main_window,
            quit_app,
            run_shortcut_action,
            configure_tray_status
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
