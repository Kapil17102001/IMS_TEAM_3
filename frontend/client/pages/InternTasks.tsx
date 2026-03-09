import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { Loader2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    score: number | null;
    feedback: string | null;
    created_at: string;
}

export default function InternTasks() {
    const { user } = useUser();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchTasks() {
            if (!user?.id) return;

            try {
                setLoading(true);
                // Assuming user.id corresponds to the intern_id expected by the API
                // If user.id is a UUID and intern_id is an integer, this might need adjustment based on how the backend maps them.
                // For now, I'll use user.id.
                const response = await axios.get(
                    `http://localhost:8000/api/v1/tasks/tasks/intern/${user.id}?id_type=user`,
                    {
                        headers: {
                            accept: "application/json",
                        },
                    }
                );
                setTasks(response.data);
            } catch (err: any) {
                console.error("Error fetching tasks:", err);
              //  const errorMessage = err.response?.data?.detail || "Failed to load tasks. Please try again later.";

                // If 404, it might just mean no tasks found, which we can treat as empty list if the messaging supports it,
                // but the backend throws 404 for "No tasks found".
                // Ideally backend should return empty list.
                // For now, if 404, we can set tasks to empty and clear error?
                // The backend code says: raise HTTPException(status_code=404, detail="No tasks found for the given intern ID")
                if (err.response?.status === 404 && errorMessage.includes("No tasks found")) {
                    setTasks([]);
                    setError(null);
                } else {
                    setError(errorMessage);
                }
            } finally {
                setLoading(false);
            }
        }

        fetchTasks();
    }, [user?.id]);

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "completed":
            case "done":
                return (
                    <Badge variant="default" className="bg-green-500/20 text-green-600 hover:bg-green-500/30 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Completed
                    </Badge>
                );
            case "in progress":
            case "in-progress":
                return (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-600 hover:bg-blue-500/30 border-0">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                    </Badge>
                );
            case "pending":
            case "todo":
                return (
                    <Badge variant="outline" className="text-yellow-600 border-yellow-200 bg-yellow-50">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Pending
                    </Badge>
                );
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getScoreColor = (score: number | null) => {
        if (score === null) return "text-muted-foreground";
        if (score >= 80) return "text-green-600";
        if (score >= 60) return "text-yellow-600";
        return "text-red-600";
    };

    if (!user) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center h-full">
                    <p>Please log in to view your tasks.</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">My Tasks</h1>
                    <p className="text-muted-foreground">
                        Track your assigned tasks, progress, and performance feedback.
                    </p>
                </div>

                {error && (
                    <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md border border-destructive/20">
                        {error}
                    </div>
                )}

                <Card className="overflow-hidden border shadow-sm">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                            <p className="text-sm text-muted-foreground">Loading tasks...</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/50 border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">
                                            Task
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-1/3">
                                            Feedback
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border bg-card">
                                    {tasks.length > 0 ? (
                                        tasks.map((task) => (
                                            <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <p className="font-medium text-foreground">{task.title}</p>
                                                        {task.description && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                                {task.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(task.status)}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {task.score !== null ? (
                                                        <span className={`font-bold text-lg ${getScoreColor(task.score)}`}>
                                                            {task.score}/100
                                                        </span>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground italic">Not graded</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-muted-foreground">
                                                    {task.feedback ? (
                                                        <p className="whitespace-pre-wrap">{task.feedback}</p>
                                                    ) : (
                                                        <span className="italic opacity-50">No feedback yet</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center gap-2">
                                                    <CheckCircle2 className="w-8 h-8 opacity-20" />
                                                    <p>No tasks assigned yet.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </Card>
            </div>
        </MainLayout>
    );
}
