import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Clock, User, FileText, AlertCircle, Mail, Download, Upload } from "lucide-react"
import { useClinicianSubmissions, ClinicianSubmission } from "@/hooks/useClinicianSubmissions"
import { SubmissionTimer } from "./SubmissionTimer"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PendingSubmissionsProps {
  onSelectSubmission: (submission: ClinicianSubmission) => void
}

export function PendingSubmissions({ onSelectSubmission }: PendingSubmissionsProps) {
  const { submissions, isLoading } = useClinicianSubmissions()
  const { toast } = useToast()

  const handleGeneratePDF = async (submission: ClinicianSubmission) => {
    try {
      // Build the payload matching the required structure
      const formData = {
        patientName: submission.patient_name,
        patientDOB: submission.form_data?.dateOfBirth || submission.form_data?.patientDOB,
        complaint: submission.form_data?.reason || submission.form_data?.complaint || submission.form_data?.mainConcern,
        fromDate: submission.form_data?.fromDate,
        toDate: submission.form_data?.toDate,
        clinicianName: "Dr Anna Braun",
        clinicName: "MedicAi Practice"
      };

      const res = await fetch("https://fhojgszdqgvoutsjmqkc.supabase.co/functions/v1/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZob2pnc3pkcWd2b3V0c2ptcWtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNzM4ODgsImV4cCI6MjA2NDc0OTg4OH0.RpZQoD_WUeVnURs5SzWphQ0B1amUvJHhehoxrBZWyM4`
        },
        body: JSON.stringify(formData),
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url); // open in new tab

      toast({
        title: "PDF Generated",
        description: "PDF opened in new tab successfully",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "PDF Generation Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSendEmail = async (submission: ClinicianSubmission) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-patient-email', {
        body: {
          patientName: submission.patient_name,
          patientEmail: submission.patient_email,
          formType: submission.form_type,
          submissionId: submission.id,
          formData: submission.form_data,
        },
      })

      if (error) throw error

      // Update the submission to mark email as sent
      const { error: updateError } = await supabase
        .from('medicaiforms')
        .update({ email_sent_at: new Date().toISOString() } as any)
        .eq('id', submission.id)

      if (updateError) {
        console.error('Error updating email sent status:', updateError)
      }

      toast({
        title: "Email sent successfully",
        description: `Email sent to ${submission.patient_email}`,
      })

      // Refresh the data to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error sending email:', error)
      toast({
        title: "Error sending email",
        description: "Failed to send email to patient",
        variant: "destructive",
      })
    }
  }

  const getUrgencyColor = (formType: string) => {
    // Consider certain form types as urgent
    const urgentTypes = ['Sick Certificate', 'Return to Work']
    return urgentTypes.includes(formType) ? "destructive" : "secondary"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "pending_review":
      case "active":
        return "default"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
  }

  const getStatusDisplay = (status: string, paymentStatus: string) => {
    // Show "active" for submissions that are paid but not completed
    if (paymentStatus === 'completed' && status !== 'completed') {
      return 'active'
    }
    return status.replace('_', ' ')
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "secondary"
      case "pending":
        return "outline"
      case "failed":
        return "destructive"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            All Form Submissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          All Form Submissions
          {submissions.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {submissions.length} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No submissions found</h3>
            <p className="text-sm text-muted-foreground">No form submissions have been made yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Time Elapsed</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Document Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{submission.patient_name}</div>
                          <div className="text-xs text-muted-foreground">{submission.patient_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyColor(submission.form_type)}>
                        {submission.form_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <SubmissionTimer
                        submittedAt={submission.submitted_at || submission.created_at}
                        isCompleted={submission.document_status === 'completed'}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(submission.submitted_at || submission.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(getStatusDisplay(submission.document_status, submission.payment_status))}>
                        {getStatusDisplay(submission.document_status, submission.payment_status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectSubmission(submission)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Review & Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
