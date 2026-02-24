import { useState, useEffect } from 'react';
import { attendanceAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Plus, Search, Edit, Trash2, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import AttendanceFormModal from '../components/AttendanceFormModal';

const AttendanceList = () => {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  useEffect(() => {
    fetchAttendances();
  }, [currentPage]);

  const fetchAttendances = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getAll({ page: currentPage, limit: 10 });
      setAttendances(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error('Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this attendance record?')) return;
    try {
      await attendanceAPI.delete(id);
      toast.success('Attendance deleted');
      fetchAttendances();
    } catch (error) {
      toast.error('Failed to delete attendance');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'present': return <CheckCircle className="text-green-600" size={20} />;
      case 'absent': return <XCircle className="text-red-600" size={20} />;
      case 'late': return <Clock className="text-yellow-600" size={20} />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <button onClick={() => { setSelectedAttendance(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus size={20} />Mark Attendance
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lesson</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendances.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <div className="font-medium">{item.student?.user?.name}</div>
                          <div className="text-sm text-gray-500">{item.student?.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {item.lesson?.subject?.name} - {item.lesson?.class?.name}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm">{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedAttendance(item); setShowModal(true); }}>
                          <Edit size={18} className="text-green-600" />
                        </button>
                        <button onClick={() => handleDelete(item.id)}>
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 flex justify-between border-t">
              <div>Page {currentPage} of {totalPages}</div>
              <div className="flex gap-2">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Previous</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50">Next</button>
              </div>
            </div>
          </>
        )}
      </div>
      <AttendanceFormModal isOpen={showModal} onClose={() => { setShowModal(false); setSelectedAttendance(null); }}
        onSuccess={fetchAttendances} attendance={selectedAttendance} />
    </div>
  );
};

export default AttendanceList;