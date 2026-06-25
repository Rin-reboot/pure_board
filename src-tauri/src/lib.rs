use serde::Serialize;
use std::sync::Mutex;
use sysinfo::System;

// フロントに返すデータの形。Serializeを付けるとJSONに変換できるようになる
#[derive(Serialize)]
struct SystemUsage {
    cpu_usage: f32,   // 全体CPU使用率(%)
    mem_used: u64,    // 使用中メモリ(バイト)
    mem_total: u64,   // 総メモリ(バイト)
}

// アプリ全体で共有する状態。Mutexで包むことで複数スレッドから安全に書き換えられる
struct AppState {
    sys: Mutex<System>,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_usage(state: tauri::State<AppState>) -> SystemUsage {
    // ロックを取得して中身を書き換え可能にする
    let mut sys = state.sys.lock().unwrap();

    sys.refresh_cpu_all();
    sys.refresh_memory();

    let cpu_usage = sys.cpus().iter().map(|cpu| cpu.cpu_usage()).sum::<f32>()
        / sys.cpus().len() as f32;

    SystemUsage {
        cpu_usage,
        mem_used: sys.used_memory(),
        mem_total: sys.total_memory(),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(AppState {
            sys: Mutex::new(System::new_all()),
        })
        .invoke_handler(tauri::generate_handler![greet, get_system_usage])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
