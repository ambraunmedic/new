
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Phone, Mail, FileText, Calendar, DollarSign, Edit } from "lucide-react"

// Updated clinician data for Dr Anna Braun
const mockClinicianData = {
  name: "Dr. Anna Braun",
  email: "anna.braun@clinic.com",
  phone: "+61 400 123 456",
  providerNumber: "2345678A",
  ahpraNumber: "MED0002218189",
  contractStartDate: "2024-01-15",
  hourlyRate: 120.00,
  specialties: ["General Practice", "Mental Health"],
  address: "123 Medical Centre, Sydney NSW 2000",
  emergencyContact: "+61 400 987 654"
}

export function ClinicianProfile() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Personal Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={mockClinicianData.name}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={mockClinicianData.email}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Best Contact Number</Label>
            <Input
              id="phone"
              value={mockClinicianData.phone}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emergency">Emergency Contact</Label>
            <Input
              id="emergency"
              value={mockClinicianData.emergencyContact}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="address">Practice Address</Label>
            <Input
              id="address"
              value={mockClinicianData.address}
              readOnly
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Professional Details
          </CardTitle>
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="provider">Provider Number</Label>
            <Input
              id="provider"
              value={mockClinicianData.providerNumber}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ahpra">AHPRA Number</Label>
            <Input
              id="ahpra"
              value={mockClinicianData.ahpraNumber}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="specialties">Specialties</Label>
            <Input
              id="specialties"
              value={mockClinicianData.specialties.join(", ")}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="contractStart">Contract Start Date</Label>
            <Input
              id="contractStart"
              value={mockClinicianData.contractStartDate}
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="hourlyRate">Hourly Rate</Label>
            <Input
              id="hourlyRate"
              value={`$${mockClinicianData.hourlyRate}/hour`}
              readOnly
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contract Information */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            <h4 className="font-semibold">Current Contract Terms</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Hourly rate: ${mockClinicianData.hourlyRate}/hour</li>
              <li>• Contract commenced: {mockClinicianData.contractStartDate}</li>
              <li>• Payment processed weekly on Fridays</li>
              <li>• All documentation reviews to be completed within 24 hours</li>
              <li>• Professional indemnity insurance required and current</li>
            </ul>
            <div className="pt-4">
              <Button variant="outline" className="mr-2">
                <FileText className="h-4 w-4 mr-2" />
                View Full Contract
              </Button>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Contact Administration
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
