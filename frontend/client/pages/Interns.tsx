import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [interns, setInterns] = useState<Intern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterns = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/interns/?skip=0&limit=100", {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch interns");
      }

      const data = await response.json();
      setInterns(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch interns";
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
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "active":
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case "onboarding":
        return <Badge className="bg-blue-500 text-white">Onboarding</Badge>;
      case "completed":
        return <Badge className="bg-gray-500 text-white">Completed</Badge>;
      case "terminated":
        return <Badge className="bg-red-500 text-white">Terminated</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getGenderStats = () => {
    const male = interns.filter(i => i.gender.toLowerCase() === "male").length;
    const female = interns.filter(i => i.gender.toLowerCase() === "female").length;
    return { male, female };
  };

  const stats = getGenderStats();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Intern Management</h1>
          <p className="text-muted-foreground">
            View and manage all interns in the system
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Interns</p>
            <p className="text-3xl font-bold mt-2">{interns.length}</p>
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
                    {interns.length > 0 ? (
                      interns.map((intern) => (
                        <tr
                          key={intern.id}
                          className="hover:bg-muted/50 transition-colors duration-150"
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
                            <span className="capitalize text-sm text-foreground">{intern.gender}</span>
                          </td>
                          <td className="px-6 py-4 text-center">{getStatusBadge(intern.status)}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdate(intern.id)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(intern.id, intern.full_name)}
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
                Showing {interns.length} intern{interns.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}
