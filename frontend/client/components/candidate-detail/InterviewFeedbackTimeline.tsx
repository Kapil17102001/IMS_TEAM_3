import { Card } from "@/components/ui/card";
import { CandidateStatus, getStatusLabel } from "@shared/api";
import { Star, User, Calendar } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface FeedbackEntry {
  id: string;
  round: CandidateStatus;
  interviewer: string;
  date: string;
  feedback: string;
  rating: number; 
}

interface InterviewFeedbackTimelineProps {
  candidateId: number;
}

// Mock feedback data
const mockFeedback: Record<number, FeedbackEntry[]> = {
  1: [
    {
      id: "1",
      round: CandidateStatus.ASSESSMENT,
      interviewer: "Sarah Chen",
      date: "2024-01-30",
      feedback:
        "Strong technical foundation. Good understanding of React concepts. Needs improvement in system design.",
      rating: 3.5,
    },
    {
      id: "2",
      round: CandidateStatus.INTERVIEW1,
      interviewer: "Michael Rodriguez",
      date: "2024-02-05",
      feedback:
        "Excellent problem-solving skills. Implemented the solution efficiently. Great communication.",
      rating: 4.5,
    },
  ],
  2: [
    {
      id: "1",
      round: CandidateStatus.ASSESSMENT,
      interviewer: "John Smith",
      date: "2024-01-28",
      feedback: "Solid Python fundamentals. Shows promise for backend development.",
      rating: 4,
    },
  ],
  4: [
    {
      id: "1",
      round: CandidateStatus.ASSESSMENT,
      interviewer: "Emily Watson",
      date: "2024-02-01",
      feedback: "Impressive system design thinking. Very quick learner.",
      rating: 4.5,
    },
    {
      id: "2",
      round: CandidateStatus.INTERVIEW1,
      interviewer: "David Park",
      date: "2024-02-08",
      feedback:
        "Excellent Go proficiency. Great code quality and architectural awareness.",
      rating: 5,
    },
  ],
};

export default function InterviewFeedbackTimeline({
  candidateId,
}: InterviewFeedbackTimelineProps) {
  const { theme } = useTheme();
  const feedbackList = mockFeedback[candidateId] || [];

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-amber-400 text-amber-400"
                : theme === "dark"
                ? "text-gray-600"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const cardBgColor = theme === "dark" ? "bg-gray-800" : "bg-gray-50";
  const cardBorderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-900";
  const subTextColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const badgeBgColor = theme === "dark" ? "bg-indigo-900" : "bg-indigo-50";
  const badgeTextColor = theme === "dark" ? "text-indigo-300" : "text-indigo-700";
  const badgeBorderColor = theme === "dark" ? "border-indigo-700" : "border-indigo-200";

  return (
    <Card className={`p-6 ${cardBgColor} ${cardBorderColor}`}>
      <h3 className={`text-xl font-bold ${textColor} mb-6`}>
        Interview Feedback Timeline
      </h3>

      {feedbackList.length === 0 ? (
        <div className="text-center py-8">
          <p className={subTextColor}>No feedback entries yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {feedbackList.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline Line */}
              {index !== feedbackList.length - 1 && (
                <div className="absolute left-6 top-16 h-8 w-1 bg-gradient-to-b from-indigo-300 to-gray-200"></div>
              )}

              {/* Timeline Dot and Content */}
              <div className="flex gap-4">
                {/* Dot */}
                <div className="flex flex-col items-center pt-1">
                  <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 border-4 border-white shadow-md">
                    <div className="h-3 w-3 rounded-full bg-indigo-600"></div>
                  </div>
                </div>

                {/* Content */}
                <div className={`flex-1 ${cardBgColor} rounded-lg p-4 border ${cardBorderColor}`}>
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className={`font-semibold ${textColor}`}>
                        {getStatusLabel(entry.round)}
                      </h4>
                      <div className={`flex items-center gap-4 mt-2 text-sm ${subTextColor}`}>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {entry.interviewer}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {renderStars(Math.round(entry.rating * 2) / 2)}
                    </div>
                  </div>

                  {/* Feedback Text */}
                  <p className={`${textColor} text-sm leading-relaxed`}>
                    {entry.feedback}
                  </p>

                  {/* Rating Badge */}
                  <div className="mt-3 inline-block">
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeBgColor} ${badgeTextColor} border ${badgeBorderColor}`}
                    >
                      Score: {entry.rating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
