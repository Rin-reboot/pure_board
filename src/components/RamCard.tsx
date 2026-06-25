import { CircularGauge } from "./CircularGauge";

interface RamCardProps {
  usedBytes: number;
  totalBytes: number;
}

function formatGB(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(1);
}

export function RamCard({ usedBytes, totalBytes }: RamCardProps) {
  const percent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  const freeBytes = Math.max(0, totalBytes - usedBytes);

  return (
    <section className="card">
      <CircularGauge
        percent={percent}
        color="var(--accent-ram)"
        label="RAM"
        valueLabel={`${Math.round(percent)}%`}
      />
      <div className="card-detail">
        <span className="card-detail-title">
          <strong>{formatGB(usedBytes)}</strong> GB / {formatGB(totalBytes)} GB
        </span>
        <div className="bar-track">
          <div
            className="bar-fill bar-fill-ram"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="card-detail-footer">
          <span>使用中 {formatGB(usedBytes)} GB</span>
          <span>空き {formatGB(freeBytes)} GB</span>
        </div>
      </div>
    </section>
  );
}
