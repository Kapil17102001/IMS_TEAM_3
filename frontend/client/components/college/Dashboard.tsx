import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../types/college';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DashboardProps {
    onLogout: () => void;
}


const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await studentAPI.getAll();
            setStudents(response.data);
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch students:", err);
            setError("Failed to load students from database. Make sure backend is running.");
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(student => {
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                student.name.toLowerCase().includes(query) ||
                student.rollNumber.toLowerCase().includes(query)
            );
        }
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">College Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage and view all students and their details
                </p>
            </div>

            <Card className="p-6 mb-8">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                            placeholder="Search by name or roll number..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button variant="outline" onClick={fetchStudents}>
                        Refresh
                    </Button>
                </div>
            </Card>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <span className="text-muted-foreground">Loading students...</span>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-destructive font-medium mb-4">{error}</p>
                    <Button onClick={fetchStudents} variant="outline">
                        Retry
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredStudents.map((student) => (
                        <Card key={student.id} className="p-4">
                            <h4 className="font-semibold text-foreground text-sm mb-2">
                                {student.name}
                            </h4>
                            <p className="text-xs text-muted-foreground mb-2">
                                Roll Number: {student.rollNumber}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                                Email: {student.email}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                                Status: {student.status}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/students/${student.id}`)}
                            >
                                View Details
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;