import React, { useState, useEffect } from 'react';
import { Student } from '../../types/college';

interface StudentDetailProps {
    student: Student;
    onClose: () => void;
    onUploadSuccess?: () => void;
}

interface UploadedFile {
    id: number;
    student_id: number;
    file_name: string;
    file_path: string;
    file_size: number;
    uploaded_at: string;
}

const StudentDetail: React.FC<StudentDetailProps> = ({ student, onClose, onUploadSuccess }) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    useEffect(() => {
        fetchFiles();
    }, [student.id]);

    const fetchFiles = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/student/${student.id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setFiles([]);
                } else {
                    throw new Error('Failed to fetch files');
                }
            } else {
                const data = await response.json();
                setFiles(data);
            }
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch files:', error);
            setFiles([]);
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(e.target.files);
        }
    };

    const handleUpload = async () => {
        if (!selectedFiles || selectedFiles.length === 0) {
            alert('Please select files to upload');
            return;
        }

        setUploading(true);
        const formData = new FormData();

        for (let i = 0; i < selectedFiles.length; i++) {
            formData.append('files', selectedFiles[i]);
        }

        formData.append('studentId', student.id);
        formData.append('studentName', student.name);
        formData.append('rollNumber', student.rollNumber);
        formData.append('email', student.email);

        try {
            const response = await fetch('http://localhost:8000/api/v1/college-portal/upload', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                alert('Files uploaded successfully!');
                setSelectedFiles(null);
                // Reset file input
                const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                if (fileInput) fileInput.value = '';
                // Refresh files list
                fetchFiles();
                if (onUploadSuccess) onUploadSuccess();
            } else {
                const error = await response.text();
                alert(`Upload failed: ${error}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (fileId: number, filename: string) => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/${fileId}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file');
        }
    };

    const handleDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/${fileId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                fetchFiles();
                if (onUploadSuccess) onUploadSuccess();
            } else {
                alert('Failed to delete file');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('Failed to delete file');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const statusColors = {
        INTERVIEW_SCHEDULED: 'bg-yellow-500 text-white',
        CLEARED_INTERVIEW: 'bg-blue-500 text-white',
        HIRED: 'bg-green-500 text-white'
    };

    const statusLabels = {
        INTERVIEW_SCHEDULED: 'Interview Scheduled',
        CLEARED_INTERVIEW: 'Cleared Interview',
        HIRED: 'Hired',
        REJECTED: 'Rejected'
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col border border-border animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-1">Student Details</h2>
                            <p className="text-indigo-100/80 text-sm">Complete profile and documentation</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-colors"
                        >
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                </div>

                {/* Content - Scrollable */}
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {/* Student Information */}
                    <div className="mb-8">
                        <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-3">
                            <span className="p-2 bg-primary/10 rounded-lg text-primary text-base">👤</span>
                            <span>Personal Information</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 p-6 rounded-2xl border border-border">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                                <p className="text-lg font-bold text-foreground mt-1">{student.name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Roll Number</label>
                                <p className="text-lg font-mono font-bold text-foreground mt-1">{student.rollNumber}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email</label>
                                <p className="text-lg font-medium text-foreground mt-1">{student.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                                <div className="mt-2">
                                    <span className={`inline-flex items-center px-4 py-1.5 text-xs font-bold rounded-full ${statusColors[student.status]}`}>
                                        <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse" />
                                        {statusLabels[student.status]}
                                    </span>
                                </div>
                            </div>
                            {student.status === 'HIRED' && (
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {student.hiringDate && (
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hiring Date</label>
                                            <p className="text-lg font-bold text-green-600 mt-1">
                                                {new Date(student.hiringDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                    {student.joiningDate && (
                                        <div>
                                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Joining Date</label>
                                            <p className="text-lg font-bold text-indigo-500 mt-1">
                                                {new Date(student.joiningDate).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                            {student.status !== 'HIRED' && student.roundDetails && (
                                <div className="md:col-span-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Round Details</label>
                                    <p className="text-base text-foreground bg-primary/5 p-4 rounded-xl border-l-4 border-primary mt-2">
                                        {student.roundDetails}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Files Section */}
                    {student.status === 'HIRED' && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4 text-foreground flex items-center gap-3">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary text-base">📤</span>
                                <span>Upload Files</span>
                            </h3>
                            <div className="bg-accent/5 p-6 rounded-2xl border border-border">
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {selectedFiles && selectedFiles.length > 0 && (
                                    <div className="mb-4 p-4 bg-background/50 rounded-xl border border-dashed border-border/50">
                                        <p className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            Target Files ({selectedFiles.length}):
                                        </p>
                                        <ul className="text-sm text-muted-foreground space-y-1 ml-3 font-medium">
                                            {Array.from(selectedFiles).map((file, index) => (
                                                <li key={index} className="flex items-center gap-2 truncate">
                                                    <span className="opacity-40">•</span> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl font-bold text-sm hover:bg-primary/20 transition-all shadow-sm"
                                    >
                                        <span>📁</span>
                                        <span>Choose Files</span>
                                    </button>
                                    {selectedFiles && selectedFiles.length > 0 && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-500 text-white rounded-xl font-bold text-sm hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? '⏳ Uploading...' : '✓ Start Upload'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Uploaded Files */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-foreground flex items-center justify-between">
                            <span className="flex items-center gap-3">
                                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500 text-base">📁</span>
                                Uploaded Documents
                            </span>
                            <span className="px-3 py-1 bg-accent/10 rounded-full text-xs font-bold text-muted-foreground border border-border/50">
                                {files.length} Files
                            </span>
                        </h3>

                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3 bg-accent/5 rounded-2xl border border-dashed border-border">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <span className="font-medium">Fetching documents...</span>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-12 bg-accent/5 rounded-2xl border border-dashed border-border flex flex-col items-center gap-3">
                                <span className="text-5xl opacity-20">📂</span>
                                <p className="text-muted-foreground font-medium">No files uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-5 bg-background border border-border rounded-2xl hover:bg-accent/5 hover:border-sidebar-border transition-all group"
                                    >
                                        <div className="flex-1 min-w-0 pr-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                                    <span className="text-xl">📄</span>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-foreground truncate text-sm">
                                                        {file.file_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                                                        ⚖️ {formatFileSize(file.file_size)} • 📅 {formatDate(file.uploaded_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-3 ml-auto flex-shrink-0">
                                            <button
                                                onClick={() => handleDownload(file.id, file.file_name)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center"
                                            >
                                                <span>⬇️</span>
                                                <span>Download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file.id)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold hover:bg-destructive/20 transition-all flex items-center"
                                            >
                                                <span>🗑️</span>
                                                <span>Delete</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Fixed at bottom */}
                <div className="border-t border-border p-6 bg-accent/5 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-sidebar-foreground/10 text-sidebar-foreground border border-sidebar-foreground/20 rounded-xl font-bold text-sm hover:bg-sidebar-foreground/20 transition-all shadow-sm"
                    >
                        Close Profile
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;