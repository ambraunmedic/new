
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Index from "./pages/Index";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";

import SickCertificatePage from "./pages/SickCertificatePage";
import TestSickCertificatePage from "./pages/TestSickCertificatePage";
import SpecialistReferralPage from "./pages/SpecialistReferralPage";
import TestSpecialistReferralPage from "./pages/TestSpecialistReferralPage";
import CarerCertificatePage from "./pages/CarerCertificatePage";
import OtherDocumentationPage from "./pages/OtherDocumentationPage";
import TestForms from "./pages/TestForms";
import HeadacheDemo from "./pages/HeadacheDemo";
import Demo from "./pages/Demo";
import Clinics from "./pages/Clinics";
import Psychiatry from "./pages/Psychiatry";
import PsychiatryAssessment from "./pages/PsychiatryAssessment";
import ForPatients from "./pages/ForPatients";
import SpecialistClinics from "./pages/SpecialistClinics";
import CorporateMembership from "./pages/CorporateMembership";
import CosmeticSurgery from "./pages/CosmeticSurgery";
import DermatologyLanding from "./pages/DermatologyLanding";
import TelehealthPartners from "./pages/TelehealthPartners";
import CorporateAccess from "./pages/CorporateAccess";
import WidgetDemo from "./pages/WidgetDemo";
import WidgetTest from "./pages/WidgetTest";
import Store from "./pages/Store";
import Team from "./pages/Team";
import Advisors from "./pages/Advisors";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import MM67Model from "./pages/MM67Model";
import Overview from "./pages/Overview";
import Analytics from "./pages/Analytics";
import Revenue from "./pages/Revenue";
import QRCode from "./pages/QRCode";
import ROICalculator from "./pages/ROICalculator";
import Compliance from "./pages/Compliance";
import AustralianPrivacyGuidelines from "./pages/AustralianPrivacyGuidelines";
import AustralianPrivacyPolicy from "./pages/AustralianPrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import Disclaimer from "./pages/Disclaimer";
import AccessibilityStatement from "./pages/AccessibilityStatement";
import SecurityPolicy from "./pages/SecurityPolicy";
import UsagePolicy from "./pages/UsagePolicy";
import PaymentSuccess from "./pages/PaymentSuccess";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ClinicLogin from "./pages/ClinicLogin";
import AdminLogin from "./pages/AdminLogin";
import CorporateLogin from "./pages/CorporateLogin";
import GeneralPracticeLogin from "./pages/GeneralPracticeLogin";
import SpecialistDoctorLogin from "./pages/SpecialistDoctorLogin";
import ClinicPortal from "./pages/ClinicPortal";
import SpecialistClinicPortal from "./pages/SpecialistClinicPortal";
import AdminDashboard from "./pages/AdminDashboard";
import ClinicianDashboard from "./pages/ClinicianDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ClinicianApprovalDashboard from "./pages/ClinicianApprovalDashboard";
import PatientAuth from "./components/auth/PatientAuth";
import SubmissionDetails from "./pages/SubmissionDetails";
import Manifesto from "./pages/Manifesto";

