
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface BookingSubmissionProps {
  isLoading: boolean
  disabled: boolean
}

export function BookingSubmission({ isLoading, disabled }: BookingSubmissionProps) {
  return (
    <Button 
      type="submit" 
      disabled={disabled}
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Booking...
        </>
      ) : (
        "Book Discovery Call"
      )}
    </Button>
  )
}
