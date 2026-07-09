import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { ProcessUsageData } from "../hooks/useSystemUsage";
import { CircularGauge } from "./CircularGauge";
import { ProcessUsageList } from "./ProcessUsageList";
import { Sparkline } from "./Sparkline";

interface CpuCardProps {
  usage: number;
  processorName: string;
  history: number[];
  topProcesses: ProcessUsageData[];
}

export function CpuCard({
  usage,
  processorName,
  history,
  topProcesses,
}: CpuCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="card card-accordion">
      <div className="card-main">
        <CircularGauge
          percent={usage}
          color="var(--accent-cpu)"
          label="CPU"
          valueLabel={`${Math.round(usage)}%`}
        />
        <div className="card-detail">
          <div className="card-detail-header">
            <span className="card-detail-title">{processorName}</span>
            <button
              className="card-accordion-toggle"
              type="button"
              aria-expanded={isExpanded}
              aria-label="Toggle top CPU processes"
              onClick={() => setIsExpanded((current) => !current)}
            >
              <ChevronDown
                size={16}
                className={isExpanded ? "card-accordion-icon-open" : ""}
              />
            </button>
          </div>
          <Sparkline data={history} color="var(--accent-cpu)" />
        </div>
      </div>
      {isExpanded ? (
        <ProcessUsageList processes={topProcesses} metric="cpu" />
      ) : null}
    </section>
  );
}
