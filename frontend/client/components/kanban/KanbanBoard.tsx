import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { Task } from "../../types";
import { KanbanColumn } from "./KanbanColumn";
import { TaskModal } from "./TaskModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type TaskStatus = "todo" | "in-progress" | "review" | "done";

interface KanbanBoardProps {
  initialTasks: Task[];
}

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const columns: { id: TaskStatus; title: string }[] = [
    { id: "todo", title: "To Do" },
    { id: "in-progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "done", title: "Done" },
  ];

  const getTasksByStatus = useCallback(
    (status: TaskStatus) => tasks.filter((task) => task.status === status),
    [tasks]
  );

  const handleAddTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const handleSaveTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (editingTask) {
      // Update existing task
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                ...taskData,
                updatedAt: new Date().toISOString().split("T")[0],
              }
            : task
        )
      );
    } else {
      // Create new task
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString().split("T")[0],
        updatedAt: new Date().toISOString().split("T")[0],
      };
      setTasks((prev) => [...prev, newTask]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDropOnColumn = async (status: TaskStatus) => {
    if (draggedTask) {
      try {
        // Update the task status in the backend
        await axios.put(
          `http://localhost:8000/api/v1/tasks/tasks/${draggedTask.id}/status`,
          null,
          {
            params: { status: status.toUpperCase() },
            headers: {
              accept: "application/json",
            },
          }
        );

        // Update the task status locally
        setTasks((prev) =>
          prev.map((task) =>
            task.id === draggedTask.id ? { ...task, status } : task
          )
        );
        setDraggedTask(null);
      } catch (error) {
        console.error("Error updating task status:", error);
      }
    }
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/v1/tasks/tasks?user_id=1", {
          headers: {
            accept: "application/json",
          },
        });

        // Convert the fetched data to match the dummy data structure
        const convertedTasks = response.data.map((task: any) => ({
          id: task.task_id.toString(),
          title: task.title,
          description: task.description,
          status: task.status.toLowerCase().replace("_", "-"), // Convert status to match dummy data format
          position: task.position,
          dueDate: task.due_date, // Convert due_date to dueDate
          priority: task.priority.toLowerCase(), // Convert priority to lowercase
          createdAt: task.created_at,
          updatedAt: task.updated_at,
          assignedIntern: task.assignedIntern
        }));

        setTasks(convertedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      }
    };

    fetchTasks();
  }, [isModalOpen]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Planner</h1>
          <p className="text-muted-foreground">
            Manage intern tasks and track progress
          </p>
        </div>
        <Button onClick={handleAddTask} className="gap-2">
          <Plus className="w-4 h-4" />
          New Task
        </Button>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {columns.map((col) => {
          const count = getTasksByStatus(col.id).length;
          return (
            <div
              key={col.id}
              className="bg-muted/50 rounded-lg p-4 border border-border"
            >
              <p className="text-sm font-medium text-muted-foreground">{col.title}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-max">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={getTasksByStatus(column.id)}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDropOnColumn(column.id)}
            draggedTask={draggedTask}
          />
        ))}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);

        }}
        onSave={handleSaveTask}
        onDelete={editingTask ? () => handleDeleteTask(editingTask.id) : undefined}
      />
    </div>
  );
}
