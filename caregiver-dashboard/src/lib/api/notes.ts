import { apiClient } from './axios';
import type { Note, CreateNoteData, UpdateNoteData, NoteCategory, NotePriority } from '@/types/note';

// In-memory cache for notes (simulating backend)
let notesCache: Record<string, Note[]> = {};
let nextNoteId = 1;

// Mock data generator
function generateMockNotes(patientId: string): Note[] {
  const now = new Date();
  const mockNotes: Note[] = [
    {
      id: 'note-1',
      patient_id: patientId,
      title: 'Medication Storage',
      content: 'Blood pressure medication is kept in the kitchen cabinet above the sink. Morning pills are in a blue pill organizer, evening pills in a green one.',
      category: 'medical' as NoteCategory,
      priority: 'important' as NotePriority,
      created_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    },
    {
      id: 'note-2',
      patient_id: patientId,
      title: 'Morning Routine Preferences',
      content: 'Prefers to have coffee before breakfast. Likes to sit by the window and read the newspaper. Does NOT like to be rushed in the morning.',
      category: 'routine' as NoteCategory,
      priority: 'normal' as NotePriority,
      created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    },
    {
      id: 'note-3',
      patient_id: patientId,
      title: 'Family Context',
      content: 'Daughter Sarah visits every Tuesday. Grandson Michael calls on Sundays. Loves talking about her grandchildren - always brightens her mood.',
      category: 'family' as NoteCategory,
      priority: 'normal' as NotePriority,
      created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    },
    {
      id: 'note-4',
      patient_id: patientId,
      title: 'Walking Safety',
      content: 'Uses a walker for longer distances. Needs support when going up stairs. Keep hallways clear of obstacles. Nightlight in bathroom is essential.',
      category: 'safety' as NoteCategory,
      priority: 'important' as NotePriority,
      created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    },
    {
      id: 'note-5',
      patient_id: patientId,
      title: 'Food Preferences',
      content: 'Prefers soft foods. Dislikes spicy food. Favorite meal is chicken soup with vegetables. Enjoys ice cream as a treat.',
      category: 'preferences' as NoteCategory,
      priority: 'normal' as NotePriority,
      created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    },
  ];

  return mockNotes;
}

// Initialize cache for patient
function initializeCacheForPatient(patientId: string) {
  if (!notesCache[patientId]) {
    notesCache[patientId] = generateMockNotes(patientId);
  }
}

/**
 * Get all notes for a patient
 */
export async function getNotes(patientId: string): Promise<Note[]> {
  try {
    const response = await apiClient.get<Note[]>(`/patients/${patientId}/notes`);
    return response.data;
  } catch (error) {
    console.warn('Failed to fetch notes from backend, using mock data:', error);

    // Fallback to mock data
    initializeCacheForPatient(patientId);
    return notesCache[patientId] || [];
  }
}

/**
 * Create a new note
 */
export async function createNote(
  patientId: string,
  data: CreateNoteData
): Promise<Note> {
  try {
    const response = await apiClient.post<Note>(`/patients/${patientId}/notes`, data);
    return response.data;
  } catch (error) {
    console.warn('Failed to create note on backend, using mock data:', error);

    // Fallback to mock data
    initializeCacheForPatient(patientId);

    const newNote: Note = {
      id: `note-${nextNoteId++}`,
      patient_id: patientId,
      title: data.title,
      content: data.content,
      category: data.category,
      priority: data.priority,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 'caregiver-1',
      author_name: 'You',
    };

    notesCache[patientId] = [newNote, ...notesCache[patientId]];
    return newNote;
  }
}

/**
 * Update an existing note
 */
export async function updateNote(
  patientId: string,
  noteId: string,
  data: UpdateNoteData
): Promise<Note> {
  try {
    const response = await apiClient.patch<Note>(
      `/patients/${patientId}/notes/${noteId}`,
      data
    );
    return response.data;
  } catch (error) {
    console.warn('Failed to update note on backend, using mock data:', error);

    // Fallback to mock data
    initializeCacheForPatient(patientId);

    const notes = notesCache[patientId];
    const noteIndex = notes.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...data,
      updated_at: new Date().toISOString(),
    };

    notesCache[patientId][noteIndex] = updatedNote;
    return updatedNote;
  }
}

/**
 * Delete a note
 */
export async function deleteNote(patientId: string, noteId: string): Promise<void> {
  try {
    await apiClient.delete(`/patients/${patientId}/notes/${noteId}`);
  } catch (error) {
    console.warn('Failed to delete note on backend, using mock data:', error);

    // Fallback to mock data
    initializeCacheForPatient(patientId);

    notesCache[patientId] = notesCache[patientId].filter(n => n.id !== noteId);
  }
}
