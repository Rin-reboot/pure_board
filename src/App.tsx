import "./App.css";
import { type PointerEvent, useRef, useState } from "react";
import { CpuCard } from "./components/CpuCard";
import { Footer } from "./components/Footer";
import { MemoPanel } from "./components/MemoPanel";
import { NetworkStats } from "./components/NetworkStats";
import { RamCard } from "./components/RamCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { TitleBar } from "./components/TitleBar";
import { WidgetFrame } from "./components/WidgetFrame";
import { useAlwaysOnTop } from "./hooks/useAlwaysOnTop";
import { useCpuHistory } from "./hooks/useCpuHistory";
import { useSystemUsage } from "./hooks/useSystemUsage";
import { useTheme } from "./hooks/useTheme";
import { useUpdateIntervalSetting } from "./hooks/useUpdateIntervalSetting";
import { useWidgetLayout, type WidgetId } from "./hooks/useWidgetLayout";

// TODO: ネットワーク速度・Pingを取得するRustコマンドができたら置き換える
const MOCK_NETWORK = { downloadMbps: 120, uploadMbps: 28, pingMs: 8 };

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isPinned, togglePin } = useAlwaysOnTop();
  const { updateIntervalMs, setUpdateIntervalMs } = useUpdateIntervalSetting();
  const { layout, moveWidget, toggleWidgetVisibility } = useWidgetLayout();
  const usage = useSystemUsage(updateIntervalMs);
  const cpuHistory = useCpuHistory(usage?.cpu_usage);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [draggingWidgetId, setDraggingWidgetId] = useState<WidgetId | null>(
    null,
  );
  const stackRef = useRef<HTMLDivElement | null>(null);

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "cpu":
        return (
          <CpuCard
            usage={usage?.cpu_usage ?? 0}
            processorName={usage?.cpu_name ?? "Unknown CPU"}
            history={cpuHistory}
          />
        );
      case "ram":
        return (
          <RamCard
            usedBytes={usage?.mem_used ?? 0}
            totalBytes={usage?.mem_total ?? 1}
          />
        );
      case "network":
        return <NetworkStats {...MOCK_NETWORK} />;
      case "memo":
        return <MemoPanel />;
    }
  };

  const getWidgetTitle = (id: WidgetId): string => {
    switch (id) {
      case "cpu":
        return "CPU";
      case "ram":
        return "RAM";
      case "network":
        return "Network";
      case "memo":
        return "Memo";
    }
  };

  const handleWidgetDragStart = (
    id: WidgetId,
    event: PointerEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDraggingWidgetId(id);
  };

  const handleWidgetDragMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!draggingWidgetId || !stackRef.current) return;

    const frames = Array.from(
      stackRef.current.querySelectorAll<HTMLElement>("[data-widget-id]"),
    );

    for (const frame of frames) {
      const targetId = frame.dataset.widgetId as WidgetId | undefined;
      if (!targetId || targetId === draggingWidgetId) continue;

      const rect = frame.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) continue;

      const placement =
        event.clientY < rect.top + rect.height / 2 ? "before" : "after";
      moveWidget(draggingWidgetId, targetId, placement);
      return;
    }
  };

  const handleWidgetDragEnd = () => {
    setDraggingWidgetId(null);
  };

  return (
    <main className="container">
      <TitleBar
        isDragEnabled={!isEditMode}
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

      <div
        className="card-stack"
        ref={stackRef}
        onPointerMove={handleWidgetDragMove}
        onPointerUp={handleWidgetDragEnd}
        onPointerCancel={handleWidgetDragEnd}
      >
        {layout
          .filter((widget) => isEditMode || widget.visible)
          .map((widget) => (
            <WidgetFrame
              key={widget.id}
              id={widget.id}
              title={getWidgetTitle(widget.id)}
              isEditMode={isEditMode}
              isDragging={draggingWidgetId === widget.id}
              isVisible={widget.visible}
              onToggleVisibility={toggleWidgetVisibility}
              onDragStart={handleWidgetDragStart}
            >
              {renderWidget(widget.id)}
            </WidgetFrame>
          ))}
      </div>

      <Footer
        isEditMode={isEditMode}
        theme={theme}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onToggleTheme={toggleTheme}
      />
    </main>
  );
}

export default App;
