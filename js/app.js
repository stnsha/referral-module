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

    markError("business-unit-from", !isInteger(form["business_unit_from"].value), "Select one business unit.");
    markError("assignee-from", !isInteger(form["assignee_from"].value), "Select one assignee.");
    markError("location-from", !isInteger(form["location_from"].value), "Select one location.");
    markError("business-unit-to", !isInteger(form["business_unit_to"].value), "Select one business unit.");
    markError("recipient-to", !isInteger(form["recipient_to"].value), "Select one recipient.");
    markError("location-to", !isInteger(form["location_to"].value), "Select one location.");
    markError("referral-reason", isEmpty(form["referral_reason"].value), "This field cannot be left blank.");
    markError("referral-condition", isEmpty(form["referral_condition"].value), "This field cannot be left blank.");
    markError("priority", isEmpty(form["priority"].value), "This field cannot be left blank.");
    markError("customer-ic", !isIC(getFieldValue("customer_ic")), "This field must be a 12-digit number.");
    markError("customer-name", isEmpty(form["customer_name"].value), "This field cannot be left blank.");
    markError("customer-phone", isEmpty(form["customer_phone"].value), "This field cannot be left blank.");
    var email = form["customer_email"].value;
    markError("customer-email", !isEmpty(email) && !isEmail(email), "Invalid email format.");
    markError("customer-address", isEmpty(form["customer_address"].value), "This field cannot be left blank.");

    // ✅ Only submit the form if there are no errors
    if (!hasError) {
        form.submit();
    }
}


