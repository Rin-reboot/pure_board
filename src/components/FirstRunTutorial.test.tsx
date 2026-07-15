import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { FirstRunTutorial } from "./FirstRunTutorial";

afterEach(cleanup);

describe("FirstRunTutorial", () => {
  it("moves through the tutorial and finishes on the last step", () => {
    const onDismiss = vi.fn();
    const { getByRole, getByText } = render(
      <FirstRunTutorial onDismiss={onDismiss} />,
    );

    expect(getByRole("heading", { name: "pure_boardへようこそ" })).toBeTruthy();
    expect(getByText("1 / 5")).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "次へ" }));
    expect(getByRole("heading", { name: "システムの状態を確認" })).toBeTruthy();
    expect(getByText("2 / 5")).toBeTruthy();

    fireEvent.click(getByRole("button", { name: "戻る" }));
    expect(getByRole("heading", { name: "pure_boardへようこそ" })).toBeTruthy();

    for (let index = 0; index < 4; index += 1) {
      fireEvent.click(getByRole("button", { name: "次へ" }));
    }
    fireEvent.click(getByRole("button", { name: "pure_boardを始める" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("can be skipped from the first step", () => {
    const onDismiss = vi.fn();
    const { getByRole } = render(<FirstRunTutorial onDismiss={onDismiss} />);

    fireEvent.click(getByRole("button", { name: "スキップ" }));

    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
