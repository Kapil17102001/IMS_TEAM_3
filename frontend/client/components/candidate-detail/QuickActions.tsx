import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Candidate, CandidateStatus } from "@shared/api";
import { toast } from "sonner";
import {
  Calendar,
  Mail,
  MessageSquare,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react"; 
import { useTheme } from "@/context/ThemeContext";

interface QuickActionsProps {
  candidate: Candidate;
}

export default function QuickActions({ candidate }: QuickActionsProps) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const noticeBgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const noticeTextColor = theme === "dark" ? "text-gray-300" : "text-gray-600";

  const isDisabled =
    candidate.status === CandidateStatus.REJECTED ||
    candidate.status === CandidateStatus.HIRED;

  const handleScheduleInterview = () => {
    if (isDisabled) {
      toast.error("Cannot schedule interview for this candidate");
      return;
    }
    toast.success("Interview scheduled. Calendar invite sent to candidate.");
  };

  const handleSendEmail = () => {
    toast.success("Email compose window opened");
  };

  const handleAddFeedback = () => {
    if (isDisabled) {
      toast.error("Cannot add feedback for this candidate");
      return;
    }
    toast.success("Feedback form opened. Your feedback has been recorded.");
  };

  const handleRejectCandidate = async () => {
    if (candidate.status === CandidateStatus.REJECTED) {
      toast.error("This candidate is already rejected");
      return;
    }
    if (candidate.status === CandidateStatus.HIRED) {
      toast.error("Cannot reject a hired candidate");
      return;
    }

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      toast.error("Candidate rejected", {
        description: "This action cannot be undone.",
        icon: <AlertCircle className="h-5 w-5" />,
      });
    } catch (error) {
      toast.error("Failed to reject candidate");
    }
  };

  return (
    <Card className={`p-6 ${bgColor}`}>
      <h3 className={`text-lg font-bold ${textColor} mb-4`}>Quick Actions</h3>

      <div className="space-y-2">
        <Button
          variant="outline"
          className={`w-full justify-start gap-2 ${textColor}`}
          onClick={handleScheduleInterview}
          disabled={isDisabled}
        >
          <Calendar className="h-4 w-4" />
          Schedule Interview
        </Button>

        <Button
          variant="outline"
          className={`w-full justify-start gap-2 ${textColor}`}
          onClick={handleSendEmail}
        >
          <Mail className="h-4 w-4" />
          Send Email
        </Button>

        <Button
          variant="outline"
          className={`w-full justify-start gap-2 ${textColor}`}
          onClick={handleAddFeedback}
          disabled={isDisabled}
        >
          <MessageSquare className="h-4 w-4" />
          Add Feedback
        </Button>

        <Button
          variant="outline"
          className={`w-full justify-start gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 ${textColor}`}
          onClick={handleRejectCandidate}
          disabled={isDisabled}
        >
          <Trash2 className="h-4 w-4" />
          Reject Candidate
        </Button>
      </div>

      {isDisabled && (
        <div className={`mt-4 p-3 ${noticeBgColor} border ${borderColor} rounded-lg flex gap-2`}>
          <AlertCircle className="h-4 w-4 text-gray-600 flex-shrink-0 mt-0.5" />
          <p className={`text-xs ${noticeTextColor}`}>
            Actions are disabled for this candidate's current status.
          </p>
        </div>
      )}
    </Card>
  );
}
