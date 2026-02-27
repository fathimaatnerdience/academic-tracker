import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { parentsAPI, studentsAPI } from '../services/api';

const ParentFormModal = ({ isOpen, onClose, onSuccess, parent = null }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
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

  // Fetch students when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchStudents();
    }
  }, [isOpen]);

  // Populate form when parent data changes or modal opens
  useEffect(() => {
    if (isOpen) {
      if (parent) {
        // Editing existing parent - populate all fields
        setFormData({
          // Prefer direct parent fields, fall back to user fields
          name: parent.name || parent.user?.name || '',
          email: parent.email || parent.user?.email || '',
          username: parent.user?.username || '',
          password: '', // Never populate password when editing
          phone: parent.phone || '',
          address: parent.address || '',
          occupation: parent.occupation || '',
          relationship: parent.relationship || 'father',
          // Handle student IDs - could be array of IDs or array of objects
          studentIds: parent.students?.map(s => s.id) || []
        });
      } else {
        // New parent - reset form
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
    }
  }, [parent, isOpen]);

  const fetchStudents = async () => {
    try {
      const response = await studentsAPI.getAll({ limit: 100 });
      setStudents(response.data || []);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare payload based on whether it's create or update
      const payload = parent 
        ? {
            // For update: send parentData and studentIds
            parentData: {
              phone: formData.phone,
              address: formData.address,
              occupation: formData.occupation,
              relationship: formData.relationship,
              ...(formData.password && { password: formData.password })
            },
            studentIds: formData.studentIds
          }
        : {
            // For create: send all fields
            name: formData.name,
            email: formData.email,
            username: formData.username,
            password: formData.password,
            phone: formData.phone,
            address: formData.address,
            occupation: formData.occupation,
            relationship: formData.relationship,
            studentIds: formData.studentIds
          };

      if (parent) {
        await parentsAPI.update(parent.id, payload);
        toast.success('Parent updated successfully!');
      } else {
        // Validate password for new parent
        if (!formData.password || formData.password.length < 6) {
          toast.error('Password must be at least 6 characters');
          setLoading(false);
          return;
        }
        await parentsAPI.create(payload);
        toast.success('Parent created successfully!');
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving parent:', error);
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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
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
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength="6"
                      placeholder="Minimum 6 characters"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
              )}

              {parent && (
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-1 text-gray-700">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength="6"
                    placeholder="Enter new password to change"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(123) 456-7890"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Relationship *
                </label>
                <select
                  name="relationship"
                  value={formData.relationship}
                  onChange={handleChange}
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
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold mb-1 text-gray-700">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
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
                        <div className="font-medium text-gray-900">
                          {student.name || student.user?.name || 'Unnamed Student'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {student.studentId || student.id} • Grade {student.gradeLevel}
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
