import "./App.css";
import { useState } from "react";
import { CpuCard } from "./components/CpuCard";
import { Footer } from "./components/Footer";
import { MemoPanel } from "./components/MemoPanel";
import { NetworkStats } from "./components/NetworkStats";
import { RamCard } from "./components/RamCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { TitleBar } from "./components/TitleBar";
import { useAlwaysOnTop } from "./hooks/useAlwaysOnTop";
import { useCpuHistory } from "./hooks/useCpuHistory";
import { useSystemUsage } from "./hooks/useSystemUsage";
import { useTheme } from "./hooks/useTheme";
import { useUpdateIntervalSetting } from "./hooks/useUpdateIntervalSetting";

// TODO: ネットワーク速度・Pingを取得するRustコマンドができたら置き換える
const MOCK_NETWORK = { downloadMbps: 120, uploadMbps: 28, pingMs: 8 };

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isPinned, togglePin } = useAlwaysOnTop();
  const { updateIntervalMs, setUpdateIntervalMs } = useUpdateIntervalSetting();
  const usage = useSystemUsage(updateIntervalMs);
  const cpuHistory = useCpuHistory(usage?.cpu_usage);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="container" data-tauri-drag-region>
      <TitleBar
        isPinned={isPinned}
        isSettingsOpen={isSettingsOpen}
        onTogglePin={togglePin}
        onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
      />
      {isSettingsOpen ? (
        <SettingsPanel
          updateIntervalMs={updateIntervalMs}
          onUpdateIntervalChange={setUpdateIntervalMs}
        />
      ) : null}

      <div className="card-stack">
        <CpuCard
          usage={usage?.cpu_usage ?? 0}
          processorName={usage?.cpu_name ?? "Unknown CPU"}
          history={cpuHistory}
        />
        <RamCard
          usedBytes={usage?.mem_used ?? 0}
          totalBytes={usage?.mem_total ?? 1}
        />
        <NetworkStats {...MOCK_NETWORK} />
        <MemoPanel />
      </div>

      <Footer theme={theme} onToggleTheme={toggleTheme} />
    </main>
  );
}

export default App;
