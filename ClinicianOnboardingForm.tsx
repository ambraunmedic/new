import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { UserPlus, Stethoscope, Shield, CheckCircle, Clock, Upload, MessageSquare } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"

interface ClinicianOnboardingFormProps {
  onClose?: () => void
}

export function ClinicianOnboardingForm({ onClose }: ClinicianOnboardingFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    practiceName: '',
    ahpraNumber: '',
    specialty: '',
    yearsExperience: '',
    currentEMR: '',
    weeklyPatients: '',
    interestedFeatures: [] as string[],
    hoursAvailability: {
      monday: { available: false, startTime: '', endTime: '' },
      tuesday: { available: false, startTime: '', endTime: '' },
      wednesday: { available: false, startTime: '', endTime: '' },
      thursday: { available: false, startTime: '', endTime: '' },
      friday: { available: false, startTime: '', endTime: '' },
      saturday: { available: false, startTime: '', endTime: '' },
      sunday: { available: false, startTime: '', endTime: '' }
    },
    resumeFile: null as File | null,
    hrMessage: '',
    notes: '',
    agreesToTerms: false,
    agreesToPrivacy: false
  })

  const specialties = [
    'General Practice',
    'Internal Medicine', 
    'Cardiology',
    'Dermatology',
    'Endocrinology',
    'Gastroenterology',
    'Neurology',
    'Psychiatry',
    'Rheumatology',
    'Other'
  ]

  const features = [
    'AI-Generated Medical Certificates',
    'Specialist Referral Letters', 
    'Patient Triage System',
    'Automated Documentation',
    'GP Communication Portal',
    'Practice Analytics'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      interestedFeatures: prev.interestedFeatures.includes(feature)
        ? prev.interestedFeatures.filter(f => f !== feature)
        : [...prev.interestedFeatures, feature]
    }))
  }

  const handleAvailabilityChange = (day: string, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      hoursAvailability: {
        ...prev.hoursAvailability,
        [day]: {
          ...prev.hoursAvailability[day as keyof typeof prev.hoursAvailability],
          [field]: value
        }
      }
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData(prev => ({ ...prev, resumeFile: file }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.agreesToTerms || !formData.agreesToPrivacy) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and privacy policy to continue.",
        variant: "destructive"
      })
      return
    }

    if (!formData.resumeFile) {
      toast({
        title: "Resume Required",
        description: "Please upload your resume to continue.",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)

    try {
      let resumeUrl = ''
      
      // Upload resume file if provided
      if (formData.resumeFile) {
        const fileExt = formData.resumeFile.name.split('.').pop()
        const fileName = `${Date.now()}-${formData.email}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from('resumes')
          .upload(fileName, formData.resumeFile)

        if (uploadError) throw uploadError
        resumeUrl = fileName
      }

      // Submit application to database
      const { error } = await supabase
        .from('clinician_applications')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone || null,
          practice_name: formData.practiceName,
          ahpra_number: formData.ahpraNumber,
          specialty: formData.specialty,
          years_experience: formData.yearsExperience || null,
          current_emr: formData.currentEMR || null,
          weekly_patients: formData.weeklyPatients || null,
          interested_features: formData.interestedFeatures,
          hours_availability: formData.hoursAvailability,
          resume_url: resumeUrl,
          hr_message: formData.hrMessage,
          status: 'pending'
        })

      if (error) throw error

      // Send notification email to admin
      await supabase.functions.invoke('send-clinician-notification', {
        body: {
          applicantName: `${formData.firstName} ${formData.lastName}`,
          applicantEmail: formData.email,
          specialty: formData.specialty,
          applicationId: Date.now() // This would be the actual ID from the insert response
        }
      })
      
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and contact you within 2 business days.",
      })
      
      if (onClose) onClose()
    } catch (error: any) {
      console.error('Submission error:', error)
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again or contact support.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="border-clean-black/20">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-accent-green/10 rounded-full">
              <UserPlus className="h-6 w-6 text-accent-green" />
            </div>
          </div>
          <CardTitle className="text-2xl text-clean-black">Clinician Onboarding</CardTitle>
          <p className="text-wine-brown mt-2">
            Join the MedicAi platform and streamline your practice with AI-powered medical documentation
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Stethoscope className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Personal Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-clean-black">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-clean-black">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-clean-black">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-clean-black">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Professional Information</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="practiceName" className="text-clean-black">Practice/Clinic Name *</Label>
                  <Input
                    id="practiceName"
                    value={formData.practiceName}
                    onChange={(e) => handleInputChange('practiceName', e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="ahpraNumber" className="text-clean-black">AHPRA Registration Number *</Label>
                  <Input
                    id="ahpraNumber"
                    value={formData.ahpraNumber}
                    onChange={(e) => handleInputChange('ahpraNumber', e.target.value)}
                    required
                    className="mt-1"
                    placeholder="e.g., MED0001234567"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialty" className="text-clean-black">Primary Specialty *</Label>
                  <Select value={formData.specialty} onValueChange={(value) => handleInputChange('specialty', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="yearsExperience" className="text-clean-black">Years of Experience</Label>
                  <Select value={formData.yearsExperience} onValueChange={(value) => handleInputChange('yearsExperience', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-2">0-2 years</SelectItem>
                      <SelectItem value="3-5">3-5 years</SelectItem>
                      <SelectItem value="6-10">6-10 years</SelectItem>
                      <SelectItem value="11-20">11-20 years</SelectItem>
                      <SelectItem value="20+">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentEMR" className="text-clean-black">Current EMR/Practice Management System</Label>
                  <Input
                    id="currentEMR"
                    value={formData.currentEMR}
                    onChange={(e) => handleInputChange('currentEMR', e.target.value)}
                    className="mt-1"
                    placeholder="e.g., Best Practice, Medical Director"
                  />
                </div>
                <div>
                  <Label htmlFor="weeklyPatients" className="text-clean-black">Approximate Weekly Patient Load</Label>
                  <Select value={formData.weeklyPatients} onValueChange={(value) => handleInputChange('weeklyPatients', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-50">0-50 patients</SelectItem>
                      <SelectItem value="51-100">51-100 patients</SelectItem>
                      <SelectItem value="101-200">101-200 patients</SelectItem>
                      <SelectItem value="201-300">201-300 patients</SelectItem>
                      <SelectItem value="300+">300+ patients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Features of Interest */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Features of Interest</h3>
              </div>
              
              <div className="grid md:grid-cols-2 gap-3">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={formData.interestedFeatures.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                      className="border-clean-black/30"
                    />
                    <Label htmlFor={feature} className="text-sm text-clean-black">{feature}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Hours of Availability */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Hours of Availability</h3>
              </div>
              
              <div className="space-y-3">
                {Object.entries(formData.hoursAvailability).map(([day, availability]) => (
                  <div key={day} className="grid md:grid-cols-4 gap-4 items-center">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${day}-available`}
                        checked={availability.available}
                        onCheckedChange={(checked) => handleAvailabilityChange(day, 'available', !!checked)}
                        className="border-clean-black/30"
                      />
                      <Label htmlFor={`${day}-available`} className="text-sm text-clean-black capitalize">
                        {day}
                      </Label>
                    </div>
                    
                    <div>
                      <Label htmlFor={`${day}-start`} className="text-xs text-wine-brown">Start Time</Label>
                      <Input
                        id={`${day}-start`}
                        type="time"
                        value={availability.startTime}
                        onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)}
                        disabled={!availability.available}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`${day}-end`} className="text-xs text-wine-brown">End Time</Label>
                      <Input
                        id={`${day}-end`}
                        type="time"
                        value={availability.endTime}
                        onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)}
                        disabled={!availability.available}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Resume Upload</h3>
              </div>
              
              <div>
                <Label htmlFor="resume" className="text-clean-black">Upload Your Resume *</Label>
                <Input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="mt-1"
                  required
                />
                <p className="text-xs text-wine-brown mt-1">
                  Please upload your resume in PDF, DOC, or DOCX format (max 5MB)
                </p>
                {formData.resumeFile && (
                  <p className="text-sm text-accent-green mt-2">
                    Selected: {formData.resumeFile.name}
                  </p>
                )}
              </div>
            </div>

            {/* HR Message */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-5 w-5 text-accent-green" />
                <h3 className="text-lg font-semibold text-clean-black">Message to HR</h3>
              </div>
              
              <div>
                <Label htmlFor="hrMessage" className="text-clean-black">Brief Message to HR Team (500 words max) *</Label>
                <Textarea
                  id="hrMessage"
                  value={formData.hrMessage}
                  onChange={(e) => handleInputChange('hrMessage', e.target.value)}
                  className="mt-1"
                  rows={6}
                  maxLength={500}
                  required
                  placeholder="Tell us about your motivation to join MedicAi, relevant experience, and what you hope to contribute to our team..."
                />
                <p className="text-xs text-wine-brown mt-1">
                  {formData.hrMessage.length}/500 characters
                </p>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <Label htmlFor="notes" className="text-clean-black">Additional Notes or Questions</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="mt-1"
                rows={3}
                placeholder="Any specific requirements, questions, or comments..."
              />
            </div>

            {/* Agreements */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreesToTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreesToTerms: !!checked }))}
                  className="border-clean-black/30 mt-1"
                />
                <Label htmlFor="terms" className="text-sm text-clean-black">
                  I agree to the <span className="text-accent-green underline cursor-pointer">Terms of Service</span> and understand the responsibilities of using the MedicAi platform *
                </Label>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="privacy"
                  checked={formData.agreesToPrivacy}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreesToPrivacy: !!checked }))}
                  className="border-clean-black/30 mt-1"
                />
                <Label htmlFor="privacy" className="text-sm text-clean-black">
                  I acknowledge the <span className="text-accent-green underline cursor-pointer">Privacy Policy</span> and consent to data processing for onboarding purposes *
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6">
              {onClose && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="border-clean-black/30 text-clean-black hover:bg-clean-black/5"
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-accent-green text-white hover:bg-accent-green/90 px-8"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}