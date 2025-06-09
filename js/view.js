$(document).ready(function () {
    $.ajax({
        url: 'api.php',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'get-referral',
            referral_id: referral_id
        }),
        success: function (response) {
            // console.log(response.data.referringIndication);

            var assigneeFrom = $('#assignee_from');
            var business_unit_from = $('#business_unit_from');
            var location_from = $('#location_from');

            assigneeFrom.val('');
            business_unit_from.val('');
            location_from.val('');

            var recipientTo = $('#recipient_to');
            var business_unit_to = $('#business_unit_to');
            var location_to = $('#location_to');

            recipientTo.val('');
            business_unit_to.val('');
            location_to.val('');

            response.data.referralDetails.forEach(function (item) {
                getStaff(item.staff_id, item.location, function (staffInfo) {
                    if (item.sequence == 1) {
                        assigneeFrom.val(staffInfo[0].nama_staff);
                        business_unit_from.val(staffInfo[0].department);
                        location_from.val(staffInfo[0].location);
                    } else {
                        recipientTo.val(staffInfo[0].nama_staff);
                        business_unit_to.val(staffInfo[0].department);
                        location_to.val(staffInfo[0].location);
                    }
                });
            })

            var referringIndication = response.data.referringIndication;

            var referral_reason = $('#referral_reason');
            var referral_condition = $('#referral_condition');
            var medical_history = $('#medical_history');

            referral_reason.val('');
            referral_condition.val('');
            medical_history.val('');

            referral_reason.val(referringIndication.referral_reason);
            referral_condition.val(referringIndication.referral_condition);
            medical_history.val(referringIndication.medical_history);
            $('input[name="priority"]').on('click', function (e) {
                e.preventDefault();
            });
            $('input[name="priority"][value="' + referringIndication.priority + '"]').prop('checked', true);

            var custid = referringIndication.customer_id;

            var customer_id = $('#customer_id');
            var customer_ic = $('#customer_ic');

            var customer_name = $('#customer_name');
            var customer_phone = $('#customer_phone');
            var customer_email = $('#customer_email');
            var customer_age = $('#customer_age');
            var customer_gender = $('#customer_gender');
            var customer_address = $('#customer_address');

            customer_id.val('');
            customer_ic.val('');
            customer_name.val('');
            customer_phone.val('');
            customer_email.val('');
            customer_age.val('');
            customer_gender.val('');
            customer_address.val('');


            getCustomer(custid, function (customer) {
                customer_id.val(customer[0].id);
                customer_ic.val(customer[0].ic);
                customer_name.val(customer[0].name);
                customer_phone.val(customer[0].phone);
                customer_email.val(customer[0].email);

                if (customer[0].birth_date) {
                    var parts = customer[0].birth_date.split('-');
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
                    customer_age.val(age);
                }

                customer_gender.val(customer[0].gender);
                customer_address.val(customer[0].address);
            });

            var bu_id = response.data.referringIndication.business_unit_id;
            var initialTreatments = response.data.initialTreatment;

            $('.content').hide();
            const targetDiv = $('.business-unit-' + bu_id);
            targetDiv.show();
            targetDiv.find('[data-required="true"]').prop('required', true);
            $('.content .form-container').remove();

            console.log(initialTreatments);
            initialTreatments.forEach(({ form_id, label_name, is_hidden, form_details, form_answer }) => {
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
                                'data-required': is_required,
                                disabled: true
                            });

                            if (option.is_answer) {
                                inputField.prop('checked', true);
                            }

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
                            'data-required': is_required,
                            disabled: true
                        });

                        input.append($('<option>', {
                            value: '',
                            text: label_name
                        }));

                        field_value.forEach(option => {
                            const optionEl = $('<option>', {
                                value: option.form_detail_id,
                                text: option.field_value
                            });

                            if (option.is_answer) {
                                optionEl.prop('selected', true);
                            }

                            input.append(optionEl);
                        });

                        wrapper.append(input);

                    } else {
                        wrapper = $('<div class="mb-2"></div>');
                        const label = $('<p class="r-text"></p>').html(labelText);
                        const value = form_answer || '';
                        input = $('<input>', {
                            type: field_type,
                            name: field_name,
                            class: 'form-control form-control-sm',
                            value: value,
                            'data-required': is_required,
                            readonly: true
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



        },
        error: function () {
            console.log("Failed to fetch referral details.");
        }
    });

    function getStaff(staff_id, location, callback) {
        $.ajax({
            url: 'backend.php',
            method: 'GET',
            data: {
                staff_id: staff_id,
                location: location,
                action: 'getStaff'
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

    function getCustomer(custid, callback) {
        $.ajax({
            url: 'backend.php?action=searchCustomer',
            method: 'POST',
            data: {
                customer_id: custid,
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

    function displayContent(bu_id, referringIndication) {
        $.ajax({
            url: 'api.php',
            type: 'POST',
            dataType: 'json',
            data: JSON.stringify({
                action: 'form-details',
                business_unit_id: bu_id
            }),
            success: function (response) {
                const forms = response.data.forms;
                $('.content').hide();
                const targetDiv = $('.business-unit-' + bu_id);
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
});
