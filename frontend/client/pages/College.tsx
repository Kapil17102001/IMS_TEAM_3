import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, CheckCircle, Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollegeData {
  id?: number;
  college_name: string;
  email: string;
  phone: string;
  address: string;
  head_name: string;
  head_phone: string;
}

interface SubmitState {
  type: "idle" | "success" | "error";
  message: string;
}

export default function College() {
  const { toast } = useToast();
  const [colleges, setColleges] = useState<CollegeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>({
    type: "idle",
    message: "",
  });

  const [formData, setFormData] = useState<CollegeData>({
    college_name: "",
    email: "",
    phone: "",
    address: "",
    head_name: "",
    head_phone: "",
  });

  // Fetch colleges on mount
  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/v1/colleges");
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch colleges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    setSubmitState({ type: "idle", message: "" });

    try {
      setLoading(true);
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
        const error = await response.json();
        throw new Error(error.detail || "Failed to save college");
      }

      setSubmitState({
        type: "success",
        message: editingId
          ? "College updated successfully!"
          : "College added successfully!",
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

      toast({
        title: "Success",
        description: editingId
          ? "College updated successfully!"
          : "College added successfully!",
      });

      fetchColleges();
    } catch (error: any) {
      setSubmitState({
        type: "error",
        message: error.message || "Failed to save college",
      });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (college: CollegeData) => {
    setFormData(college);
    setEditingId(college.id || null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this college?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/colleges/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) throw new Error("Failed to delete college");

      toast({
        title: "Success",
        description: "College deleted successfully!",
      });

      fetchColleges();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
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
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Colleges Table */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-foreground">
            Registered Colleges ({colleges.length})
          </h2>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingId(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add College
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit College" : "Add New College"}
                </DialogTitle>
                <DialogDescription>
                  {editingId
                    ? "Update the college information below."
                    : "Fill in the details to add a new college."}
                </DialogDescription>
              </DialogHeader>

              {submitState.type === "success" && (
                <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-green-800">{submitState.message}</span>
                </div>
              )}

              {submitState.type === "error" && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="text-red-800">{submitState.message}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="college_name">College Name *</Label>
                    <Input
                      id="college_name"
                      name="college_name"
                      value={formData.college_name}
                      onChange={handleInputChange}
                      placeholder="e.g., MIT"
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
                      placeholder="contact@college.edu"
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
                      placeholder="+1-800-000-0000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="head_name">Head/Coordinator Name *</Label>
                    <Input
                      id="head_name"
                      name="head_name"
                      value={formData.head_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
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
                      placeholder="+1-800-000-0001"
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
                    placeholder="College address"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} >
                    {loading ? "Saving..." : editingId ? "Update College" : "Add College"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">

          {loading && !colleges.length ? (
            <p className="text-muted-foreground">Loading colleges...</p>
          ) : colleges.length === 0 ? (
            <p className="text-muted-foreground">No colleges registered yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">College Name</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Head Name</TableHead>
                    <TableHead className="text-right font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colleges.map((college) => (
                    <TableRow key={college.id}>
                      <TableCell className="font-medium">{college.college_name}</TableCell>
                      <TableCell>{college.email}</TableCell>
                      <TableCell>{college.phone}</TableCell>
                      <TableCell>{college.head_name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(college)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(college.id!)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </MainLayout>
  );
}