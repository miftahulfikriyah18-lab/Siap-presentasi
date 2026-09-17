import React, { useState, useEffect } from 'react';
import { Student, Meeting, Group, ScaffoldingQuestion } from '../../types';
import { storageService, validateDriveUrl } from '../../lib/storage';

interface Latihan1FormProps {
  student: Student;
  group?: Group;
  meeting: Meeting;
  questions: ScaffoldingQuestion[];
  onSaveSuccess: () => void;
  onNextStage: () => void;
}

export const Latihan1Form: React.FC<Latihan1FormProps> = ({
  student,
  group: initialGroup,
  meeting,
  questions,
  onSaveSuccess,
  onNextStage,
}) => {
  // Resolve group and peers
  const group = initialGroup || (student?.group_id ? storageService.getGroupById(student.group_id) : undefined);
  const groupStudents = group?.id ? storageService.getStudentsByGroupId(group.id) : [];
  const peersToReview = groupStudents.filter((s) => s.id !== student.id);

  // Active Sub-tab in Latihan 1
  const [activeTab, setActiveTab] = useState<'my_submission' | 'peer_assessment'>('my_submission');

  // Audio link state (Single direct Google Drive link)
  const [singleDriveUrl, setSingleDriveUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Self-assessment state
  const [listenedToAudio, setListenedToAudio] = useState(false);
  const [textDependency, setTextDependency] = useState<
    'membaca_seluruh' | 'membaca_cukup_banyak' | 'hanya_poin' | 'tanpa_membaca' | ''
  >('');
  const [fluency, setFluency] = useState<
    'sering_tersendat' | 'beberapa_tersendat' | 'cukup_lancar' | 'lancar_runtut' | ''
  >('');
  const [caseUnderstanding, setCaseUnderstanding] = useState<
    'belum_paham' | 'paham_sebagian' | 'cukup_paham' | 'paham_runtut' | ''
  >('');
  const [scaffoldingMastery, setScaffoldingMastery] = useState<
    'banyak_belum' | 'sebagian' | 'hampir_seluruh' | 'seluruh_terhubung' | ''
  >('');
  const [improvementNote, setImprovementNote] = useState('');

  const [isSaved, setIsSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Peer Assessment State for Latihan 1 (Without text dependency)
  const [currentPeerIndex, setCurrentPeerIndex] = useState(0);
  const [peerFluency, setPeerFluency] = useState<
    'sering_tersendat' | 'beberapa_tersendat' | 'cukup_lancar' | 'lancar_runtut' | ''
  >('');
  const [peerUnderstanding, setPeerUnderstanding] = useState<
    'belum_paham' | 'paham_sebagian' | 'sudah_paham' | 'paham_menghubungkan' | ''
  >('');
  const [peerScaffolding, setPeerScaffolding] = useState<
    'banyak_belum' | 'sebagian' | 'hampir_seluruh' | 'seluruh_terhubung' | ''
  >('');
  const [peerClarity, setPeerClarity] = useState<
    'sulit_dipahami' | 'sebagian_bingung' | 'cukup_mudah' | 'jelas_runtut' | ''
  >('');
  const [peerPositive, setPeerPositive] = useState('');
  const [peerImprovement, setPeerImprovement] = useState('');
  const [peerNotice, setPeerNotice] = useState('');
  const [peerError, setPeerError] = useState('');

  // Load existing personal submission data
  useEffect(() => {
    if (!student?.id || !meeting?.id) return;
    const existingAudio = storageService.getAudioSubmission(student.id, meeting.id, 1);
    if (existingAudio) {
      setSingleDriveUrl(existingAudio.drive_url || '');
    }

    const existingSa = storageService.getSelfAssessment(student.id, meeting.id);
    if (existingSa) {
      setListenedToAudio(existingSa.listened_to_audio);
      setTextDependency(existingSa.text_dependency);
      setFluency(existingSa.fluency);
      setCaseUnderstanding(existingSa.case_understanding);
      setScaffoldingMastery(existingSa.scaffolding_mastery);
      setImprovementNote(existingSa.improvement_note);
      setIsSaved(true);
    }
  }, [student?.id, meeting?.id]);

  // Load peer assessment data when switching peer
  const currentPeer = peersToReview[currentPeerIndex];
  useEffect(() => {
    if (!student?.id || !meeting?.id || !currentPeer?.id) {
      setPeerFluency('');
      setPeerUnderstanding('');
      setPeerScaffolding('');
      setPeerClarity('');
      setPeerPositive('');
      setPeerImprovement('');
      return;
    }

    const existingReviews = storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 1);
    const existing = existingReviews.find((r) => r.presenter_student_id === currentPeer.id);

    if (existing) {
      setPeerFluency(existing.fluency);
      setPeerUnderstanding(existing.case_understanding);
      setPeerScaffolding(existing.scaffolding_completion);
      setPeerClarity(existing.clarity);
      setPeerPositive(existing.positive_feedback);
      setPeerImprovement(existing.improvement_feedback);
    } else {
      setPeerFluency('');
      setPeerUnderstanding('');
      setPeerScaffolding('');
      setPeerClarity('');
      setPeerPositive('');
      setPeerImprovement('');
    }
    setPeerError('');
    setPeerNotice('');
  }, [student?.id, meeting?.id, currentPeer?.id]);

  // Peer reviews status
  const reviewsGiven = student?.id && meeting?.id
    ? storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 1)
    : [];
  const reviewedPeerIds = new Set(reviewsGiven.map((r) => r.presenter_student_id));
  const allPeersReviewed = peersToReview.length === 0 || peersToReview.every((p) => reviewedPeerIds.has(p.id));

  // Handle Save My Submission
  const handleSubmitMySubmission = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');
    setErrorMessage('');

    // 1. Audio validation
    const val = validateDriveUrl(singleDriveUrl);
    if (!val.isValid) {
      setUrlError(val.message || 'Link rekaman Google Drive belum valid.');
      return;
    }

    // 2. Wajib mendengarkan kembali
    if (!listenedToAudio) {
      setErrorMessage('Anda wajib mencentang konfirmasi telah mendengarkan kembali rekaman latihan sebelum menyimpan evaluasi diri.');
      return;
    }

    // 3. Self-assessment fields validation
    if (!textDependency || !fluency || !caseUnderstanding || !scaffoldingMastery) {
      setErrorMessage('Mohon lengkapi seluruh 4 kriteria evaluasi diri (A sampai D).');
      return;
    }

    if (!improvementNote.trim()) {
      setErrorMessage('Refleksi bagian yang paling perlu diperbaiki wajib diisi.');
      return;
    }

    // Save Audio Submission
    storageService.saveAudioSubmission({
      student_id: student.id,
      meeting_id: meeting.id,
      practice_number: 1,
      recording_mode: 'single',
      drive_url: singleDriveUrl.trim(),
    });

    // Save Self Assessment
    storageService.saveSelfAssessment({
      student_id: student.id,
      meeting_id: meeting.id,
      text_dependency: textDependency,
      fluency: fluency,
      case_understanding: caseUnderstanding,
      scaffolding_mastery: scaffoldingMastery,
      improvement_note: improvementNote.trim(),
      listened_to_audio: true,
    });

    setIsSaved(true);
    onSaveSuccess();

    // If there are peers to review, gently prompt to peer assessment tab
    if (peersToReview.length > 0 && !allPeersReviewed) {
      setActiveTab('peer_assessment');
    }
  };

  // Handle Save Peer Review for Latihan 1
  const handleSavePeerReview = (e: React.FormEvent) => {
    e.preventDefault();
    setPeerError('');
    setPeerNotice('');

    if (!currentPeer) return;

    if (!peerFluency || !peerUnderstanding || !peerScaffolding || !peerClarity) {
      setPeerError('Mohon lengkapi semua 4 indikator penilaian peer-assessment.');
      return;
    }

    if (!peerPositive.trim() || !peerImprovement.trim()) {
      setPeerError('Umpan balik positif dan saran perbaikan wajib diisi.');
      return;
    }

    // Notice: text_dependency is explicitly omitted for Latihan 1 peer review!
    storageService.savePeerAssessment({
      reviewer_student_id: student.id,
      presenter_student_id: currentPeer.id,
      meeting_id: meeting.id,
      practice_number: 1,
      fluency: peerFluency,
      case_understanding: peerUnderstanding,
      scaffolding_completion: peerScaffolding,
      clarity: peerClarity,
      positive_feedback: peerPositive.trim(),
      improvement_feedback: peerImprovement.trim(),
    });

    onSaveSuccess();

    if (currentPeerIndex < peersToReview.length - 1) {
      setPeerNotice(`✓ Penilaian untuk ${currentPeer.name} tersimpan. Melanjutkan ke teman berikutnya...`);
      setTimeout(() => {
        setPeerNotice('');
        setCurrentPeerIndex((prev) => prev + 1);
      }, 600);
    } else {
      setPeerNotice('✓ Seluruh penilaian teman sekelompok Latihan 1 telah selesai!');
    }
  };

  const hasAudioEntered = singleDriveUrl.trim().length > 0;
  const selfAssessmentComplete = Boolean(
    textDependency && fluency && caseUnderstanding && scaffoldingMastery && improvementNote.trim()
  );
  const currentPeerAudio = currentPeer?.id && meeting?.id
    ? storageService.getAudioSubmission(currentPeer.id, meeting.id, 1)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Title & Stage Information */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            TAHAP 1 DARI 3
          </span>
          <span className="text-xs font-bold text-slate-500">
            {meeting.title}
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          LATIHAN 1: Latihan Mandiri & Penilaian Teman
        </h2>

        {/* Access Rules Notice */}
        <div className="my-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-950 flex items-start gap-2.5">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="space-y-1">
            <strong className="font-bold block text-blue-950">Akses Rekaman & Privasi Evaluasi:</strong>
            <p className="text-blue-900 leading-relaxed">
              Link Google Drive rekaman latihan Anda dapat diakses oleh <strong>Dosen</strong> dan <strong>Teman Sekelompok</strong> untuk proses penilaian teman (peer-assessment). Sedangkan evaluasi diri dan catatan refleksi perbaikan Anda bersifat personal untuk pembelajaran mandiri Anda dan dosen.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
          “Lakukan presentasi seolah-olah Anda sedang menjelaskan kasus ini di depan kelas. Rekam presentasi Anda, dengarkan kembali rekaman dari awal sampai akhir, lalu beri penilaian dan masukan untuk rekaman teman sekelompok.”
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('my_submission')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'my_submission'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>1. Rekaman & Evaluasi Diri</span>
          {hasAudioEntered && selfAssessmentComplete && listenedToAudio && (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('peer_assessment')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'peer_assessment'
              ? 'bg-white text-blue-900 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <span>2. Penilaian Teman Sekelompok</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            allPeersReviewed
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {reviewsGiven.length}/{peersToReview.length}
          </span>
        </button>
      </div>

      {/* CEKLIST KELENGKAPAN TAHAP LATIHAN 1 */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
              PANDUAN & VERIFIKASI TAHAP
            </span>
            <h3 className="text-base font-extrabold tracking-tight">
              Ceklist Kelengkapan Latihan 1
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300">
            {[
              hasAudioEntered,
              listenedToAudio,
              selfAssessmentComplete,
              allPeersReviewed,
            ].filter(Boolean).length} / 4 Syarat Terpenuhi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            hasAudioEntered
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              hasAudioEntered ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}>
              {hasAudioEntered ? '✓' : '1'}
            </span>
            <span>Link Rekaman Google Drive</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            listenedToAudio
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              listenedToAudio ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}>
              {listenedToAudio ? '✓' : '2'}
            </span>
            <span>Konfirmasi Dengarkan Rekaman</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            selfAssessmentComplete
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              selfAssessmentComplete ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}>
              {selfAssessmentComplete ? '✓' : '3'}
            </span>
            <span>4 Kriteria Evaluasi & Refleksi Diri</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            allPeersReviewed
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              allPeersReviewed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-slate-400'
            }`}>
              {allPeersReviewed ? '✓' : '4'}
            </span>
            <span>Penilaian Teman ({reviewsGiven.length}/{peersToReview.length})</span>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isSaved && allPeersReviewed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                ✅ LATIHAN 1 LENGKAP
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Rekaman mandiri, evaluasi diri, dan penilaian seluruh teman sekelompok telah lengkap.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNextStage}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Lanjut ke Latihan 2</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* TAB CONTENT 1: REKAMAN MANDIRI & EVALUASI DIRI */}
      {activeTab === 'my_submission' && (
        <form onSubmit={handleSubmitMySubmission} className="space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SECTION A: LINK GOOGLE DRIVE REKAMAN */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                A. LINK GOOGLE DRIVE REKAMAN PRESENTASI
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Unggah rekaman audio/video presentasi mandiri Anda ke Google Drive, lalu tempelkan link tautannya di bawah.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Tautan File Rekaman Google Drive:
                </label>
                {singleDriveUrl && (
                  <a
                    href={singleDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>Uji / Buka Tautan</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <input
                type="url"
                value={singleDriveUrl}
                onChange={(e) => {
                  setSingleDriveUrl(e.target.value);
                  setUrlError('');
                }}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm font-mono"
                required
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Pastikan hak akses link Google Drive telah diatur ke: <strong>"Siapa saja yang memiliki link dapat melihat"</strong> agar dosen dan teman sekelompok dapat mendengarkan rekaman Anda.
              </p>
            </div>

            {urlError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                {urlError}
              </div>
            )}

            {/* MANDATORY CHECKBOX: LISTENED TO AUDIO */}
            <div className="pt-3 border-t border-slate-100">
              <label className="flex items-start gap-3 p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 cursor-pointer hover:bg-blue-50 transition-colors">
                <input
                  type="checkbox"
                  checked={listenedToAudio}
                  onChange={(e) => setListenedToAudio(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                />
                <span className="text-xs sm:text-sm text-slate-800 font-medium">
                  <strong>Saya sudah mendengarkan kembali rekaman latihan saya dari awal sampai selesai.</strong>{' '}
                  <span className="text-slate-500 text-xs block mt-0.5">
                    (Syarat wajib sebelum mengisi evaluasi diri pada Latihan 1).
                  </span>
                </span>
              </label>
            </div>
          </div>

          {/* SECTION B: EVALUASI DIRI (SELF-ASSESSMENT) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-900">
                B. EVALUASI DIRI (SELF-ASSESSMENT)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Berdasarkan hasil mendengarkan rekaman Anda, evaluasilah penampilan mandiri Anda secara objektif.
              </p>
            </div>

            {/* 1. Ketergantungan pada Teks */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                1. Ketergantungan pada Teks
              </label>
              <div className="space-y-2">
                {[
                  { val: 'membaca_seluruh', label: 'Masih membaca hampir seluruh isi presentasi' },
                  { val: 'membaca_cukup_banyak', label: 'Masih membaca cukup banyak' },
                  { val: 'hanya_poin', label: 'Hanya melihat poin penting (sudah mulai mandiri)' },
                  { val: 'tanpa_membaca', label: 'Sudah mampu menjelaskan tanpa membaca teks' },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                      textDependency === item.val
                        ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="text_dependency"
                      value={item.val}
                      checked={textDependency === item.val}
                      onChange={(e) => setTextDependency(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 2. Kelancaran */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                2. Kelancaran Presentasi
              </label>
              <div className="space-y-2">
                {[
                  { val: 'sering_tersendat', label: 'Sering berhenti / tersendat dalam menyampaikan argumen' },
                  { val: 'beberapa_tersendat', label: 'Beberapa kali tersendat, namun dapat melanjutkan' },
                  { val: 'cukup_lancar', label: 'Cukup lancar dengan sedikit jeda berpikir' },
                  { val: 'lancar_runtut', label: 'Sangat lancar dan runtut mengalir' },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                      fluency === item.val
                        ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="fluency"
                      value={item.val}
                      checked={fluency === item.val}
                      onChange={(e) => setFluency(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 3. Pemahaman Kasus */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                3. Pemahaman terhadap Kasus
              </label>
              <div className="space-y-2">
                {[
                  { val: 'belum_paham', label: 'Masih belum paham alur inti permasalahan kasus' },
                  { val: 'paham_sebagian', label: 'Memahami sebagian alur kasus, namun ada poin rancu' },
                  { val: 'cukup_paham', label: 'Cukup memahami masalah dan argumen utama kasus' },
                  { val: 'paham_runtut', label: 'Sangat memahami kasus secara runtut dan mendalam' },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                      caseUnderstanding === item.val
                        ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="case_understanding"
                      value={item.val}
                      checked={caseUnderstanding === item.val}
                      onChange={(e) => setCaseUnderstanding(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 4. Penguasaan Scaffolding */}
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                4. Kemampuan Menjawab Pertanyaan Penuntun (Scaffolding)
              </label>
              <div className="space-y-2">
                {[
                  { val: 'banyak_belum', label: 'Banyak pertanyaan penuntun yang belum terjawab lengkap' },
                  { val: 'sebagian', label: 'Hanya sebagian pertanyaan penuntun yang mampu dijelaskan' },
                  { val: 'hampir_seluruh', label: 'Hampir seluruh pertanyaan penuntun terjawab dengan baik' },
                  { val: 'seluruh_terhubung', label: 'Seluruh pertanyaan penuntun terjawab dan saling terhubung logis' },
                ].map((item) => (
                  <label
                    key={item.val}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                      scaffoldingMastery === item.val
                        ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scaffolding_mastery"
                      value={item.val}
                      checked={scaffoldingMastery === item.val}
                      onChange={(e) => setScaffoldingMastery(e.target.value as any)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Catatan Perbaikan Mandiri */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                5. Refleksi: Bagian yang Paling Perlu Saya Perbaiki
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Tuliskan minimal 1 poin konkret yang akan Anda perbaiki saat latihan bersama kelompok di Latihan 2.
              </p>
              <textarea
                value={improvementNote}
                onChange={(e) => setImprovementNote(e.target.value)}
                rows={3}
                placeholder="Contoh: Saya masih terlalu banyak melihat catatan pada scaffolding poin 3. Pada Latihan 2 nanti, saya akan mencoba menjelaskan dengan kata-kata sendiri tanpa bergantung teks..."
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm"
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4">
            <span className="text-xs text-slate-500">
              {isSaved ? '✓ Data rekaman dan evaluasi diri Anda tersimpan.' : 'Pastikan seluruh isian sudah terisi sebelum menyimpan.'}
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="submit"
                className="flex-1 sm:flex-none px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-extrabold transition-colors shadow-xs cursor-pointer"
              >
                Simpan Rekaman & Evaluasi Diri
              </button>

              {peersToReview.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('peer_assessment')}
                  className="flex-1 sm:flex-none px-4 py-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs sm:text-sm font-extrabold transition-colors cursor-pointer"
                >
                  Lanjut ke Penilaian Teman →
                </button>
              )}
            </div>
          </div>
        </form>
      )}

      {/* TAB CONTENT 2: PENILAIAN TEMAN SEKELOMPOK (PEER ASSESSMENT LATIHAN 1) */}
      {activeTab === 'peer_assessment' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-0.5">
                Peer-Assessment Latihan 1
              </span>
              <h3 className="text-lg font-extrabold text-slate-900">
                Penilaian Teman Sekelompok ({group?.name || 'Kelompok'})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Dengarkan link Google Drive rekaman mandiri teman Anda, lalu berikan feedback dan masukan konstruktif.
              </p>
            </div>

            {/* Peer Stepper Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto self-start sm:self-auto">
              {peersToReview.map((p, idx) => {
                const isReviewed = reviewedPeerIds.has(p.id);
                const isCurrent = idx === currentPeerIndex;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCurrentPeerIndex(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      isCurrent
                        ? 'bg-blue-600 text-white shadow-xs'
                        : isReviewed
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <span>{p.name}</span>
                    {isReviewed && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note about Excluded Text Dependency Instrument in Latihan 1 */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <svg className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong>Keterangan Instrumen Penilaian Latihan 1:</strong>
              <p className="mt-0.5 leading-relaxed text-slate-500">
                Karena pada Latihan 1 mahasiswa berlatih secara mandiri (tidak bertatap muka secara langsung), instrumen <em>ketergantungan pada teks</em> dinilai oleh diri sendiri pada evaluasi mandiri. Penilaian oleh teman sekelompok difokuskan pada kelancaran berbicara, pemahaman kasus, scaffolding, dan kejelasan artikulasi rekaman.
              </p>
            </div>
          </div>

          {peersToReview.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
              Belum ada anggota lain yang terdaftar di kelompok ini. Anda dapat melanjutkan latihan mandiri terlebih dahulu.
            </div>
          ) : currentPeer ? (
            <form onSubmit={handleSavePeerReview} className="space-y-6">
              {/* Stepper Banner */}
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Teman {currentPeerIndex + 1} dari {peersToReview.length}
                  </span>
                  <h4 className="text-base font-extrabold text-blue-950">
                    Menilai Rekaman: {currentPeer.name}
                  </h4>
                </div>
                {reviewedPeerIds.has(currentPeer.id) && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
                    ✓ Sudah Dinilai (Dapat Diperbarui)
                  </span>
                )}
              </div>

              {/* TAUTAN GOOGLE DRIVE REKAMAN TEMAN */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                      Tautan Rekaman Google Drive {currentPeer.name}:
                    </span>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik tombol untuk mendengarkan file rekaman audio/video presentasi mandiri teman Anda.
                    </p>
                  </div>
                  {currentPeerAudio?.drive_url ? (
                    <a
                      href={currentPeerAudio.drive_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
                    >
                      <span>▶ Buka Rekaman Google Drive</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold shrink-0">
                      ⚠️ {currentPeer.name} belum mengunggah link rekaman
                    </span>
                  )}
                </div>
              </div>

              {peerNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
                  {peerNotice}
                </div>
              )}

              {peerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {peerError}
                </div>
              )}

              {/* 1. KELANCARAN BERBICARA */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  A. Kelancaran Berbicara / Presentasi
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'sering_tersendat', label: 'Sering berhenti / tersendat lama dalam rekaman' },
                    { val: 'beberapa_tersendat', label: 'Beberapa kali jeda atau tersendat, namun dapat melanjutkan' },
                    { val: 'cukup_lancar', label: 'Cukup lancar dengan jeda berpikir yang wajar' },
                    { val: 'lancar_runtut', label: 'Sangat lancar, runtut, dan alur bicara stabil' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerFluency === item.val
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peer_fluency"
                        value={item.val}
                        checked={peerFluency === item.val}
                        onChange={(e) => setPeerFluency(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 2. PEMAHAMAN TERHADAP KASUS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  B. Pemahaman terhadap Kasus
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'belum_paham', label: 'Belum memahami alur masalah kasus yang dibahas' },
                    { val: 'paham_sebagian', label: 'Memahami sebagian alur kasus, namun ada bagian penting terlewat' },
                    { val: 'sudah_paham', label: 'Sudah memahami kasus dan mampu menjelaskan inti persoalan' },
                    { val: 'paham_menghubungkan', label: 'Sangat memahami kasus dan mampu menghubungkan dengan dalil/konsep' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerUnderstanding === item.val
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peer_understanding"
                        value={item.val}
                        checked={peerUnderstanding === item.val}
                        onChange={(e) => setPeerUnderstanding(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 3. KELENGKAPAN MENJAWAB SCAFFOLDING */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  C. Kelengkapan Menjawab Scaffolding Pertanyaan
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'banyak_belum', label: 'Banyak pertanyaan scaffolding yang belum dijelaskan' },
                    { val: 'sebagian', label: 'Sebagian pertanyaan scaffolding terjawab' },
                    { val: 'hampir_seluruh', label: 'Hampir seluruh pertanyaan scaffolding terjawab baik' },
                    { val: 'seluruh_terhubung', label: 'Seluruh pertanyaan scaffolding terjawab lengkap dan runtut' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerScaffolding === item.val
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peer_scaffolding"
                        value={item.val}
                        checked={peerScaffolding === item.val}
                        onChange={(e) => setPeerScaffolding(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 4. KEJELASAN ARTIKULASI DAN BAHASA */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  D. Kejelasan Artikulasi & Bahasa dalam Rekaman
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'sulit_dipahami', label: 'Sulit dipahami (artikulasi kurang jelas / volume terlalu rendah)' },
                    { val: 'sebagian_bingung', label: 'Sebagian penjelasan membingungkan' },
                    { val: 'cukup_mudah', label: 'Cukup mudah dipahami dan intonasi cukup jelas' },
                    { val: 'jelas_runtut', label: 'Sangat jelas, artikulasi runtut, dan suara jernih' },
                  ].map((item) => (
                    <label
                      key={item.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerClarity === item.val
                          ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peer_clarity"
                        value={item.val}
                        checked={peerClarity === item.val}
                        onChange={(e) => setPeerClarity(e.target.value as any)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 5. FEEDBACK POSITIF */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  E. Umpan Balik Positif / Hal yang Sudah Baik
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Sampaikan apresiasi terhadap hal positif dari penjelasan atau rekaman teman Anda.
                </p>
                <textarea
                  value={peerPositive}
                  onChange={(e) => setPeerPositive(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Suara rekaman sangat jernih dan intonasinya meyakinkan saat membuka penjelasan..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm"
                  required
                />
              </div>

              {/* 6. SARAN PERBAIKAN */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  F. Saran Perbaikan Konkret untuk Latihan 2
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Berikan saran spesifik yang dapat membantu teman Anda tampil lebih baik pada latihan kelompok Latihan 2.
                </p>
                <textarea
                  value={peerImprovement}
                  onChange={(e) => setPeerImprovement(e.target.value)}
                  rows={3}
                  placeholder="Contoh: Pada pertanyaan nomor 4, bisa dipercepat penjelasannya agar alokasi waktu tidak melebihi 10 menit..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm"
                  required
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  {reviewedPeerIds.has(currentPeer.id)
                    ? `✓ Penilaian untuk ${currentPeer.name} telah tersimpan.`
                    : `Menilai ${currentPeerIndex + 1} dari ${peersToReview.length} teman.`}
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {currentPeerIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPeerIndex((prev) => prev - 1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      ← Teman Sebelumnya
                    </button>
                  )}

                  <button
                    type="submit"
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm font-extrabold rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    Simpan Penilaian {currentPeer.name}
                  </button>

                  {currentPeerIndex < peersToReview.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPeerIndex((prev) => prev + 1)}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Teman Berikutnya →
                    </button>
                  )}
                </div>
              </div>
            </form>
          ) : null}
        </div>
      )}
    </div>
  );
};
