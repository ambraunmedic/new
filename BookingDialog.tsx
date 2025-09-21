
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { BookingCalendar } from "./BookingCalendar"
import { Phone } from "lucide-react"

interface BookingDialogProps {
  children?: React.ReactNode
  buttonText?: string
  buttonClassName?: string
}

export function BookingDialog({ 
  children, 
  buttonText = "Book a Discovery Call",
  buttonClassName = ""
}: BookingDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button className={buttonClassName}>
            <Phone className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogTitle>Book a Discovery Call</DialogTitle>
        <DialogDescription>
          Schedule a discovery call to discuss how we can help improve your clinic's efficiency and patient care.
        </DialogDescription>
        <BookingCalendar />
      </DialogContent>
    </Dialog>
  )
}
