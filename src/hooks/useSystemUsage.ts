import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export interface ProcessUsageData {
  pid: string;
  name: string;
  cpu_usage: number;
  memory_bytes: number;
}

interface SystemUsageData {
  cpu_usage: number;
  cpu_name: string;
  mem_used: number;
  mem_total: number;
  top_cpu_processes: ProcessUsageData[];
  top_memory_processes: ProcessUsageData[];
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
