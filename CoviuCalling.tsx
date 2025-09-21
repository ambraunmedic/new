import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PhoneCall } from "lucide-react"

interface CoviuCallingProps {
  patientName?: string
  patientPhone?: string
  submissionId?: string
}

export function CoviuCalling({ patientName, patientPhone, submissionId }: CoviuCallingProps) {
  const [isCallActive, setIsCallActive] = useState(false)
  const coviuWaitingRoom = "https://app.coviu.com/t/medicai/join/reception"
  
  const handleStartCall = () => {
    console.log('handleStartCall clicked - opening COVIU portal')
    setIsCallActive(true)
    // Open COVIU in a new window/tab
    const newWindow = window.open(coviuWaitingRoom, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes')
    if (!newWindow) {
      console.log('Pop-up blocked - trying without window features')
      window.open(coviuWaitingRoom, '_blank')
    }
    console.log('COVIU portal opened successfully')
  }

  const handleEndCall = () => {
    setIsCallActive(false)
  }

  return (
    <div className="bg-coral-600/10 border border-coral-400/20 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneCall className="h-4 w-4 text-coral-400" />
          <span className="text-sm font-medium text-gray-700">COVIU Secure Call</span>
        </div>
        
        {isCallActive ? (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 bg-sage-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-sage-600 font-medium">Active</span>
            </div>
            <Button 
              onClick={handleEndCall}
              size="sm"
              variant="outline"
              className="border-coral-400/30 text-coral-600 hover:bg-coral-50 h-7 px-2 text-xs"
            >
              End Call
            </Button>
          </div>
        ) : (
          <Button 
            onClick={handleStartCall}
            size="sm"
            className="bg-coral-600 hover:bg-coral-700 text-white h-7 px-3 text-xs hover-scale"
          >
            <PhoneCall className="h-3 w-3 mr-1" />
            Call Patient
          </Button>
        )}
      </div>
    </div>
  )
}