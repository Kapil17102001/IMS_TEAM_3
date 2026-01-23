export interface Student {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    status: 'INTERVIEW_SCHEDULED' | 'CLEARED_INTERVIEW' | 'HIRED' | 'REJECTED';
    hiringDate?: string;
    joiningDate?: string;
    roundDetails?: string;
    createdAt: string;
}

export interface College {
    id: string;
    name: string;
    email: string;
}

export interface OfferLetter {
    id: string;
    studentId: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    uploadedAt: string;
}

export interface Resume {
    id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
}
