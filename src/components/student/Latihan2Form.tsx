import React, { useState, useEffect } from 'react';
import { Student, Meeting, Group, RecordingMode, ScaffoldingQuestion } from '../../types';
import { storageService, validateDriveUrl } from '../../lib/storage';
import { EvidencePhotoUploader } from '../common/EvidencePhotoUploader';

interface Latihan2FormProps {
  student: Student;
  group: Group;
  meeting: Meeting;
  questions: ScaffoldingQuestion[];
  onSaveSuccess: () => void;
  onNextStage: () => void;
}

export const Latihan2Form: React.FC<Latihan2FormProps> = ({
  student,
  group,
  meeting,
  questions,
  onSaveSuccess,
  onNextStage,
}) => {
  // Sub-tabs: 'my_submission' | 'peer_assessment' | 'group_evidence'
  const [activeSubTab, setActiveSubTab] = useState<'my_submission' | 'peer_assessment' | 'group_evidence'>('my_submission');

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
  const [evidenceTime, setEvidenceTime] = useState('16:00 WIB');
  const [evidenceMode, setEvidenceMode] = useState<'tatap_muka' | 'online'>('tatap_muka');
  const [evidenceLocation, setEvidenceLocation] = useState('Perpustakaan / Ruang Diskusi');
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

  const [errorMessage, setErrorMessage] = useState('');

  // Load existing audio & group evidence
  useEffect(() => {
    if (!student?.id || !group?.id || !meeting?.id) return;
    // 1. Audio
    const existingAudio = storageService.getAudioSubmission(student.id, meeting.id, 2);
    if (existingAudio) {
      setRecordingMode(existingAudio.recording_mode);
      setSingleDriveUrl(existingAudio.drive_url || '');
      setPerQuestionUrls(existingAudio.per_question_urls || {});
      setPhotoUrl(existingAudio.photo_url || '');
      setAudioSaved(true);
    }

    // 2. Group Evidence
    const existingGev = storageService.getGroupEvidence(group.id, meeting.id, 2);
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
      // Default all present
      const initialAtt: Record<string, boolean> = {};
      allGroupStudents.forEach((s) => {
        initialAtt[s.id] = true;
      });
      setEvidenceAttendance(initialAtt);
    }
  }, [student?.id, group?.id, meeting?.id]);

  // Load peer assessment form whenever currentPeerIndex changes
  useEffect(() => {
    if (!student?.id || !meeting?.id) return;
    if (peersToReview.length > 0 && peersToReview[currentPeerIndex]) {
      const targetPeer = peersToReview[currentPeerIndex];
      const existingReviews = storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 2);
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

  // Handle Save Audio Submission
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
      practice_number: 2,
      recording_mode: recordingMode,
      drive_url: recordingMode === 'single' ? singleDriveUrl.trim() : undefined,
      per_question_urls: recordingMode === 'per_question' ? perQuestionUrls : undefined,
      photo_url: photoUrl.trim() || undefined,
    });

    setAudioSaved(true);
    onSaveSuccess();
    setActiveSubTab('peer_assessment');
  };

  // Handle Save Current Peer Review
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
      practice_number: 2,
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
      setPeerNotice(`✓ Feedback untuk ${currentPeer.name} tersimpan. Lanjut ke teman berikutnya.`);
      setTimeout(() => {
        setPeerNotice('');
        setCurrentPeerIndex(currentPeerIndex + 1);
      }, 700);
    } else {
      setPeerNotice(`✓ Seluruh penilaian peer-assessment Latihan 2 selesai!`);
    }
  };

  // Handle Save Group Evidence
  const handleSaveEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!evidenceDriveUrl.trim() && !evidencePhotoUrl) {
      setErrorMessage('Mohon masukkan Link Google Drive atau unggah Foto Bukti Kegiatan kelompok.');
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
      practice_number: 2,
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
  };

  // Progress calculations for Latihan 2
  const reviewsGiven = storageService.getPeerAssessmentsGivenByStudent(student.id, meeting.id, 2);
  const reviewedIds = new Set(reviewsGiven.map((r) => r.presenter_student_id));
  const progress = storageService.calculateStudentProgress(student.id, meeting.id);
  const isL2Complete = progress.latihan2.is_complete;

  const currentPeer = peersToReview[currentPeerIndex];
  const hasPerQuestionUrls = Object.values(perQuestionUrls).some((u) => typeof u === 'string' && u.trim().length > 0);
  const hasAudioEntered = audioSaved || Boolean(recordingMode === 'single' ? singleDriveUrl.trim() : hasPerQuestionUrls);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
            TAHAP 2 DARI 3
          </span>
          <span className="text-xs font-bold text-slate-500">{meeting.title}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          LATIHAN 2: Latihan Bersama Kelompok (di Luar Jam Kuliah)
        </h2>
        <div className="mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
          “Lakukan pertemuan bersama anggota kelompok di luar jam kuliah. Setiap anggota harus melakukan presentasi secara bergiliran. Dengarkan penjelasan teman dan berikan feedback yang jujur dan konstruktif.”
        </div>
      </div>

      {/* CEKLIST KELENGKAPAN TAHAP LATIHAN 2 */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
              PANDUAN & KELENGKAPAN LATIHAN KELOMPOK
            </span>
            <h3 className="text-base font-extrabold tracking-tight">
              Ceklist Kelengkapan Latihan 2
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300">
            {[
              hasAudioEntered,
              evidenceSaved || Boolean(evidenceDriveUrl.trim() || evidencePhotoUrl),
              reviewsGiven.length >= (peersToReview.length || 1),
            ].filter(Boolean).length} / 3 Komponen Selesai
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
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
            <span>Link Rekaman Latihan 2 Anda</span>
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
            <span>Bukti Kegiatan / Foto Kelompok</span>
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
            <span>Penilaian Teman ({reviewsGiven.length}/{peersToReview.length} Selesai)</span>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isL2Complete && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                ✅ LATIHAN 2 SELESAI
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Link audio, peer assessment untuk semua anggota ({reviewsGiven.length}/{peersToReview.length}), dan bukti kegiatan kelompok telah lengkap.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onNextStage}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>Lanjut ke Latihan 3</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('my_submission')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'my_submission'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>1. Link Rekaman Latihan 2</span>
          {audioSaved && <span className="text-[10px] text-emerald-400 font-black">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('peer_assessment')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'peer_assessment'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>2. Penilaian Teman (Peer Assessment)</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-800 font-mono">
            {reviewsGiven.length}/{peersToReview.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('group_evidence')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'group_evidence'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <span>3. Bukti Kegiatan Kelompok</span>
          {evidenceSaved && <span className="text-[10px] text-emerald-400 font-black">✓</span>}
        </button>
      </div>

      {/* TAB 1: LINK REKAMAN LATIHAN 2 */}
      {activeSubTab === 'my_submission' && (
        <form onSubmit={handleSaveAudio} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              LINK REKAMAN LATIHAN 2
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan rekaman suara presentasi Anda saat latihan bersama kelompok di Google Drive.
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
                  Satu link Google Drive untuk seluruh sesi presentasi.
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
                  Link terpisah per poin scaffolding.
                </span>
              </button>
            </div>
          </div>

          {recordingMode === 'single' ? (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link Google Drive Rekaman Latihan 2
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

          {/* TEMPAT MENGIRIM FOTO BUKTI MANDIRI (LATIHAN 2) */}
          <div className="pt-2 border-t border-slate-100">
            <EvidencePhotoUploader
              photoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
              label="Tempat Mengirim Foto Bukti / Catatan Latihan Mandiri Anda (Opsional)"
              description="Unggah foto catatan persiapan sebelum simulasi kelompok atau foto slide presentasi Anda."
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
              Simpan Link & Lanjut ke Peer Assessment
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MASTER PEER ASSESSMENT FORM STEPPER (Requirement 21 & 22) */}
      {activeSubTab === 'peer_assessment' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                PEER ASSESSMENT (PENILAIAN TEMAN KELOMPOK)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Anda login sebagai: <strong className="text-slate-800">{student.name}</strong>. Berikan evaluasi konstruktif untuk setiap teman kelompok secara bergiliran.
              </p>
            </div>

            {/* Peer Stepper Chips */}
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
              {/* Stepper indicator banner */}
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
                    ✓ Sudah Dinilai (Bisa Diedit)
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
                        name="peerTextDep"
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
                        name="peerFluency"
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

              {/* C. PEMAHAMAN TERHADAP KASUS */}
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
                        name="peerUnderstanding"
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
                        name="peerScaffolding"
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
                        name="peerClarity"
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
                  F. Feedback Positif (Wajib)
                </label>
                <p className="text-xs text-slate-500 mb-2">“Satu hal yang sudah dilakukan dengan baik”</p>
                <textarea
                  rows={3}
                  value={peerPositive}
                  onChange={(e) => setPeerPositive(e.target.value)}
                  placeholder="Tuliskan aspek positif presentasi teman Anda..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
                  required
                />
              </div>

              {/* G. SARAN PERBAIKAN */}
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  G. Saran Perbaikan (Wajib)
                </label>
                <p className="text-xs text-slate-500 mb-2">“Satu hal yang perlu diperbaiki sebelum latihan berikutnya”</p>
                <textarea
                  rows={3}
                  value={peerImprovement}
                  onChange={(e) => setPeerImprovement(e.target.value)}
                  placeholder="Berikan saran perbaikan konkret yang membangun..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
                  required
                />
              </div>

              {/* Stepper Buttons */}
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

      {/* TAB 3: BUKTI KEGIATAN KELOMPOK (Requirement 23) */}
      {activeSubTab === 'group_evidence' && (
        <form onSubmit={handleSaveEvidence} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              BUKTI KEGIATAN KELOMPOK (LATIHAN 2)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cukup diisi satu kali untuk satu kegiatan kelompok di luar jam kuliah. Seluruh anggota dapat melihat dan memperbarui bukti ini.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tanggal Kegiatan
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
                placeholder="Contoh: 16:00 - 17:30 WIB"
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
                Tempat / Media
              </label>
              <input
                type="text"
                value={evidenceLocation}
                onChange={(e) => setEvidenceLocation(e.target.value)}
                placeholder="Contoh: Perpustakaan / Rumah Anggota / Google Meet / Zoom"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium"
                required
              />
            </div>
          </div>

          {/* ANGGOTA YANG HADIR (Checklist) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Anggota yang Hadir
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

          {/* BUKTI KEGIATAN DRIVE LINK & FOTO DOKUMENTASI */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link Google Drive Bukti Kegiatan (Opsional jika mengunggah foto langsung)
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
                placeholder="https://drive.google.com/drive/folders/... (folder/file Google Drive foto atau video)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm font-mono"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Folder atau file Google Drive berisi rekaman sesi, foto kegiatan bersama, atau screenshot video call.
              </p>
            </div>

            {/* TEMPAT MENGIRIM FOTO BUKTI KEGIATAN KELOMPOK */}
            <EvidencePhotoUploader
              photoUrl={evidencePhotoUrl}
              onPhotoChange={setEvidencePhotoUrl}
              label="Tempat Mengirim Foto Bukti Kegiatan Kelompok"
              description="Unggah foto langsung dokumentasi latihan (misal: foto pertemuan tatap muka, screenshot Zoom/Google Meet, atau foto catatan diskusi kelompok)."
            />
          </div>

          {/* CHECKLIST KEGIATAN */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Checklist Aktivitas Kelompok
            </label>
            <div className="space-y-2">
              {[
                { key: 'all_practiced', label: 'Setiap anggota melakukan latihan presentasi.' },
                { key: 'all_listened', label: 'Setiap anggota mendengarkan presentasi teman.' },
                { key: 'all_gave_feedback', label: 'Setiap anggota memberikan feedback.' },
                { key: 'discussed_difficulties', label: 'Kelompok mendiskusikan bagian yang masih sulit.' },
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

          {/* CATATAN KELOMPOK */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Catatan Kelompok
            </label>
            <p className="text-xs text-slate-500 mb-2">
              “Apa bagian yang masih perlu diperbaiki sebelum simulasi berikutnya?”
            </p>
            <textarea
              rows={3}
              value={evidenceDiscussionNote}
              onChange={(e) => setEvidenceDiscussionNote(e.target.value)}
              placeholder="Tuliskan hasil diskusi kelompok dan topik yang masih perlu dimatangkan..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {evidenceSaved ? '✓ Bukti kelompok tersimpan' : 'Belum disimpan'}
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Simpan Bukti Kegiatan Kelompok
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
