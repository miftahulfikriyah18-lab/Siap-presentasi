import React, { useState } from 'react';
import { Student, Group, Meeting, ClassItem, StudentMeetingProgress } from '../../types';
import { storageService } from '../../lib/storage';
import { StatusBadge, StepBadge } from '../common/ProgressBadge';

interface StudentDashboardProps {
  student: Student;
  group: Group;
  currentClass?: ClassItem;
  meetings: Meeting[];
  selectedMeetingId: string;
  onSelectMeeting: (id: string) => void;
  onNavigateToPractice: (stepNumber: 1 | 2 | 3) => void;
  onNavigateToCase: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  group,
  currentClass,
  meetings,
  selectedMeetingId,
  onSelectMeeting,
  onNavigateToPractice,
  onNavigateToCase,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');

  const activeMeeting = meetings.find((m) => m?.id === selectedMeetingId) || meetings[0];
  const groupStudents = group?.id ? storageService.getStudentsByGroupId(group.id) : [];

  // Calculate my progress in current meeting
  const myProgress = activeMeeting && student?.id
    ? storageService.calculateStudentProgress(student.id, activeMeeting.id)
    : null;

  // Calculate group members progress
  const membersProgress = groupStudents.map((member) => ({
    member,
    progress: activeMeeting && member?.id
      ? storageService.calculateStudentProgress(member.id, activeMeeting.id)
      : null,
  }));

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    storageService.addStudentToGroup(group.id, newMemberName.trim());
    setNewMemberName('');
    setShowAddMember(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(group.room_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Determine Next Action according to Requirement 40
  const getNextAction = () => {
    if (!myProgress) return null;

    if (!myProgress.latihan1.is_complete) {
      return {
        stage: 1 as const,
        title: 'Latihan 1 — Latihan Mandiri',
        description: 'Lakukan presentasi mandiri, simpan link rekaman Google Drive, dengarkan kembali dari awal sampai akhir, dan isi refleksi diri privat.',
        buttonText: 'Mulai / Lanjutkan Latihan 1',
      };
    }

    if (!myProgress.latihan2.is_complete) {
      return {
        stage: 2 as const,
        title: 'Latihan 2 — Latihan Bersama Kelompok',
        description: 'Lakukan pertemuan bersama kelompok di luar jam kuliah. Presentasikan kasus, berikan feedback peer-assessment kepada semua teman, dan simpan bukti kegiatan.',
        buttonText: 'Lanjutkan Latihan 2',
      };
    }

    if (!myProgress.latihan3.is_complete) {
      return {
        stage: 3 as const,
        title: 'Latihan 3 — Simulasi Presentasi di Kelas',
        description: 'Simulasi presentasi saat jam kuliah, berikan penilaian final untuk teman kelompok, dan tulis refleksi akhir kesiapan Anda.',
        buttonText: 'Lanjutkan Latihan 3',
      };
    }

    return null;
  };

  const nextAction = getNextAction();

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Top Banner: Greeting, Class, Group, and Room Code */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
              Dashboard Mahasiswa
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Halo, {student.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-600 font-medium">
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400">Kelas:</span>
                <strong className="text-slate-800">{currentClass?.name || 'PAI AL 5'}</strong>
              </span>
              <span className="inline-flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <span className="text-slate-400">Kelompok:</span>
                <strong className="text-slate-800">{group.name}</strong>
              </span>
              <div className="inline-flex items-center gap-2 bg-blue-50/80 px-3 py-1.5 rounded-lg border border-blue-200">
                <span className="text-blue-700 font-semibold">Room Code:</span>
                <span className="font-mono font-bold text-blue-900 tracking-wider">
                  {group.room_code}
                </span>
                <button
                  type="button"
                  onClick={copyRoomCode}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 ml-1 cursor-pointer"
                  title="Salin Room Code"
                >
                  {copiedCode ? '✓ Disalin' : 'Salin'}
                </button>
              </div>
            </div>
          </div>

          {/* Meeting Selector */}
          <div className="flex flex-col items-start md:items-end gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pilih Pertemuan
            </label>
            <select
              value={selectedMeetingId}
              onChange={(e) => onSelectMeeting(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-1 focus:ring-slate-900"
            >
              {meetings.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REQUIREMENT 40: "Apa yang harus saya kerjakan sekarang?" PROMINENT CALL TO ACTION */}
      {nextAction ? (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 text-white shadow-md border border-slate-700">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold tracking-wider uppercase border border-blue-400/30">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                LANGKAH BERIKUTNYA
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {nextAction.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {nextAction.description}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToPractice(nextAction.stage)}
              className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 shrink-0 cursor-pointer"
            >
              <span>{nextAction.buttonText}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      ) : (
        /* READY FOR PRESENTATION CELEBRATION BANNER (Requirement 27) */
        <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-700 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🎯
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 block">
                3/3 LATIHAN SELESAI &bull; KELENGKAPAN 100%
              </span>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                SIAP PRESENTASI!
              </h2>
              <p className="text-sm text-emerald-100 max-w-2xl leading-relaxed">
                Selamat! Anda telah menyelesaikan seluruh rangkaian: Latihan Mandiri, Latihan Bersama Kelompok, dan Simulasi di Kelas. Dosen dapat melihat bukti kesiapan Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToPractice(3)}
              className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Lihat Ringkasan Latihan
            </button>
          </div>
        </div>
      )}

      {/* GRID: PROGRESS SAYA & SHORTCUT KASUS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PROGRESS SAYA (2 cols on desktop) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">PROGRESS SAYA</h3>
              <p className="text-xs text-slate-500">
                {activeMeeting?.title || 'Pertemuan 1'}
              </p>
            </div>
            {myProgress && (
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {myProgress.completed_stages} dari 3 latihan selesai
              </span>
            )}
          </div>

          {/* Visual Progress Bar */}
          {myProgress && (
            <div className="mb-6">
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    myProgress.completed_stages === 3
                      ? 'bg-emerald-500'
                      : myProgress.completed_stages === 2
                      ? 'bg-blue-600'
                      : myProgress.completed_stages === 1
                      ? 'bg-amber-500'
                      : 'bg-slate-300'
                  }`}
                  style={{ width: `${(myProgress.completed_stages / 3) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* 3 Stages Checklist */}
          {myProgress && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Latihan 1 Box */}
              <div
                onClick={() => onNavigateToPractice(1)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                  myProgress.latihan1.is_complete
                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Latihan Mandiri</span>
                  {myProgress.latihan1.is_complete ? (
                    <span className="text-xs font-bold text-emerald-700">✅ Selesai</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">○ Belum</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Audio rekaman, mendengarkan, evaluasi diri privat.
                </p>
              </div>

              {/* Latihan 2 Box */}
              <div
                onClick={() => onNavigateToPractice(2)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                  myProgress.latihan2.is_complete
                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Latihan Kelompok</span>
                  {myProgress.latihan2.is_complete ? (
                    <span className="text-xs font-bold text-emerald-700">✅ Selesai</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">○ Belum</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Di luar jam kuliah, peer assessment, bukti diskusi.
                </p>
              </div>

              {/* Latihan 3 Box */}
              <div
                onClick={() => onNavigateToPractice(3)}
                className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                  myProgress.latihan3.is_complete
                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-50'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700">Simulasi Kelas</span>
                  {myProgress.latihan3.is_complete ? (
                    <span className="text-xs font-bold text-emerald-700">✅ Selesai</span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400">○ Belum</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Simulasi jam kuliah, penilaian teman, refleksi akhir.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* KASUS & SCAFFOLDING CARD SHORTCUT */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Referensi Latihan
            </span>
            <h3 className="text-base font-bold text-slate-900 mb-2">
              Kasus & Scaffolding Pertanyaan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Gunakan pertanyaan penuntun (scaffolding) sebagai acuan saat menjelaskan dan merekam presentasi Anda.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToCase}
            className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Buka Kasus & Scaffolding</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* REQUIREMENT 10: DASHBOARD KELOMPOK (Cards seluruh anggota kelompok) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">DASHBOARD KELOMPOK</h3>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {group.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Pantau status penyelesaian tahap seluruh anggota. Data evaluasi mandiri Latihan 1 tetap bersifat privat.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            <div className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
              Total Anggota: <strong className="text-slate-800">{groupStudents.length} orang</strong>
            </div>
            <button
              type="button"
              onClick={() => setShowAddMember(!showAddMember)}
              className="text-xs font-bold px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>+ Tambah Anggota</span>
            </button>
          </div>
        </div>

        {/* Add Member Form */}
        {showAddMember && (
          <form onSubmit={handleAddMemberSubmit} className="mb-6 p-4 bg-blue-50/60 rounded-xl border border-blue-200 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
              Tambah Anggota Baru ke Kelompok {group.name}
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Masukkan nama lengkap anggota baru..."
                className="flex-1 px-3.5 py-2 bg-white rounded-lg border border-slate-300 text-xs sm:text-sm font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Simpan Anggota
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddMember(false);
                    setNewMemberName('');
                  }}
                  className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Batal
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Anggota yang ditambahkan akan langsung terdaftar di kelompok ini dan dapat masuk menggunakan Room Code: <strong>{group.room_code}</strong>.
            </p>
          </form>
        )}

        {/* Member Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {membersProgress.map(({ member, progress }) => {
            const isMe = member.id === student.id;
            const completedCount = progress?.completed_stages || 0;
            const isReady = progress?.is_ready || false;

            return (
              <div
                key={member.id}
                className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                  isMe
                    ? 'bg-blue-50/40 border-blue-200 ring-1 ring-blue-300/60'
                    : 'bg-slate-50/60 border-slate-200'
                }`}
              >
                <div>
                  {/* Member Name */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight">
                      {member.name.toUpperCase()}
                      {isMe && (
                        <span className="ml-1.5 text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                          Anda
                        </span>
                      )}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      {completedCount}/3
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium block mb-2">
                    {activeMeeting?.title.split(':')[0] || 'Pertemuan 1'}
                  </span>

                  {/* Stage Completion Checklist */}
                  <div className="space-y-1.5 mb-4 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Latihan 1 Mandiri</span>
                      <span className={progress?.latihan1.is_complete ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {progress?.latihan1.is_complete ? '✓' : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Latihan 2 Kelompok</span>
                      <span className={progress?.latihan2.is_complete ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {progress?.latihan2.is_complete ? '✓' : '—'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Latihan 3 Simulasi</span>
                      <span className={progress?.latihan3.is_complete ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                        {progress?.latihan3.is_complete ? '✓' : '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400">Status:</span>
                  {isReady ? (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      SIAP PRESENTASI
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {3 - completedCount} tahap lagi
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>
            <strong>Aturan Privasi:</strong> Refleksi diri Latihan 1 anggota lain tidak dapat diakses untuk menjaga objektivitas dan kenyamanan proses latihan mandiri.
          </span>
        </div>
      </div>
    </div>
  );
};
