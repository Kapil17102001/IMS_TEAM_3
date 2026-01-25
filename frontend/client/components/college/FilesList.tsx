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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
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
                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {/* Upload Section */}
                    {student.status === 'HIRED' && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <span>📤</span>
                                <span>Add More Documents</span>
                            </h4>
                            <input
                                id="files-upload-input"
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
                                            <li key={index}>{file.name} ({formatSize(file.size)})</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => document.getElementById('files-upload-input')?.click()}
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
                    )}

                    {/* Files List */}
                    <div>
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                            <span>📁</span>
                            <span>Uploaded Documents ({files.length})</span>
                        </h4>

                        {loading ? (
                            <div className="text-center py-8 text-gray-600">Loading files...</div>
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
                                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 truncate flex items-center gap-2">
                                                    <span>📄</span>
                                                    <span>{file.file_name}</span>
                                                </h4>
                                                <div className="flex gap-4 mt-1 text-sm text-gray-500">
                                                    <span>{formatSize(file.file_size)}</span>
                                                    <span>{formatDate(file.uploaded_at)}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 ml-4">
                                                <button
                                                    onClick={() => handleDownload(file.id)}
                                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium btn-3d"
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    disabled={deleting === file.id}
                                                    className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium btn-3d disabled:opacity-50"
                                                >
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

export default FilesList;