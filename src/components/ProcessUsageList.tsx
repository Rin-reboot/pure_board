import type { ProcessUsageData } from "../hooks/useSystemUsage";

interface ProcessUsageListProps {
  processes: ProcessUsageData[];
  metric: "cpu" | "memory";
}

function formatMemory(bytes: number): string {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  }

  return `${Math.round(bytes / 1024 ** 2)} MB`;
}

function formatMetric(process: ProcessUsageData, metric: "cpu" | "memory") {
  if (metric === "cpu") {
    return `${Math.round(process.cpu_usage)}%`;
  }

  return formatMemory(process.memory_bytes);
}

export function ProcessUsageList({ processes, metric }: ProcessUsageListProps) {
  if (processes.length === 0) {
    return <p className="process-list-empty">No process data</p>;
  }

  return (
    <ol className="process-list" aria-label={`Top ${metric} processes`}>
      {processes.map((process) => (
        <li className="process-list-item" key={process.pid}>
          <span className="process-list-name">{process.name}</span>
          <span className="process-list-value">
            {formatMetric(process, metric)}
          </span>
        </li>
      ))}
    </ol>
  );
}
