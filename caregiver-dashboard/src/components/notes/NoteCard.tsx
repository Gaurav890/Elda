'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import type { Note } from '@/types/note';
import { NOTE_CATEGORY_LABELS, NOTE_CATEGORY_COLORS, NotePriority } from '@/types/note';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (noteId: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  const categoryColor = NOTE_CATEGORY_COLORS[note.category];
  const isImportant = note.priority === NotePriority.IMPORTANT;

  return (
    <Card className={isImportant ? 'border-l-4 border-l-amber-500' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-semibold">
                {note.title}
              </CardTitle>
              {isImportant && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Important
                </Badge>
              )}
            </div>
            <CardDescription>
              <div className="flex items-center gap-2 text-sm">
                <Badge className={categoryColor}>
                  {NOTE_CATEGORY_LABELS[note.category]}
                </Badge>
                <span>•</span>
                <span>
                  Added {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </span>
                {note.author_name && (
                  <>
                    <span>•</span>
                    <span>by {note.author_name}</span>
                  </>
                )}
              </div>
            </CardDescription>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(note)}
              title="Edit note"
            >
              <Edit className="h-4 w-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Delete note"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete note?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete &quot;{note.title}&quot;. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(note.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {note.content}
        </p>

        {note.updated_at !== note.created_at && (
          <p className="text-xs text-muted-foreground mt-3">
            Last updated: {format(new Date(note.updated_at), 'PPp')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
