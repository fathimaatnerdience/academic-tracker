import { useState, useEffect } from 'react';
import { examsAPI, subjectsAPI, classesAPI, teachersAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Calendar, Clock, FileText } from 'lucide-react';
import ExamFormModal from '../components/ExamFormModal';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, [currentPage, searchTerm]);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setExams(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this exam?')) return;
    try {
      await examsAPI.delete(id);
      toast.success('Exam deleted');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const getExamTypeColor = (type) => {
    const colors = {
      'midterm': 'bg-blue-100 text-blue-800',
      'final': 'bg-red-100 text-red-800',
      'quiz': 'bg-green-100 text-green-800',
      'practical': 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Exams</h1>
        <button
          onClick={() => { setSelectedExam(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Exam
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{exam.title}</div>
                          <div className="text-sm text-gray-500">{exam.teacher?.user?.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{exam.subject?.name}</td>
                    <td className="px-6 py-4 text-sm">{exam.class?.name}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">{new Date(exam.examDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-sm">{exam.startTime} - {exam.endTime}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getExamTypeColor(exam.examType)}`}>
                        {exam.examType?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">{exam.totalMarks}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedExam(exam); setShowModal(true); }}>
                          <Edit size={18} className="text-green-600" />
                        </button>
                        <button onClick={() => handleDelete(exam.id)}>
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-6 py-4 flex justify-between border-t">
              <div>Page {currentPage} of {totalPages}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      <ExamFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedExam(null); }}
        onSuccess={fetchExams}
        exam={selectedExam}
      />
    </div>
  );
};

export default ExamList;