import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentsAPI, studentsAPI } from '../services/api';

const ParentFormModal = ({ isOpen, onClose, onSuccess, parent = null }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: '',
    address: '',
    occupation: '',
    relationship: 'father',
    studentIds: []
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (parent) {
      setFormData({
        name: parent.user?.name || '',
        email: parent.user?.email || '',
        username: parent.user?.username || '',
        password: '', // Don't populate password on edit
        phone: parent.phone || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
        relationship: parent.relationship || 'father',
        studentIds: parent.students?.map(s => s.id) || []
      });
    } else {
      // Reset form for new parent
      setFormData({
        name: '',
        email: '',
        username: '',
        password: '',
        phone: '',
        address: '',
        occupation: '',
        relationship: 'father',
        studentIds: []
      });
    }
  }, [parent, isOpen]);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll({ limit: 100 });
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (parent) {
        // Update existing parent
        await parentsAPI.update(parent.id, formData);
        toast.success('Parent updated successfully!');
      } else {
        // Create new parent
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await parentsAPI.create(formData);
        toast.success('Parent created successfully!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save parent');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {parent ? 'Edit Parent' : 'Add New Parent'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  placeholder="e.g., John Smith"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                  placeholder="john.smith@email.com"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Username {!parent && '*'}
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  required={!parent}
                  placeholder="johnsmith"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {!parent && (
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                    minLength="6"
                    placeholder="Minimum 6 characters"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Password must be at least 6 characters long
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Relationship *
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  rows="2"
                  placeholder="Full address"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Children Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Link to Children</h3>
            <div className="border rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
              {students.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No students available</p>
              ) : (
                <div className="space-y-2">
                  {students.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:bg-blue-50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={formData.studentIds.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{student.user?.name}</div>
                        <div className="text-sm text-gray-500">
                          ID: {student.studentId} • Grade {student.gradeLevel}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Select the students who are children of this parent
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                parent ? 'Update Parent' : 'Create Parent'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ParentFormModal;
