import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { TimetableEntry } from '../types';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const { user, activeRole, activeChild } = useAuth();
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
  ];

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];

  useEffect(() => {
    const fetchTimetable = async () => {
      setIsLoading(true);
      try {
        let url = '/timetable';
        if (activeRole === 'STUDENT' && user?.student_id) {
          url = `/timetable?student_id=${user.student_id}`;
        } else if (activeRole === 'PARENT' && activeChild) {
          url = `/timetable?student_id=${activeChild.id}`;
        } else if (activeRole === 'FACULTY' && user?.faculty_id) {
          url = `/timetable?faculty_id=${user.faculty_id}`;
        }

        const data = await api.get<TimetableEntry[]>(url);
        setEntries(data);
      } catch (err) {
        console.error('Failed to load timetable', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimetable();
  }, [activeRole, activeChild, user]);

  const getSlot = (dayNum: number, periodNum: number) => {
    return entries.find(e => e.day_of_week === dayNum && e.period_number === periodNum);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-display flex items-center gap-2">
            <Calendar className="w-7 h-7 text-brand-600" />
            Academic Timetable
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly period schedule with conflict validation and room allocation
          </p>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider">
                <th className="py-3 px-4 border-r border-slate-800 w-28">Day / Period</th>
                {periods.map(p => (
                  <th key={p} className="py-3 px-3 border-r border-slate-800 text-center min-w-[130px]">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {days.map(d => (
                <tr key={d.num} className="hover:bg-slate-50/50">
                  <td className="py-4 px-4 font-bold text-slate-900 bg-slate-50 border-r border-slate-200">
                    {d.name}
                  </td>
                  {periods.map(p => {
                    const slot = getSlot(d.num, p);
                    return (
                      <td key={p} className="p-2 border-r border-slate-200 align-top">
                        {slot ? (
                          <div className="p-2.5 rounded-xl bg-brand-50/80 border border-brand-200 text-brand-950 space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-xs text-brand-700">
                                {slot.subject_code}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {slot.start_time.slice(0, 5)}
                              </span>
                            </div>
                            <p className="font-bold text-xs truncate" title={slot.subject_name}>
                              {slot.subject_name}
                            </p>
                            <p className="text-[11px] text-slate-600 truncate flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400 shrink-0" />
                              {slot.faculty_name}
                            </p>
                            {slot.room_number && (
                              <p className="text-[10px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                {slot.room_number}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="h-16 flex items-center justify-center text-slate-300 font-medium text-[11px]">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
