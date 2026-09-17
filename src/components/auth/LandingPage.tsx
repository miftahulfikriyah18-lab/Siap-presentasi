import React from 'react';

interface LandingPageProps {
  onSelectStudent: () => void;
  onSelectLecturer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectStudent,
  onSelectLecturer,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full text-center mb-10">
        {/* Academic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
          Platform Latihan Presentasi Akademik Terstruktur
        </div>

        {/* Main Header */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          SIAP PRESENTASI
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-lg sm:text-xl font-semibold text-slate-700">
          Latihan. Evaluasi. Perbaiki. Presentasikan dengan percaya diri.
        </p>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          SIAP PRESENTASI membantu mahasiswa melakukan latihan presentasi secara bertahap,
          mengevaluasi kemampuan diri, mendapatkan feedback dari teman, dan memantau perkembangan
          sebelum presentasi sebenarnya di depan kelas.
        </p>
      </div>

      {/* Process Pipeline Overview */}
      <div className="max-w-3xl w-full mb-10 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 text-center">
          Alur Wajib 3 Tahap Latihan Setiap Pertemuan
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
            <span className="text-[11px] font-bold text-blue-600 mb-1">Tahap 1</span>
            <span className="text-sm font-bold text-slate-900">Latihan Mandiri</span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Rekam suara, dengarkan kembali rekaman diri, dan isi evaluasi diri privat.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
            <span className="text-[11px] font-bold text-indigo-600 mb-1">Tahap 2</span>
            <span className="text-sm font-bold text-slate-900">Latihan Bersama Kelompok</span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Presentasi bergiliran di luar jam kuliah, saling memberi peer feedback, dan unggah bukti diskusi.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col">
            <span className="text-[11px] font-bold text-emerald-600 mb-1">Tahap 3</span>
            <span className="text-sm font-bold text-slate-900">Simulasi Kelas</span>
            <p className="text-xs text-slate-500 mt-1 leading-normal">
              Simulasi saat jam perkuliahan, peer assessment final, dan refleksi kesiapan presentasi.
            </p>
          </div>
        </div>
      </div>

      {/* Two Large Action Cards: Mahasiswa and Dosen */}
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mahasiswa Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-500 p-8 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold mb-5 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">MAHASISWA</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Buat atau masuki room kelompok Anda. Rekam latihan mandiri, beri masukan untuk teman, dan pantau progres pribadi Anda.
            </p>
          </div>
          <button
            id="btn-enter-student"
            type="button"
            onClick={onSelectStudent}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk sebagai Mahasiswa</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>

        {/* Dosen Card */}
        <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-emerald-500 p-8 flex flex-col justify-between transition-all duration-150 shadow-xs hover:shadow-md group">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold mb-5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">DOSEN</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              Pantau bukti latihan seluruh mahasiswa dan kelompok secara real-time. Periksa rekaman Drive, evaluasi, dan daftar mahasiswa yang belum lengkap.
            </p>
          </div>
          <button
            id="btn-enter-lecturer"
            type="button"
            onClick={onSelectLecturer}
            className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-bold rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masuk sebagai Dosen</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-slate-400">
        SIAP PRESENTASI &bull; Sistem Akuntabilitas Latihan Presentasi Akademik
      </div>
    </div>
  );
};
