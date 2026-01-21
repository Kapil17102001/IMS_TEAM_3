import { useState, useMemo, useEffect } from "react";
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
import { useInterns } from "../context/InternsContext";
import axios from "axios";

export default function Performance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { interns, loading, error } = useInterns();
  const [internTasks, setInternTasks] = useState<Record<number, any[]>>({});

  useEffect(() => {
    async function fetchTasks() {
      const tasksByIntern: Record<number, any[]> = {};
      for (const intern of interns) {
        try {
          const response = await axios.get(
            `http://localhost:8000/api/v1/tasks/tasks/intern/${intern.id}`,
            {
              headers: {
                accept: "application/json",
              },
            }
          );
          tasksByIntern[intern.id] = response.data;
        } catch (error) {
          console.error(`Error fetching tasks for intern ${intern.id}:`, error);
          tasksByIntern[intern.id] = [];
        }
      }
      setInternTasks(tasksByIntern);
    }

    if (interns.length > 0) {
      fetchTasks();
    }
  }, [interns]);

  const calculatePerformanceScore = (internId: number) => {
    const tasks = internTasks[internId] || [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (task) => task.status.toLowerCase() === "done"
    ).length;
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const enhancedInterns = interns.map((intern) => ({
    ...intern,
    performanceScore: calculatePerformanceScore(intern.id),
  }));

  const departments = [
    "all",
    ...Array.from(new Set(interns.map((i) => i.department))),
  ];

  const filteredInterns = useMemo(() => {
    return enhancedInterns.filter((intern) => {
      const matchesSearch =
        intern.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        intern.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept =
        departmentFilter === "all" || intern.department === departmentFilter;
      const matchesStatus =
        statusFilter === "all" || intern.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [searchQuery, departmentFilter, statusFilter, enhancedInterns]);

  const getStatusBadge = (score: number) => {
    if (score >= 80) {
      return (
        <Badge variant="default" className="bg-success/20 text-success border-0">
          <TrendingUp className="w-3 h-3 mr-1" />
          Good
        </Badge>
      );
    } else if (score >= 70) {
      return (
        <Badge variant="secondary" className="bg-warning/20 text-warning border-0">
          Average
        </Badge>
      );
    } else {
      return (
        <Badge
          variant="destructive"
          className="bg-destructive/20 text-destructive border-0"
        >
          <TrendingDown className="w-3 h-3 mr-1" />
          Needs Improvement
        </Badge>
      );
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
            <p className="text-3xl font-bold mt-2">{interns.length}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Good Performance</p>
            <p className="text-3xl font-bold mt-2 text-success">
              {interns.filter((i) => i.status === "good").length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Average</p>
            <p className="text-3xl font-bold mt-2 text-warning">
              {interns.filter((i) => i.status === "average").length}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm font-medium text-muted-foreground">Needs Improvement</p>
            <p className="text-3xl font-bold mt-2 text-destructive">
              {interns.filter((i) => i.status === "needs-improvement").length}
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
                  {/* <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">
                    Mentor
                  </th> */}
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
                            {intern.full_name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{intern.full_name}</p>
                            <p className="text-xs text-muted-foreground">{intern.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-foreground">{intern.job_position}</td>
                      <td className="px-6 py-4 text-sm text-foreground">
                        {intern.department}
                      </td>
                      {/* <td className="px-6 py-4 text-sm text-foreground">{intern.mentor}</td> */}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold text-lg ${getScoreColor(intern.performanceScore)}`}>
                          {intern.performanceScore}
                        </span>
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(intern.performanceScore)}</td>
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
            Showing {filteredInterns.length} of {interns.length} interns
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}
