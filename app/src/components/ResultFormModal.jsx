import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';
import { resultsAPI, studentsAPI, examsAPI, assignmentsAPI } from '../services/api';

const ResultFormModal = ({ isOpen, onClose, onSuccess, result = null }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [formData, setFormData] = useState({
    studentId: '',
    examId: '',
    assignmentId: '',
    marksObtained: 0,
    totalMarks: 100,
    remarks: ''
  });

  const [calculatedData, setCalculatedData] = useState({
    percentage: 0,
    grade: 'F'
  });

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (result) {
      setFormData({
        studentId: result.studentId || '',
        examId: result.examId || '',
        assignmentId: result.assignmentId || '',
        marksObtained: result.marksObtained || 0,
        totalMarks: result.totalMarks || 100,
        remarks: result.remarks || ''
      });
    }
  }, [result]);

  // Auto-calculate percentage and grade
  useEffect(() => {
    const percentage = (formData.marksObtained / formData.totalMarks) * 100;
    let grade = 'F';
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B+';
    else if (percentage >= 60) grade = 'B';
    else if (percentage >= 50) grade = 'C';
    else if (percentage >= 40) grade = 'D';
    
    setCalculatedData({ percentage: percentage.toFixed(2), grade });
  }, [formData.marksObtained, formData.totalMarks]);

  const fetchDropdownData = async () => {
    try {
      const [studentsRes, examsRes, assignmentsRes] = await Promise.all([
        studentsAPI.getAll({ limit: 100 }),
        examsAPI.getAll({ limit: 100 }),
        assignmentsAPI.getAll({ limit: 100 })
      ]);
      setStudents(studentsRes.data);
      setExams(examsRes.data);
      setAssignments(assignmentsRes.data);
    } catch (error) {
      console.error('Failed to fetch dropdown data');
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate that at least exam or assignment is selected
    if (!formData.examId && !formData.assignmentId) {
      toast.error('Please select either an exam or an assignment');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        percentage: parseFloat(calculatedData.percentage),
        grade: calculatedData.grade
      };

      if (result) {
        await resultsAPI.update(result.id, payload);
        toast.success('Result updated!');
      } else {
        await resultsAPI.create(payload);
        toast.success('Result created!');
      }
      onSuccess();
      onClose();
    } catch (error) {
      handleError(error, 'Unable to save result.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold">{result ? 'Edit Result' : 'Add Result'}</h2>
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
              <label className="block text-sm font-semibold mb-1">Exam</label>
              <select
                value={formData.examId}
                onChange={(e) => setFormData({...formData, examId: e.target.value, assignmentId: ''})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Exam (Optional)</option>
                {exams.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Assignment</label>
              <select
                value={formData.assignmentId}
                onChange={(e) => setFormData({...formData, assignmentId: e.target.value, examId: ''})}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Assignment (Optional)</option>
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Marks Obtained *</label>
              <input
                type="number"
                value={formData.marksObtained}
                onChange={(e) => setFormData({...formData, marksObtained: parseFloat(e.target.value)})}
                required
                min="0"
                step="0.5"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Total Marks *</label>
              <input
                type="number"
                value={formData.totalMarks}
                onChange={(e) => setFormData({...formData, totalMarks: parseFloat(e.target.value)})}
                required
                min="1"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Auto-calculated fields */}
            <div className="col-span-2 bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Auto-Calculated:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Percentage:</span>
                  <p className="text-2xl font-bold text-blue-600">{calculatedData.percentage}%</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Grade:</span>
                  <p className="text-2xl font-bold text-green-600">{calculatedData.grade}</p>
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-semibold mb-1">Remarks</label>
              <textarea
                value={formData.remarks}
                onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                rows="3"
                placeholder="Additional comments..."
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
              {loading ? 'Saving...' : result ? 'Update' : 'Create'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default ResultFormModal;