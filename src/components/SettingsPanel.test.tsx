import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsPanel } from "./SettingsPanel";

afterEach(cleanup);

describe("SettingsPanel", () => {
  it("renders the settings title and update interval", () => {
    const { getAllByText, getByLabelText, getByText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    expect(getByLabelText("Settings")).toBeTruthy();
    expect(getByText("Settings")).toBeTruthy();
    expect(getByText("System")).toBeTruthy();
    expect(getAllByText("Network").length).toBeGreaterThan(0);
    expect(getByText("Shortcuts")).toBeTruthy();
    expect(getByText("Application")).toBeTruthy();
    expect(getAllByText("Update interval")).toHaveLength(2);
    expect(getByText("Taskbar status")).toBeTruthy();
    expect(getByText("Show mini graph")).toBeTruthy();
    expect(getByText("Ping target")).toBeTruthy();
    expect(getByText("Launch at startup")).toBeTruthy();
    expect(getByText("Close button behavior")).toBeTruthy();
    expect(getByLabelText("Update interval")).toHaveProperty("value", "1.5");
    expect(getByLabelText("Ping target")).toHaveProperty("value", "8.8.8.8");
    expect(getByLabelText("Close button behavior")).toHaveProperty(
      "value",
      "ask",
    );
  });

  it("updates taskbar status controls and opens their help", () => {
    const onOpenTrayStatusHelp = vi.fn();
    const onTrayStatusEnabledChange = vi.fn();
    const onTrayStatusIntervalChange = vi.fn();
    const onTrayStatusMetricChange = vi.fn();
    const { getByLabelText, getByRole } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={onOpenTrayStatusHelp}
        onTrayStatusEnabledChange={onTrayStatusEnabledChange}
        onTrayStatusIntervalChange={onTrayStatusIntervalChange}
        onTrayStatusMetricChange={onTrayStatusMetricChange}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Show taskbar mini graph"));
    fireEvent.change(getByLabelText("Taskbar status metric"), {
      target: { value: "memory" },
    });
    fireEvent.change(getByLabelText("Taskbar status update interval"), {
      target: { value: "5" },
    });
    fireEvent.click(
      getByRole("button", {
        name: "How to keep the icon visible in Windows 11",
      }),
    );

    expect(onTrayStatusEnabledChange).toHaveBeenCalledWith(false);
    expect(onTrayStatusMetricChange).toHaveBeenCalledWith("memory");
    expect(onTrayStatusIntervalChange).toHaveBeenCalledWith(5);
    expect(onOpenTrayStatusHelp).toHaveBeenCalledTimes(1);
  });

  it("calls the interval change handler with the entered value in milliseconds", () => {
    const onUpdateIntervalChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={onUpdateIntervalChange}
      />,
    );

    fireEvent.change(getByLabelText("Update interval"), {
      target: { value: "2.4" },
    });

    expect(onUpdateIntervalChange).toHaveBeenCalledWith(2400);
  });

  it("calls the ping target host change handler", () => {
    const onPingTargetHostChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={onPingTargetHostChange}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.change(getByLabelText("Ping target"), {
      target: { value: "example.com" },
    });

    expect(onPingTargetHostChange).toHaveBeenCalledWith("example.com");
  });

  it("calls the shortcut buttons change handler", () => {
    const onShortcutButtonsChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={onShortcutButtonsChange}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.change(getByLabelText("Shortcut 1 label"), {
      target: { value: "Docs" },
    });

    expect(onShortcutButtonsChange).toHaveBeenCalledWith([
      expect.objectContaining({ label: "Docs", actionType: "url" }),
    ]);
  });

  it("calls the auto-start toggle handler", () => {
    const onToggleAutoStart = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={onToggleAutoStart}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.click(getByLabelText("Launch at startup"));

    expect(onToggleAutoStart).toHaveBeenCalledTimes(1);
  });

  it("disables the auto-start toggle until the setting is loaded", () => {
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={false}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={vi.fn()}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    expect(getByLabelText("Launch at startup")).toHaveProperty(
      "disabled",
      true,
    );
  });

  it("calls the close action preference change handler", () => {
    const onCloseActionPreferenceChange = vi.fn();
    const { getByLabelText } = render(
      <SettingsPanel
        closeActionPreference="ask"
        isAutoStartEnabled={false}
        isAutoStartLoaded={true}
        pingTargetHost="8.8.8.8"
        shortcutButtons={[]}
        trayStatusEnabled={true}
        trayStatusIntervalSeconds={1}
        trayStatusMetric="cpu"
        updateIntervalMs={1500}
        onCloseActionPreferenceChange={onCloseActionPreferenceChange}
        onPingTargetHostChange={vi.fn()}
        onShortcutButtonsChange={vi.fn()}
        onOpenTrayStatusHelp={vi.fn()}
        onTrayStatusEnabledChange={vi.fn()}
        onTrayStatusIntervalChange={vi.fn()}
        onTrayStatusMetricChange={vi.fn()}
        onToggleAutoStart={vi.fn()}
        onUpdateIntervalChange={vi.fn()}
      />,
    );

    fireEvent.change(getByLabelText("Close button behavior"), {
      target: { value: "minimizeToTray" },
    });

    expect(onCloseActionPreferenceChange).toHaveBeenCalledWith(
      "minimizeToTray",
    );
  });
});
