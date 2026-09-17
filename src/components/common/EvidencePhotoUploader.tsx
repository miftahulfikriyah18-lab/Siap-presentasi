import React, { useRef, useState } from 'react';

interface EvidencePhotoUploaderProps {
  photoUrl?: string;
  onPhotoChange: (url: string) => void;
  label?: string;
  description?: string;
}

export const EvidencePhotoUploader: React.FC<EvidencePhotoUploaderProps> = ({
  photoUrl,
  onPhotoChange,
  label = 'Foto Bukti / Dokumentasi Kegiatan',
  description = 'Unggah foto kegiatan latihan (misal: foto pertemuan tatap muka, screenshot online meeting, atau foto catatan/slide)',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height && width > MAX_DIM) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else if (height > MAX_DIM) {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          onPhotoChange(compressed);
        } else {
          onPhotoChange(e.target?.result as string);
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onPhotoChange(urlInput.trim());
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
        >
          {showUrlInput ? 'Tutup Input URL' : 'Atau Masukkan Link URL Foto'}
        </button>
      </div>

      <p className="text-[11px] text-slate-500 leading-normal">
        {description}
      </p>

      {/* Alternative URL Input Form */}
      {showUrlInput && (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://... (Link foto langsung atau Google Drive)"
            className="flex-1 px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-xs"
          />
          <button
            type="button"
            onClick={handleUrlSubmit}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 cursor-pointer"
          >
            Terapkan Link
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Photo Preview or Upload Zone */}
      {photoUrl ? (
        <div className="relative rounded-2xl border-2 border-emerald-200 bg-emerald-50/30 p-3 overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-48 h-36 bg-slate-900 rounded-xl overflow-hidden shadow-inner shrink-0 flex items-center justify-center">
              <img
                src={photoUrl}
                alt="Bukti Kegiatan Latihan"
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                ✓ Foto Terunggah
              </span>
            </div>
            <div className="flex-1 space-y-2 text-center sm:text-left">
              <div>
                <span className="text-xs font-extrabold text-emerald-900 block">
                  Foto Bukti Kegiatan Berhasil Dilampirkan
                </span>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Foto ini akan tersimpan dan dapat diverifikasi oleh dosen pembimbing.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 shadow-xs cursor-pointer"
                >
                  Ganti Foto
                </button>
                <button
                  type="button"
                  onClick={() => onPhotoChange('')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 cursor-pointer"
                >
                  Hapus Foto
                </button>
                {photoUrl.startsWith('http') && (
                  <a
                    href={photoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 text-blue-600 hover:text-blue-800 text-xs font-bold underline"
                  >
                    Buka Gambar Penuh ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
              : 'border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-2.5">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-xs font-bold text-slate-800 block mb-1">
            Klik untuk memilih foto atau seret (drag & drop) ke sini
          </span>
          <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
            Format: JPG, PNG, atau WEBP dari HP/Laptop. Foto otomatis disesuaikan ukurannya.
          </p>
        </div>
      )}
    </div>
  );
};
