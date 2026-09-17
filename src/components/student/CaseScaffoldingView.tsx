import React, { useState, useEffect } from 'react';
import { Assignment, ScaffoldingQuestion } from '../../types';
import { storageService } from '../../lib/storage';

interface CaseScaffoldingViewProps {
  classId: string;
  onSaveSuccess: () => void;
}

export const CaseScaffoldingView: React.FC<CaseScaffoldingViewProps> = ({
  classId,
  onSaveSuccess,
}) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [caseText, setCaseText] = useState('');
  const [caseImage, setCaseImage] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<{ id?: string; question_text: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  // Load existing assignment & questions
  useEffect(() => {
    let existingAssign = storageService.getAssignmentByClassId(classId);
    if (!existingAssign) {
      const all = storageService.getAssignments();
      if (all.length > 0) existingAssign = all[0];
    }

    if (existingAssign) {
      setAssignment(existingAssign);
      setTitle(existingAssign.title);
      setCaseText(existingAssign.case_text);
      setCaseImage(existingAssign.case_image);

      const qs = storageService.getQuestionsByAssignmentId(existingAssign.id);
      if (qs.length > 0) {
        setQuestions(qs.map((q) => ({ id: q.id, question_text: q.question_text })));
      } else {
        // Default 7 template questions if none
        setQuestions([
          { question_text: 'Apa latar belakang masalah dan konsep utama Pendidikan Agama Islam dalam studi kasus ini?' },
          { question_text: 'Bagaimana analisis sumber dalil (Al-Qur\'an & Hadis) serta pandangan ulama terkait persoalan ini?' },
          { question_text: 'Jelaskan faktor penyebab dan dinamika sosial keagamaan yang terjadi di masyarakat!' },
          { question_text: 'Bagaimana telaah kritis terhadap fenomena tersebut dalam perspektif etika & aqidah Islam?' },
          { question_text: 'Apa dampak terhadap generasi muda dan keharmonisan umat jika permasalahan ini dibiarkan?' },
          { question_text: 'Rekomendasi solusi edukatif dan pendekatan dakwah apa yang paling tepat diterapkan?' },
          { question_text: 'Bagaimana kesimpulan akhir dan refleksi moral-spiritual yang dapat diambil kelompok?' },
        ]);
      }
    } else {
      setTitle('Tugas Presentasi Kasus');
      setCaseText('');
      setQuestions([
        { question_text: 'Pertanyaan penuntun 1...' },
        { question_text: 'Pertanyaan penuntun 2...' },
        { question_text: 'Pertanyaan penuntun 3...' },
        { question_text: 'Pertanyaan penuntun 4...' },
        { question_text: 'Pertanyaan penuntun 5...' },
        { question_text: 'Pertanyaan penuntun 6...' },
        { question_text: 'Pertanyaan penuntun 7...' },
      ]);
    }
  }, [classId]);

  // Handle Image Upload (file to data URL)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCaseImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question_text: '' }]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    setQuestions(updated);
    setDeleteConfirmIndex(null);
  };

  const handleQuestionChange = (index: number, text: string) => {
    const updated = [...questions];
    updated[index].question_text = text;
    setQuestions(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const assignmentId = assignment ? assignment.id : 'assign-' + Date.now();
    const updatedAssignment: Assignment = {
      id: assignmentId,
      class_id: classId,
      title: title.trim() || 'Kasus Presentasi',
      case_text: caseText.trim(),
      case_image: caseImage,
      created_at: assignment?.created_at || new Date().toISOString(),
    };

    storageService.saveAssignment(updatedAssignment);
    storageService.saveQuestions(assignmentId, questions);
    setAssignment(updatedAssignment);
    setIsEditing(false);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    onSaveSuccess();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-1">
            Panduan Pembelajaran
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            KASUS & SCAFFOLDING
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
            Kasus tugas dan pertanyaan penuntun (scaffolding) sebagai acuan seluruh anggota kelompok dalam menyusun penjelasan presentasi.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedNotice && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-in fade-in">
              ✓ Tersimpan
            </span>
          )}
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span>Edit Kasus & Scaffolding</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Batal Edit
            </button>
          )}
        </div>
      </div>

      {/* Main Form or Display */}
      {isEditing ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* SECTION 1: DATA KASUS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
              1. INFORMASI KASUS
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Judul Kasus
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Analisis Penerapan Nilai Moderasi Beragama dalam Masyarakat Multikultural"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-semibold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Isi & Deskripsi Kasus
              </label>
              <textarea
                rows={6}
                value={caseText}
                onChange={(e) => setCaseText(e.target.value)}
                placeholder="Salin atau ketik uraian kasus yang diberikan oleh dosen pengampu..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm leading-relaxed"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Gambar Kasus (Opsional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
              />
              {caseImage && (
                <div className="mt-3 relative inline-block rounded-xl overflow-hidden border border-slate-200 max-w-sm">
                  <img src={caseImage} alt="Preview Kasus" className="max-h-56 object-cover" />
                  <button
                    type="button"
                    onClick={() => setCaseImage(undefined)}
                    className="absolute top-2 right-2 bg-slate-900/80 text-white p-1 rounded-md text-xs hover:bg-slate-900"
                  >
                    Hapus Gambar
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: SCAFFOLDING QUESTIONS */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  2. PERTANYAAN SCAFFOLDING
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pertanyaan terstruktur untuk membimbing mahasiswa saat berlatih menjelaskan studi kasus.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>+ Tambah Pertanyaan</span>
              </button>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={q.question_text}
                      onChange={(e) => handleQuestionChange(idx, e.target.value)}
                      placeholder={`Pertanyaan Scaffolding ${idx + 1}...`}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-xs sm:text-sm bg-white"
                      required
                    />
                  </div>
                  {questions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmIndex(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Hapus pertanyaan ini"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* READ-ONLY DISPLAY VIEW */
        <div className="space-y-6">
          {/* Card Kasus */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {title || 'Tugas Kasus Presentasi'}
            </h2>

            {caseImage && (
              <div className="rounded-xl overflow-hidden border border-slate-200 max-h-96 bg-slate-100 flex items-center justify-center">
                <img src={caseImage} alt="Ilustrasi Kasus" className="max-h-96 w-full object-contain" />
              </div>
            )}

            <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Uraian Masalah & Kasus:
              </span>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line font-medium">
                {caseText || 'Belum ada uraian kasus yang dimasukkan.'}
              </p>
            </div>
          </div>

          {/* Card Scaffolding Questions */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Pertanyaan Scaffolding ({questions.length} Pertanyaan)
                </h3>
                <p className="text-xs text-slate-500">
                  Gunakan urutan pertanyaan ini sebagai kerangka penjelasan Anda saat presentasi.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-colors"
                >
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-black text-xs flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                    {idx + 1}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed pt-0.5">
                    {q.question_text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Deleting a Scaffolding Question (Requirement 47) */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900">Hapus Pertanyaan Scaffolding?</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pertanyaan nomor {deleteConfirmIndex + 1} akan dihapus dari referensi latihan kelompok.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmIndex(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleRemoveQuestion(deleteConfirmIndex)}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
