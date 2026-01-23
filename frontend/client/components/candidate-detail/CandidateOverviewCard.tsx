import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Candidate, StatusColorMap, getStatusLabel } from "@shared/api";
import { Mail, MapPin, Building2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface CandidateOverviewCardProps {
  candidate: Candidate;
}

const statusBgColors: Record<string, string> = {
  pending: "bg-yellow-500 text-white",
  assessment: "bg-blue-500 text-white",
  interview1: "bg-purple-500 text-white",
  interview2: "bg-indigo-500 text-white",
  hr: "bg-teal-500 text-white",
  hired: "bg-green-500 text-white",
  rejected: "bg-red-500 text-white",
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
