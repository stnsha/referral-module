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
    markError("assignee-from", !isInteger(form["assignee_id_from"].value), "Select one assignee.");
    markError("location-from", !isInteger(form["location_id_from"].value), "Select one location.");
    markError("business-unit-to", !isInteger(form["business_unit_to"].value), "Select one business unit.");
    // markError("recipient-to", !isInteger(form["recipient_to"].value), "Select one recipient.");
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

    if (!hasError) {
        $(this).find(':input').each(function () {
            if ($(this).is(':hidden')) {
                $(this).prop('required', false);
            }
        });

        const formData = new FormData(form);
        // for (const [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        fetch('post.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                const parsed = JSON.parse(data);
                const inner = JSON.parse(parsed.response);
                console.log('Message:', inner.message);
                console.log('HTTP Code:', parsed.httpCode);

                const successCode = parsed.httpCode;

                if (successCode === 200 || successCode === 201) {
                    sessionStorage.setItem('successMessage', inner.message);
                    window.location.href = 'index.php';
                } else {
                    console.log('Failed:', inner.message);
                }

            })
            .catch(error => {
                console.error('Error:', error);
            });

    }
}

let firstLoad = true;
$(document).ready(function () {
    $.ajax({
        url: 'backend.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'getBusinessUnits'
        },
        success: function (response) {
            var busUnitFrom = $('#business_unit_from');

            let isSelected = false;
            let businessUnitId = '';

            $.each(response, function (index, businessUnit) {
                const selected = businessUnit.staff_department_id == department ? 'selected' : '';
                if (selected !== '') isSelected = true;
                if (selected !== '') businessUnitId = businessUnit.id;

                busUnitFrom.append(
                    '<option value="' + businessUnit.staff_department_id + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            if (isSelected) {
                busUnitFrom.prop('disabled', true);
                $('input[name="business_unit_id_from"]').val(businessUnitId);
            }

            displayReferredFrom(businessUnitId);
            displayContent(businessUnitId);

            busUnitFrom.val(department);
            busUnitFrom.trigger('change'); // Trigger change to load assignees and display content

            var busUnitTo = $('#business_unit_to');
            $.each(response, function (index, businessUnit) {
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
        // var businessUnitId = $(this).val();

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
                            location.comp_name + '</option>'
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
                                    location.comp_name + '</option>'
                                );
                            });

                            if (isSelected) {
                                locationFrom.prop('disabled', true);
                                $('input[name="location_id_from"]').val(locationId);

                            }
                            getAssignee(locationId, function (assignees) {
                                var assigneeFrom = $('#assignee_from');
                                assigneeFrom.empty();
                                assigneeFrom.append('<option value="">Assignee</option>');

                                let isSelected = false;
                                let assigneeId = '';

                                $.each(assignees, function (index, assignee) {
                                    let selected = '';
                                    if (String(assignee.id) === String(staffId)) {
                                        selected = 'selected';
                                        if (selected !== '') isSelected = true;
                                        if (selected !== '') assigneeId = assignee.id;
                                    }

                                    assigneeFrom.append(
                                        '<option value="' + assignee.id + '" ' + selected + '>' +
                                        assignee.nama_staff + '</option>'
                                    );


                                });

                                if (isSelected) {
                                    assigneeFrom.prop('disabled', true);
                                    $('input[name="assignee_id_from"]').val(assigneeId);
                                }
                            });

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
        // console.log(locationId);
        if (locationId) {
            getAssignee(locationId, function (assignees) {
                var assigneeFrom = $('#assignee_from');
                assigneeFrom.empty();
                assigneeFrom.append('<option value="">Assignee</option>');

                let isSelected = false;
                let assigneeId = '';

                $.each(assignees, function (index, assignee) {
                    let selected = '';
                    if (String(assignee.id) === String(staffId)) {
                        selected = 'selected';
                        if (selected !== '') isSelected = true;
                        if (selected !== '') assigneeId = assignee.id;
                    }

                    assigneeFrom.append(
                        '<option value="' + assignee.id + '" ' + selected + '>' +
                        assignee.nama_staff + '</option>'
                    );
                });


                if (isSelected) {
                    assigneeFrom.prop('disabled', true);
                    $('input[name="location_id_from"]').val(locationId);
                    $('input[name="assignee_id_from"]').val(assigneeId);
                }
            });
        } else {
            $('#assignee_from').empty().append('<option value="">Assignees</option>');
        }
    });

    function getAssignee(locationId, callback) {
        $.ajax({
            url: 'backend.php',
            method: 'GET',
            data: {
                location_id: locationId,
                action: 'getAssignees'
            },
            dataType: 'json',
            success: function (response) {
                try {
                    callback(response);
                } catch (e) {
                    console.error('Callback failed:', e);
                }
            },
            error: function () {
                callback("Unknown");
            }
        });
    }
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
            error: function () {
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
                            location.comp_name + '</option>'
                        );
                    });

                    firstLoad = false;
                },
                error: function () {
                    alert('Error loading locations');
                }
            });
        } else {
            $('#location_to').empty().append('<option value="">Location</option>');
        }
    });

    // For Refer To
    $('#location_to').change(function () {
        var locationId = $(this).val();

        if (locationId) {
            $.ajax({
                url: 'backend.php',
                method: 'GET',
                data: {
                    location_id: locationId,
                    action: 'getAssignees'
                },
                dataType: 'json',
                success: function (response) {

                    var assigneeTo = $('#recipient_to');
                    assigneeTo.empty();
                    assigneeTo.append('<option value="">Assignee</option>');

                    $.each(response, function (index, assignee) {
                        assigneeTo.append(
                            '<option value="' + assignee.id + '" ' + '>' +
                            assignee.nama_staff + '</option>'
                        );
                    });

                },
                error: function () {
                    alert('Error loading assignees')
                }
            });
        }
    })

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
            success: function (response) {
                const forms = response.data.forms;
                $('.content').hide();
                const targetDiv = $('.business-unit-' + businessUnitId);
                targetDiv.show();
                targetDiv.find('[data-required="true"]').prop('required', true);
                $('.content .form-container').remove();

                forms.forEach(({ form_id, label_name, is_hidden, form_details }) => {
                    const formContainer = $('<div class="form-container mb-3"></div>');
                    const normalizedDetails = Array.isArray(form_details)
                        ? form_details
                        : Object.values(form_details || {});

                    normalizedDetails.forEach(detail => {
                        const { form_detail_id, field_name, field_type, is_required, field_value } = detail;

                        const errorId = 'error-' + field_name;
                        const labelText = label_name + (is_required ? '<span style="color:red;">*</span>' : '');

                        let wrapper;
                        let input;

                        wrapper = $('<div class="mb-2"></div>');

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
                                    value: option.form_detail_id,
                                    'data-required': is_required
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
                                'data-required': is_required
                            });

                            input.append($('<option>', {
                                value: '',
                                text: label_name
                            }));

                            field_value.forEach(option => {
                                input.append($('<option>', {
                                    value: option.form_detail_id,
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
                                'data-required': is_required
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

                        wrapper.append(input);
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

    $('#myTable').DataTable({
        ajax: {
            url: 'api.php',
            type: 'POST',
            data: { action: 'all-referral' },
            dataSrc: function (json) {
                // console.log('Raw response:', json);
                return json.data;
            }
        },
        columns: [
            { data: 'ref_id' },
            { data: 'reason' },
            { data: 'business_unit' },
            { data: 'status' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function (data, type, row) {
                    return `<a class="view-btn" type="button" data-id="${row.id}" href="view.php?id=${row.id}">View</a>`;
                }
            }
        ]
    });

});

