import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { subjectsAPI } from '../services/api';

const SubjectFormModal = ({ isOpen, onClose, onSuccess, subject = null }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectName: '',
    code: '',
    description: '',
    gradeLevel: 1,
    type: 'core',
    credits: 1
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        subjectName: subject.subjectName || '',
        code: subject.code || '',
        description: subject.description || '',
        gradeLevel: subject.gradeLevel || 1,
        type: subject.type || 'core',
        credits: subject.credits || 1
      });
    }
  }, [subject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (subject) {
        await subjectsAPI.update(subject.id, formData);
        toast.success('Subject updated!');
      } else {
        await subjectsAPI.create(formData);
        toast.success('Subject created!');
      }
      // Close modal first, then refresh list
      onClose();
      // Small delay to ensure modal state is updated before fetching
      setTimeout(() => {
        onSuccess();
      }, 100);
    } catch (error) {
      toast.error(error.message || 'Failed to save subject');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{subject ? 'Edit Subject' : 'Add Subject'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Subject Name *</label>
              <input
                type="text"
                value={formData.subjectName}
                onChange={(e) => setFormData({...formData, subjectName: e.target.value})}
                required
                placeholder="e.g., Mathematics"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Subject Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                placeholder="e.g., MATH101"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Grade Level *</label>
              <select
                value={formData.gradeLevel}
                onChange={(e) => setFormData({...formData, gradeLevel: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i + 1}>Grade {i + 1}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Subject Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="core">Core</option>
                <option value="elective">Elective</option>
                <option value="extra_curricular">Extra Curricular</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Credits</label>
              <input
                type="number"
                value={formData.credits}
                onChange={(e) => setFormData({...formData, credits: parseInt(e.target.value)})}
                min="0"
                max="10"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
              placeholder="Brief description of the subject..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
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
              {loading ? 'Saving...' : subject ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default SubjectFormModal;
