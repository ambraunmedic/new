
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, FileText, Clock } from "lucide-react"

// Fresh start with empty metrics data
const mockMetrics = {
  dailyStats: [],
  topPerformers: [
    { name: "Dr. Anna Braun", submissions: 0, revenue: 0 }
  ]
}

export function AdminMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Daily Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Daily Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No performance data yet. Start fresh with new submissions.</p>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Clinicians */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clinicians
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Clinician</TableHead>
                  <TableHead>Submissions</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockMetrics.topPerformers.map((clinician) => (
                  <TableRow key={clinician.name}>
                    <TableCell className="font-medium">{clinician.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{clinician.submissions}</Badge>
                    </TableCell>
                    <TableCell>${clinician.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