let firstLoad = true;
$(document).ready(function () {
    $.ajax({
        url: 'backend.php?action=getBusinessUnits',
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            var busUnitFrom = $('#business_unit_from');
            console.log(response);
            $.each(response, function (index, businessUnit) {
                const selected = businessUnit.staff_department_id == department ? 'selected' : '';
                busUnitFrom.append('<option value="' + businessUnit.staff_department_id + '" ' + selected + '>' +
                    businessUnit.name + '</option>');
            });

            busUnitFrom.val(department);
            busUnitFrom.trigger('change'); // Trigger change to load assignees and display content

            var busUnitTo = $('#business_unit_to');
            $.each(response, function (index, businessUnit) {
                busUnitTo.append('<option value="' + businessUnit.id + '">' +
                    businessUnit.name + '</option>');
            });

            var busUnit = $('#business_unit');
            $.each(response, function (index, businessUnit) {
                busUnit.append('<option value="' + businessUnit.id + '">' +
                    businessUnit.name + '</option>');
            });

            // Function to display content based on business unit ID
            function displayContent(businessUnitId) {
                $('.content').hide(); // Hide all content divs
                $('.business-unit-' + businessUnitId).show(); // Show the relevant div
            }

            // Call displayContent on initial load if department is set
            if (department) {
                displayContent(department);
            }
        },
        error: function () {
            alert('Error loading business units');
        }
    });

    $('#business_unit_from').change(function () {
        var businessUnitId = $(this).val();

        // Display content based on the selected business unit
        displayContent(businessUnitId);

        if (businessUnitId) {
            $.ajax({
                url: 'backend.php?action=getAssignees',
                type: 'POST',
                data: {
                    business_unit_id: businessUnitId
                },
                dataType: 'json',
                success: function (response) {
                    var assigneeFrom = $('#assignee_from');
                    assigneeFrom.empty();
                    assigneeFrom.append('<option value="">Assignee</option>');

                    $.each(response, function (index, assignee) {
                        let selected = '';
                        if (firstLoad && String(assignee.id) === String(id_user)) {
                            selected = 'selected';
                        }

                        assigneeFrom.append('<option value="' + assignee.id + '" ' + selected + '>' +
                            assignee.name + '</option>');
                    });

                    firstLoad = false;
                },
                error: function () {
                    alert('Error loading assignees');
                }
            });
        } else {
            $('#assignee_from').empty().append('<option value="">Assignee</option>');
        }
    });

    // Function to display content based on business unit ID
    function displayContent(businessUnitId) {
        $.ajax({
            url: 'api.php',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                action: 'form-details',
                business_unit_id: businessUnitId
            }),
            success: function (data) {
                console.log(data);

                $('.content').hide();
                const targetDiv = $('.business-unit-' + businessUnitId);
                targetDiv.show();
                targetDiv.find('.form-container').remove();

                data.data.forEach(({ form_id, label_name, is_hidden, form_details }) => {
                    const formContainer = $('<div class="form-container mb-3"></div>');

                    form_details.forEach(detail => {
                        const { field_name, field_type, is_required, field_value } = detail;
                        const errorId = 'error-' + field_name;
                        const labelText = label_name + (is_required ? '<span style="color:red;">*</span>' : '');

                        let wrapper;
                        let input;

                        if ((field_type === 'radio' || field_type === 'checkbox') && Array.isArray(field_value)) {
                            wrapper = $('<div class="mb-2"></div>');
                            const label = $('<p class="r-text"></p>').html(labelText);
                            input = $('<div></div>');

                            field_value.forEach(option => {
                                const optionWrapper = $('<div class="form-check"></div>');
                                const inputField = $('<input>', {
                                    type: field_type,
                                    class: 'form-check-input border',
                                    name: field_name + (field_type === 'checkbox' ? '[]' : ''),
                                    value: option.field_value,
                                    required: is_required
                                });
                                const inputLabel = $('<label class="form-check-label r-text"></label>').text(option.field_value);
                                optionWrapper.append(inputField, inputLabel);
                                input.append(optionWrapper);
                            });

                            wrapper.append(label, input);

                        } else if (field_type === 'select' && Array.isArray(field_value)) {
                            wrapper = $('<div class="col mb-2"></div>');
                            input = $('<select>', {
                                name: field_name,
                                id: field_name,
                                class: 'form-select form-select-sm text-capitalize',
                                required: is_required
                            });

                            input.append($('<option>', {
                                value: '',
                                text: label_name
                            }));

                            field_value.forEach(option => {
                                input.append($('<option>', {
                                    value: option.field_value,
                                    text: option.field_value
                                }));
                            });

                            wrapper.append(input);

                        } else {
                            wrapper = $('<div class="mb-2"></div>');
                            const label = $('<p class="r-text"></p>').html(labelText);
                            input = $('<input>', {
                                type: field_type,
                                name: field_name,
                                class: 'form-control form-control-sm',
                                value: field_value || '',
                                required: is_required
                            });
                            wrapper.append(label, input);
                        }

                        const errorDiv = $('<div>', {
                            id: errorId,
                            class: 'error-message',
                            css: {
                                color: 'red',
                                fontSize: '12px'
                            }
                        });

                        wrapper.append(errorDiv);
                        formContainer.append(wrapper);
                    });

                    targetDiv.append(formContainer);
                });
            }
            ,
            error: function () {
                console.log('Failed to display form details');
            }
        });
    }

    $.ajax({
        url: 'backend.php?action=getLocations',
        type: 'POST',
        data: {
            assignee_id: id_user
        }, // Send the selected assignee ID
        dataType: 'json',
        success: function (response) {
            var locationFrom = $('#location_from');
            locationFrom.empty(); // Clear previous options
            locationFrom.append(
                '<option value="">Location</option>'); // Default option

            $.each(response, function (index, location) {
                locationFrom.append('<option value="' + location
                    .id + '">' +
                    location.comp_name + '</option>');
            });
        },
        error: function () {
            alert('Error loading locations');
        }
    });

    $('#business_unit_to').change(function () {
        var businessUnitId = $(this).val();

        if (businessUnitId) {
            $.ajax({
                url: 'backend.php?action=getAssignees',
                type: 'POST',
                data: {
                    business_unit_id: businessUnitId
                }, // Send the selected business unit ID
                dataType: 'json',
                success: function (response) {
                    var assigneeFrom = $('#recipient_to');
                    assigneeFrom.empty(); // Clear previous options
                    assigneeFrom.append(
                        '<option value="">Assignee</option>'); // Default option

                    $.each(response, function (index, assignee) {
                        assigneeFrom.append('<option value="' + assignee
                            .id + '" >' +
                            assignee.name + '</option>');
                    });
                },
                error: function () {
                    alert('Error loading assignees');
                }
            });
        } else {
            // If no business unit is selected, clear the assignee select
            $('#recipient_to').empty();
            $('#recipient_to').append('<option value="">Assignee</option>');
        }
    });

    $('#recipient_to').change(function () {
        var assigneeId = $(this).val();

        if (assigneeId) {
            $.ajax({
                url: 'backend.php?action=getLocations',
                type: 'POST',
                data: {
                    assignee_id: assigneeId
                }, // Send the selected assignee ID
                dataType: 'json',
                success: function (response) {
                    var locationFrom = $('#location_to');
                    locationFrom.empty(); // Clear previous options
                    locationFrom.append(
                        '<option value="">Location</option>'); // Default option

                    $.each(response, function (index, location) {
                        locationFrom.append('<option value="' + location
                            .id + '">' +
                            location.comp_name + '</option>');
                    });
                },
                error: function () {
                    alert('Error loading locations');
                }
            });
        } else {
            // If no assignee is selected, clear the location select
            $('#location_to').empty();
            $('#location_to').append('<option value="">Location</option>');
        }
    });

    $('input[name="customer_ic"]').on('change', function () {
        var icno = $(this).val().trim();
        if (icno === '') return;

        $.ajax({
            type: 'POST',
            url: 'backend.php?action=searchCustomer',
            data: {
                icno: icno
            },
            dataType: 'json',
            success: function (response) {
                if (response.length === 0) {
                    // alert('Customer not found');
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


});