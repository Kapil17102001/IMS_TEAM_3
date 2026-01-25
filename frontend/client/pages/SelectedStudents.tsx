import { useState, useMemo } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, GraduationCap } from "lucide-react";

export default function SelectedStudents() {
    const [searchQuery, setSearchQuery] = useState("");

    // Sample data for selected students
    const students = [
        { id: 1, name: "Alice Johnson", email: "alice.j@university.edu", role: "Software Intern", department: "Engineering", status: "Selected" },
        { id: 2, name: "Bob Smith", email: "bob.s@university.edu", role: "Frontend Intern", department: "Engineering", status: "Selected" },
        { id: 3, name: "Charlie Davis", email: "charlie.d@university.edu", role: "UX Intern", department: "Design", status: "Selected" },
    ];

    const filteredStudents = useMemo(() => {
        return students.filter((student) =>
            student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            student.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">Selected Students</h1>
                    <p className="text-muted-foreground">
                        View the list of students selected for internship from your college
                    </p>
                </div>

                <Card className="p-6">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students by name or email..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </Card>

                <Card className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-muted border-b border-border">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Role</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Department</th>
                                    <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {filteredStudents.length > 0 ? (
                                    filteredStudents.map((student) => (
                                        <tr key={student.id} className="hover:bg-muted/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                                                        {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{student.name}</p>
                                                        <p className="text-xs text-muted-foreground">{student.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground">{student.role}</td>
                                            <td className="px-6 py-4 text-sm text-foreground">{student.department}</td>
                                            <td className="px-6 py-4">
                                                <Badge variant="default" className="bg-green-500/20 text-green-500 border-0">
                                                    {student.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                            No students found
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