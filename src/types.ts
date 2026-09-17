export type Role = 'student' | 'lecturer';

export type PracticeNumber = 1 | 2 | 3;

export type PracticeStatus = 'not_started' | 'in_progress' | 'completed';

export type StudentReadyStatus = 'siap' | 'sedang_proses' | 'perlu_dilengkapi' | 'belum_mulai';

export interface ClassItem {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Lecturer {
  id: string;
  username: string;
  name: string;
}

export interface Group {
  id: string;
  class_id: string;
  name: string;
  room_code: string;
  created_at: string;
}

export interface Student {
  id: string;
  group_id: string;
  name: string;
  pin?: string;
  is_activated: boolean;
  created_at: string;
}

export interface Assignment {
  id: string;
  class_id: string;
  title: string;
  case_text: string;
  case_image?: string; // base64 or url
  created_at: string;
}

export interface ScaffoldingQuestion {
  id: string;
  assignment_id: string;
  question_number: number;
  question_text: string;
}

export interface Meeting {
  id: string;
  class_id: string;
  assignment_id: string;
  meeting_number: number;
  title: string;
}

export interface PracticeSession {
  id: string;
  student_id: string;
  meeting_id: string;
  practice_number: PracticeNumber;
  status: PracticeStatus;
  created_at: string;
  updated_at: string;
}

export type RecordingMode = 'single' | 'per_question';

export interface AudioSubmission {
  id: string;
  student_id: string;
  meeting_id: string;
  practice_number: PracticeNumber;
  recording_mode: RecordingMode;
  drive_url?: string;
  per_question_urls?: Record<string, string>; // question_id or 'intro' -> drive_url
  photo_url?: string; // photo evidence data url or drive image url
  created_at: string;
}

// Self Assessment for Latihan 1
export interface SelfAssessment {
  id: string;
  student_id: string;
  meeting_id: string;
  text_dependency: 'membaca_seluruh' | 'membaca_cukup_banyak' | 'hanya_poin' | 'tanpa_membaca';
  fluency: 'sering_tersendat' | 'beberapa_tersendat' | 'cukup_lancar' | 'lancar_runtut';
  case_understanding: 'belum_paham' | 'paham_sebagian' | 'cukup_paham' | 'paham_runtut';
  scaffolding_mastery: 'banyak_belum' | 'sebagian' | 'hampir_seluruh' | 'seluruh_terhubung';
  improvement_note: string;
  listened_to_audio: boolean;
  created_at: string;
}

// Peer Assessment for Latihan 2 and Latihan 3
export interface PeerAssessment {
  id: string;
  reviewer_student_id: string;
  presenter_student_id: string;
  meeting_id: string;
  practice_number: PracticeNumber;
  text_dependency: 'membaca_seluruh' | 'membaca_sebagian' | 'hanya_poin' | 'tanpa_membaca';
  fluency: 'sering_tersendat' | 'beberapa_tersendat' | 'cukup_lancar' | 'lancar_runtut';
  case_understanding: 'belum_paham' | 'paham_sebagian' | 'sudah_paham' | 'paham_menghubungkan';
  scaffolding_completion: 'banyak_belum' | 'sebagian' | 'hampir_seluruh' | 'seluruh_terhubung';
  clarity: 'sulit_dipahami' | 'sebagian_bingung' | 'cukup_mudah' | 'jelas_runtut';
  positive_feedback: string;
  improvement_feedback: string;
  created_at: string;
}

// Group Evidence for Latihan 2
export interface GroupEvidence {
  id: string;
  group_id: string;
  meeting_id: string;
  practice_number: PracticeNumber;
  date: string;
  time: string;
  mode: 'tatap_muka' | 'online';
  location_or_media: string;
  evidence_url: string; // Drive link for photos/video/screenshots
  photo_url?: string; // Direct photo upload (base64) or direct image URL
  checklist: {
    all_practiced: boolean;
    all_listened: boolean;
    all_gave_feedback: boolean;
    discussed_difficulties: boolean;
  };
  attendance: Record<string, boolean>; // student_id -> boolean
  discussion_note: string;
  created_at: string;
}

// Final Reflection for Latihan 3
export interface FinalReflection {
  id: string;
  student_id: string;
  meeting_id: string;
  overall_progress?: 'belum_banyak' | 'sedikit_meningkat' | 'jauh_lebih_baik' | 'siap_presentasi';
  improvements?: string[]; // multi-checkbox
  presentation_target?: string;
  progress_felt?: string;
  mastered_parts?: string;
  focus_parts?: string;
  readiness_level?: 'sangat_siap' | 'cukup_siap' | 'perlu_tambahan';
  created_at: string;
}

// Full calculated status for a student in a meeting
export interface StudentMeetingProgress {
  student_id: string;
  meeting_id: string;
  latihan1: {
    is_complete: boolean;
    has_audio: boolean;
    has_listened: boolean;
    has_self_assessment: boolean;
    has_reflection: boolean;
    missing_items: string[];
  };
  latihan2: {
    is_complete: boolean;
    has_audio: boolean;
    has_peer_reviews_given: boolean;
    total_reviews_needed: number;
    total_reviews_completed: number;
    has_group_evidence: boolean;
    missing_items: string[];
  };
  latihan3: {
    is_complete: boolean;
    has_audio: boolean;
    has_peer_reviews_given: boolean;
    total_reviews_needed: number;
    total_reviews_completed: number;
    has_final_reflection: boolean;
    missing_items: string[];
  };
  completed_stages: number; // 0, 1, 2, 3
  status: StudentReadyStatus;
  is_ready: boolean;
}

// Incomplete Task record for Lecturer view
export interface MissingTaskRecord {
  student_id: string;
  student_name: string;
  group_id: string;
  group_name: string;
  class_name: string;
  meeting_id: string;
  meeting_title: string;
  practice_number: PracticeNumber;
  task_description: string;
  missing_description?: string;
}
