import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { announcementsAPI, classesAPI } from '../services/api';
import { handleError } from '../utils/errorHandler';
import { useAuth } from '../contexts/AuthContext';

const AnnouncementFormModal = ({ isOpen, onClose, onSuccess, announcement = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'all',
    priority: 'normal',
    publishDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    classId: '',
    publishedBy: user?.id || ''
  });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        description: announcement.description || '',
        targetAudience: announcement.targetAudience || 'all',
        priority: announcement.priority || 'normal',
        publishDate: announcement.publishDate ? new Date(announcement.publishDate).toISOString().split('T')[0] : '',
        expiryDate: announcement.expiryDate ? new Date(announcement.expiryDate).toISOString().split('T')[0] : '',
        classId: announcement.classId || '',
        publishedBy: announcement.publishedBy || user?.id
      });
    }
  }, [announcement, user]);

  const fetchClasses = async () => {
    try {
      const response = await classesAPI.getAll({ limit: 100 });
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ensure empty string for classId becomes null
      const submitData = { ...formData, classId: formData.classId || null };
      if (announcement) {
        await announcementsAPI.update(announcement.id, submitData);
        toast.success('Announcement updated!');
      } else {
        await announcementsAPI.create(submitData);
        toast.success('Announcement created!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      // developers can inspect underlying error in console via handler
      handleError(error, 'Unable to save announcement.');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 border-red-500 text-red-700';
      case 'normal': return 'bg-blue-100 border-blue-500 text-blue-700';
      case 'low': return 'bg-gray-100 border-gray-500 text-gray-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{announcement ? 'Edit Announcement' : 'Add Announcement'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Announcement Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="e.g., School Closure Notice"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Target Audience *</label>
              <select
                value={formData.targetAudience}
                onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="parents">Parents</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Class (Optional)</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({...formData, classId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2">Priority *</label>
              <div className="grid grid-cols-3 gap-3">
                {['low', 'normal', 'high'].map((priority) => (
                  <button
                    key={priority}
                    type="button"
                    onClick={() => setFormData({...formData, priority})}
                    className={`px-4 py-3 border-2 rounded-lg font-semibold capitalize transition ${
                      formData.priority === priority 
                        ? getPriorityColor(priority) 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {priority}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Publish Date *</label>
              <input
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({...formData, publishDate: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
                rows="5"
                placeholder="Announcement content..."
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : announcement ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AnnouncementFormModal;