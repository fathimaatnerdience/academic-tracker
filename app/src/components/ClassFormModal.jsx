import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { classesAPI, teachersAPI } from '../services/api';

const ClassFormModal = ({ isOpen, onClose, onSuccess, classData = null }) => {
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    gradeLevel: 1,
    section: 'A',
    capacity: 30,
    supervisorId: '',
    academicYear: new Date().getFullYear()
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Populate form when editing existing class OR reset for new
  useEffect(() => {
    if (isOpen) {
      if (classData) {
        // Editing existing class - populate form
        setFormData({
          name: classData.name || '',
          gradeLevel: classData.gradeLevel || 1,
          section: classData.section || 'A',
          capacity: classData.capacity || 30,
          supervisorId: classData.supervisorId || '',
          academicYear: classData.academicYear || new Date().getFullYear()
        });
      } else {
        // New class - reset to empty/default values
        setFormData({
          name: '',
          gradeLevel: 1,
          section: 'A',
          capacity: 30,
          supervisorId: '',
          academicYear: new Date().getFullYear()
        });
      }
    }
  }, [isOpen, classData]);

  const fetchTeachers = async () => {
    try {
      const response = await teachersAPI.getAll({ limit: 100 });
      // API returns { success, count, totalPages, currentPage, data: rows }
      // Access response.data to get the array of teachers
      setTeachers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch teachers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (classData) {
        await classesAPI.update(classData.id, formData);
        toast.success('Class updated!');
      } else {
        await classesAPI.create(formData);
        toast.success('Class created!');
      }
      // Close modal first, then refresh list
      onClose();
      // Small delay to ensure modal state is updated before fetching
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      toast.error(error.message || 'Failed to save class');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{classData ? 'Edit Class' : 'Add Class'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Class Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Grade 10-A"
                maxLength="100"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Grade Level *</label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({...formData, gradeLevel: parseInt(e.target.value)})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(level => (
                  <option key={level} value={level}>Grade {level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Section *</label>
              <input
                type="text"
                value={formData.section}
                onChange={(e) => setFormData({...formData, section: e.target.value})}
                maxLength="10"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Capacity *</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                min="1"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Supervisor</label>
              <select
                value={formData.supervisorId}
                onChange={(e) => setFormData({...formData, supervisorId: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Supervisor</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name || teacher.user?.name || 'N/A'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Academic Year *</label>
              <input
                type="number"
                value={formData.academicYear}
                onChange={(e) => setFormData({...formData, academicYear: parseInt(e.target.value)})}
                required
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
              {loading ? 'Saving...' : classData ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ClassFormModal;
