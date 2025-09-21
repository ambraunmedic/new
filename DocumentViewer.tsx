import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface DocumentViewerProps {
  documentUrl: string;
  patientName: string;
  formType: string;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  documentUrl,
  patientName,
  formType
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isBase64Html = documentUrl?.startsWith('data:text/html;base64,');
  const isPdfUrl = documentUrl?.endsWith('.pdf') || documentUrl?.includes('pdf');

  const handleDownload = () => {
    if (isBase64Html) {
      // Convert base64 HTML to downloadable file
      const fileName = `${formType.replace(/\s+/g, '_')}_${patientName.replace(/\s+/g, '_')}.html`;
      const link = document.createElement('a');
      link.href = documentUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For direct URLs, open in new tab
      window.open(documentUrl, '_blank');
    }
  };

  const handleViewInNewTab = () => {
    if (isBase64Html) {
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(atob(documentUrl.split(',')[1]));
        newWindow.document.close();
      }
    } else {
      window.open(documentUrl, '_blank');
    }
  };

  if (!documentUrl) {
    return (
      <span className="text-muted-foreground text-sm">
        Document not available
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 mr-1" />
            View Document
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{formType} - {patientName}</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleViewInNewTab}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open in New Tab
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
            {isBase64Html ? (
              <iframe
                src={documentUrl}
                className="w-full h-[70vh] border border-gray-200 rounded"
                title={`${formType} for ${patientName}`}
              />
            ) : isPdfUrl ? (
              <iframe
                src={documentUrl}
                className="w-full h-[70vh] border border-gray-200 rounded"
                title={`${formType} for ${patientName}`}
              />
            ) : (
              <div className="flex items-center justify-center h-[70vh] bg-gray-50 rounded border">
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Unable to preview this document format</p>
                  <Button onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Quick actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleViewInNewTab}
        title="Open in new tab"
      >
        <ExternalLink className="w-4 h-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDownload}
        title="Download document"
      >
        <Download className="w-4 h-4" />
      </Button>
    </div>
  );
};