
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Mail, Search, Download, UserX, Calendar, Plus } from "lucide-react"

interface Subscriber {
  id: string
  email: string
  subscribed_at: string
  is_active: boolean
  source: string
}

export function EmailSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [newEmail, setNewEmail] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSubscribers()
  }, [])

  useEffect(() => {
    const filtered = subscribers.filter(subscriber =>
      subscriber.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.source.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredSubscribers(filtered)
  }, [subscribers, searchTerm])

  const fetchSubscribers = async () => {
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .select('*')
        .order('email', { ascending: true })

      if (error) throw error
      setSubscribers(data || [])
    } catch (error) {
      console.error('Error fetching subscribers:', error)
      toast({
        title: "Error",
        description: "Failed to fetch subscribers",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const addEmailSubscriber = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }

    // Check if email already exists
    const existingSubscriber = subscribers.find(sub => sub.email.toLowerCase() === newEmail.toLowerCase())
    if (existingSubscriber) {
      toast({
        title: "Error",
        description: "This email is already subscribed",
        variant: "destructive"
      })
      return
    }

    setIsAdding(true)
    try {
      const { data, error } = await supabase
        .from('email_subscribers')
        .insert({
          email: newEmail.toLowerCase(),
          source: 'admin_manual',
          is_active: true
        })
        .select()
        .single()

      if (error) throw error

      setSubscribers(prev => [data, ...prev])
      setNewEmail("")
      
      toast({
        title: "Success",
        description: "Email subscriber added successfully",
      })
    } catch (error) {
      console.error('Error adding subscriber:', error)
      toast({
        title: "Error",
        description: "Failed to add email subscriber",
        variant: "destructive"
      })
    } finally {
      setIsAdding(false)
    }
  }

  const toggleSubscriberStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('email_subscribers')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setSubscribers(prev => prev.map(sub => 
        sub.id === id ? { ...sub, is_active: !currentStatus } : sub
      ))

      toast({
        title: "Success",
        description: `Subscriber ${!currentStatus ? 'activated' : 'deactivated'}`,
      })
    } catch (error) {
      console.error('Error updating subscriber:', error)
      toast({
        title: "Error",
        description: "Failed to update subscriber status",
        variant: "destructive"
      })
    }
  }

  const exportSubscribers = () => {
    const activeSubscribers = subscribers.filter(sub => sub.is_active)
    const emails = activeSubscribers.map(sub => sub.email).join('\n')
    
    const blob = new Blob([emails], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `email-subscribers-${new Date().toISOString().split('T')[0]}.txt`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export complete",
      description: `Exported ${activeSubscribers.length} active email addresses`,
    })
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
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email Subscribers ({subscribers.filter(s => s.is_active).length} active)
            </CardTitle>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportSubscribers} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Active
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Email Form */}
        <div className="flex gap-2 p-4 bg-muted/50 rounded-lg">
          <Input
            placeholder="Enter email address to add..."
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            type="email"
            className="flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addEmailSubscriber()}
          />
          <Button 
            onClick={addEmailSubscriber} 
            disabled={isAdding || !newEmail}
          >
            <Plus className="mr-2 h-4 w-4" />
            {isAdding ? "Adding..." : "Add Email"}
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No subscribers match your search' : 'No subscribers yet'}
            </div>
          ) : (
            filteredSubscribers.map((subscriber) => (
              <div key={subscriber.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium">{subscriber.email}</span>
                    <Badge variant={subscriber.is_active ? "default" : "secondary"}>
                      {subscriber.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Badge variant="outline">{subscriber.source}</Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Subscribed {formatDate(subscriber.subscribed_at)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleSubscriberStatus(subscriber.id, subscriber.is_active)}
                >
                  <UserX className="h-4 w-4" />
                  {subscriber.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
