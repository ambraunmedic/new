import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight } from "lucide-react"
import empoweringImage1 from "@/assets/empowering-curves-1.jpg"
import empoweringImage2 from "@/assets/natural-belly-folds.jpg"
import empoweringImage3 from "@/assets/empowering-curves-3.jpg"
import celluliteBodyImage from "@/assets/lovable-uploads/df28af4a-ae87-42c3-b9d7-8c86d0e885e1.png"
import empoweringImage5 from "@/assets/empowering-curves-5.jpg"
import empoweringImage6 from "@/assets/natural-back-folds.jpg"

interface CosmeticSurgeryQuestionnaireProps {
  onComplete: (formData: any) => void
  onClose: () => void
}

export function CosmeticSurgeryQuestionnaire({ onComplete, onClose }: CosmeticSurgeryQuestionnaireProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    
    // GP Information & Referral
    hasUsualGP: "",
    gpName: "",
    gpClinic: "",
    gpEmail: "",
    consentToSendReferral: false,
    
    // Procedure Information & Motivation
    procedureType: "",
    motivationExternal: "",
    motivationInternal: "",
    expectations: "",
    previouslyDeclined: "",
    
    // BDD Screening (BDDQ-AS)
    bddq1: "", // Very concerned about appearance
    bddq2: "", // Think about body parts a lot
    bddq3: "", // Time spent thinking about appearance
    bddq4: "", // Interference with social life
    bddq5: "", // Interference with work/school
    bddq6: "", // Things you avoid
    
    // Medical History
    medicalConditions: "",
    currentMedications: "",
    previousSurgeries: "",
    mentalHealthHistory: "",
    
    // Understanding & Consent
    understandsRisks: false,
    understandsCosts: false,
    understandsCoolingOff: false,
    understandsConsultations: false,
    consentToAssessment: false
  })

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getEmpoweringMessage = () => {
    switch (currentStep) {
      case 1:
        return {
          image: empoweringImage1,
          message: "These folds tell a story. Of movement, strength, and softness. You carry so much. You hold so much. And still, here you are — beautifully whole."
        }
      case 2:
        return {
          image: empoweringImage2,
          message: "Your body speaks a language of resilience. Every curve, every line holds wisdom. You are not broken. You are beautifully, powerfully human."
        }
      case 3:
        return {
          image: empoweringImage3,
          message: "There is beauty in vulnerability. There is strength in asking. Your journey toward feeling at home in your skin is valid and worthy."
        }
      case 4:
        return {
          image: celluliteBodyImage,
          message: "This isn't about removing. It's about revealing. You already carry the shape of power — we just listened to it."
        }
      case 5:
        return {
          image: empoweringImage5,
          message: "You weren't born in the wrong body. You were born in a world that didn't yet see it. This is me — not a version, but a truth."
        }
      case 6:
        return {
          image: empoweringImage1,
          message: "This is not the problem. This is the place we begin. Folds carry more than skin — they hold stories, weight, and time. We see all of it. With care."
        }
      default:
        return {
          image: empoweringImage1,
          message: "You are beautifully, powerfully human."
        }
    }
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      onComplete(formData)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentStep(currentStep - 1)
        setIsTransitioning(false)
      }, 300)
    } else {
      onClose()
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-violet-900">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => updateFormData("fullName", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData("email", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-violet-900">GP Information</h3>
            <div className="bg-violet-50 p-4 rounded-lg">
              <p className="text-sm text-violet-800 leading-relaxed">
                <strong>Important:</strong> All cosmetic surgery requires a GP referral under Australian regulations. 
                We will help you obtain this referral through MedicAI.
              </p>
            </div>
            
            <div>
              <Label>Do you have a usual GP? *</Label>
              <RadioGroup 
                value={formData.hasUsualGP} 
                onValueChange={(value) => updateFormData("hasUsualGP", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="gp-yes" />
                  <Label htmlFor="gp-yes">Yes, I have a usual GP</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="gp-no" />
                  <Label htmlFor="gp-no">No, I need to find a GP</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.hasUsualGP === "yes" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gpName">GP Name</Label>
                    <Input
                      id="gpName"
                      value={formData.gpName}
                      onChange={(e) => updateFormData("gpName", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gpClinic">GP Clinic</Label>
                    <Input
                      id="gpClinic"
                      value={formData.gpClinic}
                      onChange={(e) => updateFormData("gpClinic", e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="gpEmail">GP Email (for referral)</Label>
                  <Input
                    id="gpEmail"
                    type="email"
                    value={formData.gpEmail}
                    onChange={(e) => updateFormData("gpEmail", e.target.value)}
                    placeholder="Your GP's email address"
                  />
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentToSendReferral"
                    checked={formData.consentToSendReferral}
                    onCheckedChange={(checked) => updateFormData("consentToSendReferral", checked)}
                  />
                  <Label htmlFor="consentToSendReferral" className="text-sm leading-relaxed">
                    I consent to MedicAI sending the referral letter to my GP's email address above
                  </Label>
                </div>
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 h-full overflow-hidden">
            <h3 className="text-lg font-medium text-violet-900">Procedure Details & Motivation</h3>
            
            <div>
              <Label htmlFor="procedureType">What type of cosmetic surgery are you considering? *</Label>
              <Select value={formData.procedureType} onValueChange={(value) => updateFormData("procedureType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select procedure type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="breast-augmentation">Breast Augmentation</SelectItem>
                  <SelectItem value="abdominoplasty">Abdominoplasty (Tummy Tuck)</SelectItem>
                  <SelectItem value="rhinoplasty">Rhinoplasty (Nose Job)</SelectItem>
                  <SelectItem value="blepharoplasty">Blepharoplasty (Eyelid Surgery)</SelectItem>
                  <SelectItem value="facelift">Surgical Face Lift</SelectItem>
                  <SelectItem value="liposuction">Liposuction</SelectItem>
                  <SelectItem value="fat-transfer">Fat Transfer</SelectItem>
                  <SelectItem value="cosmetic-genital">Cosmetic Genital Surgery</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="motivationInternal">Internal Motivation: How do you feel about your appearance? *</Label>
              <Textarea
                id="motivationInternal"
                placeholder="Describe your personal feelings about the area you want to change..."
                value={formData.motivationInternal}
                onChange={(e) => updateFormData("motivationInternal", e.target.value)}
                rows={2}
                required
                className="resize-none overflow-hidden"
              />
            </div>

            <div>
              <Label htmlFor="motivationExternal">External Motivation: Are there external factors influencing your decision?</Label>
              <Textarea
                id="motivationExternal"
                placeholder="e.g., partner's opinion, social media, work requirements, peer pressure..."
                value={formData.motivationExternal}
                onChange={(e) => updateFormData("motivationExternal", e.target.value)}
                rows={2}
                className="resize-none overflow-hidden"
              />
            </div>

            <div>
              <Label htmlFor="expectations">What are your expectations for the outcome? *</Label>
              <Textarea
                id="expectations"
                placeholder="Please describe realistic expectations for your results and recovery..."
                value={formData.expectations}
                onChange={(e) => updateFormData("expectations", e.target.value)}
                rows={2}
                required
                className="resize-none overflow-hidden"
              />
            </div>

            <div>
              <Label>Has another practitioner previously declined to provide you cosmetic surgery? *</Label>
              <RadioGroup 
                value={formData.previouslyDeclined} 
                onValueChange={(value) => updateFormData("previouslyDeclined", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="declined-no" />
                  <Label htmlFor="declined-no">No</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="declined-yes" />
                  <Label htmlFor="declined-yes">Yes</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-violet-900">Body Dysmorphic Disorder Screening (BDDQ-AS)</h3>
            <p className="text-sm text-violet-600">
              This screening helps ensure cosmetic surgery is appropriate for you. Please answer honestly.
            </p>
            
            <div>
              <Label>Are you very concerned about the appearance of some part(s) of your body? *</Label>
              <RadioGroup 
                value={formData.bddq1} 
                onValueChange={(value) => updateFormData("bddq1", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-at-all" id="bddq1-not" />
                  <Label htmlFor="bddq1-not">Not at all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="bddq1-somewhat" />
                  <Label htmlFor="bddq1-somewhat">Somewhat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very" id="bddq1-very" />
                  <Label htmlFor="bddq1-very">Very much</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="extremely" id="bddq1-extremely" />
                  <Label htmlFor="bddq1-extremely">Extremely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Do you think about these body parts a lot and wish you could think about them less? *</Label>
              <RadioGroup 
                value={formData.bddq2} 
                onValueChange={(value) => updateFormData("bddq2", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="never" id="bddq2-never" />
                  <Label htmlFor="bddq2-never">Never</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="bddq2-rarely" />
                  <Label htmlFor="bddq2-rarely">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="bddq2-often" />
                  <Label htmlFor="bddq2-often">Often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-often" id="bddq2-very-often" />
                  <Label htmlFor="bddq2-very-often">Very often</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>How much time do you spend thinking about these body parts per day? *</Label>
              <RadioGroup 
                value={formData.bddq3} 
                onValueChange={(value) => updateFormData("bddq3", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="less-than-1-hour" id="bddq3-less" />
                  <Label htmlFor="bddq3-less">Less than 1 hour</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1-3-hours" id="bddq3-1-3" />
                  <Label htmlFor="bddq3-1-3">1-3 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="more-than-3-hours" id="bddq3-more" />
                  <Label htmlFor="bddq3-more">More than 3 hours</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-violet-900">BDD Screening Continued & Medical History</h3>
            
            <div>
              <Label>Does your appearance concern interfere with your social life? *</Label>
              <RadioGroup 
                value={formData.bddq4} 
                onValueChange={(value) => updateFormData("bddq4", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-at-all" id="bddq4-not" />
                  <Label htmlFor="bddq4-not">Not at all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slightly" id="bddq4-slightly" />
                  <Label htmlFor="bddq4-slightly">Slightly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately" id="bddq4-moderately" />
                  <Label htmlFor="bddq4-moderately">Moderately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severely" id="bddq4-severely" />
                  <Label htmlFor="bddq4-severely">Severely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Does your appearance concern interfere with your work or school? *</Label>
              <RadioGroup 
                value={formData.bddq5} 
                onValueChange={(value) => updateFormData("bddq5", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="not-at-all" id="bddq5-not" />
                  <Label htmlFor="bddq5-not">Not at all</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="slightly" id="bddq5-slightly" />
                  <Label htmlFor="bddq5-slightly">Slightly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderately" id="bddq5-moderately" />
                  <Label htmlFor="bddq5-moderately">Moderately</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="severely" id="bddq5-severely" />
                  <Label htmlFor="bddq5-severely">Severely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="mentalHealthHistory">Mental Health History (including counselling, therapy, or psychiatric treatment)</Label>
              <Textarea
                id="mentalHealthHistory"
                placeholder="Please describe any mental health treatment or concerns..."
                value={formData.mentalHealthHistory}
                onChange={(e) => updateFormData("mentalHealthHistory", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-violet-900">Understanding & Consent</h3>
            <p className="text-sm text-violet-600">
              Please confirm your understanding of the cosmetic surgery process and Australian safety requirements.
            </p>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understandsRisks"
                  checked={formData.understandsRisks}
                  onCheckedChange={(checked) => updateFormData("understandsRisks", checked)}
                />
                <Label htmlFor="understandsRisks" className="text-sm leading-relaxed">
                  I understand that cosmetic surgery carries risks including bleeding, infection, scarring, 
                  asymmetry, and the possibility of needing revision surgery.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understandsCosts"
                  checked={formData.understandsCosts}
                  onCheckedChange={(checked) => updateFormData("understandsCosts", checked)}
                />
                <Label htmlFor="understandsCosts" className="text-sm leading-relaxed">
                  I understand that cosmetic surgery is not covered by Medicare and involves significant 
                  out-of-pocket expenses including consultation fees, surgery, anaesthesia, and follow-up care.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understandsCoolingOff"
                  checked={formData.understandsCoolingOff}
                  onCheckedChange={(checked) => updateFormData("understandsCoolingOff", checked)}
                />
                <Label htmlFor="understandsCoolingOff" className="text-sm leading-relaxed">
                  I understand there is a mandatory 7-day cooling-off period between signing consent 
                  and having cosmetic surgery, during which I can withdraw consent.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="understandsConsultations"
                  checked={formData.understandsConsultations}
                  onCheckedChange={(checked) => updateFormData("understandsConsultations", checked)}
                />
                <Label htmlFor="understandsConsultations" className="text-sm leading-relaxed">
                  I understand I must have at least two pre-operative consultations, with at least one being 
                  in-person with the surgeon, and cannot sign consent forms at the first consultation.
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consentToAssessment"
                  checked={formData.consentToAssessment}
                  onCheckedChange={(checked) => updateFormData("consentToAssessment", checked)}
                />
                <Label htmlFor="consentToAssessment" className="text-sm leading-relaxed">
                  I consent to a psychological assessment and understand that this is required 
                  for all cosmetic surgery procedures under Australian safety standards. I confirm 
                  that all information provided is accurate and complete.
                </Label>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Determine which side the image and card should be on
  const isCardOnRight = currentStep % 2 === 0

  // Check if current step is answered
  const isStepComplete = () => {
    switch (currentStep) {
      case 1:
        return formData.fullName && formData.email && formData.phone && formData.dateOfBirth
      case 2:
        return formData.hasUsualGP
      case 3:
        return formData.procedureType && formData.motivationInternal && formData.expectations && formData.previouslyDeclined
      case 4:
        return formData.bddq1 && formData.bddq2 && formData.bddq3
      case 5:
        return formData.bddq4 && formData.bddq5 && formData.mentalHealthHistory
      case 6:
        return formData.understandsRisks && formData.understandsCosts && formData.understandsCoolingOff && formData.understandsConsultations && formData.consentToAssessment
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-y-auto overflow-x-hidden">
      {/* Cinematic background with violet/purple tones */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-slate-900"></div>
        
        {/* Central warm spotlight effect */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-gradient-radial from-violet-400/30 via-purple-600/15 to-transparent rounded-full transform -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
          <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-gradient-radial from-pink-300/20 via-violet-500/10 to-transparent rounded-full blur-2xl"></div>
        </div>
        
        {/* Atmospheric depth layers */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/80 via-violet-900/40 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-black/60 via-purple-900/20 to-transparent"></div>
        </div>

        {/* Soft cinematic glow */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-tl from-purple-400/25 to-transparent rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Featured image - alternates sides based on step */}
      <div className={`absolute ${isCardOnRight ? 'left-0' : 'right-0'} top-0 w-1/2 h-full overflow-hidden transition-all duration-500`}>
        <div 
          className="w-full h-full bg-cover bg-center opacity-50 blur-[0.5px]"
          style={{
            backgroundImage: `url(${getEmpoweringMessage().image})`,
            backgroundPosition: 'center',
            filter: 'sepia(10%) saturate(120%) brightness(90%) hue-rotate(-10deg)'
          }}
        />
        <div className={`absolute inset-0 ${isCardOnRight ? 'bg-gradient-to-r' : 'bg-gradient-to-l'} from-transparent via-black/10 to-black/40`} />
        
        {/* Empowering message overlay */}
        <div className={`absolute ${isCardOnRight ? 'bottom-8 left-8' : 'bottom-8 right-8'} z-10 max-w-xs`}>
          <p className="text-white/90 text-sm font-light tracking-wide italic leading-relaxed">
            {getEmpoweringMessage().message}
          </p>
        </div>
      </div>

      {/* Question card - alternates sides */}
      <div className={`relative z-10 flex items-start ${isCardOnRight ? 'justify-end' : 'justify-start'} w-full p-8 transition-all duration-500 min-h-screen`}>
        <div className={`w-full max-w-lg ${isCardOnRight ? 'mr-8' : 'ml-8'} my-auto`}>
          <Card 
            className={`p-8 shadow-2xl border-0 bg-white/95 backdrop-blur-lg transition-all duration-500 ${
              isTransitioning 
                ? `transform ${isCardOnRight ? 'translate-x-full' : '-translate-x-full'} opacity-0` 
                : 'transform translate-x-0 opacity-100'
            } ring-1 ring-violet-200/50`}
          >
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-violet-700">Step {currentStep} of 6</span>
                <span className="text-sm text-violet-600">{Math.round((currentStep / 6) * 100)}%</span>
              </div>
              <div className="w-full bg-violet-100 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
                />
              </div>
            </div>

            {/* Step content */}
            <div className="space-y-6">
              {renderStepContent()}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="border-violet-300 text-violet-700 hover:bg-violet-50"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                {currentStep === 1 ? "Cancel" : "Previous"}
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isStepComplete()}
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
              >
                {currentStep === 6 ? "Complete Assessment" : "Next"}
                {currentStep < 6 && <ChevronRight className="h-4 w-4 ml-2" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
