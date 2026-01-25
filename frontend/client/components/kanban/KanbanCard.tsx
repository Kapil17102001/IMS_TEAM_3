import { Task } from "../../types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical, Edit2, Trash2, Flag } from "lucide-react";
import { useInterns } from "../../context/InternsContext";
import axios from "axios";
import { useUser } from "../../context/UserContext";
import { useToast } from "@/hooks/use-toast";

interface KanbanCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  isDragging: boolean;
}

export function KanbanCard({
  task,
  onEdit,
  onDelete,
  onDragStart,
  onDragEnd,
  isDragging,
}: KanbanCardProps) {
  const { interns } = useInterns(); // Use interns from InternsContext
  const { user } = useUser(); // Use user context to get role
  const intern = interns.find((i) => i.id === Number(task.assignedIntern)); // Use real interns data
  const { toast } = useToast();

  const getPriorityColor = (priority: string) => {
    switch (priority.toUpperCase()) {
      case "HIGH":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "MEDIUM":
        return "bg-warning/10 text-warning border-warning/20";
      case "LOW":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority.toUpperCase() === "HIGH" || priority.toUpperCase() === "MEDIUM") {
      return <Flag className="w-3 h-3" />;
    }
    return null;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const handleApprove = async () => {
    try {
      // Update the task status in the backend
      await axios.put(
        `http://localhost:8000/api/v1/tasks/tasks/${task.id}/status`,
        null,
        {
          params: { status: "DONE" },
          headers: {
            accept: "application/json",
          },
        }
      );

      // Show success toast
      toast({
        title: "Task Approved",
        description: `Task ${task.title} has been approved successfully!`,
        variant: "success",
      });

      // Update the task status locally
      task.status = "done";

      // Trigger re-render of the parent page
      onDragEnd();
    } catch (error) {
      console.error("Error approving task:", error);

      // Show error toast
      toast({
        title: "Error",
        description: "Failed to approve the task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={`p-4 cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md ${
        isDragging ? "opacity-50 ring-2 ring-primary" : "hover:shadow-lg"
      }`}
    >
      {/* Title */}
      <h4 className="font-semibold text-foreground text-sm mb-3 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Priority & Due Date */}
      <div className="flex items-center gap-2 mb-3">
        <Badge variant="outline" className={`text-xs gap-1 ${getPriorityColor(task.priority)}`}>
          {getPriorityIcon(task.priority)}
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1).toLowerCase()}
        </Badge>

        {task.dueDate && (
          <div className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
            <Calendar className="w-3 h-3" />
            <span className={isOverdue ? "font-semibold" : ""}>
              {formatDate(task.dueDate)}
            </span>
          </div>
        )}
      </div>

      {/* Assigned Intern */}
      {intern && (
        <div className="flex items-center gap-2 mb-4 p-2 bg-muted/50 rounded">
          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
            {intern.full_name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground truncate">
              {intern.full_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {intern.job_position}
            </p>
          </div>
        </div>
      )}

      {/* Approve Button */}
      {user.role === "admin" && task.status === "review" && (
        <Button
          onClick={handleApprove}
          className="w-full bg-green-600 hover:bg-green-700 text-white mb-4"
        >
          Approve
        </Button>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          ID: {task.id}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="w-7 h-7">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
              <Edit2 className="w-4 h-4 mr-2" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="cursor-pointer text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
