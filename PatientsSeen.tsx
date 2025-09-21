import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, User, FileText, AlertCircle, Clock } from "lucide-react"
import { useClinicianSubmissions } from "@/hooks/useClinicianSubmissions"

export function PatientsSeen() {
  const { submissions, isLoading } = useClinicianSubmissions()

  const today = new Date().toDateString()
  const completedToday = submissions.filter(s => {
    const submissionDate = new Date(s.created_at).toDateString()
    return submissionDate === today && s.document_status === 'completed'
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const getUrgencyColor = (formType: string) => {
    const urgentTypes = ['Sick Certificate', 'Return to Work']
    return urgentTypes.includes(formType) ? "destructive" : "secondary"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <Card className="bg-plum-800/50 border-cream-200/20">
        <CardHeader>
          <CardTitle className="text-cream-50 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Patients Seen Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coral-400"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-plum-800/50 border-cream-200/20">
      <CardHeader>
        <CardTitle className="text-cream-50 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Patients Seen Today
          <Badge variant="outline" className="ml-2 border-cream-200/30 text-cream-200">
            {completedToday.length} completed
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {completedToday.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-cream-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-cream-200">No patients seen today</h3>
            <p className="text-sm text-cream-300">Completed submissions will appear here</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-cream-200/20">
                  <TableHead className="text-cream-200">Patient</TableHead>
                  <TableHead className="text-cream-200">Form Type</TableHead>
                  <TableHead className="text-cream-200">Completed At</TableHead>
                  <TableHead className="text-cream-200">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completedToday.map((submission) => (
                  <TableRow key={submission.id} className="border-cream-200/20">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-cream-300" />
                        <div>
                          <div className="text-cream-100">{submission.patient_name}</div>
                          <div className="text-xs text-cream-300">{submission.patient_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getUrgencyColor(submission.form_type)} className="text-xs">
                        {submission.form_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cream-300" />
                        <span className="text-cream-200 text-sm">
                          {formatDate(submission.created_at)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
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
