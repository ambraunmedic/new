
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Clock } from "lucide-react"

interface TimeSlot {
  time: string
  available: boolean
}

interface TimeSlotSelectorProps {
  timeSlots: TimeSlot[]
  selectedTime: string
  onTimeSelect: (time: string) => void
}

export function TimeSlotSelector({ timeSlots, selectedTime, onTimeSelect }: TimeSlotSelectorProps) {
  if (timeSlots.length === 0) return null

  return (
    <div>
      <Label className="text-base font-medium flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Available Times
      </Label>
      <div className="grid grid-cols-3 gap-2 mt-2">
        {timeSlots.map((slot) => (
          <Button
            key={slot.time}
            type="button"
            variant={selectedTime === slot.time ? "default" : "outline"}
            disabled={!slot.available}
            onClick={() => onTimeSelect(slot.time)}
            className="text-sm"
          >
            {slot.time}
          </Button>
        ))}
      </div>
    </div>
  )
}
