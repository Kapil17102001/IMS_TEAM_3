import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Candidate, CandidateStatus } from "@shared/api";
import CandidateOverviewCard from "@/components/candidate-detail/CandidateOverviewCard";
import ResumeViewer from "@/components/candidate-detail/ResumeViewer";
import InterviewFeedbackTimeline from "@/components/candidate-detail/InterviewFeedbackTimeline";
import StatusUpdateSection from "@/components/candidate-detail/StatusUpdateSection";
import QuickActions from "@/components/candidate-detail/QuickActions";
import InternalNotes from "@/components/candidate-detail/InternalNotes";
import CandidateMetadata from "@/components/candidate-detail/CandidateMetadata";
import { MainLayout } from "../components/layout/MainLayout";

// Helper function to convert skills string to array
const parseSkills = (skillsString: string | string[] | undefined): string[] => {
  if (!skillsString) return [];
  if (Array.isArray(skillsString)) return skillsString;
  return skillsString.split(',').map(skill => skill.trim()).filter(Boolean);
};

export default function CandidateDetail() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCandidate = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`http://localhost:8000/api/v1/candidate/${candidateId}`, {
          headers: {
            'accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch candidate data');
        }

        const data = await response.json();
        
        // Transform the API data to match the Candidate interface
        const transformedCandidate: Candidate = {
          ...data,
          skills: parseSkills(data.skills),
          resume_url: data.resume_name ? `http://localhost:8000/resumes/${data.resume_name}` : undefined,
        };

        setCandidate(transformedCandidate);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setCandidate(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (candidateId) {
      fetchCandidate();
    }
  }, [candidateId]);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-muted-foreground">Loading candidate details...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !candidate) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Button
            variant="outline"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Candidates
          </Button>
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              {error || "Candidate not found."}
            </p>
            <Button className="mt-6" onClick={() => navigate("/")}>
              Return to Candidates
            </Button>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-1 py-1 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}> 
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div>
              {/* <h1 className="text-4xl font-bold text-foreground">{candidate.full_name}</h1>
              <p className="text-muted-foreground text-sm">ID: {candidate.id}</p> */}
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Primary Content (65%) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sticky Overview Card */}
              <div className="lg:top-20">
                <CandidateOverviewCard candidate={candidate} />
              </div>

              {/* Resume Viewer */}
              <ResumeViewer resumeUrl={candidate.resume_url} />

              {/* Interview Feedback Timeline */}
              <InterviewFeedbackTimeline candidateId={candidate.id} />
            </div>

            {/* Right Panel - Action Panel (35%) */}
            <div className="space-y-6">
              {/* Status Update Section */}
              <StatusUpdateSection candidate={candidate} setCandidate={setCandidate} />

              {/* Quick Actions */}
              <QuickActions candidate={candidate} />

              {/* Internal Notes */}
              <InternalNotes candidateId={candidate.id} />

              {/* Candidate Metadata */}
              <CandidateMetadata candidate={candidate} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
