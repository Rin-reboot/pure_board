import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";

export interface NetworkUsageData {
  download_mbps: number;
  upload_mbps: number;
}

export function useNetworkUsage(intervalMs = 1500) {
  const [usage, setUsage] = useState<NetworkUsageData | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsage = async () => {
      try {
        const data = await invoke<NetworkUsageData>("get_network_usage");
        if (!cancelled) setUsage(data);
      } catch (err) {
        console.error("Failed to fetch network usage:", err);
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
