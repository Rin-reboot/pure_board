import { ArrowDown, ArrowUp, Network, RefreshCw } from "lucide-react";

interface NetworkStatsProps {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number | null;
  pingErrorMessage: string | null;
  pingTargetLabel: string;
  isMeasuringPing: boolean;
  onMeasurePing: () => void;
}

export function NetworkStats({
  downloadMbps,
  uploadMbps,
  pingMs,
  pingErrorMessage,
  pingTargetLabel,
  isMeasuringPing,
  onMeasurePing,
}: NetworkStatsProps) {
  const formattedDownload = formatMbps(downloadMbps);
  const formattedUpload = formatMbps(uploadMbps);
  const formattedPing = pingMs === null ? "--" : Math.round(pingMs).toString();
  const pingStatusLabel = isMeasuringPing
    ? "Measuring ping"
    : pingErrorMessage
      ? `Ping failed: ${pingErrorMessage}`
      : undefined;

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
          {formattedDownload} <small>Mbps</small>
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
          {formattedUpload} <small>Mbps</small>
        </span>
      </div>
      <div className="network-divider" />
      <div className="network-stat">
        <button
          type="button"
          className="network-ping-button"
          onClick={onMeasurePing}
          disabled={isMeasuringPing}
          aria-label={`Measure ping to ${pingTargetLabel}`}
          title={`Measure ping to ${pingTargetLabel}`}
        >
          {isMeasuringPing ? <RefreshCw size={14} /> : <Network size={14} />}
        </button>
        <span className="network-label">Ping</span>
        <span
          className={[
            "network-value",
            isMeasuringPing ? "network-value-loading" : "",
            pingErrorMessage ? "network-value-error" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{
            color: pingErrorMessage ? "#fca5a5" : "var(--accent-network)",
          }}
          title={pingStatusLabel}
        >
          {isMeasuringPing ? (
            <RefreshCw
              size={16}
              className="network-ping-spinner"
              aria-hidden="true"
            />
          ) : pingErrorMessage ? (
            "失敗"
          ) : (
            <>
              {formattedPing} <small>ms</small>
            </>
          )}
        </span>
      </div>
    </section>
  );
}

function formatMbps(value: number): string {
  if (!Number.isFinite(value)) return "0.0";

  return value.toFixed(value < 10 ? 1 : 0);
}
