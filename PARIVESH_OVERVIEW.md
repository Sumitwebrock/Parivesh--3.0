# PARIVESH 3.0 - Next-Generation Environmental Clearance Portal

## 🌿 Overview

PARIVESH 3.0 is a comprehensive, role-based environmental clearance system for the Government of India's Ministry of Environment, Forest and Climate Change. This Next-Gen portal provides a streamlined, interactive platform for managing environmental, forest, wildlife, and coastal regulation zone (CRZ) clearances.

---

## 🎨 Design System

### Color Palette
- **Primary (Forest Green)**: `#1A5C1A` - Used for primary actions, headers, and environmental themes
- **Secondary (Government Blue)**: `#003087` - Used for administrative elements and official branding
- **Accent (Saffron)**: `#FF6B00` - Used for highlights, notifications, and calls-to-action
- **Supporting Colors**: Light variants for backgrounds and subtle UI elements

### Typography
- **Headings**: Rajdhani (Bold) - Strong, government-appropriate font
- **Body**: Noto Sans - Clean, readable with Devanagari support for bilingual content

### Visual Elements
- **Rangoli/Mandala patterns** in corners for Indian cultural authenticity
- **Leaf motifs** for environmental theme
- **Ashoka Emblem** and **PARIVESH logo** for official branding
- **Animated particles** for modern, dynamic feel

---

## 📱 Portal Screens

### 1. **Landing Page** (`/`)
**Purpose**: Public-facing homepage with information and quick access

**Features**:
- Hero section with animated leaf particles
- Four clearance type cards (EC, FC, WC, CRZ) with hover effects
- Live statistics counter (proposals, clearances, users, projects)
- "What's New" scrolling news ticker
- Bilingual support (Hindi/English toggle)
- Quick "Track Your Proposal" CTA

**Key Interactions**:
- Click clearance cards to learn more
- Navigate to login/dashboard
- View statistics and updates

---

### 2. **Role Selection / Login Portal** (`/login`)
**Purpose**: User authentication and role-based access control

**Roles Available**:
1. **Admin** (Blue) - System administration
2. **Project Proponent / RQP** (Green) - Submit applications
3. **Scrutiny Team** (Orange) - Review applications
4. **MoM Team** (Purple) - Generate meeting minutes

**Features**:
- Large, colorful role cards with hover lift animation
- Visual distinction by color for each role
- New user registration link
- Responsive grid layout

---

### 3. **Project Proponent Dashboard** (`/proponent`)
**Purpose**: Application management for project proponents

**Features**:
- **Left Sidebar**: 
  - User profile
  - My Applications
  - New Application
  - Documents
  - Payment
  - Track Status
  - Notifications

- **Main Area**:
  - Application pipeline stepper (Draft → Finalized)
  - Active applications list with status badges
  - Application details cards
  - "File New Application" prominent CTA

- **Right Panel**:
  - Recent notifications with icons
  - Payment alerts
  - EDS response reminders

**Status Types**:
- Under Scrutiny (Blue)
- EDS Raised (Orange)
- MoM Generated (Green)
- Draft, Submitted, Referred, Finalized

---

### 4. **New Application Form** (`/proponent/new`)
**Purpose**: Multi-step application submission wizard

**5 Steps**:

**Step 1: Category Selection**
- Choose Category (A, B1, B2) as large toggle cards
- Select industry sector from dropdown
- Visual feedback on selection

**Step 2: Project Details**
- Project name, cost, land area
- Location with address
- GPS coordinates (latitude/longitude)
- Form validation

**Step 3: Document Upload**
- List of required/optional documents
- Document upload buttons
- Upload progress indicators
- Drag-and-drop zone
- File type restrictions (PDF, DOC, DOCX)

**Step 4: Payment**
- Payment summary breakdown
- QR code for UPI payment
- UPI ID input field
- Payment verification button
- Total amount display

**Step 5: Review & Submit**
- Summary of all entered information
- Declaration checkbox
- Final submission button
- Success confirmation

**Features**:
- Step indicator with progress
- Next/Previous navigation
- Save draft functionality
- Real-time validation

---

### 5. **Scrutiny Dashboard** (`/scrutiny`)
**Purpose**: Application review and verification by scrutiny officers

**Features**:

**Left Sidebar**:
- All Applications
- Pending Review
- Verified
- Referred

**Main Area**:
- Search bar with filters
- Applications table with columns:
  - App ID
  - Project Name
  - Sector
  - Date
  - Status
  - Action

**Side Panel** (opens on row click):
- Application details
- Document list
- Verification checklist with checkboxes
- Action buttons:
  - **Auto-Generate Gist** - AI-powered summary
  - **Raise EDS** - Environmental Data Sheet request
  - **Refer to Meeting** - Send to committee

**Gist Generation Modal**:
- Auto-generated application summary
- Key environmental concerns
- Recommendations
- Accept/Edit options

---

### 6. **MoM Dashboard** (`/mom`)
**Purpose**: Minutes of Meeting (MoM) generation and management

**Features**:

**Meeting Calendar**:
- Upcoming/past meetings
- Meeting ID, date, time
- Number of applications
- Status (Scheduled, Completed, Finalized)

**Referred Applications List**:
- Applications ready for meeting
- Gist availability indicator
- Generate MoM button
- View Gist preview

