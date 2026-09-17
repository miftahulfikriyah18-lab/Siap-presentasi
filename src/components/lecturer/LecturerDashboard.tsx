import React, { useState } from 'react';
import { Lecturer, ClassItem, Meeting, Group, Student, StudentMeetingProgress } from '../../types';
import { storageService } from '../../lib/storage';
import { StatusBadge } from '../common/ProgressBadge';

interface LecturerDashboardProps {
  lecturer: Lecturer;
  classes: ClassItem[];
  meetings: Meeting[];
  selectedClassId: string;
  selectedMeetingId: string;
  onSelectClass: (id: string) => void;
  onSelectMeeting: (id: string) => void;
}

export const LecturerDashboard: React.FC<LecturerDashboardProps> = ({
  lecturer,
  classes,
  meetings,
  selectedClassId,
  selectedMeetingId,
  onSelectClass,
  onSelectMeeting,
}) => {
  const [activeTab, setActiveTab] = useState<'monitoring' | 'incomplete_tracker'>('monitoring');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'incomplete' | 'not_started'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Detail Modal for a specific student
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<Student | null>(null);

  // Group evidence modal
  const [selectedGroupEvidenceModal, setSelectedGroupEvidenceModal] = useState<Group | null>(null);

  const activeMeeting = meetings.find((m) => m?.id === selectedMeetingId) || meetings[0];
  const groupsInClass = selectedClassId ? storageService.getGroupsByClassId(selectedClassId) : [];

  // Gather all students in class
  const allStudentsInClass: { student: Student; group: Group; progress: StudentMeetingProgress }[] = [];
  groupsInClass.forEach((grp) => {
    if (!grp?.id) return;
    const stds = storageService.getStudentsByGroupId(grp.id);
    stds.forEach((s) => {
      if (!s?.id) return;
      const prog = storageService.calculateStudentProgress(s.id, activeMeeting?.id || '');
      allStudentsInClass.push({ student: s, group: grp, progress: prog });
    });
  });

  // Filter students based on status and search
  const filteredStudents = allStudentsInClass.filter(({ student, group, progress }) => {
    // Search
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.room_code.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Status filter
    if (statusFilter === 'ready') return progress.is_ready;
    if (statusFilter === 'incomplete') return progress.completed_stages > 0 && !progress.is_ready;
    if (statusFilter === 'not_started') return progress.completed_stages === 0;

    return true;
  });

  // Calculate high-level stats
  const totalStudents = allStudentsInClass.length;
  const readyStudents = allStudentsInClass.filter((item) => item.progress.is_ready).length;
  const inProgressStudents = allStudentsInClass.filter(
    (item) => item.progress.completed_stages > 0 && !item.progress.is_ready
  ).length;
  const notStartedStudents = allStudentsInClass.filter(
    (item) => item.progress.completed_stages === 0
  ).length;

  // Incomplete list for Requirement 35
  const incompleteList = storageService.getIncompleteTasks(selectedClassId, activeMeeting?.id || '');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block mb-1">
              Portal Monitoring Dosen Pengampu
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {lecturer.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Pantau progres latihan bertahap, link rekaman mahasiswa, dan verifikasi kesiapan presentasi kelompok.
            </p>
          </div>

          {/* Selectors: Class & Meeting */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Kelas</label>
              <select
                value={selectedClassId}
                onChange={(e) => onSelectClass(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Pertemuan</label>
              <select
                value={selectedMeetingId}
                onChange={(e) => onSelectMeeting(e.target.value)}
                className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
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
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Total Mahasiswa
          </span>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {totalStudents} <span className="text-xs font-medium text-slate-400">orang</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Terbagi dalam {groupsInClass.length} kelompok
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
            Siap Presentasi (3/3)
          </span>
          <div className="text-2xl sm:text-3xl font-black text-emerald-950 mt-1">
            {readyStudents}{' '}
            <span className="text-xs font-medium text-emerald-700">
              ({totalStudents > 0 ? Math.round((readyStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            L1, L2, & L3 lengkap
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            Sedang Berproses
          </span>
          <div className="text-2xl sm:text-3xl font-black text-amber-950 mt-1">
            {inProgressStudents}{' '}
            <span className="text-xs font-medium text-amber-700">
              ({totalStudents > 0 ? Math.round((inProgressStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            1 atau 2 tahap selesai
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs">
          <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">
            Belum Mulai
          </span>
          <div className="text-2xl sm:text-3xl font-black text-rose-950 mt-1">
            {notStartedStudents}{' '}
            <span className="text-xs font-medium text-rose-700">
              ({totalStudents > 0 ? Math.round((notStartedStudents / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">
            Belum ada submission
          </span>
        </div>
      </div>

      {/* TABS NAVIGATION: MONITORING vs DAFTAR BELUM LENGKAP */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveTab('monitoring')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'monitoring'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>1. Monitoring Kelompok & Mahasiswa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('incomplete_tracker')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'incomplete_tracker'
              ? 'bg-rose-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>2. Daftar Belum Lengkap (Tindak Lanjut)</span>
          {incompleteList.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[11px]">
              {incompleteList.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MONITORING VIEW */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mahasiswa / kelompok..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-slate-900 focus:border-slate-900"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3 top-2.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
              {[
                { val: 'all', label: 'Semua Status' },
                { val: 'ready', label: 'Siap Presentasi' },
                { val: 'incomplete', label: 'Belum Lengkap' },
                { val: 'not_started', label: 'Belum Mulai' },
              ].map((pill) => (
                <button
                  key={pill.val}
                  type="button"
                  onClick={() => setStatusFilter(pill.val as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === pill.val
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* GROUPS ACCORDION LIST */}
          <div className="space-y-6">
            {groupsInClass.map((group) => {
              if (!group?.id) return null;
              const studentsInGrp = allStudentsInClass.filter((item) => item.group?.id === group.id);
              const groupReadyCount = studentsInGrp.filter((item) => item.progress.is_ready).length;
              const evidenceL2 = storageService.getGroupEvidence(group.id, activeMeeting?.id || '', 2);
              const evidenceL3 = storageService.getGroupEvidence(group.id, activeMeeting?.id || '', 3);

              return (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* Group Header Card */}
                  <div className="p-6 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-black text-slate-900">{group.name}</h3>
                        <span className="font-mono text-xs font-bold text-blue-900 bg-blue-100 px-2 py-0.5 rounded-md">
                          Code: {group.room_code}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                        <span>
                          Kesiapan: <strong>{groupReadyCount} dari {studentsInGrp.length}</strong> mahasiswa siap
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <span>Bukti Latihan 2:</span>
                          {evidenceL2 ? (
                            <a
                              href={evidenceL2.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              ✓ Ada ({evidenceL2.mode === 'tatap_muka' ? 'Tatap Muka' : 'Online'})
                            </a>
                          ) : (
                            <span className="text-rose-600 font-semibold">Belum Diunggah</span>
                          )}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <span>Bukti Simulasi L3:</span>
                          {evidenceL3 ? (
                            <a
                              href={evidenceL3.evidence_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-700 font-bold hover:underline"
                            >
                              ✓ Ada
                            </a>
                          ) : (
                            <span className="text-rose-600 font-semibold">Belum Diunggah</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedGroupEvidenceModal(group)}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Lihat Bukti Kelompok
                    </button>
                  </div>

                  {/* Student Rows Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="px-5 py-3">Nama Mahasiswa</th>
                          <th className="px-5 py-3">Latihan 1 (Mandiri)</th>
                          <th className="px-5 py-3">Latihan 2 (Kelompok)</th>
                          <th className="px-5 py-3">Latihan 3 (Simulasi)</th>
                          <th className="px-5 py-3">Refleksi Akhir</th>
                          <th className="px-5 py-3">Status Kesiapan</th>
                          <th className="px-5 py-3 text-right">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentsInGrp.map(({ student, progress }) => {
                          const audioL1 = storageService.getAudioSubmission(student.id, activeMeeting?.id || '', 1);
                          const audioL2 = storageService.getAudioSubmission(student.id, activeMeeting?.id || '', 2);
                          const audioL3 = storageService.getAudioSubmission(student.id, activeMeeting?.id || '', 3);

                          return (
                            <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                              {/* Name */}
                              <td className="px-5 py-3.5 font-bold text-slate-900">
                                <div>{student.name}</div>
                                <span className="text-[10px] text-slate-400 font-normal">
                                  {student.is_activated ? 'Aktif' : 'Belum Aktivasi'}
                                </span>
                              </td>

                              {/* Latihan 1 */}
                              <td className="px-5 py-3.5">
                                {progress.latihan1.is_complete ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                      ✓ Lengkap
                                    </span>
                                    {audioL1?.drive_url && (
                                      <a
                                        href={audioL1.drive_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-[11px] text-blue-600 hover:underline"
                                      >
                                        Buka Audio Drive
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Belum Selesai</span>
                                )}
                              </td>

                              {/* Latihan 2 */}
                              <td className="px-5 py-3.5">
                                {progress.latihan2.is_complete ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                      ✓ Lengkap
                                    </span>
                                    {audioL2?.drive_url && (
                                      <a
                                        href={audioL2.drive_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-[11px] text-blue-600 hover:underline"
                                      >
                                        Buka Audio Drive
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">
                                    {progress.latihan2.has_audio ? 'Peer review belum lengkap' : 'Belum Selesai'}
                                  </span>
                                )}
                              </td>

                              {/* Latihan 3 */}
                              <td className="px-5 py-3.5">
                                {progress.latihan3.is_complete ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                                      ✓ Lengkap
                                    </span>
                                    {audioL3?.drive_url && (
                                      <a
                                        href={audioL3.drive_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="block text-[11px] text-blue-600 hover:underline"
                                      >
                                        Buka Audio Drive
                                      </a>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-slate-400">Belum Selesai</span>
                                )}
                              </td>

                              {/* Refleksi Akhir */}
                              <td className="px-5 py-3.5">
                                {progress.latihan3.has_final_reflection ? (
                                  <span className="text-emerald-700 font-semibold">✓ Diisi</span>
                                ) : (
                                  <span className="text-slate-400">—</span>
                                )}
                              </td>

                              {/* Status */}
                              <td className="px-5 py-3.5">
                                {progress.is_ready ? (
                                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-full font-black text-[11px]">
                                    SIAP PRESENTASI
                                  </span>
                                ) : (
                                  <span className="inline-block px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full font-bold text-[11px]">
                                    {progress.completed_stages}/3 Selesai
                                  </span>
                                )}
                              </td>

                              {/* Action */}
                              <td className="px-5 py-3.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedStudentForModal(student)}
                                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer"
                                >
                                  Detail
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INCOMPLETE TRACKER (Requirement 35) */}
      {activeTab === 'incomplete_tracker' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-black text-slate-900">
              FITUR "BELUM LENGKAP" — DAFTAR KENDALA & TUGAS TERTUNDA
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Memudahkan Dosen Pengampu untuk mengidentifikasi mahasiswa atau kelompok yang belum memenuhi kewajiban latihan bertahap sebelum hari pelaksanaan presentasi.
            </p>
          </div>

          {incompleteList.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold text-xl">
                ✓
              </div>
              <h4 className="text-base font-bold text-slate-900">Semua Latihan Lengkap!</h4>
              <p className="text-xs text-slate-500">
                Seluruh mahasiswa di kelas ini telah menyelesaikan Latihan 1, 2, 3 dan refleksi akhir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {incompleteList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{item.student_name}</span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {item.group_name}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-rose-700">
                      Kendala: {item.task_description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const st = storageService.getStudentById(item.student_id);
                      if (st) setSelectedStudentForModal(st);
                    }}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0 self-start sm:self-auto"
                  >
                    Periksa Mahasiswa
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* STUDENT DETAIL MODAL FOR LECTURER */}
      {selectedStudentForModal && (
        <StudentDetailLecturerModal
          student={selectedStudentForModal}
          meeting={activeMeeting}
          onClose={() => setSelectedStudentForModal(null)}
        />
      )}

      {/* GROUP EVIDENCE MODAL */}
      {selectedGroupEvidenceModal && (
        <GroupEvidenceLecturerModal
          group={selectedGroupEvidenceModal}
          meeting={activeMeeting}
          onClose={() => setSelectedGroupEvidenceModal(null)}
        />
      )}
    </div>
  );
};

// Sub-component: Student Detail Modal for Lecturer
interface StudentDetailModalProps {
  student: Student;
  meeting: Meeting;
  onClose: () => void;
}

const StudentDetailLecturerModal: React.FC<StudentDetailModalProps> = ({
  student,
  meeting,
  onClose,
}) => {
  if (!student || !meeting) return null;
  const audioL1 = storageService.getAudioSubmission(student.id, meeting.id, 1);
  const audioL2 = storageService.getAudioSubmission(student.id, meeting.id, 2);
  const audioL3 = storageService.getAudioSubmission(student.id, meeting.id, 3);

  const selfAss = storageService.getSelfAssessment(student.id, meeting.id);
  const peerAssReceivedL2 = storageService.getPeerAssessmentsReceivedByStudent(student.id, meeting.id, 2);
  const peerAssReceivedL3 = storageService.getPeerAssessmentsReceivedByStudent(student.id, meeting.id, 3);
  const finalRef = storageService.getFinalReflection(student.id, meeting.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-400 block mb-1">
              Verifikasi Dosen Pengampu
            </span>
            <h3 className="text-lg font-bold">{student.name}</h3>
            <span className="text-xs text-slate-300">{meeting.title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Audio Links */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm">Tautan Audio Rekaman di Google Drive</h4>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span>Latihan 1 (Mandiri):</span>
                <div className="flex items-center gap-2">
                  {audioL1?.drive_url ? (
                    <a href={audioL1.drive_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      Buka Audio L1 ↗
                    </a>
                  ) : (
                    <span className="text-rose-500 font-semibold">Belum ada audio</span>
                  )}
                  {audioL1?.photo_url && (
                    <a href={audioL1.photo_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Lihat Foto Bukti 📷
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Latihan 2 (Kelompok):</span>
                <div className="flex items-center gap-2">
                  {audioL2?.drive_url ? (
                    <a href={audioL2.drive_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      Buka Audio L2 ↗
                    </a>
                  ) : (
                    <span className="text-rose-500 font-semibold">Belum ada audio</span>
                  )}
                  {audioL2?.photo_url && (
                    <a href={audioL2.photo_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Lihat Foto Bukti 📷
                    </a>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Latihan 3 (Simulasi Kelas):</span>
                <div className="flex items-center gap-2">
                  {audioL3?.drive_url ? (
                    <a href={audioL3.drive_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      Buka Audio L3 ↗
                    </a>
                  ) : (
                    <span className="text-rose-500 font-semibold">Belum ada audio</span>
                  )}
                  {audioL3?.photo_url && (
                    <a href={audioL3.photo_url} target="_blank" rel="noreferrer" className="text-emerald-600 font-bold hover:underline text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Lihat Foto Bukti 📷
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Self-Assessment L1 (Privat - Dosen can view) */}
          <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-blue-950 text-sm">Evaluasi Diri Latihan 1 (Privat)</h4>
              <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-bold">
                Akses Khusus Dosen
              </span>
            </div>
            {selfAss ? (
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-500">Mendengarkan rekaman sendiri:</span>{' '}
                  <strong className="text-slate-900">{selfAss.listened_to_audio ? '✓ Ya, sudah' : 'Tidak'}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Ketergantungan teks:</span>{' '}
                  <strong className="text-slate-900">{selfAss.text_dependency}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kelancaran:</span>{' '}
                  <strong className="text-slate-900">{selfAss.fluency}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Pemahaman kasus:</span>{' '}
                  <strong className="text-slate-900">{selfAss.case_understanding}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Menjawab scaffolding:</span>{' '}
                  <strong className="text-slate-900">{selfAss.scaffolding_mastery}</strong>
                </div>
                <div className="mt-2 pt-2 border-t border-blue-200/60">
                  <span className="font-bold text-slate-800 block mb-0.5">Catatan Perbaikan Mandiri:</span>
                  <p className="bg-white p-2.5 rounded-lg border border-blue-200 text-slate-800 italic">
                    "{selfAss.improvement_note}"
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">Belum mengisi evaluasi diri.</p>
            )}
          </div>

          {/* Feedback Diterima dari Teman */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-extrabold text-slate-900 text-sm">
              Feedback yang Diterima dari Teman Kelompok
            </h4>

            {peerAssReceivedL2.length === 0 && peerAssReceivedL3.length === 0 ? (
              <p className="text-slate-500">Belum ada feedback dari teman kelompok.</p>
            ) : (
              <div className="space-y-3">
                {peerAssReceivedL2.map((p) => {
                  const rev = storageService.getStudentById(p.reviewer_student_id);
                  return (
                    <div key={p.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Dari: {rev?.name || 'Teman'} (Latihan 2)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Kejelasan: {p.clarity}</span>
                      </div>
                      <p className="text-emerald-800 font-medium">✓ Positif: "{p.positive_feedback}"</p>
                      <p className="text-amber-800 font-medium">△ Saran: "{p.improvement_feedback}"</p>
                    </div>
                  );
                })}

                {peerAssReceivedL3.map((p) => {
                  const rev = storageService.getStudentById(p.reviewer_student_id);
                  return (
                    <div key={p.id} className="p-3 bg-white rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Dari: {rev?.name || 'Teman'} (Latihan 3 Final)</span>
                        <span className="text-[10px] text-slate-500 font-mono">Kejelasan: {p.clarity}</span>
                      </div>
                      <p className="text-emerald-800 font-medium">✓ Positif: "{p.positive_feedback}"</p>
                      <p className="text-amber-800 font-medium">△ Saran: "{p.improvement_feedback}"</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Refleksi Akhir */}
          {finalRef && (
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-2">
              <h4 className="font-extrabold text-emerald-950 text-sm">Refleksi Akhir Mahasiswa</h4>
              <div className="space-y-1.5 pt-1">
                <div>
                  <span className="text-slate-500">Tingkat Kesiapan:</span>{' '}
                  <strong className="text-emerald-800 uppercase font-black">{finalRef.readiness_level}</strong>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">Perkembangan yang dirasakan:</span>
                  <p className="bg-white p-2 rounded border border-emerald-200">{finalRef.progress_felt}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">Bagian yang dikuasai:</span>
                  <p className="bg-white p-2 rounded border border-emerald-200">{finalRef.mastered_parts}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-700 block">Fokus hari-H:</span>
                  <p className="bg-white p-2 rounded border border-emerald-200">{finalRef.focus_parts}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-component: Group Evidence Modal for Lecturer
interface GroupEvidenceModalProps {
  group: Group;
  meeting: Meeting;
  onClose: () => void;
}

const GroupEvidenceLecturerModal: React.FC<GroupEvidenceModalProps> = ({
  group,
  meeting,
  onClose,
}) => {
  if (!group || !meeting) return null;
  const evL2 = storageService.getGroupEvidence(group.id, meeting.id, 2);
  const evL3 = storageService.getGroupEvidence(group.id, meeting.id, 3);
  const students = storageService.getStudentsByGroupId(group.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        <div className="p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-lg font-bold">Bukti Kegiatan: {group.name}</h3>
            <span className="text-xs text-slate-300">{meeting.title}</span>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700">
          {/* Latihan 2 Evidence */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm">Bukti Latihan 2 (Di Luar Jam Kuliah)</h4>
            {evL2 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Waktu & Tanggal:</span>
                  <strong>{evL2.date} ({evL2.time})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Mode & Tempat:</span>
                  <strong>{evL2.mode === 'tatap_muka' ? 'Tatap Muka' : 'Online'} - {evL2.location_or_media}</strong>
                </div>
                {evL2.evidence_url && (
                  <div className="flex justify-between">
                    <span>Tautan Google Drive:</span>
                    <a href={evL2.evidence_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      Buka File Bukti ↗
                    </a>
                  </div>
                )}
                {evL2.photo_url && (
                  <div className="pt-2">
                    <span className="font-semibold text-slate-800 block mb-1">Foto Bukti Kegiatan:</span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white max-h-56 flex items-center justify-center">
                      <img
                        src={evL2.photo_url}
                        alt="Foto Bukti Latihan 2"
                        className="max-h-56 w-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-0.5">Kehadiran Anggota:</span>
                  <div className="flex flex-wrap gap-2">
                    {students.map((s) => (
                      <span
                        key={s.id}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          evL2.attendance?.[s.id] ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {s.name}: {evL2.attendance?.[s.id] ? 'Hadir' : 'Tidak Hadir'}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-0.5">Catatan Kelompok:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 italic">"{evL2.discussion_note}"</p>
                </div>
              </div>
            ) : (
              <p className="text-rose-600 font-semibold">Bukti Latihan 2 belum diisi.</p>
            )}
          </div>

          {/* Latihan 3 Evidence */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm">Bukti Latihan 3 (Simulasi di Kelas)</h4>
            {evL3 ? (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span>Waktu & Tanggal:</span>
                  <strong>{evL3.date} ({evL3.time})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Tempat:</span>
                  <strong>{evL3.location_or_media}</strong>
                </div>
                {evL3.evidence_url && (
                  <div className="flex justify-between">
                    <span>Tautan Google Drive:</span>
                    <a href={evL3.evidence_url} target="_blank" rel="noreferrer" className="text-blue-600 font-bold hover:underline">
                      Buka File Bukti ↗
                    </a>
                  </div>
                )}
                {evL3.photo_url && (
                  <div className="pt-2">
                    <span className="font-semibold text-slate-800 block mb-1">Foto Bukti Simulasi Kelas:</span>
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white max-h-56 flex items-center justify-center">
                      <img
                        src={evL3.photo_url}
                        alt="Foto Bukti Latihan 3"
                        className="max-h-56 w-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-0.5">Catatan Kelompok:</span>
                  <p className="bg-white p-2.5 rounded border border-slate-200 italic">"{evL3.discussion_note}"</p>
                </div>
              </div>
            ) : (
              <p className="text-rose-600 font-semibold">Bukti Latihan 3 belum diisi.</p>
            )}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
