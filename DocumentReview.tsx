import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { FileText, Send, Check, Clock, AlertCircle, Mail, Eye, Download, FileType, User, Calendar, Phone, MessageSquare, Activity, MapPin, Pill, PenTool, Save } from "lucide-react"
import { ClinicianSubmission } from "@/hooks/useClinicianSubmissions"
import { DocumentSubmission, EditableDocData } from "@/types/document-submission"
import { useDocumentGeneration } from "@/hooks/useDocumentGeneration"
import { ClinicianNotes } from "./ClinicianNotes"
import { SubmissionTimer } from "./SubmissionTimer"

import { PDFPreviewExact } from "./PDFPreviewExact"
import { AIDiagnosticPanel } from "./AIDiagnosticPanel"
import { CoviuCalling } from "./CoviuCalling"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/contexts/AuthContext"
import { toast } from "sonner"
import { postJson } from "@/lib/utils"
import medicaiLogoUrl from "@/assets/medicai_logo.png"

// Type for clinician profile from database
interface ClinicianProfile {
  id: string
  user_id: string
  email: string
  first_name: string
  last_name: string
  practice_name?: string
  license_number?: string
  specialization?: string
  phone?: string
  signature_image_url?: string
  created_at: string
  updated_at: string
}

interface DocumentReviewProps {
  submission: ClinicianSubmission
  onUpdate: () => void
}

