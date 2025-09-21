
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Building, Mail, Phone, Globe, Users, MessageSquare, Target, AlertTriangle } from "lucide-react"

interface PartnershipApplication {
  id: string
  company_name: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  company_website?: string
  reason_for_partnership: string
  current_issues?: string
  optimization_areas?: string
  preferred_contact_method: string
  company_size?: string
  status: string
  created_at: string
}

export function PartnershipManagement() {
  const [applications, setApplications] = useState<PartnershipApplication[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const { data, error } = await (supabase as any)
      .from('partnership_applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching applications:', error)
      toast({
        title: "Error",
        description: "Failed to load partnership applications",
        variant: "destructive"
      })
    } else {
      setApplications(data || [])
    }

    setIsLoading(false)
  }

  const updateApplicationStatus = async (id: string, status: string) => {
    const { error } = await (supabase as any)
      .from('partnership_applications')
      .update({ status })
      .eq('id', id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive"
      })
    } else {
      toast({
        title: "Success",
        description: `Application ${status} successfully`
      })
      fetchApplications()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'under_review': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDateWithFullYear = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
  }

  const formatTimeWithFullYear = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-AU', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  if (isLoading) {
    return <div>Loading partnership applications...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Partnership Applications</h2>
        <Badge variant="secondary">{applications.length} Total</Badge>
      </div>

      <div className="grid gap-6">
        {applications.map((application) => (
          <Card key={application.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {application.company_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Contact: {application.contact_name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.replace('_', ' ')}
                  </Badge>
                  <Select value={application.status} onValueChange={(value) => updateApplicationStatus(application.id, value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Contact Information */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Contact Information
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span>{application.contact_email}</span>
                    </div>
                    {application.contact_phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span>{application.contact_phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-3 w-3 text-muted-foreground" />
                      <span>Prefers: {application.preferred_contact_method}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {application.company_website && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        <a href={application.company_website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {application.company_website}
                        </a>
                      </div>
                    )}
                    {application.company_size && (
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{application.company_size} employees</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Partnership Details */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Partnership Reason
                </h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                  {application.reason_for_partnership}
                </p>
              </div>

              {application.current_issues && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Current Issues
                  </h4>
                  <p className="text-sm text-muted-foreground bg-red-50 p-3 rounded-md">
                    {application.current_issues}
                  </p>
                </div>
              )}

              {application.optimization_areas && (
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Optimization Areas
                  </h4>
                  <p className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
                    {application.optimization_areas}
                  </p>
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                Applied: {formatDateWithFullYear(application.created_at)} at {formatTimeWithFullYear(application.created_at)}
              </div>
            </CardContent>
          </Card>
        ))}

        {applications.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No partnership applications yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
