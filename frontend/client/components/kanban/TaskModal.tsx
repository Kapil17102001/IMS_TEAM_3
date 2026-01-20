import { useState, useEffect } from "react";
import { Task } from "../../types";
import { mockInterns } from "../../mock-data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Trash2 } from "lucide-react";
import axios from "axios";

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}

export function TaskModal({
  isOpen,
  task,
  onClose,
  onSave,
  onDelete,
}: TaskModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assignedIntern: "",
    priority: "medium" as "LOW" | "MEDIUM" | "HIGH",
    status: "todo" as "TODO"  | "IN_PROGRESS" | "DONE" ,
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || "",
        assignedIntern: task.assignedIntern,
        priority: task.priority as "LOW" | "MEDIUM" | "HIGH",
        status: task.status as any,
        dueDate: task.dueDate || "",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        assignedIntern: "",
        priority: "MEDIUM",
        status: "TODO",
        dueDate: "",
      });
    }
    setErrors({});
  }, [task, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    }
    if (!formData.assignedIntern) {
      newErrors.assignedIntern = "Please select an intern";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/api/v1/tasks/tasks?user_id=1", {
        title: formData.title,
        description: formData.description,
        status: formData.status.toUpperCase(),
        position: 0, // Assuming position is 0 for new tasks
        due_date: formData.dueDate,
        priority: formData.priority,
        assigned_interns: formData.assignedIntern ? [parseInt(formData.assignedIntern)] : [],
      });

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {task ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {task
              ? "Update the task details below"
              : "Fill in the details to create a new task"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Implement user authentication"
              className="mt-1.5"
            />
            {errors.title && (
              <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Add task details..."
              rows={3}
              className="mt-1.5 flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Assigned Intern */}
          <div>
            <Label htmlFor="intern" className="text-sm font-medium">
              Assigned Intern <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.assignedIntern}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, assignedIntern: value }))
              }
            >
              <SelectTrigger id="intern" className="mt-1.5">
                <SelectValue placeholder="Select an intern" />
              </SelectTrigger>
              <SelectContent>
                {mockInterns.map((intern) => (
                  <SelectItem key={intern.id} value={intern.id}>
                    {intern.name} - {intern.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assignedIntern && (
              <div className="flex items-center gap-1 mt-1 text-xs text-destructive">
                <AlertCircle className="w-3 h-3" />
                {errors.assignedIntern}
              </div>
            )}
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority" className="text-sm font-medium">
              Priority
            </Label>
            <Select
              value={formData.priority}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, priority: value as any }))
              }
            >
              <SelectTrigger id="priority" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status" className="text-sm font-medium">
              Status
            </Label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, status: value as any }))
              }
            >
              <SelectTrigger id="status" className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODO">To Do</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value ="REVIEW">Review</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Due Date */}
          <div>
            <Label htmlFor="dueDate" className="text-sm font-medium">
              Due Date <span className="text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, dueDate: e.target.value }))
              }
              className="mt-1.5"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-border">
            {task && onDelete && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onDelete}
                className="flex-1 gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="flex-1">
              {task ? "Update" : "Create"} Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
