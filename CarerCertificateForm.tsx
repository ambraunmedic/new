
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { usePatientAuth } from '@/hooks/usePatientAuth'
import PatientAuthModal from '@/components/auth/PatientAuthModal'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Heart, Mail } from "lucide-react"

const formSchema = z.object({
  carerName: z.string().min(2, {
    message: "Carer name must be at least 2 characters.",
  }),
  carerDOB: z.string().min(1, {
    message: "Carer date of birth is required.",
  }),
  carerPhone: z.string().min(10, {
    message: "Must be a valid phone number",
  }),
  carerAddress: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
  patientName: z.string().min(2, {
    message: "Patient name must be at least 2 characters.",
  }),
  patientEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  patientDOB: z.string().min(1, {
    message: "Patient date of birth is required.",
  }),
  patientAddress: z.string().min(2, {
    message: "Patient address must be at least 2 characters.",
  }),
  relationshipType: z.enum(["dependent_child", "family_member", "person_under_care"], {
    required_error: "Please select a relationship type.",
  }),
  startDate: z.string().min(1, {
    message: "Start date is required.",
  }),
  endDate: z.string().min(1, {
    message: "End date is required.",
  }),
  medicalConditionDescription: z.string().min(10, {
    message: "Medical condition description must be at least 10 characters.",
  }),
  additionalNotes: z.string().optional(),
  includeGP: z.boolean().optional(),
  gpEmail: z.string().optional(),
  receiveHealthOptimization: z.boolean().optional(),
})

interface CarerCertificateFormProps {
  onSubmit: (data: z.infer<typeof formSchema>) => void
  onClose: () => void
}

export function CarerCertificateForm({ onSubmit, onClose }: CarerCertificateFormProps) {
  const { isAuthModalOpen, requireAuth, handleAuthSuccess, handleAuthCancel } = usePatientAuth()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      carerName: "",
      carerDOB: "",
      carerPhone: "",
      carerAddress: "",
      patientName: "",
      patientEmail: "",
      patientDOB: "",
      patientAddress: "",
      relationshipType: undefined,
      startDate: "",
      endDate: "",
      medicalConditionDescription: "",
      additionalNotes: "",
      includeGP: false,
      gpEmail: "",
      receiveHealthOptimization: false,
    },
  })

  const birthYears = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 18 - i)
  const relationshipOptions = [
    { value: "dependent_child", label: "Dependent child" },
    { value: "family_member", label: "Immediate family member" },
    { value: "person_under_care", label: "Person under the carer's care" },
  ]
  const includeGP = form.watch('includeGP')

  const submitFormData = (values: z.infer<typeof formSchema>) => {
    onSubmit(values)
  }

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    requireAuth(
      () => submitFormData(values),
      "Sign in to Generate Carer Certificate",
      "Please sign in or create an account to generate your carer certificate."
    )
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-lg border-purple-500/20">
      <CardHeader className="relative pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 mb-4 mt-2">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Carer Certificate</CardTitle>
            <p className="text-slate-400">Medical certificate for carer responsibilities</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 pt-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            
            {/* Carer Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Carer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="carerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Carer's Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter carer's full name" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carerDOB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Carer's Birth Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select birth year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600 max-h-48">
                          {birthYears.map((year) => (
                            <SelectItem key={year} value={year.toString()} className="text-white">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="carerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Carer's Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="0400 000 000" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="carerAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Carer's Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street, Suburb, State, Postcode" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Patient Care Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Person Being Cared For</h3>
              
              <FormField
                control={form.control}
                name="patientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Patient's Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient's full name" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="patientEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Patient's Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="patient@example.com" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="patientDOB"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Patient's Birth Year</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                            <SelectValue placeholder="Select birth year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-slate-800 border-slate-600 max-h-48">
                          {birthYears.map((year) => (
                            <SelectItem key={year} value={year.toString()} className="text-white">
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="patientAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Patient's Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main Street, Suburb, State, Postcode" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="relationshipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Relationship Type</FormLabel>
                    <div className="space-y-3">
                      {relationshipOptions.map((option) => (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={option.value}
                            checked={field.value === option.value}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange(option.value)
                              }
                            }}
                            className="border-slate-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                          />
                          <label
                            htmlFor={option.value}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-white cursor-pointer"
                          >
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Care Period Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Care Period</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">End Date</FormLabel>
                      <FormControl>
                        <Input type="date" className="bg-slate-700/50 border-slate-600 text-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Medical Information Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Medical Information</h3>
              
              <FormField
                control={form.control}
                name="medicalConditionDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">General Medical Condition (for certificate purposes)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief, general description of the medical condition requiring care support..."
                        className="bg-slate-700/50 border-slate-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-slate-400">
                      Note: Specific medical details remain confidential. Only general information needed for certificate.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional relevant information..."
                        className="bg-slate-700/50 border-slate-600 text-white"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* GP Communication Section */}
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <h4 className="text-md font-medium text-white">GP Communication</h4>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="includeGP"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-slate-500 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white text-sm font-normal">
                            Would you like your GP to be updated on your medical consultation today?
                          </FormLabel>
                          <p className="text-xs text-slate-400">
                            If yes, please include their email below and we will email them this letter out of courtesy.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />

                  {includeGP && (
                    <FormField
                      control={form.control}
                      name="gpEmail"
                      rules={{
                        required: includeGP ? "GP email is required when including GP" : false,
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Invalid email address"
                        }
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">GP Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" placeholder="doctor@clinic.com.au" className="bg-slate-700 border-slate-600 text-white" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Health Optimization Section */}
            <Card className="bg-slate-800 border-slate-600">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <h4 className="text-md font-medium text-white">Health Optimization</h4>
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="receiveHealthOptimization"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-slate-500 data-[state=checked]:bg-pink-500 data-[state=checked]:border-pink-500"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white text-sm font-normal">
                            Would you like to receive a free email for health optimization based on your gender, age and lifestyle?
                          </FormLabel>
                          <p className="text-xs text-slate-400">
                            If yes, we will send you a personalized health optimization email to the email address you have listed.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="bg-slate-800/50 border border-slate-600/30 rounded-lg p-4">
              <p className="text-slate-300 text-sm">
                <strong>Note:</strong> This certificate is provided for fulfilling carer obligations under workplace or leave policy, 
                and is issued in accordance with section 107(3) of the Fair Work Act 2009.
              </p>
            </div>

            <div className="flex justify-between pt-6">
              <Button type="button" onClick={onClose} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:scale-105 transition-all duration-300">
                Generate Carer Certificate
              </Button>
            </div>

          </form>
        </Form>
      </CardContent>
      </Card>

      <PatientAuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthCancel}
        onSuccess={handleAuthSuccess}
        title="Sign in to Generate Carer Certificate"
        description="Please sign in or create an account to generate your carer certificate."
      />
    </>
  )
}
