import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Candidate,
  CandidateStatus,
  getAllowedNextStatuses,
  getStatusLabel,
  StatusColorMap,
} from "@shared/api";
import { AlertCircle, CheckCircle, Loader2, Star } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface StatusUpdateSectionProps {
  candidate: Candidate;
  setCandidate: (candidate: Candidate) => void;
}

const statusBgColors: Record<string, string> = {
  pending: "bg-status-pending/10 text-status-pending border-status-pending/20",
  assessment:
    "bg-status-assessment/10 text-status-assessment border-status-assessment/20",
  interview:
    "bg-status-interview/10 text-status-interview border-status-interview/20",
  hr: "bg-status-hr/10 text-status-hr border-status-hr/20",
  hired: "bg-status-hired/10 text-status-hired border-status-hired/20",
  rejected: "bg-status-rejected/10 text-status-rejected border-status-rejected/20",
};

export default function StatusUpdateSection({
  candidate,
  setCandidate,
}: StatusUpdateSectionProps) {
  const { theme } = useTheme();

  const [selectedStatus, setSelectedStatus] = useState<CandidateStatus | "">(
    ""
  );
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const allowedStatuses = getAllowedNextStatuses(candidate.status);
  const isRejectedOrHired =
    candidate.status === CandidateStatus.REJECTED ||
    candidate.status === CandidateStatus.HIRED;

  const requiresConfirmation =
    selectedStatus === CandidateStatus.REJECTED ||
    selectedStatus === CandidateStatus.HIRED;

  const handleStatusSelect = (value: string) => {
    setSelectedStatus(value as CandidateStatus);
  };

  const handleUpdateClick = () => {
    if (!selectedStatus) {
      toast.error("Please select a status");
      return;
    }

    if (!feedback.trim()) {
      toast.error("Please provide feedback before updating status");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating before updating status");
      return;
    }

    if (requiresConfirmation) {
      setShowConfirmation(true);
    } else {
      performStatusUpdate();
    }
  };

  const performStatusUpdate = async () => {
    if (!selectedStatus) return;

    setIsUpdating(true);
    try {
      // Simulate API call - submit feedback and status update together
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const updatedCandidate = {
        ...candidate,
        status: selectedStatus,
      };

      // In a real app, this would also save the feedback to the backend:
      // {
      //   candidateId: candidate.id,
      //   round: selectedStatus,
      //   feedback: feedback,
      //   rating: rating,
      //   interviewer: currentUser.name,
      //   date: new Date().toISOString()
      // }

      setCandidate(updatedCandidate);
      setSelectedStatus("");
      setFeedback("");
      setRating(0);
      setShowConfirmation(false);

      const newStatusLabel = getStatusLabel(selectedStatus);
      toast.success(
        `Status updated to ${newStatusLabel} with feedback recorded`,
        {
          icon: <CheckCircle className="h-5 w-5" />,
        }
      );
    } catch (error) {
      toast.error("Failed to update status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const getWarningMessage = () => {
    if (selectedStatus === CandidateStatus.REJECTED) {
      return "This action will mark the candidate as rejected. They will not be able to progress further in the pipeline.";
    }
    if (selectedStatus === CandidateStatus.HIRED) {
      return "This action will mark the candidate as hired. This is typically the final step in the process.";
    }
    return "";
  };

  const currentColorKey = StatusColorMap[candidate.status];
  const cardBorderColor = theme === "dark" ? "border-t-gray-600" : "border-t-indigo-600";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-900";
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";

  return (
    <>
      <Card className={`p-6 border-t-4 ${cardBorderColor}`}>
        <h3 className={`text-lg font-bold ${textColor} mb-4`}>
          Status Update
        </h3>

        {/* Current Status Display */}
        <div className={`mb-6 p-4 ${bgColor} rounded-lg border ${borderColor}`}>
          <p className={`text-xs ${textColor} font-medium mb-2`}>CURRENT STATUS</p>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                {
                  pending: "bg-status-pending",
                  assessment: "bg-status-assessment",
                  interview: "bg-status-interview",
                  hr: "bg-status-hr",
                  hired: "bg-status-hired",
                  rejected: "bg-status-rejected",
                }[currentColorKey]
              }`}
            ></span>
            <span className={`font-semibold ${textColor}`}>
              {getStatusLabel(candidate.status)}
            </span>
          </div>
        </div>

        {/* Status Disabled Message */}
        {isRejectedOrHired && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                No further actions available
              </p>
              <p className="text-xs text-amber-800 mt-1">
                This candidate's status is final and cannot be changed.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Section */}
        {!isRejectedOrHired && (
          <>
            <div className="mb-6">
              <label className={`text-sm font-medium ${textColor} block mb-2`}>
                Interview Feedback
              </label>
              <Textarea
                placeholder="Provide detailed feedback about the candidate's performance, skills, cultural fit, and any notes for the team..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-24"
                disabled={isUpdating}
              />
              <p className="text-xs text-gray-500 mt-2">
                {feedback.length} characters
              </p>
            </div>

            {/* Star Rating */}
            <div className="mb-6">
              <label className={`text-sm font-medium ${textColor} block mb-3`}>
                Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => !isUpdating && setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => !isUpdating && setRating(star)}
                    className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
                    disabled={isUpdating}
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= (hoverRating || rating)
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className={`text-sm font-medium ${textColor} mt-2`}>
                  Rating: <span className="text-amber-600">{rating}/5</span>
                </p>
              )}
            </div>
          </>
        )}

        {/* Status Dropdown */}
        <div className="mb-6">
          <label className={`text-sm font-medium ${textColor} block mb-2`}>
            Next Status
          </label>
          <Select value={selectedStatus} onValueChange={handleStatusSelect} disabled={isRejectedOrHired}>
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={
                  allowedStatuses.length === 0
                    ? "No transitions available"
                    : "Select next status..."
                }
              />
            </SelectTrigger>
            <SelectContent>
              {allowedStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {getStatusLabel(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {allowedStatuses.length === 0 && (
            <p className="text-xs text-gray-500 mt-2">
              No valid status transitions available from{" "}
              {getStatusLabel(candidate.status)}.
            </p>
          )}
        </div>

        {/* Update Button */}
        <Button
          onClick={handleUpdateClick}
          disabled={!selectedStatus || !feedback.trim() || rating === 0 || isUpdating || isRejectedOrHired}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Status"
          )}
        </Button>
      </Card>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change & Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              {getWarningMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 my-4">
            {/* Status Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-900">
                <strong>New Status:</strong> {getStatusLabel(selectedStatus as CandidateStatus)}
              </p>
            </div>

            {/* Feedback Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-blue-900 mb-2">FEEDBACK</p>
              <p className="text-sm text-blue-900 leading-relaxed">{feedback}</p>
            </div>

            {/* Rating Info */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-indigo-900 mb-2">RATING</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm font-semibold text-indigo-900 ml-2">
                  {rating}/5
                </span>
              </div>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={performStatusUpdate}
              disabled={isUpdating}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm & Update"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
