import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { 
  User, 
  Mail, 
  Phone, 
  Stethoscope, 
  Clock, 
  Download, 
  Check, 
  X, 
  Calendar,
  MessageSquare,
  Building
} from "lucide-react"
import { useBookingSlots } from "@/hooks/useBookingSlots"

interface ClinicianApplication {
  id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  practice_name: string
  ahpra_number: string
  specialty: string
  years_experience: string | null
  current_emr: string | null
  weekly_patients: string | null
  interested_features: string[]
  hours_availability: any
  resume_url: string | null
  hr_message: string
  status: string
  created_at: string
  admin_notes: string | null
}

export function ClinicianApplications() {
  const [applications, setApplications] = useState<ClinicianApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedApp, setSelectedApp] = useState<ClinicianApplication | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const { toast } = useToast()
  const { availableSlots } = useBookingSlots()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('clinician_applications')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (applicationId: string, newStatus: 'approved' | 'rejected') => {
    setActionLoading(true)
    try {
      const { error } = await supabase
        .from('clinician_applications')
        .update({
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          admin_notes: adminNotes || null
        })
        .eq('id', applicationId)

      if (error) throw error

      // Send email to applicant
      const application = applications.find(app => app.id === applicationId)
      if (application) {
        if (newStatus === 'approved') {
          // Send approval email with calendar booking link
          await supabase.functions.invoke('send-approval-email', {
            body: {
              applicantName: `${application.first_name} ${application.last_name}`,
              applicantEmail: application.email,
              bookingSlots: availableSlots
            }
          })
        } else {
          // Send rejection email
          await supabase.functions.invoke('send-rejection-email', {
            body: {
              applicantName: `${application.first_name} ${application.last_name}`,
              applicantEmail: application.email,
              adminNotes: adminNotes
            }
          })
        }
      }

      toast({
        title: `Application ${newStatus}`,
        description: `The application has been ${newStatus} and the applicant has been notified.`
      })

      // Refresh applications
      fetchApplications()
      setSelectedApp(null)
      setAdminNotes("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive"
      })
    } finally {
      setActionLoading(false)
    }
  }

  const downloadResume = async (resumeUrl: string, applicantName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resumeUrl)

      if (error) throw error

      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${applicantName}_resume.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download resume",
        variant: "destructive"
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return <div className="p-6">Loading applications...</div>
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-clean-black mb-2">Clinician Applications</h2>
        <p className="text-wine-brown">Review and manage clinician applications</p>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id} className="border-light-taupe">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2 text-clean-black">
                    <User className="h-5 w-5 text-hero-mauve" />
                    {application.first_name} {application.last_name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1">
                      <Stethoscope className="h-4 w-4" />
                      {application.specialty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Building className="h-4 w-4" />
                      {application.practice_name}
                    </span>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                  <span className="text-sm text-wine-brown">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-hero-mauve" />
                    <span>{application.email}</span>
                  </div>
                  {application.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-hero-mauve" />
                      <span>{application.phone}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    <strong>AHPRA:</strong> {application.ahpra_number}
                  </div>
                  {application.years_experience && (
                    <div className="text-sm">
                      <strong>Experience:</strong> {application.years_experience}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {application.current_emr && (
                    <div className="text-sm">
                      <strong>Current EMR:</strong> {application.current_emr}
                    </div>
                  )}
                  {application.weekly_patients && (
                    <div className="text-sm">
                      <strong>Weekly Patients:</strong> {application.weekly_patients}
                    </div>
                  )}
                  {application.interested_features.length > 0 && (
                    <div className="text-sm">
                      <strong>Interested Features:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {application.interested_features.map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* HR Message */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="h-4 w-4 text-hero-mauve" />
                  <strong className="text-sm">Message to HR:</strong>
                </div>
                <p className="text-sm text-wine-brown bg-light-taupe/30 p-3 rounded-md">
                  {application.hr_message}
                </p>
              </div>

              {/* Hours of Availability */}
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-hero-mauve" />
                  <strong className="text-sm">Available Hours:</strong>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(application.hours_availability || {}).map(([day, hours]: [string, any]) => (
                    hours.available && (
                      <div key={day} className="bg-light-taupe/30 p-2 rounded">
                        <div className="font-medium capitalize">{day}</div>
                        <div>{hours.startTime} - {hours.endTime}</div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-light-taupe">
                {application.resume_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadResume(application.resume_url!, `${application.first_name}_${application.last_name}`)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Resume
                  </Button>
                )}
                
                {application.status === 'pending' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedApp(application)
                        setAdminNotes(application.admin_notes || "")
                      }}
                    >
                      Review Application
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <User className="h-12 w-12 text-wine-brown mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-clean-black mb-2">No Applications Yet</h3>
              <p className="text-wine-brown">Clinician applications will appear here when submitted.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Review Dialog */}
      {selectedApp && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-clean-black">
                Review Application: {selectedApp.first_name} {selectedApp.last_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminNotes" className="text-clean-black">Admin Notes</Label>
                <Textarea
                  id="adminNotes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add any notes about this application..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => handleStatusUpdate(selectedApp.id, 'approved')}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Approve & Schedule Interview"}
                </Button>
                
                <Button
                  onClick={() => handleStatusUpdate(selectedApp.id, 'rejected')}
                  disabled={actionLoading}
                  variant="destructive"
                >
                  <X className="h-4 w-4 mr-2" />
                  {actionLoading ? "Processing..." : "Reject Application"}
                </Button>
                
                <Button
                  onClick={() => setSelectedApp(null)}
                  variant="outline"
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}