
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Save, MessageSquare } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ClinicianNotesProps {
  submissionId: number
  existingNotes?: string
  onNotesUpdate?: (notes: string) => void
}

export function ClinicianNotes({ submissionId, existingNotes = "", onNotesUpdate }: ClinicianNotesProps) {
  const [notes, setNotes] = useState(existingNotes)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Here you would save to database
      console.log(`Saving notes for submission ${submissionId}:`, notes)
      
      onNotesUpdate?.(notes)
      setIsEditing(false)
      
      toast({
        title: "Notes Saved",
        description: "Clinician notes have been updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save notes",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const isRedFlag = notes.toLowerCase().includes('red flag') || notes.toLowerCase().includes('hospital')

  return (
    <Card className={isRedFlag ? "border-red-500 border-2" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Clinician Notes
          {isRedFlag && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Red Flag
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add clinician notes here... (Type 'red flag' or 'hospital' for urgent cases)"
              className="min-h-[120px]"
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                size="sm"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Notes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsEditing(false)
                  setNotes(existingNotes)
                }}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            {notes ? (
              <div className={`p-3 rounded-md ${isRedFlag ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                <pre className="whitespace-pre-wrap text-sm">{notes}</pre>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No notes added yet.</p>
            )}
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(true)}
              size="sm"
            >
              {notes ? 'Edit Notes' : 'Add Notes'}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}
