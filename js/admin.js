$(document).ready(function () {
    $.ajax({
        url: 'api.php',
        type: 'POST',
        dataType: 'json',
        data: {
            action: 'business-units'
        },
        success: function (data) {
            // console.log(data);
            var $select = $('#business-units');
            $select.empty().append('<option value="">Business Unit</option>');
            $.each(data.data, function (i, unit) {
                $select.append('<option value="' + unit.staff_department_id + '">' + unit.name + '</option>');
            });
        },
        error: function () {
            $('#error-business-unit-from').text('Failed to load business units');
        }
    });
});

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
        const newInputField = document.createElement('input');
        newInputField.type = 'text';
        newInputField.name = 'value_fields[]';
        newInputField.classList.add('form-control', 'form-control-sm', 'mb-2');
        newInputField.placeholder = 'Enter value';
        valueFieldsContainer.insertBefore(newInputField, addValueBtn);
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

        // Convert to FormData (for Laravel compatibility)
        const formData = new FormData();
        formData.append('action', 'create-form');


        // Append all fields to FormData
        Object.keys(formDataArray).forEach(key => {
            if (Array.isArray(formDataArray[key])) {
                // Handle arrays (e.g., value_fields)
                formDataArray[key].forEach((val, i) => {
                    formData.append(`${key}[${i}]`, val);
                });
            } else {
                formData.append(key, formDataArray[key]);
            }
        });

        // Send custom data array via AJAX using fetch
        e.preventDefault(); // Prevent traditional form submission
        $.ajax({
            url: 'api.php',
            type: 'POST',
            data: formData,
            processData: false,  // Required for FormData
            contentType: false,  // Required for FormData
            success: function (data) {
                if (data.success) {
                    // console.log('Success:', data.id);
                    $('.success-message').text('Form submitted successfully! Form ID: ' + data.id).show();

                } else {
                    console.log('Error:', data)
                }
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });


    }
}

// Attach the validateForm function to form submission
document.getElementById('admin-form').onsubmit = validateForm;

