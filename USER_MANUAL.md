# Referral Management System - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [Dashboard](#dashboard)
5. [Creating a Referral](#creating-a-referral)
6. [Managing Referrals](#managing-referrals)
7. [Viewing Referral Details](#viewing-referral-details)
8. [Reports and Analytics](#reports-and-analytics)
9. [External Referees Management](#external-referees-management)
10. [Form Administration](#form-administration)
11. [User Roles and Permissions](#user-roles-and-permissions)
12. [Technical Reference](#technical-reference)
13. [Troubleshooting](#troubleshooting)
14. [Appendices](#appendices)

---

## Introduction

### Purpose
The Referral Management System is a comprehensive web-based application designed for healthcare organizations to manage patient referrals between internal departments and external medical facilities. The system streamlines the referral process, ensuring proper tracking, communication, and documentation throughout the patient care journey.

### Key Benefits
- **Centralized Management**: All referrals in one unified system
- **Real-time Tracking**: Monitor referral status and progress
- **Enhanced Communication**: Seamless information exchange between departments
- **Compliance**: Comprehensive audit trail and documentation
- **Reporting**: Detailed analytics and export capabilities
- **Customizable**: Dynamic forms tailored to each department's needs

### Target Users
- Healthcare Professionals (Doctors, Nurses, Allied Health)
- Department Administrators
- Medical Records Staff
- Healthcare Facility Managers

---

## System Overview

### Architecture
The system consists of two main components:
1. **Frontend Application** (this repository): PHP-based web interface
2. **Backend API** (referral-api): Laravel-based REST API with JWT authentication

### Technology Stack
- **Frontend**: PHP 5.3+, HTML5, CSS3, JavaScript, Bootstrap 5, jQuery
- **Backend**: Laravel (PHP), MySQL/MariaDB
- **Authentication**: JWT (JSON Web Tokens) with 24-hour expiration
- **Email**: PHPMailer with Mailtrap for testing
- **File Handling**: Base64 encoding for attachments
- **UI Components**: Select2, Date Range Picker, Bootstrap Icons

### Browser Requirements
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- JavaScript enabled
- Cookies enabled for session management

---

## Getting Started

### Accessing the System

1. **Open Your Web Browser**
   - Navigate to your organization's referral system URL
   - Example: `http://your-domain.com/referral-module/`

2. **Login Process**
   The system uses JWT authentication integrated with your organization's staff database.

   **Required Credentials:**
   - Staff ID
   - Department ID
   - Current Status/Role

   The authentication is handled automatically through your organization's single sign-on (SSO) system via `lock_adv.php`.

3. **First-Time Setup**
   - Upon first login, you'll be assigned to your business unit
   - You can only view and manage referrals within your authorized business unit
   - Your JWT token is valid for 24 hours

### Understanding Your Dashboard
After successful login, you'll be directed to the main dashboard showing:
- Total referral count
- Status breakdown (Open, In Progress, Referred, Closed, Not Present)
- Priority distribution (Low, Medium, High)
- Business unit statistics

---

## Dashboard

### Dashboard Components

#### 1. Header Section
**Location**: Top of the page
- **Referral Dashboard Title**: Current page identifier
- **New Referral Button**: Quick access to create a new referral
- **View Report Button**: Access reporting and analytics

#### 2. Statistics Overview

**Total Referral Count**
- Large number display showing all referrals in your business unit
- Updated in real-time

**Status Cards**
The dashboard displays five status categories:
1. **Open** - New referrals awaiting action
2. **In Progress** - Currently being handled
3. **Referred** - Forwarded to another department/facility
4. **Closed** - Completed referrals
5. **Not Present** - Patient did not attend

**Priority Breakdown**
- **Low Priority**: Routine referrals (Green indicator)
- **Medium Priority**: Standard urgent referrals (Yellow indicator)
- **High Priority**: Critical/emergency referrals (Red indicator)

#### 3. Business Unit Cards
Each card shows:
- Department name
- Number of referrals
- Quick access to department-specific referrals

#### 4. Referral List/Table
Displays all referrals with the following information:
- Referral ID (e.g., #REF0001)
- Patient Name
- From Department
- To Department
- Priority Level
- Status
- Date Created
- Actions (View, Edit, Update Status)

### Navigation Tips
- Click on any referral row to view full details
- Use the **Filter** button to narrow down results
- Use the **Search** box to find specific referrals by ID or patient name
- Click **Refresh** to update the dashboard with latest data

---

## Creating a Referral

### Step-by-Step Guide

#### Step 1: Access the Referral Form
1. From the dashboard, click **"New Referral"** button
2. You'll be directed to `create.php`

#### Step 2: Enter Patient Information

**Customer Search**
- Click "Search Customer" to find existing patients
- Search by:
  - IC Number (Identity Card)
  - Customer ID
  - Name
- If patient exists, their information will auto-populate
- If new patient, you'll need to enter their details manually

**Patient Demographics** (if creating new record)
- Full Name
- IC Number / Passport Number
- Date of Birth (age calculated automatically)
- Gender
- Contact Number
- WhatsApp Number (optional)
- Email Address
- Full Address

#### Step 3: Referral Details

**Assignee Information** (Your Department)
- **Staff ID**: Your identifier (auto-populated)
- **Business Unit**: Your department (auto-populated)
- **Location**: Select specific location within your department
- **Referral Reason**: Brief reason for referral (required)
- **Referral Condition**: Detailed patient condition and clinical notes (required)
- **Medical History**: Relevant medical background
- **Additional Remarks**: Any extra information

**Recipient Information** (Receiving Department)
- **Business Unit**: Select the department to receive the referral
- **Location**: Select specific location within recipient department
- **Assign To**: (Optional) Specific staff member to handle the referral

**Referral Priority**
Select one of three levels:
1. **Low**: Routine, non-urgent cases
2. **Medium**: Standard urgent referrals
3. **High**: Emergency or critical cases

#### Step 4: Dynamic Forms

Based on the selected recipient department, you may see additional form fields:
- These are custom fields configured for specific departments
- Examples:
  - **Physiotherapy**: Pain level, targeted area, mobility assessment
  - **Radiology**: Type of scan, contrast required, clinical indication
  - **Laboratory**: Test type, fasting status, urgency
- Fill all **required** fields (marked with asterisk *)

#### Step 5: Attach Files

**Supported File Types:**
- Images: PNG, JPG, JPEG, GIF
- Documents: PDF, DOC, DOCX
- Medical Records: DICOM (if configured)

**Upload Process:**
1. Click "Add Attachment" or "Choose Files"
2. Select one or more files
3. Files are encoded in base64 format
4. Each file shows:
   - File name
   - File size
   - Preview (for images)
   - Remove button

**File Size Limits:**
- Individual file: Maximum 5MB (configurable)
- Total upload: Maximum 20MB per referral

#### Step 6: Review and Submit

1. Review all entered information
2. Ensure required fields are completed
3. Click **"Submit Referral"** button
4. System validates all inputs
5. On success:
   - Referral ID is generated
   - You're redirected to success page
   - Email notification sent to recipient
   - PDF referral form generated (for external referrals)

**Validation Errors:**
- Missing required fields highlighted in red
- Error messages displayed at top of form
- Scroll to first error for correction

---

## Managing Referrals

### Viewing Your Referrals

#### All Referrals View
From the dashboard, you see three categories:
1. **All**: Every referral involving your business unit
2. **Sent**: Referrals you/your department created
3. **Received**: Referrals sent to your department

#### Filtering Options
Use the filter panel to narrow results:
- **Business Unit**: Filter by department
- **Location**: Specific location within department
- **Status**: Open, In Progress, Referred, Closed, Not Present
- **Priority**: Low, Medium, High
- **Date Range**: Custom date picker
- **External**: Show only external referrals
- **Referred**: Show only multi-sequence referrals

### Updating Referral Status

#### Status Change Workflow
1. Open the referral details (click on referral row)
2. Locate the **"Update Status"** section
3. Select new status from dropdown:
   - **Open** → **In Progress**: When you start working on the referral
   - **In Progress** → **Closed**: When patient care is complete
   - **In Progress** → **Referred**: When referring to another department
   - Any status → **Not Present**: If patient doesn't attend

4. Add **Status Notes** (optional but recommended):
   - Document reason for status change
   - Clinical updates
   - Next steps

5. Click **"Update Status"** button

#### Status Change Notifications
- Email sent to relevant stakeholders
- Update logged in referral history
- Timestamp and staff ID recorded

---

## Viewing Referral Details

### Referral Detail Page Components

#### 1. Header Section
- **Referral ID**: Unique identifier (e.g., #REF0001)
- **Status Badge**: Color-coded current status
- **Priority Badge**: Visual priority indicator
- **Action Buttons**:
  - Print Referral
  - Download PDF
  - Edit Referral (if you have permission)
  - Delete Referral (administrator only)

#### 2. Patient Information Card
- Full name
- IC Number
- Age and Date of Birth
- Gender
- Contact details (Phone, WhatsApp, Email)
- Address

#### 3. Referral Timeline
Visual representation showing:
- **Created**: When referral was initiated
- **In Progress**: When work started
- **Referred**: If sent to another department (multi-sequence)
- **Closed**: Completion timestamp

Each timeline entry includes:
- Date and time
- Staff member who performed action
- Status notes

#### 4. Referral Details

**From Department (Assignee)**
- Business unit name
- Location
- Staff member
- Referral reason
- Clinical condition
- Medical history
- Additional remarks

**To Department (Recipient)**
- Business unit name
- Location
- Assigned staff member (if any)

#### 5. Custom Form Data
Displays all department-specific form responses:
- Field labels and values
- Checkbox selections
- Radio button choices
- Text area responses
- Date selections

#### 6. Attachments Section
Lists all uploaded files:
- File name
- File type and size
- Upload date
- **Actions**:
  - View/Preview (images, PDFs)
  - Download file

**Viewing Attachments:**
1. Click on file name or "View" button
2. Files open in new tab/modal
3. Download option available for all files

#### 7. Referral History Log
Complete audit trail showing:
- All status changes
- Date and time of each change
- Staff member who made the change
- Notes added with each change
- Multi-sequence referral tracking

---

## Reports and Analytics

### Accessing Reports
1. From dashboard, click **"View Report"** button
2. Redirected to `report.php`

### Report Generation

#### Filter Options

**Business Unit Filter**
- Select specific department
- Leave blank for all departments (admin only)

**Location Filter**
- Specific location within department
- Requires business unit selection first

**Status Filter**
- Open
- In Progress
- Referred
- Closed
- Not Present
- All statuses (default)

**Priority Filter**
- Low
- Medium
- High
- All priorities (default)

**Date Range**
- Month selector
- Year selector
- Custom date range picker

**External Referrals**
- Checkbox to include only external referrals
- Shows referrals sent to external facilities

**Referred Status**
- Checkbox to include only multi-sequence referrals
- Shows referrals that were referred to additional departments

#### Generating the Report

1. **Select Filters**: Choose your desired criteria
2. **Click "Generate Report"**: System processes request
3. **View Results**:
   - On-screen table display
   - Shows all matching referrals
   - Sortable columns
4. **Export Options**:
   - **Excel Export**: Click "Export to Excel" button
   - Downloads `.xlsx` file with all data
   - File name format: `referral_report_YYYY-MM-DD_HH-MM-SS.xlsx`

#### Report Contents

**Excel Report Columns:**
1. Referral ID
2. Patient Name
3. IC Number
4. Patient Contact
5. From Department
6. From Location
7. From Staff
8. To Department
9. To Location
10. To Staff (if assigned)
11. Referral Reason
12. Referral Condition
13. Medical History
14. Priority
15. Status
16. Created Date
17. Last Updated
18. Status Notes
19. External Referee (if applicable)
20. External Organization (if applicable)

### Dashboard Statistics

The report page also displays:

**Summary Cards**
- Total referrals matching filter
- Count by status
- Count by priority
- Sent vs Received breakdown

**Charts and Visualizations**
- Status distribution pie chart
- Priority distribution bar chart
- Monthly trend line graph
- Department-wise breakdown

---

## External Referees Management

### Purpose
Manage healthcare professionals and facilities outside your organization for external referrals.

### Accessing External Referee Management
1. From main navigation, select **"External Referees"**
2. Or navigate to `/externalReferee/index.php`

### External Organizations

#### Adding a New Organization
1. Click **"Add Organization"** button
2. Enter organization details:
   - **Organization Name**: Full official name
   - **Address**: Complete address
   - **Contact Number**: Main phone number
   - **Email**: Official email address
   - **Type**: Hospital, Clinic, Laboratory, etc.
3. Click **"Save"**

#### Managing Organizations
- **View All**: List of all external organizations
- **Edit**: Update organization details
- **Delete**: Remove organization (only if no active referrals)
- **Search**: Find organizations by name or type

### External Referees

#### Adding a New Referee
1. Click **"Add Referee"** button
2. Enter referee details:
   - **Full Name**: Healthcare professional's name
   - **Title**: Dr., Prof., etc.
   - **Specialization**: Medical specialty
   - **Organization**: Select from existing organizations
   - **Contact Number**: Direct contact
   - **Email**: Professional email
   - **License Number**: Medical license/registration number
3. Click **"Save"**

#### Managing Referees
- **View All**: List of all external referees
- **Filter by Organization**: Show referees from specific facility
- **Filter by Specialization**: Show referees by specialty
- **Edit**: Update referee information
- **Delete**: Remove referee (only if no active referrals)
- **Search**: Find referees by name or specialization

### Creating External Referrals

When creating a referral to an external facility:
1. In the referral form, select **"External Referral"** option
2. Choose **External Organization**
3. Select **External Referee** (optional)
4. System automatically generates PDF referral letter
5. PDF includes:
   - Patient information
   - Referral details
   - Clinical notes
   - Attachments reference
   - QR code (if configured)

---

## Form Administration

### Purpose
Configure custom forms for each department to capture specific clinical information.

### Accessing Form Administration
1. From main navigation, select **"Admin"** or **"Form Management"**
2. Navigate to `admin.php`

### Understanding Dynamic Forms

Each business unit can have multiple custom forms with various field types:
- **Text Input**: Single line text
- **Text Area**: Multi-line text
- **Checkbox**: Multiple selections
- **Radio Button**: Single selection from options
- **Select Dropdown**: Dropdown list
- **Date Picker**: Date selection
- **Email Input**: Email validation
- **Number Input**: Numeric values only
- **File Upload**: Document/image upload

### Creating a New Form

#### Step 1: Form Basic Information
1. Click **"Create New Form"** button
2. Enter:
   - **Business Unit**: Select department
   - **Form Label**: Descriptive name (e.g., "Physiotherapy Assessment")
   - **Hidden**: Whether to show label on referral form
   - **Required**: Whether form completion is mandatory

#### Step 2: Add Form Fields
For each field:
1. Click **"Add Field"** button
2. Configure field properties:
   - **Field Name**: Internal identifier (no spaces, use underscores)
   - **Field Type**: Select from available types
   - **Field Label**: Display name shown to users
   - **Required**: Mark if field is mandatory
   - **Default Value**: Pre-populated value (optional)
   - **Placeholder**: Hint text (optional)
   - **Validation**: Rules (email format, number range, etc.)

3. For selection fields (checkbox, radio, select):
   - **Add Options**: Click "Add Option"
   - Enter option values
   - Reorder options using drag-and-drop
   - Delete options with X button

#### Step 3: Field Order
- Drag and drop fields to reorder
- Order determines display sequence on referral form

#### Step 4: Save Form
1. Review all fields
2. Click **"Save Form"** button
3. Form is now available for selected business unit

### Managing Existing Forms

#### Viewing Forms
- **Forms List**: Shows all forms for your business unit
- **Preview**: Click to see how form appears to users
- **Edit**: Modify form structure or fields
- **Delete**: Remove form (only if no referrals use it)

#### Editing Forms
1. Click **"Edit"** on desired form
2. Modify form properties or fields
3. Add/remove fields
4. Update field properties
5. **Save Changes**

**Important**:
- Editing a form affects all future referrals
- Existing referrals retain their original form structure
- Cannot modify forms with active referrals without admin privileges

#### Deleting Forms
1. Click **"Delete"** on form
2. System checks for dependencies
3. Confirm deletion
4. Form is permanently removed

**Restrictions**:
- Cannot delete forms with existing referral data
- Must be archived instead (set as inactive)

---

## User Roles and Permissions

### Role Types

#### 1. Healthcare Staff
**Permissions:**
- View referrals in their business unit
- Create new referrals
- Update status of assigned referrals
- Add notes and attachments
- View reports for their department
- Search patients

**Restrictions:**
- Cannot access other business units
- Cannot modify closed referrals
- Cannot delete referrals
- Cannot manage forms
- Cannot manage external referees (read-only)

#### 2. Department Administrator
**Permissions:**
- All Healthcare Staff permissions
- Manage forms for their business unit
- Manage external referees
- View comprehensive reports across locations
- Reassign referrals within department
- Update any referral in their business unit

**Restrictions:**
- Cannot access other business units
- Cannot delete referrals (must archive)
- Cannot modify system settings

#### 3. System Administrator
**Permissions:**
- Access all business units
- Manage all forms across departments
- Manage all external referees and organizations
- View system-wide reports
- Manage user access (in backend)
- Configure business units and locations
- Delete referrals (when necessary)
- System configuration

**Restrictions:**
- Bound by organizational policies
- Actions are fully audited

### Business Unit Isolation

The system enforces strict business unit access control:
- JWT token contains `business_unit_id`
- All API requests filtered by business unit
- Attempting to access another unit's data returns **403 Forbidden**
- Ensures data privacy and compliance
- Exception: System administrators can access all units

---

## Technical Reference

### System Requirements

#### Server Requirements
- PHP 5.3 or higher
- MySQL 5.6+ or MariaDB 10.1+
- Apache or Nginx web server
- Minimum 2GB RAM
- 10GB disk space (for files and database)

#### PHP Extensions Required
- `curl`: API communication
- `json`: JSON encoding/decoding
- `mbstring`: Multi-byte string handling
- `pdo_mysql`: Database connectivity
- `gd` or `imagick`: Image processing
- `fileinfo`: File type detection

#### Client Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Cookies enabled
- Minimum screen resolution: 1024x768
- Internet connection

### API Integration

#### Base URL
```
http://your-domain.com/api
```

#### Authentication

**Login Endpoint:**
```
POST /auth
Content-Type: application/json

{
  "staff_id": 2222,
  "staff_department_id": 1,
  "status_semasa": "Junior Audiologist"
}

Response:
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 86400
}
```

**Using the Token:**
All protected endpoints require:
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

#### Key Endpoints

**Get All Referrals:**
```
GET /referral
Authorization: Bearer {token}

Response:
{
  "data": {
    "all": [...],
    "sent": [...],
    "received": [...]
  }
}
```

**Create Referral:**
```
POST /referral
Authorization: Bearer {token}
Content-Type: application/json

{
  "business_units": {
    "assignee": { "staff_id": 2222, "business_unit_id": "6", ... },
    "recipient": { "business_unit_id": "1", "location": "350" }
  },
  "referral": {
    "customer_id": 10,
    "priority": 2
  },
  "form_data": { ... },
  "attachments": [ ... ]
}

Response:
{
  "id": 1234,
  "pdf_base64": "..." (if external)
}
```

**Update Referral:**
```
PUT /referral
Authorization: Bearer {token}

{
  "referral": {
    "referral_id": "1",
    "status": 3,
    "additional_remarks": "..."
  }
}
```

**Generate Report:**
```
POST /report
Authorization: Bearer {token}

{
  "business_unit_id": 1,
  "status": 2,
  "month": 3,
  "year": 2024
}

Response:
{
  "filename": "referral_report_2024-03-15.xlsx",
  "type": "application/vnd.openxmlformats...",
  "size": 51200,
  "base64": "UEsDBBQACgAAAAAAeXdLTQAAAA..."
}
```

#### Error Handling

**Common HTTP Status Codes:**
- `200 OK`: Success
- `201 Created`: Resource created successfully
- `204 No Content`: Success with no data
- `400 Bad Request`: Invalid request format
- `401 Unauthorized`: Missing/invalid token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server-side error

**Error Response Format:**
```json
{
  "message": "Error description",
  "errors": {
    "field_name": ["Specific validation error"]
  }
}
```

### File Upload Format

Files are uploaded as base64-encoded strings:
```json
{
  "attachments": [
    {
      "name": "lab_results.pdf",
      "type": "application/pdf",
      "size": 14040,
      "base64": "JVBERi0xLjQKJaq..."
    }
  ]
}
```

### Email Configuration

The system uses PHPMailer for email notifications:
- SMTP host: Configured in `mailer.php`
- Port: 587 (TLS) or 465 (SSL)
- Authentication: Required
- Testing: Mailtrap integration for development

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: Cannot Login
**Symptoms:**
- Login page keeps reloading
- "Invalid credentials" error
- Token error

**Solutions:**
1. **Verify Credentials**: Ensure staff ID and department ID are correct
2. **Check Session**: Clear browser cookies and cache
3. **Token Expired**: Tokens expire after 24 hours - re-login required
4. **Database Connection**: Contact administrator if issue persists
5. **Browser Compatibility**: Try different browser

#### Issue: Cannot See Referrals
**Symptoms:**
- Dashboard shows "No results"
- "Unauthorized" error
- Empty referral list

**Solutions:**
1. **Business Unit Access**: Verify you're assigned to correct business unit
2. **Filters Active**: Check if filters are limiting results - reset filters
3. **Permissions**: Confirm you have read access to referrals
4. **Network Issues**: Check internet connection
5. **Token Validity**: Re-login to refresh token

#### Issue: Cannot Create Referral
**Symptoms:**
- Submit button doesn't work
- Validation errors
- "Forbidden" error

**Solutions:**
1. **Required Fields**: Ensure all mandatory fields are filled
2. **File Size**: Check attachments don't exceed size limits
3. **Form Validation**: Look for red highlighted fields
4. **Customer Not Found**: Search for patient or create new record
5. **Business Unit**: Verify you have create permissions
6. **JavaScript Errors**: Check browser console for errors

#### Issue: Files Won't Upload
**Symptoms:**
- Upload fails silently
- "File too large" error
- "Invalid file type" error

**Solutions:**
1. **File Size**: Reduce file size (max 5MB per file)
2. **File Type**: Use supported formats (PDF, JPG, PNG, DOCX)
3. **Browser**: Try different browser
4. **Connection**: Check internet stability
5. **Server Limits**: Contact administrator for PHP upload limits

#### Issue: Report Generation Fails
**Symptoms:**
- "No data found" message
- Excel file doesn't download
- Server error

**Solutions:**
1. **Date Range**: Adjust date filters - may be no data in range
2. **Filters**: Reset all filters and try again
3. **Permissions**: Verify report access for your role
4. **Browser**: Disable popup blockers
5. **Server**: Contact administrator if server error persists

#### Issue: Email Notifications Not Received
**Symptoms:**
- No notification emails
- Delayed emails
- Emails in spam folder

**Solutions:**
1. **Email Address**: Verify correct email in staff profile
2. **Spam Folder**: Check junk/spam folder
3. **Email Server**: Contact IT for SMTP server status
4. **Whitelist**: Add system email to safe senders list
5. **Configuration**: Administrator to check PHPMailer settings

#### Issue: Form Fields Not Appearing
**Symptoms:**
- Missing custom form fields
- Form doesn't load
- Blank form section

**Solutions:**
1. **Business Unit**: Verify correct recipient department selected
2. **Form Configuration**: Forms may not be configured for that department
3. **Cache**: Clear browser cache and reload
4. **JavaScript**: Check browser console for errors
5. **Administrator**: Contact admin to verify form setup

### Getting Help

#### Support Channels
1. **User Manual**: Review this document
2. **Administrator**: Contact your department administrator
3. **IT Helpdesk**: For technical issues
4. **Training**: Request additional training sessions

#### Information to Provide When Reporting Issues
- **User Details**: Staff ID, business unit
- **Issue Description**: What you were trying to do
- **Error Messages**: Exact text of any error messages
- **Steps to Reproduce**: What steps lead to the issue
- **Browser**: Name and version
- **Screenshots**: If applicable
- **Timestamp**: When the issue occurred

---

## Appendices

### Appendix A: Status Definitions

| Status ID | Status Name | Description |
|-----------|-------------|-------------|
| 1 | Open | New referral, awaiting initial review |
| 2 | In Progress | Currently being handled by receiving department |
| 3 | Referred | Forwarded to another department (multi-sequence) |
| 4 | Closed | Referral completed, patient care concluded |
| 5 | Not Present | Patient did not attend scheduled appointment |

### Appendix B: Priority Levels

| Priority ID | Priority Name | Description | Response Time |
|-------------|---------------|-------------|---------------|
| 1 | Low | Routine, non-urgent cases | Within 7 days |
| 2 | Medium | Standard urgent referrals | Within 48 hours |
| 3 | High | Emergency or critical cases | Immediate (same day) |

### Appendix C: Field Types for Forms

| Field Type | Description | Example Use Case |
|------------|-------------|------------------|
| text | Single-line text input | Patient complaint, medication name |
| textarea | Multi-line text input | Clinical notes, detailed history |
| checkbox | Multiple selection options | Symptoms checklist, interventions performed |
| radio | Single selection from options | Gender, yes/no questions |
| select | Dropdown list | Department selection, priority level |
| date | Date picker | Appointment date, symptom onset date |
| email | Email validation | Contact email, notification email |
| number | Numeric input only | Pain scale (1-10), dosage |
| file | File upload | Lab results, images |

### Appendix D: Keyboard Shortcuts

| Shortcut | Action | Page |
|----------|--------|------|
| `Ctrl + N` | New Referral | Dashboard |
| `Ctrl + R` | Refresh Dashboard | Dashboard |
| `Ctrl + F` | Focus Search Box | All pages |
| `Ctrl + S` | Save/Submit Form | Create/Edit forms |
| `Esc` | Close Modal | All modals |

### Appendix E: File Format Support

**Supported Upload Formats:**
- **Images**: JPG, JPEG, PNG, GIF, BMP
- **Documents**: PDF, DOC, DOCX, XLS, XLSX
- **Text**: TXT, RTF
- **Medical**: DICOM (if configured)

**Supported Export Formats:**
- **Reports**: Excel (.xlsx), PDF
- **Referral Letter**: PDF
- **Data Export**: CSV, JSON (via API)

### Appendix F: Database Tables Reference

**Core Tables:**
- `ref_business_unit`: Departments/business units
- `outlet`: Locations within business units
- `staff`: Staff members and authentication
- `customer`: Patient demographic data
- `referral_history`: Main referral records
- `ref_form`: Custom form definitions
- `ref_form_detail`: Form field configurations
- `ref_external_referee`: External healthcare providers
- `ref_external_organization`: External facilities
- `ref_attachment`: File metadata and storage

### Appendix G: API Quick Reference

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/auth` | POST | Login/Get JWT token | No |
| `/auth/verify` | POST | Verify token validity | No |
| `/business-units` | GET | List business units | Yes |
| `/referral` | GET | Get all referrals | Yes |
| `/referral` | POST | Create new referral | Yes |
| `/referral/{id}` | GET | Get single referral | Yes |
| `/referral` | PUT | Update referral | Yes |
| `/form/show/{id}` | GET | Get business unit forms | Yes |
| `/report` | POST | Generate Excel report | Yes |
| `/report/dashboard` | GET | Dashboard statistics | Yes |
| `/library/status` | GET | Get status options | Yes |
| `/library/priority` | GET | Get priority options | Yes |
| `/attachment/{id}` | GET | Download attachment | Yes |
| `/external-referees` | GET | List external referees | Yes |
| `/external-organizations` | GET | List external orgs | Yes |

### Appendix H: Validation Rules

**Patient IC Number:**
- Format: 12 digits (Malaysian IC)
- Example: 900101015678
- Validation: Checksum validation applied

**Email Address:**
- RFC 5322 compliant
- Example: user@example.com
- Required for email notifications

**Phone Numbers:**
- Format: 10-15 digits
- Example: 0123456789
- International format supported: +60123456789

**File Uploads:**
- Maximum file size: 5MB per file
- Maximum total size: 20MB per referral
- Allowed MIME types: Configured in backend
- File name sanitization applied

**Date Inputs:**
- Format: YYYY-MM-DD
- Future dates: Allowed for appointments
- Past dates: Allowed for symptom onset
- Birth dates: Must be in past

---

## Glossary

**API**: Application Programming Interface - allows communication between frontend and backend

**Base64**: Encoding scheme to convert binary data to text format for transmission

**Business Unit**: A department or division within the healthcare organization

**CRUD**: Create, Read, Update, Delete - basic database operations

**External Referral**: Referral to a healthcare facility outside the organization

**JWT**: JSON Web Token - secure authentication method

**Multi-sequence Referral**: Referral that involves multiple departments in a chain

**PHPMailer**: Email sending library for PHP

**REST**: Representational State Transfer - API architectural style

**SSO**: Single Sign-On - centralized authentication system

**Token**: Encrypted authentication credential with expiration time

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial user manual creation |

---

## Contact Information

For technical support, please contact your organization's IT department or system administrator.

**System Development:**
- Frontend Repository: `referral-module`
- Backend Repository: `referral-api`

---

**End of User Manual**

This manual is subject to updates as the system evolves. Please refer to the latest version for accurate information.
