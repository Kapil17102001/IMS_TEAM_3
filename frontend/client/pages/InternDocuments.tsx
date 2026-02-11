import { useState, useEffect, useCallback } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUser } from "../context/UserContext";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from 'react-dropzone';
import {
    FileText,
    CheckCircle2,
    Clock,
    FileUp,
    CreditCard,
    GraduationCap,
    ExternalLink,
    AlertCircle,
    MessageSquare,
    Eye
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import ResumeViewer from "../components/candidate-detail/ResumeViewer";

interface FileTypeConfig {
    key: string;
    label: string;
    icon: any;
    color: string;
}

const FILE_TYPES: any[] = [
    { key: "AADHAR", backendKey: "aadhaar", label: "Aadhar Card", icon: CreditCard, color: "blue" },
    { key: "PAN_CARD", backendKey: "pan_card", label: "PAN Card", icon: CreditCard, color: "purple" },
    { key: "MATRICULATION_CERTIFICATE", backendKey: "marticulation_certificate", label: "Matriculation (10th)", icon: GraduationCap, color: "green" },
    { key: "INTERMEDIATE_CERTIFICATE", backendKey: "intermediate_certificate", label: "Intermediate (12th)", icon: GraduationCap, color: "orange" },
    { key: "DEGREE_CERTIFICATE", backendKey: "degree_certificate", label: "Degree Certificate", icon: FileText, color: "pink" },
];

export default function InternDocuments() {
    const { user } = useUser();
    const { toast } = useToast();
    const [uploads, setUploads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);

    const handleViewFile = (fileName: string) => {
        setViewerUrl(`http://localhost:8000/documents/${fileName}`);
        setIsViewerOpen(true);
    };

    const fetchUploads = useCallback(async () => {
        if (!user) return;
        try {
            const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/user/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setUploads(data);
            }
        } catch (error) {
            console.error("Error fetching uploads:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchUploads();
    }, [fetchUploads]);

    const handleUpload = async (file: File, fileType: string) => {
        if (!user) return;

        setUploadingStatus(prev => ({ ...prev, [fileType]: true }));
        const formData = new FormData();
        formData.append('files', file);
        formData.append('userId', user.id);
        formData.append('fileType', fileType);

        try {
            const response = await fetch('http://localhost:8000/api/v1/college-portal/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error("Upload failed");

            toast({
                title: "Success",
                description: `${fileType.split('_').join(' ')} uploaded successfully`,
            });
            fetchUploads();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to upload file",
                variant: "destructive"
            });
        } finally {
            setUploadingStatus(prev => ({ ...prev, [fileType]: false }));
        }
    };

    return (
        <MainLayout>
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 p-4">
                <div className="flex flex-col gap-3">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                        Document Dashboard
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Keep your professional profile up to date by uploading clear copies of your required documents. Track verification status in real-time.
                    </p>
                </div>

                {loading ? (
                    <div className="flex flex-col justify-center items-center h-64 gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-muted-foreground animate-pulse">Retrieving your documents...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {FILE_TYPES.map((type) => {
                            const existingUpload = uploads.find(u => {
                                const uType = (u.file_type || u.fileType || "").toString();
                                return uType === type.key || uType === type.backendKey;
                            });

                            return (
                                <DocumentCard
                                    key={type.key}
                                    type={type}
                                    existingUpload={existingUpload}
                                    isUploading={uploadingStatus[type.key]}
                                    onUpload={(file: File) => handleUpload(file, type.key)}
                                    onView={handleViewFile}
                                />
                            );
                        })}
                    </div>
                )}
            </div>

            <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
                <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="text-primary" />
                            Document Preview
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 mt-4 overflow-hidden rounded-xl border border-border">
                        {viewerUrl && <ResumeViewer resumeUrl={viewerUrl} />}
                    </div>
                </DialogContent>
            </Dialog>
        </MainLayout>
    );
}

function DocumentCard({ type, existingUpload, isUploading, onUpload, onView }: any) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onUpload(acceptedFiles[0]);
        }
    }, [onUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/pdf': ['.pdf'] },
        maxFiles: 1,
        disabled: isUploading
    });

    const Icon = type.icon;
    const colors: Record<string, string> = {
        blue: "from-blue-500/10 to-blue-600/5 group-hover:from-blue-500/20 group-hover:to-blue-600/10 border-blue-500/20 text-blue-500",
        purple: "from-purple-500/10 to-purple-600/5 group-hover:from-purple-500/20 group-hover:to-purple-600/10 border-purple-500/20 text-purple-500",
        green: "from-green-500/10 to-green-600/5 group-hover:from-green-500/20 group-hover:to-green-600/10 border-green-500/20 text-green-500",
        orange: "from-orange-500/10 to-orange-600/5 group-hover:from-orange-500/20 group-hover:to-orange-600/10 border-orange-500/20 text-orange-500",
        pink: "from-pink-500/10 to-pink-600/5 group-hover:from-pink-500/20 group-hover:to-pink-600/10 border-pink-500/20 text-pink-500",
    };

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'verified':
                return "bg-green-500/10 text-green-600 border-green-500/20";
            case 'rejected':
                return "bg-red-500/10 text-red-600 border-red-500/20";
            default:
                return "bg-amber-500/10 text-amber-600 border-amber-500/20";
        }
    };

    const handleView = () => {
        if (fileName) {
            onView(fileName);
        }
    };

    // Flexible helper to handle both snake_case (backend schema) and camelCase (manual dict)
    const fileName = existingUpload?.file_name || existingUpload?.fileName;
    const uploadedAt = existingUpload?.uploaded_at || existingUpload?.uploadedAt;
    const status = existingUpload?.status;
    const feedback = existingUpload?.feedback;

    return (
        <Card className={`relative flex flex-col h-full overflow-hidden group border-2 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 ${existingUpload ? 'border-primary/10' : 'border-border'}`}>
            {/* Background Decorative Icon */}
            <div className={`absolute -top-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all transform group-hover:-translate-x-4 group-hover:translate-y-4 group-hover:scale-125 duration-700 pointer-events-none`}>
                <Icon size={140} />
            </div>

            <div className="p-6 flex flex-col flex-1 space-y-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl bg-gradient-to-br transition-all duration-300 ${colors[type.color]}`}>
                            <Icon size={28} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl text-foreground/90">{type.label}</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Required Document</p>
                        </div>
                    </div>
                    {existingUpload && (
                        <Badge variant="outline" className={`px-3 py-1 capitalize font-semibold shadow-sm ${getStatusStyles(status)}`}>
                            {status}
                        </Badge>
                    )}
                </div>

                {existingUpload ? (
                    <div className="flex flex-col flex-1 gap-5">
                        <div className="flex flex-col gap-2 p-4 bg-muted/30 rounded-2xl border border-border/50 group-hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-2 text-sm font-semibold truncate">
                                <FileText size={16} className="text-primary" />
                                <span className="truncate">{fileName}</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={10} />
                                Uploaded on {uploadedAt ? new Date(uploadedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>
                        </div>

                        {feedback && (
                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl animate-in slide-in-from-bottom-2 duration-500">
                                <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-widest mb-1">
                                    <MessageSquare size={14} />
                                    Reviewer Feedback
                                </div>
                                <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                                    "{feedback}"
                                </p>
                            </div>
                        )}

                        {status === 'rejected' && (
                            <div className="flex items-center gap-2 text-destructive text-sm font-bold bg-destructive/10 p-3 rounded-xl">
                                <AlertCircle size={18} />
                                Document rejected. Please re-upload.
                            </div>
                        )}

                        {status?.toLowerCase() !== 'verified' && (
                            <div className="grid grid-cols-2 gap-3 mt-auto pt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-xl border-2 hover:bg-muted font-bold transition-all"
                                    onClick={handleView}
                                >
                                    <Eye size={16} className="mr-2" />
                                    View File
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    {...getRootProps()}
                                    className="rounded-xl font-bold hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                                >
                                    <input {...getInputProps()} />
                                    <FileUp size={16} className="mr-2" />
                                    Re-upload
                                </Button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div
                        {...getRootProps()}
                        className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 cursor-pointer group/upload ${isDragActive
                            ? "border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/5"
                            : "border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5"
                            }`}
                    >
                        <input {...getInputProps()} />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                                    <Clock className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                                </div>
                                <p className="text-sm font-bold animate-pulse text-primary">Uploading PDF...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="p-5 rounded-full bg-primary/5 text-primary group-hover/upload:scale-110 group-hover/upload:bg-primary group-hover/upload:text-white transition-all duration-500">
                                    <FileUp size={40} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-foreground/80">Click or drag to upload</p>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">PDF Only • Max 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Status Footer Decoration */}
            {existingUpload && (
                <div className={`h-1.5 w-full bg-gradient-to-r ${status === 'verified' ? 'from-green-500 to-emerald-400' :
                    status === 'rejected' ? 'from-red-500 to-orange-400' :
                        'from-amber-500 to-yellow-400'
                    }`} />
            )}
        </Card>
    );
}
