'use client';

import { useState, useEffect } from 'react';
import { FileText, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import type { Note, CreateNoteData, NoteCategory, NotePriority } from '@/types/note';
import { NOTE_CATEGORY_LABELS } from '@/types/note';

interface NoteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateNoteData) => void;
  editNote?: Note | null;
  isSubmitting?: boolean;
}

export function NoteForm({ open, onOpenChange, onSubmit, editNote, isSubmitting }: NoteFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<NoteCategory>('preferences' as NoteCategory);
  const [priority, setPriority] = useState<NotePriority>('normal' as NotePriority);

  // Populate form when editing
  useEffect(() => {
    if (editNote) {
      setTitle(editNote.title);
      setContent(editNote.content);
      setCategory(editNote.category);
      setPriority(editNote.priority);
    } else {
      // Reset form when creating new note
      setTitle('');
      setContent('');
      setCategory('preferences' as NoteCategory);
      setPriority('normal' as NotePriority);
    }
  }, [editNote, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      return;
    }

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      category,
      priority,
    });
  };

  const isFormValid = title.trim().length > 0 && content.trim().length > 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {editNote ? 'Edit Note' : 'Add Note to AI'}
          </SheetTitle>
          <SheetDescription>
            {editNote
              ? 'Update the note details below.'
              : 'Add context to help the AI better understand and assist this patient.'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="e.g., Medication Storage, Morning Routine"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setCategory(value as NoteCategory)}>
              <SelectTrigger id="category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NOTE_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose a category to help organize notes
            </p>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">
              Priority <span className="text-destructive">*</span>
            </Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as NotePriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="important">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    Important
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Important notes are highlighted for quick reference
            </p>
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Content <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Provide detailed information to help the AI understand this aspect of the patient's care..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
              required
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Be specific - include locations, preferences, names, and any relevant details
            </p>
          </div>

          {/* Examples */}
          {!editNote && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <p className="text-sm font-medium">Examples of helpful notes:</p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4 list-disc">
                <li>Medication locations and pill organizer colors</li>
                <li>Routine preferences (coffee before breakfast, etc.)</li>
                <li>Family member names and visit schedules</li>
                <li>Safety equipment (walker, nightlights, etc.)</li>
                <li>Food preferences and dietary restrictions</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={!isFormValid || isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editNote ? 'Update Note' : 'Add Note'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
