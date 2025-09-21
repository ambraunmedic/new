
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Mail, Search, Calendar, Building, Phone, MessageSquare, User, UserPlus } from "lucide-react"

interface ContactInquiry {
  id: string
  first_name: string
  last_name: string
  email: string
  practice?: string
  phone?: string
  message: string
  status: string
  created_at: string
}

export function ContactInquiries() {
  const [inquiries, setInquiries] = useState<ContactInquiry[]>([])
  const [filteredInquiries, setFilteredInquiries] = useState<ContactInquiry[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    practice: "",
    phone: "",
    password: "",
    confirmPassword: ""
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchInquiries()
  }, [])

  useEffect(() => {
    let filtered = inquiries.filter(inquiry =>
      inquiry.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inquiry.practice && inquiry.practice.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter(inquiry => inquiry.status === statusFilter)
    }

    setFilteredInquiries(filtered)
  }, [inquiries, searchTerm, statusFilter])

  const fetchInquiries = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_inquiries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInquiries(data || [])
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      toast({
        title: "Error",
        description: "Failed to fetch contact inquiries",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateInquiryStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('contact_inquiries')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setInquiries(prev => prev.map(inquiry =>
        inquiry.id === id ? { ...inquiry, status } : inquiry
      ))

      toast({
        title: "Success",
        description: `Inquiry marked as ${status}`,
      })
    } catch (error) {
      console.error('Error updating inquiry:', error)
      toast({
        title: "Error",
        description: "Failed to update inquiry status",
        variant: "destructive"
      })
    }
  }

  const openCreateClinicianDialog = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry)
    setFormData({
      first_name: inquiry.first_name,
      last_name: inquiry.last_name,
      email: inquiry.email,
      practice: inquiry.practice || "",
      phone: inquiry.phone || "",
      password: "",
      confirmPassword: ""
    })
    setIsDialogOpen(true)
  }

  const createClinicianUser = async () => {
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive"
        })
        return
      }

      if (formData.password.length < 6) {
        toast({
          title: "Error",
          description: "Password must be at least 6 characters long",
          variant: "destructive"
        })
        return
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: 'clinician',
          practice: formData.practice
        }
      })

      if (error) throw error

      // Create detailed clinician profile in clinician_profiles table
      const { error: clinicianProfileError } = await supabase
        .from('clinician_profiles')
        .insert({
          user_id: data.user.id,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          practice_name: formData.practice,
          specialization: null,
          license_number: null,
          years_of_experience: null,
          education: null,
          certifications: null,
          languages_spoken: null,
          consultation_rate: null,
          availability_schedule: null,
          bio: null,
          profile_picture_url: null,
          is_verified: false,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })

      if (clinicianProfileError) throw clinicianProfileError

      // Update inquiry status to "responded"
      if (selectedInquiry) {
        await updateInquiryStatus(selectedInquiry.id, "responded")
      }

      toast({
        title: "Success",
        description: `Clinician user created for ${formData.email}`,
      })

      setIsDialogOpen(false)
      setSelectedInquiry(null)
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        practice: "",
        phone: "",
        password: "",
        confirmPassword: ""
      })
    } catch (error) {
      console.error('Error creating clinician user:', error)
      toast({
        title: "Error",
        description: "Failed to create clinician user",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'responded': return 'bg-green-100 text-green-800'
      case 'closed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Inquiries ({inquiries.length} total)
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search inquiries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="responded">Responded</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? 'No inquiries match your filters' : 'No contact inquiries yet'}
            </div>
          ) : (
            filteredInquiries.map((inquiry) => (
              <Card key={inquiry.id} className="border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{inquiry.first_name} {inquiry.last_name}</span>
                      </div>
                      <Badge className={getStatusColor(inquiry.status)}>
                        {inquiry.status}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => openCreateClinicianDialog(inquiry)}
                            className="bg-melon hover:bg-melon-700 text-ink border border-ink"
                          >
                            <UserPlus className="h-3 w-3 mr-1" />
                            Create Clinician
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle>Create Clinician Account</DialogTitle>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="first_name">First Name</Label>
                                <Input
                                  id="first_name"
                                  value={formData.first_name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="last_name">Last Name</Label>
                                <Input
                                  id="last_name"
                                  value={formData.last_name}
                                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="practice">Practice</Label>
                              <Input
                                id="practice"
                                value={formData.practice}
                                onChange={(e) => setFormData(prev => ({ ...prev, practice: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone</Label>
                              <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="password">Password</Label>
                              <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                placeholder="Enter password (min 6 characters)"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password</Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                placeholder="Confirm password"
                              />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                              </Button>
                              <Button onClick={createClinicianUser} className="bg-melon hover:bg-melon-700 text-ink">
                                Create Account
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Select value={inquiry.status} onValueChange={(value) => updateInquiryStatus(inquiry.id, value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="responded">Responded</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-sm mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <a href={`mailto:${inquiry.email}`} className="text-blue-600 hover:underline">
                          {inquiry.email}
                        </a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <a href={`tel:${inquiry.phone}`} className="text-blue-600 hover:underline">
                            {inquiry.phone}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1">
                      {inquiry.practice && (
                        <div className="flex items-center gap-2">
                          <Building className="h-3 w-3 text-muted-foreground" />
                          <span>{inquiry.practice}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span>{formatDate(inquiry.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-700">{inquiry.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
