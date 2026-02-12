import { useState, useEffect } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useInterns } from "../context/InternsContext";
import axios from "axios";
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

export default function Leaderboard() {
    const { interns, refreshInterns } = useInterns();
    const [internTasks, setInternTasks] = useState<Record<number, any[]>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTasks() {
            setLoading(true);
            const tasksByIntern: Record<number, any[]> = {};
            for (const intern of interns) {
                try {
                    const response = await axios.get(
                        `http://localhost:8000/api/v1/tasks/tasks/intern/${intern.id}?id_type=intern`,
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
            setLoading(false);
        }

        refreshInterns();
        if (interns.length > 0) {
            fetchTasks();
        }
    }, [interns.length]);

    const calculatePerformanceScore = (internId: number) => {
        const tasks = internTasks[internId] || [];
        const scoredTasks = tasks.filter((task) => typeof task.score === 'number');

        if (scoredTasks.length === 0) return 0;

        const totalScore = scoredTasks.reduce((sum, task) => sum + task.score, 0);
        return Math.round(totalScore / scoredTasks.length);
    };

    const calculateCompletionRate = (internId: number) => {
        const tasks = internTasks[internId] || [];
        if (tasks.length === 0) return 0;
        const completed = tasks.filter((t) => t.status?.toLowerCase() === "done").length;
        return Math.round((completed / tasks.length) * 100);
    };

    const rankedInterns = interns
        .map((intern) => ({
            ...intern,
            score: calculatePerformanceScore(intern.id),
            completionRate: calculateCompletionRate(intern.id),
            tasksCompleted: (internTasks[intern.id] || []).filter((t) => t.status?.toLowerCase() === "done").length,
            totalTasks: (internTasks[intern.id] || []).length
        }))
        .sort((a, b) => b.score - a.score);

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0:
                return <Trophy className="w-6 h-6 text-yellow-500" />;
            case 1:
                return <Medal className="w-6 h-6 text-gray-400" />;
            case 2:
                return <Award className="w-6 h-6 text-amber-600" />;
            default:
                return <span className="text-muted-foreground font-bold w-6 text-center">{index + 1}</span>;
        }
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) {
            return (
                <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100 border-0">
                    <TrendingUp className="w-3 h-3 mr-1" /> Excellent
                </Badge>
            );
        } else if (score >= 70) {
            return (
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0">
                    <Minus className="w-3 h-3 mr-1" /> Good
                </Badge>
            );
        } else {
            return (
                <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-0">
                    <TrendingDown className="w-3 h-3 mr-1" /> Needs Improvement
                </Badge>
            );
        }
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center space-y-1 mb-6">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                        Intern Leaderboard
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Top performers based on task evaluation scores
                    </p>
                </div>

                {/* Top 3 Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 relative">
                    {/* Second Place */}
                    {rankedInterns.length > 1 && (
                        <div className="md:mt-4 order-2 md:order-1">
                            <Card className="p-4 relative overflow-hidden border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/40 dark:to-gray-900/40 hover:border-gray-300 dark:hover:border-gray-600 transition-all hover:shadow-lg">
                                <div className="absolute top-2 right-2">
                                    <Medal className="w-6 h-6 text-gray-400 dark:text-gray-500 opacity-80" />
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-600 dark:text-gray-300 ring-2 ring-gray-200 dark:ring-gray-700">
                                        {rankedInterns[1].full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">{rankedInterns[1].full_name}</h3>
                                        <p className="text-xs text-muted-foreground">{rankedInterns[1].job_position}</p>
                                    </div>
                                    <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                                        {rankedInterns[1].score}
                                        <span className="text-xs text-muted-foreground font-normal ml-1">/100</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* First Place */}
                    {rankedInterns.length > 0 && (
                        <div className="order-1 md:order-2 z-10">
                            <Card className="p-5 relative overflow-hidden border-2 border-yellow-200 dark:border-yellow-600/50 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-yellow-900/5 hover:border-yellow-300 dark:hover:border-yellow-500/50 transition-all hover:shadow-xl transform md:-translate-y-2">
                                <div className="absolute top-0 right-0 p-2 bg-yellow-100 dark:bg-yellow-900/40 rounded-bl-xl">
                                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-16 h-16 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center text-2xl font-bold text-yellow-700 dark:text-yellow-400 ring-4 ring-yellow-50 dark:ring-yellow-900/20">
                                        {rankedInterns[0].full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-foreground">{rankedInterns[0].full_name}</h3>
                                        <p className="text-xs text-muted-foreground">{rankedInterns[0].job_position}</p>
                                    </div>
                                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                        {rankedInterns[0].score}
                                        <span className="text-sm text-yellow-600/70 dark:text-yellow-400/70 font-normal ml-1">/100</span>
                                    </div>
                                    <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300 hover:bg-yellow-200 border-0 text-xs px-2 py-0">
                                        Top Performer
                                    </Badge>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* Third Place */}
                    {rankedInterns.length > 2 && (
                        <div className="md:mt-8 order-3">
                            <Card className="p-4 relative overflow-hidden border-2 border-amber-200 dark:border-amber-700/50 bg-gradient-to-br from-amber-50 to-white dark:from-amber-900/20 dark:to-amber-900/5 hover:border-amber-300 dark:hover:border-amber-600/50 transition-all hover:shadow-lg">
                                <div className="absolute top-2 right-2">
                                    <Award className="w-6 h-6 text-amber-500 dark:text-amber-400 opacity-80" />
                                </div>
                                <div className="flex flex-col items-center text-center space-y-2">
                                    <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-xl font-bold text-amber-700 dark:text-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/20">
                                        {rankedInterns[2].full_name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-base text-foreground">{rankedInterns[2].full_name}</h3>
                                        <p className="text-xs text-muted-foreground">{rankedInterns[2].job_position}</p>
                                    </div>
                                    <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">
                                        {rankedInterns[2].score}
                                        <span className="text-xs text-muted-foreground font-normal ml-1">/100</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    )}
                </div>

                {/* Full Ranking Table */}
                <Card className="overflow-hidden">
                    <div className="p-6 bg-muted/30 border-b border-border">
                        <h2 className="text-lg font-semibold">Full Rankings</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    <th className="px-6 py-4">Rank</th>
                                    <th className="px-6 py-4">Intern</th>
                                    <th className="px-6 py-4 text-center">Avg. Score</th>
                                    <th className="px-6 py-4 text-center">Tasks Completed</th>
                                    <th className="px-6 py-4 text-center">Completion Rate</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rankedInterns.map((intern, index) => (
                                    <tr key={intern.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted/50">
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {intern.full_name.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-foreground">{intern.full_name}</div>
                                                    <div className="text-xs text-muted-foreground">{intern.job_position}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className="text-lg font-bold">{intern.score}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-muted-foreground">
                                            {intern.tasksCompleted} / {intern.totalTasks}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-500 rounded-full"
                                                        style={{ width: `${intern.completionRate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-muted-foreground">{intern.completionRate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            {getScoreBadge(intern.score)}
                                        </td>
                                    </tr>
                                ))}
                                {rankedInterns.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                                            No data available to display rankings.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
