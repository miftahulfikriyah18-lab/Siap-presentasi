import {
  ClassItem,
  Group,
  Student,
  Assignment,
  ScaffoldingQuestion,
  Meeting,
  AudioSubmission,
  SelfAssessment,
  PeerAssessment,
  GroupEvidence,
  FinalReflection,
  StudentMeetingProgress,
  MissingTaskRecord,
} from '../types';

const STORAGE_KEYS = {
  CLASSES: 'siap_pres_classes',
  GROUPS: 'siap_pres_groups',
  STUDENTS: 'siap_pres_students',
  ASSIGNMENTS: 'siap_pres_assignments',
  QUESTIONS: 'siap_pres_questions',
  MEETINGS: 'siap_pres_meetings',
  AUDIO: 'siap_pres_audio',
  SELF_ASSESSMENTS: 'siap_pres_self_assessments',
  PEER_ASSESSMENTS: 'siap_pres_peer_assessments',
  GROUP_EVIDENCE: 'siap_pres_group_evidence',
  FINAL_REFLECTIONS: 'siap_pres_final_reflections',
  INITIALIZED: 'siap_pres_initialized_v2',
};

// URL validation helper for Google Drive
export function validateDriveUrl(url: string): { isValid: boolean; message?: string } {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return { isValid: false, message: 'Link Google Drive tidak boleh kosong.' };
  }
  const clean = url.trim();
  try {
    const parsed = new URL(clean);
    if (!parsed.hostname.includes('drive.google.com') && !parsed.hostname.includes('google.com')) {
      return {
        isValid: false,
        message: 'Link rekaman belum valid. Pastikan menggunakan tautan dari drive.google.com',
      };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      message: 'Format URL tidak valid. Masukkan link lengkap (contoh: https://drive.google.com/...)',
    };
  }
}

