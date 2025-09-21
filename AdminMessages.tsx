import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { MessageSquare, Mail, Clock, User, Send } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface PatientMessage {
  id: string
  created_at: string
  patient_name: string
  patient_email: string
  subject: string
  message: string
  status: string
  admin_response?: string
  responded_at?: string
}

export function AdminMessages() {
  const [messages, setMessages] = useState<PatientMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMessage, setSelectedMessage] = useState<PatientMessage | null>(null)
  const [response, setResponse] = useState('')
  const [isResponding, setIsResponding] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_messages')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRespond = async () => {
    if (!selectedMessage || !response.trim()) return

    setIsResponding(true)
    try {
      const { error } = await supabase
        .from('patient_messages')
        .update({
          admin_response: response.trim(),
          responded_at: new Date().toISOString(),
          status: 'responded'
        })
        .eq('id', selectedMessage.id)

      if (error) throw error

      toast({
        title: "Response sent",
        description: "Your response has been saved successfully"
      })

      setSelectedMessage(null)
      setResponse('')
      fetchMessages()
    } catch (error) {
      console.error('Error sending response:', error)
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive"
      })
    } finally {
      setIsResponding(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'destructive'
      case 'responded':
        return 'secondary'
      default:
        return 'outline'
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

  if (selectedMessage) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setSelectedMessage(null)}>
            ← Back to Messages
          </Button>
          <h2 className="text-xl font-semibold">Respond to Message</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              {selectedMessage.subject}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {selectedMessage.patient_name} ({selectedMessage.patient_email})
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDate(selectedMessage.created_at)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Patient Message:</h4>
              <div className="bg-muted p-4 rounded-lg">
                {selectedMessage.message}
              </div>
            </div>

            {selectedMessage.admin_response && (
              <div>
                <h4 className="font-medium mb-2">Previous Response:</h4>
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  {selectedMessage.admin_response}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Responded on {formatDate(selectedMessage.responded_at!)}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-medium mb-2">Your Response:</h4>
              <Textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response to the patient..."
                className="min-h-[120px]"
              />
            </div>

            <Button 
              onClick={handleRespond} 
              disabled={!response.trim() || isResponding}
              className="w-full"
            >
              {isResponding ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending Response...
                </div>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Patient Messages
          <Badge variant="outline" className="ml-2">
            {messages.filter(m => m.status === 'unread').length} unread
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No messages</h3>
            <p className="text-sm text-muted-foreground">No patient messages have been received yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div>{message.patient_name}</div>
                          <div className="text-xs text-muted-foreground">{message.patient_email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{message.subject}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(message.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMessage(message)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        {message.status === 'unread' ? 'Respond' : 'View'}
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
