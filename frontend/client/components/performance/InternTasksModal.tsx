import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Task } from "../../types";
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";

interface InternTasksModalProps {
    isOpen: boolean;
    onClose: () => void;
    internName: string;
    tasks: Task[];
}

export function InternTasksModal({
    isOpen,
    onClose,
    internName,
    tasks,
}: InternTasksModalProps) {

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case "done":
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case "in-progress":
                return <Clock className="w-5 h-5 text-blue-500" />;
            case "review":
                return <AlertCircle className="w-5 h-5 text-yellow-500" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case "done":
                return "Completed";
            case "in-progress":
                return "In Progress";
            case "review":
                return "Under Review";
            default:
                return "To Do";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Tasks Evaluation - {internName}</DialogTitle>
                    <DialogDescription>
                        Detailed performance breakdown by task
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[30%]">Task Name</TableHead>
                                <TableHead className="w-[15%] text-center">Status</TableHead>
                                <TableHead className="w-[15%] text-center">Score</TableHead>
                                <TableHead className="w-[40%]">Feedback</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tasks.length > 0 ? (
                                tasks.map((task) => (
                                    <TableRow key={task.id} className="hover:bg-muted/50">
                                        <TableCell className="font-medium align-top">
                                            <div>
                                                <div className="text-sm font-semibold text-foreground">{task.title}</div>
                                                {task.description && (
                                                    <div className="text-xs text-muted-foreground mt-1 line-clamp-2" title={task.description}>
                                                        {task.description}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="align-top">
                                            <div className="flex flex-col items-center justify-center gap-1">
                                                {getStatusIcon(task.status)}
                                                <span className="text-xs font-medium text-muted-foreground">
                                                    {getStatusText(task.status)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center align-top">
                                            {task.score !== undefined ? (
                                                <div className="flex flex-col items-center">
                                                    <span className={`text-lg font-bold ${task.score >= 80 ? "text-green-600" :
                                                            task.score >= 70 ? "text-amber-600" : "text-red-600"
                                                        }`}>
                                                        {task.score}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">/ 100</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="align-top text-sm">
                                            {task.feedback ? (
                                                <p className="text-muted-foreground whitespace-pre-wrap">{task.feedback}</p>
                                            ) : (
                                                task.status.toLowerCase() === 'done' && task.score === undefined ? (
                                                    <span className="text-xs italic text-yellow-600">Pending Evaluation</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                        No tasks assigned to this intern.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    );
}
