import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  AlertTriangle,
  TestTube,
  Clock,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  RefreshCw,
  Shield,
  Activity
} from "lucide-react";
import { useOpenAIDiagnostic, DiagnosticSuggestion } from "@/hooks/useOpenAIDiagnostic";
import { ClinicianSubmission } from "@/hooks/useClinicianSubmissions";

interface AIDiagnosticPanelProps {
  submission: ClinicianSubmission;
}

const ConfidenceBadge: React.FC<{ confidence: DiagnosticSuggestion['confidence'] }> = ({ confidence }) => {
  const variants = {
    'High': 'bg-green-100 text-green-800 border-green-200',
    'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Low': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <Badge variant="outline" className={variants[confidence]}>
      {confidence} Confidence
    </Badge>
  );
};

const UrgencyBadge: React.FC<{ urgency: DiagnosticSuggestion['urgency'] }> = ({ urgency }) => {
  const variants = {
    'Urgent': 'bg-red-500 text-white',
    'Routine': 'bg-blue-500 text-white',
    'Non-urgent': 'bg-gray-500 text-white'
  };

  const icons = {
    'Urgent': AlertTriangle,
    'Routine': Clock,
    'Non-urgent': CheckCircle2
  };

  const Icon = icons[urgency];

  return (
    <Badge className={variants[urgency]}>
      <Icon className="h-3 w-3 mr-1" />
      {urgency}
    </Badge>
  );
};

const DiagnosticSection: React.FC<{
  title: string;
  icon: React.ElementType;
  items: string[];
  className?: string
}> = ({ title, icon: Icon, items, className = "" }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2 font-medium">
        <Icon className="h-4 w-4" />
        <span>{title}</span>
      </div>
      <ul className="space-y-1 text-sm pl-6">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const LoadingState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <Brain className="h-12 w-12 text-blue-500 animate-pulse" />
      <div className="absolute -top-1 -right-1">
        <RefreshCw className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    </div>
    <div className="text-center">
      <p className="font-medium text-blue-900">Analyzing Patient Data</p>
      <p className="text-sm text-blue-600">AI is reviewing the medical information...</p>
    </div>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <AlertCircle className="h-12 w-12 text-red-500" />
    <div className="text-center space-y-2">
      <p className="font-medium text-red-900">Unable to Get AI Suggestions</p>
      <p className="text-sm text-red-600 max-w-md">{error}</p>
    </div>
    <Button onClick={onRetry} variant="outline" size="sm">
      <RefreshCw className="h-4 w-4 mr-2" />
      Try Again
    </Button>
  </div>
);

const EmptyState: React.FC<{ onAnalyze: () => void }> = ({ onAnalyze }) => (
  <div className="flex flex-col items-center justify-center py-12 space-y-4">
    <div className="relative">
      <Brain className="h-16 w-16 text-gray-400" />
      <Stethoscope className="h-8 w-8 text-gray-300 absolute -bottom-1 -right-1" />
    </div>
    <div className="text-center space-y-2">
      <p className="font-medium text-gray-900">AI Diagnostic Assistant</p>
      <p className="text-sm text-gray-600 max-w-md">
        Get AI-powered diagnostic suggestions based on the patient's submitted information
      </p>
    </div>
    <Button onClick={onAnalyze} className="bg-blue-600 hover:bg-blue-700">
      <Brain className="h-4 w-4 mr-2" />
      Analyze Case
    </Button>
  </div>
);

export const AIDiagnosticPanel: React.FC<AIDiagnosticPanelProps> = ({ submission }) => {
  const { suggestions, isLoading, error, getDiagnosticSuggestions } = useOpenAIDiagnostic();

  // Check if submission has existing AI diagnosis data
  const existingDiagnosis = (submission as any).ai_diagnosis_data;
  const existingDiagnosisTime = (submission as any).ai_diagnosis_generated_at;
  const hasExistingDiagnosis = existingDiagnosis && typeof existingDiagnosis === 'object';

  // Use existing diagnosis or current suggestions
  const displaySuggestions = hasExistingDiagnosis ? existingDiagnosis : suggestions;

  const handleAnalyze = () => {
    getDiagnosticSuggestions(submission);
  };

  const handleRetry = () => {
    getDiagnosticSuggestions(submission);
  };

  return (
    <Card className="h-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-blue-600" />
          AI Diagnostic Assistant
          <Badge variant="secondary" className="ml-auto text-xs">
            {submission.form_type.replace(' Referral', '')} Specialist
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Error State */}
        {error && !isLoading && (
          <ErrorState error={error} onRetry={handleRetry} />
        )}

        {/* Empty State - only show if no existing diagnosis and no current suggestions */}
        {!displaySuggestions && !isLoading && !error && (
          <EmptyState onAnalyze={handleAnalyze} />
        )}

        {/* Results State - show existing diagnosis or new suggestions */}
        {displaySuggestions && !isLoading && (
          <div className="space-y-6">
            {/* Header with badges */}
            <div className="flex flex-wrap items-center gap-2">
              <ConfidenceBadge confidence={displaySuggestions.confidence} />
              <UrgencyBadge urgency={displaySuggestions.urgency} />
              {hasExistingDiagnosis && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Saved Diagnosis
                </Badge>
              )}
              {hasExistingDiagnosis && existingDiagnosisTime && (
                <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 text-xs">
                  {new Date(existingDiagnosisTime).toLocaleDateString()} {new Date(existingDiagnosisTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </Badge>
              )}
              <Button
                onClick={handleAnalyze}
                variant="ghost"
                size="sm"
                className="ml-auto"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                {hasExistingDiagnosis ? 'Re-analyze' : 'Refresh'}
              </Button>
            </div>

            <Separator />

            {/* Primary Diagnosis */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-medium">
                <Activity className="h-4 w-4 text-blue-600" />
                <span>Primary Assessment</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="font-medium text-blue-900">{displaySuggestions.diagnosis}</p>
              </div>
            </div>

            {/* Red Flags - Most Important */}
            {displaySuggestions.redFlags && displaySuggestions.redFlags.length > 0 && (
              <>
                <Separator />
                <DiagnosticSection
                  title="⚠️ Red Flags & Urgent Considerations"
                  icon={Shield}
                  items={displaySuggestions.redFlags}
                  className="bg-red-50 border border-red-200 rounded-lg p-4"
                />
              </>
            )}

            <Separator />

            {/* Recommendations */}
            <DiagnosticSection
              title="Clinical Recommendations"
              icon={CheckCircle2}
              items={displaySuggestions.recommendations}
            />

            <Separator />

            {/* Follow-up Tests */}
            <DiagnosticSection
              title="Recommended Investigations"
              icon={TestTube}
              items={displaySuggestions.followUpTests}
            />

            <Separator />

            {/* Differential Diagnoses */}
            <DiagnosticSection
              title="Differential Diagnoses"
              icon={Stethoscope}
              items={displaySuggestions.differentialDiagnoses}
            />

            {/* Medical Disclaimer */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-800">
                  <p className="font-medium mb-1">Clinical Decision Support Tool</p>
                  <p>
                    These AI-generated suggestions are intended to support your clinical decision-making process. 
                    Please exercise your professional judgment and correlate these recommendations with your clinical 
                    examination findings, patient history, and established diagnostic protocols before making any 
                    treatment decisions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};