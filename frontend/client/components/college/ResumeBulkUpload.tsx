import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useContext } from 'react';
import { UserContext } from '@/context/UserContext';

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

    React.useEffect(() => {
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

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 100,
        disabled: uploading
    });

    return (
        <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8 card-3d border border-indigo-50">
            <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-2xl">📄</span> Bulk Resume Upload
                    </h2>
                    <p className="text-indigo-100 text-sm">Upload up to 100 student resumes at once</p>
                </div>
                <div className="flex gap-4">
                    {totalResumes > 0 && (
                        <div className="bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2">
                            📚 Total Resumes: {totalResumes}
                        </div>
                    )}
                    {selectedFiles.length > 0 && (
                        <div className="bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-lg text-white font-semibold flex items-center gap-2">
                            {selectedFiles.length} Selected
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6">
                {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded text-red-700 flex items-center gap-3">
                        <span className="text-xl">⚠️</span>
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4 rounded text-green-700 flex items-center gap-3">
                        <span className="text-xl">✅</span>
                        <span>Successfully uploaded {uploadCount} resumes!</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div
                        {...getRootProps()}
                        className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[250px] ${isDragActive
                            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
                            : 'border-gray-200 hover:border-indigo-400 hover:bg-gray-50'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <input {...getInputProps()} />
                        <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4 text-indigo-600 text-3xl icon-pulse">
                            📤
                        </div>
                        <h4 className="text-lg font-semibold text-gray-700 mb-2">
                            {isDragActive ? 'Drop them now!' : 'Drag & drop student resumes'}
                        </h4>
                        <p className="text-gray-500">Only PDF files are supported. Max 100 files.</p>
                        <div className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-full font-semibold btn-3d inline-block">
                            Select Files
                        </div>
                    </div>

                    <div className="flex flex-col h-full border border-gray-100 rounded-2xl bg-gray-50">
                        <div className="p-4 border-b border-gray-200 bg-white rounded-t-2xl flex justify-between items-center">
                            <span className="font-semibold text-gray-700">Selected Resumes</span>
                            {selectedFiles.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setSelectedFiles([]); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium uppercase tracking-wider"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 max-h-[200px] space-y-2">
                            {selectedFiles.length === 0 ? (
                                <div className="h-full flex items-center justify-center text-gray-400 text-sm italic py-10">
                                    No files selected yet
                                </div>
                            ) : (
                                selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 group transition-all hover:border-indigo-200">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            <span className="text-xl">📄</span>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                                                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 bg-white rounded-b-2xl border-t border-gray-200">
                            <button
                                onClick={handleUpload}
                                disabled={uploading || selectedFiles.length === 0}
                                className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${uploading || selectedFiles.length === 0
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200 btn-3d'
                                    }`}
                            >
                                {uploading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </span>
                                ) : (
                                    `Upload ${selectedFiles.length} Resumes`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Uploaded Resumes List */}
            {uploadedResumes.length > 0 && (
                <div className="px-6 pb-6">
                    <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                            <span>📚</span> Uploaded Resumes ({uploadedResumes.length})
                        </h3>
                        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <div className="overflow-x-auto max-h-96">
                                <table className="w-full">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">File Name</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Size</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Uploaded At</th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {uploadedResumes.map((resume, index) => (
                                            <tr key={resume.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                                <td className="px-4 py-3 text-sm font-medium text-gray-900">{resume.file_name}</td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {(resume.file_size / 1024).toFixed(1)} KB
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {new Date(resume.uploaded_at).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <button
                                                        onClick={() => handleDeleteResume(resume.id)}
                                                        disabled={deletingId === resume.id}
                                                        className="text-red-600 hover:text-red-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deletingId === resume.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeBulkUpload;