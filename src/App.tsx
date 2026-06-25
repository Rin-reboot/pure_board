import "./App.css";
import { CpuCard } from "./components/CpuCard";
import { Footer } from "./components/Footer";
import { MemoPanel } from "./components/MemoPanel";
import { NetworkStats } from "./components/NetworkStats";
import { RamCard } from "./components/RamCard";
import { TitleBar } from "./components/TitleBar";
import { useCpuHistory } from "./hooks/useCpuHistory";
import { useSystemUsage } from "./hooks/useSystemUsage";

// TODO: sysinfoでプロセッサ名を取得するRustコマンドができたら置き換える
const MOCK_PROCESSOR_NAME = "プロセッサ名(後で実装)";

// TODO: ネットワーク速度・Pingを取得するRustコマンドができたら置き換える
const MOCK_NETWORK = { downloadMbps: 120, uploadMbps: 28, pingMs: 8 };

function App() {
  const usage = useSystemUsage();
  const cpuHistory = useCpuHistory(usage?.cpu_usage);

  return (
    <main className="container" data-tauri-drag-region>
      <TitleBar />

      <div className="card-stack">
        <CpuCard
          usage={usage?.cpu_usage ?? 0}
          processorName={MOCK_PROCESSOR_NAME}
          history={cpuHistory}
        />
        <RamCard
          usedBytes={usage?.mem_used ?? 0}
          totalBytes={usage?.mem_total ?? 1}
        />
        <NetworkStats {...MOCK_NETWORK} />
        <MemoPanel />
      </div>

      <Footer />
    </main>
  );
}

export default App;
