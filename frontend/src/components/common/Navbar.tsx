import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Bell, User, Users, Shield } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, activeRole, activeChild, linkedChildren, selectChild, setActiveRole, logout } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Brand & Institution Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <img 
            src="/assets/logos/philomatrix-logo.png" 
            alt="PHILOMATRIX Logo"
            className="h-10 w-auto"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 font-display">
                PHILOMATRIX
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                ERP v1.0
              </span>
            </div>
            {user?.institution_name && (
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] sm:max-w-xs">
                {user.institution_name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Middle: Parent Child Switcher (Visible only for Parent role) */}
      {activeRole === 'PARENT' && linkedChildren.length > 0 && (
        <div className="hidden md:flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
          <span className="text-xs font-semibold text-slate-500 px-2 flex items-center gap-1">
            <Users className="w-3.5 h-3.5" /> Child:
          </span>
          <div className="flex space-x-1">
            {linkedChildren.map(child => (
              <button
                key={child.id}
                onClick={() => selectChild(child.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeChild?.id === child.id
                    ? 'bg-white text-brand-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {child.full_name} ({child.class_name || 'Class 11'})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Role Switcher Pill if multiple roles */}
        {user && user.roles.length > 1 && (
          <div className="hidden lg:flex items-center text-xs bg-slate-100 rounded-lg p-1 border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-400 px-2">Role:</span>
            {user.roles.map(r => (
              <button
                key={r}
                onClick={() => setActiveRole(r)}
                className={`px-2.5 py-0.5 rounded-md font-medium capitalize text-[11px] transition-all ${
                  activeRole === r
                    ? 'bg-white text-brand-700 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r.toLowerCase().replace('_', ' ')}
              </button>
            ))}
          </div>
        )}

        {/* User Card */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.full_name}
            </p>
            <p className="text-xs text-brand-600 font-medium capitalize">
              {activeRole?.toLowerCase().replace('_', ' ')}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center font-semibold text-xs">
            {user?.first_name?.[0] || 'U'}
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
