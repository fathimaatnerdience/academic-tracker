import { useState, useEffect } from 'react';
import { announcementsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Calendar, Megaphone } from 'lucide-react';
import AnnouncementFormModal from '../components/AnnouncementFormModal';
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const AnnouncementList = () => {
  const [announcements, setAnnouncements] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // Only show Add/Edit buttons for Admin
  const canEdit = user?.role === 'admin';

  useEffect(() => {
    fetchAnnouncements();
  }, [currentPage, searchTerm]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await announcementsAPI.getAll({ page: currentPage, limit: 10, search: searchTerm });
      setAnnouncements(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      handleError(error, 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await announcementsAPI.delete(id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      handleError(error, 'Failed to delete announcement');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'bg-red-100 text-red-800',
      'normal': 'bg-blue-100 text-blue-800',
      'low': 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        
        {/* Only show Add button for Admin */}
        {canEdit && (
          <button onClick={() => { setSelectedAnnouncement(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            <Plus size={20} />Add Announcement
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Search announcements..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" />
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Announcement</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Audience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                  {canEdit && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y">
                {announcements.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <Megaphone className="text-orange-600" size={20} />
                        </div>
                        <div>
                          <div className="font-medium">{item.title}</div>
                          <div className="text-sm text-gray-500">{item.description?.slice(0, 60)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold capitalize">
                        {item.targetAudience}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">{new Date(item.publishDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => { setSelectedAnnouncement(item); setShowModal(true); }}>
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
      <AnnouncementFormModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedAnnouncement(null); }}
        onSuccess={fetchAnnouncements} announcement={selectedAnnouncement} />
    </div>
  );
};

export default AnnouncementList;
