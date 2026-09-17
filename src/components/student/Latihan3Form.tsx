import React, { useState, useEffect } from 'react';
import { Student, Meeting, Group, RecordingMode, ScaffoldingQuestion } from '../../types';
import { storageService, validateDriveUrl } from '../../lib/storage';
import { EvidencePhotoUploader } from '../common/EvidencePhotoUploader';

interface Latihan3FormProps {
  student: Student;
  group: Group;
  meeting: Meeting;
  questions: ScaffoldingQuestion[];
  onSaveSuccess: () => void;
  onGoToDashboard: () => void;
}

export const Latihan3Form: React.FC<Latihan3FormProps> = ({
  student,
  group,
  meeting,
  questions,
  onSaveSuccess,
  onGoToDashboard,
}) => {
  // Sub-tabs: 'my_submission' | 'peer_assessment' | 'group_evidence' | 'final_reflection'
  const [activeSubTab, setActiveSubTab] = useState<'my_submission' | 'peer_assessment' | 'group_evidence' | 'final_reflection'>('my_submission');

  // Audio state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('single');
  const [singleDriveUrl, setSingleDriveUrl] = useState('');
  const [perQuestionUrls, setPerQuestionUrls] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [audioSaved, setAudioSaved] = useState(false);

  // Group members excluding logged-in student
  const allGroupStudents = storageService.getStudentsByGroupId(group.id);
  const peersToReview = allGroupStudents.filter((s) => s.id !== student.id);

  // Peer assessment stepper state
  const [currentPeerIndex, setCurrentPeerIndex] = useState(0);
  const [peerTextDep, setPeerTextDep] = useState<any>('');
  const [peerFluency, setPeerFluency] = useState<any>('');
  const [peerUnderstanding, setPeerUnderstanding] = useState<any>('');
  const [peerScaffolding, setPeerScaffolding] = useState<any>('');
  const [peerClarity, setPeerClarity] = useState<any>('');
  const [peerPositive, setPeerPositive] = useState('');
  const [peerImprovement, setPeerImprovement] = useState('');
  const [peerNotice, setPeerNotice] = useState('');

  // Group Evidence state
  const [evidenceDate, setEvidenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [evidenceTime, setEvidenceTime] = useState('08:30 WIB');
  const [evidenceMode, setEvidenceMode] = useState<'tatap_muka' | 'online'>('tatap_muka');
  const [evidenceLocation, setEvidenceLocation] = useState('Ruang Kelas R.304');
  const [evidenceDriveUrl, setEvidenceDriveUrl] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('');
  const [evidenceAttendance, setEvidenceAttendance] = useState<Record<string, boolean>>({});
  const [evidenceChecklist, setEvidenceChecklist] = useState({
    all_practiced: true,
    all_listened: true,
    all_gave_feedback: true,
    discussed_difficulties: true,
  });
  const [evidenceDiscussionNote, setEvidenceDiscussionNote] = useState('');
  const [evidenceSaved, setEvidenceSaved] = useState(false);

  // Final Reflection state
  const [progressFelt, setProgressFelt] = useState('');
  const [masteredParts, setMasteredParts] = useState('');
  const [focusParts, setFocusParts] = useState('');
  const [readinessLevel, setReadinessLevel] = useState<'sangat_siap' | 'cukup_siap' | 'perlu_tambahan' | ''>('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  // Load existing data
  useEffect(() => {
    if (!student?.id || !group?.id || !meeting?.id) return;
    // 1. Audio
    const existingAudio = storageService.getAudioSubmission(student.id, meeting.id, 3);
    if (existingAudio) {
      setRecordingMode(existingAudio.recording_mode);
      setSingleDriveUrl(existingAudio.drive_url || '');
      setPerQuestionUrls(existingAudio.per_question_urls || {});
      setPhotoUrl(existingAudio.photo_url || '');
      setAudioSaved(true);
    }

    // 2. Group Evidence
    const existingGev = storageService.getGroupEvidence(group.id, meeting.id, 3);
    if (existingGev) {
      setEvidenceDate(existingGev.date);
      setEvidenceTime(existingGev.time);
      setEvidenceMode(existingGev.mode);
      setEvidenceLocation(existingGev.location_or_media);
      setEvidenceDriveUrl(existingGev.evidence_url || '');
      setEvidencePhotoUrl(existingGev.photo_url || '');
      setEvidenceAttendance(existingGev.attendance || {});
      setEvidenceChecklist(existingGev.checklist);
      setEvidenceDiscussionNote(existingGev.discussion_note);
      setEvidenceSaved(true);
    } else {
      const initialAtt: Record<string, boolean> = {};
      allGroupStudents.forEach((s) => {
        initialAtt[s.id] = true;
      });
      setEvidenceAttendance(initialAtt);
    }

    // 3. Final Reflection
    const existingRef = storageService.getFinalReflection(student.id, meeting.id);
    if (existingRef) {
      if (existingRef.progress_felt) setProgressFelt(existingRef.progress_felt);
      if (existingRef.mastered_parts) setMasteredParts(existingRef.mastered_parts);
      if (existingRef.focus_parts) setFocusParts(existingRef.focus_parts);
      if (existingRef.readiness_level) setReadinessLevel(existingRef.readiness_level);
      setReflectionSaved(true);
    }
  }, [student?.id, group?.id, meeting?.id]);

  // Load peer review on stepper index change
  useEffect(() => {
    if (!student?.id || !meeting?.id) return;
    if (peersToReview.length > 0 && peersToReview[currentPeerIndex]) {
      const targetPeer = peersToReview[currentPeerIndex];
      const existingReviews = storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 3);
      const rev = existingReviews.find((r) => r.presenter_student_id === targetPeer.id);

      if (rev) {
        setPeerTextDep(rev.text_dependency);
        setPeerFluency(rev.fluency);
        setPeerUnderstanding(rev.case_understanding);
        setPeerScaffolding(rev.scaffolding_completion);
        setPeerClarity(rev.clarity);
        setPeerPositive(rev.positive_feedback);
        setPeerImprovement(rev.improvement_feedback);
      } else {
        setPeerTextDep('');
        setPeerFluency('');
        setPeerUnderstanding('');
        setPeerScaffolding('');
        setPeerClarity('');
        setPeerPositive('');
        setPeerImprovement('');
      }
    }
  }, [currentPeerIndex, student?.id, meeting?.id]);

  // Save Audio Submission
  const handleSaveAudio = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    if (recordingMode === 'single') {
      const val = validateDriveUrl(singleDriveUrl);
      if (!val.isValid) {
        setUrlError(val.message || 'Link Drive tidak valid.');
        return;
      }
    } else {
      const urls = Object.values(perQuestionUrls).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
      if (urls.length === 0) {
        setUrlError('Masukkan minimal 1 link rekaman Drive.');
        return;
      }
      for (const u of urls) {
        const val = validateDriveUrl(u);
        if (!val.isValid) {
          setUrlError(val.message || 'Link Drive tidak valid.');
          return;
        }
      }
    }

    storageService.saveAudioSubmission({
      student_id: student.id,
      meeting_id: meeting.id,
      practice_number: 3,
      recording_mode: recordingMode,
      drive_url: recordingMode === 'single' ? singleDriveUrl.trim() : undefined,
      per_question_urls: recordingMode === 'per_question' ? perQuestionUrls : undefined,
      photo_url: photoUrl.trim() || undefined,
    });

    setAudioSaved(true);
    onSaveSuccess();
    setActiveSubTab('peer_assessment');
  };

  // Save Peer Review
  const handleSavePeerReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setPeerNotice('');

    if (!peerTextDep || !peerFluency || !peerUnderstanding || !peerScaffolding || !peerClarity) {
      setErrorMessage('Semua indikator penilaian (A sampai E) wajib diisi.');
      return;
    }

    if (!peerPositive.trim() || !peerImprovement.trim()) {
      setErrorMessage('Feedback positif dan saran perbaikan wajib diisi.');
      return;
    }

    const currentPeer = peersToReview[currentPeerIndex];
    storageService.savePeerAssessment({
      reviewer_student_id: student.id,
      presenter_student_id: currentPeer.id,
      meeting_id: meeting.id,
      practice_number: 3,
      text_dependency: peerTextDep,
      fluency: peerFluency,
      case_understanding: peerUnderstanding,
      scaffolding_completion: peerScaffolding,
      clarity: peerClarity,
      positive_feedback: peerPositive.trim(),
      improvement_feedback: peerImprovement.trim(),
    });

    onSaveSuccess();

    if (currentPeerIndex < peersToReview.length - 1) {
      setPeerNotice(`✓ Penilaian untuk ${currentPeer.name} tersimpan. Lanjut ke teman berikutnya.`);
      setTimeout(() => {
        setPeerNotice('');
        setCurrentPeerIndex(currentPeerIndex + 1);
      }, 700);
    } else {
      setPeerNotice(`✓ Seluruh penilaian simulasi Latihan 3 selesai! Silakan lengkapi Refleksi Akhir.`);
    }
  };

  // Save Group Evidence
  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!evidenceDriveUrl.trim() && !evidencePhotoUrl) {
      setErrorMessage('Mohon masukkan Link Google Drive atau unggah Foto Bukti Simulasi kelompok.');
      return;
    }

    if (evidenceDriveUrl.trim()) {
      const val = validateDriveUrl(evidenceDriveUrl);
      if (!val.isValid) {
        setErrorMessage(val.message || 'Link bukti rekaman/foto di Google Drive tidak valid.');
        return;
      }
    }

    if (!evidenceDiscussionNote.trim()) {
      setErrorMessage('Catatan kelompok wajib diisi.');
      return;
    }

    storageService.saveGroupEvidence({
      group_id: group.id,
      meeting_id: meeting.id,
      practice_number: 3,
      date: evidenceDate,
      time: evidenceTime,
      mode: evidenceMode,
      location_or_media: evidenceLocation,
      evidence_url: evidenceDriveUrl.trim(),
      photo_url: evidencePhotoUrl || undefined,
      attendance: evidenceAttendance,
      checklist: evidenceChecklist,
      discussion_note: evidenceDiscussionNote.trim(),
    });

    setEvidenceSaved(true);
    onSaveSuccess();
    setActiveSubTab('final_reflection');
  };

  // Save Final Reflection
  const handleSaveFinalReflection = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!progressFelt.trim() || !masteredParts.trim() || !focusParts.trim() || !readinessLevel) {
      setErrorMessage('Mohon lengkapi seluruh pertanyaan refleksi akhir dan tingkat kesiapan.');
      return;
    }

    storageService.saveFinalReflection({
      student_id: student.id,
      meeting_id: meeting.id,
      progress_felt: progressFelt.trim(),
      mastered_parts: masteredParts.trim(),
      focus_parts: focusParts.trim(),
      readiness_level: readinessLevel,
    });

    setReflectionSaved(true);
    onSaveSuccess();
  };

  // Progress check
  const reviewsGiven = storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 3);
  const reviewedIds = new Set(reviewsGiven.map((r) => r.presenter_student_id));
  const progress = storageService.calculateStudentProgress(student.id, meeting.id);
  const isL3Complete = progress.latihan3.is_complete;
  const isAllReady = progress.is_ready;

  const currentPeer = peersToReview[currentPeerIndex];
  const hasPerQuestionUrls = Object.values(perQuestionUrls).some((u) => typeof u === 'string' && u.trim().length > 0);
  const hasAudioEntered = audioSaved || Boolean(recordingMode === 'single' ? singleDriveUrl.trim() : hasPerQuestionUrls);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            TAHAP 3 DARI 3 (FINAL)
          </span>
          <span className="text-xs font-bold text-slate-500">{meeting.title}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          LATIHAN 3: Simulasi Presentasi di Kelas
        </h2>
        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
          “Lakukan simulasi presentasi pada jam kuliah. Presentasikan kasus sebagaimana Anda akan tampil pada presentasi sebenarnya. Setiap anggota kelompok memberikan penilaian dan feedback akhir.”
        </div>
      </div>

      {/* CEKLIST KELENGKAPAN TAHAP LATIHAN 3 */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 block">
              PANDUAN & KELENGKAPAN TAHAP FINAL
            </span>
            <h3 className="text-base font-extrabold tracking-tight">
              Ceklist Kelengkapan Latihan 3 (Simulasi Kelas)
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300">
            {[
              hasAudioEntered,
              evidenceSaved || Boolean(evidenceDriveUrl.trim() || evidencePhotoUrl),
              reviewsGiven.length >= (peersToReview.length || 1),
              reflectionSaved || Boolean(progressFelt.trim() && masteredParts.trim() && readinessLevel),
            ].filter(Boolean).length} / 4 Komponen Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
            hasAudioEntered
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              hasAudioEntered
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {hasAudioEntered ? '✓' : '1'}
            </span>
            <span>Link Rekaman Audio</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
            (evidenceSaved || Boolean(evidenceDriveUrl.trim() || evidencePhotoUrl))
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              (evidenceSaved || Boolean(evidenceDriveUrl.trim() || evidencePhotoUrl))
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {(evidenceSaved || Boolean(evidenceDriveUrl.trim() || evidencePhotoUrl)) ? '✓' : '2'}
            </span>
            <span>Bukti Foto / Link Simulasi</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
            reviewsGiven.length >= (peersToReview.length || 1)
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              reviewsGiven.length >= (peersToReview.length || 1)
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {reviewsGiven.length >= (peersToReview.length || 1) ? '✓' : '3'}
            </span>
            <span>Penilaian Teman ({reviewsGiven.length}/{peersToReview.length})</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-2.5 transition-colors ${
            (reflectionSaved || Boolean(progressFelt.trim() && masteredParts.trim() && readinessLevel))
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              (reflectionSaved || Boolean(progressFelt.trim() && masteredParts.trim() && readinessLevel))
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {(reflectionSaved || Boolean(progressFelt.trim() && masteredParts.trim() && readinessLevel)) ? '✓' : '4'}
            </span>
            <span>Refleksi Kesiapan Akhir</span>
          </div>
        </div>
      </div>

      {/* 3/3 FINISHED BANNER */}
      {isAllReady && (
        <div className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 border border-emerald-700 shadow-md">
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-emerald-800 border-2 border-emerald-500 flex items-center justify-center text-3xl shadow-inner shrink-0">
              🎯
            </div>
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-300 block">
                3/3 LATIHAN SELESAI
              </span>
              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                SIAP PRESENTASI!
              </h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Anda telah menyelesaikan seluruh rangkaian latihan presentasi bertahap. Dosen pengampu dapat melihat dan memverifikasi status latihan Anda.
              </p>
            </div>
            <button
              type="button"
              onClick={onGoToDashboard}
              className="px-5 py-3 bg-white text-emerald-900 hover:bg-emerald-50 text-xs font-black rounded-xl transition-colors shadow-xs shrink-0 cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('my_submission')}
          className={`flex-1 min-w-[140px] py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'my_submission'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>1. Rekaman Latihan 3</span>
          {audioSaved && <span className="text-[10px] text-emerald-400 font-black">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('peer_assessment')}
          className={`flex-1 min-w-[170px] py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'peer_assessment'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>2. Penilaian Teman Final</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono">
            {reviewsGiven.length}/{peersToReview.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('group_evidence')}
          className={`flex-1 min-w-[160px] py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'group_evidence'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>3. Bukti Simulasi Kelas</span>
          {evidenceSaved && <span className="text-[10px] text-emerald-400 font-black">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('final_reflection')}
          className={`flex-1 min-w-[150px] py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'final_reflection'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>4. Refleksi Akhir</span>
          {reflectionSaved && <span className="text-[10px] text-emerald-300 font-black">✓</span>}
        </button>
      </div>

      {/* TAB 1: AUDIO LATIHAN 3 */}
      {activeSubTab === 'my_submission' && (
        <form onSubmit={handleSaveAudio} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              LINK REKAMAN LATIHAN 3 (SIMULASI KELAS)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan link rekaman presentasi saat simulasi pada jam perkuliahan di Google Drive.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Format Rekaman
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecordingMode('single')}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                  recordingMode === 'single'
                    ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold">○ Satu rekaman lengkap</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Satu link Google Drive untuk seluruh presentasi simulasi.
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecordingMode('per_question')}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-colors ${
                  recordingMode === 'per_question'
                    ? 'bg-blue-50/60 border-blue-600 text-blue-900 font-bold ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="block text-xs font-bold">○ Rekaman terpisah berdasarkan pertanyaan</span>
                <span className="text-[11px] text-slate-500 font-normal">
                  Link terpisah per nomor pertanyaan scaffolding.
                </span>
              </button>
            </div>
          </div>

          {recordingMode === 'single' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link Google Drive Rekaman Latihan 3
                </label>
                {singleDriveUrl && (
                  <a
                    href={singleDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>Uji / Buka Link Drive</span>
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm font-mono"
                required
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-1">Pembukaan Kasus:</span>
                <input
                  type="url"
                  value={perQuestionUrls['intro'] || ''}
                  onChange={(e) => setPerQuestionUrls({ ...perQuestionUrls, intro: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                  required
                />
              </div>
              {questions.map((q, idx) => (
                <div key={q.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 block mb-1">
                    Pertanyaan {idx + 1}: {q.question_text}
                  </span>
                  <input
                    type="url"
                    value={perQuestionUrls[q.id || `q-${idx}`] || ''}
                    onChange={(e) =>
                      setPerQuestionUrls({ ...perQuestionUrls, [q.id || `q-${idx}`]: e.target.value })
                    }
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          )}

          {/* TEMPAT MENGIRIM FOTO BUKTI / SLIDE LATIHAN 3 */}
          <div className="pt-2 border-t border-slate-100">
            <EvidencePhotoUploader
              photoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
              label="Tempat Mengirim Foto Bukti / Slide Presentasi Simulasi Anda (Opsional)"
              description="Unggah foto Anda saat maju presentasi simulasi, foto catatan materi, atau slide presentasi."
            />
          </div>

          {urlError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {urlError}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {audioSaved ? '✓ Link rekaman tersimpan' : 'Belum disimpan'}
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Link & Lanjut ke Peer Assessment Final
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: PEER ASSESSMENT LATIHAN 3 */}
      {activeSubTab === 'peer_assessment' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                PENILAIAN TEMAN FINAL (SIMULASI KELAS)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Nilai penampilan presentasi teman kelompok saat sesi simulasi kelas secara objektif.
              </p>
            </div>

            {/* Stepper Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {peersToReview.map((p, idx) => {
                const isReviewed = reviewedIds.has(p.id);
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

          {currentPeer ? (
            <form onSubmit={handleSavePeerReview} className="space-y-6">
              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Teman {currentPeerIndex + 1} dari {peersToReview.length}
                  </span>
                  <h4 className="text-base font-extrabold text-blue-950">
                    Menilai Presenter: {currentPeer.name}
                  </h4>
                </div>
                {reviewedIds.has(currentPeer.id) && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    ✓ Sudah Dinilai
                  </span>
                )}
              </div>

              {peerNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold animate-in fade-in">
                  {peerNotice}
                </div>
              )}

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
                  {errorMessage}
                </div>
              )}

              {/* A. KETERGANTUNGAN PADA TEKS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  A. Ketergantungan pada Teks
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'membaca_seluruh', label: 'Masih membaca hampir seluruh isi' },
                    { val: 'membaca_sebagian', label: 'Masih membaca sebagian' },
                    { val: 'hanya_poin', label: 'Hanya melihat poin penting' },
                    { val: 'tanpa_membaca', label: 'Sudah mampu menjelaskan tanpa membaca' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerTextDep === opt.val
                          ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peerTextDepL3"
                        value={opt.val}
                        checked={peerTextDep === opt.val}
                        onChange={() => setPeerTextDep(opt.val)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* B. KELANCARAN */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  B. Kelancaran Berbicara
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'sering_tersendat', label: 'Sering berhenti / tersendat' },
                    { val: 'beberapa_tersendat', label: 'Beberapa kali tersendat' },
                    { val: 'cukup_lancar', label: 'Cukup lancar' },
                    { val: 'lancar_runtut', label: 'Lancar dan runtut' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerFluency === opt.val
                          ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peerFluencyL3"
                        value={opt.val}
                        checked={peerFluency === opt.val}
                        onChange={() => setPeerFluency(opt.val)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* C. PEMAHAMAN KASUS */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  C. Pemahaman terhadap Kasus
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'belum_paham', label: 'Penjelasan menunjukkan belum memahami kasus' },
                    { val: 'paham_sebagian', label: 'Baru memahami sebagian' },
                    { val: 'sudah_paham', label: 'Sudah memahami kasus' },
                    { val: 'paham_menghubungkan', label: 'Memahami kasus dan mampu menghubungkan konsep dengan kasus' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerUnderstanding === opt.val
                          ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peerUnderstandingL3"
                        value={opt.val}
                        checked={peerUnderstanding === opt.val}
                        onChange={() => setPeerUnderstanding(opt.val)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* D. KELENGKAPAN SCAFFOLDING */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  D. Kelengkapan Menjawab Scaffolding
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'banyak_belum', label: 'Banyak bagian belum dijelaskan' },
                    { val: 'sebagian', label: 'Sebagian sudah dijelaskan' },
                    { val: 'hampir_seluruh', label: 'Hampir seluruhnya sudah dijelaskan' },
                    { val: 'seluruh_terhubung', label: 'Seluruhnya dijelaskan dan dihubungkan dengan kasus' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerScaffolding === opt.val
                          ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peerScaffoldingL3"
                        value={opt.val}
                        checked={peerScaffolding === opt.val}
                        onChange={() => setPeerScaffolding(opt.val)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* E. KEJELASAN PENJELASAN */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  E. Kejelasan Penjelasan
                </label>
                <div className="space-y-2">
                  {[
                    { val: 'sulit_dipahami', label: 'Sulit dipahami' },
                    { val: 'sebagian_bingung', label: 'Beberapa bagian masih membingungkan' },
                    { val: 'cukup_mudah', label: 'Cukup mudah dipahami' },
                    { val: 'jelas_runtut', label: 'Jelas, runtut, dan mudah diikuti' },
                  ].map((opt) => (
                    <label
                      key={opt.val}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                        peerClarity === opt.val
                          ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="peerClarityL3"
                        value={opt.val}
                        checked={peerClarity === opt.val}
                        onChange={() => setPeerClarity(opt.val)}
                        className="text-blue-600"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* F. FEEDBACK POSITIF */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  F. Feedback Positif
                </label>
                <p className="text-xs text-slate-500 mb-2">“Satu hal yang sudah dilakukan dengan baik”</p>
                <textarea
                  rows={3}
                  value={peerPositive}
                  onChange={(e) => setPeerPositive(e.target.value)}
                  placeholder="Tuliskan apresiasi dan pencapaian terbaik teman Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
                  required
                />
              </div>

              {/* G. SARAN PERBAIKAN */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  G. Saran Terakhir untuk Presentasi Sebenarnya
                </label>
                <p className="text-xs text-slate-500 mb-2">“Satu hal yang perlu diperhatikan saat hari H”</p>
                <textarea
                  rows={3}
                  value={peerImprovement}
                  onChange={(e) => setPeerImprovement(e.target.value)}
                  placeholder="Berikan saran kunci agar teman Anda tampil maksimal..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentPeerIndex === 0}
                  onClick={() => setCurrentPeerIndex(currentPeerIndex - 1)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                >
                  ← Teman Sebelumnya
                </button>

                <button
                  type="submit"
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>
                    {currentPeerIndex < peersToReview.length - 1
                      ? 'SIMPAN & NILAI TEMAN BERIKUTNYA'
                      : 'SIMPAN PENILAIAN TERAKHIR'}
                  </span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6 text-sm text-slate-500">
              Tidak ada anggota lain yang perlu dinilai.
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BUKTI KEGIATAN SIMULASI KELAS */}
      {activeSubTab === 'group_evidence' && (
        <form onSubmit={handleSaveEvidence} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              BUKTI SIMULASI PRESENTASI DI KELAS (LATIHAN 3)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Data bukti simulasi pada jam perkuliahan di depan teman atau dosen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Simulasi
              </label>
              <input
                type="date"
                value={evidenceDate}
                onChange={(e) => setEvidenceDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Waktu Pelaksanaan
              </label>
              <input
                type="text"
                value={evidenceTime}
                onChange={(e) => setEvidenceTime(e.target.value)}
                placeholder="Contoh: 08:00 - 09:40 WIB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Mode Pelaksanaan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setEvidenceMode('tatap_muka')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    evidenceMode === 'tatap_muka'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Tatap Muka
                </button>
                <button
                  type="button"
                  onClick={() => setEvidenceMode('online')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer transition-colors ${
                    evidenceMode === 'online'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  Online
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Ruang Kelas / Media
              </label>
              <input
                type="text"
                value={evidenceLocation}
                onChange={(e) => setEvidenceLocation(e.target.value)}
                placeholder="Contoh: Gedung A R.304 / Zoom Dosen"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Kehadiran Anggota Kelompok
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {allGroupStudents.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer hover:bg-slate-100 text-xs font-semibold text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={!!evidenceAttendance[s.id]}
                    onChange={(e) =>
                      setEvidenceAttendance({
                        ...evidenceAttendance,
                        [s.id]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{s.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* BUKTI SIMULASI DRIVE LINK & FOTO DOKUMENTASI */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link Google Drive Bukti Simulasi Kelas (Opsional jika mengunggah foto langsung)
                </label>
                {evidenceDriveUrl && (
                  <a
                    href={evidenceDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    <span>Uji / Buka Link Bukti</span>
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
              <input
                type="url"
                value={evidenceDriveUrl}
                onChange={(e) => setEvidenceDriveUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... (foto atau rekaman simulasi kelas)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Folder atau file Google Drive berisi rekaman video presentasi kelas atau dokumentasi foto bersama.
              </p>
            </div>

            {/* TEMPAT MENGIRIM FOTO BUKTI SIMULASI KELOMPOK */}
            <EvidencePhotoUploader
              photoUrl={evidencePhotoUrl}
              onPhotoChange={setEvidencePhotoUrl}
              label="Tempat Mengirim Foto Bukti Simulasi Kelas Kelompok"
              description="Unggah foto langsung dokumentasi simulasi (misal: foto saat kelompok berdiri mempresentasikan simulasi di depan kelas, atau foto suasana kelas)."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Checklist Aktivitas Simulasi
            </label>
            <div className="space-y-2">
              {[
                { key: 'all_practiced', label: 'Setiap anggota melakukan simulasi presentasi.' },
                { key: 'all_listened', label: 'Setiap anggota menyimak dengan seksama.' },
                { key: 'all_gave_feedback', label: 'Setiap anggota memberikan feedback akhir.' },
                { key: 'discussed_difficulties', label: 'Kelompok mendiskusikan kesiapan akhir menghadapi hari-H.' },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/50 cursor-pointer hover:bg-slate-50 text-xs sm:text-sm font-medium text-slate-800"
                >
                  <input
                    type="checkbox"
                    checked={(evidenceChecklist as any)[item.key]}
                    onChange={(e) =>
                      setEvidenceChecklist({
                        ...evidenceChecklist,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Evaluasi Kelompok
            </label>
            <textarea
              rows={3}
              value={evidenceDiscussionNote}
              onChange={(e) => setEvidenceDiscussionNote(e.target.value)}
              placeholder="Tuliskan catatan kelompok terkait kesiapan menghadapi presentasi sebenarnya..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {evidenceSaved ? '✓ Bukti simulasi tersimpan' : 'Belum disimpan'}
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Bukti Simulasi Kelas
            </button>
          </div>
        </form>
      )}

      {/* TAB 4: REFLEKSI AKHIR MAHASISWA (Requirement 25) */}
      {activeSubTab === 'final_reflection' && (
        <form onSubmit={handleSaveFinalReflection} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-700 block mb-1">
              TAHAP AKHIR EVALUASI
            </span>
            <h3 className="text-xl font-black text-slate-900">
              REFLEKSI AKHIR MAHASISWA
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Refleksikan keseluruhan proses latihan Anda dari Latihan 1 (Mandiri), Latihan 2 (Kelompok), hingga Latihan 3 (Simulasi Kelas).
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* 1. Perkembangan yang paling dirasakan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              1. Perkembangan yang paling saya rasakan dari Latihan 1 sampai Latihan 3:
            </label>
            <textarea
              rows={3}
              value={progressFelt}
              onChange={(e) => setProgressFelt(e.target.value)}
              placeholder="Contoh: Saya awalnya membaca seluruh teks dan sering tersendat di pertanyaan 3, namun pada latihan 3 sudah mampu menjelaskan alur mekanisme tanpa membaca..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          {/* 2. Bagian yang paling dikuasai */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              2. Bagian presentasi yang sekarang paling saya kuasai:
            </label>
            <textarea
              rows={3}
              value={masteredParts}
              onChange={(e) => setMasteredParts(e.target.value)}
              placeholder="Contoh: Bagian penjelasan hipotesis awal dan perbandingan struktur kimia molekul..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          {/* 3. Bagian yang masih perlu diperhatikan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              3. Bagian yang masih perlu saya perhatikan saat presentasi sebenarnya:
            </label>
            <textarea
              rows={3}
              value={focusParts}
              onChange={(e) => setFocusParts(e.target.value)}
              placeholder="Contoh: Menjaga kontak mata dengan audiens dan manajemen waktu agar tidak melebihi 10 menit..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          {/* 4. Tingkat kesiapan */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              4. Tingkat Kesiapan Saya untuk Presentasi Sebenarnya:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { val: 'sangat_siap', label: '🌟 Sangat Siap', desc: 'Percaya diri dan menguasai seluruh materi' },
                { val: 'cukup_siap', label: '👍 Cukup Siap', desc: 'Siap dengan persiapan yang sudah dilakukan' },
                { val: 'perlu_tambahan', label: '⚠️ Perlu Latihan Tambahan', desc: 'Masih perlu mematangkan beberapa bagian' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`p-4 rounded-xl border cursor-pointer transition-colors flex flex-col justify-between ${
                    readinessLevel === opt.val
                      ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="radio"
                      name="readinessLevel"
                      value={opt.val}
                      checked={readinessLevel === opt.val}
                      onChange={() => setReadinessLevel(opt.val as any)}
                      className="text-emerald-600"
                    />
                    <span className="text-xs font-bold text-slate-900">{opt.label}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 pl-5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {reflectionSaved ? '✓ Refleksi akhir tersimpan' : 'Belum disimpan'}
            </span>
            <button
              type="submit"
              className="px-8 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>SIMPAN REFLEKSI AKHIR</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
