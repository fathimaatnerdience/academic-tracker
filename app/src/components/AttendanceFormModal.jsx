import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { attendanceAPI, studentsAPI, lessonsAPI } from '../services/api';

const AttendanceFormModal = ({ isOpen, onClose, onSuccess, attendance = null }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    lessonId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    remarks: ''
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (attendance) {
      setFormData({
        studentId: attendance.studentId || '',
        lessonId: attendance.lessonId || '',
        date: attendance.date ? new Date(attendance.date).toISOString().split('T')[0] : '',
        status: attendance.status || 'present',
        remarks: attendance.remarks || ''
      });
    }
  }, [attendance]);

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, lessonsRes] = await Promise.all([
        studentsAPI.getAll({ limit: 100 }),
        lessonsAPI.getAll({ limit: 100 })
      ]);
      setStudents(studentsRes.data);
      setLessons(lessonsRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (attendance) {
        await attendanceAPI.update(attendance.id, formData);
        toast.success('Attendance updated!');
      } else {
        await attendanceAPI.create(formData);
        toast.success('Attendance marked!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 border-green-500 text-green-700';
      case 'absent': return 'bg-red-100 border-red-500 text-red-700';
      case 'late': return 'bg-yellow-100 border-yellow-500 text-yellow-700';
      default: return 'bg-gray-100 border-gray-500 text-gray-700';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{attendance ? 'Edit Attendance' : 'Mark Attendance'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Student *</label>
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Student</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.user?.name} - {s.studentId}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Lesson *</label>
              <select
                value={formData.lessonId}
                onChange={(e) => setFormData({...formData, lessonId: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Lesson</option>
                {lessons.map(l => (
                  <option key={l.id} value={l.id}>{l.subject?.name} - {l.class?.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Date *</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-2">Status *</label>
              <div className="grid grid-cols-3 gap-3">
                {['present', 'absent', 'late'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({...formData, status})}
                    className={`px-4 py-3 border-2 rounded-lg font-semibold capitalize transition ${
                      formData.status === status 
                        ? getStatusColor(status) 
                        : 'bg-gray-50 border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows="3"
                placeholder="Additional notes..."
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
              {loading ? 'Saving...' : attendance ? 'Update' : 'Mark'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AttendanceFormModal;