# MedicAI Forms - Setup Instructions

## Overview
This is a complete React + TypeScript frontend application with Supabase backend integration for medical documentation and portal management.

## Features Implemented
- Patient Portal with password change functionality
- Admin Portal with business management features
- Clinician Portal with patient queue and clinical tools
- Direct messaging between patients and admin
- PDF generation for medical certificates (integrated with Stripe payments)
- Role-based access control and authentication
- Responsive design with yellow branding theme

## Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Stripe account (for payment processing)

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 2. Environment Configuration
1. Copy `.env.example` to `.env`
2. Fill in your Supabase project details:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public key
3. Add your Stripe publishable key:
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

### 3. Database Setup
You'll need to create the following tables in your Supabase database:
- `medicaiforms` - For form submissions
- `patient_messages` - For patient-to-admin messaging
- `user_roles` - For role-based access control

Contact the development team for the complete SQL schema.

### 4. Run the Application
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

The application will be available at your local development server.

## Portal Access
- **Patient Portal**: `/patient-auth` - For patients to access forms and documents
- **Clinician Portal**: `/clinic-login` - For healthcare providers
- **Admin Portal**: `/admin-login` - For platform administration

## Key Features
- **Navigation**: Streamlined to focus on "For Patients" services
- **Authentication**: Role-based access with Supabase Auth
- **Forms**: Sick certificate and specialist referral forms
- **Payments**: Stripe integration for PDF generation
- **Messaging**: Direct patient-to-admin communication
- **Responsive**: Mobile-friendly design with yellow branding

## Support
For technical support or questions about setup, please contact the development team.
