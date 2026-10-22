import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Student } from '../types';
import { Users, Search, UserPlus, Phone, Mail, MapPin, Calendar, CheckCircle2 } from 'lucide-react';

export const StudentsPage: React.FC = () => {
  const { activeRole } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    admission_number: '',
    date_of_birth: '2009-01-01',
    gender: 'MALE',
    admission_date: new Date().toISOString().split('T')[0],
    class_id: '',
    division_id: '',
    academic_year_id: '',
    roll_number: '',
  });

  const [classes, setClasses] = useState<any[]>([]);
  const [years, setYears] = useState<any[]>([]);

  const loadStudents = async () => {
    try {
      const data = await api.get<Student[]>(`/students${search ? `?search=${search}` : ''}`);
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students', err);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const cls = await api.get<any[]>('/academics/classes');
        setClasses(cls);
        const yrs = await api.get<any[]>('/academics/years');
        setYears(yrs);

        if (cls.length > 0 && cls[0].divisions.length > 0) {
          setFormData(prev => ({
            ...prev,
            class_id: cls[0].id,
            division_id: cls[0].divisions[0].id,
            academic_year_id: yrs[0]?.id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load classes or years', err);
      }
    };
    fetchMetadata();
  }, []);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      await api.post('/students', formData);
      setSuccessMsg('Student admitted and enrolled successfully!');
      setShowModal(false);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Admission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-600" />
            Student Management & Admissions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete student directory, admissions, enrollment records, and guardian links
          </p>
        </div>

        {(activeRole === 'PRINCIPAL' || activeRole === 'OFFICE_STAFF') && (
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Admit New Student</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" /> {successMsg}
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center space-x-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by student name, admission number, roll no, or email..."
          className="w-full text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {students.map(st => (
          <div
            key={st.id}
            className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-xs space-y-3 transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                  {st.admission_number}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">{st.full_name}</h3>
                <p className="text-xs text-slate-500">
                  {st.class_name || 'Class 11 Science'} • Div {st.division_name || 'A'} • Roll {st.roll_number || '101'}
                </p>
              </div>
              <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-slate-600">
                {st.first_name[0]}
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {st.email}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {st.phone_number || 'N/A'}
              </p>
              <p className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> DOB: {st.date_of_birth}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Admission Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Junior College Student Admission
            </h2>
            <form onSubmit={handleCreateStudent} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Admission Number</label>
                  <input
                    type="text"
                    required
                    placeholder="ADM-2026-XXX"
                    value={formData.admission_number}
                    onChange={e => setFormData({ ...formData, admission_number: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg bg-slate-50"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700"
                >
                  {isSubmitting ? 'Enrolling...' : 'Confirm Admission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
