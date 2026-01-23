import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Student } from '../../types/college';
import StudentTable from './StudentTable';
import OfferLetterUpload from './OfferLetterUpload';
import FilesList from './FilesList';
import StudentDetail from './StudentDetail';
import { studentAPI } from '../../lib/college-api';

interface DashboardProps {
    onLogout: () => void;
}


const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [viewingFilesStudent, setViewingFilesStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | 'HIRED' | 'CLEARED_INTERVIEW' | 'INTERVIEW_SCHEDULED' | 'REJECTED'>('ALL');
    const [studentsWithFiles, setStudentsWithFiles] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [viewingDetailsStudent, setViewingDetailsStudent] = useState<Student | null>(null);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await studentAPI.getAll();
            const studentsData = response.data.map((student: any) => ({
                id: student.id.toString(),
                name: student.name,
                rollNumber: student.roll_number,
                email: student.email,
                status: student.status,
                hiringDate: student.hiring_date,
                joiningDate: student.joining_date,
                roundDetails: student.round_details,
                createdAt: student.created_at
            }));

            setStudents(studentsData);

            // Fetch which students have files
            await fetchStudentsWithFiles();

            setLoading(false);
        } catch (err: any) {
            console.error('Failed to fetch students:', err);
            setError('Failed to load students from database. Make sure backend is running.');
            setLoading(false);
        }
    };

    const fetchStudentsWithFiles = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/college-portal/uploads');
            const uploads = await response.json();

            // Get unique student IDs that have files
            const studentIds: Set<string> = new Set(uploads.map((upload: any) => upload.student_id.toString()));
            setStudentsWithFiles(studentIds);
        } catch (err) {
            console.error('Failed to fetch file counts:', err);
        }
    };

    const handleLogout = () => {
        onLogout();
    };

    // Filter and sort students
    const statusPriority = {
        'HIRED': 1,
        'CLEARED_INTERVIEW': 2,
        'INTERVIEW_SCHEDULED': 3,
        'REJECTED': 4
    };

    const filteredStudents = students
        .filter(student => {
            // Only show HIRED students
            if (student.status !== 'HIRED') {
                return false;
            }

            // Search by name or roll number
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = student.name.toLowerCase().includes(query);
                const matchesRoll = student.rollNumber.toLowerCase().includes(query);
                if (!matchesName && !matchesRoll) {
                    return false;
                }
            }

            return true;
        })
        .sort((a, b) => {
            // Sort by status priority: Hired first, then Cleared Interview, then Interview Scheduled
            return statusPriority[a.status] - statusPriority[b.status];
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <main className="max-w-7xl mx-auto py-2">

                {error && (
                    <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 shadow-md">
                        <div className="flex items-center gap-2">
                            <span>⚠️</span>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="mb-6 bg-white shadow-lg p-6 card-3d rounded-xl border border-indigo-50">
                        <h2 className="text-3xl font-bold mb-2 text-indigo-600">
                            Students Dashboard
                        </h2>
                        <div className="flex items-center gap-4 text-gray-600">
                            <div className="flex items-center gap-1">
                                <span>👥</span>
                                <span>Total Students: <strong>{students.length}</strong></span>
                            </div>
                            <span>|</span>
                            <div className="flex items-center gap-1">
                                <span>🎉</span>
                                <span>Hired: <strong className="text-green-600">{students.filter(s => s.status === 'HIRED').length}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Section */}
                    <div className="mb-6 bg-white shadow-lg p-6 rounded-xl border border-indigo-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            

                            {/* Search by Name or Roll Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Search by Name or Roll Number
                                </label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Enter name or roll number..."
                                        className="w-full pl-10 pr-4 py-2 border-2 border-gray-100 rounded-lg focus:border-indigo-500 focus:outline-none transition-colors font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Filter Results Info */}
                        {searchQuery && (
                            <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-100">
                                <span className="text-sm text-gray-600">
                                    Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
                                </span>
                                <button
                                    onClick={() => {
                                        setSearchQuery('');
                                        setFilter('ALL');
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-3 py-1 rounded-full transition-colors"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {filteredStudents.length === 0 ? (
                        <div className="bg-white shadow-lg p-12 text-center text-gray-500 rounded-xl border border-indigo-50 flex flex-col items-center gap-4">
                            <span className="text-5xl">🔭</span>
                            <p className="text-xl font-semibold text-gray-400">No students matching your criteria</p>
                            <button
                                onClick={() => { setSearchQuery(''); setFilter('ALL'); }}
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Reset Filters
                            </button>
                        </div>
                    ) : (
                        <div className="bg-white shadow-xl overflow-hidden rounded-xl border border-indigo-50">
                            <StudentTable
                                students={filteredStudents}
                                onSelectStudent={setSelectedStudent}
                                onViewFiles={setViewingFilesStudent}
                                studentsWithFiles={studentsWithFiles}
                                onViewDetails={setViewingDetailsStudent}
                            />
                        </div>
                    )}
                </div>
            </main>

            {
                selectedStudent && (
                    <OfferLetterUpload
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                        onSuccess={fetchStudentsWithFiles}
                    />
                )
            }

            {
                viewingFilesStudent && (
                    <FilesList
                        student={viewingFilesStudent}
                        onClose={() => setViewingFilesStudent(null)}
                        onUploadSuccess={fetchStudentsWithFiles}
                    />
                )
            }

            {
                viewingDetailsStudent && (
                    <StudentDetail
                        student={viewingDetailsStudent}
                        onClose={() => setViewingDetailsStudent(null)}
                        onUploadSuccess={fetchStudentsWithFiles}
                    />
                )
            }
        </div >
    );
};

export default Dashboard;
