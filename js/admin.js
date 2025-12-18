$(document).ready(function () {
    // Load business units
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'business-units'
        },
        success: function (data) {
            // console.log(data);
            var $select = $('#business-units');
            $select.empty().append('<option value="">Select Business Unit</option>');

            let isSelected = false;
            let businessUnitId = '';

            $.each(data.data, function (i, unit) {
                let selected = '';

                // Special logic for department 1 only (Audiology/Pharmacy department)
                if (department == 1) {
                    // Check if staff position contains 'audiologist' (any type)
                    if (staffPosition.toLowerCase().includes('audiologist')) {
                        // Audiologist -> assign to Alpro Audiology (ID = 1)
                        if (unit.id === 1) {
                            selected = 'selected';
                            businessUnitId = unit.id;
                            isSelected = true;
                        }
                    } else {
                        // Not audiologist -> assign to Alpro Pharmacy (ID = 5)
                        if (unit.id === 5 && unit.name.toLowerCase().includes('pharmacy')) {
                            selected = 'selected';
                            businessUnitId = unit.id;
                            isSelected = true;
                        }
                    }
                } else {
                    // For other departments, match by staff_department_id
                    if (unit.staff_department_id == department) {
                        selected = 'selected';
                        businessUnitId = unit.id;
                        isSelected = true;
                    }
                }

                $select.append('<option value="' + unit.id + '" ' + selected + '>' + unit.name + '</option>');
            });

            if (isSelected) {
                $select.prop('disabled', true);
                $select.val(businessUnitId);
            }
        },
        error: function () {
            $('#error-business-unit-from').text('Failed to load business units');
        }
    });

    // Load all forms
    loadAllForms();

    // Handle hide/unhide form button click
    $(document).on('click', '.btn-toggle-form', function () {
        var formId = $(this).data('id');
        var isHidden = $(this).data('hidden');
        var action = isHidden ? 'unhide-form' : 'hide-form';
        var confirmMessage = isHidden ? 'Are you sure you want to unhide this form?' : 'Are you sure you want to hide this form?';

        if (confirm(confirmMessage)) {
            $.ajax({
                url: 'referral/api-jwt.php',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    action: action,
                    form_id: formId
                }),
                success: function (response) {
                    console.log('Toggle form response:', response);
                    if (response.success) {
                        alert(response.message || (isHidden ? 'Form unhidden successfully!' : 'Form hidden successfully!'));
                        loadAllForms(); // Reload the forms table
                    } else {
                        alert('Failed: ' + (response.message || 'Unknown error'));
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error toggling form:', error);
                    alert('Error. Please try again.');
                }
            });
        }
    });
});

