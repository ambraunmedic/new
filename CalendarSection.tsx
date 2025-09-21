
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"

interface BookingSlot {
  id: string
  day_of_week: number
  start_time: string
  end_time: string
  duration_minutes: number
}

interface CalendarSectionProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
  availableSlots: BookingSlot[]
}

export function CalendarSection({ selectedDate, onDateSelect, availableSlots }: CalendarSectionProps) {
  return (
    <div>
      <Label className="text-base font-medium">Select Date</Label>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={(date) => {
          const dayOfWeek = date.getDay()
          return !availableSlots.some(slot => slot.day_of_week === dayOfWeek) || 
                 date < new Date() ||
                 date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days ahead
        }}
        className="rounded-md border"
      />
    </div>
  )
}
