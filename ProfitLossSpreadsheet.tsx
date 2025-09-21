
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, FileSpreadsheet } from "lucide-react"

export function ProfitLossSpreadsheet() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Profit & Loss Statement</h2>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export P&L
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Revenue Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total Revenue</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Form Submissions</span>
                <span>0</span>
              </div>
              <div className="flex justify-between">
                <span>Average Per Submission</span>
                <span>$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Card */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Clinician Payments</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Costs</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between">
                <span>Total Expenses</span>
                <span>$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Net Profit Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-green-600">$0.00</div>
              <p className="text-muted-foreground mt-2">Start fresh with new submissions to see profit data</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
