import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2, User, Mail, GraduationCap, Building2, Calendar, DollarSign, MapPin, CheckCircle2, XCircle, Eye, FileText, ExternalLink, MessageSquare, IndianRupee } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ResumeViewer from "../components/candidate-detail/ResumeViewer";

interface Intern {
  id: number;
  full_name: string;
  email: string;
  university: string;
  department: string;
  start_date: string;
  end_date: string;
  status: string;
  address: string;
  job_position: string;
  salary: string;
  gender: string;
}

export default function Interns() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | "all">("all");

  const [pendingCount, setPendingCount] = useState(0);

  // Modal State
  const [selectedIntern, setSelectedIntern] = useState<Intern | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [internFiles, setInternFiles] = useState<any[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [isUpdatingFile, setIsUpdatingFile] = useState<number | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);
  const [rejectingFileId, setRejectingFileId] = useState<number | null>(null);
  const [rejectionFeedback, setRejectionFeedback] = useState("");

  const fetchInternFiles = async (internId: number) => {
    setIsLoadingFiles(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/intern/${internId}`);
      if (response.ok) {
        const data = await response.json();
        setInternFiles(data);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleRowClick = (intern: Intern) => {
    setSelectedIntern(intern);
    setIsModalOpen(true);
    fetchInternFiles(intern.id);
  };

  const handleUpdateFileStatus = async (fileId: number, status: string, feedback?: string) => {
    setIsUpdatingFile(fileId);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/college-portal/uploads/${fileId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, feedback: feedback || "" }),
      });

      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Document marked as ${status}`,
        });
        setRejectingFileId(null);
        setRejectionFeedback("");
        if (selectedIntern) fetchInternFiles(selectedIntern.id);
        fetchInterns();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingFile(null);
    }
  };

  const fetchInterns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch Interns
      const response = await fetch("http://localhost:8000/api/v1/interns/?skip=0&limit=100", {
        headers: { "Accept": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch interns");
      const data = await response.json();
      setInterns(data);

      // Fetch Hired Candidates to see who is pending
      const hiredResponse = await fetch("http://localhost:8000/api/v1/candidate/status/HIRED?skip=0&limit=100", {
        headers: { "Accept": "application/json" },
      });
      if (hiredResponse.ok) {
        const hiredData = await hiredResponse.json();
        const pending = hiredData.filter((c: any) =>
          !data.some((i: any) => i.email.toLowerCase() === c.email.toLowerCase())
        );
        setPendingCount(pending.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch data";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterns();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/interns/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete intern");
      }

      toast({
        title: "Success",
        description: `${name} has been deleted successfully`,
        variant: "success",
      });

      // Refresh the list
      fetchInterns();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete intern";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = (id: number) => {
    // TODO: Implement update functionality
    toast({
      title: "Info",
      description: "Update functionality coming soon",
      variant: "info",
    });
  };

  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    switch (statusLower) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "onboarding":
        return <Badge className="bg-blue-500 text-white">Onboarding</Badge>;
      case "completed":
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case "pending":
        return <Badge className="bg-red-500 text-white">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGenderStats = () => {
    const male = interns.filter(i => i.gender?.toLowerCase() === "male").length;
    const female = interns.filter(i => i.gender?.toLowerCase() === "female").length;
    return { male, female };
  };

  const stats = getGenderStats();

  const filteredInterns = interns.filter((intern) => {
    const matchesSearch =
      intern.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || intern.status?.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Intern Management</h1>
          <p className="text-muted-foreground">
            View and manage all interns in the system
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 mb-8">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or email..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          {/* Status Filter Chips */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
            >
              All Interns ({interns.length})
            </Button>
            {["active", "onboarding", "completed", "terminated"].map((status) => {
              const count = interns.filter(
                (i) => i.status?.toLowerCase() === status
              ).length;
              return (
                <Button
                  key={status}
                  variant={statusFilter === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                </Button>
              );
            })}
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Interns</p>
            <p className="text-3xl font-bold mt-2">{interns.length}</p>
          </Card>
          <Card className="p-6 relative overflow-hidden bg-amber-500/5 border-amber-500/20">
            <p className="text-sm font-medium text-muted-foreground">Pending Onboarding</p>
            <p className="text-3xl font-bold mt-2 text-amber-500">{pendingCount}</p>
            {pendingCount > 0 && (
              <Button
                variant="link"
                className="p-0 h-auto text-xs text-amber-600 mt-2 hover:text-amber-700"
                onClick={() => navigate("/onboarding")}
              >
                Go to Onboarding →
              </Button>
            )}
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Male</p>
            <p className="text-3xl font-bold mt-2 text-blue-500">{stats.male}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Female</p>
            <p className="text-3xl font-bold mt-2 text-pink-500">{stats.female}</p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading interns...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button onClick={fetchInterns} variant="outline">
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Full Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        University
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Department
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                        Gender
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                        Status
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInterns.length > 0 ? (
                      filteredInterns.map((intern) => (
                        <tr
                          key={intern.id}
                          className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                          onClick={() => handleRowClick(intern)}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {intern.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{intern.full_name}</p>
                                <p className="text-xs text-muted-foreground">{intern.job_position}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{intern.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{intern.university}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{intern.department}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="capitalize text-sm text-foreground">{intern.gender || "—"}</span>
                          </td>
                          <td className="px-6 py-4 text-center">{getStatusBadge(intern.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUpdate(intern.id);
                                }}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(intern.id, intern.full_name);
                                }}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                          No interns found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/50 text-sm text-muted-foreground">
                Showing {filteredInterns.length} intern{filteredInterns.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </Card>

        {/* Intern Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="p-6 pb-0">
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                <User className="text-primary" />
                Intern Profile
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {selectedIntern && (
                <>
                  {/* Header Section */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-muted/30 p-6 rounded-3xl border border-border/50">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary shadow-inner">
                        {selectedIntern.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold tracking-tight">{selectedIntern.full_name}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="font-semibold">
                            {selectedIntern.job_position}
                          </Badge>
                          {getStatusBadge(selectedIntern.status)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact Information</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedIntern.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedIntern.address || "No address provided"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Academic & Work</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <GraduationCap className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedIntern.university}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <Building2 className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedIntern.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <IndianRupee className="h-4 w-4 text-primary" />
                          <span className="font-medium">{selectedIntern.salary}/month</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Duration</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">
                            {new Date(selectedIntern.start_date).toLocaleDateString()} - {new Date(selectedIntern.end_date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-6 pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="text-primary" />
                        Verification Documents
                      </h3>
                      <Badge variant="outline" className="font-bold">
                        {internFiles.length}/5 Uploaded
                      </Badge>
                    </div>

                    {isLoadingFiles ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : internFiles.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {internFiles.map((file) => (
                          <Card key={file.id} className="p-4 flex flex-col gap-4 border-2 hover:border-primary/20 transition-all group">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                                  <FileText className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm uppercase tracking-tight">
                                    {file.file_type?.replace(/_/g, " ") || "Document"}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                    {file.file_name}
                                  </p>
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`font-bold text-[10px] uppercase tracking-widest ${file.status === 'verified' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                                  file.status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                                    'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                  }`}
                              >
                                {file.status}
                              </Badge>
                            </div>

                            {file.feedback && rejectingFileId !== file.id && (
                              <div className="text-xs bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 text-amber-700 flex gap-2 italic">
                                <MessageSquare className="h-3 w-3 shrink-0" />
                                "{file.feedback}"
                              </div>
                            )}

                            {rejectingFileId === file.id ? (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Input
                                  placeholder="Reason for rejection..."
                                  value={rejectionFeedback}
                                  onChange={(e) => setRejectionFeedback(e.target.value)}
                                  className="h-8 text-xs border-destructive/30 focus-visible:ring-destructive"
                                  autoFocus
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="flex-1 h-7 text-[10px] font-bold"
                                    onClick={() => handleUpdateFileStatus(file.id, 'rejected', rejectionFeedback)}
                                    disabled={isUpdatingFile === file.id}
                                  >
                                    Confirm Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-[10px] font-bold"
                                    onClick={() => {
                                      setRejectingFileId(null);
                                      setRejectionFeedback("");
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2 mt-auto">
                                <Button
                                  size="sm"
                                  className="flex-1 font-bold h-8"
                                  onClick={() => setViewerUrl(`http://localhost:8000/documents/${file.file_name}`)}
                                >
                                  <Eye className="h-3 w-3 mr-2" />
                                  View
                                </Button>
                                {file.status !== 'verified' && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700 font-bold h-8"
                                      disabled={isUpdatingFile === file.id}
                                      onClick={() => handleUpdateFileStatus(file.id, 'verified')}
                                    >
                                      {isUpdatingFile === file.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3 mr-2" />}
                                      Verify
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 font-bold h-8"
                                      disabled={isUpdatingFile === file.id}
                                      onClick={() => {
                                        setRejectingFileId(file.id);
                                        setRejectionFeedback(file.feedback || "");
                                      }}
                                    >
                                      <XCircle className="h-3 w-3 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 bg-muted/20 rounded-3xl border border-dashed">
                        <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No documents uploaded yet.</p>
                      </div>
                    )}
                  </div>

                  {/* Viewer Portal */}
                  {viewerUrl && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                      <div className="bg-background w-full max-w-4xl h-[85vh] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                          <h4 className="font-bold flex items-center gap-2">
                            Preview Mode
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewerUrl(null)}
                            className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                          >
                            <XCircle className="h-6 w-6" />
                          </Button>
                        </div>
                        <div className="flex-1">
                          <ResumeViewer resumeUrl={viewerUrl} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
