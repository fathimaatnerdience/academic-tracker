import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, GraduationCap, MoreHorizontal } from 'lucide-react';
import { studentsAPI, teachersAPI, parentsAPI, eventsAPI, announcementsAPI, dashboardAPI } from '../services/api';
import { handleError } from '../utils/errorHandler';
import AIChatbot from '../components/AIChatbot';

const localizer = momentLocalizer(moment);

const Dashboard = () => {
  const { user } = useAuth();
  
  // Design Theme Colors
  const theme = {
    background: '#F1F3E9', // Soft Cream/Sage background
    mint: '#99E9A1',       // Stat card green
    pink: '#F9D1D9',       // Notice board pink
    yellow: '#FEF9C3',     // Announcement yellow
    bluePastel: '#A2D2DF', // Boys chart color
    pinkPastel: '#F080A0', // Girls chart color
    white: '#FFFFFF'
  };

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalParents: 0,
    maleStudents: 0,
    femaleStudents: 0,
    attendanceRate: 0
  });

  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);

  const genderData = [
    { name: 'Boys', value: stats.maleStudents, color: theme.bluePastel },
    { name: 'Girls', value: stats.femaleStudents, color: theme.pinkPastel }
  ];


  const eventStyleGetter = (event) => ({
    style: { backgroundColor: theme.bluePastel, borderRadius: '8px', border: 'none', color: '#1A363E' }
  });

  // load real data from backend
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [stuRes, teaRes, parRes, evtRes, annRes] = await Promise.all([
          studentsAPI.getAll({ limit: 100000 }),
          teachersAPI.getAll({ limit: 100000 }),
          parentsAPI.getAll({ limit: 100000 }),
          eventsAPI.getAll({ limit: 1000 }),
          announcementsAPI.getAll({ limit: 5 })
        ]);

        const students = stuRes.data || [];
        const teachers = teaRes.data || [];
        const parents = parRes.data || [];
        const evts = evtRes.data || [];
        const anns = annRes.data || [];

        setStats({
          totalStudents: students.length,
          totalTeachers: teachers.length,
          totalParents: parents.length,
          maleStudents: students.filter(s => s.gender === 'male').length,
          femaleStudents: students.filter(s => s.gender === 'female').length,
          attendanceRate: 0 // could compute separately if desired
        });

        setEvents(evts.map(e => ({
          ...e,
          start: new Date(e.startDate || e.start),
          end: new Date(e.endDate || e.end)
        })));
        setAnnouncements(anns);

        // fetch attendance breakdown by day/gender
        try {
          const chartRes = await dashboardAPI.getAttendanceChart();
          if (chartRes && chartRes.data) {
            // convert data format to what recharts expects
            setAttendanceData(chartRes.data.map(d => ({
              day: d.day,
              boys: d.boys,
              girls: d.girls
            })));
          }
        } catch (err) {
          console.warn('attendance chart load failed', err);
        }
      } catch (error) {
        handleError(error, 'Failed to load dashboard data');
      }
    };

    loadDashboard();
  }, []);


  return (
    <div className="min-h-screen p-6 space-y-6" style={{ backgroundColor: theme.background }}>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Side: Stats and Charts */}
        <div className="flex-[2] space-y-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard title="Students" value={stats.totalStudents} color={theme.mint} icon={<Users size={20} />} />
            <StatCard title="Teachers" value={stats.totalTeachers} color={theme.mint} icon={<GraduationCap size={20} />} />
            <StatCard title="Parents" value={stats.totalParents} color={theme.mint} icon={<BookOpen size={20} />} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student Donut Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm h-[300px] md:h-[400px]">
              <h2 className="text-xl font-bold mb-4">Students</h2>
              <ResponsiveContainer width="100%" height="80%">
                <PieChart>
                  <Pie data={genderData} innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {genderData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-around mt-3 text-sm font-bold">
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center"><div className="w-3 h-3 rounded-full bg-[#A2D2DF]"></div><span>{stats.maleStudents.toLocaleString()}</span></div>
                  <p className="text-gray-400 text-xs">
                    Boys ({stats.totalStudents ? ((stats.maleStudents / stats.totalStudents) * 100).toFixed(0) : 0}%)
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center"><div className="w-3 h-3 rounded-full bg-[#F080A0]"></div><span>{stats.femaleStudents.toLocaleString()}</span></div>
                  <p className="text-gray-400 text-xs">
                    Girls ({stats.totalStudents ? ((stats.femaleStudents / stats.totalStudents) * 100).toFixed(0) : 0}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm h-[300px] md:h-[400px]">
              <h2 className="text-xl font-bold mb-4">Attendance</h2>
              <ResponsiveContainer width="100%" height="80%">
                <BarChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Legend iconType="circle" verticalAlign="top" align="left" wrapperStyle={{paddingBottom: '20px'}} />
                  <Bar dataKey="girls" fill={theme.pinkPastel} radius={[4, 4, 0, 0]} barSize={15} />
                  <Bar dataKey="boys" fill={theme.bluePastel} radius={[4, 4, 0, 0]} barSize={15} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Notice Board - show upcoming events as table */}
          <div className="rounded-2xl p-6 h-[300px] md:h-[400px] shadow-sm overflow-auto" style={{ backgroundColor: theme.pink }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notice Board</h2>
            {events && events.length > 0 ? (
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="pb-2">Title</th>
                    <th className="pb-2">Description</th>
                    <th className="pb-2">Start</th>
                    <th className="pb-2">End</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((ev) => (
                    <tr key={ev.id} className="border-t border-gray-200">
                      <td className="py-1 pr-3 font-medium text-gray-800">{ev.title}</td>
                      <td className="py-1 pr-3 text-gray-700">{ev.description || '-'}</td>
                      <td className="py-1 pr-3 text-gray-700">{new Date(ev.start).toLocaleString()}</td>
                      <td className="py-1 pr-3 text-gray-700">{new Date(ev.end).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 italic">No events to display on notice board.</p>
            )}
          </div>
        </div>

        {/* Right Side: Calendar and Announcements */}
        <div className="flex-1 space-y-6">
          {/* Calendar Area */}
          <div className="bg-[#BFDCE5] rounded-2xl p-4 h-[350px] md:h-[450px] shadow-sm flex flex-col">
            <h2 className="text-center text-gray-600 font-medium mb-2">Calendar</h2>
            <div className="flex-1 overflow-hidden rounded-xl bg-white/40">
              <Calendar
                localizer={localizer}
                events={events}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                toolbar={true}
              />
            </div>
          </div>

          {/* Announcements Area */}
          <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[300px] md:min-h-[400px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h2>
            <div className="space-y-4">
              {announcements && announcements.length > 0 ? (
                announcements.map((ann) => (
                  <div key={ann.id} className="p-4 rounded-xl border border-yellow-100" style={{ backgroundColor: theme.yellow }}>
                    <h3 className="font-bold text-gray-800">{ann.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {ann.description || ann.message || ''}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No announcements to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      <AIChatbot />

    </div>
    
  );
};

/* Helper Component for Stat Cards to match design */
const StatCard = ({ title, value, color, icon }) => (
  <div 
    className="p-6 rounded-2xl shadow-sm transition-all hover:scale-[1.02] cursor-pointer relative overflow-hidden"
    style={{ backgroundColor: color }}
  >
    <div className="flex justify-between items-start">
      <div>
        <span className="bg-white/40 text-[10px] px-2 py-0.5 rounded-full font-bold">2025/26</span>
        <h3 className="text-3xl font-bold text-gray-800 mt-3">{value}</h3>
        <p className="text-gray-700 font-medium">{title}</p>
      </div>
      <MoreHorizontal className="text-gray-600" size={20} />
    </div>
  </div>
  
);

export default Dashboard;