import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { Clock, Search, Download, Calendar, Timer, User } from "lucide-react"

interface ClinicianShift {
  id: string
  clinician_email: string
  shift_start: string
  shift_end?: string
  total_minutes?: number
  status: 'active' | 'completed'
  created_at: string
}

export function ClinicianHours() {
  const [shifts, setShifts] = useState<ClinicianShift[]>([])
  const [filteredShifts, setFilteredShifts] = useState<ClinicianShift[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchShifts()
  }, [])

  useEffect(() => {
    const filtered = shifts.filter(shift =>
      shift.clinician_email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredShifts(filtered)
  }, [shifts, searchTerm])

  const fetchShifts = async () => {
    try {
      const { data, error } = await supabase
        .from('clinician_shifts')
        .select('*')
        .order('shift_start', { ascending: false })

      if (error) throw error
      setShifts(data as ClinicianShift[] || [])
    } catch (error) {
      console.error('Error fetching shifts:', error)
      toast({
        title: "Error",
        description: "Failed to fetch clinician shifts",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const exportHours = () => {
    const completedShifts = shifts.filter(shift => shift.status === 'completed' && shift.total_minutes)
    const csvContent = [
      'Clinician Email,Date,Shift Start,Shift End,Total Hours,Total Minutes',
      ...completedShifts.map(shift => {
        const date = new Date(shift.shift_start).toLocaleDateString('en-AU')
        const startTime = new Date(shift.shift_start).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' })
        const endTime = shift.shift_end ? new Date(shift.shift_end).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : 'N/A'
        const totalHours = shift.total_minutes ? (shift.total_minutes / 60).toFixed(2) : '0'
        return `${shift.clinician_email},${date},${startTime},${endTime},${totalHours},${shift.total_minutes || 0}`
      })
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `clinician-hours-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Export complete",
      description: `Exported ${completedShifts.length} completed shifts`,
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A'
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getActiveShifts = () => shifts.filter(shift => shift.status === 'active')
  const getTotalHoursToday = () => {
    const today = new Date().toDateString()
    return shifts
      .filter(shift => {
        const shiftDate = new Date(shift.shift_start).toDateString()
        return shiftDate === today && shift.total_minutes
      })
      .reduce((total, shift) => total + (shift.total_minutes || 0), 0)
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

  const activeShifts = getActiveShifts()
  const totalHoursToday = getTotalHoursToday()

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Clinician Working Hours
            </CardTitle>
            <div className="flex gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">
                  {activeShifts.length} currently active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">
                  {formatDuration(totalHoursToday)} worked today
                </span>
              </div>
            </div>
          </div>
          <Button onClick={exportHours} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by clinician email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredShifts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No shifts match your search' : 'No shifts recorded yet'}
            </div>
          ) : (
            filteredShifts.map((shift) => (
              <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{shift.clinician_email}</span>
                    <Badge variant={shift.status === 'active' ? "default" : "secondary"}>
                      {shift.status === 'active' ? "Currently Active" : "Completed"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Date:</span> {formatDate(shift.shift_start)}
                    </div>
                    <div>
                      <span className="font-medium">Start:</span> {formatTime(shift.shift_start)}
                    </div>
                    <div>
                      <span className="font-medium">End:</span> {shift.shift_end ? formatTime(shift.shift_end) : 'Active'}
                    </div>
                    <div>
                      <span className="font-medium">Duration:</span> {formatDuration(shift.total_minutes)}
                      {shift.status === 'active' && (
                        <span className="text-green-600 ml-1">(Running)</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}