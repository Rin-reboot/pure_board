import { Activity } from "lucide-react";
import { HistoryChart } from "./HistoryChart";

interface SystemHistoryViewProps {
  cpuHistory: number[];
  ramHistory: number[];
  updateIntervalMs: number;
}

interface HistoryStats {
  current: number;
  average: number;
  max: number;
}

function getStats(history: number[]): HistoryStats {
  if (history.length === 0) {
    return { current: 0, average: 0, max: 0 };
  }

  const total = history.reduce((sum, value) => sum + value, 0);
  return {
    current: history[history.length - 1] ?? 0,
    average: total / history.length,
    max: Math.max(...history),
  };
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function formatHistoryWindow(sampleCount: number, updateIntervalMs: number) {
  const seconds = Math.round((sampleCount * updateIntervalMs) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return remainingSeconds === 0
    ? `${minutes}m`
    : `${minutes}m ${remainingSeconds}s`;
}

function HistoryMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="history-metric">
      <span className="history-metric-label">{label}</span>
      <span className="history-metric-value">{formatPercent(value)}</span>
    </div>
  );
}

function HistorySection({
  title,
  color,
  history,
}: {
  title: string;
  color: string;
  history: number[];
}) {
  const stats = getStats(history);

  return (
    <section className="history-section">
      <div className="history-section-header">
        <span className="history-section-title">{title}</span>
        <div className="history-metrics">
          <HistoryMetric label="Now" value={stats.current} />
          <HistoryMetric label="Avg" value={stats.average} />
          <HistoryMetric label="Max" value={stats.max} />
        </div>
      </div>
      <HistoryChart
        data={history}
        color={color}
        label={`${title} usage history`}
      />
    </section>
  );
}

export function SystemHistoryView({
  cpuHistory,
  ramHistory,
  updateIntervalMs,
}: SystemHistoryViewProps) {
  const historyWindow = formatHistoryWindow(
    cpuHistory.length,
    updateIntervalMs,
  );

  return (
    <section className="system-history-card" aria-label="CPU and RAM history">
      <div className="system-history-header">
        <div className="system-history-title">
          <Activity size={16} />
          <span>CPU / RAM History</span>
        </div>
        <span className="system-history-window">Last {historyWindow}</span>
      </div>

      <HistorySection
        title="CPU"
        color="var(--accent-cpu)"
        history={cpuHistory}
      />
      <HistorySection
        title="RAM"
        color="var(--accent-ram)"
        history={ramHistory}
      />
    </section>
  );
}
