import React, { useState, useEffect } from 'react';
import { Student } from '../../types/college';

interface UploadedFile {
    id: number;
    student_id: number;
    file_name: string;
    file_size: number;
    uploaded_at: string;
}

interface FilesListProps {
    student: Student;
    onClose: () => void;
    onUploadSuccess?: () => void;
}

const FilesList: React.FC<FilesListProps> = ({ student, onClose, onUploadSuccess }) => {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleting, setDeleting] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

    useEffect(() => {
        fetchFiles();
    }, [student.id]);

    const fetchFiles = async () => {
        try {
            setLoading(true);
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
            setError('');
        } catch (err: any) {
            console.error('Error fetching files:', err);
            setError(err.message || 'Failed to load files');
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
                // Refresh files list
                fetchFiles();
                if (onUploadSuccess) onUploadSuccess();
            } else {
                const errorText = await response.text();
                alert(`Upload failed: ${errorText}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload files');
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = (fileId: number) => {
        window.open(`http://localhost:8000/api/v1/college-portal/uploads/download/${fileId}`, '_blank');
    };

    const handleDelete = async (fileId: number) => {
        if (!confirm('Are you sure you want to delete this file?')) {
            return;
        }

        try {
            setDeleting(fileId);
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/${fileId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete file');
            }

            // Refresh the list
            await fetchFiles();
            if (onUploadSuccess) onUploadSuccess();
            setDeleting(null);
        } catch (err: any) {
            console.error('Error deleting file:', err);
            setError(err.message || 'Failed to delete file');
            setDeleting(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-border animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-2xl font-bold mb-1">Documents</h3>
                            <p className="text-indigo-100">{student.name} - {student.rollNumber}</p>
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
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl mb-6 flex items-center gap-3">
                            <span className="text-xl">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Upload Section */}
                    {student.status === 'HIRED' && (
                        <div className="mb-8 bg-accent/5 p-6 rounded-2xl border border-border">
                            <h4 className="font-bold text-foreground mb-4 flex items-center gap-3 text-lg">
                                <span className="p-2 bg-primary/10 rounded-lg text-primary">📤</span>
                                <span>Add Documents</span>
                            </h4>
                            <input
                                id="files-upload-input"
                                type="file"
                                multiple
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            {selectedFiles && selectedFiles.length > 0 && (
                                <div className="mb-4 p-4 bg-background/50 rounded-xl border border-border/50">
                                    <p className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        Files to upload ({selectedFiles.length}):
                                    </p>
                                    <ul className="text-sm text-muted-foreground space-y-1 ml-3">
                                        {Array.from(selectedFiles).map((file, index) => (
                                            <li key={index} className="flex items-center gap-2 truncate">
                                                <span className="opacity-50">•</span> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => document.getElementById('files-upload-input')?.click()}
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
                    )}

                    {/* Files List */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4 flex items-center justify-between">
                            <span className="flex items-center gap-3 text-lg">
                                <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">📁</span>
                                Uploaded Documents
                            </span>
                            <span className="px-3 py-1 bg-accent/10 rounded-full text-xs font-semibold">
                                {files.length} Files
                            </span>
                        </h4>

                        {loading ? (
                            <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                <span>Loading files...</span>
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
                                        className="border border-border rounded-2xl p-4 bg-background group transition-all hover:bg-accent/5 hover:border-sidebar-border"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 pr-4">
                                                <h4 className="font-bold text-foreground truncate flex items-center gap-3">
                                                    <span className="p-2 bg-red-500/10 rounded-lg text-red-500">📄</span>
                                                    <span className="truncate">{file.file_name}</span>
                                                </h4>
                                                <div className="flex gap-4 mt-2 text-xs text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1">⚖️ {formatSize(file.file_size)}</span>
                                                    <span className="flex items-center gap-1">📅 {formatDate(file.uploaded_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-3 ml-auto flex-shrink-0">
                                                <button
                                                    onClick={() => handleDownload(file.id)}
                                                    className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary/20 transition-all flex items-center gap-2"
                                                >
                                                    <span>⬇️</span> Download
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    disabled={deleting === file.id}
                                                    className="px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs font-bold hover:bg-destructive/20 transition-all disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {deleting === file.id ? <span className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" /> : '🗑️'}
                                                    {deleting === file.id ? 'Deleting...' : 'Delete'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-border p-6 bg-accent/5 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-8 py-2.5 bg-sidebar-foreground/10 text-sidebar-foreground border border-sidebar-foreground/20 rounded-xl font-bold text-sm hover:bg-sidebar-foreground/20 transition-all shadow-sm"
                    >
                        Close Window
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FilesList;