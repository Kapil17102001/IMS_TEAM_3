import { useState } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEPARTMENTS = ["COE", "Engineering", "Design", "Analytics", "Quality Assurance", "Product"];
const ROLES = [
  "Intern",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Designer",
  "Data Analyst",
  "QA Engineer",
];

interface FormData {
  full_name: string;
  email: string;
  university: string;
  department: string;
  start_date: string;
  end_date: string;
  address: string;
  job_position: string;
  gender: string;
}

interface SubmitState {
  type: "idle" | "success" | "error";
  message: string;
}

export default function Onboarding() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    full_name: "",
    email: "",
    university: "",
    department: "",
    start_date: "",
    end_date: "",
    address: "",
    job_position: "",
    gender: "",
  });

  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    if (!formData.full_name.trim()) {
      setSubmitState({ type: "error", message: "Full name is required" });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setSubmitState({ type: "error", message: "Valid email is required" });
      return false;
    }
    if (!formData.university.trim()) {
      setSubmitState({ type: "error", message: "University is required" });
      return false;
    }
    if (!formData.department) {
      setSubmitState({ type: "error", message: "Department is required" });
      return false;
    }
    if (!formData.job_position) {
      setSubmitState({ type: "error", message: "Job position is required" });
      return false;
    }
    if (!formData.start_date) {
      setSubmitState({ type: "error", message: "Start date is required" });
      return false;
    }
    if (!formData.end_date) {
      setSubmitState({ type: "error", message: "End date is required" });
      return false;
    }
    if (!formData.address.trim()) {
      setSubmitState({ type: "error", message: "Address is required" });
      return false;
    }
    if (!formData.gender) {
      setSubmitState({ type: "error", message: "Gender is required" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState({ type: "idle", message: "" });

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        university: formData.university,
        department: formData.department,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: "onboarding", // Hidden field, always set to onboarding
        address: formData.address,
        job_position: formData.job_position,
        salary: "25,000", // Hidden field, default value
        gender: formData.gender,
      };

      const response = await fetch("http://localhost:8000/api/v1/interns/", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to onboard intern");
      }

      const result = await response.json();
      
      setIsLoading(false);
      setSubmitState({
        type: "success",
        message: `${formData.full_name} has been onboarded successfully! Offer letter sent to ${formData.email}`,
      });

      toast({
        title: "Success!",
        description: `${formData.full_name} has been onboarded successfully`,
        variant: "success"
      });

      // Reset form
      setTimeout(() => {
        setFormData({
          full_name: "",
          email: "",
          university: "",
          department: "",
          start_date: "",
          end_date: "",
          address: "",
          job_position: "",
          gender: "",
        });
        setSubmitState({ type: "idle", message: "" });
      }, 3000);

    } catch (error) {
      setIsLoading(false);
      const errorMessage = error instanceof Error ? error.message : "Failed to onboard intern";
      setSubmitState({
        type: "error",
        message: errorMessage,
      });

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Onboard an Intern</h1>
          <p className="text-muted-foreground">
            Complete the form below to onboard a new intern to the program
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Messages */}
            {submitState.type === "success" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-success/10 border border-success/20">
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-success">{submitState.message}</p>
                </div>
              </div>
            )}

            {submitState.type === "error" && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-destructive">{submitState.message}</p>
                </div>
              </div>
            )}

            {/* Full Name */}
            <div>
              <Label htmlFor="full_name" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Your Name Here"
                value={formData.full_name}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="example@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* University */}
            <div>
              <Label htmlFor="university" className="text-sm font-medium">
                University <span className="text-destructive">*</span>
              </Label>
              <Input
                id="university"
                name="university"
                type="text"
                placeholder="university Here"
                value={formData.university}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* Job Position and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="job_position" className="text-sm font-medium">
                  Job Position <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.job_position} onValueChange={(value) => handleSelectChange("job_position", value)}>
                  <SelectTrigger id="job_position" className="mt-2">
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department" className="text-sm font-medium">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleSelectChange("department", value)}
                >
                  <SelectTrigger id="department" className="mt-2">
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Start and End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="start_date" className="text-sm font-medium">
                  Start Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="end_date" className="text-sm font-medium">
                  End Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="mt-2"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address" className="text-sm font-medium">
                Address <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Address Here"
                value={formData.address}
                onChange={handleTextareaChange}
                className="mt-2 min-h-[80px]"
              />
            </div>

            {/* Gender */}
            <div>
              <Label htmlFor="gender" className="text-sm font-medium">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleSelectChange("gender", value)}
              >
                <SelectTrigger id="gender" className="mt-2">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold"
              size="lg"
            >
              {isLoading ? "Onboarding..." : "Onboard Intern"}
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  );
}