import SpecialistOnboarding from "./pages/SpecialistOnboarding";
import SpecialistOnboardingSuccess from "./pages/SpecialistOnboardingSuccess";
import Unauthorized from "./pages/Unauthorized";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Special full-screen routes outside Layout */}
            <Route path="dermatology/referral" element={<SpecialistReferralPage />} />
            <Route path="womens-health/referral" element={<SpecialistReferralPage />} />
            <Route path="cosmetic-surgery" element={<CosmeticSurgery />} />
            <Route path="manifesto" element={<Manifesto />} />
            <Route path="patient-auth" element={<PatientAuth />} />


            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="home" element={<Home />} />
              <Route path="services" element={<Services />} />
              <Route path="about" element={<About />} />
              <Route path="contact" element={<Contact />} />

              <Route path="sick-certificate" element={<SickCertificatePage />} />
              <Route path="test-sick-certificate" element={<TestSickCertificatePage />} />
              <Route path="specialist-referral" element={<SpecialistReferralPage />} />
              <Route path="test-specialist-referral" element={<TestSpecialistReferralPage />} />
              <Route path="carer-certificate" element={<CarerCertificatePage />} />
              <Route path="other-documentation" element={<OtherDocumentationPage />} />
              <Route path="test-forms" element={<TestForms />} />
              <Route path="headache-demo" element={<HeadacheDemo />} />
              <Route path="demo" element={<Demo />} />
              <Route path="clinics" element={<Clinics />} />
              <Route path="dermatology" element={<DermatologyLanding />} />
              <Route path="psychiatry" element={<Psychiatry />} />
              <Route path="psychiatry-assessment" element={<PsychiatryAssessment />} />
              <Route path="for-patients" element={<ForPatients />} />
              <Route path="specialist-clinics" element={<SpecialistClinics />} />
              <Route path="corporate-membership" element={<CorporateMembership />} />
              <Route path="telehealth-partners" element={<TelehealthPartners />} />
              <Route path="corporate-access" element={<CorporateAccess />} />
              <Route path="widget-demo" element={<WidgetDemo />} />
              <Route path="widget-test" element={<WidgetTest />} />
              <Route path="store" element={<Store />} />
              <Route path="team" element={<Team />} />
              <Route path="advisors" element={<Advisors />} />
              <Route path="projects" element={<Projects />} />
              <Route path="blog" element={<Blog />} />
              <Route path="blog/:slug" element={<BlogPost />} />
              <Route path="mm67-model" element={<MM67Model />} />
              <Route path="overview" element={<Overview />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="qr-code" element={<QRCode />} />
              <Route path="roi-calculator" element={<ROICalculator />} />
              <Route path="compliance" element={<Compliance />} />
              <Route path="australian-privacy-guidelines" element={<AustralianPrivacyGuidelines />} />
              <Route path="australian-privacy-policy" element={<AustralianPrivacyPolicy />} />
              <Route path="terms-of-service" element={<TermsOfService />} />
              <Route path="terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="privacy-policy" element={<PrivacyPolicy />} />
              <Route path="cookie-policy" element={<CookiePolicy />} />
              <Route path="disclaimer" element={<Disclaimer />} />
              <Route path="accessibility" element={<AccessibilityStatement />} />
              <Route path="security-policy" element={<SecurityPolicy />} />
              <Route path="usage-policy" element={<UsagePolicy />} />
              <Route path="payment-success" element={<PaymentSuccess />} />
              <Route path="payment/success" element={<PaymentSuccess />} />
              <Route path="login" element={<Login />} />
              <Route path="clinic-login" element={<ClinicLogin />} />
              <Route path="admin-login" element={<AdminLogin />} />
              <Route path="corporate-login" element={<CorporateLogin />} />
              <Route path="general-practice-login" element={<GeneralPracticeLogin />} />
              <Route path="specialist-doctor-login" element={<SpecialistDoctorLogin />} />
              <Route path="clinic-portal" element={<ClinicPortal />} />
              <Route path="specialist-clinic-portal" element={<SpecialistClinicPortal />} />
              <Route path="specialist-onboarding" element={<SpecialistOnboarding />} />
              <Route path="specialist-onboarding-success" element={<SpecialistOnboardingSuccess />} />
              <Route path="unauthorized" element={<Unauthorized />} />
            </Route>

            {/* Protected Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/clinician" element={
              <ProtectedRoute allowedRoles={['clinician']}>
                <ClinicianDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientDashboard />
              </ProtectedRoute>
            } />
            <Route path="/patient/submissions/:id" element={
              <ProtectedRoute allowedRoles={['patient']}>
                <SubmissionDetails />
              </ProtectedRoute>
            } />
            <Route path="/clinician-approval" element={
              <ProtectedRoute allowedRoles={['clinician', 'admin']}>
                <ClinicianApprovalDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
