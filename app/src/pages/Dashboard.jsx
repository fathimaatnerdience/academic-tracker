import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, Calendar as CalendarIcon, GraduationCap, TrendingUp } from 'lucide-react';

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 1234,
    totalTeachers: 89,
    totalClasses: 42,
    totalSubjects: 18,
    attendanceRate: 94.5,
    maleStudents: 678,
    femaleStudents: 556
  });

  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Math Exam - Grade 10',
      start: new Date(2024, 1, 25, 9, 0),
      end: new Date(2024, 1, 25, 11, 0),
      type: 'exam'
    },
    {
      id: 2,
      title: 'Science Fair',
      start: new Date(2024, 1, 28, 10, 0),
      end: new Date(2024, 1, 28, 15, 0),
      type: 'event'
    },
    {
      id: 3,
      title: 'Parent-Teacher Meeting',
      start: new Date(2024, 2, 5, 14, 0),
      end: new Date(2024, 2, 5, 17, 0),
      type: 'meeting'
    }
  ]);

  // Attendance data for line chart
  const attendanceData = [
    { month: 'Jan', attendance: 92 },
    { month: 'Feb', attendance: 94 },
    { month: 'Mar', attendance: 91 },
    { month: 'Apr', attendance: 95 },
    { month: 'May', attendance: 93 },
    { month: 'Jun', attendance: 96 }
  ];

  // Grade distribution for bar chart
  const gradeData = [
    { grade: 'Grade 1', students: 120 },
    { grade: 'Grade 2', students: 135 },
    { grade: 'Grade 3', students: 128 },
    { grade: 'Grade 4', students: 142 },
    { grade: 'Grade 5', students: 115 },
    { grade: 'Grade 6', students: 138 },
    { grade: 'Grade 7', students: 125 },
    { grade: 'Grade 8', students: 131 }
  ];

  // Gender distribution for pie chart
  const genderData = [
    { name: 'Boys', value: stats.maleStudents, color: '#3B82F6' },
    { name: 'Girls', value: stats.femaleStudents, color: '#EC4899' }
  ];

  // Subject performance
  const subjectPerformance = [
    { subject: 'Math', average: 85 },
    { subject: 'Science', average: 88 },
    { subject: 'English', average: 82 },
    { subject: 'History', average: 79 },
    { subject: 'Geography', average: 84 }
  ];

  const eventStyleGetter = (event) => {
    const colors = {
      exam: { backgroundColor: '#EF4444', color: 'white' },
      event: { backgroundColor: '#3B82F6', color: 'white' },
      meeting: { backgroundColor: '#10B981', color: 'white' }
    };
    return { style: colors[event.type] || {} };
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name}! 
        </h1>
        <p className="text-blue-100">
          Here's what's happening in your school today
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Students</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalStudents}</h3>
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <TrendingUp size={16} /> +5.2% from last month
              </p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Teachers</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalTeachers}</h3>
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <TrendingUp size={16} /> +2 new this month
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <GraduationCap className="text-green-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Classes</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.totalClasses}</h3>
              <p className="text-gray-500 text-sm mt-2">Across all grades</p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <BookOpen className="text-purple-600" size={32} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Attendance Rate</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stats.attendanceRate}%</h3>
              <p className="text-green-600 text-sm mt-2">Above target of 90%</p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <CalendarIcon className="text-yellow-600" size={32} />
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Attendance Trend */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Attendance Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="attendance" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
              <span className="text-sm text-gray-600">Boys: {stats.maleStudents}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-pink-500"></div>
              <span className="text-sm text-gray-600">Girls: {stats.femaleStudents}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Students by Grade */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Students by Grade</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gradeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Average Performance by Subject</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={subjectPerformance} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="subject" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="average" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">School Calendar</h2>
        <div style={{ height: '600px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            eventPropGetter={eventStyleGetter}
            views={['month', 'week', 'day']}
            defaultView="month"
          />
        </div>
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-sm text-gray-600">Exams</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-sm text-gray-600">Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-sm text-gray-600">Meetings</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
