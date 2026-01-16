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
import { AlertCircle, CheckCircle, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DEPARTMENTS = ["Engineering", "Design", "Analytics", "Quality Assurance", "Product"];
const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Product Designer",
  "Data Analyst",
  "QA Engineer",
];
const SKILLS = [
  "React",
  "TypeScript",
  "Node.js",
  "Python",
  "PostgreSQL",
  "Docker",
  "Tailwind CSS",
  "UI Design",
  "Figma",
  "JavaScript",
];

interface FormData {
  name: string;
  email: string;
  role: string;
  department: string;
  startDate: string;
  skills: string[];
}

interface SubmitState {
  type: "idle" | "success" | "error";
  message: string;
}

export default function Onboarding() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    role: "",
    department: "",
    startDate: "",
    skills: [],
  });

  const [resume, setResume] = useState<File | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ type: "idle", message: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setResume(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setSubmitState({ type: "error", message: "Name is required" });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setSubmitState({ type: "error", message: "Valid email is required" });
      return false;
    }
    if (!formData.role) {
      setSubmitState({ type: "error", message: "Role is required" });
      return false;
    }
    if (!formData.department) {
      setSubmitState({ type: "error", message: "Department is required" });
      return false;
    }
    if (!formData.startDate) {
      setSubmitState({ type: "error", message: "Start date is required" });
      return false;
    }
    if (formData.skills.length === 0) {
      setSubmitState({ type: "error", message: "Select at least one skill" });
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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setSubmitState({
      type: "success",
      message: `${formData.name} has been onboarded successfully!`,
    });

    // Reset form
    setTimeout(() => {
      setFormData({
        name: "",
        email: "",
        role: "",
        department: "",
        startDate: "",
        skills: [],
      });
      setResume(null);
      setSubmitState({ type: "idle", message: "" });
    }, 3000);
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

            {/* Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="John Doe"
                value={formData.name}
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
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="role" className="text-sm font-medium">
                  Role <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => handleSelectChange("role", value)}>
                  <SelectTrigger id="role" className="mt-2">
                    <SelectValue placeholder="Select a role" />
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

            {/* Start Date */}
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium">
                Start Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-2"
              />
            </div>

            {/* Skills */}
            <div>
              <Label className="text-sm font-medium">
                Skills <span className="text-destructive">*</span>
              </Label>
              <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
                {SKILLS.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 border ${
                      formData.skills.includes(skill)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border hover:border-primary hover:bg-muted/50"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
              {formData.skills.length > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Selected {formData.skills.length} skill{formData.skills.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Resume Upload */}
            <div>
              <Label htmlFor="resume" className="text-sm font-medium">
                Resume <span className="text-muted-foreground">(Optional)</span>
              </Label>
              <div className="mt-2 relative">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary hover:bg-muted/50 transition-all"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {resume ? resume.name : "Click to upload PDF"}
                    </p>
                    <p className="text-xs text-muted-foreground">PDF only, max 10MB</p>
                  </div>
                </label>
              </div>
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
