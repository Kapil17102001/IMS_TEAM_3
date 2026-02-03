import React from 'react';
import { Student } from '../../types/college';

interface StudentTableProps {
    students: Student[];
    onSelectStudent: (student: Student) => void;
    onViewFiles: (student: Student) => void;
    studentsWithFiles: Set<string>;
    onViewDetails: (student: Student) => void;
}

const statusColors = {
    INTERVIEW_SCHEDULED: 'bg-yellow-500 text-white',
    CLEARED_INTERVIEW: 'bg-blue-500 text-white',
    HIRED: 'bg-green-500 text-white',
    REJECTED: 'bg-red-500 text-white'
};

const statusLabels = {
    INTERVIEW_SCHEDULED: 'Interview Scheduled',
    CLEARED_INTERVIEW: 'Cleared Interview',
    HIRED: 'Hired',
    REJECTED: 'Rejected'
};

const StudentTable: React.FC<StudentTableProps> = ({ students, onSelectStudent, onViewFiles, studentsWithFiles, onViewDetails }) => {
    return (
        <div className="overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="min-w-full bg-card">
                <thead className="bg-primary/5 border-b border-border">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            👤 Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            🎓 Roll Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            📧 Email
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            📊 Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            ⚡ Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-border">
                    {students.map((student, index) => {
                        const hasFiles = studentsWithFiles.has(student.id);
                        const isEven = index % 2 === 0;
                        return (
                            <tr
                                key={student.id}
                                onClick={() => onViewDetails(student)}
                                className="hover:bg-accent/5 transition-all duration-200 cursor-pointer group"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{student.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-xs text-muted-foreground font-mono font-bold bg-accent/10 px-2 py-1 rounded inline-block">{student.rollNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-muted-foreground font-medium">{student.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full ${statusColors[student.status]}`}>
                                        <span>{statusLabels[student.status]}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                        {student.status === 'HIRED' && (
                                            <button
                                                onClick={() => onSelectStudent(student)}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl text-xs font-bold hover:bg-primary transition-all hover:text-white"
                                            >
                                                <span>📤</span>
                                                <span>Upload</span>
                                            </button>
                                        )}
                                        {student.status === 'HIRED' && (
                                            <button
                                                onClick={() => onViewFiles(student)}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${hasFiles
                                                    ? 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500 hover:text-white'
                                                    : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                                                    }`}
                                            >
                                                <span>📁</span>
                                                <span>{hasFiles ? 'Documents' : 'No Files'}</span>
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default StudentTable;