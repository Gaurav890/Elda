export enum NoteCategory {
  MEDICAL = 'medical',
  BEHAVIORAL = 'behavioral',
  PREFERENCES = 'preferences',
  ROUTINE = 'routine',
  SAFETY = 'safety',
  FAMILY = 'family',
  OTHER = 'other',
}

export enum NotePriority {
  NORMAL = 'normal',
  IMPORTANT = 'important',
}

export interface Note {
  id: string;
  patient_id: string;
  title: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
  created_at: string;
  updated_at: string;
  created_by: string;
  author_name?: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  category: NoteCategory;
  priority: NotePriority;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  category?: NoteCategory;
  priority?: NotePriority;
}

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  [NoteCategory.MEDICAL]: 'Medical',
  [NoteCategory.BEHAVIORAL]: 'Behavioral',
  [NoteCategory.PREFERENCES]: 'Preferences',
  [NoteCategory.ROUTINE]: 'Routine',
  [NoteCategory.SAFETY]: 'Safety',
  [NoteCategory.FAMILY]: 'Family',
  [NoteCategory.OTHER]: 'Other',
};

export const NOTE_CATEGORY_COLORS: Record<NoteCategory, string> = {
  [NoteCategory.MEDICAL]: 'bg-red-100 text-red-700 border-red-200',
  [NoteCategory.BEHAVIORAL]: 'bg-purple-100 text-purple-700 border-purple-200',
  [NoteCategory.PREFERENCES]: 'bg-blue-100 text-blue-700 border-blue-200',
  [NoteCategory.ROUTINE]: 'bg-green-100 text-green-700 border-green-200',
  [NoteCategory.SAFETY]: 'bg-orange-100 text-orange-700 border-orange-200',
  [NoteCategory.FAMILY]: 'bg-pink-100 text-pink-700 border-pink-200',
  [NoteCategory.OTHER]: 'bg-gray-100 text-gray-700 border-gray-200',
};
