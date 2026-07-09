import "./App.css";
import { invoke } from "@tauri-apps/api/core";
import {
  type CSSProperties,
  type PointerEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";
import { CpuCard } from "./components/CpuCard";
import { Footer } from "./components/Footer";
import { MemoPanel } from "./components/MemoPanel";
import { NetworkStats } from "./components/NetworkStats";
import { RamCard } from "./components/RamCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { SystemHistoryView } from "./components/SystemHistoryView";
import { TitleBar } from "./components/TitleBar";
import { WidgetFrame } from "./components/WidgetFrame";
import { useAlwaysOnTop } from "./hooks/useAlwaysOnTop";
import { useAutoStart } from "./hooks/useAutoStart";
import { useNetworkUsage } from "./hooks/useNetworkUsage";
import { useSystemUsage } from "./hooks/useSystemUsage";
import { useTheme } from "./hooks/useTheme";
import { useUpdateIntervalSetting } from "./hooks/useUpdateIntervalSetting";
import { useUsageHistory } from "./hooks/useUsageHistory";
import { useWidgetLayout, type WidgetId } from "./hooks/useWidgetLayout";

const DETAIL_HISTORY_LENGTH = 120;
const CARD_HISTORY_LENGTH = 40;
const PING_TARGET = { label: "Google DNS", host: "8.8.8.8", port: 443 };

interface PingResult {
  latency_ms: number;
}

interface DragState {
  id: WidgetId;
  height: number;
  left: number;
  pointerOffsetY: number;
  top: number;
  width: number;
}

function App() {
  const { theme, toggleTheme } = useTheme();
  const { isPinned, togglePin } = useAlwaysOnTop();
  const {
    isAutoStartEnabled,
    isLoaded: isAutoStartLoaded,
    toggleAutoStart,
  } = useAutoStart();
  const { updateIntervalMs, setUpdateIntervalMs } = useUpdateIntervalSetting();
  const { layout, moveWidget, toggleWidgetVisibility } = useWidgetLayout();
  const usage = useSystemUsage(updateIntervalMs);
  const networkUsage = useNetworkUsage(updateIntervalMs);
  const ramUsagePercent =
    usage && usage.mem_total > 0 ? (usage.mem_used / usage.mem_total) * 100 : 0;
  const cpuHistory = useUsageHistory(usage?.cpu_usage, {
    length: DETAIL_HISTORY_LENGTH,
  });
  const ramHistory = useUsageHistory(usage ? ramUsagePercent : undefined, {
    length: DETAIL_HISTORY_LENGTH,
  });
  const cpuCardHistory = useMemo(
    () => cpuHistory.slice(-CARD_HISTORY_LENGTH),
    [cpuHistory],
  );
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [isMeasuringPing, setIsMeasuringPing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const draggingWidgetId = dragState?.id ?? null;

  const handleMeasurePing = useCallback(async () => {
    setIsMeasuringPing(true);
    try {
      const result = await invoke<PingResult>("measure_ping", {
        target: {
          host: PING_TARGET.host,
          port: PING_TARGET.port,
        },
      });
      setPingMs(result.latency_ms);
    } catch (err) {
      console.error("Failed to measure ping:", err);
      setPingMs(null);
    } finally {
      setIsMeasuringPing(false);
    }
  }, []);

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "cpu":
        return (
          <CpuCard
            usage={usage?.cpu_usage ?? 0}
            processorName={usage?.cpu_name ?? "Unknown CPU"}
            history={cpuCardHistory}
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
        return (
          <NetworkStats
            downloadMbps={networkUsage?.download_mbps ?? 0}
            uploadMbps={networkUsage?.upload_mbps ?? 0}
            pingMs={pingMs}
            pingTargetLabel={PING_TARGET.label}
            isMeasuringPing={isMeasuringPing}
            onMeasurePing={handleMeasurePing}
          />
        );
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
    const frame = event.currentTarget.closest<HTMLElement>("[data-widget-id]");
    if (!frame) return;

    const rect = frame.getBoundingClientRect();

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragState({
      id,
      height: rect.height,
      left: rect.left,
      pointerOffsetY: event.clientY - rect.top,
      top: rect.top,
      width: rect.width,
    });
  };

  const handleWidgetDragMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragState || !stackRef.current) return;

    const nextTop = event.clientY - dragState.pointerOffsetY;
    setDragState((current) =>
      current ? { ...current, top: nextTop } : current,
    );

    const frames = Array.from(
      stackRef.current.querySelectorAll<HTMLElement>("[data-widget-id]"),
    );

    for (const frame of frames) {
      const targetId = frame.dataset.widgetId as WidgetId | undefined;
      if (!targetId || targetId === dragState.id) continue;

      const rect = frame.getBoundingClientRect();
      if (event.clientY < rect.top || event.clientY > rect.bottom) continue;

      const placement =
        event.clientY < rect.top + rect.height / 2 ? "before" : "after";
      moveWidget(dragState.id, targetId, placement);
      return;
    }
  };

  const handleWidgetDragEnd = () => {
    setDragState(null);
  };

  const getDragStyle = (id: WidgetId): CSSProperties | undefined => {
    if (dragState?.id !== id) return undefined;

    return {
      height: dragState.height,
      left: dragState.left,
      top: dragState.top,
      width: dragState.width,
    };
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
          isAutoStartEnabled={isAutoStartEnabled}
          isAutoStartLoaded={isAutoStartLoaded}
          updateIntervalMs={updateIntervalMs}
          onToggleAutoStart={toggleAutoStart}
          onUpdateIntervalChange={setUpdateIntervalMs}
        />
      ) : null}

      <div
        className={["card-stack", draggingWidgetId ? "card-stack-dragging" : ""]
          .filter(Boolean)
          .join(" ")}
        ref={stackRef}
        onPointerMove={handleWidgetDragMove}
        onPointerUp={handleWidgetDragEnd}
        onPointerCancel={handleWidgetDragEnd}
      >
        {isHistoryOpen ? (
          <SystemHistoryView
            cpuHistory={cpuHistory}
            ramHistory={ramHistory}
            updateIntervalMs={updateIntervalMs}
          />
        ) : null}
        {layout
          .filter((widget) => isEditMode || widget.visible)
          .map((widget) => (
            <WidgetFrame
              key={widget.id}
              id={widget.id}
              title={getWidgetTitle(widget.id)}
              isEditMode={isEditMode}
              isDragging={dragState?.id === widget.id}
              isVisible={widget.visible}
              dragStyle={getDragStyle(widget.id)}
              onToggleVisibility={toggleWidgetVisibility}
              onDragStart={handleWidgetDragStart}
            >
              {renderWidget(widget.id)}
            </WidgetFrame>
          ))}
      </div>

      <Footer
        isHistoryOpen={isHistoryOpen}
        isEditMode={isEditMode}
        theme={theme}
        onToggleHistory={() => setIsHistoryOpen((prev) => !prev)}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onToggleTheme={toggleTheme}
      />
    </main>
  );
}

export default App;
