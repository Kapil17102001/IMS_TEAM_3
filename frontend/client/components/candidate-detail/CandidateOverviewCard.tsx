import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Candidate, StatusColorMap, getStatusLabel } from "@shared/api";
import { Mail, MapPin, Building2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface CandidateOverviewCardProps {
  candidate: Candidate;
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

export default function CandidateOverviewCard({
  candidate,
}: CandidateOverviewCardProps) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-l-indigo-400" : "border-l-indigo-600";

  const colorKey = StatusColorMap[candidate.status];

  return (
    <Card className={`p-6 border-l-4 ${borderColor} ${bgColor}`}>
      {/* Header with Name and Status */}
      <div className="mb-6">
        <h2 className={`text-3xl font-bold ${textColor} mb-3`}>
          {candidate.full_name}
        </h2>
        <Badge
          className={`text-sm font-semibold ${statusBgColors[colorKey]} border`}
        >
          {getStatusLabel(candidate.status)}
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="space-y-3 mb-6 pb-6 border-b">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <a
            href={`mailto:${candidate.email}`}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {candidate.email}
          </a>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-gray-400" />
          <span className={textColor}>{candidate.university}</span>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="h-5 w-5 text-gray-400" />
          <span className={textColor}>{candidate.address}</span>
        </div>
      </div>

      {/* Candidate ID */}
      <div className={`text-sm ${labelColor}`}>
        <span className="font-medium">Candidate ID:</span> #{candidate.id}
      </div>
    </Card>
  );
}
