use serde::Deserialize;
use std::{
    collections::VecDeque,
    sync::{Arc, Condvar, Mutex},
    thread,
    time::{Duration, Instant},
};
use sysinfo::{Networks, System, MINIMUM_CPU_UPDATE_INTERVAL};
use tauri::{image::Image, menu::MenuItem, tray::TrayIcon};

const HISTORY_LENGTH: usize = 14;
const ICON_SIZE: u32 = 32;
const AXIS_COLOR: [u8; 4] = [226, 232, 240, 230];
const AXIS_OUTLINE_COLOR: [u8; 4] = [0, 0, 0, 210];
const AXIS_LEFT: i32 = 2;
const AXIS_TOP: i32 = 3;
const AXIS_RIGHT: i32 = 30;
const AXIS_BOTTOM: i32 = 28;
const MIN_INTERVAL_SECONDS: u64 = 1;
const MAX_INTERVAL_SECONDS: u64 = 60;

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub(crate) enum TrayStatusMetric {
    Cpu,
    Memory,
    Network,
}

impl TrayStatusMetric {
    fn color(self) -> [u8; 4] {
        match self {
            Self::Cpu => [74, 158, 255, 255],
            Self::Memory => [167, 139, 250, 255],
            Self::Network => [45, 212, 191, 255],
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub(crate) struct TrayStatusSettings {
    enabled: bool,
    metric: TrayStatusMetric,
    interval_seconds: u64,
    reduced_motion: bool,
}

impl Default for TrayStatusSettings {
    fn default() -> Self {
        Self {
            enabled: true,
            metric: TrayStatusMetric::Cpu,
            interval_seconds: MIN_INTERVAL_SECONDS,
            reduced_motion: false,
        }
    }
}

impl TrayStatusSettings {
    fn validate(&self) -> Result<(), String> {
        if !(MIN_INTERVAL_SECONDS..=MAX_INTERVAL_SECONDS).contains(&self.interval_seconds) {
            return Err(format!(
                "Tray status interval must be between {MIN_INTERVAL_SECONDS} and {MAX_INTERVAL_SECONDS} seconds"
            ));
        }

        Ok(())
    }
}

struct TrayStatusShared {
    settings: Mutex<TrayStatusSettings>,
    wake: Condvar,
}

#[derive(Clone)]
pub(crate) struct TrayStatusController {
    shared: Arc<TrayStatusShared>,
}

impl Default for TrayStatusController {
    fn default() -> Self {
        Self {
            shared: Arc::new(TrayStatusShared {
                settings: Mutex::new(TrayStatusSettings::default()),
                wake: Condvar::new(),
            }),
        }
    }
}

impl TrayStatusController {
    pub(crate) fn configure(&self, settings: TrayStatusSettings) -> Result<(), String> {
        settings.validate()?;
        *self.shared.settings.lock().unwrap() = settings;
        self.shared.wake.notify_one();
        Ok(())
    }

    fn settings(&self) -> TrayStatusSettings {
        self.shared.settings.lock().unwrap().clone()
    }

    fn wait(&self, duration: Duration) {
        let settings = self.shared.settings.lock().unwrap();
        drop(self.shared.wake.wait_timeout(settings, duration).unwrap());
    }
}

#[derive(Clone, Copy, Debug, Default)]
struct TrayStatusSample {
    cpu_percent: f64,
    memory_percent: f64,
    download_mbps: f64,
    upload_mbps: f64,
}

impl TrayStatusSample {
    fn value(self, metric: TrayStatusMetric) -> f64 {
        match metric {
            TrayStatusMetric::Cpu => self.cpu_percent,
            TrayStatusMetric::Memory => self.memory_percent,
            TrayStatusMetric::Network => self.download_mbps + self.upload_mbps,
        }
    }

    fn selected_label(self, metric: TrayStatusMetric) -> String {
        match metric {
            TrayStatusMetric::Cpu => format!("CPU: {:.0}%", self.cpu_percent),
            TrayStatusMetric::Memory => format!("RAM: {:.0}%", self.memory_percent),
            TrayStatusMetric::Network => {
                format!("Network: {:.1} Mbps", self.download_mbps + self.upload_mbps)
            }
        }
    }

    fn tooltip(self) -> String {
        format!(
            "pure_board | CPU {:.0}% | RAM {:.0}% | Net {:.1} Mbps",
            self.cpu_percent,
            self.memory_percent,
            self.download_mbps + self.upload_mbps
        )
    }
}

struct TrayStatusSampler {
    system: System,
    networks: Networks,
    last_network_refresh: Instant,
}

impl TrayStatusSampler {
    fn new() -> Self {
        let mut system = System::new();
        system.refresh_cpu_all();
        system.refresh_memory();

        Self {
            system,
            networks: Networks::new_with_refreshed_list(),
            last_network_refresh: Instant::now(),
        }
    }

    fn sample(&mut self) -> TrayStatusSample {
        self.system.refresh_cpu_usage();
        self.system.refresh_memory();

        let now = Instant::now();
        let elapsed = now.duration_since(self.last_network_refresh);
        self.networks.refresh(true);
        self.last_network_refresh = now;

        let received_bytes = self
            .networks
            .values()
            .map(|network| network.received())
            .sum::<u64>();
        let transmitted_bytes = self
            .networks
            .values()
            .map(|network| network.transmitted())
            .sum::<u64>();
        let memory_percent = if self.system.total_memory() == 0 {
            0.0
        } else {
            self.system.used_memory() as f64 / self.system.total_memory() as f64 * 100.0
        };

        TrayStatusSample {
            cpu_percent: self.system.global_cpu_usage() as f64,
            memory_percent,
            download_mbps: bytes_to_mbps(received_bytes, elapsed),
            upload_mbps: bytes_to_mbps(transmitted_bytes, elapsed),
        }
    }
}

pub(crate) fn start_tray_status_worker(
    controller: TrayStatusController,
    tray: TrayIcon,
    status_item: MenuItem<tauri::Wry>,
    default_icon: Option<Image<'static>>,
) {
    thread::spawn(move || {
        let mut sampler = TrayStatusSampler::new();
        let mut history = VecDeque::with_capacity(HISTORY_LENGTH);
        let mut last_settings: Option<TrayStatusSettings> = None;
        let mut last_metric: Option<TrayStatusMetric> = None;
        let mut graph_is_visible = false;
        let mut was_static = false;
        let mut next_sample = Instant::now() + MINIMUM_CPU_UPDATE_INTERVAL;

        loop {
            let settings = controller.settings();
            let settings_changed = last_settings.as_ref() != Some(&settings);

            if !settings.enabled {
                if graph_is_visible || settings_changed {
                    let _ = tray.set_icon(default_icon.clone());
                    let _ = tray.set_tooltip(Some("pure_board"));
                    let _ = status_item.set_text("Tray status: Off");
                    graph_is_visible = false;
                }
                last_settings = Some(settings);
                controller.wait(Duration::from_secs(1));
                continue;
            }

            if settings_changed {
                next_sample = Instant::now();
            }

            if last_metric != Some(settings.metric) {
                history.clear();
                last_metric = Some(settings.metric);
            }

            let is_static = settings.reduced_motion || is_on_battery_power();
            let now = Instant::now();

            if now >= next_sample {
                let sample = sampler.sample();
                push_history(&mut history, sample.value(settings.metric));

                let static_reason = if settings.reduced_motion {
                    Some("static: reduced motion")
                } else if is_static {
                    Some("static on battery")
                } else {
                    None
                };
                let menu_text = static_reason.map_or_else(
                    || sample.selected_label(settings.metric),
                    |reason| format!("{} ({reason})", sample.selected_label(settings.metric)),
                );
                let _ = status_item.set_text(menu_text);
                let _ = tray.set_tooltip(Some(sample.tooltip()));

                if !is_static || !graph_is_visible || last_settings.as_ref() != Some(&settings) {
                    let icon = render_mini_graph(&history, settings.metric);
                    let _ = tray.set_icon(Some(icon));
                    graph_is_visible = true;
                }

                next_sample = Instant::now() + Duration::from_secs(settings.interval_seconds);
            } else if was_static && !is_static && !history.is_empty() {
                let icon = render_mini_graph(&history, settings.metric);
                let _ = tray.set_icon(Some(icon));
                graph_is_visible = true;
            }

            was_static = is_static;
            last_settings = Some(settings);
            let wait = next_sample
                .saturating_duration_since(Instant::now())
                .min(Duration::from_secs(1));
            controller.wait(wait);
        }
    });
}

fn push_history(history: &mut VecDeque<f64>, value: f64) {
    if history.is_empty() {
        history.extend(std::iter::repeat_n(value, HISTORY_LENGTH));
        return;
    }

    if history.len() == HISTORY_LENGTH {
        history.pop_front();
    }
    history.push_back(value.max(0.0));
}

fn render_mini_graph(history: &VecDeque<f64>, metric: TrayStatusMetric) -> Image<'static> {
    let mut rgba = vec![0; (ICON_SIZE * ICON_SIZE * 4) as usize];
    if history.is_empty() {
        return Image::new_owned(rgba, ICON_SIZE, ICON_SIZE);
    }

    let max_value = match metric {
        TrayStatusMetric::Cpu | TrayStatusMetric::Memory => 100.0,
        TrayStatusMetric::Network => history.iter().copied().fold(1.0, f64::max),
    };
    let points = history
        .iter()
        .enumerate()
        .map(|(index, value)| {
            let x = 3 + (index as i32 * 26 / (HISTORY_LENGTH as i32 - 1));
            let normalized = (value / max_value).clamp(0.0, 1.0);
            let y = 27 - (normalized * 22.0).round() as i32;
            (x, y)
        })
        .collect::<Vec<_>>();

    for segment in points.windows(2) {
        draw_line(&mut rgba, segment[0], segment[1], [0, 0, 0, 210], 2);
    }
    for segment in points.windows(2) {
        draw_line(&mut rgba, segment[0], segment[1], metric.color(), 1);
    }

    draw_line(
        &mut rgba,
        (AXIS_LEFT, AXIS_TOP),
        (AXIS_LEFT, AXIS_BOTTOM),
        AXIS_OUTLINE_COLOR,
        1,
    );
    draw_line(
        &mut rgba,
        (AXIS_LEFT, AXIS_BOTTOM),
        (AXIS_RIGHT, AXIS_BOTTOM),
        AXIS_OUTLINE_COLOR,
        1,
    );
    draw_line(
        &mut rgba,
        (AXIS_LEFT, AXIS_TOP),
        (AXIS_LEFT, AXIS_BOTTOM),
        AXIS_COLOR,
        0,
    );
    draw_line(
        &mut rgba,
        (AXIS_LEFT, AXIS_BOTTOM),
        (AXIS_RIGHT, AXIS_BOTTOM),
        AXIS_COLOR,
        0,
    );

    Image::new_owned(rgba, ICON_SIZE, ICON_SIZE)
}

fn draw_line(
    rgba: &mut [u8],
    (mut x0, mut y0): (i32, i32),
    (x1, y1): (i32, i32),
    color: [u8; 4],
    radius: i32,
) {
    let dx = (x1 - x0).abs();
    let sx = if x0 < x1 { 1 } else { -1 };
    let dy = -(y1 - y0).abs();
    let sy = if y0 < y1 { 1 } else { -1 };
    let mut error = dx + dy;

    loop {
        for offset_y in -radius..=radius {
            for offset_x in -radius..=radius {
                set_pixel(rgba, x0 + offset_x, y0 + offset_y, color);
            }
        }
        if x0 == x1 && y0 == y1 {
            break;
        }
        let doubled_error = error * 2;
        if doubled_error >= dy {
            error += dy;
            x0 += sx;
        }
        if doubled_error <= dx {
            error += dx;
            y0 += sy;
        }
    }
}

fn set_pixel(rgba: &mut [u8], x: i32, y: i32, color: [u8; 4]) {
    if x < 0 || y < 0 || x >= ICON_SIZE as i32 || y >= ICON_SIZE as i32 {
        return;
    }
    let index = ((y as u32 * ICON_SIZE + x as u32) * 4) as usize;
    rgba[index..index + 4].copy_from_slice(&color);
}

fn bytes_to_mbps(bytes: u64, elapsed: Duration) -> f64 {
    let elapsed_seconds = elapsed.as_secs_f64();
    if elapsed_seconds <= 0.0 {
        return 0.0;
    }
    bytes as f64 * 8.0 / elapsed_seconds / 1_000_000.0
}

#[cfg(target_os = "windows")]
fn is_on_battery_power() -> bool {
    use windows_sys::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};

    let mut status = SYSTEM_POWER_STATUS::default();
    // SAFETY: `status` points to a valid writable SYSTEM_POWER_STATUS for the duration of the call.
    let succeeded = unsafe { GetSystemPowerStatus(&mut status) } != 0;
    succeeded && status.ACLineStatus == 0
}

#[cfg(target_os = "linux")]
fn is_on_battery_power() -> bool {
    let Ok(entries) = std::fs::read_dir("/sys/class/power_supply") else {
        return false;
    };

    entries.filter_map(Result::ok).any(|entry| {
        let path = entry.path();
        let is_battery = std::fs::read_to_string(path.join("type"))
            .is_ok_and(|value| value.trim().eq_ignore_ascii_case("battery"));
        if !is_battery {
            return false;
        }
        std::fs::read_to_string(path.join("status")).is_ok_and(|value| {
            !matches!(
                value.trim().to_ascii_lowercase().as_str(),
                "charging" | "full"
            )
        })
    })
}

#[cfg(not(any(target_os = "windows", target_os = "linux")))]
fn is_on_battery_power() -> bool {
    false
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn fills_and_limits_history() {
        let mut history = VecDeque::new();
        push_history(&mut history, 10.0);
        assert_eq!(history.len(), HISTORY_LENGTH);
        assert!(history.iter().all(|value| *value == 10.0));

        push_history(&mut history, 20.0);
        assert_eq!(history.len(), HISTORY_LENGTH);
        assert_eq!(history.back(), Some(&20.0));
    }

    #[test]
    fn renders_visible_pixels_for_each_metric() {
        let history = VecDeque::from(vec![25.0; HISTORY_LENGTH]);

        for metric in [
            TrayStatusMetric::Cpu,
            TrayStatusMetric::Memory,
            TrayStatusMetric::Network,
        ] {
            let image = render_mini_graph(&history, metric);
            assert!(image.rgba().chunks_exact(4).any(|pixel| pixel[3] > 0));
            assert_eq!(pixel_at(&image, AXIS_LEFT, 10), AXIS_COLOR);
            assert_eq!(pixel_at(&image, 10, AXIS_BOTTOM), AXIS_COLOR);
        }
    }

    fn pixel_at(image: &Image<'_>, x: i32, y: i32) -> [u8; 4] {
        let index = ((y as u32 * ICON_SIZE + x as u32) * 4) as usize;
        image.rgba()[index..index + 4].try_into().unwrap()
    }

    #[test]
    fn rejects_intervals_outside_the_supported_range() {
        let settings = TrayStatusSettings {
            interval_seconds: 0,
            ..TrayStatusSettings::default()
        };
        assert!(settings.validate().is_err());

        let settings = TrayStatusSettings {
            interval_seconds: 61,
            ..TrayStatusSettings::default()
        };
        assert!(settings.validate().is_err());
    }
}
