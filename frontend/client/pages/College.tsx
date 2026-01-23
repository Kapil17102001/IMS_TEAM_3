import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CollegeData {
  id?: number;
  college_name: string;
  email: string;
  phone: string;
  address: string;
  head_name: string;
  head_phone: string;
}

export default function College() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CollegeData>({
    college_name: "",
    email: "",
    phone: "",
    address: "",
    head_name: "",
    head_phone: "",
  });

  const fetchColleges = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("http://localhost:8000/api/v1/colleges", {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }

      const data = await response.json();
      setColleges(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch colleges";
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
    fetchColleges();
  }, []);

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/colleges/${id}`,
        { method: "DELETE", headers: { Accept: "application/json" } }
      );

      if (!response.ok) {
        throw new Error("Failed to delete college");
      }

      toast({
        title: "Success",
        description: `${name} has been deleted successfully`,
        variant: "success",
      });

      fetchColleges();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete college";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      const url = editingId
        ? `http://localhost:8000/api/v1/colleges/${editingId}`
        : "http://localhost:8000/api/v1/colleges";

      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save college");
      }

      toast({
        title: "Success",
        description: editingId
          ? "College updated successfully!"
          : "College added successfully!",
        variant: "success",
      });

      setFormData({
        college_name: "",
        email: "",
        phone: "",
        address: "",
        head_name: "",
        head_phone: "",
      });
      setEditingId(null);
      setDialogOpen(false);

      fetchColleges();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save college";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">College Management</h1>
          <p className="text-muted-foreground">
            View and manage all colleges in the system
          </p>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-foreground">
            Total Colleges: {colleges.length}
          </h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
                <Plus className="h-4 w-4 mr-2" /> Add College
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit College" : "Add New College"}</DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the college information below."
                    : "Fill in the details to add a new college."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college_name">College Name *</Label>
                    <Input
                      id="college_name"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="head_name">Head Name *</Label>
                    <Input
                      id="head_name"
                      name="head_name"
                      value={formData.head_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="head_phone">Head Phone *</Label>
                    <Input
                      id="head_phone"
                      name="head_phone"
                      value={formData.head_phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : editingId ? "Update College" : "Add College"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading colleges...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button onClick={fetchColleges} variant="outline">
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
                        College Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                        Head Name
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {colleges.length > 0 ? (
                      colleges.map((college) => (
                        <tr
                          key={college.id}
                          className="hover:bg-muted/50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <p className="font-medium text-foreground">{college.college_name}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-foreground">{college.email}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{college.phone}</td>
                          <td className="px-6 py-4 text-sm text-foreground">{college.head_name}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(college)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(college.id!, college.college_name)}
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
                        <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                          No colleges found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="px-6 py-4 border-t border-border bg-muted/50 text-sm text-muted-foreground">
                Showing {colleges.length} college{colleges.length !== 1 ? "s" : ""}
              </div>
            </>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}