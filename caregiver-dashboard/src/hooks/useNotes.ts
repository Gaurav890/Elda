import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, updateNote, deleteNote } from '@/lib/api/notes';
import type { Note, CreateNoteData, UpdateNoteData } from '@/types/note';

/**
 * Fetch notes for a patient
 */
export function useNotes(patientId: string) {
  return useQuery<Note[], Error>({
    queryKey: ['notes', patientId],
    queryFn: () => getNotes(patientId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Create a new note
 */
export function useCreateNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, CreateNoteData>({
    mutationFn: (data) => createNote(patientId, data),
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes', patientId] });
    },
  });
}

/**
 * Update an existing note
 */
export function useUpdateNote(patientId: string, noteId: string) {
  const queryClient = useQueryClient();

  return useMutation<Note, Error, UpdateNoteData>({
    mutationFn: (data) => updateNote(patientId, noteId, data),
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes', patientId] });
    },
  });
}

/**
 * Delete a note
 */
export function useDeleteNote(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (noteId) => deleteNote(patientId, noteId),
    onSuccess: () => {
      // Invalidate and refetch notes
      queryClient.invalidateQueries({ queryKey: ['notes', patientId] });
    },
  });
}
