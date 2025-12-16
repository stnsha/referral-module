# Referral Management System - Workflow Guide

## Quick Navigation
- [How to Create a New Referral](#1-how-to-create-a-new-referral)
- [How to View All Referrals](#2-how-to-view-all-referrals)
- [How to Use Dashboard Filters](#3-how-to-use-dashboard-filters)
- [How to Manage External Referees](#4-how-to-manage-external-referees-crud)
- [How to Use Admin Panel](#5-how-to-use-admin-panel-form-management)
- [How to Search by Customer](#6-how-to-search-by-customer)

---

## 1. How to Create a New Referral

### Overview
Create a new patient referral to send to another department or external facility.

### Step-by-Step Process

#### **STEP 1: Access the Create Referral Page**

1. Log in to the system
2. From the dashboard, click the **"New Referral"** button (top left)
3. You will be redirected to the referral creation form

**Page URL**: `create.php`

---

#### **STEP 2: Fill in Referral Details**

**2.1 Select "Referred From" (Your Department)**

- **Location**: Select your specific location from the dropdown
  - The business unit is automatically set to your department
  - Example: "Ground Floor", "Level 2", etc.

**2.2 Select "Referring To" (Destination Department)**

- **Business Unit**: Choose the department you're referring to
  - Example: "Alpro Physio", "Alpro Clinic", "Alpro Pharmacy"
- **Location**: Select the specific location within that department
  - Dropdown populates after selecting business unit
- **Recipient** (Optional): Assign to a specific staff member

**2.3 External Referral (If Applicable)**

If referring to an external facility:
1. Check the **"External Referral"** checkbox
2. The external referral section will appear
3. **Organization**: Select from dropdown or click "+ Add New Organization"
4. **Recipient**: Select external referee or click "+ Add New Recipient"

**Adding New Organization:**
- Click **"+ Add New Organization"**
- Fill in:
  - Organization Name (required)
  - Address
  - Postcode
  - State (select from dropdown)
  - Country (default: Malaysia)
- Click **Save** or **Cancel**

**Adding New Recipient:**
- Click **"+ Add New Recipient"**
- Fill in:
  - Name (required)
  - Email
  - Phone (required)
  - Position (required)
- Click **Save** or **Cancel**

---

#### **STEP 3: Enter Customer Information**

**3.1 Select Identification Type**

**Choose ID Type**:
- Select **NRIC** (default) for Malaysian Identity Card holders
- Select **Passport** for foreign nationals or passport holders

**Visual Indicators**:
- Both options show red asterisk (*) indicating required field
- Radio buttons appear at the top of customer information section

---

**3.2 Search for Existing Customer**

**For NRIC Customers**:
1. Select **NRIC** radio button (selected by default)
2. Enter the patient's **NRIC number** in the input field
3. Must be exactly **12 digits**
4. System validates format automatically
5. Press Tab or click outside field to trigger search

**For Passport Customers**:
1. Select **Passport** radio button
2. Enter the patient's **Passport number** in the input field
3. Minimum **6 characters** required
4. No strict format validation
5. Press Tab or click outside field to trigger search

**Search Results**:

**If customer exists**:
- ✓ Success message: "Customer found"
- ✓ All fields auto-populate from database:
  - Name, Phone, Email
  - Address
  - Age and Gender (behavior depends on ID type)
- ✓ Verify the information is correct
- ✓ Customer fields become editable (except IC/Passport number)

**If customer doesn't exist**:
- ✗ Error message: "Customer not found"
- ✗ **"Create New Customer"** link appears below the input field
- ✗ Click the link to open customer creation page in new tab
- ✗ After creating customer, return to referral page and search again

**Important Notes**:
- You **cannot create customers inline** on this page
- Must use the dedicated customer creation page via the link
- IC/Passport number cannot be edited once customer is found
- All other customer fields can be edited inline (auto-saved)

---

**3.3 Understanding Age and Gender Fields**

**For NRIC Customers**:
- **Age**: Automatically calculated from IC birth date
  - Field is **read-only** (gray background)
  - Cannot be manually edited
  - Updates automatically based on IC number
- **Gender**: Extracted from IC number
  - Field is **read-only** (gray background)
  - Determined by last digit of IC (odd=Male, even=Female)
  - Cannot be manually changed

**For Passport Customers**:
- **Age**: Retrieved from database
  - Field is **editable** (white background)
  - Can manually enter if empty
  - Updates saved to customer database
- **Gender**: Retrieved from database
  - Field is **editable** (white background)
  - Can manually enter Male/Female if empty
  - Updates saved to customer database

---

**3.4 Fill Customer Details**

**Required Fields** (marked with red asterisk *):
- **NRIC/Passport**: Identification number
  - NRIC: Exactly 12 digits
  - Passport: Minimum 6 characters
- **Name**: Full name
- **Phone No.**: Contact number
- **Address**: Complete address

**Optional Fields**:
- **Email**: Email address
- **Age**: Patient's age (auto-filled for NRIC, editable for Passport)
- **Gender**: Male/Female (auto-filled for NRIC, editable for Passport)

**Field Validation**:
- **NRIC**: Must be 12 digits, numeric only
- **Passport**: Minimum 6 characters, alphanumeric
- **Email**: Valid email format (if provided)
- **Phone**: Contact number required

---

**3.5 Edit Customer Information (Inline Editing)**

**Editable Fields**:
- Name, Phone, Email
- Age (Passport customers only)
- Gender (Passport customers only)
- Address

**How to Edit**:
1. Click on any editable field
2. Modify the information
3. Click outside the field or press Tab
4. Changes are **automatically saved** to customer database
5. Green background flash indicates successful save
6. Red background flash indicates save error

**Protected Field**:
- **IC/Passport Number**: Cannot be edited
  - This is the unique identifier
  - To change IC/Passport, must clear and search for different customer

**Edit Limitations**:
- Can only edit if customer exists (customer_id > 0)
- Cannot edit during customer creation mode
- Changes affect customer database, not just this referral

---

**3.6 Clear Customer Information**

**Use the "Clear" Button to**:
- Reset all customer fields to empty
- Remove search results
- Hide "Create New Customer" link
- Reset ID type to NRIC (default)
- Remove read-only restrictions from age/gender fields
- Start fresh with new customer search

**Steps**:
1. Click **"Clear"** button next to the input field
2. Confirmation dialog appears: "Are you sure you want to clear all customer information?"
3. Click **OK** to confirm or **Cancel** to keep data
4. If confirmed:
   - All fields cleared
   - Radio button resets to NRIC
   - Focus returns to input field
   - Success message: "Customer information cleared"

**When to Use Clear**:
- Wrong customer loaded
- Need to search for different patient
- Made errors and want to start over
- Switching between NRIC and Passport customers

---

**3.7 Customer Not Found - Creating New Customer**

**If Search Returns No Results**:

1. **Error Message Displays**: "Customer not found"
2. **"Create New Customer" Link Appears**: Blue button below input field
3. **Click the Link**:
   - Opens customer creation page in **new tab**
   - Current referral form data is preserved
   - Can switch back to referral tab anytime

4. **In Customer Creation Page**:
   - Fill all customer details
   - IC/Passport number pre-filled (if URL parameter passed)
   - Submit to create customer in database
   - Close tab when done

5. **Return to Referral Page**:
   - Switch back to referral tab
   - Search for customer again using same IC/Passport
   - Customer should now be found
   - Continue with referral creation

**Important**:
- Link URL: `../customer/add.php` (opens in new tab)
- No inline customer creation on referral page
- Must complete customer creation first
- Then return to referral to continue

---

**3.8 Validation Errors**

**Common Validation Messages**:

| Error | Cause | Solution |
|-------|-------|----------|
| "NRIC must be exactly 12 digits" | NRIC too short/long or contains non-numeric characters | Enter valid 12-digit NRIC |
| "Passport number seems too short" | Passport less than 6 characters | Enter valid passport (min 6 chars) |
| "Passport number cannot be empty" | Tried to submit with empty passport | Enter passport number |
| "Please search for a customer before submitting" | customer_id not set | Search for customer or create new one |
| "Customer not found" | IC/Passport not in database | Click "Create New Customer" link |
| "Invalid email format" | Email doesn't match pattern | Enter valid email (e.g., user@example.com) |

---

**Tips for Smooth Customer Entry**:

✓ **Always search first** before filling manually
✓ **Double-check IC/Passport** number before searching
✓ **Use NRIC for Malaysian citizens** (auto-calculates age/gender)
✓ **Use Passport for foreigners** (manual age/gender entry)
✓ **Create customer in separate tab** if not found
✓ **Inline edits save automatically** - watch for color feedback
✓ **Clear button resets everything** including ID type selection

---

#### **STEP 4: Add Attachments (Optional)**

1. Click **"Choose Files"** button or drag files
2. Select one or multiple files:
   - **Supported formats**: PNG, JPG, JPEG, PDF, DOC, DOCX
   - **Max file size**: 5MB per file
   - **Total limit**: 20MB per referral
3. Preview will show:
   - File name
   - File size
   - Thumbnail (for images)
   - Remove button (X) to delete

**Common Attachments**:
- Lab results
- X-ray images
- Medical reports
- Previous prescriptions
- Clinical notes

---

#### **STEP 5: Fill Referring Indication**

**Required Fields**:

**5.1 Purpose of Referral**
- Brief summary of why you're referring
- Example: "Patient requires physiotherapy assessment for lower back pain"

**5.2 Details of Patient's Condition**
- Detailed clinical description
- Current symptoms
- Relevant findings
- Example: "Patient presents with chronic lower back pain for 3 months, radiating to left leg. Pain scale 7/10. Limited range of motion observed."

**5.3 Relevant Medical History** (Optional)
- Past medical conditions
- Previous treatments
- Allergies
- Medications
- Example: "History of herniated disc L4-L5 (2020), currently on NSAIDs"

**5.4 Priority Level** (Required)
Select one:
- **Low** (Green): Routine, non-urgent cases
- **Medium** (Yellow): Standard urgent referrals (default)
- **High** (Red): Emergency or critical cases

---

#### **STEP 6: Complete Current/Past Treatments Section**

This section shows **dynamic forms** based on the selected recipient department.

**What appears here**:
- Custom fields configured for the recipient's business unit
- Each department has different forms
- Examples:
  - **Physiotherapy**: Pain level, targeted area, mobility status
  - **Pharmacy**: Current medications, drug allergies
  - **Clinic**: Vital signs, chief complaints

**How to fill**:
1. Fields appear automatically when you select "Referring To" department
2. Fill all **required fields** (marked with *)
3. Complete optional fields as needed
4. Different field types:
   - Text boxes
   - Checkboxes (multiple selections)
   - Radio buttons (single selection)
   - Dropdowns
   - Date pickers

**6.1 Additional Remarks** (Optional)
- Any extra information not covered above
- Special instructions
- Follow-up notes

---

#### **STEP 7: Review and Submit**

**Before Submitting**:
1. Review all information for accuracy
2. Check that all required fields (*) are filled
3. Verify customer details
4. Confirm correct recipient department

**Submit the Referral**:
1. Click the **"Submit"** button at the bottom
2. System validates all fields
3. If errors:
   - Error messages appear in red below fields
   - Scroll to first error
   - Correct the issues
   - Submit again
4. If successful:
   - Referral is created
   - Unique Referral ID generated (e.g., #REF0001)
   - Redirected to success page
   - Email notification sent to recipient
   - PDF generated (for external referrals)

**What Happens Next**:
- Referral appears in your "Sent" list
- Recipient sees it in their "Received" list
- Status is set to "Open"
- Audit trail begins tracking all changes

---

### Common Validation Errors

| Error | Solution |
|-------|----------|
| "Please select location" | Choose your location from dropdown |
| "Please select business unit" | Select destination department |
| "IC Number is required" | Enter patient's IC number |
| "Customer name is required" | Fill in patient's name |
| "Purpose of Referral is required" | Describe why you're referring |
| "Details of patient's condition is required" | Provide clinical details |
| "Please select priority" | Choose Low/Medium/High priority |
| "File size exceeds limit" | Reduce file size or remove files |

---

## 2. How to View All Referrals

### Overview
View all referrals related to your department in a comprehensive list with filtering options.

### Step-by-Step Process

#### **STEP 1: Access the Dashboard**

1. After login, you're automatically on the dashboard
2. Or click **"Referral Dashboard"** from navigation

**Page URL**: `index.php`

---

#### **STEP 2: Understanding the Dashboard Layout**

**Top Statistics Section**:
- **Total Referral Count**: Large number showing all referrals
- **Status Cards**: Five status categories with counts:
  - Open (Blue)
  - In Progress (Yellow)
  - Referred (Purple)
  - Closed (Green)
  - Not Present (Gray)
- **Priority Breakdown**: Low, Medium, High counts

**Business Unit Cards**:
- Shows each department with referral count
- Click card to filter by that department

---

#### **STEP 3: View Referral List**

**Referral Table Displays**:

| Column | Description |
|--------|-------------|
| **Referral ID** | Unique identifier (#REF0001) |
| **Patient Name** | Customer name |
| **From** | Originating department |
| **To** | Destination department |
| **Priority** | Low/Medium/High badge |
| **Status** | Current status badge |
| **Date** | Creation date |
| **Action** | View/Edit buttons |

---

#### **STEP 4: Filter by Referral Type**

At the top of the referral list, you'll see three radio buttons:

**Filter Options**:

**1. All** (Default)
- Shows every referral involving your business unit
- Includes both sent and received
- Count displayed: e.g., "All (45)"

**2. Sent**
- Referrals you/your department created
- Referrals originating from your department
- Count displayed: e.g., "Sent (23)"

**3. Received**
- Referrals sent TO your department
- Referrals you need to handle
- Count displayed: e.g., "Received (22)"

**How to Use**:
1. Click the desired radio button
2. Table automatically refreshes
3. Count updates in real-time

---

#### **STEP 5: View Individual Referral Details**

**Option 1: Click on Row**
- Click anywhere on the referral row
- Redirects to detailed view page

**Option 2: Click Action Button**
- Click the **"View"** button in the Action column
- Opens detailed view

**Page URL**: `view.php?id={referral_id}`

---

#### **STEP 6: Understanding Referral Details Page**

**Header Section**:
- Referral ID (e.g., #REF0001)
- Status badge (color-coded)
- Priority badge
- Action buttons:
  - Print Referral
  - Download PDF (external referrals)
  - Edit (if you have permission)

**Referral Information Sections**:

**1. Referral Details**
- **Referred From**: Business unit, location, staff name
- **Referring To**: Destination department, location
- **External Referral** (if applicable): Organization and referee

**2. Customer Information**
- Full name
- IC Number
- Age, Gender
- Contact: Phone, Email
- Address

**3. Referring Indication**
- Purpose of Referral
- Patient's Condition details
- Medical History
- Priority level
- Additional Remarks

**4. Custom Form Data**
- Department-specific fields and responses
- Shows all filled information

**5. Attachments**
- List of all uploaded files
- Click file name to view/download
- Shows file type and size

**6. Referral Timeline**
- Visual timeline of all status changes
- Shows dates, times, staff members
- Status notes for each change

**7. History Log**
- Complete audit trail
- All updates and changes
- Multi-sequence referral tracking

---

#### **STEP 7: Actions You Can Take**

**From the Detail View**:

**1. Update Status**
- Scroll to "Update Status" section
- Select new status from dropdown
- Add status notes (recommended)
- Click **"Update Status"** button

**2. Refer to Another Department** (Multi-sequence)
- If referral needs to go to additional department
- Fill in "Refer Another" section
- Select new business unit and location
- Add reason and condition
- Submit update

**3. Download Attachments**
- Click on any attachment name
- File opens in new tab or downloads
- View images and PDFs in browser

**4. Print Referral**
- Click **"Print Referral"** button
- Opens print preview
- Suitable for physical records

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + R` | Refresh dashboard |
| `Ctrl + F` | Focus search box |
| Click on row | View details |

---

## 3. How to Use Dashboard Filters

### Overview
Filter and search referrals to find exactly what you need using multiple criteria.

### Step-by-Step Process

#### **STEP 1: Access Filter Panel**

1. On the dashboard (`index.php`)
2. Look for the **Filter** section above the referral table
3. Multiple filter options available

---

#### **STEP 2: Filter by Referral Type**

**Radio Button Filters** (top of table):

```
○ All (45)    ○ Sent (23)    ○ Received (22)
```

**How to Use**:
- Click desired option
- Table updates instantly
- Count shows number of matching referrals

---

#### **STEP 3: Advanced Filtering Options**

**Available Filters**:

**1. Business Unit Filter**
- Dropdown of all departments
- Select specific department
- Shows only referrals involving that unit
- Example: "Alpro Physio", "Alpro Clinic"

**2. Location Filter**
- Dropdown of locations
- Requires business unit selection first
- Filter by specific location
- Example: "Ground Floor", "Level 2"

**3. Status Filter**
- Dropdown with all status options:
  - Open
  - In Progress
  - Referred
  - Closed
  - Not Present
  - All (default)
- Shows only referrals with selected status

**4. Priority Filter**
- Dropdown with priority levels:
  - Low
  - Medium
  - High
  - All (default)
- Shows only referrals with selected priority

**5. Date Range Filter**
- Click on date field
- Date range picker appears
- Select start date and end date
- Options:
  - Today
  - Yesterday
  - Last 7 Days
  - Last 30 Days
  - This Month
  - Last Month
  - Custom Range

**6. External Referrals Checkbox**
- Check to show only external referrals
- Uncheck to include all referrals

**7. Referred Status Checkbox**
- Check to show only multi-sequence referrals
- Shows referrals that were referred to additional departments

---

#### **STEP 4: Apply Filters**

**Method 1: Auto-Apply**
- Some filters apply automatically on selection
- Table refreshes immediately

**Method 2: Apply Button**
- After selecting all desired filters
- Click **"Apply"** or **"Filter"** button
- Table updates with filtered results

---

#### **STEP 5: Search Functionality**

**Search Box** (usually top-right):

**How to Use**:
1. Type in the search box
2. Search criteria:
   - Referral ID (e.g., "REF0001")
   - Patient Name
   - IC Number
3. Results filter as you type (live search)
4. Press Enter to execute search

**Example Searches**:
- "REF0001" - Find specific referral
- "Ahmad" - Find patient by name
- "900101" - Find by IC number

---

#### **STEP 6: Clear Filters**

**Reset All Filters**:
1. Click **"Clear"** or **"Reset"** button
2. All filters return to default
3. Shows all referrals again
4. Search box cleared

**Individual Filter Clear**:
- Click X on filter dropdown
- That specific filter resets
- Other filters remain active

---

#### **STEP 7: Pagination**

**Navigate Through Results**:

**Pagination Controls** (bottom of table):
- Shows: "Showing 1 to 10 of 45 entries"
- **Previous** button: Go to previous page
- **Page numbers**: Click to jump to specific page
- **Next** button: Go to next page
- **Items per page**: Dropdown to change number shown
  - Options: 10, 25, 50, 100

**How to Use**:
1. Select items per page from dropdown
2. Click page number to jump
3. Use Previous/Next for navigation

---

### Filter Combinations

**Example 1: Find Urgent Physio Referrals**
1. Business Unit: "Alpro Physio"
2. Priority: "High"
3. Status: "Open"
4. Click Apply
5. Result: All urgent open physio referrals

**Example 2: Last Month's Closed Referrals**
1. Status: "Closed"
2. Date Range: "Last Month"
3. Click Apply
4. Result: All referrals closed in previous month

**Example 3: External Referrals to Specific Hospital**
1. Check "External Referrals"
2. Type hospital name in search
3. Result: All external referrals to that hospital

---

### Visual Indicators

**Status Colors**:
- **Blue**: Open
- **Yellow**: In Progress
- **Purple**: Referred
- **Green**: Closed
- **Gray**: Not Present

**Priority Colors**:
- **Green**: Low
- **Yellow**: Medium
- **Red**: High

---

## 4. How to Manage External Referees (CRUD)

### Overview
Create, Read, Update, and Delete external referees and organizations for external referrals.

### Access External Referee Management

1. From main navigation or dashboard
2. Click **"External Referees"** or **"Manage External"**
3. Navigate to external referee page

**Page URL**: `externalReferee/index.php`

---

### 4.1 VIEW External Referees (READ)

#### **STEP 1: View All Referees**

**Table Display**:

| Name | Email | Phone | Organization | Position | Actions |
|------|-------|-------|--------------|----------|---------|
| Dr. Ahmad | ahmad@hospital.com | 012-3456789 | Hospital A | Specialist | Edit/Delete |

**Information Shown**:
- Referee name
- Email address
- Phone number
- Associated organization
- Position/title
- Action buttons

#### **STEP 2: Search Referees**

**Search Options**:
1. Use search box to find by name
2. Filter by organization
3. Filter by position
4. Results update as you type

---

### 4.2 CREATE New External Referee

#### **STEP 1: Click Add New Referee**

1. Click **"+ Add New Referee"** button
2. Referee form appears below the table

#### **STEP 2: Fill Referee Information**

**Required Fields** (*):
- **Name**: Full name of healthcare professional
  - Example: "Dr. Ahmad bin Abdullah"
- **Phone**: Contact number
  - Example: "012-3456789"
- **Organization**: Select from dropdown (required)
  - Must create organization first if not in list
- **Position**: Job title/specialization
  - Example: "Cardiologist", "Physiotherapist"

**Optional Fields**:
- **Email**: Professional email address
  - Example: "dr.ahmad@hospital.com"

#### **STEP 3: Select Organization**

**If Organization Exists**:
1. Click **Organization** dropdown
2. Select from list
3. Continue with other fields

**If Organization Doesn't Exist**:
1. Click **"+ Add New Organization"** button
2. Create organization first (see section 4.5)
3. Return to referee form
4. Select newly created organization

#### **STEP 4: Submit**

1. Review all information
2. Click **"Save"** or **"Create Referee"** button
3. If validation passes:
   - Success message appears
   - Referee added to table
   - Form clears
4. If validation fails:
   - Error messages shown in red
   - Correct errors and resubmit

---

### 4.3 UPDATE External Referee

#### **STEP 1: Find Referee to Edit**

1. Locate referee in the table
2. Use search if needed
3. Click **"Edit"** button in Actions column

#### **STEP 2: Edit Form Appears**

**Two Possible Layouts**:
- **Inline Edit**: Row becomes editable
- **Modal/Form**: Edit form opens

#### **STEP 3: Modify Information**

**Fields You Can Change**:
- Name
- Email
- Phone
- Organization
- Position

**How to Edit**:
1. Click on field to modify
2. Update the information
3. Tab to next field or click elsewhere

#### **STEP 4: Save Changes**

1. Click **"Save"** or **"Update"** button
2. If successful:
   - Success message
   - Table updates
   - Form closes
3. If errors:
   - Error messages shown
   - Fix issues and save again

**Cancel Option**:
- Click **"Cancel"** button
- Changes discarded
- Form closes without saving

---

### 4.4 DELETE External Referee

#### **STEP 1: Locate Referee**

1. Find referee in table
2. Click **"Delete"** button in Actions column

#### **STEP 2: Confirmation Dialog**

**Popup Appears**:
```
Are you sure you want to delete Dr. Ahmad bin Abdullah?
This action cannot be undone.

[Cancel]  [Delete]
```

#### **STEP 3: Confirm Deletion**

**Option 1: Confirm**
1. Click **"Delete"** button
2. Referee removed from database
3. Table refreshes
4. Success message: "Referee deleted successfully"

**Option 2: Cancel**
1. Click **"Cancel"** button
2. No changes made
3. Dialog closes

#### **Important Notes**:
- Cannot delete referee with active referrals
- System shows error if deletion blocked
- Consider deactivating instead of deleting

**Error Example**:
```
Cannot delete referee: 5 active referrals exist.
Please close all referrals first or archive the referee.
```

---

### 4.5 MANAGE External Organizations

#### **CREATE New Organization**

**STEP 1: Access Organization Form**

1. Click **"+ Add New Organization"** button
2. Organization form appears

**STEP 2: Fill Organization Details**

**Required Fields**:
- **Organization Name**: Official name
  - Example: "Hospital Kuala Lumpur"

**Optional Fields**:
- **Address**: Full address
  - Example: "Jalan Pahang, 50586 Kuala Lumpur"
- **Postcode**: Postal code
  - Example: "50586"
- **State**: Select from dropdown
  - Options: Johor, Kedah, Kelantan, Melaka, Negeri Sembilan, Pahang, Perak, Perlis, Pulau Pinang, Sabah, Sarawak, Selangor, Terengganu, Kuala Lumpur, Labuan, Putrajaya
- **Country**: Default is Malaysia
  - Can change if needed

**STEP 3: Save Organization**

1. Click **"Save"** button
2. Organization created
3. Now available in referee dropdown
4. Can proceed to create referee

#### **VIEW Organizations**

**Table Display**:

| Organization Name | Address | State | Actions |
|------------------|---------|-------|---------|
| Hospital Kuala Lumpur | Jalan Pahang, 50586 KL | Kuala Lumpur | Edit/Delete |

#### **UPDATE Organization**

1. Click **"Edit"** on organization row
2. Modify details
3. Click **"Save"**
4. Updates applied to all associated referees

#### **DELETE Organization**

1. Click **"Delete"** on organization
2. Confirm deletion
3. **Note**: Cannot delete if referees exist
4. Must delete/reassign referees first

---

### 4.6 Using External Referees in Referrals

#### **When Creating Referral**:

1. On create referral page
2. Check **"External Referral"** checkbox
3. **Organization** dropdown appears with all organizations
4. **Recipient** dropdown appears with referees from selected organization
5. Select organization first
6. Then select specific referee (optional)
7. Continue with referral creation

#### **External Referral Features**:
- PDF referral letter auto-generated
- Contains all patient and clinical information
- Sent to referee's email
- QR code included (if configured)
- Can track external referral status

---

## 5. How to Use Admin Panel (Form Management)

### Overview
Create and manage custom forms for each business unit to capture department-specific information.

### Access Admin Panel

1. From navigation, click **"Admin"** or **"Form Management"**
2. You'll see the form creation interface

**Page URL**: `admin.php`

**Permission Required**: Department Administrator or System Administrator

---

### 5.1 Understanding Dynamic Forms

**Purpose**:
- Each department has unique information needs
- Custom forms capture specific clinical data
- Forms appear in referral creation based on recipient department

**Example Use Cases**:
- **Physiotherapy**: Pain assessment, mobility scale, treatment goals
- **Pharmacy**: Medication list, allergies, prescription details
- **Laboratory**: Test types, fasting status, sample collection

---

### 5.2 CREATE New Form

#### **STEP 1: Access Form Creation**

1. On admin panel page
2. Form titled **"New Form"** displayed
3. Warning message shown:
   ```
   Note: Once a form is created, it cannot be updated or edited
   to avoid affecting existing referral records that use this form.
   ```

#### **STEP 2: Select Business Unit**

**Business Unit Dropdown**:
1. Click dropdown
2. Select department for this form
3. Example: "Alpro Physio", "Alpro Pharmacy"
4. This determines where the form appears

**Important**: Forms only show when referring TO this business unit

#### **STEP 3: Configure Form Properties**

**Label Name** (Required):
- Display name for the form section
- Example: "Physiotherapy Assessment", "Medication Review"
- Appears as heading in referral form

**Hide Label?** (Checkbox):
- Check to hide the label name
- Useful for simple forms
- Unchecked: Label displays
- Checked: Label hidden, only fields show

#### **STEP 4: Add Form Fields**

**Field Configuration**:

**A. Field Name** (Required):
- Internal identifier (no spaces)
- Use underscores for spaces
- Example: "pain_level", "mobility_score", "drug_allergies"
- Must be unique within form

**B. Required?** (Checkbox):
- Check if field must be filled
- Unchecked: Optional field
- Checked: Required (user must fill before submitting)

**C. Field Type** (Required):
- Select from dropdown
- Available types:

| Field Type | Description | Use Case |
|------------|-------------|----------|
| **text** | Single-line text input | Names, short answers |
| **textarea** | Multi-line text area | Clinical notes, descriptions |
| **checkbox** | Multiple selection checkboxes | Symptoms list, interventions |
| **radio** | Single selection radio buttons | Yes/No, gender, options |
| **select** | Dropdown list | Categories, predefined options |
| **date** | Date picker | Appointment dates, onset date |
| **email** | Email input with validation | Contact email |
| **number** | Numeric input only | Age, pain scale (1-10), dosage |
| **tel** | Phone number | Contact numbers |
| **url** | Website URL | External links |
| **color** | Color picker | Color coding |
| **file** | File upload | Additional documents |
| **button** | Clickable button | Actions |
| **range** | Slider input | Scales, ratings |
| **time** | Time picker | Appointment times |

#### **STEP 5: Add Field Options (For Select/Checkbox/Radio)**

**If Field Type is Checkbox, Radio, or Select**:

**Add Options**:
1. Click **"+ Add Option"** button
2. Enter option value
3. Click **"+ Add Option"** again for more
4. Example for pain_level:
   - Option 1: "Mild (1-3)"
   - Option 2: "Moderate (4-6)"
   - Option 3: "Severe (7-10)"

**Manage Options**:
- **Reorder**: Drag and drop options
- **Delete**: Click X button next to option
- **Edit**: Click on option text to modify

#### **STEP 6: Add Multiple Fields**

**To Build Complete Form**:
1. Fill first field configuration
2. Click **"+ Add Another Field"** button
3. New field section appears
4. Configure second field
5. Repeat for all needed fields

**Example Form Structure**:
```
Form: Physiotherapy Assessment
├── Field 1: Targeted Area (text, required)
├── Field 2: Pain Level (select, required)
│   ├── Mild (1-3)
│   ├── Moderate (4-6)
│   └── Severe (7-10)
├── Field 3: Mobility Status (radio, required)
│   ├── Independent
│   ├── Assisted
│   └── Non-ambulatory
├── Field 4: Previous Treatments (checkbox, optional)
│   ├── Physiotherapy
│   ├── Medication
│   ├── Surgery
│   └── None
└── Field 5: Clinical Notes (textarea, optional)
```

#### **STEP 7: Review and Save**

1. Review all fields
2. Check required fields are marked
3. Verify field names are unique
4. Click **"Submit"** or **"Create Form"** button
5. If successful:
   - Form created
   - Success message
   - Form now available for that business unit
6. If errors:
   - Error messages in red
   - Fix issues and resubmit

---

### 5.3 VIEW Existing Forms

#### **STEP 1: Access Forms List**

**Two Possible Views**:
- Table of all forms for your business unit
- Separate page for viewing forms

**Table Display**:

| Business Unit | Label Name | Fields Count | Actions |
|---------------|------------|--------------|---------|
| Alpro Physio | Physiotherapy Assessment | 5 | Preview/Delete |
| Alpro Pharmacy | Medication Review | 3 | Preview/Delete |

#### **STEP 2: Preview Form**

1. Click **"Preview"** button
2. Modal or new page opens
3. Shows how form appears in referral creation
4. All fields displayed
5. Close preview when done

**Preview Shows**:
- Form label name
- All fields in order
- Field types and options
- Required field markers (*)
- Exactly how users will see it

---

### 5.4 DELETE Form

#### **Important Restrictions**:
- Cannot edit forms after creation
- Cannot delete forms with active referrals
- Must archive instead

#### **STEP 1: Locate Form**

1. Find form in table
2. Click **"Delete"** button

#### **STEP 2: Confirm Deletion**

**If No Active Referrals**:
```
Are you sure you want to delete "Physiotherapy Assessment"?
This action cannot be undone.

[Cancel]  [Delete]
```

1. Click **"Delete"** to confirm
2. Form permanently removed
3. No longer available for new referrals

**If Active Referrals Exist**:
```
Cannot delete form: 15 active referrals use this form.
Please archive the form instead.

[OK]
```

1. Form cannot be deleted
2. Archive option available (set as inactive)
3. Existing referrals preserve their data

---

### 5.5 How Forms Appear in Referrals

#### **During Referral Creation**:

1. User selects recipient business unit
2. System checks for forms for that unit
3. Forms automatically load in "Current/Past Treatments" section
4. All fields appear dynamically
5. Required fields must be filled before submission

#### **Example Flow**:

**Scenario**: Referring to Alpro Physio

1. Select "Referring To": Alpro Physio
2. Page scrolls to "Current/Past Treatments"
3. Section shows: "Alpro Physio"
4. Form "Physiotherapy Assessment" appears
5. All 5 fields displayed:
   - Targeted Area (text box)
   - Pain Level (dropdown)
   - Mobility Status (radio buttons)
   - Previous Treatments (checkboxes)
   - Clinical Notes (text area)
6. User fills the form
7. Data saved with referral

---

### 5.6 Best Practices for Form Creation

#### **Field Naming**:
- Use clear, descriptive names
- No spaces (use underscores)
- Example: "chief_complaint", "vital_signs", "treatment_plan"

#### **Label Text**:
- Write clear, concise labels
- Example: "Chief Complaint", "Vital Signs", "Treatment Plan"

#### **Field Types**:
- Choose appropriate type for data
- Use **number** for numeric data
- Use **date** for dates
- Use **select** for predefined options
- Use **textarea** for long text

#### **Required Fields**:
- Mark only essential fields as required
- Too many required fields frustrate users
- Optional fields allow flexibility

#### **Options for Select/Radio/Checkbox**:
- Provide comprehensive options
- Include "Other" option if applicable
- Keep options clear and concise
- Order logically (alphabetical or by frequency)

#### **Form Length**:
- Don't make forms too long
- Group related fields
- 5-10 fields is optimal
- Create multiple forms if needed

---

## 6. How to Search by Customer

### Overview
Find all referrals associated with a specific patient using their IC number.

### Access Customer Search

1. From navigation, click **"Search by Customer"** or **"Customer Filter"**
2. Navigate to customer search page

**Page URL**: `customerFilter/index.php`

---

### 6.1 Search for Customer

#### **STEP 1: Access Search Page**

1. Click **"Search by Customer"** from menu
2. Page displays search interface
3. Title: "Search Referral by Customer"

#### **STEP 2: Enter Search Criteria**

**Search Box**:
- Label: "Enter Customer IC Number"
- Placeholder text guides you
- Enter patient's IC number
- Example: "900101015678"

**Search Methods**:
- **IC Number**: 12-digit identity card number (recommended)
- **Customer ID**: Internal system ID (if known)
- **Partial IC**: Can search with partial number

#### **STEP 3: Execute Search**

**Option 1: Click Search Button**
1. Enter IC number
2. Click **"Search"** button (with magnifying glass icon)
3. System queries database

**Option 2: Press Enter**
1. Type IC number
2. Press Enter key
3. Search executes automatically

**Loading State**:
- "Searching..." message appears
- Spinner animation shows
- Wait for results

---

### 6.2 View Search Results

#### **STEP 1: Results Table**

**If Referrals Found**:

Table displays all matching referrals:

| Referral ID | Referral Reason | Referred From | Referred To | Status | Action |
|-------------|-----------------|---------------|-------------|--------|--------|
| #REF0001 | Lower back pain | Alpro Clinic | Alpro Physio | In Progress | View |
| #REF0015 | Medication review | Alpro Physio | Alpro Pharmacy | Closed | View |

**Information Shown**:
- **Referral ID**: Unique identifier
- **Referral Reason**: Brief description
- **Referred From**: Originating department
- **Referred To**: Destination department
- **Status**: Current status with color badge
- **Action**: View button to see details

#### **STEP 2: Customer Information Banner**

**Top of Results** (if customer found):
```
Customer Information:
Name: Ahmad bin Ali
IC: 900101015678
Phone: 012-3456789
Email: ahmad@email.com
Age: 34 | Gender: Male
```

**Details Displayed**:
- Full name
- IC number
- Contact information
- Demographics

---

### 6.3 No Results Found

#### **If No Referrals Exist**:

**Message Display**:
```
No referrals found for IC: 900101015678

The customer may not have any referrals yet, or the IC number may be incorrect.

Suggestions:
• Verify the IC number is correct
• Check if customer exists in system
• Create new referral if needed
```

**Possible Reasons**:
1. IC number not in system
2. Customer has no referrals yet
3. Typo in IC number
4. Customer from different business unit

---

### 6.4 View Referral Details

#### **STEP 1: Click View Button**

1. From results table
2. Click **"View"** button in Action column
3. Redirects to referral detail page

**Page URL**: `view.php?id={referral_id}`

#### **STEP 2: Review Referral**

**Same as standard referral view**:
- Full referral details
- Customer information
- Clinical notes
- Attachments
- Timeline
- History

---

### 6.5 Clear Search

#### **Reset Search**:

1. Click **"Clear"** button
2. Search box clears
3. Results table resets
4. Shows default message:
   ```
   Enter search criteria to find referrals
   ```

**When to Clear**:
- Search for different customer
- Start new search
- Reset interface

---

### 6.6 Advanced Customer Search Features

#### **Search Tips**:

**Exact Match**:
- Enter complete 12-digit IC
- Most accurate results
- Example: "900101015678"

**Partial Match** (if supported):
- Enter partial IC
- May return multiple customers
- Example: "900101" might match several

**Search Filters** (if available):
- Filter by date range
- Filter by status
- Filter by department
- Combine with IC search

---

### 6.7 Common Use Cases

#### **Use Case 1: Patient Follow-up**
**Scenario**: Patient calls asking about referral status

**Steps**:
1. Get patient's IC number
2. Search by IC
3. View all patient's referrals
4. Find most recent referral
5. Check status and provide update

---

#### **Use Case 2: Referral History**
**Scenario**: Need patient's complete referral history

**Steps**:
1. Search by IC number
2. Results show all referrals (past and present)
3. Review each referral
4. Note dates and departments
5. Compile history for report

---

#### **Use Case 3: Duplicate Check**
**Scenario**: Before creating new referral, check for duplicates

**Steps**:
1. Search customer IC
2. Check if similar referral exists
3. Review open referrals
4. Decide if new referral needed
5. Avoid duplicate referrals

---

### 6.8 Customer Search Permissions

#### **Access Control**:

**Who Can Search**:
- All staff members
- Department administrators
- System administrators

**Business Unit Filtering**:
- Results filtered by your business unit
- See only relevant referrals
- System admins see all units

**Privacy**:
- Search logs maintained
- Audit trail for compliance
- HIPAA/data protection adherence

---

## Quick Reference Summary

### Key Pages

| Page | URL | Purpose |
|------|-----|---------|
| Dashboard | `index.php` | View all referrals, statistics |
| Create Referral | `create.php` | Create new referral |
| View Referral | `view.php?id=X` | See referral details |
| External Referees | `externalReferee/index.php` | Manage external contacts |
| Admin Panel | `admin.php` | Create custom forms |
| Customer Search | `customerFilter/index.php` | Search by IC number |
| Reports | `report.php` | Generate and export reports |

---

### Common Actions

| Action | Steps |
|--------|-------|
| **Create Referral** | Dashboard → New Referral → Fill Form → Submit |
| **View Referral** | Dashboard → Click Row → View Details |
| **Filter Referrals** | Dashboard → Select Filters → Apply |
| **Update Status** | View Referral → Update Status → Add Notes → Save |
| **Add External Referee** | External Referees → Add New → Fill Form → Save |
| **Create Form** | Admin Panel → Select Business Unit → Add Fields → Submit |
| **Search Customer** | Customer Search → Enter IC → Search → View Results |
| **Export Report** | Reports → Set Filters → Generate → Export Excel |

---

### Status Workflow

```
Open → In Progress → Closed
  ↓
Referred (Multi-sequence)
  ↓
Open (New department) → In Progress → Closed
```

---

### Priority Levels

| Priority | Color | When to Use |
|----------|-------|-------------|
| **Low** | Green | Routine, can wait 7+ days |
| **Medium** | Yellow | Standard urgent, 48 hours |
| **High** | Red | Emergency, same day |

---

### Required Fields Summary

**Every Referral Needs**:
- ✓ Referring From: Location
- ✓ Referring To: Business Unit, Location
- ✓ Customer: IC Number, Name, Phone, Address
- ✓ Referral: Reason, Patient Condition
- ✓ Priority: Low/Medium/High

**Optional But Recommended**:
- Medical History
- Attachments
- Customer Email
- Additional Remarks
- Assign to specific recipient

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + N` | New Referral |
| `Ctrl + R` | Refresh |
| `Ctrl + F` | Search/Filter |
| `Ctrl + S` | Save (in forms) |
| `Esc` | Close Modal |

---

### Support Contacts

**For Help**:
- User Manual: This document
- Administrator: Your department admin
- IT Helpdesk: For technical issues
- Training: Request additional sessions

---

### Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| Can't submit referral | Check all required fields (*) |
| Can't see referrals | Check filters, verify business unit access |
| Upload fails | Reduce file size (max 5MB) |
| Search no results | Verify IC number, check filters |
| Form not showing | Select recipient business unit first |
| Can't delete | Check for active referrals |

---

**End of Workflow Guide**

This guide provides step-by-step instructions for all major system workflows. For detailed technical information, refer to the complete User Manual (USER_MANUAL.md).

**Last Updated**: 2024
**Version**: 1.0
