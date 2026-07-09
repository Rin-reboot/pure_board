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
import { CloseActionDialog } from "./components/CloseActionDialog";
import { CpuCard } from "./components/CpuCard";
import { Footer } from "./components/Footer";
import { MemoPanel } from "./components/MemoPanel";
import { NetworkStats } from "./components/NetworkStats";
import { RamCard } from "./components/RamCard";
import { SettingsPanel } from "./components/SettingsPanel";
import { ShortcutPanel } from "./components/ShortcutPanel";
import { SystemHistoryView } from "./components/SystemHistoryView";
import { TitleBar } from "./components/TitleBar";
import { WidgetFrame } from "./components/WidgetFrame";
import { useAlwaysOnTop } from "./hooks/useAlwaysOnTop";
import { useAutoStart } from "./hooks/useAutoStart";
import {
  type CloseAction,
  useCloseActionPreference,
} from "./hooks/useCloseActionPreference";
import { useNetworkUsage } from "./hooks/useNetworkUsage";
import { usePingTargetSetting } from "./hooks/usePingTargetSetting";
import { useShortcutButtons } from "./hooks/useShortcutButtons";
import { useSystemUsage } from "./hooks/useSystemUsage";
import { useTheme } from "./hooks/useTheme";
import { useUpdateIntervalSetting } from "./hooks/useUpdateIntervalSetting";
import { useUsageHistory } from "./hooks/useUsageHistory";
import { useWidgetLayout, type WidgetId } from "./hooks/useWidgetLayout";

const DETAIL_HISTORY_LENGTH = 120;
const CARD_HISTORY_LENGTH = 40;

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
  const { closeActionPreference, setCloseActionPreference } =
    useCloseActionPreference();
  const { pingTargetHost, setPingTargetHost } = usePingTargetSetting();
  const {
    shortcutButtons,
    isLoaded: areShortcutButtonsLoaded,
    setShortcutButtons,
  } = useShortcutButtons();
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
  const [pingErrorMessage, setPingErrorMessage] = useState<string | null>(null);
  const [isMeasuringPing, setIsMeasuringPing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCloseActionDialogOpen, setIsCloseActionDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const stackRef = useRef<HTMLDivElement | null>(null);
  const draggingWidgetId = dragState?.id ?? null;
  const runnableShortcuts = useMemo(
    () => shortcutButtons.filter((shortcut) => shortcut.target.trim()),
    [shortcutButtons],
  );

  const handleMeasurePing = useCallback(async () => {
    setIsMeasuringPing(true);
    setPingErrorMessage(null);
    try {
      const result = await invoke<PingResult>("measure_ping", {
        target: {
          host: pingTargetHost,
        },
      });
      setPingMs(result.latency_ms);
    } catch (err) {
      console.error("Failed to measure ping:", err);
      setPingMs(null);
      setPingErrorMessage(getErrorMessage(err));
    } finally {
      setIsMeasuringPing(false);
    }
  }, [pingTargetHost]);

  const handlePingTargetHostChange = useCallback(
    async (next: string) => {
      setPingMs(null);
      setPingErrorMessage(null);
      await setPingTargetHost(next);
    },
    [setPingTargetHost],
  );

  const runCloseAction = useCallback(async (action: CloseAction) => {
    try {
      await invoke(action === "exit" ? "quit_app" : "hide_main_window");
    } catch (err) {
      console.error("Failed to run close action:", err);
    }
  }, []);

  const handleCloseRequest = useCallback(() => {
    if (closeActionPreference === "ask") {
      setIsCloseActionDialogOpen(true);
      return;
    }

    void runCloseAction(closeActionPreference);
  }, [closeActionPreference, runCloseAction]);

  const handleCloseActionSelect = useCallback(
    async (action: CloseAction, shouldRemember: boolean) => {
      setIsCloseActionDialogOpen(false);

      if (shouldRemember) {
        await setCloseActionPreference(action);
      }

      await runCloseAction(action);
    },
    [runCloseAction, setCloseActionPreference],
  );

  const handleToggleHistory = useCallback(() => {
    setIsShortcutsOpen(false);
    setIsHistoryOpen((prev) => !prev);
  }, []);

  const handleToggleShortcuts = useCallback(() => {
    setIsHistoryOpen(false);
    setIsShortcutsOpen((prev) => !prev);
  }, []);

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case "cpu":
        return (
          <CpuCard
            usage={usage?.cpu_usage ?? 0}
            processorName={usage?.cpu_name ?? "Unknown CPU"}
            history={cpuCardHistory}
            topProcesses={usage?.top_cpu_processes ?? []}
          />
        );
      case "ram":
        return (
          <RamCard
            usedBytes={usage?.mem_used ?? 0}
            totalBytes={usage?.mem_total ?? 1}
            topProcesses={usage?.top_memory_processes ?? []}
          />
        );
      case "network":
        return (
          <NetworkStats
            downloadMbps={networkUsage?.download_mbps ?? 0}
            uploadMbps={networkUsage?.upload_mbps ?? 0}
            pingMs={pingMs}
            pingErrorMessage={pingErrorMessage}
            pingTargetLabel={pingTargetHost}
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
        onCloseRequest={handleCloseRequest}
        onTogglePin={togglePin}
        onToggleSettings={() => setIsSettingsOpen((prev) => !prev)}
      />
      {isCloseActionDialogOpen ? (
        <CloseActionDialog
          onCancel={() => setIsCloseActionDialogOpen(false)}
          onSelect={handleCloseActionSelect}
        />
      ) : null}
      {isSettingsOpen ? (
        <SettingsPanel
          closeActionPreference={closeActionPreference}
          isAutoStartEnabled={isAutoStartEnabled}
          isAutoStartLoaded={isAutoStartLoaded}
          pingTargetHost={pingTargetHost}
          shortcutButtons={shortcutButtons}
          updateIntervalMs={updateIntervalMs}
          onCloseActionPreferenceChange={setCloseActionPreference}
          onPingTargetHostChange={handlePingTargetHostChange}
          onShortcutButtonsChange={setShortcutButtons}
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
        {isShortcutsOpen ? (
          <ShortcutPanel
            shortcuts={runnableShortcuts}
            isLoaded={areShortcutButtonsLoaded}
          />
        ) : isHistoryOpen ? (
          <SystemHistoryView
            cpuHistory={cpuHistory}
            ramHistory={ramHistory}
            updateIntervalMs={updateIntervalMs}
          />
        ) : (
          layout
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
            ))
        )}
      </div>

      <Footer
        isHistoryOpen={isHistoryOpen}
        isEditMode={isEditMode}
        isShortcutsOpen={isShortcutsOpen}
        theme={theme}
        onToggleHistory={handleToggleHistory}
        onToggleEditMode={() => setIsEditMode((prev) => !prev)}
        onToggleShortcuts={handleToggleShortcuts}
        onToggleTheme={toggleTheme}
      />
    </main>
  );
}

function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "Unknown error";
}

export default App;
