"use client";

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type HandleProps = Record<string, unknown>;

function SortableRow({ id, render }: { id: string; render: (handleProps: HandleProps, isDragging: boolean) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div ref={setNodeRef} style={style} className={"sortable-row" + (isDragging ? " dragging" : "")}>
      {render({ ...attributes, ...listeners }, isDragging)}
    </div>
  );
}

export default function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (item: T, index: number, handleProps: HandleProps) => React.ReactNode;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item, index) => (
          <SortableRow key={item.id} id={item.id} render={(handleProps) => children(item, index, handleProps)} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
