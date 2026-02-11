import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useUser } from '../../context/UserContext';

interface Candidate {
    id: number;
    full_name: string;
    email: string;
    university: string;
    address: string;
    status: string;
}


interface OfferLetterUploadProps {
    candidate: Candidate;
    onClose: () => void;
    onSuccess: () => void;
}

const OfferLetterUpload: React.FC<OfferLetterUploadProps> = ({ candidate, onClose, onSuccess }) => {
    const { user } = useUser();
    console.log("Candidate from upload conmponent : ", candidate)
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

            formData.append('userId', "4");
            formData.append('candidateName', candidate.full_name);
            formData.append('fileType',"AADHAR");
            formData.append('email', candidate.email);
            formData.append('university', candidate.university);
            formData.append('address', candidate.address);

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card text-card-foreground rounded-2xl shadow-2xl border border-border p-8 w-full max-w-[500px] max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
                <h3 className="text-2xl font-bold mb-2">Upload Offer Letters</h3>
                <p className="text-muted-foreground mb-6">
                    Candidate: <span className="font-semibold text-foreground">{candidate.full_name}</span>
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
                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all mb-6 ${isDragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-border hover:border-primary hover:bg-accent/5'
                        } ${uploading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <input {...getInputProps()} />
                    {isDragActive ? (
                        <p className="text-primary font-medium">Drop the PDFs here...</p>
                    ) : (
                        <div>
                            <p className="text-muted-foreground mb-2">Drag & drop PDF files here</p>
                            <p className="text-muted-foreground/60 text-sm">or click to select (max 10 files)</p>
                        </div>
                    )}
                </div>

                {/* Selected Files List */}
                {selectedFiles.length > 0 && !success && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                            <span className="w-1 h-1 bg-primary rounded-full" />
                            Selected Files ({selectedFiles.length})
                        </h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                            {selectedFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-accent/5 p-3 rounded-lg border border-border group transition-all hover:bg-accent/10">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        onClick={() => removeFile(index)}
                                        disabled={uploading}
                                        className="ml-2 text-muted-foreground hover:text-destructive transition-colors p-1"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={onClose}
                        disabled={uploading}
                        className="px-6 py-2.5 border border-border rounded-xl font-medium text-sm hover:bg-accent transition-colors disabled:opacity-50"
                    >
                        {success ? 'Close' : 'Cancel'}
                    </button>
                    {!success && selectedFiles.length > 0 && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                `Upload ${selectedFiles.length} File(s)`
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OfferLetterUpload;