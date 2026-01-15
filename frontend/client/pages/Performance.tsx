import { useState, useMemo } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { mockInterns } from "../mock-data";
import { Intern } from "../types";

type Status = "good" | "average" | "needs-improvement";

export default function Performance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const departments = [
    "all",
    ...Array.from(new Set(mockInterns.map((i) => i.department))),
  ];

  const filteredInterns = useMemo(() => {
    return mockInterns.filter((intern) => {
      const matchesSearch =
        intern.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        departmentFilter === "all" || intern.department === departmentFilter;
      const matchesStatus =
        statusFilter === "all" || intern.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchQuery, departmentFilter, statusFilter]);

  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "good":
        return (
          <Badge variant="default" className="bg-success/20 text-success border-0">
            <TrendingUp className="w-3 h-3 mr-1" />
            Good
          </Badge>
        );
      case "average":
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning border-0">
            Average
          </Badge>
        );
      case "needs-improvement":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/20 text-destructive border-0"
          >
            <TrendingDown className="w-3 h-3 mr-1" />
            Needs Improvement
          </Badge>
        );
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-destructive";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Performance</h1>
          <p className="text-muted-foreground">
            Monitor and track intern performance metrics
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Total Interns</p>
            <p className="text-3xl font-bold mt-2">{mockInterns.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Good Performance</p>
            <p className="text-3xl font-bold mt-2 text-success">
              {mockInterns.filter((i) => i.status === "good").length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-3xl font-bold mt-2 text-warning">
              {mockInterns.filter((i) => i.status === "average").length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
            <p className="text-3xl font-bold mt-2 text-destructive">
              {mockInterns.filter((i) => i.status === "needs-improvement").length}
            </p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Search</label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Department
                </label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Mentor
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredInterns.length > 0 ? (
                  filteredInterns.map((intern) => (
                    <tr
                      key={intern.id}
                      className="hover:bg-muted/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                            {intern.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{intern.name}</p>
                            <p className="text-xs text-muted-foreground">{intern.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{intern.role}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {intern.department}
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{intern.mentor}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-lg ${getScoreColor(intern.performanceScore)}`}>
                          {intern.performanceScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(intern.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      No interns found matching your filters
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-border bg-muted/50 text-sm text-muted-foreground">
            Showing {filteredInterns.length} of {mockInterns.length} interns
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
