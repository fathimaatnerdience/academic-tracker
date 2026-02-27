import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Users, BookOpen, GraduationCap, MoreHorizontal, Bell } from 'lucide-react';
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

  const [stats] = useState({
    totalStudents: 1218,
    totalTeachers: 20,
    totalParents: 1189,
    maleStudents: 1234,
    femaleStudents: 1134,
    attendanceRate: 94.5
  });

  const [events] = useState([
    { id: 1, title: 'Math Exam', start: new Date(2024, 1, 25, 9, 0), end: new Date(2024, 1, 25, 11, 0), type: 'exam' },
    { id: 2, title: 'Science Fair', start: new Date(2024, 1, 28, 10, 0), end: new Date(2024, 1, 28, 15, 0), type: 'event' }
  ]);

  const genderData = [
    { name: 'Boys', value: stats.maleStudents, color: theme.bluePastel },
    { name: 'Girls', value: stats.femaleStudents, color: theme.pinkPastel }
  ];

  const attendanceData = [
    { day: 'Mon', boys: 75, girls: 60 },
    { day: 'Tue', boys: 75, girls: 60 },
    { day: 'Wed', boys: 75, girls: 60 },
    { day: 'Thu', boys: 75, girls: 60 },
    { day: 'Fri', boys: 75, girls: 60 },
  ];

  const eventStyleGetter = (event) => ({
    style: { backgroundColor: theme.bluePastel, borderRadius: '8px', border: 'none', color: '#1A363E' }
  });

  return (
    <div className="min-h-screen p-6 space-y-6" style={{ backgroundColor: theme.background }}>
      
      <div className="flex gap-6">
        {/* Left Side: Stats and Charts */}
        <div className="flex-[2] space-y-6">
          
          {/* Top Stat Cards */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard title="Students" value={stats.totalStudents} color={theme.mint} icon={<Users size={20} />} />
            <StatCard title="Teachers" value={stats.totalTeachers} color={theme.mint} icon={<GraduationCap size={20} />} />
            <StatCard title="Parents" value={stats.totalParents} color={theme.mint} icon={<BookOpen size={20} />} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Student Donut Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
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
                  <p className="text-gray-400 text-xs">Boys (55%)</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center gap-2 justify-center"><div className="w-3 h-3 rounded-full bg-[#F080A0]"></div><span>{stats.femaleStudents.toLocaleString()}</span></div>
                  <p className="text-gray-400 text-xs">Girls (45%)</p>
                </div>
              </div>
            </div>

            {/* Attendance Bar Chart */}
            <div className="bg-white p-6 rounded-2xl shadow-sm h-[400px]">
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

          {/* Notice Board */}
          <div className="rounded-2xl p-6 h-[400px] shadow-sm overflow-hidden" style={{ backgroundColor: theme.pink }}>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Notice Board</h2>
            <div className="space-y-4 opacity-60">
               <p className="italic">Any general school-wide updates or important staff notices will appear here...</p>
            </div>
          </div>
        </div>

        {/* Right Side: Calendar and Announcements */}
        <div className="flex-1 space-y-6">
          {/* Calendar Area */}
          <div className="bg-[#BFDCE5] rounded-2xl p-4 h-[450px] shadow-sm flex flex-col">
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
          <div className="bg-white rounded-2xl p-6 shadow-sm min-h-[500px]">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Announcements</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="p-4 rounded-xl border border-yellow-100" style={{ backgroundColor: theme.yellow }}>
                  <h3 className="font-bold text-gray-800">Grade-1 Test Paper</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    The test scheduled for 2nd March has been cancelled. A new date will be announced soon.
                  </p>
                </div>
              ))}
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