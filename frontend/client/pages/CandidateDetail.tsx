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

// Mock data - in a real app, this would come from an API
const mockCandidates: Record<number, Candidate> = {
  1: {
    id: 1,
    full_name: "Alice Johnson",
    email: "alice.johnson@example.com",
    university: "Stanford University",
    status: CandidateStatus.INTERVIEW1,
    address: "San Francisco, CA",
    resume_url: "https://example.com/resumes/alice.pdf",
    application_date: "2024-01-15",
    source: "LinkedIn Referral",
    experience_years: 5,
    skills: ["React", "TypeScript", "Node.js"],
  },
  2: {
    id: 2,
    full_name: "Bob Smith",
    email: "bob.smith@example.com",
    university: "MIT",
    status: CandidateStatus.ASSESSMENT,
    address: "Boston, MA",
    resume_url: "https://example.com/resumes/bob.pdf",
    application_date: "2024-01-20",
    source: "Campus Recruitment",
    experience_years: 3,
    skills: ["Python", "Django", "PostgreSQL"],
  },
  3: {
    id: 3,
    full_name: "Carol White",
    email: "carol.white@example.com",
    university: "Berkeley",
    status: CandidateStatus.PENDING,
    address: "Berkeley, CA",
    resume_url: "https://example.com/resumes/carol.pdf",
    application_date: "2024-01-22",
    source: "Career Portal",
    experience_years: 7,
    skills: ["Java", "Spring", "Kubernetes"],
  },
  4: {
    id: 4,
    full_name: "David Brown",
    email: "david.brown@example.com",
    university: "CMU",
    status: CandidateStatus.INTERVIEW2,
    address: "Pittsburgh, PA",
    resume_url: "https://example.com/resumes/david.pdf",
    application_date: "2024-01-25",
    source: "Employee Referral",
    experience_years: 2,
    skills: ["Go", "Rust", "AWS"],
  },
};

export default function CandidateDetail() {
  const { candidateId } = useParams<{ candidateId: string }>();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch
    const id = parseInt(candidateId || "0");
    const fetchedCandidate = mockCandidates[id] || null;
    setCandidate(fetchedCandidate);
    setIsLoading(false);
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

  if (!candidate) {
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
            <p className="text-muted-foreground text-lg">Candidate not found.</p>
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
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate("/")}> 
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">{candidate.full_name}</h1>
              <p className="text-muted-foreground text-sm">ID: {candidate.id}</p>
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel - Primary Content (65%) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sticky Overview Card */}
              <div className="lg:sticky lg:top-20">
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
