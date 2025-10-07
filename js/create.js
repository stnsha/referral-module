let firstLoad = true;
$(document).ready(function () {
    localStorage.clear();
    sessionStorage.clear();
    $('#organization, #referee').prop('disabled', true);
    toggleExternalReferralSection();
    handleFilePreview('#attachmentInput', '#attachmentPreview');
    loadReferralPriorities();

    // Display business unit
    $.ajax({
        url: 'api-jwt.php',
        type: 'POST',
        data: { action: 'business-units' },
        success: function (response) {
            var busUnitFrom = $('#business_unit_from');

            let isSelected = false;
            let businessUnitId = '';

            $.each(response.data, function (index, businessUnit) {
                let selected = '';

                // Special logic for department 1 only (Audiology/Pharmacy department)
                if (department == 1) {
                    // Check if staff position contains 'audiologist' (any type)
                    if (staffPosition.toLowerCase().includes('audiologist')) {
                        // Audiologist -> assign to Alpro Audiology (ID = 1)
                        if (businessUnit.id === 1) {
                            console.log('DEBUG: Found Audiology unit, selecting it');
                            selected = 'selected';
                            businessUnitId = businessUnit.id;
                            isSelected = true;
                        }
                    } else {
                        // Not audiologist -> assign to Alpro Pharmacy (ID = 5) 
                        if (businessUnit.id === 5 && businessUnit.name.toLowerCase().includes('pharmacy')) {
                            selected = 'selected';
                            businessUnitId = businessUnit.id;
                            isSelected = true;
                        }
                    }
                } else {
                    // For other departments, match by staff_department_id
                    if (businessUnit.staff_department_id == department) {
                        selected = 'selected';
                        businessUnitId = businessUnit.id;
                        isSelected = true;
                    }
                }

                busUnitFrom.append(
                    '<option value="' + businessUnit.id + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            if (isSelected) {
                busUnitFrom.prop('disabled', true);
                $('input[name="business_unit_id_from"]').val(businessUnitId);
                // Set dropdown to the selected business unit ID
                busUnitFrom.val(businessUnitId);
            } else {
                // Fallback to department if no specific selection made
                busUnitFrom.val(department);
            }

            displayReferredFrom(businessUnitId);

            busUnitFrom.trigger('change'); // Trigger change to load assignees and display content

            var busUnitTo = $('#business_unit_to');
            $.each(response.data, function (index, businessUnit) {
                busUnitTo.append(
                    '<option value="' + businessUnit.staff_department_id + '" data-id="' + businessUnit.id + '" ' + '>' +
                    businessUnit.name + '</option>'
                );

            });

        },
        error: function () {
            alert('Error loading business units');
        }
    });

    // For Referred From
    function displayReferredFrom(businessUnitId) {
        const selectedOption = $(this).find(':selected');
        var refBusId = selectedOption.data('id');

        if (businessUnitId) {
            getStaffLocation(staffId, function (staffLocs) {

                var locationFrom = $('#location_from');
                locationFrom.empty();
                locationFrom.append('<option value="">Location</option>');

                let isSelected = false;
                let locationId = '';

                if (staffLocs.length > 1) {
                    $.each(staffLocs, function (index, location) {
                        locationFrom.append(
                            '<option value="' + location.id + '" ' + '>' +
                            location.code + '</option>'
                        );
                    });
                } else {
                    $.ajax({
                        url: 'backend.php?action=getLocations',
                        type: 'POST',
                        data: {
                            ref_bus_id: businessUnitId
                        },
                        dataType: 'json',
                        success: function (response) {
                            $.each(response, function (index, location) {
                                let selected = '';
                                if (String(location.id) === String(staffLocs[0].id)) {
                                    selected = 'selected';
                                    if (selected !== '') isSelected = true;
                                    if (selected != '') locationId = location.id;
                                }

                                locationFrom.append(
                                    '<option value="' + location.id + '" ' + selected + '>' +
                                    location.code + '</option>'
                                );
                            });

                            if (isSelected) {
                                locationFrom.prop('disabled', true);
                                $('input[name="location_id_from"]').val(locationId);

                            }
                        },
                        error: function () {
                            alert('Error loading locations');
                        }
                    });
                }
            });
        } else {
            $('#location_from').empty().append('<option value="">Location</option>');
        }
    }

    $('#location_from').change(function () {
        var locationId = $(this).val();
        $('input[name="location_id_from"]').val(locationId);
    });

    // For Referred From
    function getStaffLocation(staffId, callback) {
        $.ajax({
            url: 'backend.php',
            method: 'GET',
            data: {
                staff_id: staffId,
                action: 'getStaffLocation'
            },
            dataType: 'json',
            success: function (response) {
                callback(response);
            },
            error: function (xhr, status, error) {
                logError(new Error('Error fetching staff location'), { context: 'getStaffLocation', staffId: staffId, status: status, error: error });
                callback("Unknown");
            }
        });
    }

    // For Refer To
    $('#business_unit_to').change(function () {
        const selectedOption = $(this).find(':selected');
        var refBusId = selectedOption.data('id');
        var businessUnitId = $(this).val();
        // displayContent(businessUnitId);

        if (refBusId) {

            $('input[name="business_unit_id_to"]').val(refBusId);

            // Get locations for the selected business unit
            $.ajax({
                url: 'backend.php?action=getLocations',
                type: 'POST',
                data: {
                    ref_bus_id: refBusId
                },
                dataType: 'json',
                success: function (response) {
                    var locationTo = $('#location_to');
                    locationTo.empty();
                    locationTo.append('<option value="">Location</option>');

                    $.each(response, function (index, location) {
                        locationTo.append(
                            '<option value="' + location.id + '" ' + '>' +
                            location.code + '</option>'
                        );
                    });

                    firstLoad = false;
                },
                error: function () {
                    alert('Error loading locations');
                }
            });

            //Get forms for required treatment selection
            $.ajax({
                url: 'api-jwt.php',
                type: 'POST',
                data: { 
                    action: 'get-forms',
                    recipientBuId: refBusId
                },
                success: function (response) {
                    const requiredTreatmentDiv = $('#required-treatment');
                    requiredTreatmentDiv.empty();

                    $.each(response.data, function (index, form) {
                        const checkbox = `
                            <div class="form-check">
                                <input class="form-check-input border" type="checkbox" name="required_treatment[]" value="${form.form_id}" id="form_${form.form_id}" required="${form.is_required}">
                                <label class="form-check-label r-text" for="form_${form.form_id}">
                                    ${form.label_name} ${form.is_required ? '<span class="text-danger">*</span>' : ''}
                                </label>
                            </div>
                        `;
                        requiredTreatmentDiv.append(checkbox);
                    });

                },
                error: function () {
                    alert('Error loading business units');
                }
            });
        } else {
            $('#location_to').empty().append('<option value="">Location</option>');
        }
    });

    function formatIC(ic) {
        // Remove dashes and any non-numeric characters, keep only digits
        return ic.replace(/[^0-9]/g, '');
    }

    function extractAgeGenderFromIC(ic) {
        var icno = formatIC(ic);

        if (icno.length !== 12) {
            return; // Invalid IC format
        }

        var year = parseInt(icno.substring(0, 2));
        var month = parseInt(icno.substring(2, 4));
        var day = parseInt(icno.substring(4, 6));
        var lastDigit = parseInt(icno.substring(11, 12));

        var currentYear = new Date().getFullYear();
        var fullYear = year > (currentYear % 100) ? 1900 + year : 2000 + year;

        // Validate date
        var date = new Date(fullYear, month - 1, day);
        if (date.getFullYear() === fullYear && date.getMonth() === (month - 1) && date.getDate() === day) {
            // Extract gender (odd = Male, even = Female)
            var gender = (lastDigit % 2 === 0) ? 'Female' : 'Male';

            // Calculate age
            var today = new Date();
            var age = today.getFullYear() - fullYear;
            if (today.getMonth() < (month - 1) || (today.getMonth() === (month - 1) && today.getDate() < day)) {
                age--;
            }

            // Update age and gender fields
            $('input[name="customer_age"]').val(age);
            $('input[name="customer_gender"]').val(gender);
        }
    }

    $('input[name="customer_ic"]').on('change', function () {
        var icno = formatIC($(this).val().trim());
        if (icno === '') return;

        // Update the field with formatted IC (without dashes)
        $(this).val(icno);

        $.ajax({
            type: 'POST',
            url: 'backend.php?action=searchCustomer',
            data: {
                icno: icno
            },
            dataType: 'json',
            success: function (response) {
                if (response.length === 0) {
                    // Customer not found - show create customer dialog
                    showCreateCustomerDialog(icno);
                    return;
                }

                var customer = response[0];
                $('input[name="customer_id"]').val(customer.id || '');
                $('input[name="customer_name"]').val(customer.name || '');
                $('input[name="customer_phone"]').val(customer.phone || '');
                $('input[name="customer_email"]').val(customer.email || '');
                $('input[name="customer_gender"]').val(customer.gender || '');
                $('textarea[name="customer_address"]').val(customer.address || '');
                $('input[name="customer_ic"]').val(customer.ic || '');

                if (customer.birth_date) {
                    var parts = customer.birth_date.split('-');
                    var birthYear = parseInt(parts[0], 10);
                    var birthMonth = parseInt(parts[1], 10);
                    var birthDay = parseInt(parts[2], 10);

                    var today = new Date();
                    var age = today.getFullYear() - birthYear;
                    if (
                        today.getMonth() + 1 < birthMonth ||
                        (today.getMonth() + 1 === birthMonth && today.getDate() <
                            birthDay)
                    ) {
                        age--;
                    }
                    $('input[name="customer_age"]').val(age);
                } else {
                    $('input[name="customer_age"]').val('');
                }
            },
            error: function () {
                // alert('Error retrieving data');
            }
        });
    });

    // Inline edit functionality for customer fields
    function setupCustomerInlineEdit() {
        const customerFields = [
            'customer_ic',
            'customer_name',
            'customer_phone',
            'customer_email',
            'customer_age',
            'customer_gender',
            'customer_address'
        ];

        customerFields.forEach(function (fieldName) {
            const fieldSelector = fieldName === 'customer_address' ?
                'textarea[name="' + fieldName + '"]' :
                'input[name="' + fieldName + '"]';

            $(fieldSelector).on('blur', function () {
                const customerId = $('input[name="customer_id"]').val();
                const newValue = $(this).val().trim();
                const originalValue = $(this).data('original-value') || '';

                // Skip if no customer ID or no change
                if (!customerId || newValue === originalValue) {
                    return;
                }

                // Store original value if not already stored
                if ($(this).data('original-value') === undefined) {
                    $(this).data('original-value', originalValue);
                }

                // Show confirmation dialog
                const fieldLabel = getFieldLabel(fieldName);
                const confirmMessage = `Update ${fieldLabel} to "${newValue}"?`;

                if (!confirm(confirmMessage)) {
                    // User cancelled, revert to original value
                    $(this).val(originalValue);
                    return;
                }

                // Show loading state
                const $field = $(this);
                const originalBg = $field.css('background-color');
                $field.css('background-color', '#f8f9fa').prop('disabled', true);

                // Clear any existing error messages
                $('#error-' + fieldName.replace('_', '-')).text('');

                // Format IC if updating customer_ic field
                const valueToSend = fieldName === 'customer_ic' ? formatIC(newValue) : newValue;

                $.ajax({
                    type: 'POST',
                    url: 'backend.php?action=updateCustomer',
                    data: {
                        customer_id: customerId,
                        field: fieldName,
                        value: valueToSend
                    },
                    dataType: 'json',
                    success: function (response) {
                        if (response.success) {
                            // Update successful - store new original value
                            $field.data('original-value', newValue);
                            $field.css('background-color', '#d4edda'); // Green success

                            // Reset background after 1 second
                            setTimeout(function () {
                                $field.css('background-color', originalBg);
                            }, 1000);

                            // Show success message briefly
                            showFieldMessage(fieldName, response.message, 'success');
                        } else {
                            // Update failed - show error and revert
                            $field.val(originalValue);
                            showFieldMessage(fieldName, response.message, 'error');
                            $field.css('background-color', '#f8d7da'); // Red error

                            setTimeout(function () {
                                $field.css('background-color', originalBg);
                            }, 2000);
                        }
                    },
                    error: function () {
                        // Network error - revert value
                        $field.val(originalValue);
                        showFieldMessage(fieldName, 'Network error. Please try again.', 'error');
                        $field.css('background-color', '#f8d7da'); // Red error

                        setTimeout(function () {
                            $field.css('background-color', originalBg);
                        }, 2000);
                    },
                    complete: function () {
                        // Re-enable field
                        $field.prop('disabled', false);
                    }
                });
            });

            // Store original value when field receives focus
            $(fieldSelector).on('focus', function () {
                if ($(this).data('original-value') === undefined) {
                    $(this).data('original-value', $(this).val());
                }
            });
        });
    }

    function getFieldLabel(fieldName) {
        const labels = {
            'customer_ic': 'I/C No.',
            'customer_name': 'Name',
            'customer_phone': 'Phone No.',
            'customer_email': 'Email',
            'customer_age': 'Age',
            'customer_gender': 'Gender',
            'customer_address': 'Address'
        };
        return labels[fieldName] || fieldName;
    }


    // Initialize inline edit functionality
    setupCustomerInlineEdit();

    function showCreateCustomerDialog(icno) {
        const message = `Customer with I/C "${icno}" not found.\nWould you like to create a new customer?`;

        if (confirm(message)) {
            // Clear existing customer data
            $('input[name="customer_id"]').val('');
            $('input[name="customer_name"]').val('');
            $('input[name="customer_phone"]').val('');
            $('input[name="customer_email"]').val('');
            $('input[name="customer_age"]').val('');
            $('input[name="customer_gender"]').val('');
            $('textarea[name="customer_address"]').val('');

            // Pre-populate IC field
            $('input[name="customer_ic"]').val(icno);

            // Auto-extract and populate age and gender from IC
            extractAgeGenderFromIC(icno);

            // Clear any error messages
            $('.error-message').text('');

            // Show instruction message below I/C field
            showFieldMessage('customer-ic', 'Please fill in the customer details below', 'info');

            // Enable inline customer creation mode
            enableInlineCustomerCreation(icno);
        } else {
            // User cancelled - clear IC field
            $('input[name="customer_ic"]').val('');
        }
    }

    function enableInlineCustomerCreation(icno) {
        // Mark fields as being in creation mode
        const customerFields = ['customer_name', 'customer_phone', 'customer_email', 'customer_age', 'customer_gender', 'customer_address'];

        customerFields.forEach(function (fieldName) {
            const fieldSelector = fieldName === 'customer_address' ?
                'textarea[name="' + fieldName + '"]' :
                'input[name="' + fieldName + '"]';

            $(fieldSelector).data('creation-mode', true);
        });

        // Set up blur handler for customer creation
        $('.form-control, textarea').off('blur.customerCreation').on('blur.customerCreation', function () {
            if ($(this).data('creation-mode') && checkAllRequiredFieldsFilled(icno)) {
                $(this).off('blur.customerCreation');
                createCustomerInline(icno);
            }
        });
    }

    function checkAllRequiredFieldsFilled(icno) {
        const name = $('input[name="customer_name"]').val().trim();
        const phone = $('input[name="customer_phone"]').val().trim();
        const address = $('textarea[name="customer_address"]').val().trim();

        return icno && name && phone && address;
    }

    function createCustomerInline(icno) {
        const customerData = {
            ic: formatIC(icno),
            name: $('input[name="customer_name"]').val().trim(),
            phone: $('input[name="customer_phone"]').val().trim(),
            email: $('input[name="customer_email"]').val().trim(),
            age: $('input[name="customer_age"]').val().trim(),
            gender: $('input[name="customer_gender"]').val().trim(),
            address: $('textarea[name="customer_address"]').val().trim()
        };

        // Validation
        if (!customerData.name) {
            showFieldMessage('customer-name', 'Name is required', 'error');
            return;
        }
        if (!customerData.phone) {
            showFieldMessage('customer-phone', 'Phone is required', 'error');
            return;
        }
        if (!customerData.address) {
            showFieldMessage('customer-address', 'Address is required', 'error');
            return;
        }

        // Show loading state
        $('input[name="customer_name"]').css('background-color', '#f8f9fa').prop('disabled', true);
        showFieldMessage('customer-name', 'Creating customer...', 'info');

        $.ajax({
            type: 'POST',
            url: 'backend.php?action=createCustomer',
            data: customerData,
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    // Customer created successfully
                    $('input[name="customer_id"]').val(response.customer_id);

                    // Clear creation mode flags
                    const customerFields = ['customer_name', 'customer_phone', 'customer_email', 'customer_age', 'customer_gender', 'customer_address'];
                    customerFields.forEach(function (fieldName) {
                        const fieldSelector = fieldName === 'customer_address' ?
                            'textarea[name="' + fieldName + '"]' :
                            'input[name="' + fieldName + '"]';
                        $(fieldSelector).removeData('creation-mode');
                        $(fieldSelector).css('background-color', '#d4edda'); // Green success

                        // Reset background after 2 seconds
                        setTimeout(function () {
                            $(fieldSelector).css('background-color', '');
                        }, 2000);
                    });

                    // Show success message
                    showFieldMessage('customer-name', 'Customer created successfully!', 'success');

                    // Re-enable inline edit for the newly created customer
                    setupCustomerInlineEdit();

                } else {
                    // Creation failed
                    showFieldMessage('customer-name', response.message, 'error');
                    $('input[name="customer_name"]').css('background-color', '#f8d7da'); // Red error

                    setTimeout(function () {
                        $('input[name="customer_name"]').css('background-color', '');
                    }, 2000);
                }
            },
            error: function (xhr, status, error) {
                console.log('Create customer error:', {
                    xhr: xhr,
                    status: status,
                    error: error,
                    responseText: xhr.responseText
                });

                let errorMessage = 'Network error. Please try again.';

                if (xhr.status === 500) {
                    errorMessage = 'Server error: ' + (xhr.responseText || 'Internal server error');
                } else if (xhr.status === 404) {
                    errorMessage = 'Backend endpoint not found';
                } else if (xhr.status === 0) {
                    errorMessage = 'Connection failed - check network';
                } else if (xhr.responseText) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        errorMessage = response.message || errorMessage;
                    } catch (e) {
                        errorMessage = 'Server response: ' + xhr.responseText.substring(0, 100);
                    }
                }

                showFieldMessage('customer-name', errorMessage, 'error');
                $('input[name="customer_name"]').css('background-color', '#f8d7da'); // Red error

                setTimeout(function () {
                    $('input[name="customer_name"]').css('background-color', '');
                }, 2000);
            },
            complete: function () {
                $('input[name="customer_name"]').prop('disabled', false);
            }
        });
    }

    // Enhanced showFieldMessage function to handle info messages
    function showFieldMessage(fieldName, message, type) {
        const errorId = '#error-' + fieldName.replace('_', '-');
        const $errorElement = $(errorId);

        if (type === 'success') {
            $errorElement.css('color', 'green').text(message);
        } else if (type === 'info') {
            $errorElement.css('color', '#007bff').text(message);
        } else {
            $errorElement.css('color', 'red').text(message);
        }

        // Clear message after 5 seconds for info, 3 seconds for others
        const clearTime = type === 'info' ? 5000 : 3000;
        setTimeout(function () {
            $errorElement.text('');
        }, clearTime);
    }

    function toggleExternalReferralSection() {
        $('#external_referral').on('change', function () {
            if ($(this).is(':checked')) {
                $('#external-referral').removeClass('d-none');
                $('#business_unit_to, #location_to, #recipient_to').prop('disabled', true);
                $('#organization, #referee').prop('disabled', false);

                var externalOrganizations = [];

                $.ajax({
                    url: 'api-jwt.php',
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'external-organizations'
                    },
                    success: function (response) {
                        if (response && response.data) {
                            externalOrganizations = response.data;
                            var $org = $('#organization');
                            $org.empty().append('<option value="">Organization</option>');
                            externalOrganizations.forEach(function (org) {
                                $org.append('<option value="' + org.id + '">' + org.name + '</option>');
                            });
                        }
                        $('#referee').empty().append('<option value="">Recipient (Optional)</option>');
                        $('#organization, #referee').val('');
                    }
                });

                $('#organization').on('change', function () {
                    var orgId = $(this).val();
                    if (!orgId) {
                        $('#referee').empty().append('<option value="">Recipient (Optional)</option>');
                        return;
                    }
                    var org = externalOrganizations.find(function (o) { return o.id == orgId; });
                    if (org) {
                        var $ref = $('#referee');
                        $ref.empty().append('<option value="">Recipient (Optional)</option>');
                        if (org.referees && org.referees.length) {
                            org.referees.forEach(function (r) {
                                $ref.append('<option value="' + r.id + '">' + r.name + ' (' + r.position + ')</option>');
                            });
                        }
                    }
                });
            } else {
                $('#external-referral').addClass('d-none');
                $('#business_unit_to, #location_to, #recipient_to').prop('disabled', false);
            }
        });
    }

    // Load referral priorities from API
    function loadReferralPriorities() {
        $.ajax({
            url: 'api-jwt.php',
            type: 'POST',
            data: { action: 'referral-priority' },
            success: function (response) {
                if (response && response.data) {
                    const priorityContainer = $('.referral-priority');

                    // Clear existing priority options
                    priorityContainer.empty();

                    // Add new priority options from API
                    $.each(response.data, function (id, name) {
                        const isChecked = id === '2' ? 'checked' : ''; // Default to Medium priority
                        const priorityOption = `
                            <div class="form-check">
                                <input class="form-check-input border" type="radio" name="priority" value="${id}" ${isChecked}>
                                <label class="form-check-label r-text">
                                    ${name}
                                </label>
                            </div>
                        `;
                        priorityContainer.append(priorityOption);
                    });
                }
            },
            error: function () {
                console.log('Failed to load referral priorities');
            }
        });
    }
});

