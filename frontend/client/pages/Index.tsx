import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { MainLayout } from "../components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Users,
  BarChart3,
  CheckCircle,
  Clock,
  Trophy,
  ArrowRight,
  User,
  CheckSquare
} from "lucide-react";
import { useInterns } from "../context/InternsContext";

// Stats Card Component matching Reference design
const StatsCard = ({ title, value, icon: Icon, color, alert }: any) => (
  <motion.div
    whileHover={{ y: -5 }}
    className={`bg-card border ${alert ? 'border-yellow-500 animate-pulse' : 'border-border'} p-6 rounded-2xl relative overflow-hidden`}
  >
    <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-10 rounded-bl-full -mr-4 -mt-4`} />

    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl bg-accent/5 ${color.replace('bg-', 'text-')}`}>
        <Icon className="w-6 h-6" />
      </div>
      {alert && <div className="w-2 h-2 rounded-full bg-yellow-500 animate-ping" />}
    </div>

    <h3 className="text-3xl font-bold text-foreground mb-1">{value}</h3>
    <p className="text-muted-foreground text-sm font-medium">{title}</p>
  </motion.div>
);

export default function Index() {
  const { interns, loading, error, refreshInterns } = useInterns();
  const [tasksInProgress, setTasksInProgress] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [pendingOnboarding, setPendingOnboarding] = useState(0);

  useEffect(() => {
    async function fetchPortalStats() {
      try {
        // Task stats
        const taskResponse = await axios.get("http://localhost:8000/api/v1/tasks/tasks", {
          headers: { accept: "application/json" }
        });
        const tasks = taskResponse.data;
        setTasksInProgress(tasks.filter((t: any) => t.status?.toLowerCase() === "in-progress").length);
        setCompletedTasks(tasks.filter((t: any) => t.status?.toLowerCase() === "done").length);

        // Pending Onboarding stats
        const hiredResponse = await axios.get("http://localhost:8000/api/v1/candidate/status/HIRED?skip=0&limit=100", {
          headers: { accept: "application/json" }
        });
        setPendingOnboarding(hiredResponse.data.length);
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    }

    refreshInterns();
    fetchPortalStats();
  }, [interns.length]);

  if (loading) {
    return (
      <MainLayout>
        <div className="p-8 text-foreground">Loading dashboard metrics...</div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="p-8 text-red-500">Error: {error}</div>
      </MainLayout>
    );
  }

  const totalInterns = interns.length;
  const goodPerformance = interns.filter((i) => i.status?.toLowerCase() === "active").length;
  // completedTasks and tasksInProgress are handled by state now

  return (
    <MainLayout>
      <div className="space-y-8 h-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome back. Here's what needs your attention.</p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Interns"
            value={totalInterns}
            icon={Users}
            color="bg-blue-500"
          />
          <StatsCard
            title="Active Interns"
            value={goodPerformance}
            icon={Trophy}
            color="bg-green-500"
          />
          <StatsCard
            title="Tasks In Progress"
            value={tasksInProgress}
            icon={Clock}
            color="bg-yellow-500"
            alert={tasksInProgress > 0}
          />
          <StatsCard
            title="Completed Tasks"
            value={completedTasks}
            icon={CheckCircle}
            color="bg-purple-500"
          />

        </div>

        {/* Action & Info Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Quick Actions (styled like 'Recruitment Funnel' card for consistency) */}
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/onboarding">
                <div className="p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors border border-border flex flex-col items-center justify-center text-center gap-2 group cursor-pointer h-full">
                  <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Onboarding</span>
                </div>
              </Link>

              <Link to="/performance">
                <div className="p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors border border-border flex flex-col items-center justify-center text-center gap-2 group cursor-pointer h-full">
                  <div className="p-2 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <BarChart3 className="w-6 h-6 text-green-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Performance</span>
                </div>
              </Link>

              <Link to="/planner">
                <div className="p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors border border-border flex flex-col items-center justify-center text-center gap-2 group cursor-pointer h-full">
                  <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition-colors">
                    <CheckSquare className="w-6 h-6 text-yellow-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Planner</span>
                </div>
              </Link>

              <Link to="/interns">
                <div className="p-4 bg-accent/5 rounded-xl hover:bg-accent/10 transition-colors border border-border flex flex-col items-center justify-center text-center gap-2 group cursor-pointer h-full">
                  <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Users className="w-6 h-6 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">Intern Views</span>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Interns (styled like 'Top Performers') */}
          <div className="bg-card border border-border p-6 rounded-2xl">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center justify-between">
              <span>Recent Interns</span>
              <Link to="/interns" className="text-xs text-blue-400 hover:text-blue-300">View All</Link>
            </h2>

            <div className="space-y-4">
              {interns.slice(0, 3).map((intern: any, i: number) => (
                <div key={intern.id || i} className="bg-accent/5 border border-border p-4 rounded-xl flex items-center gap-4">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-foreground font-bold text-sm">{intern.full_name}</h4>
                    <p className="text-muted-foreground text-xs">{intern.job_position} • {intern.department}</p>
                  </div>
                  <div className={`ml-auto px-3 py-1.5 text-xs font-bold rounded-lg ${intern.status?.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                    }`}>
                    {intern.status}
                  </div>
                </div>
              ))}

              {interns.length === 0 && (
                <div className="text-gray-500 text-sm italic py-4 text-center">No recent interns found.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
