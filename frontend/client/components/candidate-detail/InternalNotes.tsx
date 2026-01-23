import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Save, AlertCircle } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface InternalNotesProps {
  candidateId: number;
}

interface Note {
  id: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
}

// Mock notes data
const mockNotes: Record<number, Note[]> = {
  1: [
    {
      id: "1",
      content:
        "Candidate showed excellent problem-solving skills during technical assessment. Strong fit for senior engineer role.",
      author: "Sarah Chen",
      created_at: "2024-01-30T10:30:00Z",
      updated_at: "2024-01-30T10:30:00Z",
    },
    {
      id: "2",
      content:
        "Follow up on system design knowledge. Schedule additional round if needed.",
      author: "Michael Rodriguez",
      created_at: "2024-02-05T14:15:00Z",
      updated_at: "2024-02-05T14:15:00Z",
    },
  ],
};

export default function InternalNotes({ candidateId }: InternalNotesProps) {
  const { theme } = useTheme();
  const textColor = theme === "dark" ? "text-white" : "text-gray-900";
  const labelColor = theme === "dark" ? "text-gray-400" : "text-gray-600";
  const bgColor = theme === "dark" ? "bg-gray-800" : "bg-white";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const noticeBgColor = theme === "dark" ? "bg-blue-900" : "bg-blue-50";
  const noticeTextColor = theme === "dark" ? "text-blue-300" : "text-blue-900";
  const noticeBorderColor = theme === "dark" ? "border-blue-700" : "border-blue-200";

  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  useEffect(() => {
    // Simulate fetching notes
    const existingNotes = mockNotes[candidateId] || [];
    setNotes(existingNotes);
    setIsLoading(false);
  }, [candidateId]);

  const handleNoteChange = (value: string) => {
    setNewNote(value);

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for autosave
    const timeout = setTimeout(() => {
      if (value.trim()) {
        performAutoSave(value);
      }
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  const performAutoSave = async (content: string) => {
    try {
      setIsSaving(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In a real app, this would save to the server
      console.log("Note autosaved:", content);

      toast.success("Note autosaved", {
        duration: 2000,
      });
    } catch (error) {
      toast.error("Failed to autosave note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.trim()) {
      toast.error("Please enter a note");
      return;
    }

    setIsSaving(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newNoteObj: Note = {
        id: Date.now().toString(),
        content: newNote,
        author: "Current User",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setNotes([newNoteObj, ...notes]);
      setNewNote("");

      toast.success("Note saved successfully");
    } catch (error) {
      toast.error("Failed to save note");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${bgColor}`}>
        <p className={labelColor}>Loading notes...</p>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${bgColor}`}>
      <h3 className={`text-lg font-bold ${textColor} mb-4`}>Internal Notes</h3>

      {/* Privacy Notice */}
      <div className={`mb-4 p-3 ${noticeBgColor} border ${noticeBorderColor} rounded-lg flex gap-2`}>
        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className={`text-xs ${noticeTextColor}`}>
          These notes are private and visible only to the interview panel.
        </p>
      </div>

      {/* Notes Input */}
      <div className="mb-6">
        <label className={`text-sm font-medium ${labelColor} block mb-2`}>
          Add a Note
        </label>
        <Textarea
          placeholder="Add internal observations, reminders, or notes about this candidate..."
          value={newNote}
          onChange={(e) => handleNoteChange(e.target.value)}
          className={`mb-3 min-h-24 ${bgColor} ${textColor}`}
          disabled={isSaving}
        />
        <div className="flex justify-between items-center">
          <span className={`text-xs ${labelColor}`}>
            {isSaving ? "Saving..." : "Autosaves after 2 seconds"}
          </span>
          <Button
            onClick={handleSaveNote}
            disabled={!newNote.trim() || isSaving}
            size="sm"
            className="gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Note
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Notes List */}
      <div className="space-y-4">
        <h4 className={`text-sm font-semibold ${textColor}`}>
          {notes.length} Note{notes.length !== 1 ? "s" : ""}
        </h4>

        {notes.length === 0 ? (
          <p className={`text-sm ${labelColor} italic`}>No notes yet.</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`rounded-lg p-3 border ${borderColor} ${bgColor}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className={`text-xs font-medium ${labelColor}`}>
                  {note.author}
                </div>
                <div className={`text-xs ${labelColor}`}>
                  {new Date(note.created_at).toLocaleDateString()}
                </div>
              </div>
              <p className={`text-sm ${textColor} leading-relaxed`}>
                {note.content}
              </p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