//Function to upload multiple files
let allUploadedFiles = [];
const allowedTypes = [
    'image/jpeg', 'image/png', 'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
];
const maxFileSize = 5 * 1024 * 1024; // 5MB

function handleFilePreview(inputSelector, previewSelector) {
    const uploadedFileNames = new Set();

    $(inputSelector).on('change', function () {
        const files = this.files;
        const preview = $(previewSelector);

        Array.from(files).forEach((file, index) => {
            const isValidType = allowedTypes.includes(file.type);
            const isValidSize = file.size <= maxFileSize;

            if (!isValidType) {
                alert(`${file.name} is not an allowed file type.`);
                return;
            }

            if (!isValidSize) {
                alert(`${file.name} exceeds the 5MB size limit.`);
                return;
            }

            if (file.name && !uploadedFileNames.has(file.name)) {
                uploadedFileNames.add(file.name);
                allUploadedFiles.push(file);

                const fileId = 'file-' + Date.now() + '-' + index;

                const fileItem = `
                    <div class="col mb-2" id="${fileId}">
                        <img src="img/document.png" alt="" style="width: 25px;">
                        <span class="r-text">${file.name}</span>
                        <button type="button" class="btn btn-sm btn-danger ms-2 remove-file" data-name="${file.name}" data-id="${fileId}">Remove</button>
                    </div>
                `;

                preview.append(fileItem);
            }
        });

        this.value = ''; // allow same file to be re-selected
    });

    // Handle remove
    $(document).on('click', '.remove-file', function () {
        const fileName = $(this).data('name');
        const fileId = $(this).data('id');

        // Remove from array
        allUploadedFiles = allUploadedFiles.filter(file => file.name !== fileName);
        // Remove from Set
        uploadedFileNames.delete(fileName);
        // Remove from DOM
        $('#' + fileId).remove();
    });
}

