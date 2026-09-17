import React from 'react';
import { Role, Student, Group, Lecturer } from '../../types';

interface NavbarProps {
  currentRole: Role | null;
  currentStudent: Student | null;
  currentGroup: Group | null;
  currentLecturer: Lecturer | null;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onLogout: () => void;
  onResetDemo: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentStudent,
  currentGroup,
  currentLecturer,
  activeTab,
  onSelectTab,
  onLogout,
  onResetDemo,
}) => {
  const studentNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'kasus', label: 'Kasus & Scaffolding' },
    { id: 'latihan', label: 'Latihan' },
    { id: 'kelompok', label: 'Kelompok' },
    { id: 'progress', label: 'Perkembangan Saya' },
    { id: 'profil', label: 'Profil' },
  ];

  const lecturerNavItems = [
    { id: 'lecturer-dashboard', label: 'Dashboard' },
    { id: 'lecturer-incomplete', label: 'Belum Lengkap' },
    { id: 'lecturer-groups', label: 'Kelompok' },
    { id: 'lecturer-cases', label: 'Kasus & Pertemuan' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black tracking-wider text-sm shadow-xs border border-slate-700">
              SP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  SIAP PRESENTASI
                </span>
                {currentRole && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      currentRole === 'student'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {currentRole === 'student' ? 'Mahasiswa' : 'Dosen'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Sistem Latihan Presentasi Bertahap Mahasiswa
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          {currentRole && (
            <nav className="hidden md:flex items-center gap-1">
              {(currentRole === 'student' ? studentNavItems : lecturerNavItems).map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-item-${item.id}`}
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </nav>
          )}

          {/* User Context & Action Buttons */}
          <div className="flex items-center gap-2">
            {currentRole === 'student' && currentStudent && currentGroup && (
              <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-900">{currentStudent.name}</span>
                <span className="text-slate-300">|</span>
                <span>{currentGroup.name}</span>
                <span className="text-slate-300">|</span>
                <span className="font-mono font-semibold text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                  {currentGroup.room_code}
                </span>
              </div>
            )}

            {currentRole === 'lecturer' && currentLecturer && (
              <div className="hidden lg:flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700">
                <span className="font-bold text-slate-900">{currentLecturer.name}</span>
                <span className="text-slate-300">|</span>
                <span className="text-emerald-700 font-medium">Pengampu Kelas</span>
              </div>
            )}

            <button
              id="btn-demo-reset"
              type="button"
              onClick={onResetDemo}
              title="Reset ke data awal perkuliahan PAI"
              className="text-xs font-medium px-2.5 py-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer hidden sm:inline-flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset Data</span>
            </button>

            {currentRole && (
              <button
                id="btn-logout"
                type="button"
                onClick={onLogout}
                className="text-xs font-semibold px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Keluar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation for Students and Lecturers */}
      {currentRole && (
        <div className="md:hidden flex items-center justify-around border-t border-slate-200 bg-white py-2 px-1 overflow-x-auto">
          {(currentRole === 'student' ? studentNavItems : lecturerNavItems).map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex-1 py-1.5 px-2 text-center text-[11px] font-semibold whitespace-nowrap rounded-lg transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
