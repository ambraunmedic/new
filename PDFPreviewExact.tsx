import React from 'react';
import { ClinicianSubmission } from "@/hooks/useClinicianSubmissions";
import medicaiLogoUrl from "@/assets/medicai_logo.png";
import { SignatureDisplay } from "./SignatureDisplay";

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

interface EditableDocData {
  patientName: string;
  patientDOB: string;
  complaint: string;
  fromDate: string;
  toDate: string;
  clinicianName: string;
  clinicName: string;
  editedContent: string;
}

interface PDFPreviewExactProps {
  submission: ClinicianSubmission;
  editedContent?: string;
  clinicianProfile?: ClinicianProfile | null;
  editableDocData?: EditableDocData;
}

export const PDFPreviewExact: React.FC<PDFPreviewExactProps> = ({
  submission,
  editedContent,
  clinicianProfile,
  editableDocData
}) => {
  const currentDate = new Date().toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  let defaultContent = editedContent || editableDocData?.editedContent || `TO WHOM IT MAY CONCERN:

I hereby certify that ${submission.patient_name || '[Patient Name]'} attended my medical practice for consultation and clinical assessment.

Following comprehensive medical evaluation, I confirm that this patient has a medical condition that renders them unfit for work/study activities for the period specified above.

This medical certificate is issued in accordance with Australian medical standards and professional guidelines. The patient should be excused from work/study commitments during the certified period to allow for appropriate recovery.

Should you require any additional medical information or clarification regarding this certificate, please contact our practice using the details provided above.`;

  // Add date range information if available from editableDocData
  if (editableDocData?.fromDate && editableDocData?.toDate) {
    const startDate = new Date(editableDocData.fromDate).toLocaleDateString('en-AU');
    const endDate = new Date(editableDocData.toDate).toLocaleDateString('en-AU');
    const dateRangeText = `

PERIOD OF MEDICAL LEAVE: ${startDate} to ${endDate}

The patient is certified as medically unfit for work/study during the above-mentioned period.`;
    defaultContent = defaultContent + dateRangeText;
  } else if (editableDocData?.fromDate) {
    const startDate = new Date(editableDocData.fromDate).toLocaleDateString('en-AU');
    const singleDateText = `

EFFECTIVE DATE: ${startDate}

This certification is effective from the above date.`;
    defaultContent = defaultContent + singleDateText;
  }

  const patientDob = submission.form_data?.dateOfBirth || submission.form_data?.patientDOB;
  const formattedDob = patientDob ? new Date(patientDob as string).toLocaleDateString('en-AU') : '{dobDay/Month/Year}';

  const greeting = clinicianProfile?.first_name
    ? `Dear ${clinicianProfile.first_name}'s employer,`
    : 'Dear employer,';

  const doctorName = clinicianProfile?.first_name && clinicianProfile?.last_name
    ? `Dr ${clinicianProfile.first_name} ${clinicianProfile.last_name}`
    : `Dr ${clinicianProfile?.first_name || 'Unknown'}`;

  const providerNumber = clinicianProfile?.license_number || 'Pending Registration';

  return (
    <div className="border rounded-lg bg-white shadow-sm">
      <div className="bg-blue-50 border-b p-3">
        <h4 className="font-semibold text-blue-900">PDF Preview - Exact Match</h4>
        <p className="text-sm text-blue-600">
          This preview matches the generated PDF exactly
        </p>
      </div>

      <div className="p-4 overflow-y-auto max-h-[800px]">
        {/* A4 Page Container - matches jsPDF dimensions exactly */}
        <div style={{
          width: '210mm',
          height: '297mm', // Fixed height to prevent overflow
          margin: '0 auto',
          position: 'relative',
          backgroundColor: 'rgb(248, 241, 238)', // Brand light background color (293, 241, 238)
          padding: '10mm', // backgroundMargin from PDF
          fontFamily: 'Times, "Times New Roman", serif', // Same as setOptimalFont
          fontSize: '11pt', // Base font size from PDF
          lineHeight: '1.4',
          color: '#000000',
          overflow: 'hidden' // Prevent any content overflow
        }}>
          {/* Inner content area - matches PDF margin */}
          <div style={{
            backgroundColor: 'transparent',
            padding: '20mm', // margin from PDF
            height: 'calc(297mm - 20mm)', // Fixed height to match PDF
            position: 'relative',
            display: 'flex',
            flexDirection: 'column'
          }}>

            {/* HEADER SECTION */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '5pt'
            }}>
              {/* MedicAI Logo */}
              <div>
                <img
                  src={medicaiLogoUrl}
                  alt="MedicAI Logo"
                  style={{
                    width: '50mm', // Same as PDF: 50mm width
                    height: '13mm', // Same as PDF: 13mm height
                    objectFit: 'contain'
                  }}
                />
              </div>

              {/* Contact Info - matches PDF positioning */}
              <div style={{
                textAlign: 'right',
                fontSize: '9pt', // Same as PDF
                lineHeight: '1.3',
                width: '80mm' // Same as PDF contactX calculation
              }}>
                <div style={{ marginBottom: '5pt' }}>ABN: 20 687 490 277</div>
                <div style={{ marginBottom: '5pt' }}>21 Campbell St</div>
                <div style={{ marginBottom: '5pt' }}>Surry Hills NSW 2010, Australia</div>
                <div style={{ marginBottom: '5pt' }}>1300 AI FORM (1300 243 676)</div>
                <div>info@medicai.com.au</div>
              </div>
            </div>

            {/* DATE SECTION */}
            <div style={{
              textAlign: 'right',
              marginBottom: '10pt',
              fontSize: '11pt',
              fontWeight: 'normal'
            }}>
              Date: {currentDate}
            </div>

            {/* PATIENT INFORMATION */}
            <div style={{ marginBottom: '20pt', fontSize: '11pt' }}>
              <div style={{ marginBottom: '6pt' }}>
                Regarding: {submission.patient_name || '{patientName}'}
              </div>
              <div style={{ marginBottom: '6pt' }}>
                {formattedDob}
              </div>
              <div style={{ marginBottom: '6pt' }}>
                {submission.patient_phone || '{patientPhone}'}
              </div>
              <div style={{ marginBottom: '20pt' }}>
                {submission.patient_email || '{patientEmail}'}
              </div>
            </div>

            {/* DOCUMENT CONTENT - with flex layout to push signature to bottom */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1, // Take remaining space
              justifyContent: 'space-between'
            }}>
              <div>
                {/* Greeting */}
                <div style={{ marginBottom: '20pt', fontSize: '11pt' }}>
                  {greeting}
                </div>

                {/* Main content */}
                <div style={{
                  fontSize: '11pt',
                  lineHeight: '1.4',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '20pt'
                }}>
                  {defaultContent}
                </div>
              </div>

              {/* SIGNATURE SECTION - pushed to bottom */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '20pt'
              }}>
                {/* Closing */}
                <div style={{
                  fontSize: '11pt',
                  marginBottom: '10pt'
                }}>
                  Kindly,
                </div>

                {/* Signature area */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginBottom: '20pt'
                }}>
                  <div>
                    {/* Doctor details */}
                    <div style={{ fontSize: '11pt' }}>
                      <div style={{ marginBottom: '8pt' }}>{doctorName}</div>
                      <div style={{ marginBottom: '8pt' }}>Provider Number: {providerNumber}</div>
                      <div>info@medicai.com.au</div>
                    </div>
                  </div>

                  {/* Signature - exact match with PDF generation */}
                  <SignatureDisplay
                    signatureUrl={clinicianProfile?.signature_image_url}
                    width="40mm"
                    height="20mm"
                    showFallback={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};