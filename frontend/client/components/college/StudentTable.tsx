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
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-indigo-600 text-white">
                    <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            👤 Name
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            🎓 Roll Number
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            📧 Email
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            📊 Status
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                            ⚡ Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {students.map((student, index) => {
                        const hasFiles = studentsWithFiles.has(student.id);
                        const isEven = index % 2 === 0;
                        return (
                            <tr
                                key={student.id}
                                onClick={() => onViewDetails(student)}
                                className={`table-row-hover cursor-pointer ${isEven ? 'bg-white' : 'bg-gray-50'}`}
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-700 font-mono">{student.rollNumber}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-600">{student.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold badge-3d ${statusColors[student.status]}`}>
                                        <span>{statusLabels[student.status]}</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex gap-2">
                                        {student.status === 'HIRED' && (
                                            <button
                                                onClick={() => onSelectStudent(student)}
                                                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium btn-3d"
                                            >
                                                <span>📤</span>
                                                <span>Upload</span>
                                            </button>
                                        )}
                                        {student.status === 'HIRED' && (
                                            <button
                                                onClick={() => onViewFiles(student)}
                                                className={`inline-flex items-center gap-1 px-4 py-2 text-white text-sm font-medium btn-3d ${hasFiles ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                                                    }`}
                                            >
                                                <span>📁</span>
                                                <span>Documents {hasFiles ? '(✓)' : '(0)'}</span>
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
