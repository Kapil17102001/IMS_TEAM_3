import { useState, useEffect,useContext } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2,Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "@/context/UserContext";
import OfferLetterUpload from "@/components/college/OfferLetterUpload";

interface Candidate {
  id: number;
  full_name: string;
  email: string;
  university: string;
  address: string;
  status: string;
}

export default function Candidates() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string | "all">("all");
    const { user } = useContext(UserContext); // Access user context to get college_id
        const user_id = user?.id; // Extract college_id from user context
    const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCandidates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/candidate/hired/${user_id}?skip=0&limit=100`, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch candidates");
      }

      const data = await response.json();
      setCandidates(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch candidates";
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
    fetchCandidates();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/api/v1/candidate/${id}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete candidate");
      }

      toast({
        title: "Success",
        description: `${name} has been deleted successfully`,
        variant: "success",
      });

      // Refresh the list
      fetchCandidates();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete candidate";
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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "assessment":
        return <Badge className="bg-blue-500 text-white">Assessment</Badge>;
      case "interview1":
        return <Badge className="bg-purple-500 text-white">Interview 1</Badge>;
      case "interview2":
        return <Badge className="bg-indigo-500 text-white">Interview 2</Badge>;
      case "hr":
        return <Badge className="bg-teal-500 text-white">HR</Badge>;
      case "hired":
        return <Badge className="bg-green-500 text-white">Hired</Badge>;
      case "rejected":
        return <Badge className="bg-red-500 text-white">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const filteredCandidates = candidates.filter((candidate) => {
    const matchesSearch =
      candidate.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || candidate.status.toLowerCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

    const handleUploadClick = (candidate: Candidate) => {
      console.log("candidate is : ",candidate)
    setSelectedCandidate(candidate);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCandidate(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Candidate Management</h1>
          <p className="text-muted-foreground">
            View and manage all candidates in the system
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
              All Candidates ({candidates.length})
            </Button>
            {[ "assessment", "interview1", "interview2", "hr", "hired", "rejected"].map((status) => {
              const count = candidates.filter(
                (c) => c.status.toLowerCase() === status
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Candidates</p>
            <p className="text-3xl font-bold mt-2">{candidates.length}</p>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading candidates...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button onClick={fetchCandidates} variant="outline">
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
                        Address
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
                    {filteredCandidates.length > 0 ? (
                      filteredCandidates.map((candidate) => (
                        <tr
                          key={candidate.id}
                          className="hover:bg-muted/50 transition-colors duration-150 cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                {candidate.full_name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{candidate.full_name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{candidate.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{candidate.university}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{candidate.address}</td>
                          <td className="px-6 py-4 text-center">{getStatusBadge(candidate.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUploadClick(candidate);
                                }}
                                className=" p-0"
                              >
                                <Upload className="h-4 w-4 mr-2" /> Upload
                              </Button>
                              <Button
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(candidate.id, candidate.full_name);
                                }}
                                className=" p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" /> Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No candidates found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/50 text-sm text-muted-foreground">
                Showing {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </Card>
      </div>
      {isModalOpen && selectedCandidate && (
        <OfferLetterUpload
          candidate={selectedCandidate}
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            fetchCandidates(); // Refresh the candidate list after successful upload
          }}
        />
      )}
    </MainLayout>
  );
}