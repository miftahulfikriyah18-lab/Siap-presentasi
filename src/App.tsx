import React, { useState, useEffect } from 'react';
import { Role, Student, Group, Lecturer, ClassItem, Meeting } from './types';
import { storageService } from './lib/storage';
import { Navbar } from './components/common/Navbar';
import { LandingPage } from './components/auth/LandingPage';
import { StudentAuthModal } from './components/auth/StudentAuthModal';
import { LecturerAuthModal } from './components/auth/LecturerAuthModal';
import { StudentDashboard } from './components/student/StudentDashboard';
import { CaseScaffoldingView } from './components/student/CaseScaffoldingView';
import { Latihan1Form } from './components/student/Latihan1Form';
import { Latihan2Form } from './components/student/Latihan2Form';
import { Latihan3Form } from './components/student/Latihan3Form';
import { StudentProgressView } from './components/student/StudentProgressView';
import { LecturerDashboard } from './components/lecturer/LecturerDashboard';

export default function App() {
  // Authentication & Session State
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [currentLecturer, setCurrentLecturer] = useState<Lecturer | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Academic contexts with immediate storage initialization
  const [classes, setClasses] = useState<ClassItem[]>(() => {
    storageService.init();
    return storageService.getClasses();
  });
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    storageService.init();
    return storageService.getMeetings();
  });
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    const cls = storageService.getClasses();
    return cls.length > 0 ? cls[0].id : '';
  });
  const [selectedMeetingId, setSelectedMeetingId] = useState<string>(() => {
    const mts = storageService.getMeetings();
    return mts.length > 0 ? mts[0].id : '';
  });

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isLecturerModalOpen, setIsLecturerModalOpen] = useState(false);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data from storage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const loadedClasses = storageService.getClasses();
    const loadedMeetings = storageService.getMeetings();
    setClasses(loadedClasses);
    setMeetings(loadedMeetings);

    if (loadedClasses.length > 0 && (!selectedClassId || !loadedClasses.some((c) => c?.id === selectedClassId))) {
      setSelectedClassId(loadedClasses[0].id);
    }
    if (loadedMeetings.length > 0 && (!selectedMeetingId || !loadedMeetings.some((m) => m?.id === selectedMeetingId))) {
      setSelectedMeetingId(loadedMeetings[0].id);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Login Handlers
  const handleStudentLoginSuccess = (student: Student, group: Group) => {
    setCurrentStudent(student);
    setCurrentGroup(group);
    setCurrentRole('student');
    setIsStudentModalOpen(false);
    setActiveTab('dashboard');
    showToast(`Selamat datang, ${student.name}!`);
  };

  const handleLecturerLoginSuccess = (lecturer: Lecturer) => {
    setCurrentLecturer(lecturer);
    setCurrentRole('lecturer');
    setIsLecturerModalOpen(false);
    setActiveTab('lecturer-dashboard');
    showToast(`Selamat datang di Portal Dosen, ${lecturer.name}`);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setCurrentStudent(null);
    setCurrentGroup(null);
    setCurrentLecturer(null);
    setActiveTab('dashboard');
    showToast('Anda telah keluar.');
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset seluruh data ke kondisi awal demo Kimia Organik?')) {
      storageService.resetToDemo();
      loadData();
      showToast('Data demo berhasil direset ke kondisi awal.');
    }
  };

  // Current Class & Meeting Objects
  const currentClass = classes.find((c) => c?.id === selectedClassId) || classes[0];
  const currentMeeting = meetings.find((m) => m?.id === selectedMeetingId) || meetings[0];
  const questions = storageService.getQuestions();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans antialiased">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 animate-in slide-in-from-top-4 duration-200">
          <div className="px-4 py-3 bg-slate-900 text-white text-xs font-bold rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentRole={currentRole}
        currentStudent={currentStudent}
        currentGroup={currentGroup}
        currentLecturer={currentLecturer}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          if (tab === 'latihan') {
            // Determine active practice stage for student
            if (currentStudent && currentMeeting) {
              const prog = storageService.calculateStudentProgress(currentStudent.id, currentMeeting.id);
              if (!prog.latihan1.is_complete) setActiveTab('latihan1');
              else if (!prog.latihan2.is_complete) setActiveTab('latihan2');
              else setActiveTab('latihan3');
            } else {
              setActiveTab('latihan1');
            }
          } else {
            setActiveTab(tab);
          }
        }}
        onLogout={handleLogout}
        onResetDemo={handleResetDemo}
      />

      {/* Quick Role & Evaluator Switcher Bar (Discreet sticky floating bar for easy demo testing) */}
      <div className="bg-slate-900/90 text-slate-300 text-[11px] px-4 py-1.5 border-b border-slate-800 flex items-center justify-between overflow-x-auto">
        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-emerald-400 font-bold uppercase text-[10px]">
            Mode Cepat Demo:
          </span>
          <button
            type="button"
            onClick={() => {
              const grp = storageService.getGroupByRoomCode('KIM-7AX29') || storageService.getGroups()[0];
              if (grp) {
                const fikri =
                  storageService.getStudentById('std-fikri') ||
                  storageService.getStudentById('std-2') ||
                  storageService.getStudentsByGroupId(grp.id)[1];
                if (fikri) handleStudentLoginSuccess(fikri, grp);
              }
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              currentStudent?.id === 'std-2' || currentStudent?.id === 'std-fikri'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Mahasiswa (Fikri)
          </button>
          <button
            type="button"
            onClick={() => {
              const grp = storageService.getGroupByRoomCode('KIM-7AX29') || storageService.getGroups()[0];
              if (grp) {
                const aisyah =
                  storageService.getStudentById('std-aisyah') ||
                  storageService.getStudentById('std-1') ||
                  storageService.getStudentsByGroupId(grp.id)[0];
                if (aisyah) handleStudentLoginSuccess(aisyah, grp);
              }
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              currentStudent?.id === 'std-1' || currentStudent?.id === 'std-aisyah'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Mahasiswa (Aisyah)
          </button>
          <button
            type="button"
            onClick={() => {
              const grp = storageService.getGroupByRoomCode('KIM-7AX29') || storageService.getGroups()[0];
              if (grp) {
                const ismi =
                  storageService.getStudentById('std-ismi') ||
                  storageService.getStudentById('std-3') ||
                  storageService.getStudentsByGroupId(grp.id)[2];
                if (ismi) handleStudentLoginSuccess(ismi, grp);
              }
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              currentStudent?.id === 'std-3' || currentStudent?.id === 'std-ismi'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Mahasiswa (Ismi)
          </button>
          <button
            type="button"
            onClick={() => {
              handleLecturerLoginSuccess({
                id: 'lec-1',
                username: 'dosen',
                name: 'Prof. Dr. Ir. Hendra Gunawan, M.Sc.',
              });
            }}
            className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
              currentRole === 'lecturer'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            Dosen Pengampu
          </button>
        </div>

        <div className="text-[10px] text-slate-400 shrink-0 ml-4 hidden sm:block">
          Sistem Latihan Bertahap &bull; Bebas AI Suara &bull; Penilaian Reflektif & Peer-Assessment
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* VIEW 1: LANDING PAGE (Role Selection) */}
        {!currentRole && (
          <LandingPage
            onSelectStudent={() => setIsStudentModalOpen(true)}
            onSelectLecturer={() => setIsLecturerModalOpen(true)}
            onQuickDemoStudent={(studentId, groupCode) => {
              const grp = storageService.getGroupByRoomCode(groupCode);
              const st = storageService.getStudentById(studentId);
              if (grp && st) {
                handleStudentLoginSuccess(st, grp);
              }
            }}
            onQuickDemoLecturer={() => {
              handleLecturerLoginSuccess({
                id: 'lec-1',
                username: 'dosen',
                name: 'Prof. Dr. Ir. Hendra Gunawan, M.Sc.',
              });
            }}
          />
        )}

        {/* VIEW 2: STUDENT PORTAL */}
        {currentRole === 'student' && currentStudent && currentGroup && (
          <div>
            {/* SUB-VIEW A: STUDENT DASHBOARD */}
            {(activeTab === 'dashboard' || activeTab === 'kelompok') && (
              <StudentDashboard
                student={currentStudent}
                group={currentGroup}
                currentClass={currentClass}
                meetings={meetings}
                selectedMeetingId={selectedMeetingId}
                onSelectMeeting={(id) => setSelectedMeetingId(id)}
                onNavigateToPractice={(step) => {
                  if (step === 1) setActiveTab('latihan1');
                  else if (step === 2) setActiveTab('latihan2');
                  else setActiveTab('latihan3');
                }}
                onNavigateToCase={() => setActiveTab('kasus')}
              />
            )}

            {/* SUB-VIEW B: KASUS & SCAFFOLDING */}
            {activeTab === 'kasus' && (
              <CaseScaffoldingView
                classId={selectedClassId}
                onSaveSuccess={() => {
                  loadData();
                  showToast('Kasus & Pertanyaan Scaffolding tersimpan.');
                }}
              />
            )}

            {/* SUB-VIEW C: LATIHAN 1 (Mandiri) */}
            {activeTab === 'latihan1' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    ← Kembali ke Dashboard
                  </button>
                </div>
                {currentMeeting ? (
                  <Latihan1Form
                    student={currentStudent}
                    meeting={currentMeeting}
                    questions={questions}
                    onSaveSuccess={() => {
                      showToast('Latihan 1 Mandiri berhasil disimpan!');
                    }}
                    onNextStage={() => setActiveTab('latihan2')}
                  />
                ) : (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                    Memuat data pertemuan...
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW D: LATIHAN 2 (Kelompok) */}
            {activeTab === 'latihan2' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    ← Kembali ke Dashboard
                  </button>
                </div>
                {currentMeeting ? (
                  <Latihan2Form
                    student={currentStudent}
                    group={currentGroup}
                    meeting={currentMeeting}
                    questions={questions}
                    onSaveSuccess={() => {
                      showToast('Progres Latihan 2 berhasil disimpan!');
                    }}
                    onNextStage={() => setActiveTab('latihan3')}
                  />
                ) : (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                    Memuat data pertemuan...
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW E: LATIHAN 3 (Simulasi Kelas & Refleksi Akhir) */}
            {activeTab === 'latihan3' && (
              <div className="max-w-4xl mx-auto">
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('dashboard')}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    ← Kembali ke Dashboard
                  </button>
                </div>
                {currentMeeting ? (
                  <Latihan3Form
                    student={currentStudent}
                    group={currentGroup}
                    meeting={currentMeeting}
                    questions={questions}
                    onSaveSuccess={() => {
                      showToast('Progres Simulasi & Refleksi Akhir tersimpan!');
                    }}
                    onGoToDashboard={() => setActiveTab('dashboard')}
                  />
                ) : (
                  <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                    Memuat data pertemuan...
                  </div>
                )}
              </div>
            )}

            {/* SUB-VIEW F: PERKEMBANGAN SAYA & PROFIL */}
            {(activeTab === 'progress' || activeTab === 'profil') && (
              currentMeeting ? (
                <StudentProgressView
                  student={currentStudent}
                  group={currentGroup}
                  meeting={currentMeeting}
                  onBackToDashboard={() => setActiveTab('dashboard')}
                />
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center text-slate-500">
                  Memuat data pertemuan...
                </div>
              )
            )}
          </div>
        )}

        {/* VIEW 3: LECTURER PORTAL */}
        {currentRole === 'lecturer' && currentLecturer && (
          <div>
            <LecturerDashboard
              lecturer={currentLecturer}
              classes={classes}
              meetings={meetings}
              selectedClassId={selectedClassId}
              selectedMeetingId={selectedMeetingId}
              onSelectClass={(id) => setSelectedClassId(id)}
              onSelectMeeting={(id) => setSelectedMeetingId(id)}
            />
          </div>
        )}
      </main>

      {/* MODALS */}
      <StudentAuthModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onLoginSuccess={handleStudentLoginSuccess}
      />

      <LecturerAuthModal
        isOpen={isLecturerModalOpen}
        onClose={() => setIsLecturerModalOpen(false)}
        onLoginSuccess={handleLecturerLoginSuccess}
      />
    </div>
  );
}
