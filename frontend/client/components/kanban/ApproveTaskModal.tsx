import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Task } from "../../types";

interface ApproveTaskModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onApprove: (score: number, feedback: string) => void;
}

export function ApproveTaskModal({
    isOpen,
    task,
    onClose,
    onApprove,
}: ApproveTaskModalProps) {
    const [score, setScore] = useState(100);
    const [feedback, setFeedback] = useState("");

    const handleApprove = () => {
        onApprove(score, feedback);
        setScore(100);
        setFeedback("");
    };

    if (!task) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Approve Task</DialogTitle>
                    <DialogDescription>
                        Provide a score and feedback for "{task.title}".
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="score" className="font-semibold">
                            Score: {score}
                        </Label>
                        <Slider
                            id="score"
                            min={0}
                            max={100}
                            step={1}
                            value={[score]}
                            onValueChange={(value) => setScore(value[0])}
                            className="py-4"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="feedback" className="font-semibold">
                            Feedback
                        </Label>
                        <Textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="Good job on this task..."
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
                        Approve & Complete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