// Function to load all forms
function loadAllForms() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'all-forms'
        }),
        success: function (response) {
            console.log('All forms loaded:', response);
            var $tbody = $('#forms-tbody');
            $tbody.empty();

            if (response && response.data && response.data.forms && Array.isArray(response.data.forms) && response.data.forms.length > 0) {
                $.each(response.data.forms, function (i, form) {
                    var isHidden = form.is_hidden ? 'Yes' : 'No';
                    var rowNumber = i + 1; // Sequential number starting from 1

                    // Build nested table for form details
                    var detailsHtml = '<table class="table table-sm table-bordered mb-0">';
                    detailsHtml += '<thead class="table-secondary"><tr><th>Field Name</th><th>Field Type</th><th>Required</th><th>Values</th></tr></thead>';
                    detailsHtml += '<tbody>';

                    if (Array.isArray(form.form_details)) {
                        // Array format (form_id 16, 17)
                        $.each(form.form_details, function (j, detail) {
                            var isRequired = detail.is_required ? 'Yes' : 'No';
                            var fieldValue = detail.field_value || '-';
                            detailsHtml += '<tr>';
                            detailsHtml += '<td>' + detail.field_name + '</td>';
                            detailsHtml += '<td>' + detail.field_type + '</td>';
                            detailsHtml += '<td>' + isRequired + '</td>';
                            detailsHtml += '<td>' + fieldValue + '</td>';
                            detailsHtml += '</tr>';
                        });
                    } else if (typeof form.form_details === 'object') {
                        // Object format (form_id 18)
                        $.each(form.form_details, function (fieldName, detail) {
                            var isRequired = detail.is_required ? 'Yes' : 'No';
                            var fieldValue = '-';

                            if (Array.isArray(detail.field_value)) {
                                fieldValue = detail.field_value.map(function(v) {
                                    return v.field_value;
                                }).join(', ');
                            } else if (detail.field_value) {
                                fieldValue = detail.field_value;
                            }

                            detailsHtml += '<tr>';
                            detailsHtml += '<td>' + detail.field_name + '</td>';
                            detailsHtml += '<td>' + detail.field_type + '</td>';
                            detailsHtml += '<td>' + isRequired + '</td>';
                            detailsHtml += '<td>' + fieldValue + '</td>';
                            detailsHtml += '</tr>';
                        });
                    }

                    detailsHtml += '</tbody></table>';

                    // Determine button text and color based on is_hidden status
                    var buttonText = form.is_hidden ? 'Unhide' : 'Hide';
                    var buttonClass = form.is_hidden ? 'btn-primary' : 'btn-warning';

                    var row = '<tr>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + rowNumber + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + form.label_name + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + isHidden + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + detailsHtml + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' +
                        '<button class="btn btn-sm ' + buttonClass + ' btn-toggle-form" data-id="' + form.form_id + '" data-hidden="' + form.is_hidden + '">' + buttonText + '</button>' +
                        '</td>' +
                        '</tr>';
                    $tbody.append(row);
                });
            } else {
                $tbody.append('<tr><td colspan="5" class="text-center">No forms found</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading forms:', error);
            $('#forms-tbody').html('<tr><td colspan="5" class="text-center text-danger">Error loading forms</td></tr>');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const inputTypeSelect = document.getElementById('input_type');
    const dynamicValuesSection = document.getElementById('dynamic-values');
    const valueFieldsContainer = document.getElementById('value-fields');
    const addValueBtn = document.getElementById('addValueBtn');

    // Toggle the visibility of the dynamic value fields based on input type
    inputTypeSelect.addEventListener('change', function () {
        if (['checkbox', 'radio'].includes(inputTypeSelect.value)) {
            dynamicValuesSection.style.display = 'block';
        } else {
            dynamicValuesSection.style.display = 'none';
        }
    });

    // Add more value input fields when the "Add More" button is clicked
    addValueBtn.addEventListener('click', function () {
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-2');

        const newInputField = document.createElement('input');
        newInputField.type = 'text';
        newInputField.name = 'value_fields[]';
        newInputField.classList.add('form-control', 'form-control-sm');
        newInputField.placeholder = 'Enter value';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'remove-value-btn');
        removeBtn.textContent = 'Remove';

        inputGroup.appendChild(newInputField);
        inputGroup.appendChild(removeBtn);
        valueFieldsContainer.insertBefore(inputGroup, addValueBtn);
    });

    // Handle remove button clicks for value fields
    valueFieldsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-value-btn')) {
            const inputGroup = e.target.closest('.input-group');
            const remainingFields = valueFieldsContainer.querySelectorAll('.input-group');

            // Keep at least one field
            if (remainingFields.length > 1) {
                inputGroup.remove();
            } else {
                alert('At least one value field is required.');
            }
        }
    });

    const labelNameInput = document.getElementById('label_name');
    const fieldNameInput = document.getElementById('field_name');

    // Automatically update field_name when label_name is entered
    labelNameInput.addEventListener('input', function () {
        let labelValue = labelNameInput.value.trim();
        let fieldNameValue = labelValue.replace(/\s+/g, '_').toLowerCase(); // Replace spaces with underscores and convert to lowercase
        fieldNameInput.value = fieldNameValue;
    });
});

