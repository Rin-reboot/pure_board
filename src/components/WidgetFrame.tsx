import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import type { WidgetId } from "../hooks/useWidgetLayout";

interface WidgetFrameProps {
  id: WidgetId;
  title: string;
  isEditMode: boolean;
  isDragging: boolean;
  isVisible: boolean;
  dragStyle?: CSSProperties;
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
  dragStyle,
  children,
  onToggleVisibility,
  onDragStart,
}: WidgetFrameProps) {
  return (
    <div
      className="widget-frame-slot"
      data-widget-id={id}
      style={isDragging ? { height: dragStyle?.height } : undefined}
    >
      <section
        className={[
          "widget-frame",
          isEditMode ? "widget-frame-editing" : "",
          isDragging ? "widget-frame-dragging" : "",
          !isVisible ? "widget-frame-hidden" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={dragStyle}
        aria-label={title}
      >
        {isEditMode ? (
          <div className="widget-edit-toolbar">
            <button
              type="button"
              className="widget-drag-handle"
              aria-label={`Reorder ${title}`}
              aria-grabbed={isDragging}
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
    </div>
  );
}
