import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Candidate } from "@shared/api";
import { Calendar, Briefcase, Tag } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface CandidateMetadataProps {
  candidate: Candidate;
}

export default function CandidateMetadata({ candidate }: CandidateMetadataProps) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";

  return (
    <Card className={`p-6 ${bgColor}`}>
      <h3 className={`text-lg font-bold ${textColor} mb-4`}>Metadata</h3>

      <div className="space-y-4">
        {/* Application Date */}
        {candidate.application_date && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <label className={`text-xs font-semibold ${labelColor} uppercase`}>
                Application Date
              </label>
            </div>
            <p className={`text-sm ${textColor} ml-6`}>
              {new Date(candidate.application_date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}

        {/* Source */}
        {candidate.source && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <label className={`text-xs font-semibold ${labelColor} uppercase`}>
                Source
              </label>
            </div>
            <p className={`text-sm ${textColor} ml-6`}>{candidate.source}</p>
          </div>
        )}

        {/* Experience */}
        {candidate.experience_years !== undefined && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-4 w-4 text-gray-400" />
              <label className={`text-xs font-semibold ${labelColor} uppercase`}>
                Experience
              </label>
            </div>
            <p className={`text-sm ${textColor} ml-6`}>
              {candidate.experience_years} year{candidate.experience_years !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <label className={`text-xs font-semibold ${labelColor} uppercase`}>
                Skills
              </label>
            </div>
            <div className="flex flex-wrap gap-2 ml-6">
              {candidate.skills.map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-800 dark:text-indigo-200 dark:border-indigo-600"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