function validateForm(e) {
    let hasError = false;

    const businessUnit = document.getElementById('business-units');
    const labelName = document.getElementById('label_name');
    const fieldName = document.getElementById('field_name');
    const fieldType = document.getElementById('input_type');
    const valueFields = document.querySelectorAll('input[name="value_fields[]"]');

    const style = 'color: red; font-size: 12px; text-align: start;';

    document.getElementById('error-business-units').textContent = '';
    document.getElementById('error-label-name').textContent = '';
    document.getElementById('error-field-type').textContent = '';
    document.getElementById('error-value-field').textContent = '';

    if (businessUnit.value.trim() === '') {
        const errorDiv = document.getElementById('error-business-units');
        errorDiv.textContent = 'Business Unit is required.';
        errorDiv.style = style;
        hasError = true;
    }

    if (labelName.value.trim() === '') {
        const errorDiv = document.getElementById('error-label-name');
        errorDiv.textContent = 'Label Name is required.';
        errorDiv.style = style;
        hasError = true;
    }

    if (fieldName.value.trim() === '') {
        const fieldNameDiv = fieldName.closest('.col-sm-8');
        let error = fieldNameDiv.querySelector('.error-message');
        if (!error) {
            error = document.createElement('div');
            error.className = 'error-message';
            fieldNameDiv.appendChild(error);
        }
        error.textContent = 'Field Name is required.';
        error.style = style;
        hasError = true;
    }

    if (fieldType.value === '') {
        const errorDiv = document.getElementById('error-field-type');
        errorDiv.textContent = 'Field Type is required.';
        errorDiv.style = style;
        hasError = true;
    }

    if (fieldType.value === 'checkbox' || fieldType.value === 'radio') {
        const hasValue = Array.from(valueFields).some(input => input.value.trim() !== '');
        if (!hasValue) {
            const errorDiv = document.getElementById('error-value-field');
            errorDiv.textContent = 'At least one value is required.';
            errorDiv.style = style;
            hasError = true;
        }
    }

    if (hasError) {
        e.preventDefault();
    } else {
        // Create custom data array
        const formDataArray = {
            'business_unit_id': businessUnit.value, // Changed from business_unit to business_unit_id
            'label_name': labelName.value,
            'field_name': fieldName.value,
            'field_type': fieldType.value,
            'is_hidden': document.querySelector('input[name="is_hidden"]:checked') ? 1 : 0, // Use 1/0 instead of true/false
            'is_required': document.querySelector('input[name="is_required"]:checked') ? 1 : 0 // Use 1/0 instead of true/false
        };
        // Add value_fields if checkbox or radio
        if (fieldType.value === 'checkbox' || fieldType.value === 'radio') {
            formDataArray.value_fields = Array.from(valueFields)
                .map(field => field.value.trim())
                .filter(value => value !== '');
        }

        // Send custom data array via AJAX
        e.preventDefault(); // Prevent traditional form submission
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'create-form',
                formData: formDataArray
            }),
            success: function (data) {
                if (data.success) {
                    // console.log('Success:', data.id);
                    $('.success-message').text('Form submitted successfully! Form ID: ' + data.id).show();

                    // Reset the form
                    document.getElementById('admin-form').reset();

                    // Clear error messages
                    document.querySelectorAll('.error-message').forEach(function(el) {
                        el.textContent = '';
                    });

                    // Hide dynamic values section
                    document.getElementById('dynamic-values').style.display = 'none';

                    // Reset value fields to initial state (one field with remove button)
                    const valueFieldsContainer = document.getElementById('value-fields');
                    valueFieldsContainer.innerHTML = `
                        <div class="input-group mb-2">
                            <input type="text" name="value_fields[]" class="form-control form-control-sm" placeholder="Enter value">
                            <button type="button" class="btn btn-sm btn-danger remove-value-btn">Remove</button>
                        </div>
                        <button type="button" id="addValueBtn" class="btn btn-sm btn-primary">Add More</button>
                    `;

                    // Reload all forms table
                    loadAllForms();

                    // Re-enable business unit dropdown if it was disabled
                    $('#business-units').prop('disabled', false);

                    // Reload business units to restore selection
                    $.ajax({
                        url: 'referral/api-jwt.php',
                        type: 'POST',
                        dataType: 'json',
                        data: {
                            action: 'business-units'
                        },
                        success: function (data) {
                            var $select = $('#business-units');
                            $select.empty().append('<option value="">Select Business Unit</option>');

                            let isSelected = false;
                            let businessUnitId = '';

                            $.each(data.data, function (i, unit) {
                                let selected = '';

                                if (department == 1) {
                                    if (staffPosition.toLowerCase().includes('audiologist')) {
                                        if (unit.id === 1) {
                                            selected = 'selected';
                                            businessUnitId = unit.id;
                                            isSelected = true;
                                        }
                                    } else {
                                        if (unit.id === 5 && unit.name.toLowerCase().includes('pharmacy')) {
                                            selected = 'selected';
                                            businessUnitId = unit.id;
                                            isSelected = true;
                                        }
                                    }
                                } else {
                                    if (unit.staff_department_id == department) {
                                        selected = 'selected';
                                        businessUnitId = unit.id;
                                        isSelected = true;
                                    }
                                }

                                $select.append('<option value="' + unit.id + '" ' + selected + '>' + unit.name + '</option>');
                            });

                            if (isSelected) {
                                $select.prop('disabled', true);
                                $select.val(businessUnitId);
                            }
                        }
                    });

                    // Hide success message after 3 seconds
                    setTimeout(function() {
                        $('.success-message').fadeOut();
                    }, 3000);

                } else {
                    console.log('Error:', data)
                }
            },
            error: function (xhr, status, error) {
                logError(new Error('Form submission error'), { context: 'validateForm', status: status, error: error, responseText: xhr.responseText });
            }
        });


    }
}

// Attach the validateForm function to form submission
document.getElementById('admin-form').onsubmit = validateForm;

