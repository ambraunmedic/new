
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BookingFormData {
  name: string
  email: string
  phone: string
  company_name: string
  message: string
}

interface BookingFormFieldsProps {
  formData: BookingFormData
  onFormDataChange: (data: BookingFormData) => void
}

export function BookingFormFields({ formData, onFormDataChange }: BookingFormFieldsProps) {
  const handleChange = (field: keyof BookingFormData, value: string) => {
    onFormDataChange({ ...formData, [field]: value })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.company_name}
          onChange={(e) => handleChange('company_name', e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Tell us about your needs..."
          rows={3}
        />
      </div>
    </div>
  )
}
