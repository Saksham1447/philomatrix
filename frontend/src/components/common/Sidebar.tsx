import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Award,
  FileText,
  Users,
  BookOpen,
  Bell,
  MessageSquare,
  ShieldCheck,
  Building2,
  Sliders,
  FolderOpen
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeRole } = useAuth();

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['SUPER_ADMIN', 'PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT', 'OFFICE_STAFF']
    },
    {
      label: 'Lecture Attendance',
      path: '/attendance',
      icon: CalendarCheck,
      roles: ['PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT', 'OFFICE_STAFF']
    },
    {
      label: 'Academic Timetable',
      path: '/timetable',
      icon: Calendar,
      roles: ['PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT', 'OFFICE_STAFF']
    },
    {
      label: 'Examinations & Marks',
      path: '/examinations',
      icon: Award,
      roles: ['PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT']
    },
    {
      label: 'Official Report Cards',
      path: '/report-cards',
      icon: FileText,
      roles: ['PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT']
    },
    {
      label: 'Student Directory',
      path: '/students',
      icon: Users,
      roles: ['PRINCIPAL', 'OFFICE_STAFF', 'FACULTY']
    },
    {
      label: 'Study Materials & Notes',
      path: '/study-materials',
      icon: FolderOpen,
      roles: ['SUPER_ADMIN', 'PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT']
    },
    {
      label: 'Homework & Assignments',
      path: '/assignments',
      icon: BookOpen,
      roles: ['FACULTY', 'STUDENT', 'PARENT']
    },
    {
      label: 'Notices & Bulletins',
      path: '/notices',
      icon: Bell,
      roles: ['SUPER_ADMIN', 'PRINCIPAL', 'FACULTY', 'STUDENT', 'PARENT', 'OFFICE_STAFF']
    },
    {
      label: 'Academic Feedback',
      path: '/feedback',
      icon: MessageSquare,
      roles: ['PRINCIPAL', 'FACULTY', 'STUDENT']
    },
    {
      label: 'Settings & Preferences',
      path: '/settings',
      icon: Sliders,
      roles: ['SUPER_ADMIN', 'PRINCIPAL', 'FACULTY', 'OFFICE_STAFF']
    },
    {
      label: 'Security & Audit Logs',
      path: '/audit-logs',
      icon: ShieldCheck,
      roles: ['SUPER_ADMIN', 'PRINCIPAL']
    },
  ];

  const visibleItems = navItems.filter(item =>
    activeRole ? item.roles.includes(activeRole) : false
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800/80">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Academic Navigation
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-xs font-medium text-slate-400">
            System Online & Connected
          </p>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Indian JC Science Stream (11 & 12)
        </p>
      </div>
    </aside>
  );
};
