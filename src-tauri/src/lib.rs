use serde::Serialize;
use std::{
    net::{TcpStream, ToSocketAddrs},
    sync::Mutex,
    time::{Duration, Instant},
};
use sysinfo::{Networks, System};

// フロントに返すデータの形。Serializeを付けるとJSONに変換できるようになる
#[derive(Serialize)]
struct SystemUsage {
    cpu_usage: f32, // 全体CPU使用率(%)
    cpu_name: String,
    mem_used: u64,  // 使用中メモリ(バイト)
    mem_total: u64, // 総メモリ(バイト)
}

// アプリ全体で共有する状態。Mutexで包むことで複数スレッドから安全に書き換えられる
#[derive(Serialize)]
struct NetworkUsage {
    download_mbps: f64,
    upload_mbps: f64,
}

#[derive(serde::Deserialize)]
struct PingTarget {
    host: String,
    port: u16,
}

#[derive(Serialize)]
struct PingResult {
    latency_ms: u64,
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

    let cpus = sys.cpus();
    let cpu_usage = if cpus.is_empty() {
        0.0
    } else {
        cpus.iter().map(|cpu| cpu.cpu_usage()).sum::<f32>() / cpus.len() as f32
    };
    let cpu_name = cpus
        .first()
        .map(|cpu| cpu.brand().trim())
        .filter(|brand| !brand.is_empty())
        .unwrap_or("Unknown CPU")
        .to_string();

    SystemUsage {
        cpu_usage,
        cpu_name,
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
    if target.host.trim().is_empty() {
        return Err("Ping target host is empty".to_string());
    }

    if target.port == 0 {
        return Err("Ping target port is invalid".to_string());
    }

    let timeout = Duration::from_secs(1);
    let address = (target.host.as_str(), target.port)
        .to_socket_addrs()
        .map_err(|err| format!("Failed to resolve ping target: {err}"))?
        .next()
        .ok_or_else(|| "Ping target did not resolve to an address".to_string())?;

    let started_at = Instant::now();
    TcpStream::connect_timeout(&address, timeout)
        .map_err(|err| format!("Failed to connect to ping target: {err}"))?;

    Ok(PingResult {
        latency_ms: started_at.elapsed().as_millis().min(u64::MAX as u128) as u64,
    })
}

fn bytes_to_mbps(bytes: u64, elapsed: Duration) -> f64 {
    let elapsed_seconds = elapsed.as_secs_f64();
    if elapsed_seconds <= 0.0 {
        return 0.0;
    }

    bytes as f64 * 8.0 / elapsed_seconds / 1_000_000.0
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle().plugin(tauri_plugin_autostart::init(
                    tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                    None,
                ))?;
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
            measure_ping
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
