import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Eye, Send, Check, FileText, Mail } from 'lucide-react';

interface DocumentRecord {
  id: string;
  form_submission_id: number;
  document_url: string;
  document_type: string;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  status: string;
  patient_file_id: string;
  patient_files: {
    patient_name: string;
    patient_email: string;
  };
  medicaiforms: {
    patient_name: string;
    patient_email: string;
    form_type: string;
    submitted_at: string;
    clinician_reviewed: boolean;
    pdf_sent_to_clinician: boolean;
    pdf_sent_to_patient: boolean;
    admin_notified: boolean;
  };
}

export const DocumentReviewManager = () => {
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [emailMessage, setEmailMessage] = useState('');
  const [clinicianEmail, setClinicianEmail] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('document_records')
        .select(`
          *,
          patient_files(patient_name, patient_email),
          medicaiforms(
            patient_name,
            patient_email,
            form_type,
            submitted_at,
            clinician_reviewed,
            pdf_sent_to_clinician,
            pdf_sent_to_patient,
            admin_notified
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsReviewed = async (doc: DocumentRecord) => {
    try {
      // Update document record
      const { error: docError } = await supabase
        .from('document_records')
        .update({
          status: 'reviewed',
          reviewed_by: 'Current Clinician', // In real app, get from auth
          reviewed_at: new Date().toISOString()
        })
        .eq('id', doc.id);

      if (docError) throw docError;

      // Update form submission
      const { error: formError } = await supabase
        .from('medicaiforms')
        .update({
          clinician_reviewed: true,
          clinician_reviewed_at: new Date().toISOString(),
          clinician_reviewed_by: 'Current Clinician'
        })
        .eq('id', doc.form_submission_id);

      if (formError) throw formError;

      toast({
        title: "Document Reviewed",
        description: "Document has been marked as reviewed"
      });

      fetchDocuments();
    } catch (error) {
      console.error('Error marking as reviewed:', error);
      toast({
        title: "Error",
        description: "Failed to mark document as reviewed",
        variant: "destructive"
      });
    }
  };

  const sendDocumentEmail = async (recipientType: 'clinician' | 'patient' | 'admin') => {
    if (!selectedDoc) return;

    setSendingEmail(true);
    try {
      const { error } = await supabase.functions.invoke('send-dermatology-referral', {
        body: {
          submissionId: selectedDoc.form_submission_id,
          recipientType,
          recipientEmail: recipientType === 'clinician' ? clinicianEmail : undefined,
          patientEmail: selectedDoc.patient_files?.patient_email,
          patientName: selectedDoc.patient_files?.patient_name,
          message: emailMessage
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: `Document sent to ${recipientType} successfully`
      });

      setEmailMessage('');
      setClinicianEmail('');
      fetchDocuments();
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive"
      });
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading documents...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Document Review & Management</h2>
        <Button onClick={fetchDocuments} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {doc.medicaiforms?.patient_name || doc.patient_files.patient_name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {doc.medicaiforms?.patient_email || doc.patient_files.patient_email}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={doc.status === 'reviewed' ? 'default' : 'secondary'}>
                    {doc.status}
                  </Badge>
                  {doc.medicaiforms?.clinician_reviewed && (
                    <Badge variant="outline">
                      <Check className="w-3 h-3 mr-1" />
                      Reviewed
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-medium">Document Type</p>
                  <p className="text-sm text-muted-foreground">{doc.document_type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Created</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {doc.medicaiforms && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <Badge variant={doc.medicaiforms.pdf_sent_to_clinician ? 'default' : 'outline'}>
                    <Mail className="w-3 h-3 mr-1" />
                    Clinician
                  </Badge>
                  <Badge variant={doc.medicaiforms.pdf_sent_to_patient ? 'default' : 'outline'}>
                    <Mail className="w-3 h-3 mr-1" />
                    Patient
                  </Badge>
                  <Badge variant={doc.medicaiforms.admin_notified ? 'default' : 'outline'}>
                    <Mail className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(doc.document_url, '_blank')}
                  disabled={!doc.document_url}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Document
                </Button>

                {doc.status !== 'reviewed' && (
                  <Button
                    size="sm"
                    onClick={() => markAsReviewed(doc)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Mark Reviewed
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Send Email
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Send Document</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="message">Message (optional)</Label>
                        <Textarea
                          id="message"
                          placeholder="Add a message..."
                          value={emailMessage}
                          onChange={(e) => setEmailMessage(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <Button
                          onClick={() => sendDocumentEmail('patient')}
                          disabled={sendingEmail}
                          className="justify-start"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Send to Patient
                        </Button>

                        <div className="space-y-2">
                          <Input
                            placeholder="Clinician email"
                            value={clinicianEmail}
                            onChange={(e) => setClinicianEmail(e.target.value)}
                          />
                          <Button
                            onClick={() => sendDocumentEmail('clinician')}
                            disabled={sendingEmail || !clinicianEmail}
                            variant="outline"
                            className="justify-start w-full"
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            Send to Clinician
                          </Button>
                        </div>

                        <Button
                          onClick={() => sendDocumentEmail('admin')}
                          disabled={sendingEmail}
                          variant="outline"
                          className="justify-start"
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Send to Admin
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {documents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No documents found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};