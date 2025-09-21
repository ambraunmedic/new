import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { Clock, LogIn, LogOut, Timer, TimerIcon, TimerOffIcon } from "lucide-react"

interface Shift {
  id: string
  clinician_email: string
  shift_start: string
  shift_end?: string
  total_minutes?: number
  status: 'active' | 'completed'
}

export function ShiftTracker() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [elapsedTime, setElapsedTime] = useState<string>("")
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (user?.email) {
      fetchCurrentShift()
    }
  }, [user])

  // Update elapsed time every minute for active shift
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (currentShift && currentShift.status === 'active') {
      const updateElapsedTime = () => {
        const startTime = new Date(currentShift.shift_start).getTime()
        const now = Date.now()
        const diffMinutes = Math.max(0, Math.floor((now - startTime) / (1000 * 60)))
        const hours = Math.floor(diffMinutes / 60)
        const minutes = diffMinutes % 60
        setElapsedTime(`${hours}h ${minutes}m`)
      }

      updateElapsedTime() // Initial calculation
      interval = setInterval(updateElapsedTime, 60000) // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentShift])

  const fetchCurrentShift = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('clinician_shifts')
        .select('*')
        .eq('clinician_email', user.email)
        .eq('status', 'active')
        .order('shift_start', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) throw error
      setCurrentShift(data as Shift | null)
    } catch (error) {
      console.error('Error fetching current shift:', error)
    }
  }

  const signIn = async () => {
    if (!user?.email) return

    setIsLoading(true)
    try {
      // Check if there's already an active shift
      const { data: existingShift } = await supabase
        .from('clinician_shifts')
        .select('*')
        .eq('clinician_email', user.email)
        .eq('status', 'active')
        .maybeSingle()

      if (existingShift) {
        toast({
          title: "Already signed in",
          description: "You already have an active shift",
          variant: "destructive"
        })
        return
      }

      const { data, error } = await supabase
        .from('clinician_shifts')
        .insert({
          clinician_email: user.email,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      setCurrentShift(data as Shift)
      toast({
        title: "Signed in successfully",
        description: "Your shift has started",
      })
    } catch (error) {
      console.error('Error signing in:', error)
      toast({
        title: "Error",
        description: "Failed to sign in for shift",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    if (!currentShift) return

    setIsLoading(true)
    try {
      const shiftEnd = new Date()
      const shiftStart = new Date(currentShift.shift_start)
      const totalMinutes = Math.floor((shiftEnd.getTime() - shiftStart.getTime()) / (1000 * 60))

      const { error } = await supabase
        .from('clinician_shifts')
        .update({
          shift_end: shiftEnd.toISOString(),
          total_minutes: totalMinutes,
          status: 'completed'
        })
        .eq('id', currentShift.id)

      if (error) throw error

      setCurrentShift(null)
      setElapsedTime("")

      toast({
        title: "Signed out successfully",
        description: `Shift completed. Total time: ${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`,
      })
    } catch (error) {
      console.error('Error signing out:', error)
      toast({
        title: "Error",
        description: "Failed to sign out of shift",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-AU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Card className="w-full mx-auto h-52">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Shift Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentShift ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="default" className="bg-green-500">
                  Currently Active
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Started at {formatTime(currentShift.shift_start)}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <Timer className="h-4 w-4" />
                  {elapsedTime}
                </div>
                <p className="text-xs text-muted-foreground">Elapsed time</p>
              </div>
            </div>

            <Button
              onClick={signOut}
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              <TimerOffIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Stopping tracker..." : "Stop tracker"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Badge variant="outline">Not tracking</Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Click below to start your shift
              </p>
            </div>

            <Button
              onClick={signIn}
              disabled={isLoading}
              className="w-full"
            >
              <TimerIcon className="mr-2 h-4 w-4" />
              {isLoading ? "Starting tracker..." : "Start tracker"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}