// Function to download PDF from base64 data
function downloadPdfBase64(base64Data, filename) {
    try {
        // Remove data URL prefix if present (data:application/pdf;base64,)
        const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

        // Decode base64 to binary
        const binaryString = atob(base64String);
        const bytes = new Uint8Array(binaryString.length);

        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Create blob with PDF MIME type
        const blob = new Blob([bytes], { type: 'application/pdf' });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;

        // Trigger download
        document.body.appendChild(link);
        link.click();

        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        console.log('PDF download initiated:', filename);

        // Show success message to user
        alert('External referral submitted successfully! PDF document has been downloaded.');

    } catch (error) {
        console.error('PDF download failed:', error);
        alert('Referral submitted successfully, but PDF download failed. Please contact support.');
    }
}

//Submission validation
function validateForm(event) {
    event.preventDefault();
    var form = document.forms["referral-form"];

    function getFieldValue(fieldName) {
        var field = form[fieldName];
        return field ? field.value : null;
    }

    function setErrorMessage(fieldName, message) {
        var errorElement = document.getElementById('error-' + fieldName);
        if (errorElement) {
            errorElement.innerHTML = message;
        }
    }

    var errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(function (element) {
        element.innerHTML = '';
    });

    function isEmpty(val) {
        return val === null || val.trim() === "";
    }

    function isInteger(val) {
        return /^\d+$/.test(val);
    }

    function isEmail(val) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
    }

    function isIC(val) {
        return /^\d{12}$/.test(val);
    }

    var hasError = false;

    function markError(fieldName, condition, message) {
        if (condition) {
            setErrorMessage(fieldName, message);
            hasError = true;
        }
    }

    markError("business-unit-from", !isInteger(form["business_unit_id_from"].value), "Select one business unit.");
    markError("location-from", !isInteger(form["location_id_from"].value), "Select one location.");

    //change to optional if true
    var isExternalReferral = $("#external_referral").is(":checked");
    markError("business-unit-to", !isExternalReferral && !isInteger(form["business_unit_to"].value), "Select one business unit.");
    markError("location-to", !isExternalReferral && !isInteger(form["location_to"].value), "Select one location.");

    //add validation if external referral = true
    markError("organization", isExternalReferral && isEmpty(form["organization"].value), "This field cannot be left blank.");

    markError("referral-reason", isEmpty(form["referral_reason"].value), "This field cannot be left blank.");
    markError("referral-condition", isEmpty(form["referral_condition"].value), "This field cannot be left blank.");
    markError("priority", isEmpty(form["priority"].value), "This field cannot be left blank.");
    markError("customer-ic", !isIC(getFieldValue("customer_ic")), "This field must be a 12-digit number.");
    markError("customer-name", isEmpty(form["customer_name"].value), "This field cannot be left blank.");
    markError("customer-phone", isEmpty(form["customer_phone"].value), "This field cannot be left blank.");
    var email = form["customer_email"].value;
    markError("customer-email", !isEmpty(email) && !isEmail(email), "Invalid email format.");
    markError("customer-address", isEmpty(form["customer_address"].value), "This field cannot be left blank.");

    if (!hasError) {
        $(this).find(':input').each(function () {
            if ($(this).is(':hidden')) {
                $(this).prop('required', false);
            }
        });

        const formData = new FormData(form);

        // Group required_treatment checkboxes into a single array
        const requiredTreatmentValues = [];
        $('input[name="required_treatment[]"]:checked').each(function() {
            requiredTreatmentValues.push($(this).val());
        });

        // Remove individual required_treatment[] entries
        formData.delete('required_treatment[]');

        // Add the grouped array as required_treatment
        if (requiredTreatmentValues.length > 0) {
            formData.append('required_treatment', JSON.stringify(requiredTreatmentValues));
        }

        allUploadedFiles.forEach(file => {
            formData.append('attachments[]', file);
        });

        // for (const [key, value] of formData.entries()) {
        //     if (value instanceof File) {
        //         console.log(`${key}:`, {
        //             name: value.name,
        //             size: value.size + ' bytes',
        //             type: value.type,
        //         });
        //     } else {
        //         console.log(`${key}: ${value}`);
        //     }
        // }

        fetch('post.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                const parsed = JSON.parse(data);
                const inner = JSON.parse(parsed.response);
                console.log('ID:', inner.id);
                console.log('HTTP Code:', parsed.httpCode);

                const successCode = parsed.httpCode;

                if (successCode === 200 || successCode === 201) {
                    sessionStorage.setItem('successMessage', inner.message);
                    allUploadedFiles = [];
                    $('#attachmentPreview').empty();

                    // Check if external referral with PDF
                    if (inner.pdf_base64) {
                        console.log('External referral PDF received, initiating download...');
                        downloadPdfBase64(inner.pdf_base64, `referral_${inner.id}.pdf`);
                        setTimeout(function () {
                            window.location.href = 'index.php';
                        }, 1000);
                    } else {
                        // Internal referral - go to QR page
                        window.location.href = 'qr.php?id=' + inner.id;
                    }

                } else {
                    console.log('Failed:', inner.message);
                }

            })
            .catch(error => {
                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });
            });

    }
}
