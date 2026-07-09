import { cleanup, fireEvent, render, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NetworkStats } from "./NetworkStats";

afterEach(cleanup);

describe("NetworkStats", () => {
  it("renders network values and units", () => {
    const { getByText, getAllByText } = render(
      <NetworkStats
        downloadMbps={12.4}
        uploadMbps={2.8}
        pingMs={8}
        pingErrorMessage={null}
        pingTargetLabel="Google DNS"
        isMeasuringPing={false}
        onMeasurePing={vi.fn()}
      />,
    );
    const pingStat = getByText("Ping").closest(".network-stat");

    expect(getByText(/12/)).toBeTruthy();
    expect(getByText(/2.8/)).toBeTruthy();
    if (!(pingStat instanceof HTMLElement)) {
      throw new Error("Ping stat was not rendered");
    }
    expect(within(pingStat).getByText(/8/)).toBeTruthy();
    expect(getAllByText("Mbps")).toHaveLength(2);
    expect(getByText("ms")).toBeTruthy();
  });

  it("renders an empty ping value before manual measurement", () => {
    const { getByText } = render(
      <NetworkStats
        downloadMbps={0}
        uploadMbps={0}
        pingMs={null}
        pingErrorMessage={null}
        pingTargetLabel="Google DNS"
        isMeasuringPing={false}
        onMeasurePing={vi.fn()}
      />,
    );

    expect(getByText("--")).toBeTruthy();
  });

  it("renders a loading indicator while ping is running", () => {
    const { getByTitle } = render(
      <NetworkStats
        downloadMbps={0}
        uploadMbps={0}
        pingMs={null}
        pingErrorMessage={null}
        pingTargetLabel="Google DNS"
        isMeasuringPing={true}
        onMeasurePing={vi.fn()}
      />,
    );

    expect(getByTitle("Measuring ping")).toBeTruthy();
  });

  it("renders an error value when ping fails", () => {
    const { getByText, getByTitle } = render(
      <NetworkStats
        downloadMbps={0}
        uploadMbps={0}
        pingMs={null}
        pingErrorMessage="Ping command failed"
        pingTargetLabel="Google DNS"
        isMeasuringPing={false}
        onMeasurePing={vi.fn()}
      />,
    );

    expect(getByText("失敗")).toBeTruthy();
    expect(getByTitle("Ping failed: Ping command failed")).toBeTruthy();
  });

  it("calls the manual ping handler from the ping button", () => {
    const onMeasurePing = vi.fn();
    const { getByLabelText } = render(
      <NetworkStats
        downloadMbps={0}
        uploadMbps={0}
        pingMs={null}
        pingErrorMessage={null}
        pingTargetLabel="Google DNS"
        isMeasuringPing={false}
        onMeasurePing={onMeasurePing}
      />,
    );

    fireEvent.click(getByLabelText("Measure ping to Google DNS"));

    expect(onMeasurePing).toHaveBeenCalledTimes(1);
  });
});