export function DocumentReview({ submission, onUpdate }: DocumentReviewProps) {
  const { generateAndSendDocument, isGenerating } = useDocumentGeneration()
  const { user } = useAuth()

  const [isDocumentEditing, setIsDocumentEditing] = useState(false)
  const [signedPdfBlob, setSignedPdfBlob] = useState<Blob | null>(null)
  const [documentSaved, setDocumentSaved] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailToSend, setEmailToSend] = useState("")
  const [additionalEmails, setAdditionalEmails] = useState("")
  const [isApproving, setIsApproving] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [approvalNotes, setApprovalNotes] = useState("")
  const [clinicianProfile, setClinicianProfile] = useState<ClinicianProfile | null>(null)
  const [isLoadingClinician, setIsLoadingClinician] = useState(true)
  const [isPdfOutdated, setIsPdfOutdated] = useState(false)

  console.log("SUBMISSION: ", submission)

  // Comprehensive editable document data
  const [editableDocData, setEditableDocData] = useState({
    patientName: "",
    patientDOB: "",
    complaint: "",
    fromDate: "",
    toDate: "",
    clinicianName: "Dr Anna Braun",
    clinicName: "MedicAi Practice",
    editedContent: ""
  })

  // Initialize email and document data when component mounts
  useEffect(() => {
    if (submission.patient_email) {
      setEmailToSend(submission.patient_email);
    }

    // Initialize editable document data from submission
    setEditableDocData({
      patientName: submission.patient_name || "",
      patientDOB: (submission.form_data?.dateOfBirth || submission.form_data?.patientDOB || "") as string,
      complaint: (submission.form_data?.reason || submission.form_data?.complaint || submission.form_data?.condition || "") as string,
      fromDate: (submission as DocumentSubmission).start_date || (submission.form_data?.fromDate || submission.form_data?.startDate || "") as string,
      toDate: (submission as DocumentSubmission).end_date || (submission.form_data?.toDate || submission.form_data?.endDate || "") as string,
      clinicianName: clinicianProfile
        ? (clinicianProfile.first_name && clinicianProfile.last_name
          ? `Dr ${clinicianProfile.first_name} ${clinicianProfile.last_name}`
          : `Dr ${clinicianProfile.first_name || 'Unknown'}`)
        : "Dr Anna Braun",
      clinicName: clinicianProfile?.practice_name || "MedicAi Practice",
      editedContent: (submission as DocumentSubmission).document_content || generateDocumentContent(submission)
    })

    // Auto-populate additional emails from form submission
    if (submission.additional_recipients && submission.additional_recipients.length > 0) {
      const additionalEmailsList = submission.additional_recipients
        .map((recipient: { email: string }) => recipient.email)
        .join(', ')
      setAdditionalEmails(additionalEmailsList)
    }

    // Also include preferred specialist email if provided
    if (submission.preferred_specialist_email && submission.consent_to_share_with_specialist) {
      const specialistEmail = submission.preferred_specialist_email
      setAdditionalEmails(prev => prev ? `${prev}, ${specialistEmail}` : specialistEmail)
    }
  }, [submission.patient_email, submission.additional_recipients, submission.preferred_specialist_email, submission.consent_to_share_with_specialist, submission, clinicianProfile])

  // Query clinician profile
  useEffect(() => {
    const fetchClinicianProfile = async () => {
      if (!user?.email) {
        setIsLoadingClinician(false)
        return
      }

      try {
        const { data: profile, error } = await supabase
          .from('clinician_profiles')
          .select('*')
          .eq('email', user.email)
          .single()

        if (error) {
          console.warn('⚠️ Clinician profile not found:', error.message)
          // Don't show error toast for missing profile, just use defaults
          setClinicianProfile(null)
          setIsLoadingClinician(false)
          return
        }

        if (profile) {
          setClinicianProfile(profile)

          // Update editable document data with real clinician info
          setEditableDocData(prev => ({
            ...prev,
            clinicianName: profile.first_name && profile.last_name
              ? `Dr ${profile.first_name} ${profile.last_name}`
              : `Dr ${profile.first_name || 'Unknown'}`,
            clinicName: profile.practice_name || 'MedicAi Practice'
          }))
        }
      } catch (error) {
        console.error('❌ Error fetching clinician profile:', error)
        setClinicianProfile(null)
      } finally {
        setIsLoadingClinician(false)
      }
    }

    fetchClinicianProfile()
  }, [user?.email])

  const handleEmailConfirmation = () => {
    if (!signedPdfBlob) {
      toast.error("Please generate a signed PDF first");
      return;
    }
    setShowEmailDialog(true);
  };

  const sendEmailToRecipients = async () => {
    console.log('sendEmailToRecipients called');
    console.log('signedPdfBlob:', signedPdfBlob);
    console.log('signedPdfBlob size:', signedPdfBlob?.size);
    console.log('signedPdfBlob type:', signedPdfBlob?.type);
    console.log('emailToSend:', emailToSend);
    console.log('additionalEmails:', additionalEmails);

    if (!signedPdfBlob || !signedPdfBlob.size || signedPdfBlob.size === 0) {
      console.error('PDF blob is invalid:', signedPdfBlob);
      toast.error("PDF is not ready. Please generate a PDF first.");
      return;
    }

    try {
      const emails = [emailToSend];
      if (additionalEmails) {
        const additionalEmailList = additionalEmails.split(',').map(email => email.trim()).filter(email => email);
        emails.push(...additionalEmailList);
      }

      console.log('Sending emails to:', emails);

      for (const email of emails) {
        console.log('Sending email to:', email);
        await handleEmailToPatientSingle(email);
      }
      toast.success(`PDF sent to ${emails.length} recipient(s) successfully!`);
      setShowEmailDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error sending emails:', error);
      toast.error("Failed to send emails");
    }
  };

  const handleEmailToPatientSingle = async (emailAddress: string) => {
    console.log('📧 === EMAIL SENDING DEBUG START ===');
    console.log('📧 handleEmailToPatientSingle called with:', {
      emailAddress,
      hasPdfBlob: !!signedPdfBlob,
      pdfBlobSize: signedPdfBlob?.size,
      pdfBlobType: signedPdfBlob?.type
    });

    if (!signedPdfBlob) {
      console.error('📧 No PDF blob available');
      toast.error("Please generate a signed PDF first")
      return
    }

    // Additional blob validation before upload
    try {
      const arrayBuffer = await signedPdfBlob.arrayBuffer();
      console.log('📧 PDF blob validation:', {
        hasArrayBuffer: !!arrayBuffer,
        arrayBufferSize: arrayBuffer.byteLength,
        firstFewBytes: new Uint8Array(arrayBuffer.slice(0, 10))
      });
    } catch (blobError) {
      console.error('📧 PDF blob validation failed:', blobError);
      toast.error("PDF blob is corrupted");
      return;
    }

    try {
      // Parse patient name for storage organization
      const nameParts = submission.patient_name?.split(' ') || []
      const firstName = nameParts[0]?.replace(/[^a-zA-Z0-9]/g, '') || 'Patient'
      const lastName = nameParts.slice(1).join('')?.replace(/[^a-zA-Z0-9]/g, '') || 'Unknown'
      const dob = submission.form_data?.dateOfBirth || submission.form_data?.patientDOB

      // Upload signed PDF to storage with unique filename (no spaces or special chars)
      const timestamp = Date.now()
      const fileName = `medical_cert_${lastName}_${firstName}_${timestamp}.pdf`

      console.log('📧 Uploading PDF to storage:', {
        fileName,
        size: signedPdfBlob.size,
        bucket: 'signatures',
        contentType: 'application/pdf'
      });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, signedPdfBlob, {
          contentType: 'application/pdf',
          upsert: false
        })

      if (uploadError) {
        console.error('📧 Storage upload error:', {
          error: uploadError,
          message: uploadError.message,
          fileName,
          blobSize: signedPdfBlob.size
        });
        throw uploadError;
      }

      console.log('📧 PDF uploaded successfully:', {
        uploadData,
        path: uploadData.path,
        fullPath: uploadData.fullPath
      });

      // Store PDF record in patient_pdf_storage table
      const { error: storageError } = await supabase
        .from('patient_pdf_storage')
        .insert({
          patient_email: emailAddress,
          patient_first_name: firstName,
          patient_last_name: lastName,
          patient_dob: dob ? new Date(dob as string).toISOString().split('T')[0] : null,
          pdf_file_path: uploadData.path,
          pdf_url: `https://fhojgszdqgvoutsjmqkc.supabase.co/storage/v1/object/public/signatures/${uploadData.path}`,
          form_submission_id: submission.id,
          document_type: 'medical_certificate',
          emailed_to_patient_at: new Date().toISOString()
        })

      if (storageError) {
        console.error('Database storage error:', storageError);
        throw storageError;
      }

      console.log('Database record created successfully');

      const pdfUrl = `https://fhojgszdqgvoutsjmqkc.supabase.co/storage/v1/object/public/signatures/${uploadData.path}`;
      console.log('📧 Calling email function with PDF URL:', pdfUrl);

      // Verify PDF URL is accessible before sending email
      try {
        const response = await fetch(pdfUrl, { method: 'HEAD' });
        console.log('📧 PDF URL accessibility check:', {
          url: pdfUrl,
          status: response.status,
          statusText: response.statusText,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        });
      } catch (urlError) {
        console.error('📧 PDF URL not accessible:', urlError);
      }

      // Send email notification via Supabase Edge Function (avoids Vite proxy issues)
      const { data: emailData, error: emailError } = await supabase.functions.invoke('send-document-email', {
        body: {
          submissionId: submission.id,
          recipientType: 'patient',
          recipientEmail: emailAddress,
          patientEmail: emailAddress,
          patientName: submission.patient_name,
          pdfUrl: pdfUrl,
          formType: submission.form_type,
        },
      });

      if (emailError) {
        console.error('📧 Email function error:', emailError);
        throw emailError;
      }

      console.log('📧 Email sent successfully:', emailData);
      console.log('📧 === EMAIL SENDING DEBUG END ===');

    } catch (error) {
      console.error('Error storing and emailing PDF:', error);
      throw error; // Re-throw to be caught by sendEmailToRecipients
    }
  };

  // Function to set optimal font for PDF generation
  const setOptimalFont = (pdf: { setFont: (font: string, style: string) => void }, style: 'normal' | 'italic' = 'normal') => {
    try {
      // Use Times for better typography
      pdf.setFont('times', style);
    } catch (error) {
      try {
        // Fallback to Helvetica
        pdf.setFont('helvetica', style);
        console.log('⚠️ Using Helvetica font for PDF');
      } catch (fallbackError) {
        console.warn('⚠️ Font setting failed, using default');
      }
    }
  };

  // Function to load image and convert to base64
  const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('❌ Failed to load signature image:', error);
      return null;
    }
  };

  // Function to compress PDF blob
  const compressPDFBlob = async (pdfBlob: Blob): Promise<Blob> => {
    try {
      // Create a new jsPDF instance for compression
      const { default: jsPDF } = await import('jspdf');

      // Read the existing PDF as array buffer
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      // Create new PDF with compression settings
      const compressedPdf = new jsPDF('p', 'mm', 'a4');

      // Set compression level (this reduces file size)
      compressedPdf.setProperties({
        compress: true,
      });

      // Since we can't directly compress an existing PDF with jsPDF,
      // we'll return the original but with smaller dimensions/quality if needed
      // For now, let's try reducing the PDF content quality
      console.log('📦 Original PDF size:', pdfBlob.size, 'bytes');

      // If the PDF is still too large, we might need a different approach
      if (pdfBlob.size > 5 * 1024 * 1024) { // 5MB threshold
        console.warn('⚠️ PDF is very large, may need manual compression');
      }

      return pdfBlob; // Return original for now, we'll optimize the generation instead
    } catch (error) {
      console.error('📦 PDF compression failed:', error);
      return pdfBlob; // Fallback to original
    }
  };

  // Enhanced jsPDF generation function with compression
  const generateHTMLtoPDF = async (htmlContent: string, emailRecipient: string) => {
    try {

      // Create fresh PDF instance with compression settings
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        compress: true, // Enable compression
        precision: 2    // Reduce precision to save space
      });


      // Page setup
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const backgroundMargin = 10; // 60px converted to mm (60px * 0.3528mm/px)

      // =================================================================
      // FULL PAGE BACKGROUND with margin
      // =================================================================

      // Set light background color for the entire page with margin
      pdf.setFillColor(293, 241, 238); // Brand light background color
      pdf.rect(backgroundMargin, backgroundMargin, pageWidth - 2 * backgroundMargin, pageHeight - 2 * backgroundMargin, 'F'); // Fill page with margin

      // =================================================================
      // HEADER SECTION - Simple letterhead style like referral template
      // =================================================================

      // Main MedicAI logo - larger and positioned like referral template
      pdf.setFontSize(28);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.addImage(medicaiLogoUrl, 'PNG', margin, margin, 50, 13);

      // Contact info in top right corner - compact layout
      const contactX = pageWidth - margin - 80;
      pdf.setFontSize(9);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('ABN: 20 687 490 277', contactX, 25);
      pdf.text('21 Campbell St', contactX, 30);
      pdf.text('Surry Hills NSW 2010, Australia', contactX, 35);
      pdf.text('1300 AI FORM (1300 243 676)', contactX, 40);
      pdf.text('info@medicai.com.au', contactX, 45);

      // =================================================================
      // DATE SECTION - Simple right-aligned like referral template
      // =================================================================

      const currentDate = new Date().toLocaleDateString('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Date: ${currentDate}`, pageWidth - margin - 45, 60);

      // =================================================================
      // PATIENT INFORMATION - Simple format like referral template
      // =================================================================

      let currentY = 75;
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);

      // Regarding section
      pdf.text(`Regarding: ${submission.patient_name || '{patientName}'}`, margin, currentY);
      currentY += 6;

      const patientDob = submission.form_data?.dateOfBirth || submission.form_data?.patientDOB ?
        new Date(submission.form_data.dateOfBirth as string || submission.form_data.patientDOB as string).toLocaleDateString('en-AU') : '{dobDay/Month/Year}';
      pdf.text(`${patientDob}`, margin, currentY);
      currentY += 6;

      // pdf.text('{patientAddress}', margin, currentY);
      // currentY += 6;
      pdf.text(`${submission.patient_phone || '{patientPhone}'}`, margin, currentY);
      currentY += 6;
      pdf.text(`${submission.patient_email || '{patientEmail}'}`, margin, currentY);
      currentY += 10;

      // =================================================================
      // DOCUMENT CONTENT - Simple format like referral template
      // =================================================================

      let contentY = currentY;

      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);

      // Simple greeting
      // Simple greeting with real clinician information
      const greeting = clinicianProfile?.first_name
        ? `Dear ${clinicianProfile.first_name}'s employer,`
        : 'Dear employer,';

      pdf.text(greeting, margin, contentY);
      contentY += 10;

      // Main content paragraph - use the same text as HTML template
      let mainContent = editableDocData.editedContent || `TO WHOM IT MAY CONCERN:

I hereby certify that ${submission.patient_name || '[Patient Name]'} attended my medical practice for consultation and clinical assessment.

Following comprehensive medical evaluation, I confirm that this patient has a medical condition that renders them unfit for work/study activities for the period specified above.

This medical certificate is issued in accordance with Australian medical standards and professional guidelines. The patient should be excused from work/study commitments during the certified period to allow for appropriate recovery.

Should you require any additional medical information or clarification regarding this certificate, please contact our practice using the details provided above.`;

      // Add date range information if available
      if (editableDocData.fromDate && editableDocData.toDate) {
        const startDate = new Date(editableDocData.fromDate).toLocaleDateString('en-AU');
        const endDate = new Date(editableDocData.toDate).toLocaleDateString('en-AU');
        const dateRangeText = `

PERIOD OF MEDICAL LEAVE: ${startDate} to ${endDate}

The patient is certified as medically unfit for work/study during the above-mentioned period.`;
        mainContent = mainContent + dateRangeText;
      } else if (editableDocData.fromDate) {
        const startDate = new Date(editableDocData.fromDate).toLocaleDateString('en-AU');
        const singleDateText = `

EFFECTIVE DATE: ${startDate}

This certification is effective from the above date.`;
        mainContent = mainContent + singleDateText;
      }

      const lines = pdf.splitTextToSize(mainContent, pageWidth - 2 * margin);
      pdf.text(lines, margin, contentY);

      // =================================================================
      // SIGNATURE SECTION - Fixed at bottom of page
      // =================================================================
      // Position signature at fixed bottom position to ensure it always fits
      const signatureHeight = 60; // Space needed for signature section
      const finalSignatureY = pageHeight - margin - signatureHeight;

      // Simple closing
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Kindly,', margin, finalSignatureY);

      // Load and add signature image if available
      let signatureImageLoaded = false;
      if (clinicianProfile?.signature_image_url) {
        try {
          console.log('🎨 Loading clinician signature for PDF...');
          const signatureBase64 = await loadImageAsBase64(clinicianProfile.signature_image_url);

          if (signatureBase64) {
            // Add signature image in bottom right corner
            // Signature dimensions: 40mm width, 20mm height
            const signatureWidth = 40;
            const signatureHeight = 20;
            const signatureX = pageWidth - margin - signatureWidth;
            const finalSignatureY_pos = finalSignatureY;

            pdf.addImage(signatureBase64, 'PNG', signatureX, finalSignatureY_pos, signatureWidth, signatureHeight);
            signatureImageLoaded = true;
          } else {
            console.warn('⚠️ Failed to load signature image, using cross symbol');
          }
        } catch (error) {
          console.error('❌ Error loading signature image:', error);
        }
      }

      // Add cross symbol if no signature image
      if (!signatureImageLoaded) {
        pdf.setFontSize(16);
        pdf.text('✚', pageWidth - margin - 30, finalSignatureY + 10);
        console.log('✚ Using cross symbol as signature placeholder');
      }

      // Doctor details - using real clinician information
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');

      const doctorName = clinicianProfile?.first_name && clinicianProfile?.last_name
        ? `Dr ${clinicianProfile.first_name} ${clinicianProfile.last_name}`
        : `Dr ${clinicianProfile?.first_name || 'Unknown'}`;

      const providerNumber = clinicianProfile?.license_number || 'Pending Registration';

      pdf.text(doctorName, margin, finalSignatureY + 30);
      pdf.text(`Provider Number: ${providerNumber}`, margin, finalSignatureY + 38);
      pdf.text('info@medicai.com.au', margin, finalSignatureY + 46);

      console.log('👨‍⚕️ Added clinician details to PDF:', { doctorName, providerNumber });

      // Generate blob for download/preview
      const pdfBlob = pdf.output('blob');

      // Update the signedPdfBlob state for preview
      setSignedPdfBlob(pdfBlob);

      console.log('📄 jsPDF generation complete, blob size:', pdfBlob.size);

      // Return the blob data in the expected format
      return {
        pdfBlob: pdfBlob,
        success: true,
        message: 'PDF generated successfully with jsPDF'
      };

    } catch (error) {
      console.error('📄 jsPDF generation failed:', error);
      throw error;
    }
  };

  // Create HTML template that matches PDFPreview styling exactly
  const createPDFHTML = () => {
    const currentDate = new Date().toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Medical Certificate - ${submission.patient_name}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm 15mm;
          }
          
          body {
            font-family: 'Affairs', "'Times New Roman', serif;
            line-height: 1.4;
            color: #000;
            font-size: 12pt;
            margin: 0;
            padding: 40px;
            background: white;
            max-width: 210mm;
            margin: 0 auto;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30pt;
            border-bottom: 2px solid hsl(61, 96%, 54%);
            padding-bottom: 15pt;
          }
          
          .logo {
            font-size: 24pt;
            font-weight: bold;
            color: hsl(59, 12%, 36%);
            margin-bottom: 5pt;
            letter-spacing: -0.5pt;
          }
          
          .tagline {
            font-size: 10pt;
            font-style: italic;
            color: hsl(59, 12%, 36%);
            opacity: 0.7;
            margin-bottom: 10pt;
          }
          
          .contact-info {
            text-align: right;
            font-size: 10pt;
            line-height: 1.3;
            flex: 1;
          }
          
          .contact-info .header-title {
            font-weight: bold;
            font-size: 12pt;
            margin-bottom: 3pt;
          }
          
          .contact-info .phone, .contact-info .email {
            font-weight: bold;
            color: hsl(59, 12%, 36%);
            margin-bottom: 2pt;
          }
          
          .document-title {
            text-align: center;
            font-size: 20pt;
            font-weight: bold;
            color: hsl(59, 12%, 36%);
            margin: 30pt 0;
            text-transform: uppercase;
            letter-spacing: 1pt;
          }
          
          .date-section {
            text-align: right;
            margin-bottom: 20pt;
            font-size: 11pt;
            font-weight: bold;
          }
          
          .patient-info {
            background: hsl(51, 44%, 84%);
            background: rgba(236, 231, 190, 0.3);
            border: 1px solid hsl(51, 44%, 84%);
            border-radius: 8px;
            padding: 20pt;
            margin: 20pt 0;
          }
          
          .patient-info h3 {
            color: hsl(59, 12%, 36%);
            margin-bottom: 10pt;
            font-size: 14pt;
          }
          
          .patient-detail {
            display: flex;
            margin-bottom: 8pt;
          }
          
          .patient-detail .label {
            font-weight: bold;
            width: 120pt;
            color: hsl(59, 12%, 36%);
          }
          
          .patient-detail .value {
            flex: 1;
            color: #1f2937;
          }
          
          .content-section {
            font-size: 12pt;
            line-height: 1.8;
            margin-bottom: 30pt;
            min-height: 200px;
            white-space: pre-wrap;
          }
          
          .signature-section {
            margin-top: 50pt;
            display: flex;
            justify-content: space-between;
          }
          
          .signature-area {
            width: 250pt;
          }
          
          .signature-line {
            border-top: 1px solid #000;
            width: 200pt;
            margin-bottom: 5pt;
            margin-top: 20pt;
          }
          
          .doctor-info .name {
            font-weight: bold;
            margin-bottom: 3pt;
            font-size: 11pt;
          }
          
          .doctor-info .details {
            color: #666;
            font-size: 10pt;
            margin-bottom: 2pt;
          }
          
          .footer {
            margin-top: 40pt;
            padding-top: 20pt;
            border-top: 1px solid hsl(51, 44%, 84%);
            font-size: 9pt;
            color: hsl(59, 12%, 36%);
            opacity: 0.6;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="flex: 1;">
            <div class="logo">MedicAI</div>
          </div>
          <div class="contact-info">
            <div class="header-title">MedicAI Telehealth Services</div>
            <div>Level 2, 123 Medical Centre Drive</div>
            <div>Melbourne VIC 3000</div>
            <div>Australia</div>
            <div class="phone">Phone: 1300 AI FORMS</div>
            <div class="email">Email: info@medicaiforms.com</div>
          </div>
        </div>
        
        <div class="document-title">Medical Certificate</div>
        
        <div class="date-section">
          Date: ${currentDate}
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <div class="patient-detail">
            <div class="label">Full Name:</div>
            <div class="value">${submission.patient_name || 'N/A'}</div>
          </div>
          <div class="patient-detail">
            <div class="label">Date of Birth:</div>
            <div class="value">${submission.form_data?.dateOfBirth ?
        new Date(submission.form_data?.dateOfBirth as string).toLocaleDateString('en-AU') : 'N/A'}</div>
          </div>
          <div class="patient-detail">
            <div class="label">Medical Condition:</div>
            <div class="value">${submission.form_data?.complaint || submission.form_data?.condition || 'As per clinical assessment'}</div>
          </div>
          ${editableDocData.fromDate && editableDocData.toDate ? `
          <div class="patient-detail">
            <div class="label">Period of Incapacity:</div>
            <div class="value">${new Date(editableDocData.fromDate).toLocaleDateString('en-AU')} to ${new Date(editableDocData.toDate).toLocaleDateString('en-AU')}</div>
          </div>` : editableDocData.fromDate ? `
          <div class="patient-detail">
            <div class="label">Effective Date:</div>
            <div class="value">${new Date(editableDocData.fromDate).toLocaleDateString('en-AU')}</div>
          </div>` : ''}
        </div>
        
        <div class="content-section">${editableDocData.editedContent || `TO WHOM IT MAY CONCERN:

I hereby certify that ${submission.patient_name || '[Patient Name]'} attended my medical practice for consultation and clinical assessment.

Following comprehensive medical evaluation, I confirm that this patient has a medical condition that renders them unfit for work/study activities for the period specified above.

This medical certificate is issued in accordance with Australian medical standards and professional guidelines. The patient should be excused from work/study commitments during the certified period to allow for appropriate recovery.

Should you require any additional medical information or clarification regarding this certificate, please contact our practice using the details provided above.`}</div>
        
        <div class="signature-section">
          <div class="signature-area">
            <p style="margin-bottom: 20pt; font-weight: bold;">Kindly,</p>
            <div class="signature-line"></div>
            <div class="doctor-info">
              <div class="name">Dr Anna Braun M.D</div>
              <div class="details">Provider Number: 123456X</div>
              <div class="details">MedicAI Clinician</div>
              <div class="details">info@medicai.com.au</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <p>Certificate ID: MEDIC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
          <p><strong>This is a legally valid medical certificate issued by a registered Australian healthcare practitioner.</strong></p>
        </div>
      </body>
      </html>
    `;
  };

  const handleGeneratePDF = async () => {
    try {
      // Use jsPDF directly for PDF generation
      const result = await generateHTMLtoPDF('', submission.patient_email);

      // Save PDF to storage and update submission if a blob was returned
      if (result && result.pdfBlob instanceof Blob) {
        const safePatientName = (submission.patient_name || 'MedicAI_Certificate')
          .toString()
          .replace(/[^a-zA-Z0-9_-]+/g, '_')
          .slice(0, 60);
        const timestamp = Date.now();
        const fileName = `${safePatientName}_${timestamp}.pdf`;

        // Delete previous PDF if it exists
        if (submission.pdf_file_path) {
          console.log('🗑️ Removing previous PDF:', submission.pdf_file_path);
          const { error: deleteError } = await supabase.storage
            .from('documents')
            .remove([submission.pdf_file_path]);

          if (deleteError) {
            console.warn('⚠️ Failed to delete previous PDF:', deleteError);
          } else {
            console.log('✅ Previous PDF deleted successfully');
          }
        }

        console.log('📤 Starting PDF upload to documents bucket:', {
          fileName,
          blobSize: result.pdfBlob.size,
          blobType: result.pdfBlob.type
        });

        // Check file size and warn if too large
        const maxSize = 6 * 1024 * 1024; // 6MB limit for Supabase
        if (result.pdfBlob.size > maxSize) {
          console.warn('⚠️ PDF size exceeds 6MB limit:', {
            actualSize: result.pdfBlob.size,
            maxSize,
            sizeMB: (result.pdfBlob.size / 1024 / 1024).toFixed(2)
          });
          toast.error(`PDF file is too large (${(result.pdfBlob.size / 1024 / 1024).toFixed(1)}MB). Maximum allowed is 6MB.`);
          return;
        }

        // Compress PDF if needed
        const compressedBlob = await compressPDFBlob(result.pdfBlob);
        console.log('📦 PDF compression result:', {
          originalSize: result.pdfBlob.size,
          compressedSize: compressedBlob.size,
          compressionRatio: ((result.pdfBlob.size - compressedBlob.size) / result.pdfBlob.size * 100).toFixed(1) + '%'
        });

        // Upload new PDF to documents storage bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, compressedBlob, {
            contentType: 'application/pdf',
            upsert: false
          });

        console.log("AFTER THE UPLOADING")

        if (uploadError) {
          console.error('📤 Storage upload error:', uploadError);
          console.error('📤 Upload error details:', {
            message: uploadError.message,
            statusCode: uploadError.statusCode,
            fileName,
            bucketName: 'documents'
          });

          // Check if bucket exists
          if (uploadError.message.includes('bucket') || uploadError.message.includes('not found')) {
            toast.error('Documents bucket does not exist. Please create it in Supabase Storage.');
          } else if (uploadError.message.includes('policy')) {
            toast.error('Storage policy issue. Check bucket permissions.');
          } else {
            toast.error(`Upload failed: ${uploadError.message}`);
          }
          throw uploadError;
        }

        console.log('📤 PDF uploaded successfully:', uploadData);

        // Update submission with new PDF file path
        const pdfUrl = `https://fhojgszdqgvoutsjmqkc.supabase.co/storage/v1/object/public/documents/${uploadData.path}`;
        console.log('📝 Attempting to update submission:', {
          submissionId: submission.id,
          pdfFilePath: uploadData.path,
          pdfUrl: pdfUrl
        });

        console.log("SUBMISSION ID BEFORE: ", submission.id);
        console.log("ORIGINAL SUBMISSION USER_ID:", submission.user_id);

        const { data: updateData, error: updateError } = await supabase
          .from('medicaiforms')
          .update({
            pdf_file_path: uploadData.path,
            pdf_url: pdfUrl
          })
          .eq('id', submission.id)
          .select();

        console.log("SUBMISSION ID AFTER: ", submission.id);

        console.log("UPDATE DATA: ", updateData);
        console.log("UPDATE ERROR: ", updateError);


        if (updateError) {
          console.error('📝 Submission update error:', updateError);
          console.error('📝 Error details:', {
            message: updateError.message,
            details: updateError.details,
            hint: updateError.hint,
            code: updateError.code
          });

          if (updateError.message.includes('column') && updateError.message.includes('does not exist')) {
            toast.error("Database schema needs to be updated. Please apply the migration script first.");
            console.error('💡 SOLUTION: Run the migration script in Supabase to add pdf_file_path and pdf_url columns');
          } else {
            throw updateError;
          }
        } else {
          console.log('📝 Submission updated with new PDF link:', updateData);

          // Check if user_id was corrupted during update
          if (updateData && updateData[0] && updateData[0].user_id !== submission.user_id) {
            console.warn('⚠️ USER_ID CORRUPTION DETECTED:', {
              originalUserId: submission.user_id,
              updatedUserId: updateData[0].user_id,
              submissionId: submission.id
            });

            // Attempt to fix the user_id if it got corrupted
            if (submission.user_id && submission.user_id !== '00000000-0000-0000-0000-000000000000') {
              console.log('🔧 Attempting to restore correct user_id...');
              const { error: fixError } = await supabase
                .from('medicaiforms')
                .update({ user_id: submission.user_id })
                .eq('id', submission.id);

              if (fixError) {
                console.error('❌ Failed to restore user_id:', fixError);
              } else {
                console.log('✅ User_id restored successfully');
              }
            }
          }

          setIsPdfOutdated(false); // Reset outdated flag since new PDF is generated
        }

        // Trigger browser download
        const url = URL.createObjectURL(result.pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${safePatientName}_${new Date().toISOString().slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success("PDF generated, saved to storage, and download started");
        onUpdate(); // Refresh the submission data
      } else {
        console.warn('⚠️ No PDF blob returned from generateHTMLtoPDF');
      }

    } catch (error) {
      console.error('📄 jsPDF generation failed:', error);
      toast.error("Failed to generate PDF");
    }
  };

  const generateSignedPDF = async (signature: string) => {
    try {
      console.log('Generating signed PDF...');
      // Clear any existing PDF blob to prevent duplicates
      setSignedPdfBlob(null);

      // Create fresh PDF instance
      const { default: jsPDF } = await import('jspdf');
      const pdf = new jsPDF('p', 'mm', 'a4');


      // Page setup
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const backgroundMargin = 21.17; // 60px converted to mm (60px * 0.3528mm/px)

      // =================================================================
      // FULL PAGE BACKGROUND with margin
      // =================================================================

      // Set light background color for the entire page with margin
      pdf.setFillColor(248, 248, 248); // Very light gray background
      pdf.rect(backgroundMargin, backgroundMargin, pageWidth - 2 * backgroundMargin, pageHeight - 2 * backgroundMargin, 'F'); // Fill page with margin

      // =================================================================
      // HEADER SECTION - Simple letterhead style like referral template
      // =================================================================

      // Main MedicAI logo - larger and positioned like referral template
      pdf.setFontSize(28);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0); // Black text
      pdf.text('MedicAI', margin, 35);

      // Contact info in top right corner - compact layout
      const contactX = pageWidth - margin - 80;
      pdf.setFontSize(9);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('ABN: 20 687 490 277', contactX, 25);
      pdf.text('21 Campbell St STSTSTSTSTSTS', contactX, 30);
      pdf.text('Surry Hills NSW 2010, Australia', contactX, 35);
      pdf.text('1300 AI FORM (1300 243 676)', contactX, 40);
      pdf.text('info@medicai.com.au', contactX, 45);

      // =================================================================
      // DATE SECTION - Simple right-aligned like referral template
      // =================================================================

      const currentDate = new Date().toLocaleDateString('en-AU', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Date: ${currentDate}`, pageWidth - margin - 45, 60);

      // =================================================================
      // PATIENT INFORMATION - Simple format like referral template
      // =================================================================

      let currentY = 75;
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);

      // Regarding section
      pdf.text(`Regarding: ${submission.patient_name || '{patientName}'}`, margin, currentY);
      currentY += 6;

      const patientDob = submission.form_data?.dateOfBirth ?
        new Date(submission.form_data.dateOfBirth as string).toLocaleDateString('en-AU') : '{dobDay/Month/Year}';
      pdf.text(`${patientDob}`, margin, currentY);
      currentY += 6;

      pdf.text('{patientAddress}', margin, currentY);
      currentY += 6;
      pdf.text('{patientPhone}', margin, currentY);
      currentY += 6;
      pdf.text(`${submission.patient_email || '{patientEmail}'}`, margin, currentY);
      currentY += 20;

      // =================================================================
      // DOCUMENT CONTENT - Simple format like referral template
      // =================================================================

      let contentY = currentY;

      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);

      // Simple greeting
      // Simple greeting with real clinician information
      const greeting = clinicianProfile?.first_name
        ? `Dear ${clinicianProfile.first_name}'s employer,`
        : 'Dear employer,';

      pdf.text(greeting, margin, contentY);
      contentY += 20;

      // Main content paragraph - use the same text as HTML template
      const mainContent = editableDocData.editedContent || `TO WHOM IT MAY CONCERN:

I hereby certify that ${submission.patient_name || '[Patient Name]'} attended my medical practice for consultation and clinical assessment.

Following comprehensive medical evaluation, I confirm that this patient has a medical condition that renders them unfit for work/study activities for the period specified above.

This medical certificate is issued in accordance with Australian medical standards and professional guidelines. The patient should be excused from work/study commitments during the certified period to allow for appropriate recovery.

Should you require any additional medical information or clarification regarding this certificate, please contact our practice using the details provided above.`;

      const lines = pdf.splitTextToSize(mainContent, pageWidth - 2 * margin);
      pdf.text(lines, margin, contentY);

      // =================================================================
      // SIGNATURE SECTION - Fixed at bottom of page
      // =================================================================
      const signatureHeight = 60; // Space needed for signature section
      const finalSignatureY = pageHeight - margin - signatureHeight;

      // Simple closing
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.setTextColor(0, 0, 0);
      pdf.text('Kindly,', margin, finalSignatureY);

      // Add signature space with cross symbol
      pdf.setFontSize(16);
      pdf.text('✚', pageWidth - margin - 30, finalSignatureY + 20);

      // Doctor details - simple format
      pdf.setFontSize(11);
      setOptimalFont(pdf, 'normal');
      pdf.text('Doctor {doctor name}', margin, finalSignatureY + 50);
      pdf.text('Provider Number: {number}', margin, finalSignatureY + 58);
      pdf.text('info@medicai.com.au', margin, finalSignatureY + 66);

      // No footer section needed to match referral template simplicity

      console.log('🔧 All content added to PDF, waiting for rendering...');

      // =================================================================
      // CRITICAL: Wait for PDF rendering to complete before blob creation
      // =================================================================

      // Add delay to ensure all content is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('🔧 Rendering delay completed, creating blob...');

      // Create blob with additional async handling
      const pdfBlob = await new Promise<Blob>((resolve, reject) => {
        try {
          // Use setTimeout to ensure blob creation happens after render cycle
          setTimeout(() => {
            try {
              const blob = pdf.output('blob');
              console.log('🔧 Blob created successfully:', {
                size: blob.size,
                type: blob.type
              });
              resolve(blob);
            } catch (blobError) {
              console.error('🔧 Blob creation failed:', blobError);
              reject(blobError);
            }
          }, 100);
        } catch (error) {
          reject(error);
        }
      });

      // =================================================================
      // GENERATE AND VALIDATE PDF BLOB
      // =================================================================

      console.log('🔧 Generated PDF blob with delay:', {
        size: pdfBlob.size,
        type: pdfBlob.type,
        isValid: pdfBlob.size > 0,
        constructor: pdfBlob.constructor.name
      });

      // Additional validation - try to read the blob
      try {
        const arrayBuffer = await pdfBlob.arrayBuffer();
        console.log('🔧 PDF ArrayBuffer:', {
          byteLength: arrayBuffer.byteLength,
          firstBytes: new Uint8Array(arrayBuffer.slice(0, 10))
        });

        // Check if it starts with PDF header
        const pdfHeader = new TextDecoder().decode(new Uint8Array(arrayBuffer.slice(0, 4)));
        console.log('🔧 PDF Header check:', { header: pdfHeader, isPDF: pdfHeader === '%PDF' });

        if (pdfHeader !== '%PDF') {
          throw new Error('Generated blob is not a valid PDF - missing PDF header');
        }
      } catch (validationError) {
        console.error('🔧 PDF validation failed:', validationError);
        toast.error("PDF validation failed - corrupted file");
        return;
      }

      // Validate and set blob
      if (pdfBlob && pdfBlob.size > 0) {
        setSignedPdfBlob(pdfBlob);
        console.log('🔧 signedPdfBlob state set successfully with delay, size:', pdfBlob.size);
        setDocumentSaved(true);
        toast.success("PDF generated successfully with proper timing! Ready to email.");
      } else {
        console.error('🔧 Generated PDF blob is empty or invalid after delay');
        toast.error("Failed to generate PDF - empty file after delay");
      }

    } catch (error) {
      console.error('🔧 PDF generation error with delay handling:', error);
      toast.error('Failed to generate PDF with delay. Please try again.');
      setSignedPdfBlob(null);
    }
  };

  const handleApproveAndSend = async () => {
    try {
      // Prepare referral data for the edge function
      const referralData = {
        submissionId: submission.id,
        patientName: submission.patient_name,
        patientEmail: submission.patient_email,
        patientPhone: submission.patient_phone,
        formData: submission.form_data,
        clinicianName: "Dr Anna Braun",
        clinicName: "MedicAI Practice"
      }

      const response = await fetch('https://fhojgszdqgvoutsjmqkc.supabase.co/functions/v1/referral-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(referralData)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`HTTP ${response.status}: ${error}`)
      }

      const result = await response.json();
      console.log('Referral sent successfully:', result);

      toast.success("Referral approved and sent to patient successfully!");
      onUpdate();

    } catch (error) {
      console.error('Error approving and sending:', error);
      toast.error(error instanceof Error ? error.message : "Failed to approve and send referral");
    }
  }

  const handleCompressPDFAndEmail = async () => {
    const success = await generateAndSendDocument(submission.id)
    if (success) {
      onUpdate()
    }
  }

  const handleApproveDocument = async () => {
    setIsApproving(true);
    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      // In development with mock auth, we need to handle RLS differently
      // For production, ensure proper RLS policies are in place
      const { error } = await supabase
        .from('medicaiforms')
        .update({
          approved_by_clinician: true,
          approved_by_email: user.email,
          approved_at: new Date().toISOString(),
          document_status: 'approved',
          payment_status: 'paid',
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Document approved successfully!');
      setShowApprovalDialog(false);
      onUpdate();
    } catch (error) {
      console.error('Error approving document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('row-level security') || errorMessage.includes('42501')) {
        toast.error('Permission denied: Ensure RLS policies allow clinician updates. Check console for details.');
        console.error('RLS Policy Issue: The user may not have proper clinician role in Supabase. Consider running RLS fix SQL.');
      } else {
        toast.error(`Failed to approve document: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectDocument = async () => {
    setIsApproving(true);
    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const { error } = await supabase
        .from('medicaiforms')
        .update({
          approved_by_clinician: false,
          approved_by_email: user.email,
          approved_at: new Date().toISOString(),
          document_status: 'needs_revision'
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Document rejected and marked for revision');
      onUpdate();
    } catch (error) {
      console.error('Error rejecting document:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('row-level security') || errorMessage.includes('42501')) {
        toast.error('Permission denied: Ensure RLS policies allow clinician updates. Check console for details.');
        console.error('RLS Policy Issue: The user may not have proper clinician role in Supabase. Consider running RLS fix SQL.');
      } else {
        toast.error(`Failed to reject document: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  const handleRevertApproval = async () => {
    setIsApproving(true);
    try {
      if (!user?.email) {
        throw new Error('User email not found');
      }

      const { error } = await supabase
        .from('medicaiforms')
        .update({
          approved_by_clinician: false,
          approved_by_email: null,
          approved_at: null,
          document_status: 'pending'
        })
        .eq('id', submission.id);

      if (error) throw error;

      toast.success('Document approval reverted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error reverting approval:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      if (errorMessage.includes('row-level security') || errorMessage.includes('42501')) {
        toast.error('Permission denied: Ensure RLS policies allow clinician updates. Check console for details.');
        console.error('RLS Policy Issue: The user may not have proper clinician role in Supabase. Consider running RLS fix SQL.');
      } else {
        toast.error(`Failed to revert approval: ${errorMessage}`);
      }
    } finally {
      setIsApproving(false);
    }
  };

  // Generate document content based on form type
  function generateDocumentContent(submission: ClinicianSubmission): string {
    const formData = submission.form_data as Record<string, string | string[] | number | boolean | null> || {}

    if (submission.form_type === 'Medical Certificate') {
      return `TO WHOM IT MAY CONCERN:

I hereby certify that ${submission.patient_name || '[Patient Name]'} attended my medical practice for consultation and clinical assessment.

Following comprehensive medical evaluation, I confirm that this patient has a medical condition that renders them unfit for work/study activities for the period specified above.

This medical certificate is issued in accordance with Australian medical standards and professional guidelines. The patient should be excused from work/study commitments during the certified period to allow for appropriate recovery.

Should you require any additional medical information or clarification regarding this certificate, please contact our practice using the details provided above.`
    }

    if (submission.form_type === 'Dermatology Referral') {
      const concern = formData.concern || formData.mainConcern || 'Dermatological assessment'
      const duration = formData.duration || 'Recent onset'
      const symptoms = formData.symptoms || []
      const previousTreatments = formData.previousTreatments || []

      return `REFERRAL TO DERMATOLOGIST

Dear Colleague,

I am referring ${submission.patient_name || '[Patient Name]'} for dermatological assessment and management.

Chief Complaint: ${concern}
Duration: ${duration}
${Array.isArray(symptoms) && symptoms.length > 0 ? `Symptoms: ${symptoms.join(', ')}` : ''}
${Array.isArray(previousTreatments) && previousTreatments.length > 0 ? `Previous Treatments: ${previousTreatments.join(', ')}` : ''}`
    }

    return `Clinical Assessment and Recommendations

Patient: ${submission.patient_name || '[Patient Name]'}
Date of Assessment: ${new Date().toLocaleDateString('en-AU')}

Following clinical evaluation, please find my assessment and recommendations as requested.`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Pending Review</Badge>
      case 'approved':
        return <Badge variant="default" className="gap-1 bg-green-100 text-green-800"><Check className="h-3 w-3" />Approved</Badge>
      case 'needs_revision':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Needs Revision</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Section - Controls and Information */}
      <div className="space-y-6">
        {/* Submission Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  {submission.form_type || 'Medical Document'}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : 'Unknown date'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(submission.document_status || 'pending')}
                <SubmissionTimer submittedAt={submission.submitted_at} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Patient Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Patient</p>
                  <p className="font-medium">{submission.patient_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium text-sm">{submission.patient_email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{submission.patient_phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">DOB</p>
                  <p className="font-medium">
                    {submission.form_data?.dateOfBirth ?
                      new Date(submission.form_data.dateOfBirth as string).toLocaleDateString() :
                      'Not provided'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Form-specific Information */}
            {submission.form_data && (
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Form Details
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(submission.form_data as Record<string, string | string[] | number | boolean | null>).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-xs text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </p>
                        <p className="text-sm">
                          {Array.isArray(value) ? value.join(', ') : String(value)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Document Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Document Content</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDocumentEditing(!isDocumentEditing)}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                {isDocumentEditing ? 'Preview' : 'Edit Content'}
              </Button>
            </div>

            {isDocumentEditing && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="patientName">Patient Name</Label>
                    <Input
                      id="patientName"
                      placeholder="Enter patient full name"
                      value={editableDocData.patientName}
                      onChange={(e) => {
                        setEditableDocData(prev => ({ ...prev, patientName: e.target.value }))
                        setIsPdfOutdated(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="patientDOB">Date of Birth</Label>
                    <Input
                      id="patientDOB"
                      type="date"
                      value={editableDocData.patientDOB}
                      onChange={(e) => {
                        setEditableDocData(prev => ({ ...prev, patientDOB: e.target.value }))
                        setIsPdfOutdated(true)
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="complaint">Medical Condition/Complaint</Label>
                    <Input
                      id="complaint"
                      placeholder="Enter medical condition or complaint"
                      value={editableDocData.complaint}
                      onChange={(e) => {
                        setEditableDocData(prev => ({ ...prev, complaint: e.target.value }))
                        setIsPdfOutdated(true)
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fromDate">
                        {submission.form_type === 'Medical Certificate' ? 'Start Date (Medical Leave)' : 'From Date'}
                      </Label>
                      <Input
                        id="fromDate"
                        type="date"
                        value={editableDocData.fromDate}
                        onChange={(e) => {
                          setEditableDocData(prev => ({ ...prev, fromDate: e.target.value }))
                          setIsPdfOutdated(true)
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="toDate">
                        {submission.form_type === 'Medical Certificate' ? 'End Date (Medical Leave)' : 'To Date'}
                      </Label>
                      <Input
                        id="toDate"
                        type="date"
                        value={editableDocData.toDate}
                        onChange={(e) => {
                          setEditableDocData(prev => ({ ...prev, toDate: e.target.value }))
                          setIsPdfOutdated(true)
                        }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="documentContent">Document Content</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          // Show loading state
                          const button = document.querySelector('[data-ai-generate]') as HTMLButtonElement;
                          if (button) {
                            button.disabled = true;
                            button.textContent = 'Generating...';
                          }

                          // Prepare data for AI generation
                          const currentDate = new Date().toLocaleDateString('en-AU', { 
                            day: '2-digit', 
                            month: '2-digit', 
                            year: 'numeric' 
                          });
                          
                          const aiPrompt = `Generate a complete medical document with the following EXACT format:

Patient: ${editableDocData.patientName || submission.patient_name || 'Patient Name'}
Date of Assessment: ${currentDate}

Following clinical evaluation, please find my assessment and recommendations as requested.

[Then add the main medical content here - maximum 5 lines of professional medical assessment]

Patient Details for Context:
- Medical Condition: ${editableDocData.complaint || submission.form_data?.complaint || submission.form_data?.condition || 'Medical assessment required'}
- Date Range: ${editableDocData.fromDate && editableDocData.toDate ? `${editableDocData.fromDate} to ${editableDocData.toDate}` : 'As clinically appropriate'}

Requirements:
- Use EXACTLY the header format shown above
- Follow with the assessment introduction line exactly as shown
- Then add 5 lines maximum of professional medical content
- Professional medical language following Australian standards
- Suitable for ${submission.form_type === 'Medical Certificate' ? 'employers and institutions' : 'medical referral purposes'}

Generate the complete document with the exact header format and content.`;

                          // Call OpenAI API directly
                          const response = await fetch('https://api.openai.com/v1/chat/completions', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
                            },
                            body: JSON.stringify({
                              model: 'gpt-4',
                              messages: [
                                {
                                  role: 'system',
                                  content: 'You are an experienced Australian medical practitioner writing professional medical documents. Generate clear, professional content that follows Australian medical standards.'
                                },
                                {
                                  role: 'user',
                                  content: aiPrompt
                                }
                              ],
                              max_tokens: 800,
                              temperature: 0.3
                            })
                          });

                          if (!response.ok) {
                            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                          }

                          const data = await response.json();
                          
                          if (data.choices && data.choices[0] && data.choices[0].message) {
                            const generatedContent = data.choices[0].message.content;
                            setEditableDocData(prev => ({ ...prev, editedContent: generatedContent }));
                            setIsPdfOutdated(true);
                            toast.success("AI-generated content added successfully!");
                          } else {
                            throw new Error('No content generated');
                          }
                        } catch (error) {
                          console.error('Error generating AI content:', error);
                          toast.error("Failed to generate AI content. Please try again.");
                        } finally {
                          // Reset button state
                          const button = document.querySelector('[data-ai-generate]') as HTMLButtonElement;
                          if (button) {
                            button.disabled = false;
                            button.textContent = '🤖 Generate with AI';
                          }
                        }
                      }}
                      className="flex items-center gap-2 text-xs"
                      data-ai-generate
                    >
                      🤖 Generate with AI
                    </Button>
                  </div>
                  <Textarea
                    id="documentContent"
                    placeholder="Enter document content or use AI generation..."
                    value={editableDocData.editedContent}
                    onChange={(e) => {
                      setEditableDocData(prev => ({ ...prev, editedContent: e.target.value }))
                      setIsPdfOutdated(true)
                    }}
                    rows={8}
                    className="min-h-[200px]"
                  />
                </div>
                <Button
                  onClick={async () => {
                    try {
                      // Save document data to database
                      const { error } = await supabase
                        .from('medicaiforms')
                        .update({
                          patient_name: editableDocData.patientName || submission.patient_name,
                          start_date: editableDocData.fromDate || null,
                          end_date: editableDocData.toDate || null,
                          document_content: editableDocData.editedContent
                        })
                        .eq('id', submission.id);

                      if (error) {
                        console.error('Error saving document data:', error);
                        if (error.message.includes('column') && error.message.includes('does not exist')) {
                          toast.error("Database needs to be updated. Please apply the migration scripts first.");
                        } else {
                          toast.error("Failed to save document data: " + error.message);
                        }
                        return;
                      }

                      setDocumentSaved(true)
                      setIsDocumentEditing(false)
                      toast.success("Document content saved to database!")
                      onUpdate(); // Refresh the submission data
                    } catch (error) {
                      console.error('Error saving document data:', error);
                      toast.error("Failed to save document data");
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            )}

            {/* Document Saved Indicator */}
            {documentSaved && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Check className="h-4 w-4" />
                All changes saved successfully!
              </div>
            )}

            {/* Approval Status */}
            {submission.approved_by_clinician && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                <Check className="h-4 w-4" />
                <div>
                  <span className="font-medium">Approved by {submission.approved_by_email}</span>
                  {submission.approved_at && (
                    <div className="text-sm">
                      {new Date(submission.approved_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Diagnostic Assistant */}
        <AIDiagnosticPanel submission={submission} />

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Document Approval */}
            {!submission.approved_by_clinician ? (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowApprovalDialog(true)}
                  disabled={isApproving}
                  className="w-full flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  <Check className="h-4 w-4" />
                  {isApproving ? "Processing..." : "Approve Document"}
                </Button>
                <Button
                  onClick={handleRejectDocument}
                  disabled={isApproving}
                  variant="destructive"
                  className="w-full flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Reject Document
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">Document Approved</span>
                </div>
                <Button
                  onClick={handleRevertApproval}
                  disabled={isApproving}
                  variant="outline"
                  className="w-full flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
                >
                  <AlertCircle className="h-4 w-4" />
                  {isApproving ? "Processing..." : "Revert Approval"}
                </Button>
              </div>
            )}

            <Separator />

            <Button
              onClick={() => {
                handleGeneratePDF();
              }}
              className="w-full flex items-center gap-2 bg-primary text-primary-foreground"
            >
              <FileText className="h-4 w-4" />
              Generate PDF
            </Button>

            {/* PDF Generated State */}
            {signedPdfBlob && !isPdfOutdated && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">PDF Generated Successfully</span>
                  <span className="text-sm text-muted-foreground">
                    ({(signedPdfBlob.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const safePatientName = (submission.patient_name || 'MedicAI_Certificate')
                        .toString()
                        .replace(/[^a-zA-Z0-9_-]+/g, '_')
                        .slice(0, 60);
                      const fileName = `${safePatientName}_${new Date().toISOString().slice(0, 10)}.pdf`;

                      const url = URL.createObjectURL(signedPdfBlob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = fileName;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                      URL.revokeObjectURL(url);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      console.log('Continue to Email clicked, checking blob:', !!signedPdfBlob, signedPdfBlob?.size);
                      handleEmailConfirmation();
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Continue to Email
                  </Button>
                </div>
              </div>
            )}

            {/* Show outdated PDF warning */}
            {signedPdfBlob && isPdfOutdated && (
              <div className="border-t pt-4">
                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Document data has changed. Please generate a new PDF.</span>
                </div>
              </div>
            )}

            {/* Existing PDF Download Button */}
            {!signedPdfBlob && submission.pdf_url && submission.pdf_file_path && (
              <div className="border-t pt-4 space-y-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <Check className="h-5 w-5" />
                  <span className="font-medium">PDF Available</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      const safePatientName = (submission.patient_name || 'MedicAI_Certificate')
                        .toString()
                        .replace(/[^a-zA-Z0-9_-]+/g, '_')
                        .slice(0, 60);
                      const fileName = `${safePatientName}_${new Date().toISOString().slice(0, 10)}.pdf`;

                      const link = document.createElement('a');
                      link.href = submission.pdf_url;
                      link.download = fileName;
                      // Remove target="_blank" to prevent page redirect
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                  <Button
                    onClick={() => {
                      // Create a blob from the existing PDF URL for email functionality
                      fetch(submission.pdf_url)
                        .then(response => response.blob())
                        .then(blob => {
                          setSignedPdfBlob(blob);
                          handleEmailConfirmation();
                        })
                        .catch(error => {
                          console.error('Error fetching PDF for email:', error);
                          toast.error('Failed to prepare PDF for email');
                        });
                    }}
                    className="flex-1 flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Continue to Email
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Clinician Notes */}
        <ClinicianNotes
          submissionId={submission.id}
          existingNotes=""
          onNotesUpdate={onUpdate}
        />

        {/* Video Calling */}
        <CoviuCalling
          patientName={submission.patient_name}
          patientPhone={submission.patient_phone}
          submissionId={submission.id.toString()}
        />
      </div>

      {/* Right Section - Document Preview */}
      <div className="space-y-6">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Document Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="h-full">
              <PDFPreviewExact
                submission={submission}
                editedContent={editableDocData.editedContent}
                clinicianProfile={clinicianProfile}
                editableDocData={editableDocData}
              />
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Email Confirmation Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send PDF via Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Primary Email</label>
              <Input
                type="email"
                value={emailToSend}
                onChange={(e) => setEmailToSend(e.target.value)}
                placeholder="patient@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Additional Recipients (comma-separated)</label>
              <Input
                type="email"
                value={additionalEmails}
                onChange={(e) => setAdditionalEmails(e.target.value)}
                placeholder="doctor@clinic.com, family@example.com"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  console.log('Send Email button clicked');
                  sendEmailToRecipients();
                }}
                className="flex-1"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </Button>
              <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Confirmation Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={4}
                className="mt-1"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              This action will:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Mark the document as approved</li>
                <li>Record your email as the approving clinician</li>
                <li>Trigger automatic PDF delivery to the patient</li>
                <li>Update the submission status</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleApproveDocument}
                disabled={isApproving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <Check className="h-4 w-4 mr-2" />
                {isApproving ? "Processing..." : "Confirm Approval"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowApprovalDialog(false)}
                disabled={isApproving}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
