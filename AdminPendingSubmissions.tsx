
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Eye, Clock, User, FileText, AlertCircle, DollarSign } from "lucide-react"
import { useClinicianSubmissions, ClinicianSubmission } from "@/hooks/useClinicianSubmissions"

export function AdminPendingSubmissions() {
  const { submissions, isLoading } = useClinicianSubmissions()

  const submittedSubmissions = submissions.filter(s => s.payment_status === 'completed')

  const getUrgencyColor = (formType: string) => {
    // Consider certain form types as urgent
    const urgentTypes = ['Sick Certificate', 'Return to Work']
    return urgentTypes.includes(formType) ? "destructive" : "secondary"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "outline"
      case "in_progress":
        return "default"
      case "completed":
        return "secondary"
      default:
        return "outline"
    }
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

  const formatPaymentAmount = (amountInCents: number | null) => {
    if (!amountInCents) return '$0.00'
    return `$${(amountInCents / 100).toFixed(2)}`
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
          Submitted Forms (View Only)
          <Badge variant="outline" className="ml-2">
            {submittedSubmissions.length} submitted
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submittedSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No submitted forms</h3>
            <p className="text-sm text-muted-foreground">No paid form submissions have been made yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Form Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Document Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submittedSubmissions.map((submission) => (
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
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(submission.submitted_at || submission.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        {formatPaymentAmount(submission.payment_amount)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusColor(submission.payment_status)}>
                        {submission.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(submission.document_status)}>
                        {submission.document_status?.replace('_', ' ')}
                      </Badge>
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
