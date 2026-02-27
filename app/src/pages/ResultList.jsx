import { useState, useEffect } from 'react';
import { resultsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Award } from 'lucide-react';
import ResultFormModal from '../components/ResultFormModal';
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const ResultList = () => {
  const [results, setResults] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  // Show Add/Edit buttons for Admin and Teacher
  const canEdit = user?.role === 'admin' || user?.role === 'teacher';

  useEffect(() => {
    fetchResults();
  }, [currentPage]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await resultsAPI.getAll({ page: currentPage, limit: 10 });
      setResults(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      handleError(error, 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await resultsAPI.delete(id);
      toast.success('Result deleted');
      fetchResults();
    } catch (error) {
      handleError(error, 'Failed to delete result');
    }
  };

  const getGradeColor = (grade) => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-800';
    if (grade === 'C') return 'bg-yellow-100 text-yellow-800';
    if (grade === 'D') return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Results</h1>
        
        {/* Show Add button for Admin and Teacher */}
        {canEdit && (
          <button onClick={() => { setSelectedResult(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />Add Result
          </button>
        )}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  {canEdit && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                          <Award className="text-green-600" size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{item.student?.user?.name}</div>
                          <div className="text-sm text-gray-500">{item.student?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.exam?.title || item.assignment?.title || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.marksObtained} / {item.totalMarks}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{parseFloat(item.percentage)?.toFixed(2)}%</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(item.grade)}`}>
                        {item.grade}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedResult(item); setShowModal(true); }}>
                            <Edit size={18} className="text-green-600" />
                          </button>
                          <button onClick={() => handleDelete(item.id)}>
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 flex justify-between border-t">
              <div>Page {currentPage} of {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
      <ResultFormModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedResult(null); }}
        onSuccess={fetchResults} result={selectedResult} />
    </div>
  );
};

export default ResultList;
