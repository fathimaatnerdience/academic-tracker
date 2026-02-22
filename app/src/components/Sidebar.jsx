import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  UsersRound,
  BookOpen,
  School,
  Calendar,
  FileText,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  CalendarDays,
  Megaphone
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/students', label: 'Students', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { path: '/teachers', label: 'Teachers', icon: Users, roles: ['admin'] },
    { path: '/parents', label: 'Parents', icon: UsersRound, roles: ['admin', 'teacher'] },
    { path: '/subjects', label: 'Subjects', icon: BookOpen, roles: ['admin', 'teacher'] },
    { path: '/classes', label: 'Classes', icon: School, roles: ['admin', 'teacher'] },
    { path: '/lessons', label: 'Lessons', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
    { path: '/exams', label: 'Exams', icon: FileText, roles: ['admin', 'teacher', 'student'] },
    { path: '/assignments', label: 'Assignments', icon: ClipboardList, roles: ['admin', 'teacher', 'student'] },
    { path: '/results', label: 'Results', icon: BarChart3, roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/attendance', label: 'Attendance', icon: CalendarCheck, roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/events', label: 'Events', icon: CalendarDays, roles: ['admin', 'teacher', 'student', 'parent'] },
    { path: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['admin', 'teacher', 'student', 'parent'] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-yellow-500">Academic Tracker</h1>
        <p className="text-sm text-gray-500 mt-1">School Management</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-blue-600 font-semibold">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
