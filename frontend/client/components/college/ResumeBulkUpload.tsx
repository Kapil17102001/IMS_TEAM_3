import React, { useState, useCallback, useContext, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UserContext } from '@/context/UserContext';
import { FileText, Trash2, Upload, X, Loader2, Download } from 'lucide-react';

const ResumeBulkUpload: React.FC = () => {
    const { user } = useContext(UserContext); // Access user context to get college_id
    const collegeId = user?.id; // Extract college_id from user context

    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [uploadCount, setUploadCount] = useState(0);
    const [totalResumes, setTotalResumes] = useState(0);
    const [uploadedResumes, setUploadedResumes] = useState<any[]>([]);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const fetchTotalResumes = useCallback(async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/resumes/${collegeId}`);
            const data = await response.json();
            setTotalResumes(data.length);
            setUploadedResumes(data);
        } catch (err) {
            console.error('Failed to fetch total resumes:', err);
        }
    }, [collegeId]);

    useEffect(() => {
        fetchTotalResumes();
    }, [fetchTotalResumes]);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;

        // Filter out non-PDF if any (though dropzone handles it)
        const pdfFiles = acceptedFiles.filter(file => file.type === 'application/pdf');

        if (selectedFiles.length + pdfFiles.length > 100) {
            setError('You can only upload up to 100 resumes at a time.');
            return;
        }

        setSelectedFiles(prev => [...prev, ...pdfFiles]);
        setError('');
        setSuccess(false);
    }, [selectedFiles]);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (!collegeId) {
            setError('College ID is missing. Please log in again.');
            return;
        }

        if (selectedFiles.length === 0) {
            setError('Please select at least one resume.');
            return;
        }

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            selectedFiles.forEach(file => {
                formData.append('resumes', file);
            });

            const response = await fetch(`http://localhost:8000/api/v1/college-portal/resumes/upload/${collegeId}`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || 'Upload failed');
            }

            await response.json();
            setUploadCount(selectedFiles.length);
            setSuccess(true);
            setSelectedFiles([]);
            setUploading(false);
            fetchTotalResumes();
        } catch (err: any) {
            setError(err.message || 'Upload failed. Make sure backend is running.');
            setUploading(false);
        }
    };

    const handleDeleteResume = async (resumeId: number) => {
        if (!confirm('Are you sure you want to delete this resume?')) {
            return;
        }

        setDeletingId(resumeId);
        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/resumes/${resumeId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete resume');
            }

            // Refresh the list
            fetchTotalResumes();
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to delete resume');
        } finally {
            setDeletingId(null);
        }
    };

    const handleDownloadResume = (resumeId: number, fileName: string) => {
        // Create a hidden anchor tag to trigger download via the new endpoint
        const link = document.createElement('a');
        link.href = `http://localhost:8000/api/v1/college-portal/resumes/download/${resumeId}`;
        link.download = fileName; // Hint to the browser for the filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 100,
        disabled: uploading
    });

    return (
        <div className="bg-card shadow-xl rounded-xl overflow-hidden mb-8 border border-border">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <FileText className="w-6 h-6" /> Bulk Resume Upload
                    </h2>
                    <p className="text-blue-100 text-sm">Upload up to 100 student resumes at once</p>
                </div>
                <div className="flex gap-4">
                    {totalResumes > 0 && (
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 border border-white/10">
                            <span>📚</span> Total Resumes: {totalResumes}
                        </div>
                    )}
                    {selectedFiles.length > 0 && (
                        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2 border border-white/10">
                            {selectedFiles.length} Selected
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 bg-red-500/10 border-l-4 border-red-500 p-4 rounded text-red-400 flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-500/10 border-l-4 border-green-500 p-4 rounded text-green-400 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <span>Successfully uploaded {uploadCount} resumes!</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[250px] ${isDragActive
                            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
                            : 'border-border hover:border-blue-400 hover:bg-accent/5'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 text-blue-400 animate-pulse">
                            <Upload className="w-10 h-10" />
                        </div>
                        <h4 className="text-lg font-semibold text-foreground mb-2">
                            {isDragActive ? 'Drop them now!' : 'Drag & drop student resumes'}
                        </h4>
                        <p className="text-muted-foreground">Only PDF files are supported. Max 100 files.</p>
                        <div className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-semibold transition-colors inline-block">
                            Select Files
                        </div>
                    </div>

                    <div className="flex flex-col h-full border border-border rounded-2xl bg-card">
                        <div className="p-4 border-b border-border bg-accent/5 rounded-t-2xl flex justify-between items-center">
                            <span className="font-semibold text-foreground">Selected Resumes</span>
                            {selectedFiles.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }}
                                    className="text-xs text-red-400 hover:text-red-300 font-medium uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 max-h-[200px] space-y-2 custom-scrollbar">
                            {selectedFiles.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-500 text-sm italic py-10">
                                    No files selected yet
                                </div>
                            ) : (
                                selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-accent/5 p-3 rounded-lg border border-border group transition-all hover:bg-accent/10">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="text-gray-400 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-accent/5 rounded-b-2xl border-t border-border">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || selectedFiles.length === 0}
                                className={`w-full py-3 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${uploading || selectedFiles.length === 0
                                    ? 'bg-white/10 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                                    }`}
                            >
                                {uploading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    `Upload ${selectedFiles.length} Resumes`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uploaded Resumes List */}
            {
                uploadedResumes.length > 0 && (
                    <div className="px-6 pb-6">
                        <div className="border-t border-border pt-6">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                                Uploaded Resumes ({uploadedResumes.length})
                            </h3>
                            <div className="bg-card rounded-lg border border-border overflow-hidden">
                                <div className="overflow-x-auto max-h-96 custom-scrollbar">
                                    <table className="w-full">
                                        <thead className="bg-accent/5 sticky top-0">
                                            <tr>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">#</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">File Name</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Size</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded At</th>
                                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {uploadedResumes.map((resume, index) => (
                                                <tr key={resume.id} className="hover:bg-accent/5 transition-colors">
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">{index + 1}</td>
                                                    <td className="px-4 py-3 text-sm font-medium text-foreground">{resume.file_name}</td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {(resume.file_size / 1024).toFixed(1)} KB
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-muted-foreground">
                                                        {new Date(resume.uploaded_at).toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-3">
                                                            <button
                                                                onClick={() => handleDownloadResume(resume.id, resume.file_name)}
                                                                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                                Download
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteResume(resume.id)}
                                                                disabled={deletingId === resume.id}
                                                                className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
                                                            >
                                                                {deletingId === resume.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                                {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default ResumeBulkUpload;