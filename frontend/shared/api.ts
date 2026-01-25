/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}


/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Candidate status enum - represents the hiring pipeline stages
 */
export enum CandidateStatus {
  ASSESSMENT = "assessment",
  INTERVIEW1 = "interview1",
  INTERVIEW2 = "interview2",
  HR = "hr",
  HIRED = "hired",
  REJECTED = "rejected",
}

/**
 * Candidate data structure
 */
export interface Candidate {
  id: number;
  full_name: string;
  email: string;
  university: string;
  status: CandidateStatus;
  address: string;
  resume_url?: string;
  application_date?: string;
  source?: string;
  experience_years?: number;
  skills?: string[];
}

/**
 * Interview feedback entry
 */
export interface InterviewFeedback {
  id: string;
  round: CandidateStatus;
  interviewer_name: string;
  date: string;
  feedback: string;
  rating: number;
}

/**
 * Internal notes for a candidate
 */
export interface CandidateNote {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

/**
 * Status color mapping
 */
export const StatusColorMap: Record<CandidateStatus, string> = {
  [CandidateStatus.PENDING]: "pending",
  [CandidateStatus.ASSESSMENT]: "assessment",
  [CandidateStatus.INTERVIEW1]: "interview",
  [CandidateStatus.INTERVIEW2]: "interview",
  [CandidateStatus.HR]: "hr",
  [CandidateStatus.HIRED]: "hired",
  [CandidateStatus.REJECTED]: "rejected",
};

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: CandidateStatus): string {
  const labels: Record<CandidateStatus, string> = {
    [CandidateStatus.ASSESSMENT]: "Assessment",
    [CandidateStatus.INTERVIEW1]: "Interview Round 1",
    [CandidateStatus.INTERVIEW2]: "Interview Round 2",
    [CandidateStatus.HR]: "HR Review",
    [CandidateStatus.HIRED]: "Hired",
    [CandidateStatus.REJECTED]: "Rejected",
  };
  return labels[status];
}

/**
 * Get allowed next statuses based on current status
 */
export function getAllowedNextStatuses(
  currentStatus: CandidateStatus
): CandidateStatus[] {
  const transitions: Record<CandidateStatus, CandidateStatus[]> = {
   
    [CandidateStatus.ASSESSMENT]: [
      CandidateStatus.INTERVIEW1,
      CandidateStatus.REJECTED,
    ],
    [CandidateStatus.INTERVIEW1]: [
      CandidateStatus.INTERVIEW2,
      CandidateStatus.REJECTED,
    ],
    [CandidateStatus.INTERVIEW2]: [CandidateStatus.HR, CandidateStatus.REJECTED],
    [CandidateStatus.HR]: [CandidateStatus.HIRED, CandidateStatus.REJECTED],
    [CandidateStatus.HIRED]: [],
    [CandidateStatus.REJECTED]: [],
  };
  return transitions[currentStatus] || [];
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  from: CandidateStatus,
  to: CandidateStatus
): boolean {
  return getAllowedNextStatuses(from).includes(to);
}

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

