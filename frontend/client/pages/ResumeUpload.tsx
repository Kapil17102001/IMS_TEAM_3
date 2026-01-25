import { MainLayout } from '../components/layout/MainLayout';
import ResumeBulkUpload from '../components/college/ResumeBulkUpload';

export default function ResumeUpload() {
    return (
        <MainLayout>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Resume Upload</h1>
                        <p className="text-muted-foreground mt-1">Upload and manage student resumes</p>
                    </div>
                </div>
                <ResumeBulkUpload />
            </div>
        </MainLayout>
    );
}