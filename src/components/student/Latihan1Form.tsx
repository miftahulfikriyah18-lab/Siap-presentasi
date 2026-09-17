import React, { useState, useEffect } from 'react';
import { Student, Meeting, RecordingMode, ScaffoldingQuestion } from '../../types';
import { storageService, validateDriveUrl } from '../../lib/storage';
import { EvidencePhotoUploader } from '../common/EvidencePhotoUploader';

interface Latihan1FormProps {
  student: Student;
  meeting: Meeting;
  questions: ScaffoldingQuestion[];
  onSaveSuccess: () => void;
  onNextStage: () => void;
}

export const Latihan1Form: React.FC<Latihan1FormProps> = ({
  student,
  meeting,
  questions,
  onSaveSuccess,
  onNextStage,
}) => {
  // Audio state
  const [recordingMode, setRecordingMode] = useState<RecordingMode>('single');
  const [singleDriveUrl, setSingleDriveUrl] = useState('');
  const [perQuestionUrls, setPerQuestionUrls] = useState<Record<string, string>>({});
  const [photoUrl, setPhotoUrl] = useState('');
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

  // Load existing data
  useEffect(() => {
    if (!student?.id || !meeting?.id) return;
    const existingAudio = storageService.getAudioSubmission(student.id, meeting.id, 1);
    if (existingAudio) {
      setRecordingMode(existingAudio.recording_mode);
      setSingleDriveUrl(existingAudio.drive_url || '');
      setPerQuestionUrls(existingAudio.per_question_urls || {});
      setPhotoUrl(existingAudio.photo_url || '');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');
    setErrorMessage('');

    // 1. Audio validation
    if (recordingMode === 'single') {
      const val = validateDriveUrl(singleDriveUrl);
      if (!val.isValid) {
        setUrlError(val.message || 'Link rekaman belum valid.');
        return;
      }
    } else {
      // Per question validation
      const urls = Object.values(perQuestionUrls).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);
      if (urls.length === 0) {
        setUrlError('Masukkan minimal 1 link rekaman Google Drive.');
        return;
      }
      for (const u of urls) {
        const val = validateDriveUrl(u);
        if (!val.isValid) {
          setUrlError(`Link tidak valid: ${val.message}`);
          return;
        }
      }
    }

    // 2. Requirement 18: Wajib mendengarkan kembali checkbox
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
      recording_mode: recordingMode,
      drive_url: recordingMode === 'single' ? singleDriveUrl.trim() : undefined,
      per_question_urls: recordingMode === 'per_question' ? perQuestionUrls : undefined,
      photo_url: photoUrl.trim() || undefined,
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
  };

  const hasPerQuestionUrls = Object.values(perQuestionUrls).some((u) => typeof u === 'string' && u.trim().length > 0);
  const hasAudioEntered = recordingMode === 'single' ? singleDriveUrl.trim().length > 0 : hasPerQuestionUrls;

  return (
    <div className="space-y-6">
      {/* Title & Official Instructions */}
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
          LATIHAN 1: Latihan Mandiri
        </h2>

        {/* Privacy Notice Requirement 8 */}
        <div className="my-4 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
          <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <strong className="font-bold block text-blue-950">Data Bersifat Privat</strong>
            Data Latihan 1 (link audio rekaman mandiri, evaluasi diri, dan target refleksi) hanya dapat dilihat oleh Anda dan Dosen. Anggota kelompok lain TIDAK dapat melihat data ini.
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed italic">
          “Lakukan presentasi seolah-olah Anda sedang menjelaskan kasus ini di depan kelas. Rekam presentasi Anda. Setelah selesai, dengarkan kembali rekaman sebelum melakukan evaluasi diri.”
        </div>
      </div>

      {/* CEKLIST KELENGKAPAN TAHAP LATIHAN 1 */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-400 block">
              PANDUAN & VERIFIKASI MANDIRI
            </span>
            <h3 className="text-base font-extrabold tracking-tight">
              Ceklist Kelengkapan Latihan 1
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-slate-800 text-slate-300">
            {[
              hasAudioEntered,
              listenedToAudio,
              Boolean(textDependency && fluency && caseUnderstanding && scaffoldingMastery),
              improvementNote.trim().length > 0,
            ].filter(Boolean).length} / 4 Syarat Terpenuhi
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
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
            <span>Link Rekaman Google Drive dimasukkan</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            photoUrl
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              photoUrl
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {photoUrl ? '✓' : '2'}
            </span>
            <span>Foto Bukti / Catatan Latihan ({photoUrl ? 'Dilampirkan' : 'Opsional'})</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            listenedToAudio
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              listenedToAudio
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {listenedToAudio ? '✓' : '3'}
            </span>
            <span>Konfirmasi dengarkan rekaman dari awal sampai akhir</span>
          </div>

          <div className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
            Boolean(textDependency && fluency && caseUnderstanding && scaffoldingMastery && improvementNote.trim())
              ? 'bg-emerald-950/40 border-emerald-600/50 text-emerald-300'
              : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
              Boolean(textDependency && fluency && caseUnderstanding && scaffoldingMastery && improvementNote.trim())
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-slate-700 text-slate-400'
            }`}>
              {Boolean(textDependency && fluency && caseUnderstanding && scaffoldingMastery && improvementNote.trim()) ? '✓' : '4'}
            </span>
            <span>4 Kriteria Evaluasi Diri & Catatan Rencana Perbaikan</span>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {isSaved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
              ✓
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-950">
                ✅ LATIHAN 1 SELESAI
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Gunakan refleksi ini sebagai target perbaikan pada Latihan 2 bersama kelompok.
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

      {/* Form Submission */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION A: BUKTI REKAMAN */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              A. BUKTI REKAMAN PRESENTASI
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Simpan rekaman suara Anda di Google Drive mahasiswa, lalu tempelkan link tautannya di bawah.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Bagaimana Anda merekam latihan?
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
                  Satu file rekaman audio utuh dari awal sampai akhir.
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
                  Beberapa file audio terpisah sesuai scaffolding pertanyaan.
                </span>
              </button>
            </div>
          </div>

          {/* Single Mode Input */}
          {recordingMode === 'single' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Link Google Drive Rekaman
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
              <p className="text-[11px] text-slate-500 mt-1">
                Pastikan hak akses link Google Drive diatur ke: <strong>"Siapa saja yang memiliki link dapat melihat"</strong> agar dosen dapat memverifikasi.
              </p>
            </div>
          )}

          {/* Per Question Mode Inputs */}
          {recordingMode === 'per_question' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Tautan Drive per Bagian / Pertanyaan Scaffolding
              </label>

              {/* Intro / Case overview */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-800 block mb-1">
                  Pembukaan / Penjelasan Kasus:
                </span>
                <input
                  type="url"
                  value={perQuestionUrls['intro'] || ''}
                  onChange={(e) => {
                    setPerQuestionUrls({ ...perQuestionUrls, intro: e.target.value });
                    setUrlError('');
                  }}
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
                    onChange={(e) => {
                      setPerQuestionUrls({
                        ...perQuestionUrls,
                        [q.id || `q-${idx}`]: e.target.value,
                      });
                      setUrlError('');
                    }}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          )}

          {urlError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
              {urlError}
            </div>
          )}

          {/* TEMPAT MENGIRIM FOTO BUKTI MANDIRI */}
          <div className="pt-2 border-t border-slate-100">
            <EvidencePhotoUploader
              photoUrl={photoUrl}
              onPhotoChange={setPhotoUrl}
              label="Tempat Mengirim Foto Bukti / Catatan Latihan Mandiri (Opsional)"
              description="Unggah foto catatan poin presentasi Anda, slide yang disiapkan, atau foto bukti saat Anda berlatih mandiri."
            />
          </div>

          {/* MANDATORY LISTEN CHECKBOX Requirement 18 */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-50">
              <input
                type="checkbox"
                checked={listenedToAudio}
                onChange={(e) => setListenedToAudio(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-0.5"
                required
              />
              <span className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                Saya sudah mendengarkan kembali rekaman latihan saya dari awal sampai selesai.
              </span>
            </label>
            <p className="text-[11px] text-slate-400 mt-1 pl-1">
              *Checkbox ini wajib dicentang. Anda harus mengevaluasi rekaman asli Anda sendiri sebelum mengisi evaluasi diri.
            </p>
          </div>
        </div>

        {/* SECTION B: SELF ASSESSMENT EVALUASI DIRI */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-extrabold text-slate-900">
              B. EVALUASI DIRI (SELF-ASSESSMENT)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              “Jawablah sesuai kondisi sebenarnya. Data ini digunakan untuk melihat perkembangan Anda dan tidak dapat dilihat oleh anggota kelompok lainnya.”
            </p>
          </div>

          {/* 1. KETERGANTUNGAN PADA TEKS */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              1. Ketergantungan pada Teks
            </label>
            <p className="text-xs text-slate-500 mb-2">Saat menjelaskan kasus, saya masih:</p>
            <div className="space-y-2">
              {[
                { val: 'membaca_seluruh', label: 'Membaca hampir seluruh isi' },
                { val: 'membaca_cukup_banyak', label: 'Membaca cukup banyak tetapi sesekali menjelaskan dengan bahasa sendiri' },
                { val: 'hanya_poin', label: 'Hanya melihat atau membaca poin-poin penting' },
                { val: 'tanpa_membaca', label: 'Sudah mampu menjelaskan tanpa membaca teks' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                    textDependency === opt.val
                      ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="textDependency"
                    value={opt.val}
                    checked={textDependency === opt.val}
                    onChange={() => setTextDependency(opt.val as any)}
                    className="text-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 2. KELANCARAN PRESENTASI */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              2. Kelancaran Presentasi
            </label>
            <div className="space-y-2">
              {[
                { val: 'sering_tersendat', label: 'Sering berhenti atau tersendat' },
                { val: 'beberapa_tersendat', label: 'Masih beberapa kali tersendat' },
                { val: 'cukup_lancar', label: 'Cukup lancar' },
                { val: 'lancar_runtut', label: 'Lancar dan runtut' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                    fluency === opt.val
                      ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="fluency"
                    value={opt.val}
                    checked={fluency === opt.val}
                    onChange={() => setFluency(opt.val as any)}
                    className="text-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. PEMAHAMAN TERHADAP KASUS */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              3. Pemahaman terhadap Kasus
            </label>
            <div className="space-y-2">
              {[
                { val: 'belum_paham', label: 'Saya belum memahami kasus dengan baik' },
                { val: 'paham_sebagian', label: 'Saya memahami sebagian tetapi masih bingung saat menjelaskannya' },
                { val: 'cukup_paham', label: 'Saya memahami kasus dan cukup mampu menjelaskannya' },
                { val: 'paham_runtut', label: 'Saya memahami kasus dan mampu menjelaskan secara runtut dengan bahasa sendiri' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                    caseUnderstanding === opt.val
                      ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="caseUnderstanding"
                    value={opt.val}
                    checked={caseUnderstanding === opt.val}
                    onChange={() => setCaseUnderstanding(opt.val as any)}
                    className="text-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. KEMAMPUAN MENJAWAB SCAFFOLDING */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              4. Kemampuan Menjawab Scaffolding
            </label>
            <div className="space-y-2">
              {[
                { val: 'banyak_belum', label: 'Banyak bagian belum dapat saya jelaskan' },
                { val: 'sebagian', label: 'Sebagian sudah dapat saya jelaskan' },
                { val: 'hampir_seluruh', label: 'Hampir seluruh pertanyaan dapat saya jelaskan' },
                { val: 'seluruh_terhubung', label: 'Seluruh pertanyaan dapat saya jelaskan dan hubungkan dengan kasus' },
              ].map((opt) => (
                <label
                  key={opt.val}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-colors ${
                    scaffoldingMastery === opt.val
                      ? 'bg-blue-50/60 border-blue-600 font-semibold text-blue-900'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="scaffoldingMastery"
                    value={opt.val}
                    checked={scaffoldingMastery === opt.val}
                    onChange={() => setScaffoldingMastery(opt.val as any)}
                    className="text-blue-600"
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 5. REFLEKSI PERBAIKAN (Textarea Wajib) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              5. Refleksi Diri (Wajib)
            </label>
            <p className="text-xs text-slate-600 mb-2 font-medium">
              “Apa bagian yang paling perlu Anda perbaiki sebelum latihan berikutnya?”
            </p>
            <textarea
              rows={4}
              value={improvementNote}
              onChange={(e) => setImprovementNote(e.target.value)}
              placeholder="Tuliskan kekurangan yang Anda dengar dari rekaman dan target perbaikan konkret Anda..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm leading-relaxed"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              {isSaved ? '✓ Tersimpan di sistem' : 'Perubahan belum disimpan'}
            </span>
            <button
              type="submit"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>SIMPAN LATIHAN 1</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
