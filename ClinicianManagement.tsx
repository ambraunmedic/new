
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Edit, Trash2 } from "lucide-react"

// Updated clinician data with only Dr Anna Braun
const mockClinicians = [
  {
    id: 1,
    name: "Dr. Anna Braun",
    email: "anna.braun@clinic.com",
    phone: "+61 400 123 456",
    providerNumber: "2345678A",
    ahpraNumber: "MED0002218189",
    status: "Active",
    joinDate: "2024-01-15",
    totalSubmissions: 0
  }
]

export function ClinicianManagement() {
  const getStatusColor = (status: string) => {
    return status === "Active" ? "secondary" : "outline"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Clinician Management
        </CardTitle>
        <Button>
          <User className="h-4 w-4 mr-2" />
          Add Clinician
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Clinician</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Provider Number</TableHead>
                <TableHead>AHPRA Number</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submissions</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockClinicians.map((clinician) => (
                <TableRow key={clinician.id}>
                  <TableCell className="font-medium">{clinician.name}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{clinician.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{clinician.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{clinician.providerNumber}</TableCell>
                  <TableCell>{clinician.ahpraNumber}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(clinician.status)}>
                      {clinician.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{clinician.totalSubmissions}</TableCell>
                  <TableCell>{clinician.joinDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
