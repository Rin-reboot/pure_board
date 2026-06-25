import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

// Rust側の SystemUsage 構造体と同じ形(JSONで渡ってくる)
interface SystemUsageData {
  cpu_usage: number;
  mem_used: number;
  mem_total: number;
}

// バイト数をGB表記の文字列に変換(例: 17179869184 -> "16.0 GB")
function formatGB(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(1);
}

export function SystemUsage() {
  const [usage, setUsage] = useState<SystemUsageData | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const data = await invoke<SystemUsageData>("get_system_usage");
        setUsage(data);
      } catch (err) {
        console.error("Failed to fetch system usage:", err);
      }
    };

    fetchUsage(); // 初回即時実行
    const intervalId = setInterval(fetchUsage, 1500); // 以降1.5秒ごと

    return () => clearInterval(intervalId); // アンマウント時に停止
  }, []);

  if (!usage) {
    return <div className="system-usage">読み込み中...</div>;
  }

  const memPercent = (usage.mem_used / usage.mem_total) * 100;

  return (
    <div className="system-usage">
      <UsageBar label="CPU" percent={usage.cpu_usage} />
      <UsageBar
        label="RAM"
        percent={memPercent}
        detail={`${formatGB(usage.mem_used)} / ${formatGB(usage.mem_total)} GB`}
      />
    </div>
  );
}

function UsageBar({
  label,
  percent,
  detail,
}: {
  label: string;
  percent: number;
  detail?: string;
}) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className="usage-bar">
      <div className="usage-bar-header">
        <span>{label}</span>
        <span>{detail ?? `${clamped.toFixed(0)}%`}</span>
      </div>
      <div className="usage-bar-track">
        <div className="usage-bar-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}
