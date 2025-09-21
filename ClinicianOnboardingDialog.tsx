import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ClinicianOnboardingForm } from "./ClinicianOnboardingForm"

interface ClinicianOnboardingDialogProps {
  children: React.ReactNode
}

export function ClinicianOnboardingDialog({ children }: ClinicianOnboardingDialogProps) {
  const [open, setOpen] = useState(false)

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-clean-black">Join Our Team</DialogTitle>
        </DialogHeader>
        <ClinicianOnboardingForm onClose={handleClose} />
      </DialogContent>
    </Dialog>
  )
}