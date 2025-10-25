'use client';

import { useState } from 'react';
import { Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { NoteCard } from '@/components/notes/NoteCard';
import { NoteForm } from '@/components/notes/NoteForm';
import {
  useNotes,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@/hooks/useNotes';
import type { Note, CreateNoteData } from '@/types/note';

interface PatientNotesTabProps {
  patientId: string;
  patientName: string;
}

export function PatientNotesTab({ patientId, patientName }: PatientNotesTabProps) {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Queries and mutations
  const { data: notes, isLoading, error } = useNotes(patientId);
  const createMutation = useCreateNote(patientId);
  const updateMutation = useUpdateNote(patientId, editingNote?.id || '');
  const deleteMutation = useDeleteNote(patientId);

  // Handlers
  const handleAddNote = () => {
    setEditingNote(null);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsFormOpen(true);
  };

  const handleSubmit = async (data: CreateNoteData) => {
    try {
      if (editingNote) {
        // Update existing note
        await updateMutation.mutateAsync(data);
        toast({
          title: 'Note updated',
          description: 'The note has been updated successfully.',
        });
      } else {
        // Create new note
        await createMutation.mutateAsync(data);
        toast({
          title: 'Note added',
          description: 'The note has been added successfully.',
        });
      }
      setIsFormOpen(false);
      setEditingNote(null);
    } catch (error) {
      toast({
        title: 'Error',
        description: editingNote
          ? 'Failed to update note. Please try again.'
          : 'Failed to add note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteMutation.mutateAsync(noteId);
      toast({
        title: 'Note deleted',
        description: 'The note has been deleted successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading notes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground" />
          <div>
            <h3 className="font-semibold">Failed to load notes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {error.message || 'An error occurred while loading notes.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!notes || notes.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-4 max-w-md">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No notes yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first note to help the AI better understand {patientName}&apos;s needs,
                preferences, and care context.
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-left space-y-2">
              <p className="text-sm font-medium">Notes can include:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Where medications are stored</li>
                <li>Daily routine preferences</li>
                <li>Family member names and relationships</li>
                <li>Safety equipment and precautions</li>
                <li>Food preferences and dietary needs</li>
                <li>Behavioral patterns and triggers</li>
              </ul>
            </div>
            <Button onClick={handleAddNote} size="lg" className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Note
            </Button>
          </div>
        </div>

        <NoteForm
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          onSubmit={handleSubmit}
          editNote={editingNote}
          isSubmitting={createMutation.isPending || updateMutation.isPending}
        />
      </>
    );
  }

  // Notes list
  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Notes to AI</h2>
            <p className="text-sm text-muted-foreground">
              Context and instructions to help the AI assist {patientName}
            </p>
          </div>
          <Button onClick={handleAddNote} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Notes grid */}
        <div className="grid gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDelete}
            />
          ))}
        </div>

        {/* Info footer */}
        <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground mb-2">Tips for effective notes:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Be specific - include exact locations, names, and details</li>
            <li>Mark critical safety information as &quot;Important&quot;</li>
            <li>Update notes when routines or preferences change</li>
            <li>Use categories to organize different types of information</li>
          </ul>
        </div>
      </div>

      <NoteForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSubmit={handleSubmit}
        editNote={editingNote}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
      />
    </>
  );
}
