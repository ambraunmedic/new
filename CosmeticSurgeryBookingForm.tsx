import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { CosmeticSurgeryQuestionnaire } from "./CosmeticSurgeryQuestionnaire"

interface CosmeticSurgeryBookingFormProps {
  children: React.ReactNode
}

export function CosmeticSurgeryBookingForm({ children }: CosmeticSurgeryBookingFormProps) {
  const [open, setOpen] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formData, setFormData] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    procedureType?: string;
    gpEmail?: string;
    consentToAssessment?: boolean;
  } | null>(null);
  const { toast } = useToast()
  const { submitForm, isSubmitting } = useFormSubmission()

  const handleQuestionnaireComplete = (data: {
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    procedureType?: string;
    gpEmail?: string;
    consentToAssessment?: boolean;
  }) => {
    setFormData(data)
    setShowConfirmation(true)
  }

  const handleClose = () => {
    setOpen(false)
    setShowConfirmation(false)
    setFormData(null)
  }

  const handleSubmit = async () => {
    if (!formData) return

    // Validate required fields
    if (!formData.consentToAssessment) {
      toast({
        title: "Consent Required",
        description: "Please consent to the psychological assessment to proceed.",
        variant: "destructive"
      })
      return
    }

    // Submit form with payment flow
    const result = await submitForm({
      formType: 'Cosmetic Surgery Referral',
      formData: {
        ...formData,
        gpEmail: formData.gpEmail
      },
      patientName: formData.fullName,
      patientEmail: formData.email,
      patientPhone: formData.phone,
      paymentAmount: 29.99,
      gpEmail: formData.gpEmail
    })
    
    if (result) {
      setShowConfirmation(false)
      setOpen(false)
      setFormData(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        {showConfirmation ? (
          // Dear Doctor Confirmation Screen
          <div className="min-h-[80vh] flex relative overflow-hidden">
            {/* Cinematic Hero Background */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
                <div className="absolute inset-0 opacity-40">
                  <div className="absolute top-1/2 left-1/4 w-32 h-80 transform -translate-y-1/2 rotate-12 bg-white/10 blur-3xl"></div>
                  <div className="absolute top-1/2 left-1/3 w-20 h-60 transform -translate-y-1/2 rotate-6 bg-white/5 blur-2xl"></div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20"></div>
              </div>
              
              {/* Dear Doctor circle */}
              <div className="absolute left-8 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <div className="relative">
                  <div className="w-80 h-80 rounded-full border-2 border-white/90 backdrop-blur-sm bg-white/5 flex items-center justify-center">
                    <h1 className="text-4xl font-black text-white font-inter tracking-wide text-center">
                      Dear Doctor
                    </h1>
                  </div>
                  <div className="absolute inset-0 w-80 h-80 rounded-full border border-white/30 blur-sm"></div>
                </div>
              </div>
            </div>

            {/* Close button */}
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 rounded-lg p-2 backdrop-blur-md"
              >
                ✕
              </button>
            </div>

            {/* Referral details panel */}
            <div className="absolute right-8 top-[10%] transform z-10 w-96">
              <div className="transform animate-fade-in">
                <div 
                  className="backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="px-6 py-4 border-b border-white/20 bg-white/5">
                    <h2 className="text-base font-semibold text-white">Please confirm the below details are correct</h2>
                  </div>

                  <div className="p-6 pb-4 max-h-[60vh] overflow-y-auto">
                    <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm mb-4">
                      <h3 className="text-sm font-semibold text-white mb-3">Patient Details</h3>
                      <div className="space-y-1 text-sm text-white/90">
                        <div><span className="font-medium">Name:</span> {formData?.fullName || 'Not provided'}</div>
                        <div><span className="font-medium">Email:</span> {formData?.email || 'Not provided'}</div>
                        <div><span className="font-medium">Phone:</span> {formData?.phone || 'Not provided'}</div>
                        <div><span className="font-medium">Date of Birth:</span> {formData?.dateOfBirth || 'Not provided'}</div>
                        <div><span className="font-medium">Procedure Type:</span> {formData?.procedureType || 'Not provided'}</div>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-lg p-4 border border-white/20 backdrop-blur-sm">
                      <div className="mb-4 text-sm text-white font-medium">
                        <div>Dr. A. Braun, Cosmetic Surgery Specialist</div>
                        <div>MedicAI Clinician</div>
                        <div>Regarding Patient: {formData?.fullName || 'Patient'}</div>
                      </div>
                      
                      <div className="text-xs text-white/90 whitespace-pre-line bg-white/5 p-3 rounded-lg border border-white/10 font-mono leading-relaxed">
                        {`Dear Doctor,

I have reviewed patient ${formData?.fullName || 'Patient'} for cosmetic surgery consultation. ${formData?.fullName?.split(' ')[0] || 'Patient'} has expressed interest in ${formData?.procedureType || 'cosmetic procedures'} and has completed our comprehensive assessment including BDD screening and psychological evaluation as required by Australian safety standards.

The patient has undergone thorough evaluation and appears suitable for specialist consultation. All necessary psychological assessments have been completed in accordance with RACGP guidelines.

Thank you for your consideration.

Dr A. Braun
Provider Number 1234567
MedicAI Clinician
www.MedicAI.com.au
Ph: 1 300 AI FORM
drbraun@medicaiforms.com.au`}
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-4 mt-4 mb-8">
                      <button
                        onClick={() => setShowConfirmation(false)}
                        className="px-4 py-2 border border-white/30 text-white hover:bg-white/10 bg-white/5 rounded-lg"
                      >
                        Back to Assessment
                      </button>
                      
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Referral"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer message */}
            <div className="absolute bottom-0 left-0 right-0 bg-orange-600/90 backdrop-blur-sm">
              <div className="overflow-hidden whitespace-nowrap">
                <div className="animate-marquee inline-block py-2 text-white text-sm font-medium">
                  📞 Please keep your phone on you - Your clinician will be calling soon &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                </div>
              </div>
            </div>
          </div>
        ) : (
          // New questionnaire component with dermatology-style layout
          <CosmeticSurgeryQuestionnaire 
            onComplete={handleQuestionnaireComplete}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}