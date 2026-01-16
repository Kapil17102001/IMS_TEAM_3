import { Task } from "../../types";
import { KanbanCard } from "./KanbanCard";
import { Card } from "@/components/ui/card";

interface KanbanColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  draggedTask: Task | null;
}

export function KanbanColumn({
  column,
  tasks,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDrop,
  draggedTask,
}: KanbanColumnProps) {
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop();
  };

  const isDropping = draggedTask !== null;

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`flex flex-col bg-muted/30 rounded-lg p-4 border-2 transition-all duration-200 ${
        isDropping ? "border-primary bg-primary/5" : "border-border"
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-foreground">{column.title}</h3>
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 space-y-3 min-h-[400px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center">
            <p className="text-sm text-muted-foreground">
              Drop tasks here
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onDragStart={() => onDragStart(task)}
              onDragEnd={onDragEnd}
              isDragging={draggedTask?.id === task.id}
            />
          ))
        )}
      </div>

      {/* Add Task Button */}
      <button className="mt-4 w-full py-2 rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-sm font-medium text-muted-foreground hover:text-primary">
        + Add Task
      </button>
    </div>
  );
}
