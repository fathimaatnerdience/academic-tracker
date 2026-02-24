import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { lessonsAPI, subjectsAPI, classesAPI, teachersAPI } from '../services/api';

const LessonFormModal = ({ isOpen, onClose, onSuccess, lesson = null }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    subjectId: '',
    classId: '',
    teacherId: '',
    dayOfWeek: 0,
    startTime: '09:00',
    endTime: '10:00',
    room: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (lesson) {
      setFormData({
        subjectId: lesson.subjectId || '',
        classId: lesson.classId || '',
        teacherId: lesson.teacherId || '',
        dayOfWeek: lesson.dayOfWeek || 0,
        startTime: lesson.startTime || '09:00',
        endTime: lesson.endTime || '10:00',
        room: lesson.room || ''
      });
    }
  }, [lesson]);

  const fetchDropdownData = async () => {
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        subjectsAPI.getAll({ limit: 100 }),
        classesAPI.getAll({ limit: 100 }),
        teachersAPI.getAll({ limit: 100 })
      ]);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (lesson) {
        await lessonsAPI.update(lesson.id, formData);
        toast.success('Lesson updated!');
      } else {
        await lessonsAPI.create(formData);
        toast.success('Lesson created!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save lesson');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{lesson ? 'Edit Lesson' : 'Add Lesson'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Subject *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.subjectName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Class *</label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({...formData, classId: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Teacher *</label>
              <select
                value={formData.teacherId}
                onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Teacher</option>
                {teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.user?.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Day of Week *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Room</label>
              <input
                type="text"
                value={formData.room}
                onChange={(e) => setFormData({...formData, room: e.target.value})}
                placeholder="e.g., Room 101, Lab A"
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
              {loading ? 'Saving...' : lesson ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default LessonFormModal;