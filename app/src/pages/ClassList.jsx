import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { classesAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Eye, Users } from 'lucide-react';
import ClassFormModal from '../components/ClassFormModal';
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const ClassList = () => {
  const [classes, setClasses] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    fetchClasses();
  }, [currentPage, searchTerm]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await classesAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      // API returns { success, count, totalPages, currentPage, data: rows }
      // Interceptor already returns response.data, so response IS the data object
      setClasses(response.data || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      handleError(error, 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;

    try {
      await classesAPI.delete(id);
      toast.success('Class deleted');
      fetchClasses();
    } catch (error) {
      handleError(error, 'Failed to delete class');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
        
        {/* Only show Add button for Admin */}
        {user?.role === 'admin' && (
          <button
            onClick={() => { setSelectedClass(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Class
          </button>
        )}
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search classes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supervisor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  {user?.role === 'admin' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {classes.map((classItem) => (
                  <tr key={classItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{classItem.name}</div>
                      <div className="text-sm text-gray-500">Grade {classItem.gradeLevel} - Section {classItem.section}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {classItem.supervisorName || 'Not Assigned'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{classItem.capacity}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-sm text-gray-900">{classItem.students?.length || 0}</span>
                      </div>
                    </td>
                    {user?.role === 'admin' && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedClass(classItem); setShowModal(true); }} className="text-green-600">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(classItem.id)} className="text-red-600">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
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

      <ClassFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedClass(null); }}
        onSuccess={fetchClasses}
        classData={selectedClass}
      />
    </div>
  );
};

export default ClassList;
