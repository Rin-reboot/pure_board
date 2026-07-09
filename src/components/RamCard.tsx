import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ProcessUsageData } from "../hooks/useSystemUsage";
import { CircularGauge } from "./CircularGauge";
import { ProcessUsageList } from "./ProcessUsageList";

interface RamCardProps {
  usedBytes: number;
  totalBytes: number;
  topProcesses: ProcessUsageData[];
}

function formatGB(bytes: number): string {
  return (bytes / 1024 ** 3).toFixed(1);
}

export function RamCard({ usedBytes, totalBytes, topProcesses }: RamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percent = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
  const freeBytes = Math.max(0, totalBytes - usedBytes);

  return (
    <section className="card card-accordion">
      <div className="card-main">
        <CircularGauge
          percent={percent}
          color="var(--accent-ram)"
          label="RAM"
          valueLabel={`${Math.round(percent)}%`}
        />
        <div className="card-detail">
          <div className="card-detail-header">
            <span className="card-detail-title">
              <strong>{formatGB(usedBytes)}</strong> GB / {formatGB(totalBytes)}{" "}
              GB
            </span>
            <button
              className="card-accordion-toggle"
              type="button"
              aria-expanded={isExpanded}
              aria-label="Toggle top RAM processes"
              onClick={() => setIsExpanded((current) => !current)}
            >
              <ChevronDown
                size={16}
                className={isExpanded ? "card-accordion-icon-open" : ""}
              />
            </button>
          </div>
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
      </div>
      {isExpanded ? (
        <ProcessUsageList processes={topProcesses} metric="memory" />
      ) : null}
    </section>
  );
}
