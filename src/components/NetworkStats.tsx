import { ArrowDown, ArrowUp, Network } from "lucide-react";

interface NetworkStatsProps {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

export function NetworkStats({
  downloadMbps,
  uploadMbps,
  pingMs,
}: NetworkStatsProps) {
  return (
    <section className="card network-card">
      <div className="network-stat">
        <ArrowDown
          size={14}
          className="network-icon"
          style={{ color: "var(--accent-cpu)" }}
        />
        <span className="network-label">ダウンロード</span>
        <span className="network-value" style={{ color: "var(--accent-cpu)" }}>
          {downloadMbps} <small>Mbps</small>
        </span>
      </div>
      <div className="network-divider" />
      <div className="network-stat">
        <ArrowUp
          size={14}
          className="network-icon"
          style={{ color: "var(--accent-ram)" }}
        />
        <span className="network-label">アップロード</span>
        <span className="network-value" style={{ color: "var(--accent-ram)" }}>
          {uploadMbps} <small>Mbps</small>
        </span>
      </div>
      <div className="network-divider" />
      <div className="network-stat">
        <Network
          size={14}
          className="network-icon"
          style={{ color: "var(--accent-network)" }}
        />
        <span className="network-label">Ping</span>
        <span
          className="network-value"
          style={{ color: "var(--accent-network)" }}
        >
          {pingMs} <small>ms</small>
        </span>
      </div>
    </section>
  );
}
