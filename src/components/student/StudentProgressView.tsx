import React, { useState } from 'react';
import { Student, Meeting, Group } from '../../types';
import { storageService } from '../../lib/storage';

interface StudentProgressViewProps {
  student: Student;
  group: Group;
  meeting: Meeting;
  onBackToDashboard: () => void;
}

export const StudentProgressView: React.FC<StudentProgressViewProps> = ({
  student,
  group,
  meeting,
  onBackToDashboard,
}) => {
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');

  if (!student || !meeting) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
        Memuat data perkembangan...
      </div>
    );
  }

  const progress = storageService.calculateStudentProgress(student.id, meeting.id);
  const selfAss = storageService.getSelfAssessment(student.id, meeting.id);
  const peerReviewsReceivedL2 = storageService.getPeerAssessmentsReceivedByStudent(student.id, meeting.id, 2);
  const peerReviewsReceivedL3 = storageService.getPeerAssessmentsReceivedByStudent(student.id, meeting.id, 3);
  const finalReflection = storageService.getFinalReflection(student.id, meeting.id);

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinMessage('');

    if (newPin.length < 4 || newPin.length > 6) {
      setPinMessage('PIN baru harus 4 sampai 6 digit angka.');
      return;
    }

    storageService.activateStudentPin(student.id, newPin);
    setPinMessage('✓ PIN Anda berhasil diperbarui!');
    setCurrentPin('');
    setNewPin('');
    setTimeout(() => setPinMessage(''), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Analisis Reflektif Mahasiswa
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            PERKEMBANGAN & PROFIL SAYA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Pantau peningkatan kompetensi presentasi Anda dari Latihan 1 (Mandiri) hingga Latihan 3 (Simulasi Kelas).
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
        >
          ← Kembali ke Dashboard
        </button>
      </div>

      {/* OVERALL STAGE STATUS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          1. STATUS KELENGKAPAN TAHAP LATIHAN
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Tahap 1
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Latihan Mandiri</h4>
            <div className="text-xs">
              {progress.latihan1.is_complete ? (
                <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ Selesai
                </span>
              ) : (
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Belum Selesai
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Audio rekaman pribadi & evaluasi diri privat.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Tahap 2
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Latihan Bersama Kelompok</h4>
            <div className="text-xs">
              {progress.latihan2.is_complete ? (
                <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ Selesai
                </span>
              ) : (
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Belum Selesai
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Latihan kelompok di luar jam kuliah & peer feedback.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Tahap 3
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-2">Simulasi Presentasi di Kelas</h4>
            <div className="text-xs">
              {progress.latihan3.is_complete ? (
                <span className="text-emerald-700 font-extrabold bg-emerald-100 px-2 py-0.5 rounded">
                  ✓ Selesai
                </span>
              ) : (
                <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded">
                  Belum Selesai
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Simulasi jam kuliah, penilaian teman, & refleksi akhir.
            </p>
          </div>
        </div>
      </div>

      {/* PEER REVIEWS RECEIVED */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-extrabold text-slate-900">
            2. FEEDBACK YANG DITERIMA DARI TEMAN KELOMPOK
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Gunakan masukan konstruktif teman sebagai fokus perbaikan Anda.
          </p>
        </div>

        {peerReviewsReceivedL2.length === 0 && peerReviewsReceivedL3.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-slate-500 text-xs">
            Belum ada feedback yang masuk dari teman kelompok untuk pertemuan ini.
          </div>
        ) : (
          <div className="space-y-3">
            {peerReviewsReceivedL2.map((rev) => {
              const reviewer = storageService.getStudentById(rev.reviewer_student_id);
              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Dari: {reviewer?.name || 'Teman Kelompok'} (Latihan 2)
                    </span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded">
                      Kejelasan: {rev.clarity}
                    </span>
                  </div>
                  <p className="text-emerald-800 font-medium">
                    <strong className="text-emerald-950">✓ Hal Baik:</strong> "{rev.positive_feedback}"
                  </p>
                  <p className="text-amber-800 font-medium">
                    <strong className="text-amber-950">△ Saran Perbaikan:</strong> "{rev.improvement_feedback}"
                  </p>
                </div>
              );
            })}

            {peerReviewsReceivedL3.map((rev) => {
              const reviewer = storageService.getStudentById(rev.reviewer_student_id);
              return (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl border border-slate-200 bg-emerald-50/40 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Dari: {reviewer?.name || 'Teman Kelompok'} (Latihan 3 Final)
                    </span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-mono px-2 py-0.5 rounded">
                      Kejelasan: {rev.clarity}
                    </span>
                  </div>
                  <p className="text-emerald-800 font-medium">
                    <strong className="text-emerald-950">✓ Hal Baik:</strong> "{rev.positive_feedback}"
                  </p>
                  <p className="text-amber-800 font-medium">
                    <strong className="text-amber-950">△ Saran Hari-H:</strong> "{rev.improvement_feedback}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FINAL REFLECTION PREVIEW */}
      {finalReflection && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
            3. REFLEKSI AKHIR ANDA
          </h3>
          <div className="space-y-3 text-xs text-slate-700">
            <div>
              <span className="text-slate-400 font-semibold block">Tingkat Kesiapan:</span>
              <strong className="text-emerald-800 text-sm uppercase">{finalReflection.readiness_level}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Perkembangan yang dirasakan:</span>
              <p className="p-3 bg-slate-50 rounded-xl mt-1 leading-relaxed">{finalReflection.progress_felt}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Bagian yang dikuasai:</span>
              <p className="p-3 bg-slate-50 rounded-xl mt-1 leading-relaxed">{finalReflection.mastered_parts}</p>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block">Fokus saat presentasi sebenarnya:</span>
              <p className="p-3 bg-slate-50 rounded-xl mt-1 leading-relaxed">{finalReflection.focus_parts}</p>
            </div>
          </div>
        </div>
      )}

      {/* PROFIL & KEAMANAN PIN */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
          4. PROFIL & PIN KEAMANAN MAHASISWA
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Nama Lengkap:</span>
            <strong className="text-slate-800 text-sm">{student.name}</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Kelompok & Room Code:</span>
            <strong className="text-slate-800 text-sm">
              {group.name} ({group.room_code})
            </strong>
          </div>
        </div>

        {/* Change PIN Form */}
        <form onSubmit={handleUpdatePin} className="mt-4 pt-4 border-t border-slate-100 space-y-3 max-w-sm">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Ganti PIN Pribadi
          </label>
          <input
            type="password"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
            placeholder="Masukkan PIN baru (4-6 digit angka)"
            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono"
            required
          />
          {pinMessage && (
            <p className="text-xs text-emerald-700 font-semibold">{pinMessage}</p>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Perbarui PIN
          </button>
        </form>
      </div>
    </div>
  );
};
