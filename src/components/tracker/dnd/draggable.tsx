import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, type ReactNode } from "react";

export function Draggable({ children }: { children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: "draggable",
  });

  const style = useMemo(() => {
    if (!transform) return undefined;

    return {
      transform: CSS.Translate.toString(transform),
    };
  }, [transform]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-destructive"
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
