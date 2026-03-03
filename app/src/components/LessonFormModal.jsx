import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { lessonsAPI, subjectsAPI, classesAPI, teachersAPI } from '../services/api';

const LessonFormModal = ({ isOpen, onClose, onSuccess, lesson = null }) => {
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    subjectId: '',
    classId: '',
    teacherId: '',
    dayOfWeek: 'Monday',
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
        dayOfWeek: lesson.dayOfWeek || 'Monday',
        startTime: lesson.startTime || '09:00',
        endTime: lesson.endTime || '10:00',
        room: lesson.room || ''
      });
    }
  }, [lesson]);

  const fetchDropdownData = async () => {
    setDropdownLoading(true);
    try {
      const [subjectsRes, classesRes, teachersRes] = await Promise.all([
        subjectsAPI.getAll({ limit: 100 }),
        classesAPI.getAll({ limit: 100 }),
        teachersAPI.getAll({ limit: 100 })
      ]);
      console.log('Subjects response:', subjectsRes);
      console.log('Classes response:', classesRes);
      console.log('Teachers response:', teachersRes);
      setSubjects(subjectsRes.data || []);
      setClasses(classesRes.data || []);
      setTeachers(teachersRes.data || []);
    } catch (error) {
      console.error('Failed to fetch dropdown data:', error);
    } finally {
      setDropdownLoading(false);
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
      handleError(error, 'Unable to save lesson.');
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
          
          {/* Debug info 
          <div className="bg-yellow-50 text-xs ">
            Debug: {subjects.length} subjects, {classes.length} classes, {teachers.length} teachers loaded
          </div>*/}
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Subject *</label>
              {dropdownLoading ? (
                <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500">Loading...</div>
              ) : (
                <select
                  value={formData.subjectId}
                  onChange={(e) => setFormData({...formData, subjectId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject ({subjects.length} available)</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.subjectName || 'UNDEFINED'}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Class *</label>
              {dropdownLoading ? (
                <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500">Loading...</div>
              ) : (
                <select
                  value={formData.classId}
                  onChange={(e) => setFormData({...formData, classId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Class ({classes.length} available)</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name || 'UNDEFINED'}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Teacher *</label>
              {dropdownLoading ? (
                <div className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500">Loading...</div>
              ) : (
                <select
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Teacher ({teachers.length} available)</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>{t.name || t.user?.name || 'UNDEFINED'}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Day of Week *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
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
