import { Link } from "react-router-dom";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, BarChart3, BookOpen, CheckSquare } from "lucide-react";
import { mockInterns, mockTasks } from "../mock-data";

export default function Index() {
  const totalInterns = mockInterns.length;
  const goodPerformance = mockInterns.filter((i) => i.status === "good").length;
  const tasksInProgress = mockTasks.filter((t) => t.status === "in-progress").length;
  const completedTasks = mockTasks.filter((t) => t.status === "done").length;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Welcome Back</h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your intern program today
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Total Interns</h3>
              <Users className="w-5 h-5 text-primary opacity-60" />
            </div>
            <p className="text-3xl font-bold text-foreground">{totalInterns}</p>
            <p className="text-sm text-muted-foreground mt-2">Active in program</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Good Performance</h3>
              <BarChart3 className="w-5 h-5 text-success opacity-60" />
            </div>
            <p className="text-3xl font-bold text-success">{goodPerformance}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {Math.round((goodPerformance / totalInterns) * 100)}% of interns
            </p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Tasks In Progress</h3>
              <CheckSquare className="w-5 h-5 text-warning opacity-60" />
            </div>
            <p className="text-3xl font-bold text-warning">{tasksInProgress}</p>
            <p className="text-sm text-muted-foreground mt-2">Currently being worked on</p>
          </Card>

          <Card className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">Completed Tasks</h3>
              <CheckSquare className="w-5 h-5 text-primary opacity-60" />
            </div>
            <p className="text-3xl font-bold text-primary">{completedTasks}</p>
            <p className="text-sm text-muted-foreground mt-2">Successfully done</p>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link to="/onboarding">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-foreground">Onboarding</h3>
                <p className="text-sm text-muted-foreground mt-1">Add a new intern</p>
              </Card>
            </Link>

            <Link to="/performance">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-foreground">Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">View metrics</p>
              </Card>
            </Link>

            <Link to="/interns">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <BookOpen className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-foreground">Intern Views</h3>
                <p className="text-sm text-muted-foreground mt-1">View profiles</p>
              </Card>
            </Link>

            <Link to="/planner">
              <Card className="p-6 cursor-pointer hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <CheckSquare className="w-8 h-8 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                  <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="font-semibold text-foreground">Planner</h3>
                <p className="text-sm text-muted-foreground mt-1">Manage tasks</p>
              </Card>
            </Link>
          </div>
        </div>

        {/* Recent Interns */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-foreground">Recent Interns</h2>
            <Link to="/performance">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockInterns.slice(0, 3).map((intern) => (
              <Card key={intern.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary">
                      {intern.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{intern.name}</h3>
                      <p className="text-sm text-muted-foreground">{intern.role}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="font-medium">{intern.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mentor:</span>
                    <span className="font-medium">{intern.mentor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Performance:</span>
                    <span
                      className={`font-bold ${
                        intern.performanceScore >= 80
                          ? "text-success"
                          : intern.performanceScore >= 70
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    >
                      {intern.performanceScore}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
