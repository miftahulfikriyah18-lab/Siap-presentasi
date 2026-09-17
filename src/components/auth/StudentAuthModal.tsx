import React, { useState } from 'react';
import { storageService } from '../../lib/storage';
import { Group, Student, ClassItem } from '../../types';

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (student: Student, group: Group) => void;
}

type TabType = 'join' | 'create';

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('join');

  // Join Room State
  const [roomCodeInput, setRoomCodeInput] = useState('KIM-7AX29');
  const [matchedGroup, setMatchedGroup] = useState<Group | null>(null);
  const [groupStudents, setGroupStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [pinInput, setPinInput] = useState('1234');
  const [confirmPinInput, setConfirmPinInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Create Room State
  const [classNameInput, setClassNameInput] = useState('Kimia Organik');
  const [groupNameInput, setGroupNameInput] = useState('');
  const [memberNames, setMemberNames] = useState<string[]>(['', '', '', '']);
  const [createdResult, setCreatedResult] = useState<{ group: Group; students: Student[] } | null>(null);

  if (!isOpen) return null;

  const classes = storageService.getClasses();

  // Search Room
  const handleFindRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!roomCodeInput.trim()) {
      setErrorMessage('Masukkan Room Code kelompok Anda.');
      return;
    }

    const group = storageService.getGroupByRoomCode(roomCodeInput);
    if (!group) {
      setErrorMessage('Room Code tidak ditemukan. Pastikan kode sudah benar (contoh: KIM-7AX29).');
      setMatchedGroup(null);
      return;
    }

    const students = storageService.getStudentsByGroupId(group.id);
    setMatchedGroup(group);
    setGroupStudents(students);
    if (students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  };

  // Login or Activate PIN
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!matchedGroup || !selectedStudentId) {
      setErrorMessage('Pilih nama mahasiswa.');
      return;
    }

    const student = groupStudents.find((s) => s.id === selectedStudentId);
    if (!student) {
      setErrorMessage('Data mahasiswa tidak valid.');
      return;
    }

    // If student is not activated, they must create a PIN
    if (!student.is_activated) {
      if (!pinInput || pinInput.length < 4 || pinInput.length > 6) {
        setErrorMessage('PIN harus terdiri dari 4 sampai 6 digit angka.');
        return;
      }
      if (pinInput !== confirmPinInput) {
        setErrorMessage('Konfirmasi PIN tidak cocok. Silakan ulangi.');
        return;
      }
      storageService.activateStudentPin(student.id, pinInput);
      const updatedStudent = storageService.getStudentById(student.id)!;
      onLoginSuccess(updatedStudent, matchedGroup);
      return;
    }

    // If activated, verify PIN
    if (student.pin !== pinInput) {
      setErrorMessage('PIN salah. Silakan coba lagi.');
      return;
    }

    onLoginSuccess(student, matchedGroup);
  };

  const handleAddMember = () => {
    setMemberNames((prev) => [...prev, '']);
  };

  const handleRemoveMember = (idxToRemove: number) => {
    if (memberNames.length <= 1) return;
    setMemberNames((prev) => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const handleSetPresetCount = (count: number) => {
    setMemberNames((prev) => {
      const updated = [...prev];
      if (count > updated.length) {
        while (updated.length < count) {
          updated.push('');
        }
      } else {
        updated.splice(count);
      }
      return updated;
    });
  };

  // Create Room Submit
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!classNameInput.trim()) {
      setErrorMessage('Pilih atau masukkan nama kelas.');
      return;
    }
    if (!groupNameInput.trim()) {
      setErrorMessage('Masukkan nama kelompok.');
      return;
    }

    const trimmedNames = memberNames.map((n) => n.trim());
    const emptyIndex = trimmedNames.findIndex((n) => n.length === 0);
    if (emptyIndex !== -1) {
      setErrorMessage(`Mohon isi nama pada Anggota ${emptyIndex + 1}, atau hapus baris anggota yang tidak digunakan.`);
      return;
    }
    if (trimmedNames.length === 0) {
      setErrorMessage('Mohon isi minimal 1 nama anggota kelompok.');
      return;
    }

    let cls = classes.find((c) => c.name.toLowerCase() === classNameInput.trim().toLowerCase());
    if (!cls) {
      cls = storageService.addClass(classNameInput.trim(), 'CLS-' + Date.now().toString().slice(-4));
    }

    const res = storageService.createGroup(cls.id, groupNameInput.trim(), trimmedNames);
    setCreatedResult(res);
  };

  const selectedStudentObj = groupStudents.find((s) => s.id === selectedStudentId);

  return (
    <div
      id="student-auth-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('join');
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === 'join'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk Room
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('create');
              setErrorMessage('');
            }}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
              activeTab === 'create'
                ? 'border-slate-900 text-slate-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Buat Room Kelompok
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: MASUK ROOM */}
          {activeTab === 'join' && (
            <div>
              {!matchedGroup ? (
                <form onSubmit={handleFindRoom} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Room Code
                    </label>
                    <input
                      type="text"
                      value={roomCodeInput}
                      onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                      placeholder="Contoh: KIM-7AX29"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-mono tracking-wider font-semibold placeholder:text-slate-400 uppercase"
                      required
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Masukkan kode room yang dibagikan oleh pembuat kelompok Anda.
                    </p>
                  </div>

                  {/* Demo Shortcut Box */}
                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-slate-600">
                    <span className="font-bold text-blue-900 block mb-1">Demo Kelas Kimia Organik:</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-800">Room Code: KIM-7AX29</span>
                      <button
                        type="button"
                        onClick={() => {
                          setRoomCodeInput('KIM-7AX29');
                          const grp = storageService.getGroupByRoomCode('KIM-7AX29');
                          if (grp) {
                            setMatchedGroup(grp);
                            const st = storageService.getStudentsByGroupId(grp.id);
                            setGroupStudents(st);
                            if (st.length > 0) setSelectedStudentId(st[0].id);
                          }
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-[11px] cursor-pointer"
                      >
                        Pakai Demo Room
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Cari Room
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleStudentSubmit} className="space-y-4">
                  {/* Room Summary */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Kelompok Ditemukan:</span>
                      <span className="text-sm font-bold text-slate-900">{matchedGroup.name}</span>
                      <span className="text-xs text-slate-500 ml-2">({matchedGroup.room_code})</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMatchedGroup(null)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
                    >
                      Ganti Room
                    </button>
                  </div>

                  {/* Select Student Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Pilih Nama Mahasiswa
                    </label>
                    <select
                      value={selectedStudentId}
                      onChange={(e) => {
                        setSelectedStudentId(e.target.value);
                        setPinInput('');
                        setConfirmPinInput('');
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-medium"
                    >
                      {groupStudents.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name} {s.is_activated ? '(Sudah Aktif)' : '(Perlu Aktivasi PIN)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Activation or PIN Entry */}
                  {selectedStudentObj && !selectedStudentObj.is_activated ? (
                    <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                      <div>
                        <span className="text-xs font-bold text-amber-900 block">Aktivasi Profil Mahasiswa</span>
                        <p className="text-[11px] text-amber-800 leading-normal mt-0.5">
                          Profil Anda belum aktif. Buat PIN rahasia 4–6 digit untuk mengakses akun Anda di kemudian hari.
                        </p>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Buat PIN (4-6 digit angka)
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Contoh: 1234"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm tracking-widest font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Konfirmasi PIN
                        </label>
                        <input
                          type="password"
                          maxLength={6}
                          value={confirmPinInput}
                          onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                          placeholder="Ulangi PIN di atas"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm tracking-widest font-mono"
                          required
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          PIN Pribadi
                        </label>
                        <span className="text-[11px] text-slate-400">Default demo: 1234</span>
                      </div>
                      <input
                        type="password"
                        maxLength={6}
                        value={pinInput}
                        onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                        placeholder="Masukkan 4-6 digit PIN"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-mono tracking-widest"
                        required
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setMatchedGroup(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {selectedStudentObj && !selectedStudentObj.is_activated
                        ? 'Aktivasi Profil & Masuk'
                        : 'Masuk Dashboard'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 2: BUAT ROOM KELOMPOK */}
          {activeTab === 'create' && (
            <div>
              {createdResult ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Room Berhasil Dibuat!</h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-w-sm mx-auto">
                    <span className="text-xs text-slate-500 block mb-1">ROOM CODE KELOMPOK</span>
                    <span className="text-2xl font-black font-mono tracking-widest text-slate-900">
                      {createdResult.group.room_code}
                    </span>
                    <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded-lg mt-3 font-medium">
                      “Bagikan Room Code ini hanya kepada anggota kelompok Anda.”
                    </p>
                  </div>
                  <div className="text-left text-xs text-slate-600 max-w-sm mx-auto">
                    <span className="font-bold text-slate-800 block mb-1.5">Anggota Terdaftar:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {createdResult.students.map((s) => (
                        <li key={s.id}>{s.name} (perlu aktivasi PIN saat login)</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRoomCodeInput(createdResult.group.room_code);
                      setMatchedGroup(createdResult.group);
                      setGroupStudents(createdResult.students);
                      setSelectedStudentId(createdResult.students[0].id);
                      setCreatedResult(null);
                      setActiveTab('join');
                    }}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Lanjut Masuk & Aktivasi Akun
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreateRoom} className="space-y-4">
                  {/* Nama Kelas */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Kelas
                    </label>
                    <input
                      type="text"
                      value={classNameInput}
                      onChange={(e) => setClassNameInput(e.target.value)}
                      placeholder="Contoh: Kimia Organik"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Nama Kelompok */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Nama Kelompok
                    </label>
                    <input
                      type="text"
                      value={groupNameInput}
                      onChange={(e) => setGroupNameInput(e.target.value)}
                      placeholder="Contoh: Kelompok 3"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm font-medium"
                      required
                    />
                  </div>

                  {/* Jumlah Anggota Bebas */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                        Jumlah Anggota ({memberNames.length} Orang)
                      </label>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        Bebas berapa saja
                      </span>
                    </div>
                    {/* Quick Presets */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                      <span className="text-[11px] text-slate-500 font-medium mr-1">Pilihan Cepat:</span>
                      {[2, 3, 4, 5, 6, 7, 8].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => handleSetPresetCount(count)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg border cursor-pointer transition-colors ${
                            memberNames.length === count
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {count}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={handleAddMember}
                        className="px-2.5 py-1 text-xs font-bold rounded-lg border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 cursor-pointer flex items-center gap-1 ml-auto"
                      >
                        <span>+ Tambah Anggota</span>
                      </button>
                    </div>
                  </div>

                  {/* Dynamic Member Names Input */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Daftar Nama Anggota Kelompok
                    </label>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {memberNames.map((name, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500 w-5 text-right shrink-0">
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                              const updated = [...memberNames];
                              updated[idx] = e.target.value;
                              setMemberNames(updated);
                            }}
                            placeholder={`Nama Lengkap Anggota ${idx + 1}`}
                            className="flex-1 px-3.5 py-2 rounded-lg border border-slate-300 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 text-sm"
                            required
                          />
                          {memberNames.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(idx)}
                              title="Hapus baris anggota ini"
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="w-full py-2 border-2 border-dashed border-slate-300 hover:border-slate-500 text-slate-600 hover:text-slate-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span>Tambah Anggota Lagi (Bebas / Tidak Dibatasi)</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      BUAT ROOM
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
