import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { DocumentViewer } from '@/components/clinician/DocumentViewer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { postJson } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Clock, FileText, User } from 'lucide-react';
import { format } from 'date-fns';

interface FormSubmission {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string | null;
  patient_address: string | null;
  form_type: string;
  created_at: string;
  document_url: string | null;
  approved_by_clinician: boolean;
  approved_at: string | null;
  approved_by_email: string | null;
  form_data: {
    concern?: string;
    duration_and_history?: string;
    quality_of_life_impact?: string;
    [key: string]: string | undefined;
  };
}

interface ClinicianApprovalCardProps {
  submission: FormSubmission;
  onApprovalChange: () => void;
}

export const ClinicianApprovalCard: React.FC<ClinicianApprovalCardProps> = ({
  submission,
  onApprovalChange,
}) => {
  const [isApproving, setIsApproving] = useState(false);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  const handleApproval = async () => {
    setIsApproving(true);
    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // Update the form approval status
      const { error } = await supabase
        .from('medicaiforms')
        .update({
          approved_by_clinician: true,
          approved_by_email: user.email,
        })
        .eq('id', submission.id);

      if (error) throw error;

      // Send document email notification via Supabase Edge Function (more reliable in dev)
      if (submission.document_url) {
        try {
          const { data: emailData, error: emailError } = await supabase.functions.invoke('send-document-email', {
            body: {
              submissionId: submission.id,
              recipientType: 'patient',
              patientEmail: submission.patient_email,
              patientName: submission.patient_name,
              formType: submission.form_type,
              pdfUrl: submission.document_url,
              message: `Approved by ${user.email}`,
            },
          });
          if (emailError) {
            console.error('Error sending document email:', emailError);
          } else {
            console.log('Email sent successfully:', emailData);
          }
        } catch (emailError) {
          console.error('Error sending document email:', emailError);
        }
      }

      // Trigger Zapier webhook
      try {
        const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/23129866/u274jvg/';
        const zapierPayload = {
          submissionId: submission.id,
          documentUrl: submission.document_url,
          formType: submission.form_type,
          patientName: submission.patient_name,
          patientEmail: submission.patient_email,
          approvedBy: user.email,
          approvedAt: new Date().toISOString(),
          status: 'approved',
          formData: submission.form_data,
        };

        await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify(zapierPayload),
        });
      } catch (zapierError) {
        console.error('Error triggering Zapier webhook:', zapierError);
      }

      toast({
        title: "Form Approved",
        description: "The form has been approved and the patient will be notified.",
      });

      onApprovalChange();
    } catch (error: Error | unknown) {
      console.error('Error approving form:', error);
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve the form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {submission.form_type}
          </CardTitle>
          <Badge variant={submission.approved_by_clinician ? "default" : "secondary"}>
            {submission.approved_by_clinician ? (
              <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
            ) : (
              <><Clock className="w-3 h-3 mr-1" /> Pending</>
            )}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Patient:</strong> {submission.patient_name}
          </div>
          <div>
            <strong>Email:</strong> {submission.patient_email}
          </div>
          <div>
            <strong>Phone:</strong> {submission.patient_phone || 'Not provided'}
          </div>
          <div>
            <strong>Address:</strong> {submission.patient_address || 'Not provided'}
          </div>
          <div>
            <strong>Submitted:</strong> {format(new Date(submission.created_at), 'PPp')}
          </div>
          <div>
            <strong>Document:</strong> {submission.document_url ? (
              <DocumentViewer
                documentUrl={submission.document_url}
                patientName={submission.patient_name}
                formType={submission.form_type}
              />
            ) : (
              <span className="text-muted-foreground">Generating...</span>
            )}
          </div>
        </div>

        {submission.form_data && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Form Details</h4>
            <div className="text-sm space-y-1">
              {submission.form_data.concern && (
                <div><strong>Concern:</strong> {submission.form_data.concern}</div>
              )}
              {submission.form_data.duration_and_history && (
                <div><strong>Duration & History:</strong> {submission.form_data.duration_and_history}</div>
              )}
              {submission.form_data.quality_of_life_impact && (
                <div><strong>Quality of Life Impact:</strong> {submission.form_data.quality_of_life_impact}</div>
              )}
            </div>
          </div>
        )}

        {submission.approved_by_clinician ? (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <User className="w-4 h-4" />
              <span className="font-medium">Approved by {submission.approved_by_email}</span>
            </div>
            {submission.approved_at && (
              <div className="text-sm text-green-600 mt-1">
                {format(new Date(submission.approved_at), 'PPp')}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            <Button
              onClick={handleApproval}
              disabled={isApproving || !submission.document_url}
              className="w-full"
            >
              {isApproving ? 'Approving...' : 'Approve Form'}
            </Button>

            {!submission.document_url && (
              <p className="text-sm text-muted-foreground text-center">
                Please wait for the document to generate before approving
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};