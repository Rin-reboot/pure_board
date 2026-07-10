import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WidgetFrame } from "./WidgetFrame";

afterEach(cleanup);

describe("WidgetFrame", () => {
  it("renders its content without edit controls outside edit mode", () => {
    const { getByText, queryByLabelText } = render(
      <WidgetFrame
        id="cpu"
        title="CPU"
        isEditMode={false}
        isDragging={false}
        isVisible={true}
        onToggleVisibility={vi.fn()}
        onDragStart={vi.fn()}
      >
        <span>CPU widget content</span>
      </WidgetFrame>,
    );

    expect(getByText("CPU widget content")).toBeTruthy();
    expect(queryByLabelText("Reorder CPU")).toBeNull();
    expect(queryByLabelText("Hide CPU")).toBeNull();
  });

  it("exposes edit controls and forwards their events", () => {
    const onToggleVisibility = vi.fn();
    const onDragStart = vi.fn();
    const { getByLabelText } = render(
      <WidgetFrame
        id="cpu"
        title="CPU"
        isEditMode={true}
        isDragging={false}
        isVisible={true}
        onToggleVisibility={onToggleVisibility}
        onDragStart={onDragStart}
      >
        <span>CPU widget content</span>
      </WidgetFrame>,
    );
    const dragHandle = getByLabelText("Reorder CPU");
    const visibilityButton = getByLabelText("Hide CPU");

    expect(dragHandle.getAttribute("aria-grabbed")).toBe("false");
    expect(visibilityButton.getAttribute("aria-pressed")).toBe("false");

    fireEvent.pointerDown(dragHandle, { clientY: 42, pointerId: 1 });
    fireEvent.click(visibilityButton);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDragStart.mock.calls[0]?.[0]).toBe("cpu");
    expect(onToggleVisibility).toHaveBeenCalledWith("cpu");
  });

  it("reflects hidden and dragging state", () => {
    const { container, getByLabelText } = render(
      <WidgetFrame
        id="memo"
        title="Memo"
        isEditMode={true}
        isDragging={true}
        isVisible={false}
        dragStyle={{ height: 80, top: 12 }}
        onToggleVisibility={vi.fn()}
        onDragStart={vi.fn()}
      >
        <span>Memo widget content</span>
      </WidgetFrame>,
    );
    const slot = container.querySelector(".widget-frame-slot");
    const frame = container.querySelector(".widget-frame");

    if (!(slot instanceof HTMLElement) || !(frame instanceof HTMLElement)) {
      throw new Error("Widget frame was not rendered");
    }

    expect(slot.style.height).toBe("80px");
    expect(frame.classList.contains("widget-frame-editing")).toBe(true);
    expect(frame.classList.contains("widget-frame-dragging")).toBe(true);
    expect(frame.classList.contains("widget-frame-hidden")).toBe(true);
    expect(frame.style.height).toBe("80px");
    expect(frame.style.top).toBe("12px");
    expect(getByLabelText("Reorder Memo").getAttribute("aria-grabbed")).toBe(
      "true",
    );
    expect(getByLabelText("Show Memo").getAttribute("aria-pressed")).toBe(
      "true",
    );
  });
});