// Storage helpers
function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) return defaultValue;
    return JSON.parse(data) as T;
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage`, e);
  }
}

// Initial demo data seed
export function seedInitialData(force = false) {
  if (!force && localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
    return;
  }

  const defaultClassId = 'class-kimia-org';
  const defaultAssignmentId = 'assign-1';
  const defaultMeetingId = 'meeting-1';
  const defaultGroupId = 'group-1';

  const classes: ClassItem[] = [
    {
      id: defaultClassId,
      name: 'Kimia Organik',
      code: 'KIM-2024',
      created_at: new Date().toISOString(),
    },
    {
      id: 'class-biokimia',
      name: 'Biokimia Farmasi',
      code: 'BIO-2024',
      created_at: new Date().toISOString(),
    },
  ];

  const groups: Group[] = [
    {
      id: defaultGroupId,
      class_id: defaultClassId,
      name: 'Kelompok 1',
      room_code: 'KIM-7AX29',
      created_at: new Date().toISOString(),
    },
    {
      id: 'group-2',
      class_id: defaultClassId,
      name: 'Kelompok 2',
      room_code: 'KIM-9BK44',
      created_at: new Date().toISOString(),
    },
  ];

  const students: Student[] = [
    {
      id: 'std-aisyah',
      group_id: defaultGroupId,
      name: 'Aisyah',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-fikri',
      group_id: defaultGroupId,
      name: 'Fikri',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-ismi',
      group_id: defaultGroupId,
      name: 'Ismi',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-rafi',
      group_id: defaultGroupId,
      name: 'Rafi',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    // Kelompok 2 students
    {
      id: 'std-ahmad',
      group_id: 'group-2',
      name: 'Ahmad',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-rina',
      group_id: 'group-2',
      name: 'Rina',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'std-budi',
      group_id: 'group-2',
      name: 'Budi',
      pin: '1234',
      is_activated: true,
      created_at: new Date().toISOString(),
    },
  ];

  const assignments: Assignment[] = [
    {
      id: defaultAssignmentId,
      class_id: defaultClassId,
      title: 'Analisis Cemaran Benzena pada Produk Farmasi Cair',
      case_text: `Sebuah industri farmasi menemukan indikasi adanya residu hidrokarbon aromatik benzena pada salah satu batch sediaan sirup analgetik yang menggunakan pelarut gliserol sintetik. Sebagai tim analis kimia organik dan penjaminan mutu, Anda diminta mempresentasikan analisis komprehensif mengenai kemungkinan rute kontaminasi, sifat karsinogenisitas senyawa aromatik dibandingkan hidrokarbon alifatik, serta metode eliminasi cemaran sesuai standar Farmakope Indonesia.`,
      case_image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
      created_at: new Date().toISOString(),
    },
  ];

  const questions: ScaffoldingQuestion[] = [
    {
      id: 'q-1',
      assignment_id: defaultAssignmentId,
      question_number: 1,
      question_text: 'Bagaimana karakteristik struktur cincin benzena dan sifat stabilitas resonansinya dibandingkan alkena biasa?',
    },
    {
      id: 'q-2',
      assignment_id: defaultAssignmentId,
      question_number: 2,
      question_text: 'Jelaskan kemungkinan mekanisme timbulnya benzena dari dekomposisi bahan baku atau pelarut sintetik!',
    },
    {
      id: 'q-3',
      assignment_id: defaultAssignmentId,
      question_number: 3,
      question_text: 'Mengapa benzena memiliki profil toksisitas yang jauh lebih berbahaya dibandingkan toluena atau senyawa alkil benzena lain?',
    },
    {
      id: 'q-4',
      assignment_id: defaultAssignmentId,
      question_number: 4,
      question_text: 'Metode analisis spektroskopi atau kromatografi apa yang paling sensitif untuk mengonfirmasi keberadaan jejak benzena?',
    },
    {
      id: 'q-5',
      assignment_id: defaultAssignmentId,
      question_number: 5,
      question_text: 'Bagaimana prinsip pemisahan fisik-kimia (misal distilasi fraksionasi atau adsorpsi) untuk menghilangkan residu pelarut?',
    },
    {
      id: 'q-6',
      assignment_id: defaultAssignmentId,
      question_number: 6,
      question_text: 'Apa regulasi batas ambang cemaran benzena menurut ketentuan BPOM dan ICH Guidelines?',
    },
    {
      id: 'q-7',
      assignment_id: defaultAssignmentId,
      question_number: 7,
      question_text: 'Rekomendasi teknis apa yang Anda berikan kepada tim produksi agar masalah serupa tidak terulang kembali?',
    },
  ];

  const meetings: Meeting[] = [
    {
      id: defaultMeetingId,
      class_id: defaultClassId,
      assignment_id: defaultAssignmentId,
      meeting_number: 1,
      title: 'Pertemuan 1: Presentasi Kasus Reaksi Senyawa Aromatik',
    },
    {
      id: 'meeting-2',
      class_id: defaultClassId,
      assignment_id: defaultAssignmentId,
      meeting_number: 2,
      title: 'Pertemuan 2: Mekanisme Reaksi Substitusi Elektrofilik',
    },
  ];

  // Pre-seed mock submissions to allow instant testing of all flows:
  // Aisyah: L1 complete, L2 complete, L3 complete -> SIAP PRESENTASI
  // Fikri: L1 complete, L2 complete, L3 in progress
  // Ismi: L1 complete, L2 in progress
  // Rafi: L1 complete, L2 complete, L3 in progress

  const audioSubmissions: AudioSubmission[] = [
    // Aisyah
    {
      id: 'aud-ais-1',
      student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 1,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1AisyahPractice1CompleteSampleLink/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'aud-ais-2',
      student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1AisyahPractice2GroupRecordedAudio/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 'aud-ais-3',
      student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 3,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1AisyahPractice3ClassSimulationAudio/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    // Fikri
    {
      id: 'aud-fik-1',
      student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      practice_number: 1,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1FikriPractice1AudioSubmissionDrive/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 46).toISOString(),
    },
    {
      id: 'aud-fik-2',
      student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1FikriPractice2AudioSubmissionDrive/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 22).toISOString(),
    },
    // Ismi
    {
      id: 'aud-ism-1',
      student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      practice_number: 1,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1IsmiPractice1AudioDriveLinkProof/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 40).toISOString(),
    },
    // Rafi
    {
      id: 'aud-raf-1',
      student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      practice_number: 1,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1RafiPractice1MandiriAudio/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 42).toISOString(),
    },
    {
      id: 'aud-raf-2',
      student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      recording_mode: 'single',
      drive_url: 'https://drive.google.com/file/d/1RafiPractice2KelompokAudio/view?usp=sharing',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
  ];

  const selfAssessments: SelfAssessment[] = [
    {
      id: 'sa-ais-1',
      student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      text_dependency: 'hanya_poin',
      fluency: 'cukup_lancar',
      case_understanding: 'paham_runtut',
      scaffolding_mastery: 'seluruh_terhubung',
      improvement_note: 'Perlu mempertegas intonasi saat menjelaskan transisi ke mekanisme reaksi di pertanyaan 2.',
      listened_to_audio: true,
      created_at: new Date(Date.now() - 3600000 * 47).toISOString(),
    },
    {
      id: 'sa-fik-1',
      student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      text_dependency: 'membaca_cukup_banyak',
      fluency: 'beberapa_tersendat',
      case_understanding: 'cukup_paham',
      scaffolding_mastery: 'hampir_seluruh',
      improvement_note: 'Masih sering melihat catatan pada pertanyaan 3 dan 4. Target Latihan 2 berbicara lebih santai dan kontak mata.',
      listened_to_audio: true,
      created_at: new Date(Date.now() - 3600000 * 45).toISOString(),
    },
    {
      id: 'sa-ism-1',
      student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      text_dependency: 'membaca_seluruh',
      fluency: 'sering_tersendat',
      case_understanding: 'paham_sebagian',
      scaffolding_mastery: 'sebagian',
      improvement_note: 'Harus mendalami ulang konsep spektroskopi UV-Vis vs GC-MS sebelum presentasi kelompok.',
      listened_to_audio: true,
      created_at: new Date(Date.now() - 3600000 * 39).toISOString(),
    },
    {
      id: 'sa-raf-1',
      student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      text_dependency: 'membaca_cukup_banyak',
      fluency: 'cukup_lancar',
      case_understanding: 'cukup_paham',
      scaffolding_mastery: 'hampir_seluruh',
      improvement_note: 'Perlu mempercepat durasi penjelasan di awal agar tidak melebihi alokasi waktu 10 menit.',
      listened_to_audio: true,
      created_at: new Date(Date.now() - 3600000 * 41).toISOString(),
    },
  ];

  const peerAssessments: PeerAssessment[] = [
    // Latihan 2 Reviews:
    // Aisyah reviews Fikri, Ismi, Rafi
    {
      id: 'pa-ais-to-fik',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'hanya_poin',
      fluency: 'cukup_lancar',
      case_understanding: 'sudah_paham',
      scaffolding_completion: 'hampir_seluruh',
      clarity: 'jelas_runtut',
      positive_feedback: 'Penjelasan struktur cincin aromatis benzena sangat mudah dimengerti.',
      improvement_feedback: 'Jangan terlalu terburu-buru saat menjelaskan kromatografi gas di akhir.',
      created_at: new Date(Date.now() - 3600000 * 23).toISOString(),
    },
    {
      id: 'pa-ais-to-ism',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'membaca_sebagian',
      fluency: 'beberapa_tersendat',
      case_understanding: 'paham_sebagian',
      scaffolding_completion: 'sebagian',
      clarity: 'cukup_mudah',
      positive_feedback: 'Sangat percaya diri membuka presentasi.',
      improvement_feedback: 'Kurangi membaca slide pada pertanyaan 4 dan 5.',
      created_at: new Date(Date.now() - 3600000 * 23).toISOString(),
    },
    {
      id: 'pa-ais-to-raf',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'hanya_poin',
      fluency: 'lancar_runtut',
      case_understanding: 'sudah_paham',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Suara lantang dan contoh kasus di industri sangat kontekstual.',
      improvement_feedback: 'Perhatikan batas waktu 8 menit agar tidak terpotong.',
      created_at: new Date(Date.now() - 3600000 * 23).toISOString(),
    },
    // Fikri reviews Aisyah, Ismi, Rafi
    {
      id: 'pa-fik-to-ais',
      reviewer_student_id: 'std-fikri',
      presenter_student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'tanpa_membaca',
      fluency: 'lancar_runtut',
      case_understanding: 'paham_menghubungkan',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Sangat menguasai materi, penjelasan mengalir tanpa bergantung teks sama sekali!',
      improvement_feedback: 'Bisa ditambah ilustrasi singkat saat menjelaskan rute metabolit toksik di hepar.',
      created_at: new Date(Date.now() - 3600000 * 21).toISOString(),
    },
    {
      id: 'pa-fik-to-ism',
      reviewer_student_id: 'std-fikri',
      presenter_student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'membaca_sebagian',
      fluency: 'beberapa_tersendat',
      case_understanding: 'paham_sebagian',
      scaffolding_completion: 'sebagian',
      clarity: 'cukup_mudah',
      positive_feedback: 'Slide presentasi sangat rapi.',
      improvement_feedback: 'Coba hafalkan poin kunci sehingga tidak perlu menoleh terus ke slide.',
      created_at: new Date(Date.now() - 3600000 * 21).toISOString(),
    },
    {
      id: 'pa-fik-to-raf',
      reviewer_student_id: 'std-fikri',
      presenter_student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'hanya_poin',
      fluency: 'cukup_lancar',
      case_understanding: 'sudah_paham',
      scaffolding_completion: 'hampir_seluruh',
      clarity: 'cukup_mudah',
      positive_feedback: 'Penyampaian studi kasus sangat aplikatif.',
      improvement_feedback: 'Perjelas perbedaan toksisitas antara benzena dan toluena.',
      created_at: new Date(Date.now() - 3600000 * 21).toISOString(),
    },
    // Rafi reviews Aisyah, Fikri, Ismi
    {
      id: 'pa-raf-to-ais',
      reviewer_student_id: 'std-rafi',
      presenter_student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'tanpa_membaca',
      fluency: 'lancar_runtut',
      case_understanding: 'paham_menghubungkan',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Penggunaan analogi memudahkan audiens menangkap resonansi benzena.',
      improvement_feedback: 'Pertahankan gaya presentasi ini saat di depan kelas.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'pa-raf-to-fik',
      reviewer_student_id: 'std-rafi',
      presenter_student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'hanya_poin',
      fluency: 'cukup_lancar',
      case_understanding: 'sudah_paham',
      scaffolding_completion: 'hampir_seluruh',
      clarity: 'cukup_mudah',
      positive_feedback: 'Respon terhadap pertanyaan diskusi sangat baik.',
      improvement_feedback: 'Lebih percaya diri dan jangan cemas.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },
    {
      id: 'pa-raf-to-ism',
      reviewer_student_id: 'std-rafi',
      presenter_student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      practice_number: 2,
      text_dependency: 'membaca_sebagian',
      fluency: 'beberapa_tersendat',
      case_understanding: 'paham_sebagian',
      scaffolding_completion: 'sebagian',
      clarity: 'cukup_mudah',
      positive_feedback: 'Semangat latihan bersama sangat tinggi.',
      improvement_feedback: 'Perlu latihan mandiri sekali lagi sebelum simulasi kelas.',
      created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
    },

    // Latihan 3 Reviews:
    // Aisyah reviews others
    {
      id: 'pa-l3-ais-to-fik',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-fikri',
      meeting_id: defaultMeetingId,
      practice_number: 3,
      text_dependency: 'hanya_poin',
      fluency: 'lancar_runtut',
      case_understanding: 'paham_menghubungkan',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Peningkatan sangat drastis! Sudah tidak membaca dan suara sangat jelas.',
      improvement_feedback: 'Jaga stamina suara sampai slide penutup.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'pa-l3-ais-to-ism',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-ismi',
      meeting_id: defaultMeetingId,
      practice_number: 3,
      text_dependency: 'hanya_poin',
      fluency: 'cukup_lancar',
      case_understanding: 'sudah_paham',
      scaffolding_completion: 'hampir_seluruh',
      clarity: 'cukup_mudah',
      positive_feedback: 'Sudah jauh lebih lancar dibanding Latihan 2!',
      improvement_feedback: 'Fokus pada kesimpulan rekomendasi.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'pa-l3-ais-to-raf',
      reviewer_student_id: 'std-aisyah',
      presenter_student_id: 'std-rafi',
      meeting_id: defaultMeetingId,
      practice_number: 3,
      text_dependency: 'tanpa_membaca',
      fluency: 'lancar_runtut',
      case_understanding: 'paham_menghubungkan',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Penguasaan panggung sangat siap untuk presentasi sesungguhnya.',
      improvement_feedback: 'Siapkan antisipasi pertanyaan dari dosen pengampu.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    // Rafi & Fikri also reviewed Aisyah in Latihan 3
    {
      id: 'pa-l3-fik-to-ais',
      reviewer_student_id: 'std-fikri',
      presenter_student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      practice_number: 3,
      text_dependency: 'tanpa_membaca',
      fluency: 'lancar_runtut',
      case_understanding: 'paham_menghubungkan',
      scaffolding_completion: 'seluruh_terhubung',
      clarity: 'jelas_runtut',
      positive_feedback: 'Luar biasa runtut, menghubungkan regulasi BPOM dengan mekanisme kimia.',
      improvement_feedback: 'Sudah sangat prima, pertahankan.',
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
  ];

  const groupEvidenceList: GroupEvidence[] = [
    {
      id: 'gev-1',
      group_id: defaultGroupId,
      meeting_id: defaultMeetingId,
      practice_number: 2,
      date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0],
      time: '16:30 WIB',
      mode: 'tatap_muka',
      location_or_media: 'Perpustakaan Pusat Lantai 2 / Ruang Diskusi 4',
      evidence_url: 'https://drive.google.com/drive/folders/1GroupEvidencePhotosAndVideoFolderDrive',
      checklist: {
        all_practiced: true,
        all_listened: true,
        all_gave_feedback: true,
        discussed_difficulties: true,
      },
      attendance: {
        'std-aisyah': true,
        'std-fikri': true,
        'std-ismi': true,
        'std-rafi': true,
      },
      discussion_note: 'Kelompok mendalami pertanyaan 3 & 4 mengenai perbedaan metabolisme benzena di hepar versus toluena.',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ];

  const finalReflections: FinalReflection[] = [
    {
      id: 'fr-ais-1',
      student_id: 'std-aisyah',
      meeting_id: defaultMeetingId,
      overall_progress: 'siap_presentasi',
      improvements: [
        'Ketergantungan terhadap teks berkurang',
        'Lebih lancar berbicara',
        'Lebih memahami kasus',
        'Lebih mampu menjelaskan dengan bahasa sendiri',
        'Lebih mampu menghubungkan teori dengan kasus',
        'Lebih percaya diri',
      ],
      presentation_target: 'Mempresentasikan kasus cemaran benzena dalam waktu 10 menit tanpa membaca slide, serta menjawab pertanyaan dosen dengan argumen kimia organik yang kokoh.',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
  ];

  setItem(STORAGE_KEYS.CLASSES, classes);
  setItem(STORAGE_KEYS.GROUPS, groups);
  setItem(STORAGE_KEYS.STUDENTS, students);
  setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  setItem(STORAGE_KEYS.QUESTIONS, questions);
  setItem(STORAGE_KEYS.MEETINGS, meetings);
  setItem(STORAGE_KEYS.AUDIO, audioSubmissions);
  setItem(STORAGE_KEYS.SELF_ASSESSMENTS, selfAssessments);
  setItem(STORAGE_KEYS.PEER_ASSESSMENTS, peerAssessments);
  setItem(STORAGE_KEYS.GROUP_EVIDENCE, groupEvidenceList);
  setItem(STORAGE_KEYS.FINAL_REFLECTIONS, finalReflections);
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
}

// Ensure demo data is seeded on module load
if (typeof window !== 'undefined') {
  try {
    seedInitialData(false);
  } catch (e) {
    console.error('Storage auto-init error:', e);
  }
}

// Data access repository
export const storageService = {
  // Initialize
  init: () => {
    seedInitialData(false);
  },

  resetToDemo: () => {
    seedInitialData(true);
  },

  // Classes
  getClasses: (): ClassItem[] => {
    let classes = getItem<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    if (!classes || classes.length === 0) {
      seedInitialData(true);
      classes = getItem<ClassItem[]>(STORAGE_KEYS.CLASSES, []);
    }
    return (classes || []).filter(Boolean);
  },
  getClassById: (id: string): ClassItem | undefined =>
    storageService.getClasses().find((c) => c?.id === id),
  addClass: (name: string, code: string): ClassItem => {
    const classes = storageService.getClasses();
    const newClass: ClassItem = {
      id: 'class-' + Date.now(),
      name,
      code,
      created_at: new Date().toISOString(),
    };
    classes.push(newClass);
    setItem(STORAGE_KEYS.CLASSES, classes);
    return newClass;
  },

  // Groups
  getGroups: (): Group[] => {
    let groups = getItem<Group[]>(STORAGE_KEYS.GROUPS, []);
    if (!groups || groups.length === 0) {
      seedInitialData(true);
      groups = getItem<Group[]>(STORAGE_KEYS.GROUPS, []);
    }
    return (groups || []).filter(Boolean);
  },
  getGroupById: (id: string): Group | undefined =>
    storageService.getGroups().find((g) => g?.id === id),
  getGroupsByClassId: (classId: string): Group[] =>
    storageService.getGroups().filter((g) => g?.class_id === classId),
  getGroupByRoomCode: (code: string): Group | undefined => {
    if (!code) return undefined;
    const clean = code.trim().toUpperCase();
    return storageService.getGroups().find((g) => g?.room_code?.toUpperCase() === clean);
  },
  createGroup: (classId: string, groupName: string, memberNames: string[]): { group: Group; students: Student[] } => {
    const groups = storageService.getGroups();
    const students = storageService.getStudents();

    // Generate unique room code like KIM-7AX29
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const prefix = groupName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase() || 'GRP';
    const roomCode = `${prefix}-${randomSuffix}`;

    const groupId = 'group-' + Date.now();
    const newGroup: Group = {
      id: groupId,
      class_id: classId,
      name: groupName,
      room_code: roomCode,
      created_at: new Date().toISOString(),
    };
    groups.push(newGroup);

    const createdStudents: Student[] = memberNames.map((name, index) => ({
      id: `std-${groupId}-${index}-${Date.now()}`,
      group_id: groupId,
      name: name.trim(),
      pin: undefined,
      is_activated: false,
      created_at: new Date().toISOString(),
    }));

    students.push(...createdStudents);

    setItem(STORAGE_KEYS.GROUPS, groups);
    setItem(STORAGE_KEYS.STUDENTS, students);

    return { group: newGroup, students: createdStudents };
  },

  // Students
  getStudents: (): Student[] => {
    let students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    if (!students || students.length === 0) {
      seedInitialData(true);
      students = getItem<Student[]>(STORAGE_KEYS.STUDENTS, []);
    }
    return (students || []).filter(Boolean);
  },
  getStudentById: (id: string): Student | undefined => {
    if (!id) return undefined;
    const students = storageService.getStudents();
    return (
      students.find((s) => s?.id === id) ||
      (id === 'std-1' ? students.find((s) => s?.id === 'std-aisyah') : undefined) ||
      (id === 'std-2' ? students.find((s) => s?.id === 'std-fikri') : undefined) ||
      (id === 'std-3' ? students.find((s) => s?.id === 'std-ismi') : undefined) ||
      (id === 'std-aisyah' ? students.find((s) => s?.id === 'std-1') : undefined) ||
      (id === 'std-fikri' ? students.find((s) => s?.id === 'std-2') : undefined) ||
      (id === 'std-ismi' ? students.find((s) => s?.id === 'std-3') : undefined)
    );
  },
  getStudentsByGroupId: (groupId: string): Student[] =>
    storageService.getStudents().filter((s) => s?.group_id === groupId),
  activateStudentPin: (studentId: string, pin: string): boolean => {
    const students = storageService.getStudents();
    const index = students.findIndex((s) => s.id === studentId);
    if (index === -1) return false;
    students[index].pin = pin;
    students[index].is_activated = true;
    setItem(STORAGE_KEYS.STUDENTS, students);
    return true;
  },
  addStudentToGroup: (groupId: string, name: string): Student => {
    const students = storageService.getStudents();
    const newStudent: Student = {
      id: `std-${groupId}-${Date.now()}`,
      group_id: groupId,
      name: name.trim(),
      pin: undefined,
      is_activated: false,
      created_at: new Date().toISOString(),
    };
    students.push(newStudent);
    setItem(STORAGE_KEYS.STUDENTS, students);
    return newStudent;
  },
  removeStudent: (studentId: string): boolean => {
    const students = storageService.getStudents();
    const filtered = students.filter((s) => s.id !== studentId);
    if (filtered.length === students.length) return false;
    setItem(STORAGE_KEYS.STUDENTS, filtered);
    return true;
  },

  // Assignments & Cases
  getAssignments: (): Assignment[] => getItem(STORAGE_KEYS.ASSIGNMENTS, []),
  getAssignmentById: (id: string): Assignment | undefined =>
    storageService.getAssignments().find((a) => a.id === id),
  getAssignmentByClassId: (classId: string): Assignment | undefined =>
    storageService.getAssignments().find((a) => a.class_id === classId),
  saveAssignment: (assignment: Assignment): void => {
    const assignments = storageService.getAssignments();
    const index = assignments.findIndex((a) => a.id === assignment.id);
    if (index >= 0) {
      assignments[index] = assignment;
    } else {
      assignments.push(assignment);
    }
    setItem(STORAGE_KEYS.ASSIGNMENTS, assignments);
  },

  // Scaffolding Questions
  getQuestions: (): ScaffoldingQuestion[] => getItem(STORAGE_KEYS.QUESTIONS, []),
  getQuestionsByAssignmentId: (assignmentId: string): ScaffoldingQuestion[] =>
    storageService.getQuestions()
      .filter((q) => q.assignment_id === assignmentId)
      .sort((a, b) => a.question_number - b.question_number),
  saveQuestions: (assignmentId: string, questions: { id?: string; question_text: string }[]): void => {
    const allQuestions = storageService.getQuestions().filter((q) => q.assignment_id !== assignmentId);
    const updated: ScaffoldingQuestion[] = questions.map((q, idx) => ({
      id: q.id || `q-${assignmentId}-${idx + 1}-${Date.now()}`,
      assignment_id: assignmentId,
      question_number: idx + 1,
      question_text: q.question_text,
    }));
    setItem(STORAGE_KEYS.QUESTIONS, [...allQuestions, ...updated]);
  },

  // Meetings
  getMeetings: (): Meeting[] => {
    let meetings = getItem<Meeting[]>(STORAGE_KEYS.MEETINGS, []);
    if (!meetings || meetings.length === 0) {
      seedInitialData(true);
      meetings = getItem<Meeting[]>(STORAGE_KEYS.MEETINGS, []);
    }
    return (meetings || []).filter(Boolean);
  },
  getMeetingById: (id: string): Meeting | undefined =>
    storageService.getMeetings().find((m) => m?.id === id),
  getMeetingsByClassId: (classId: string): Meeting[] =>
    storageService.getMeetings()
      .filter((m) => m?.class_id === classId)
      .sort((a, b) => a.meeting_number - b.meeting_number),
  addMeeting: (classId: string, assignmentId: string, meetingNumber: number, title: string): Meeting => {
    const meetings = storageService.getMeetings();
    const newMeeting: Meeting = {
      id: `meeting-${Date.now()}`,
      class_id: classId,
      assignment_id: assignmentId,
      meeting_number: meetingNumber,
      title,
    };
    meetings.push(newMeeting);
    setItem(STORAGE_KEYS.MEETINGS, meetings);
    return newMeeting;
  },

  // Audio Submissions
  getAudioSubmissions: (): AudioSubmission[] => getItem(STORAGE_KEYS.AUDIO, []),
  getAudioSubmission: (studentId: string, meetingId: string, practiceNumber: number): AudioSubmission | undefined =>
    storageService.getAudioSubmissions().find(
      (a) => a.student_id === studentId && a.meeting_id === meetingId && a.practice_number === practiceNumber
    ),
  saveAudioSubmission: (submission: Omit<AudioSubmission, 'id' | 'created_at'>): AudioSubmission => {
    const list = storageService.getAudioSubmissions();
    const existingIndex = list.findIndex(
      (a) =>
        a.student_id === submission.student_id &&
        a.meeting_id === submission.meeting_id &&
        a.practice_number === submission.practice_number
    );
    const updated: AudioSubmission = {
      ...submission,
      id: existingIndex >= 0 ? list[existingIndex].id : `aud-${Date.now()}`,
      created_at: existingIndex >= 0 ? list[existingIndex].created_at : new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      list[existingIndex] = updated;
    } else {
      list.push(updated);
    }
    setItem(STORAGE_KEYS.AUDIO, list);
    return updated;
  },

  // Self Assessments (Latihan 1)
  getSelfAssessments: (): SelfAssessment[] => getItem(STORAGE_KEYS.SELF_ASSESSMENTS, []),
  getSelfAssessment: (studentId: string, meetingId: string): SelfAssessment | undefined =>
    storageService.getSelfAssessments().find((sa) => sa.student_id === studentId && sa.meeting_id === meetingId),
  saveSelfAssessment: (data: Omit<SelfAssessment, 'id' | 'created_at'>): SelfAssessment => {
    const list = storageService.getSelfAssessments();
    const index = list.findIndex((sa) => sa.student_id === data.student_id && sa.meeting_id === data.meeting_id);
    const record: SelfAssessment = {
      ...data,
      id: index >= 0 ? list[index].id : `sa-${Date.now()}`,
      created_at: index >= 0 ? list[index].created_at : new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    setItem(STORAGE_KEYS.SELF_ASSESSMENTS, list);
    return record;
  },

  // Peer Assessments (Latihan 2 & 3)
  getPeerAssessments: (): PeerAssessment[] => getItem(STORAGE_KEYS.PEER_ASSESSMENTS, []),
  getPeerAssessmentsGivenByStudent: (
    reviewerId: string,
    meetingId: string,
    practiceNumber: number
  ): PeerAssessment[] =>
    storageService.getPeerAssessments().filter(
      (pa) =>
        pa.reviewer_student_id === reviewerId &&
        pa.meeting_id === meetingId &&
        pa.practice_number === practiceNumber
    ),
  getPeerAssessmentsReceivedByStudent: (
    presenterId: string,
    meetingId: string,
    practiceNumber?: number
  ): PeerAssessment[] =>
    storageService.getPeerAssessments().filter(
      (pa) =>
        pa.presenter_student_id === presenterId &&
        pa.meeting_id === meetingId &&
        (practiceNumber ? pa.practice_number === practiceNumber : true)
    ),
  savePeerAssessment: (data: Omit<PeerAssessment, 'id' | 'created_at'>): PeerAssessment => {
    const list = storageService.getPeerAssessments();
    const index = list.findIndex(
      (pa) =>
        pa.reviewer_student_id === data.reviewer_student_id &&
        pa.presenter_student_id === data.presenter_student_id &&
        pa.meeting_id === data.meeting_id &&
        pa.practice_number === data.practice_number
    );
    const record: PeerAssessment = {
      ...data,
      id: index >= 0 ? list[index].id : `pa-${Date.now()}`,
      created_at: index >= 0 ? list[index].created_at : new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    setItem(STORAGE_KEYS.PEER_ASSESSMENTS, list);
    return record;
  },

  // Group Evidence (Latihan 2)
  getGroupEvidenceList: (): GroupEvidence[] => getItem(STORAGE_KEYS.GROUP_EVIDENCE, []),
  getGroupEvidence: (groupId: string, meetingId: string, practiceNumber = 2): GroupEvidence | undefined =>
    storageService.getGroupEvidenceList().find(
      (ge) => ge.group_id === groupId && ge.meeting_id === meetingId && ge.practice_number === practiceNumber
    ),
  saveGroupEvidence: (data: Omit<GroupEvidence, 'id' | 'created_at'>): GroupEvidence => {
    const list = storageService.getGroupEvidenceList();
    const index = list.findIndex(
      (ge) =>
        ge.group_id === data.group_id &&
        ge.meeting_id === data.meeting_id &&
        ge.practice_number === data.practice_number
    );
    const record: GroupEvidence = {
      ...data,
      id: index >= 0 ? list[index].id : `gev-${Date.now()}`,
      created_at: index >= 0 ? list[index].created_at : new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    setItem(STORAGE_KEYS.GROUP_EVIDENCE, list);
    return record;
  },

  // Final Reflections (Latihan 3)
  getFinalReflections: (): FinalReflection[] => getItem(STORAGE_KEYS.FINAL_REFLECTIONS, []),
  getFinalReflection: (studentId: string, meetingId: string): FinalReflection | undefined =>
    storageService.getFinalReflections().find(
      (fr) => fr.student_id === studentId && fr.meeting_id === meetingId
    ),
  saveFinalReflection: (data: Omit<FinalReflection, 'id' | 'created_at'>): FinalReflection => {
    const list = storageService.getFinalReflections();
    const index = list.findIndex((fr) => fr.student_id === data.student_id && fr.meeting_id === data.meeting_id);
    const record: FinalReflection = {
      ...data,
      id: index >= 0 ? list[index].id : `fr-${Date.now()}`,
      created_at: index >= 0 ? list[index].created_at : new Date().toISOString(),
    };
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    setItem(STORAGE_KEYS.FINAL_REFLECTIONS, list);
    return record;
  },

  // STRICT PROGRESS AND COMPLETION CALCULATION (Requirement 26 & 27)
  calculateStudentProgress: (studentId: string, meetingId: string): StudentMeetingProgress => {
    const student = storageService.getStudentById(studentId);
    if (!student) {
      return {
        student_id: studentId,
        meeting_id: meetingId || '',
        latihan1: {
          is_complete: false,
          has_audio: false,
          has_listened: false,
          has_self_assessment: false,
          has_reflection: false,
          missing_items: ['Data mahasiswa tidak ditemukan'],
        },
        latihan2: {
          is_complete: false,
          has_audio: false,
          has_peer_reviews_given: false,
          total_reviews_needed: 0,
          total_reviews_completed: 0,
          has_group_evidence: false,
          missing_items: ['Data mahasiswa tidak ditemukan'],
        },
        latihan3: {
          is_complete: false,
          has_audio: false,
          has_peer_reviews_given: false,
          total_reviews_needed: 0,
          total_reviews_completed: 0,
          has_final_reflection: false,
          missing_items: ['Data mahasiswa tidak ditemukan'],
        },
        completed_stages: 0,
        status: 'belum_mulai',
        is_ready: false,
      };
    }

    const group = student.group_id ? storageService.getGroupById(student.group_id) : undefined;
    const groupMembers = group?.id ? storageService.getStudentsByGroupId(group.id) : [];
    const peers = groupMembers.filter((m) => m?.id && m.id !== studentId);
    const totalPeers = peers.length;

    // Latihan 1 Calculation:
    // ✓ link rekaman tersedia
    // ✓ mahasiswa sudah mencentang telah mendengarkan rekaman
    // ✓ seluruh self-assessment terisi
    // ✓ refleksi perbaikan terisi
    const l1Audio = storageService.getAudioSubmission(studentId, meetingId, 1);
    const l1AudioValid = !!(
      l1Audio &&
      ((l1Audio.recording_mode === 'single' && l1Audio.drive_url) ||
        (l1Audio.recording_mode === 'per_question' &&
          l1Audio.per_question_urls &&
          Object.keys(l1Audio.per_question_urls).length > 0))
    );

    const l1Sa = storageService.getSelfAssessment(studentId, meetingId);
    const l1Listened = !!l1Sa?.listened_to_audio;
    const l1SaFilled = !!(
      l1Sa &&
      l1Sa.text_dependency &&
      l1Sa.fluency &&
      l1Sa.case_understanding &&
      l1Sa.scaffolding_mastery
    );
    const l1ReflectionFilled = !!(l1Sa && l1Sa.improvement_note && l1Sa.improvement_note.trim().length > 0);

    const l1Missing: string[] = [];
    if (!l1AudioValid) l1Missing.push('Link rekaman Latihan 1');
    if (!l1Listened) l1Missing.push('Konfirmasi mendengarkan rekaman');
    if (!l1SaFilled) l1Missing.push('Self-assessment 4 kriteria evaluasi diri');
    if (!l1ReflectionFilled) l1Missing.push('Refleksi perbaikan');

    const l1Complete = l1AudioValid && l1Listened && l1SaFilled && l1ReflectionFilled;

    // Latihan 2 Calculation:
    // ✓ link rekaman tersedia
    // ✓ mahasiswa telah melakukan peer assessment terhadap seluruh anggota kelompok lainnya
    // ✓ bukti aktivitas kelompok sudah tersedia
    const l2Audio = storageService.getAudioSubmission(studentId, meetingId, 2);
    const l2AudioValid = !!(
      l2Audio &&
      ((l2Audio.recording_mode === 'single' && l2Audio.drive_url) ||
        (l2Audio.recording_mode === 'per_question' &&
          l2Audio.per_question_urls &&
          Object.keys(l2Audio.per_question_urls).length > 0))
    );

    const l2ReviewsGiven = storageService.getPeerAssessmentsGivenByStudent(studentId, meetingId, 2);
    const l2ReviewedPeerIds = new Set(l2ReviewsGiven.map((r) => r.presenter_student_id));
    const unreviewedPeersL2 = peers.filter((p) => !l2ReviewedPeerIds.has(p.id));
    const l2AllPeersReviewed = totalPeers === 0 || unreviewedPeersL2.length === 0;

    const groupEvidence = group ? storageService.getGroupEvidence(group.id, meetingId, 2) : undefined;
    const hasGroupEvidence = !!(groupEvidence && (groupEvidence.evidence_url || groupEvidence.photo_url));

    const l2Missing: string[] = [];
    if (!l2AudioValid) l2Missing.push('Link rekaman Latihan 2');
    if (!l2AllPeersReviewed) {
      const names = unreviewedPeersL2.map((p) => p.name).join(', ');
      l2Missing.push(`Peer assessment untuk: ${names}`);
    }
    if (!hasGroupEvidence) l2Missing.push('Bukti kegiatan kelompok di luar kelas');

    const l2Complete = l2AudioValid && l2AllPeersReviewed && hasGroupEvidence;

    // Latihan 3 Calculation:
    // ✓ link rekaman tersedia
    // ✓ peer assessment selesai
    // ✓ final reflection selesai
    const l3Audio = storageService.getAudioSubmission(studentId, meetingId, 3);
    const l3AudioValid = !!(
      l3Audio &&
      ((l3Audio.recording_mode === 'single' && l3Audio.drive_url) ||
        (l3Audio.recording_mode === 'per_question' &&
          l3Audio.per_question_urls &&
          Object.keys(l3Audio.per_question_urls).length > 0))
    );

    const l3ReviewsGiven = storageService.getPeerAssessmentsGivenByStudent(studentId, meetingId, 3);
    const l3ReviewedPeerIds = new Set(l3ReviewsGiven.map((r) => r.presenter_student_id));
    const unreviewedPeersL3 = peers.filter((p) => !l3ReviewedPeerIds.has(p.id));
    const l3AllPeersReviewed = totalPeers === 0 || unreviewedPeersL3.length === 0;

    const finalReflection = storageService.getFinalReflection(studentId, meetingId);
    const hasFinalReflection = !!(
      finalReflection &&
      finalReflection.overall_progress &&
      finalReflection.presentation_target &&
      finalReflection.presentation_target.trim().length > 0
    );

    const l3Missing: string[] = [];
    if (!l3AudioValid) l3Missing.push('Link rekaman Latihan 3');
    if (!l3AllPeersReviewed) {
      const names = unreviewedPeersL3.map((p) => p.name).join(', ');
      l3Missing.push(`Peer assessment Latihan 3 untuk: ${names}`);
    }
    if (!hasFinalReflection) l3Missing.push('Refleksi akhir');

    const l3Complete = l3AudioValid && l3AllPeersReviewed && hasFinalReflection;

    let completedStages = 0;
    if (l1Complete) completedStages++;
    if (l2Complete) completedStages++;
    if (l3Complete) completedStages++;

    let status: 'siap' | 'sedang_proses' | 'perlu_dilengkapi' | 'belum_mulai' = 'belum_mulai';
    if (completedStages === 3) {
      status = 'siap';
    } else if (completedStages > 0 || l1AudioValid || l2AudioValid || l3AudioValid) {
      if (l1Missing.length > 0 && (l1AudioValid || l1Listened || l1SaFilled)) {
        status = 'perlu_dilengkapi';
      } else {
        status = 'sedang_proses';
      }
    } else {
      status = 'belum_mulai';
    }

    return {
      student_id: studentId,
      meeting_id: meetingId,
      latihan1: {
        is_complete: l1Complete,
        has_audio: l1AudioValid,
        has_listened: l1Listened,
        has_self_assessment: l1SaFilled,
        has_reflection: l1ReflectionFilled,
        missing_items: l1Missing,
      },
      latihan2: {
        is_complete: l2Complete,
        has_audio: l2AudioValid,
        has_peer_reviews_given: l2AllPeersReviewed,
        total_reviews_needed: totalPeers,
        total_reviews_completed: l2ReviewsGiven.length,
        has_group_evidence: hasGroupEvidence,
        missing_items: l2Missing,
      },
      latihan3: {
        is_complete: l3Complete,
        has_audio: l3AudioValid,
        has_peer_reviews_given: l3AllPeersReviewed,
        total_reviews_needed: totalPeers,
        total_reviews_completed: l3ReviewsGiven.length,
        has_final_reflection: hasFinalReflection,
        missing_items: l3Missing,
      },
      completed_stages: completedStages,
      status,
      is_ready: completedStages === 3,
    };
  },

  // Lecturer: Get all incomplete tasks across students (Requirement 35)
  getIncompleteTasks: (classId?: string, meetingId?: string): MissingTaskRecord[] => {
    const students = storageService.getStudents();
    const groups = storageService.getGroups();
    const classes = storageService.getClasses();
    const meetings = storageService.getMeetings();

    const results: MissingTaskRecord[] = [];

    students.forEach((student) => {
      if (!student?.id) return;
      const group = groups.find((g) => g?.id === student.group_id);
      if (!group?.id) return;
      if (classId && group.class_id !== classId) return;

      const cls = classes.find((c) => c?.id === group.class_id);
      const relevantMeetings = meetingId
        ? meetings.filter((m) => m?.id === meetingId)
        : meetings.filter((m) => m?.class_id === group.class_id);

      relevantMeetings.forEach((meeting) => {
        if (!meeting?.id) return;
        const progress = storageService.calculateStudentProgress(student.id, meeting.id);

        if (!progress.is_ready) {
          // Check Latihan 1
          if (!progress.latihan1.is_complete) {
            progress.latihan1.missing_items.forEach((item) => {
              results.push({
                student_id: student.id,
                student_name: student.name,
                group_id: group.id,
                group_name: group.name,
                class_name: cls?.name || 'Kelas',
                meeting_id: meeting.id,
                meeting_title: meeting.title,
                practice_number: 1,
                task_description: item,
                missing_description: item,
              });
            });
          }

          // Check Latihan 2
          if (!progress.latihan2.is_complete) {
            progress.latihan2.missing_items.forEach((item) => {
              results.push({
                student_id: student.id,
                student_name: student.name,
                group_id: group.id,
                group_name: group.name,
                class_name: cls?.name || 'Kelas',
                meeting_id: meeting.id,
                meeting_title: meeting.title,
                practice_number: 2,
                task_description: item,
                missing_description: item,
              });
            });
          }

          // Check Latihan 3
          if (!progress.latihan3.is_complete) {
            progress.latihan3.missing_items.forEach((item) => {
              results.push({
                student_id: student.id,
                student_name: student.name,
                group_id: group.id,
                group_name: group.name,
                class_name: cls?.name || 'Kelas',
                meeting_id: meeting.id,
                meeting_title: meeting.title,
                practice_number: 3,
                task_description: item,
                missing_description: item,
              });
            });
          }
        }
      });
    });

    return results;
  },
};