**Gist Editor**:
- Rich text toolbar (Bold, Italic, Table)
- Edit mode toggle
- Save draft functionality
- Read-only preview mode
- Document structure display

**Actions**:
- Convert to MoM
- Lock & Finalize
- Download as DOCX
- Download as PDF

**Features**:
- Word-like editing experience
- Version control
- Template management
- Export functionality

---

### 7. **Admin Dashboard** (`/admin`)
**Purpose**: System administration and analytics

**Tabs**:

**Overview Tab**:
- **Statistics Cards**:
  - EC Granted
  - ToR Issued
  - Forest Clearance
  - Wildlife Clearance
  
- **Sector-wise Clearances Chart**:
  - Bar chart with multiple clearance types
  - Interactive tooltips
  - Legend for clarity
  - Data for: Mining, Infrastructure, Industrial, Power, Building

- **Recent System Activity**:
  - User registrations
  - Application submissions
  - MoM finalizations
  - Template updates

**User Management Tab**:
- User list table
- Add/Edit/Delete users
- Role assignment
- Status management (Active/Inactive)
- Email verification

**Template Management Tab**:
- Gist templates by category
- Version control
- Upload/Edit/Delete templates
- Last updated date
- Status indicator

**Sector Parameters Tab**:
- Configure sector-specific settings
- Processing time limits
- Fee structures
- Approval workflows

**System Settings Tab**:
- Email notification preferences
- Payment gateway configuration
- System parameters
- Backup settings

---

## 🎯 Key Features

### Interactive Elements
- **Hover Effects**: Cards lift and scale on hover
- **Animated Transitions**: Smooth page transitions with Motion
- **Loading States**: Progress indicators during uploads
- **Real-time Updates**: Live notification ticker

### User Experience
- **Role-Based Access**: Different interfaces for different user types
- **Responsive Design**: Works on desktop and tablet
- **Bilingual Support**: Hindi/English toggle
- **Accessibility**: Text size controls, keyboard navigation

### Data Visualization
- **Charts**: Recharts for sector-wise analytics
- **Progress Steppers**: Visual application pipeline
- **Status Badges**: Color-coded status indicators
- **Statistics Counters**: Dynamic number displays

### Forms & Validation
- **Multi-step Forms**: Wizard-style application process
- **File Upload**: Drag-and-drop with progress
- **Input Validation**: Real-time field validation
- **Auto-save**: Draft saving functionality

---

## 🔐 Security & Compliance

- Role-based access control (RBAC)
- Government authentication standards
- Secure document upload
- Audit trail for all actions
- Data encryption in transit

---

## 🚀 Technical Stack

- **Framework**: React 18.3.1
- **Routing**: React Router 7.13.0
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts 2.15.2
- **Icons**: Lucide React
- **Forms**: React Hook Form

---

## 📊 Mock Data & Sample Workflows

### Sample Applications:
1. **EC/2026/00234** - Solar Power Plant (Under Scrutiny)
2. **EC/2026/00198** - Mining Project (EDS Raised)
3. **EC/2025/01876** - Industrial Complex (MoM Generated)

### Sample Users:
- **Ramesh Patel** - Project Proponent
- **Scrutiny Team 1** - Scrutiny Officer
- **MoM Team Lead** - MoM Manager
- **Admin** - System Administrator

### Application Flow:
1. Proponent submits application
2. Auto-assigned to scrutiny team
3. Scrutiny reviews and generates gist
4. May raise EDS for additional information
5. Refer to meeting committee
6. MoM team generates meeting minutes
7. Admin approves final clearance

---

## 🎨 Component Library

### Reusable Components
- `Header.tsx` - Government header with logos
- `Navigation.tsx` - Main navigation bar
- `Footer.tsx` - Footer with links
- `StatusBadge.tsx` - Color-coded status indicators
- `Breadcrumb.tsx` - Navigation breadcrumbs
- `DecorativePattern.tsx` - Indian motif patterns
- `LoadingScreen.tsx` - Loading animation

---

## 🌐 Routes

| Route | Component | Access |
|-------|-----------|--------|
| `/` | Home | Public |
| `/login` | RoleSelection | Public |
| `/proponent` | ProponentDashboard | Proponent Only |
| `/proponent/new` | NewApplication | Proponent Only |
| `/scrutiny` | ScrutinyDashboard | Scrutiny Team Only |
| `/mom` | MoMDashboard | MoM Team Only |
| `/admin` | AdminDashboard | Admin Only |

---

## 📝 Future Enhancements

- Real-time collaboration on documents
- Video conferencing for meetings
- Mobile app (iOS/Android)
- Advanced analytics and reporting
- Integration with other government portals
- Chatbot for user assistance
- Document OCR and auto-fill
- GIS mapping integration

---

## 🏛️ Government Compliance

This portal adheres to:
- National Informatics Centre (NIC) guidelines
- Government of India web standards
- WCAG 2.1 accessibility standards
- Digital India initiatives
- E-governance best practices

---

## 📞 Support

**Helpline**: 1800-11-2345  
**Email**: parivesh@nic.in  
**Office Hours**: 9:30 AM - 5:30 PM (Monday to Friday)

---

**Version**: 3.0  
**Last Updated**: March 11, 2026  
**Ministry**: Environment, Forest and Climate Change  
**Government of India**

---

*Designed with care for environmental sustainability and digital governance excellence.*
