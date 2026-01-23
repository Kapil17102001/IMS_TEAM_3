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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl flex flex-col">
                {/* Header */}
                <div className="bg-indigo-600 text-white p-6 flex-shrink-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">Student Details</h2>
                            <p className="text-indigo-100">Complete information and uploaded files</p>
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
                <div className="p-6 overflow-y-auto flex-1">
                    {/* Student Information */}
                    <div className="mb-6">
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <span>👤</span>
                            <span>Personal Information</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Name</label>
                                <p className="text-lg font-semibold text-gray-900">{student.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Roll Number</label>
                                <p className="text-lg font-mono font-semibold text-gray-900">{student.rollNumber}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="text-lg text-gray-900">{student.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Status</label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold badge-3d ${statusColors[student.status]}`}>
                                        {statusLabels[student.status]}
                                    </span>
                                </div>
                            </div>
                            {student.status === 'HIRED' && (
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {student.hiringDate && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Hiring Date</label>
                                            <p className="text-lg font-semibold text-green-700">
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
                                            <label className="text-sm font-medium text-gray-600">Joining Date</label>
                                            <p className="text-lg font-semibold text-indigo-700">
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
                                    <label className="text-sm font-medium text-gray-600">Round Details</label>
                                    <p className="text-base text-gray-900 bg-blue-50 p-3 rounded border-l-4 border-blue-500">
                                        {student.roundDetails}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upload Files Section */}
                    {student.status === 'HIRED' && (
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                                <span>📤</span>
                                <span>Upload Files</span>
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <input
                                    id="file-upload"
                                    type="file"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                {selectedFiles && selectedFiles.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-sm text-gray-600 mb-2">Selected files:</p>
                                        <ul className="text-sm text-gray-700 list-disc list-inside">
                                            {Array.from(selectedFiles).map((file, index) => (
                                                <li key={index}>{file.name} ({formatFileSize(file.size)})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium btn-3d"
                                    >
                                        <span>📁</span>
                                        <span>Choose Files</span>
                                    </button>
                                    {selectedFiles && selectedFiles.length > 0 && (
                                        <button
                                            onClick={handleUpload}
                                            disabled={uploading}
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium btn-3d disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {uploading ? '⏳ Uploading...' : '✓ Upload'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Uploaded Files */}
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <span>📁</span>
                            <span>Uploaded Files ({files.length})</span>
                        </h3>

                        {loading ? (
                            <div className="text-center py-8 text-gray-500">
                                Loading files...
                            </div>
                        ) : files.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <span className="text-4xl mb-2 block">📂</span>
                                <p className="text-gray-500">No files uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {files.map((file) => (
                                    <div
                                        key={file.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">📄</span>
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 truncate">
                                                        {file.file_name}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {formatFileSize(file.file_size)} • {formatDate(file.uploaded_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => handleDownload(file.id, file.file_name)}
                                                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium btn-3d"
                                            >
                                                <span>⬇️</span>
                                                <span>Download</span>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(file.id)}
                                                className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium btn-3d"
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
                <div className="border-t border-gray-200 p-4 bg-gray-50 flex justify-end flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium btn-3d"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StudentDetail;
