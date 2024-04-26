import { useDroppable } from "@dnd-kit/core";
import { useMemo, type ReactNode } from "react";

export function Droppable({ children }: { children: ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: "droppable",
  });

  const style = useMemo(() => {
    return {
      color: isOver ? "green" : undefined,
    };
  }, [isOver]);

  return (
    <div ref={setNodeRef} style={style}>
      {children}
    </div>
  );
}
