
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CalendarDays, CheckCircle } from "lucide-react"
import { useBookingSlots } from "@/hooks/useBookingSlots"
import { CalendarSection } from "./CalendarSection"
import { TimeSlotSelector } from "./TimeSlotSelector"
import { BookingFormFields } from "./BookingFormFields"
import { BookingSubmission } from "./BookingSubmission"

export function BookingCalendar() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    message: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isBooked, setIsBooked] = useState(false)
  const { toast } = useToast()
  
  const { availableSlots, timeSlots, generateTimeSlots } = useBookingSlots()

  useEffect(() => {
    if (selectedDate) {
      generateTimeSlots(selectedDate)
    }
  }, [selectedDate, availableSlots])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Missing Information",
        description: "Please select a date and time for your call.",
        variant: "destructive"
      })
      return
    }

    if (!formData.name || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name and email address.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)

    const preferredDateTime = new Date(selectedDate)
    const [hours, minutes] = selectedTime.split(':').map(Number)
    preferredDateTime.setHours(hours, minutes, 0, 0)

    const { error } = await (supabase as any)
      .from('discovery_bookings')
      .insert({
        ...formData,
        preferred_time: preferredDateTime.toISOString()
      })

    if (error) {
      toast({
        title: "Booking Failed",
        description: "There was an error booking your call. Please try again.",
        variant: "destructive"
      })
      console.error('Error creating booking:', error)
    } else {
      toast({
        title: "Booking Confirmed!",
        description: "Your discovery call has been scheduled. We'll send you a confirmation email shortly.",
      })
      setIsBooked(true)
    }

    setIsLoading(false)
  }

  const resetBooking = () => {
    setIsBooked(false)
    setFormData({ name: "", email: "", phone: "", company_name: "", message: "" })
    setSelectedDate(undefined)
    setSelectedTime("")
  }

  if (isBooked) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-green-700 mb-4">
            Thank You for Booking!
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            Your discovery call has been successfully scheduled for{" "}
            <strong>{selectedDate?.toLocaleDateString()} at {selectedTime}</strong>
          </p>
          <p className="text-gray-600 mb-8">
            We'll send you a confirmation email with all the details shortly. 
            Our team will reach out to you at the scheduled time to discuss how 
            we can help improve your clinic's efficiency.
          </p>
          <button
            onClick={resetBooking}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Book Another Call
          </button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Book a Discovery Call
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Calendar and Time Selection - Available First */}
          <div className="space-y-4">
            <CalendarSection
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              availableSlots={availableSlots}
            />

            {/* Time Slots */}
            {selectedDate && (
              <TimeSlotSelector
                timeSlots={timeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            )}
          </div>

          {/* Form Section - Only show after date/time selection */}
          {selectedDate && selectedTime && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 text-sm">
                  ✓ Selected: {selectedDate.toLocaleDateString()} at {selectedTime}
                </p>
              </div>

              <BookingFormFields
                formData={formData}
                onFormDataChange={setFormData}
              />

              <BookingSubmission
                isLoading={isLoading}
                disabled={isLoading || !formData.name || !formData.email}
              />
            </form>
          )}

          {/* Instructions */}
          {!selectedDate && (
            <div className="text-center text-muted-foreground">
              <p>Please select a date to see available time slots</p>
            </div>
          )}

          {selectedDate && !selectedTime && (
            <div className="text-center text-muted-foreground">
              <p>Please select a time slot to continue with your booking</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
