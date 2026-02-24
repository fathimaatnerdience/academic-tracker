// ============================================
// PARENTS LIST PAGE
// File: frontend/src/pages/ParentList.jsx
// ============================================

import { useState, useEffect } from 'react';
import { parentsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Users, Phone, Briefcase } from 'lucide-react';
import ParentFormModal from '../components/ParentFormModal';

const ParentList = () => {
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);

  useEffect(() => {
    fetchParents();
  }, [currentPage, searchTerm]);

  const fetchParents = async () => {
    try {
      setLoading(true);
      const response = await parentsAPI.getAll({
        page: currentPage,
        limit: 10,
        search: searchTerm
      });
      setParents(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to fetch parents');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this parent? This will also delete their user account.')) return;

    try {
      await parentsAPI.delete(id);
      toast.success('Parent deleted successfully');
      fetchParents();
    } catch (error) {
      toast.error('Failed to delete parent');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Parents</h1>
        <button
          onClick={() => { setSelectedParent(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <Plus size={20} />
          Add Parent
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search parents by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : parents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No parents found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new parent.</p>
            
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Occupation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Children
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {parents.map((parent) => (
                    <tr key={parent.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                            <Users className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{parent.user?.name}</div>
                            <div className="text-sm text-gray-500">{parent.user?.email}</div>
                            {parent.relationship && (
                              <div className="text-xs text-gray-400 capitalize">{parent.relationship}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Phone size={16} className="text-gray-400" />
                          <span>{parent.phone || 'N/A'}</span>
                        </div>
                        {parent.address && (
                          <div className="text-xs text-gray-500 mt-1">{parent.address}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Briefcase size={16} className="text-gray-400" />
                          <span>{parent.occupation || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {parent.students && parent.students.length > 0 ? (
                          <div className="space-y-1">
                            {parent.students.map((student, index) => (
                              <div key={student.id} className="text-sm">
                                <span className="font-medium text-gray-700">{student.user?.name}</span>
                                {index < parent.students.length - 1 && <span className="text-gray-400">, </span>}
                              </div>
                            ))}
                            <div className="text-xs text-gray-500">
                              {parent.students.length} {parent.students.length === 1 ? 'child' : 'children'}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No children linked</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setSelectedParent(parent); setShowModal(true); }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(parent.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <ParentFormModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setSelectedParent(null); }}
        onSuccess={fetchParents}
        parent={selectedParent}
      />
    </div>
  );
};

export default ParentList;
