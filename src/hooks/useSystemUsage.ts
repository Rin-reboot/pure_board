import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

interface SystemUsageData {
  cpu_usage: number;
  mem_used: number;
  mem_total: number;
}

export function useSystemUsage(intervalMs = 1500) {
  const [usage, setUsage] = useState<SystemUsageData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsage = async () => {
      try {
        const data = await invoke<SystemUsageData>("get_system_usage");
        if (!cancelled) setUsage(data);
      } catch (err) {
        console.error("Failed to fetch system usage:", err);
      }
    };

    fetchUsage();
    const id = setInterval(fetchUsage, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return usage;
}
