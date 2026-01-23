import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Student } from '../../types/college';

interface OfferLetterUploadProps {
    student: Student;
    onClose: () => void;
    onSuccess: () => void;
}

const OfferLetterUpload: React.FC<OfferLetterUploadProps> = ({ student, onClose, onSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        console.log('onDrop called with files:', acceptedFiles);

        if (acceptedFiles.length === 0) {
            console.log('No files accepted');
            setError('Please select PDF files');
            return;
        }

        // Add to selected files list
        setSelectedFiles(prev => [...prev, ...acceptedFiles]);
        setError('');
    }, []);

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) {
            setError('Please select at least one file');
            return;
        }

        setUploading(true);
        setError('');

        try {
            // Create form data
            const formData = new FormData();

            // Append all files
            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            formData.append('studentId', student.id);
            formData.append('studentName', student.name);
            formData.append('rollNumber', student.rollNumber);
            formData.append('email', student.email);

            console.log(`Uploading ${selectedFiles.length} file(s) to backend...`);

            // Upload to backend
            const response = await fetch('http://localhost:8000/api/v1/college-portal/upload', {
                method: 'POST',
                body: formData
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
                throw new Error(errorData.error || 'Upload failed');
            }

            const data = await response.json();
            console.log('Upload successful:', data);

            setUploading(false);
            setSuccess(true);

            // Close modal and refresh after 1.5 seconds
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 1500);
        } catch (err: any) {
            console.error('Upload error:', err);
            setError(err.message || 'Upload failed. Make sure backend is running on port 3001');
            setUploading(false);
        }
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 10,
        disabled: uploading || success
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[500px] max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">Upload Offer Letters</h3>
                <p className="text-gray-600 mb-4">
                    Student: <span className="font-semibold">{student.name}</span>
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        ✅ {selectedFiles.length} file(s) uploaded successfully!
                    </div>
                )}

                <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors mb-4 ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                        } ${uploading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-blue-600">Drop the PDFs here...</p>
                    ) : (
                        <div>
                            <p className="text-gray-600 mb-2">Drag & drop PDF files here</p>
                            <p className="text-gray-400 text-sm">or click to select (max 10 files)</p>
                        </div>
                    )}
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && !success && (
                    <div className="mb-4">
                        <h4 className="font-semibold mb-2">Selected Files ({selectedFiles.length}):</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                        className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                    >
                        {success ? 'Close' : 'Cancel'}
                    </button>
                    {!success && selectedFiles.length > 0 && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                        >
                            {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfferLetterUpload;
