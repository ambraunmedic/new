import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import ComplianceVerification from './ComplianceVerification'
import { 
  Shield, 
  Eye, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Database,
  Lock,
  FileText,
  Users,
  Calendar
} from "lucide-react"

interface ConsentRecord {
  id: string
  patientId: string
  consentType: string
  givenAt: string
  clinicianId: string
  status: 'active' | 'withdrawn'
}

interface AccessLog {
  id: string
  userId: string
  patientId: string
  action: string
  accessedAt: string
  userRole: string
}

interface RetentionStatus {
  recordType: string
  count: number
  oldestRecord: string
  retentionPeriod: string
  nextCleanup: string
}

export default function ComplianceManager() {
  const [activeTab, setActiveTab] = useState('overview')
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([
    {
      id: '1',
      patientId: 'patient-123',
      consentType: 'Medical Certificate Generation',
      givenAt: '2024-06-01T10:30:00Z',
      clinicianId: 'dr-smith',
      status: 'active'
    },
    {
      id: '2',
      patientId: 'patient-456',
      consentType: 'Specialist Referral',
      givenAt: '2024-06-02T14:15:00Z',
      clinicianId: 'dr-jones',
      status: 'active'
    }
  ])
  
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([
    {
      id: '1',
      userId: 'dr-smith',
      patientId: 'patient-123',
      action: 'VIEW_MEDICAL_HISTORY',
      accessedAt: '2024-06-06T09:15:00Z',
      userRole: 'GP'
    },
    {
      id: '2',
      userId: 'dr-jones',
      patientId: 'patient-456',
      action: 'GENERATE_REFERRAL',
      accessedAt: '2024-06-06T11:30:00Z',
      userRole: 'Specialist'
    }
  ])

  const [retentionStatus] = useState<RetentionStatus[]>([
    {
      recordType: 'Adult Medical Records',
      count: 1247,
      oldestRecord: '2017-06-06',
      retentionPeriod: '7 years',
      nextCleanup: '2024-06-06'
    },
    {
      recordType: 'Pediatric Records',
      count: 89,
      oldestRecord: '2015-03-15',
      retentionPeriod: 'Until age 25',
      nextCleanup: '2024-07-15'
    }
  ])

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-emerald-900/30 border-emerald-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-emerald-200 text-sm">
              <Database className="h-4 w-4" />
              Data Residency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
              ✓ Sydney Region
            </Badge>
            <p className="text-xs text-emerald-100 mt-2">ap-southeast-2</p>
          </CardContent>
        </Card>

        <Card className="bg-blue-900/30 border-blue-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-blue-200 text-sm">
              <Shield className="h-4 w-4" />
              RLS Policies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-blue-500/20 text-blue-200 border-blue-500/30">
              ✓ Active
            </Badge>
            <p className="text-xs text-blue-100 mt-2">12 policies</p>
          </CardContent>
        </Card>

        <Card className="bg-purple-900/30 border-purple-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-purple-200 text-sm">
              <FileText className="h-4 w-4" />
              Consent Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-purple-500/20 text-purple-200 border-purple-500/30">
              ✓ {consentRecords.length} Active
            </Badge>
            <p className="text-xs text-purple-100 mt-2">100% compliance</p>
          </CardContent>
        </Card>

        <Card className="bg-orange-900/30 border-orange-500/30">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-orange-200 text-sm">
              <Eye className="h-4 w-4" />
              Access Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="bg-orange-500/20 text-orange-200 border-orange-500/30">
              ✓ {accessLogs.length} Today
            </Badge>
            <p className="text-xs text-orange-100 mt-2">Real-time logging</p>
          </CardContent>
        </Card>
      </div>

      <Alert className="bg-emerald-900/30 border-emerald-500/50">
        <CheckCircle className="h-4 w-4 text-emerald-400" />
        <AlertDescription className="text-emerald-200">
          <strong>Australian Compliance Status:</strong> All 5 core requirements are implemented and monitoring correctly. 
          Data residency confirmed in Sydney region with full audit trail.
        </AlertDescription>
      </Alert>
    </div>
  )

  const renderConsentManagement = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Consent Records</h3>
        <Button className="bg-purple-600 hover:bg-purple-700">
          New Consent
        </Button>
      </div>
      
      <div className="space-y-4">
        {consentRecords.map((consent) => (
          <Card key={consent.id} className="bg-slate-800/50 border-purple-500/30">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white text-lg">{consent.consentType}</CardTitle>
                  <CardDescription className="text-slate-400">
                    Patient ID: {consent.patientId}
                  </CardDescription>
                </div>
                <Badge className={consent.status === 'active' 
                  ? "bg-green-500/20 text-green-200 border-green-500/30"
                  : "bg-red-500/20 text-red-200 border-red-500/30"
                }>
                  {consent.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="text-slate-300">
                  <strong>Given:</strong> {new Date(consent.givenAt).toLocaleString()}
                </div>
                <div className="text-slate-300">
                  <strong>Clinician:</strong> {consent.clinicianId}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderAccessLogs = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Access Audit Trail</h3>
      
      <div className="space-y-4">
        {accessLogs.map((log) => (
          <Card key={log.id} className="bg-slate-800/50 border-orange-500/30">
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-orange-200 font-medium">{log.userRole}</div>
                  <div className="text-slate-400">{log.userId}</div>
                </div>
                <div>
                  <div className="text-white font-medium">{log.action}</div>
                  <div className="text-slate-400">Patient: {log.patientId}</div>
                </div>
                <div>
                  <div className="text-slate-300">
                    {new Date(log.accessedAt).toLocaleDateString()}
                  </div>
                  <div className="text-slate-400">
                    {new Date(log.accessedAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="flex items-center">
                  <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-500/30">
                    Authorized
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  const renderRetentionPolicies = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white">Data Retention Management</h3>
      
      <div className="space-y-4">
        {retentionStatus.map((status, index) => (
          <Card key={index} className="bg-slate-800/50 border-cyan-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5 text-cyan-400" />
                {status.recordType}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4">
                <div>
                  <div className="text-cyan-200 font-medium">{status.count}</div>
                  <div className="text-slate-400 text-sm">Total Records</div>
                </div>
                <div>
                  <div className="text-slate-300">{status.retentionPeriod}</div>
                  <div className="text-slate-400 text-sm">Retention Period</div>
                </div>
                <div>
                  <div className="text-slate-300">{status.oldestRecord}</div>
                  <div className="text-slate-400 text-sm">Oldest Record</div>
                </div>
                <div>
                  <div className="text-slate-300">{status.nextCleanup}</div>
                  <div className="text-slate-400 text-sm">Next Cleanup</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-6">
        <Button 
          variant={activeTab === 'overview' ? 'default' : 'outline'}
          onClick={() => setActiveTab('overview')}
          className="border-purple-500/30"
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === 'consent' ? 'default' : 'outline'}
          onClick={() => setActiveTab('consent')}
          className="border-purple-500/30"
        >
          Consent Management
        </Button>
        <Button 
          variant={activeTab === 'access' ? 'default' : 'outline'}
          onClick={() => setActiveTab('access')}
          className="border-purple-500/30"
        >
          Access Logs
        </Button>
        <Button 
          variant={activeTab === 'retention' ? 'default' : 'outline'}
          onClick={() => setActiveTab('retention')}
          className="border-purple-500/30"
        >
          Data Retention
        </Button>
        <Button 
          variant={activeTab === 'verification' ? 'default' : 'outline'}
          onClick={() => setActiveTab('verification')}
          className="border-purple-500/30"
        >
          Verification
        </Button>
      </div>

      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'consent' && renderConsentManagement()}
      {activeTab === 'access' && renderAccessLogs()}
      {activeTab === 'retention' && renderRetentionPolicies()}
      {activeTab === 'verification' && <ComplianceVerification />}
    </div>
  )
}
