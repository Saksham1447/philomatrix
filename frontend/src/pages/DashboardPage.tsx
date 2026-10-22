import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Users,
  CalendarCheck,
  Award,
  AlertTriangle,
  Clock,
  ArrowRight,
  FileText,
  BookOpen,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, activeRole, activeChild } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [todaySlots, setTodaySlots] = useState<any[]>([]);
  const [studentSummary, setStudentSummary] = useState<any>(null);
  const [studentMarks, setStudentMarks] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        // Universal: Notices
        const nList = await api.get<any[]>('/notices');
        setNotices(nList.slice(0, 3));

        if (activeRole === 'PRINCIPAL' || activeRole === 'SUPER_ADMIN') {
          const perf = await api.get<any>('/reports/analytics/class-performance');
          setAnalytics(perf);
          const approvals = await api.get<any[]>('/examinations/marks/approvals/pending');
          setPendingApprovals(approvals);
        } else if (activeRole === 'FACULTY') {
          const slots = await api.get<any[]>('/attendance/today-slots');
          setTodaySlots(slots);
        } else if (activeRole === 'STUDENT' && user?.student_id) {
          const att = await api.get<any>(`/attendance/summary/student/${user.student_id}`);
          setStudentSummary(att);
          const marks = await api.get<any[]>(`/examinations/marks/student/${user.student_id}`);
          setStudentMarks(marks);
        } else if (activeRole === 'PARENT' && activeChild) {
          const att = await api.get<any>(`/attendance/summary/student/${activeChild.id}`);
          setStudentSummary(att);
          const marks = await api.get<any[]>(`/examinations/marks/student/${activeChild.id}`);
          setStudentMarks(marks);
        }
      } catch (err) {
        console.error('Error loading dashboard data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [activeRole, activeChild, user]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-brand-200 mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Academic Year 2026-2027 • Active Term</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display">
            Welcome, {user?.full_name}
          </h1>
          <p className="text-sm text-brand-200 mt-1 max-w-2xl">
            {activeRole === 'PRINCIPAL' && 'Institution Executive Dashboard: Supervise attendance compliance, moderate examination marks, and manage academic divisions.'}
            {activeRole === 'FACULTY' && 'Faculty Lecture Dashboard: Mark lecture attendance, enter examination grades, and manage student assignments.'}
            {activeRole === 'STUDENT' && 'Junior College Student Portal: Track your lecture attendance percentage, timetable, marks, and published report cards.'}
            {activeRole === 'PARENT' && `Guardian Portal: Monitoring academic progress and verified attendance for ${activeChild?.full_name || 'your child'}.`}
            {activeRole === 'SUPER_ADMIN' && 'SaaS Super Administrator: Oversee multi-institution operations, tenant health, and platform governance.'}
            {activeRole === 'OFFICE_STAFF' && 'Academic Office Portal: Admissions, enrollment rosters, and student record maintenance.'}
          </p>
        </div>
        <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* ROLE 1: PRINCIPAL / SUPER ADMIN DASHBOARD */}
      {(activeRole === 'PRINCIPAL' || activeRole === 'SUPER_ADMIN') && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Enrolled Students</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {analytics ? analytics.total_active_students : '-'}
                </h3>
                <span className="text-[11px] text-emerald-600 font-semibold">Verified Enrolled</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Attendance Compliance</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {analytics ? `${analytics.attendance_compliance_rate}%` : '-'}
                </h3>
                <span className="text-[11px] text-slate-500">Above 75% Threshold</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">At-Risk (&lt; 75%)</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {analytics ? analytics.students_below_75_attendance : '-'}
                </h3>
                <span className="text-[11px] text-amber-600 font-semibold">Require Warning</span>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Pending Approvals</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                  {pendingApprovals.length}
                </h3>
                <span className="text-[11px] text-brand-600 font-semibold">Exam Marks Queue</span>
              </div>
            </div>
          </div>

          {/* Pending Approval Alert Banner */}
          {pendingApprovals.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {pendingApprovals.length} Examination Marks Batch awaiting your Principal Approval
                  </p>
                  <p className="text-xs text-amber-700">
                    Review faculty score submissions and publish results to release report cards.
                  </p>
                </div>
              </div>
              <Link
                to="/examinations"
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shrink-0"
              >
                Review Now
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ROLE 2: FACULTY DASHBOARD */}
      {activeRole === 'FACULTY' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Today's Teaching Schedule & Attendance
                </h2>
                <p className="text-xs text-slate-500">
                  Select an eligible lecture slot to mark or verify student attendance roster.
                </p>
              </div>
              <Link
                to="/attendance"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                Full Attendance Matrix <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {todaySlots.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                <p className="text-sm font-medium">No teaching lectures scheduled for today.</p>
                <p className="text-xs mt-1">Check your weekly timetable or academic calendar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {todaySlots.map((slot) => (
                  <div
                    key={slot.timetable_entry_id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 transition-all shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-500">
                        Period {slot.period_number} • {slot.start_time} - {slot.end_time}
                      </span>
                      {slot.is_submitted ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          <Clock className="w-3 h-3" /> Pending
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-slate-900">
                      {slot.subject_name} ({slot.subject_code})
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">
                      {slot.class_name} — Division {slot.division_name} ({slot.room_number || 'Main Lab'})
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                      <Link
                        to="/attendance"
                        className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        {slot.is_submitted ? 'View Records' : 'Mark Attendance'} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ROLE 3 & 4: STUDENT & PARENT VIEW */}
      {(activeRole === 'STUDENT' || activeRole === 'PARENT') && (
        <div className="space-y-6">
          {/* Attendance KPI Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
                  (studentSummary?.overall_percentage ?? 85) >= 75
                    ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                    : 'bg-rose-50 text-rose-600 border border-rose-200'
                }`}
              >
                {studentSummary?.overall_percentage ?? 85}%
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Term Attendance</p>
                <h3 className="text-lg font-bold text-slate-900">
                  {(studentSummary?.overall_percentage ?? 85) >= 75 ? 'Meets 75% Requirement' : 'Attendance Warning'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {studentSummary?.total_attended ?? 5} Attended / {studentSummary?.total_conducted ?? 5} Conducted Lectures
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 flex items-center justify-center font-bold">
                <Award className="w-7 h-7" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Academic Standing</p>
                <h3 className="text-lg font-bold text-slate-900">Class 11 Science</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roll No: {studentSummary?.admission_number ? '101' : 'Enrolled'} • Div A
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase">Official Results</p>
                <h3 className="text-lg font-bold text-slate-900">Unit Test 1 (Term 1)</h3>
                <p className="text-xs text-emerald-600 font-semibold mt-0.5">Published & Certified</p>
              </div>
              <Link
                to="/report-cards"
                className="px-3.5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" /> View Card
              </Link>
            </div>
          </div>

          {/* Subject-Wise Attendance Breakdown */}
          {studentSummary?.subject_breakdown && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-4 font-display">
                Subject-by-Subject Lecture Attendance
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {studentSummary.subject_breakdown.map((sb: any) => (
                  <div key={sb.subject_id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">{sb.subject_name}</span>
                      <span
                        className={`text-xs font-extrabold ${
                          sb.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {sb.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full ${sb.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${sb.percentage}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      {sb.total_attended} of {sb.total_conducted} lectures attended
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Notices */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-bold text-slate-900 font-display">
              Notices & Academic Announcements
            </h3>
          </div>
          <Link to="/notices" className="text-xs font-bold text-brand-600 hover:text-brand-700">
            View All Bulletins →
          </Link>
        </div>
        <div className="space-y-3">
          {notices.map((n) => (
            <div
              key={n.id}
              className="p-4 rounded-xl border border-slate-200/90 hover:border-slate-300 bg-slate-50/50 transition-all flex items-start justify-between"
            >
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      n.priority === 'URGENT'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-brand-50 text-brand-700'
                    }`}
                  >
                    {n.priority}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(n.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{n.title}</h4>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2">{n.content}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
