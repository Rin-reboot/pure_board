import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { PointerEvent, ReactNode } from "react";
import type { WidgetId } from "../hooks/useWidgetLayout";

interface WidgetFrameProps {
  id: WidgetId;
  title: string;
  isEditMode: boolean;
  isDragging: boolean;
  isVisible: boolean;
  children: ReactNode;
  onToggleVisibility: (id: WidgetId) => void;
  onDragStart: (id: WidgetId, event: PointerEvent<HTMLButtonElement>) => void;
}

export function WidgetFrame({
  id,
  title,
  isEditMode,
  isDragging,
  isVisible,
  children,
  onToggleVisibility,
  onDragStart,
}: WidgetFrameProps) {
  return (
    <section
      className={[
        "widget-frame",
        isEditMode ? "widget-frame-editing" : "",
        isDragging ? "widget-frame-dragging" : "",
        !isVisible ? "widget-frame-hidden" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-widget-id={id}
      aria-label={title}
    >
      {isEditMode ? (
        <div className="widget-edit-toolbar">
          <button
            type="button"
            className="widget-drag-handle"
            aria-label={`Reorder ${title}`}
            onPointerDown={(event) => onDragStart(id, event)}
          >
            <GripVertical size={16} />
          </button>
          <span className="widget-edit-title">{title}</span>
          <button
            type="button"
            className="widget-visibility-toggle"
            aria-label={isVisible ? `Hide ${title}` : `Show ${title}`}
            aria-pressed={!isVisible}
            onClick={() => onToggleVisibility(id)}
          >
            {isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
      ) : null}
      {children}
    </section>
  );
}
