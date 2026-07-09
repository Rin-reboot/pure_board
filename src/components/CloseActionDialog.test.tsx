import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CloseActionDialog } from "./CloseActionDialog";

afterEach(cleanup);

describe("CloseActionDialog", () => {
  it("cancels the close request", () => {
    const onCancel = vi.fn();
    const { getByText } = render(
      <CloseActionDialog onCancel={onCancel} onSelect={vi.fn()} />,
    );

    fireEvent.click(getByText("Cancel"));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("selects minimize to tray without remembering by default", () => {
    const onSelect = vi.fn();
    const { getByText } = render(
      <CloseActionDialog onCancel={vi.fn()} onSelect={onSelect} />,
    );

    fireEvent.click(getByText("Minimize to tray"));

    expect(onSelect).toHaveBeenCalledWith("minimizeToTray", false);
  });

  it("selects exit and passes the remember flag", () => {
    const onSelect = vi.fn();
    const { getByLabelText, getByText } = render(
      <CloseActionDialog onCancel={vi.fn()} onSelect={onSelect} />,
    );

    fireEvent.click(getByLabelText("選択を記憶"));
    fireEvent.click(getByText("Exit"));

    expect(onSelect).toHaveBeenCalledWith("exit", true);
  });
});
