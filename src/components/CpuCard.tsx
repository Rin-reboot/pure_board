import { CircularGauge } from "./CircularGauge";
import { Sparkline } from "./Sparkline";

interface CpuCardProps {
  usage: number;
  processorName: string;
  history: number[];
}

export function CpuCard({ usage, processorName, history }: CpuCardProps) {
  return (
    <section className="card">
      <CircularGauge
        percent={usage}
        color="var(--accent-cpu)"
        label="CPU"
        valueLabel={`${Math.round(usage)}%`}
      />
      <div className="card-detail">
        <span className="card-detail-title">{processorName}</span>
        <Sparkline data={history} color="var(--accent-cpu)" />
      </div>
    </section>
  );
}
