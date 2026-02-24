import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { examsAPI, subjectsAPI, classesAPI, teachersAPI } from '../services/api';

const ExamFormModal = ({ isOpen, onClose, onSuccess, exam = null }) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    teacherId: '',
    examDate: '',
    startTime: '09:00',
    endTime: '11:00',
    totalMarks: 100,
    passingMarks: 40,
    examType: 'midterm',
    description: ''
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (exam) {
      setFormData({
        title: exam.title || '',
        subjectId: exam.subjectId || '',
        classId: exam.classId || '',
        teacherId: exam.teacherId || '',
        examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
        startTime: exam.startTime || '09:00',
        endTime: exam.endTime || '11:00',
        totalMarks: exam.totalMarks || 100,
        passingMarks: exam.passingMarks || 40,
        examType: exam.examType || 'midterm',
        description: exam.description || ''
      });
    }
  }, [exam]);

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
      if (exam) {
        await examsAPI.update(exam.id, formData);
        toast.success('Exam updated!');
      } else {
        await examsAPI.create(formData);
        toast.success('Exam created!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{exam ? 'Edit Exam' : 'Add Exam'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Exam Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
                placeholder="e.g., Midterm Mathematics Exam"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

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
              <label className="block text-sm font-semibold mb-1">Exam Type *</label>
              <select
                value={formData.examType}
                onChange={(e) => setFormData({...formData, examType: e.target.value})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="midterm">Midterm</option>
                <option value="final">Final</option>
                <option value="quiz">Quiz</option>
                <option value="practical">Practical</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Exam Date *</label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
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

            <div>
              <label className="block text-sm font-semibold mb-1">Total Marks *</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({...formData, totalMarks: parseInt(e.target.value)})}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Passing Marks *</label>
              <input
                type="number"
                value={formData.passingMarks}
                onChange={(e) => setFormData({...formData, passingMarks: parseInt(e.target.value)})}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                placeholder="Additional information about the exam..."
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
              {loading ? 'Saving...' : exam ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ExamFormModal;