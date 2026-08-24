let firstLoad = true;

$(document).ready(function () {
    localStorage.clear();
    sessionStorage.clear();
    $('#organization, #referee').prop('disabled', true);
    $('#add-new-recipient-btn').prop('disabled', true);
    toggleExternalReferralSection();
    handleFilePreview('#attachmentInput', '#attachmentPreview');
    loadReferralPriorities();

    // Initialize Select2 on the select fields
    const select2Config = {
        allowClear: true,
        width: '100%',
        dir: 'ltr',
        dropdownAutoWidth: false,
        minimumResultsForSearch: 5,
        templateResult: function (data) {
            if (!data.id) {
                return data.text;
            }
            var $result = $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
            return $result;
        },
        templateSelection: function (data) {
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        }
    };

    $('#location_from').select2({
        ...select2Config,
        placeholder: 'Location'
    });

    $('#business_unit_to').select2({
        ...select2Config,
        placeholder: 'Business Unit'
    });

    $('#location_to').select2({
        ...select2Config,
        placeholder: 'Location'
    });

    $('#organization').select2({
        ...select2Config,
        placeholder: 'Organization',
        minimumResultsForSearch: 0
    });

    $('#referee').select2({
        ...select2Config,
        placeholder: 'Recipient (Optional)',
        minimumResultsForSearch: 0
    });

    // Function to clear all customer information
    function clearCustomerInformation() {
        // Clear all customer fields
        $('input[name="customer_id"]').val('');
        $('input[name="customer_ic"]').val('');
        $('input[name="customer_name"]').val('');
        $('input[name="customer_phone"]').val('');
        $('input[name="customer_email"]').val('');
        $('input[name="customer_age"]').val('');
        $('input[name="customer_gender"]').val('');
        $('textarea[name="customer_address"]').val('');
        $('#customer_race').val('');
        $('#customer_nationality').val('');

        // Clear all error messages
        $('#error-customer-ic').text('');
        $('#error-customer-name').text('');
        $('#error-customer-phone').text('');
        $('#error-customer-email').text('');
        $('#error-customer-age').text('');
        $('#error-customer-gender').text('');
        $('#error-customer-address').text('');
        $('#error-customer-race').text('');
        $('#error-customer-nationality').text('');

        // Clear any stored original values for inline edit
        $('input[name="customer_ic"]').removeData('original-value');
        $('input[name="customer_name"]').removeData('original-value');
        $('input[name="customer_phone"]').removeData('original-value');
        $('input[name="customer_email"]').removeData('original-value');
        $('input[name="customer_age"]').removeData('original-value');
        $('input[name="customer_gender"]').removeData('original-value');
        $('textarea[name="customer_address"]').removeData('original-value');

        // Hide create customer link and autocomplete
        hideCreateCustomerLink();
        hideAutocomplete();

        // Reset save button state (stays visible if in new mode)
        $('#save-customer-btn').prop('disabled', false).text('Save Customer').css('background-color', '');
        $('#error-save-customer').text('');

        // Reset radio button to NRIC (default)
        $('input[name="id_type"][value="nric"]').prop('checked', true);

        // Remove readonly attributes (in case passport search set them)
        $('input[name="customer_age"]').prop('readonly', false);
        $('input[name="customer_gender"]').prop('readonly', false);

        // Focus back to IC field
        $('input[name="customer_ic"]').focus();

        // Show success message
        showFieldMessage('customer-ic', 'Customer information cleared', 'success');
    }

    // Clear customer information button
    $('#clear-customer-btn').on('click', function () {
        if (confirm('Are you sure you want to clear all customer information?')) {
            clearCustomerInformation();
        }
    });

    // Existing / New Customer mode toggle
    $('input[name="customer_mode"]').on('change', function () {
        var mode = $(this).val();

        // Clear fields and errors from previous state
        clearCustomerFields();
        $('#error-customer-ic, #error-customer-name, #error-customer-phone, ' +
          '#error-customer-email, #error-customer-age, #error-customer-gender, ' +
          '#error-customer-address, #error-customer-race, #error-customer-nationality, ' +
          '#error-save-customer').text('');
        hideCreateCustomerLink();
        hideAutocomplete();
        $('input[name="customer_age"]').prop('readonly', false);
        $('input[name="customer_gender"]').prop('readonly', false);
        $('input[name="id_type"][value="nric"]').prop('checked', true);

        // Show the form section
        $('#customer-form-section').show();

        if (mode === 'new') {
            $('#save-customer-section').show();
            $('#save-customer-btn').prop('disabled', false).text('Save Customer').css('background-color', '');
        } else {
            $('#save-customer-section').hide();
        }

        $('input[name="customer_ic"]').focus();
    });

    // Autocomplete helpers
    function hideAutocomplete() {
        $('#customer-autocomplete-list').hide().empty();
    }

    function showAutocomplete(results) {
        var $list = $('#customer-autocomplete-list');
        $list.empty();
        results.forEach(function (c) {
            var $item = $('<div>', {
                style: 'padding:8px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid #f3f3f3;',
                html: '<strong>' + $('<span>').text(c.name).html() + '</strong>' +
                      ' <span style="color:#888;font-size:12px;">' + $('<span>').text(c.ic).html() + '</span>'
            });
            $item.on('mouseenter', function () { $(this).css('background', '#f0f4ff'); })
                 .on('mouseleave', function () { $(this).css('background', ''); });
            $item.on('mousedown', function (e) {
                e.preventDefault();
                hideAutocomplete();
                $('input[name="customer_ic"]').val(c.ic).trigger('change');
            });
            $list.append($item);
        });
        $list.show();
    }

    // Autocomplete on input (existing mode only)
    var _acTimer = null;
    $(document).on('input', 'input[name="customer_ic"]', function () {
        var mode = $('input[name="customer_mode"]:checked').val();
        if (mode !== 'existing') { hideAutocomplete(); return; }

        var q = $(this).val().trim();
        clearTimeout(_acTimer);
        if (q.length < 2) { hideAutocomplete(); return; }

        _acTimer = setTimeout(function () {
            $.ajax({
                type: 'POST',
                url: 'referral/backend.php?action=searchCustomerAuto',
                data: { query: q },
                dataType: 'json',
                success: function (results) {
                    if (results && results.length > 0) {
                        showAutocomplete(results);
                    } else {
                        hideAutocomplete();
                    }
                },
                error: function () { hideAutocomplete(); }
            });
        }, 300);
    });

    // Dismiss autocomplete on outside click
    $(document).on('click', function (e) {
        if (!$(e.target).closest('#customer-autocomplete-list, input[name="customer_ic"]').length) {
            hideAutocomplete();
        }
    });

    // Save Customer button (New Customer mode)
    $('#save-customer-btn').on('click', function () {
        var idType = $('input[name="id_type"]:checked').val();
        var ic = $('input[name="customer_ic"]').val().trim();
        var name = $('input[name="customer_name"]').val().trim();
        var phone = $('input[name="customer_phone"]').val().trim();
        var email = $('input[name="customer_email"]').val().trim();
        var age = $('input[name="customer_age"]').val().trim();
        var gender = $('input[name="customer_gender"]').val().trim();
        var address = $('textarea[name="customer_address"]').val().trim();
        var raceNum = $('#customer_race').val();
        var nationality = $('#customer_nationality').val();

        var raceMap = {'1':'MALAY','2':'CHINESE','3':'INDIAN','4':'SABAH ETHNIC','5':'SARAWAK ETHNIC','6':'OTHERS'};
        var race = raceMap[raceNum] || '';

        $('#error-save-customer').css('color', 'red').text('');

        if (!ic || !name || !phone || !address || !race || !nationality) {
            $('#error-save-customer').text('Please fill in all required fields before saving.');
            return;
        }

        $('#save-customer-btn').prop('disabled', true).text('Saving...');

        $.ajax({
            type: 'POST',
            url: 'referral/backend.php?action=createCustomer',
            data: {
                ic: ic, name: name, phone: phone, email: email,
                address: address, age: age, gender: gender,
                id_type: idType, race: race, nationality: nationality
            },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    $('input[name="customer_id"]').val(response.customer_id);
                    $('#save-customer-btn').text('Saved').css('background-color', '#28a745');
                    setupCustomerInlineEdit();
                    $('#error-save-customer').css('color', 'green').text('Customer saved successfully.');
                } else {
                    $('#save-customer-btn').prop('disabled', false).text('Save Customer');
                    $('#error-save-customer').text(response.message || 'Failed to save customer.');
                }
            },
            error: function () {
                $('#save-customer-btn').prop('disabled', false).text('Save Customer');
                $('#error-save-customer').text('Network error. Please try again.');
            }
        });
    });

    // Display business unit
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'business-units' },
        success: function (response) {
            var busUnitFrom = $('#business_unit_from');

            let isSelected = false;
            let businessUnitId = '';

            $.each(response.data, function (index, businessUnit) {
                let selected = '';

                if (staffBusinessUnitId && businessUnit.id === staffBusinessUnitId) {
                    selected = 'selected';
                    businessUnitId = businessUnit.id;
                    isSelected = true;
                }

                busUnitFrom.append(
                    '<option value="' + businessUnit.id + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            // Outlet fallback: if no department match, check business unit outlet_id
            if (!isSelected && staffOutlet) {
                var staffOutletIds = staffOutlet.toString().split(',').map(function (id) { return parseInt(id.trim(), 10); });
                $.each(response.data, function (index, businessUnit) {
                    if (!isSelected && businessUnit.outlet_id && staffOutletIds.indexOf(parseInt(businessUnit.outlet_id, 10)) !== -1) {
                        isSelected = true;
                        businessUnitId = businessUnit.id;
                    }
                });
            }

            if (isSelected) {
                busUnitFrom.prop('disabled', true);
                $('input[name="business_unit_id_from"]').val(businessUnitId);
                busUnitFrom.val(businessUnitId);
            } else {
                // Fallback to department if no specific selection made
                busUnitFrom.val(department);
            }

            displayReferredFrom(businessUnitId);
            if (businessUnitId) {
                displayContent(businessUnitId);
            }

            busUnitFrom.trigger('change'); // Trigger change to load assignees and display content

            var busUnitTo = $('#business_unit_to');
            $.each(response.data, function (index, businessUnit) {
                busUnitTo.append(
                    '<option value="' + businessUnit.staff_department_id + '" data-id="' + businessUnit.id + '" ' + '>' +
                    businessUnit.name + '</option>'
                );

            });

            busUnitTo.trigger('change.select2');

        },
        error: function () {
            if (window.toast) {
                toast.error('Error loading business units');
            } else {
                alert('Error loading business units');
            }
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
                    locationFrom.trigger('change.select2');
                } else {
                    $.ajax({
                        url: 'referral/backend.php?action=getLocations',
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
                            locationFrom.trigger('change.select2');
                        },
                        error: function () {
                            if (window.toast) {
                                toast.error('Error loading locations');
                            } else {
                                alert('Error loading locations');
                            }
                        }
                    });
                }
            });
        } else {
            $('#location_from').empty().append('<option value="">Location</option>').trigger('change.select2');
        }
    }

    $('#location_from').change(function () {
        var locationId = $(this).val();
        $('input[name="location_id_from"]').val(locationId);
    });

    // For Referred From
    function getStaffLocation(staffId, callback) {
        $.ajax({
            url: 'referral/backend.php',
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

    // Function to display content based on business unit ID
    function displayContent(businessUnitId) {
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'form-details',
                business_unit_id: businessUnitId
            },
            success: function (response) {
                console.log('displayContent full response:', response);
                const forms = response.data ? response.data.forms : null;
                console.log('forms:', forms);

                // Ensure a container div exists for this business unit ID.
                // Static divs in create.php only cover IDs 1-7; dynamically create
                // one for any BU (e.g. HQ) that does not have a pre-existing div.
                if ($('.business-unit-' + businessUnitId).length === 0) {
                    var newDiv = $('<div>', { class: 'business-unit-' + businessUnitId + ' content' });
                    var lastContent = $('.content').last();
                    if (lastContent.length > 0) {
                        newDiv.insertAfter(lastContent);
                    }
                }

                $('.content').hide();
                // Remove consult_call_id wrapper on business unit switch; will be re-injected if form_id=1 is present
                $('#consult-call-id-wrapper').remove();
                const targetDiv = $('.business-unit-' + businessUnitId);
                targetDiv.show();
                targetDiv.find('[data-required="true"]').prop('required', true);
                $('.content .form-container').remove();

                if (!Array.isArray(forms) || forms.length === 0) {
                    console.warn('displayContent: no forms returned for BU', businessUnitId);
                    return;
                }
                forms.forEach(({ form_id, label_name, is_hidden, display_on, form_details, conditions }) => {
                    // Skip hidden forms
                    if (is_hidden === true) {
                        return;
                    }
                    // Skip forms that are reply-only
                    if (display_on === 'reply') {
                        return;
                    }
                    const isConditional = Array.isArray(conditions) && conditions.length > 0;
                    const triggerIds = isConditional ? conditions.map(function(c) { return c.trigger_form_detail_id; }) : [];
                    const formContainer = $('<div>', {
                        class: 'form-container mb-3',
                        'data-form-id': form_id,
                        'data-conditional': isConditional ? '1' : '0',
                        'data-triggers': JSON.stringify(triggerIds),
                        css: { display: isConditional ? 'none' : '' }
                    });
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

                        } else if (field_type === 'textarea') {
                            wrapper = $('<div class="mb-2"></div>');
                            const label = $('<p class="r-text"></p>').html(labelText);
                            input = $('<textarea>', {
                                name: field_name,
                                class: 'form-control form-control-sm',
                                rows: 10,
                                'data-required': is_required
                            }).text(field_value || '');
                            wrapper.append(label, input);
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
                    if (isConditional) {
                        formContainer.find('input, select, textarea').prop('disabled', true);
                    }
                    targetDiv.append(formContainer);

                    // Inject consult_call_id field after form_id=1 container
                    if (form_id === 1) {
                        var consultWrapper = $('<div>', { id: 'consult-call-id-wrapper', class: 'mb-2', css: { display: 'none' } });
                        consultWrapper.append($('<p>', { class: 'r-text' }).html('Consult Call ID<span style="color:red;">*</span>'));
                        consultWrapper.append($('<input>', {
                            type: 'text',
                            name: 'consult_call_id',
                            id: 'consult_call_id_visible',
                            class: 'form-control form-control-sm',
                            disabled: true
                        }));
                        consultWrapper.append($('<div>', {
                            id: 'error-consult-call-id',
                            class: 'error-message',
                            css: { color: 'red', fontSize: '12px' }
                        }));
                        formContainer.after(consultWrapper);

                        // Strip all non-digit characters on input (e.g. "#CC12" becomes "12")
                        $(document).off('input.consultCallId').on('input.consultCallId', '#consult_call_id_visible', function () {
                            var stripped = $(this).val().replace(/\D/g, '');
                            $(this).val(stripped);
                        });
                    }
                });

                // Attach change handler once after all forms are rendered
                $(document).off('change.formConditions').on('change.formConditions', 'input[type="radio"], input[type="checkbox"], select', function () {
                    evaluateConditions();
                });
            }
            ,
            error: function () {
                console.log('Failed to display form details');
            }
        });
    }

    function evaluateConditions() {
        var selectedIds = [];
        $('.content .form-container input[type="radio"]:checked, .content .form-container input[type="checkbox"]:checked').each(function () {
            var val = parseInt($(this).val(), 10);
            if (!isNaN(val)) {
                selectedIds.push(val);
            }
        });
        $('.content .form-container select').each(function () {
            var val = parseInt($(this).val(), 10);
            if (!isNaN(val)) {
                selectedIds.push(val);
            }
        });

        $('[data-conditional="1"]').each(function () {
            var triggers = [];
            try {
                triggers = JSON.parse($(this).attr('data-triggers') || '[]');
            } catch (e) {
                triggers = [];
            }
            var shouldShow = triggers.some(function (tid) {
                return selectedIds.indexOf(tid) !== -1;
            });
            $(this).toggle(shouldShow);
            $(this).find('input, select, textarea').prop('disabled', !shouldShow);
        });

        // Hardcoded: show consult_call_id input when form_id=1, form_details_id=3 is selected (Clinic)
        var clinicDetail3Checked = $('[data-form-id="1"] input[value="3"]:checked').length > 0;
        var consultWrapper = $('#consult-call-id-wrapper');
        if (clinicDetail3Checked) {
            consultWrapper.show();
            $('#consult_call_id_visible').prop('disabled', false);
        } else {
            consultWrapper.hide();
            $('#consult_call_id_visible').prop('disabled', true).val('');
        }
    }

    // For Refer To
    $('#business_unit_to').change(function () {
        const selectedOption = $(this).find(':selected');
        var refBusId = selectedOption.data('id');
        var businessUnitId = $(this).val();

        if (refBusId) {

            $('input[name="business_unit_id_to"]').val(refBusId);

            // Get locations for the selected business unit
            $.ajax({
                url: 'referral/backend.php?action=getLocations',
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

                    locationTo.trigger('change.select2');
                    firstLoad = false;
                },
                error: function () {
                    if (window.toast) {
                        toast.error('Error loading locations');
                    } else {
                        alert('Error loading locations');
                    }
                }
            });
        } else {
            $('#location_to').empty().append('<option value="">Location</option>').trigger('change.select2');
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
        var idNumber = $(this).val().trim();

        if (idNumber === '') {
            return;
        }

        // Get selected ID type (NRIC or Passport)
        var idType = $('input[name="id_type"]:checked').val();

        // Format ID number (remove dashes, spaces, special chars)
        if (idType === 'nric') {
            idNumber = formatIC(idNumber);  // Remove non-numeric
            $(this).val(idNumber);

            // Validate NRIC: must be exactly 12 digits
            if (idNumber.length !== 12) {
                showFieldMessage('customer-ic', 'NRIC must be exactly 12 digits', 'error');
                return;
            }
        } else {
            // Passport: just trim, no strict validation
            idNumber = idNumber.replace(/\s+/g, '');  // Remove spaces
            $(this).val(idNumber);

            // Optional: minimum length check for passport
            if (idNumber.length < 6) {
                showFieldMessage('customer-ic', 'Passport number seems too short', 'error');
                return;
            }
        }

        // Clear previous messages
        showFieldMessage('customer-ic', '', 'info');
        hideCreateCustomerLink();

        // In New Customer mode, only extract age/gender for NRIC — no search
        var customerMode = $('input[name="customer_mode"]:checked').val();
        if (customerMode === 'new') {
            if (idType === 'nric' && idNumber.length === 12) {
                extractAgeGenderFromIC(idNumber);
            }
            return;
        }

        // AJAX search for customer
        $.ajax({
            type: 'POST',
            url: 'referral/backend.php?action=searchCustomer',
            data: {
                icno: idNumber,
                id_type: idType  // Send ID type to backend
            },
            dataType: 'json',
            success: function (response) {
                if (response.length === 0) {
                    // CUSTOMER NOT FOUND - Show create link
                    showFieldMessage('customer-ic', 'Customer not found', 'error');
                    showCreateCustomerLink();

                    // Clear all customer fields
                    clearCustomerFields();
                    return;
                }

                // CUSTOMER FOUND - Populate all fields
                var customer = response[0];

                $('input[name="customer_id"]').val(customer.id || '');
                $('input[name="customer_name"]').val(customer.name || '');
                $('input[name="customer_phone"]').val(customer.phone || '');
                $('input[name="customer_email"]').val(customer.email || '');
                $('input[name="customer_gender"]').val(customer.gender || '');
                $('textarea[name="customer_address"]').val(customer.address || '');
                $('input[name="customer_ic"]').val(customer.ic || '');

                var cRace = customer.race || '';
                if(cRace=='MALAY'){cRace='1';} else if(cRace=='CHINESE'){cRace='2';} else if(cRace=='INDIAN'){cRace='3';} else if(cRace=='SABAH ETHNIC'){cRace='4';} else if(cRace=='SARAWAK ETHNIC'){cRace='5';} else if(cRace=='OTHERS'){cRace='6';}
                $('#customer_race').val(cRace);
                $('#customer_nationality').val(customer.nationality || '');

                // Age handling
                if (idType === 'nric' && customer.birth_date) {
                    // For NRIC: Calculate age from birth_date
                    var age = calculateAgeFromBirthDate(customer.birth_date);
                    $('input[name="customer_age"]').val(age);
                    $('input[name="customer_age"]').prop('readonly', true);
                } else {
                    // For Passport: Use age from DB, allow manual entry if empty
                    $('input[name="customer_age"]').val(customer.age || '');
                    $('input[name="customer_age"]').prop('readonly', false);
                }

                // Gender handling
                if (idType === 'nric') {
                    // For NRIC: Gender from DB (extracted during creation)
                    $('input[name="customer_gender"]').val(customer.gender || '');
                    $('input[name="customer_gender"]').prop('readonly', true);
                } else {
                    // For Passport: Use gender from DB, allow manual entry if empty
                    $('input[name="customer_gender"]').val(customer.gender || '');
                    $('input[name="customer_gender"]').prop('readonly', false);
                }

                showFieldMessage('customer-ic', 'Customer found', 'success');

                // Setup inline edit for all fields except IC
                setupCustomerInlineEdit();
            },
            error: function (xhr, status, error) {
                showFieldMessage('customer-ic', 'Search failed. Please try again.', 'error');
            }
        });
    });

    // Show "Create New Customer" link
    function showCreateCustomerLink() {
        $('#create-customer-link-container').show();
    }

    // Hide "Create New Customer" link
    function hideCreateCustomerLink() {
        $('#create-customer-link-container').hide();
    }

    // Calculate age from birth_date (YYYY-MM-DD)
    function calculateAgeFromBirthDate(birthDate) {
        if (!birthDate || birthDate === '0000-00-00') {
            return '';
        }

        var parts = birthDate.split('-');
        var birthYear = parseInt(parts[0], 10);
        var birthMonth = parseInt(parts[1], 10);
        var birthDay = parseInt(parts[2], 10);

        var today = new Date();
        var age = today.getFullYear() - birthYear;

        if (today.getMonth() + 1 < birthMonth ||
            (today.getMonth() + 1 === birthMonth && today.getDate() < birthDay)) {
            age--;
        }

        return age;
    }

    // Clear customer fields (for "not found" scenario)
    function clearCustomerFields() {
        $('input[name="customer_id"]').val('');
        $('input[name="customer_name"]').val('');
        $('input[name="customer_phone"]').val('');
        $('input[name="customer_email"]').val('');
        $('input[name="customer_age"]').val('');
        $('input[name="customer_gender"]').val('');
        $('textarea[name="customer_address"]').val('');
        $('#customer_race').val('');
        $('#customer_nationality').val('');

        // Remove readonly attributes
        $('input[name="customer_age"]').prop('readonly', false);
        $('input[name="customer_gender"]').prop('readonly', false);
    }

    // Inline edit functionality for customer fields
    function setupCustomerInlineEdit() {
        const customerFields = [
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
                    url: 'referral/backend.php?action=updateCustomer',
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

        // Inline update for race and nationality dropdowns
        var raceMap = {'1':'MALAY','2':'CHINESE','3':'INDIAN','4':'SABAH ETHNIC','5':'SARAWAK ETHNIC','6':'OTHERS'};
        var dropdownFields = [
            { id: 'customer_race', field: 'customer_race' },
            { id: 'customer_nationality', field: 'customer_nationality' }
        ];

        dropdownFields.forEach(function(item) {
            $('#' + item.id).on('change', function() {
                var customerId = $('input[name="customer_id"]').val();
                if (!customerId) {
                    return;
                }

                var numericVal = $(this).val();
                var valueToSend = (item.field === 'customer_race' && numericVal) ? (raceMap[numericVal] || numericVal) : numericVal;

                $.ajax({
                    type: 'POST',
                    url: 'referral/backend.php?action=updateCustomer',
                    data: {
                        customer_id: customerId,
                        field: item.field,
                        value: valueToSend
                    },
                    dataType: 'json',
                    success: function(response) {
                        if (response.success) {
                            showFieldMessage(item.field, response.message || 'Updated', 'success');
                        } else {
                            showFieldMessage(item.field, response.message || 'Update failed', 'error');
                        }
                    },
                    error: function() {
                        showFieldMessage(item.field, 'Network error. Please try again.', 'error');
                    }
                });
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

    // REMOVED: Inline customer creation functions
    // These functions have been removed as customer creation is now handled via a separate page
    // Removed functions: showCreateCustomerDialog, enableInlineCustomerCreation,
    // checkAllRequiredFieldsFilled, createCustomerInline

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
                    url: 'referral/api-jwt.php',
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
                            $org.trigger('change.select2');
                        }
                        $('#referee').empty().append('<option value="">Recipient (Optional)</option>').trigger('change.select2');
                        $('#organization, #referee').val('');
                    }
                });

                $('#organization').on('change', function () {
                    var orgId = $(this).val();
                    if (!orgId) {
                        $('#referee').empty().append('<option value="">Recipient (Optional)</option>').trigger('change.select2');
                        $('#add-new-recipient-btn').prop('disabled', true);
                        return;
                    }

                    // Enable add recipient button when organization is selected
                    $('#add-new-recipient-btn').prop('disabled', false);

                    var org = externalOrganizations.find(function (o) { return o.id == orgId; });
                    if (org) {
                        var $ref = $('#referee');
                        $ref.empty().append('<option value="">Recipient (Optional)</option>');
                        if (org.referees && org.referees.length) {
                            org.referees.forEach(function (r) {
                                $ref.append('<option value="' + r.id + '">' + r.name + ' (' + r.position + ')</option>');
                            });
                        }
                        $ref.trigger('change.select2');
                    }
                });
            } else {
                $('#external-referral').addClass('d-none');
                $('#business_unit_to, #location_to, #recipient_to').prop('disabled', false);
                $('#organization, #referee').prop('disabled', true);

                // Hide and reset new organization section when external referral is unchecked
                $('#new-organization-section').hide();
                $('#new-org-name').val('');
                $('#new-org-address').val('');
                $('#new-org-postcode').val('');
                $('#new-org-state').val('');
                $('#new-org-country').val('Malaysia');
                $('#error-new-org-name').html('');
                $('#add-new-org-btn').show();

                // Hide and reset new recipient section
                $('#new-recipient-section').hide();
                $('#new-recipient-name').val('');
                $('#new-recipient-email').val('');
                $('#new-recipient-phone').val('');
                $('#new-recipient-position').val('');
                $('#error-new-recipient-name').html('');
                $('#error-new-recipient-email').html('');
                $('#error-new-recipient-phone').html('');
                $('#error-new-recipient-position').html('');
                $('#add-new-recipient-btn').show().prop('disabled', true);
            }
        });
    }

    // Handle "Add New Organization" button click
    $('#add-new-org-btn').on('click', function () {
        $('#new-organization-section').show();
        $('#organization').val('').prop('disabled', true).trigger('change.select2');
        $('#referee').val('').prop('disabled', true).trigger('change.select2');
        $(this).hide();

        // Disable recipient dropdown and enable add recipient button when creating new org
        $('#add-new-recipient-btn').prop('disabled', false);
    });

    // Handle "Cancel" button click for new organization
    $('#cancel-new-org-btn').on('click', function () {
        $('#new-organization-section').hide();
        $('#organization').prop('disabled', false).trigger('change.select2');
        $('#referee').prop('disabled', false).trigger('change.select2');
        $('#add-new-org-btn').show();

        // Clear new organization fields
        $('#new-org-name').val('');
        $('#new-org-address').val('');
        $('#new-org-postcode').val('');
        $('#new-org-state').val('');
        $('#new-org-country').val('Malaysia');
        $('#error-new-org-name').html('');

        // Also close new recipient section if it was open (since it needs an organization)
        if ($('#new-recipient-section').is(':visible')) {
            $('#new-recipient-section').hide();
            $('#new-recipient-name').val('');
            $('#new-recipient-email').val('');
            $('#new-recipient-phone').val('');
            $('#new-recipient-position').val('');
            $('#error-new-recipient-name').html('');
            $('#error-new-recipient-email').html('');
            $('#error-new-recipient-phone').html('');
            $('#error-new-recipient-position').html('');
            $('#add-new-recipient-btn').show();
        }

        // Disable add recipient button if no organization selected
        if (!$('#organization').val()) {
            $('#add-new-recipient-btn').prop('disabled', true);
        }
    });

    // Handle "Add New Recipient" button click
    $('#add-new-recipient-btn').on('click', function () {
        // Check if organization is selected or new org form is visible
        var hasOrganization = $('#organization').val() || $('#new-organization-section').is(':visible');

        if (!hasOrganization) {
            alert('Please select or create an organization first before adding a recipient.');
            return;
        }

        $('#new-recipient-section').show();
        $('#referee').val('').prop('disabled', true).trigger('change.select2');
        $(this).hide();
    });

    // Handle "Cancel" button click for new recipient
    $('#cancel-new-recipient-btn').on('click', function () {
        $('#new-recipient-section').hide();
        $('#referee').prop('disabled', false).trigger('change.select2');
        $('#add-new-recipient-btn').show();

        // Clear new recipient fields
        $('#new-recipient-name').val('');
        $('#new-recipient-email').val('');
        $('#new-recipient-phone').val('');
        $('#new-recipient-position').val('');
        $('#error-new-recipient-name').html('');
        $('#error-new-recipient-email').html('');
        $('#error-new-recipient-phone').html('');
        $('#error-new-recipient-position').html('');
    });

    // Load referral priorities from API
    function loadReferralPriorities() {
        $.ajax({
            url: 'referral/api-jwt.php',
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

    // Optional URL parameter pre-population (e.g. from ConsultCall referral)
    (function () {
        var params = new URLSearchParams(window.location.search);
        var ic = params.get('customer_ic');
        var reason = params.get('referral_reason');
        var condition = params.get('referral_condition');
        var consultCallId = params.get('consult_call_id');
        var followUpId = params.get('follow_up_id');
        if (ic) {
            $('input[name="customer_mode"][value="existing"]').prop('checked', true);
            $('#customer-form-section').show();
            $('input[name="customer_ic"]').val(ic).trigger('change');
        }
        if (reason) {
            $('textarea[name="referral_reason"]').val(reason);
        }
        if (condition) {
            $('textarea[name="referral_condition"]').val(condition);
        }
        if (consultCallId) {
            $('#consult_call_id').val(consultCallId);
        }
        if (followUpId) {
            $('#follow_up_id').val(followUpId);
        }
    }());
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
    const $input = $(inputSelector);
    const $preview = $(previewSelector);

    // Create drag and drop zone wrapper
    const $dropZone = $input.closest('.mb-2');

    // Add drag and drop styles
    $dropZone.css({
        'position': 'relative',
        'border': '2px dashed #ccc',
        'border-radius': '8px',
        'padding': '20px',
        'text-align': 'center',
        'background-color': '#fafafa',
        'transition': 'all 0.3s ease',
        'cursor': 'pointer'
    });

    // Add helper text if it doesn't exist
    if (!$dropZone.find('.drop-zone-text').length) {
        $dropZone.prepend(`
            <div class="drop-zone-text" style="margin-bottom: 10px; color: #666;">
                <i class="bi bi-cloud-upload" style="font-size: 32px; display: block; margin-bottom: 8px;"></i>
                <p style="margin: 0; font-size: 14px;">Drag & drop files here or click to browse</p>
                <p style="margin: 5px 0 0 0; font-size: 12px; color: #999;">Max 5MB per file • PDF, Images, Word, Excel</p>
            </div>
        `);
    }

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        $dropZone.on(eventName, function(e) {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    // Highlight drop zone when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        $dropZone.on(eventName, function() {
            $(this).css({
                'border-color': '#135caa',
                'background-color': '#e8f4ff'
            });
        });
    });

    ['dragleave', 'drop'].forEach(eventName => {
        $dropZone.on(eventName, function() {
            $(this).css({
                'border-color': '#ccc',
                'background-color': '#fafafa'
            });
        });
    });

    // Handle dropped files
    $dropZone.on('drop', function(e) {
        const droppedFiles = e.originalEvent.dataTransfer.files;
        processFiles(droppedFiles);
    });

    // Handle file input change
    $input.on('change', function () {
        const files = this.files;
        processFiles(files);
        this.value = ''; // allow same file to be re-selected
    });

    // Make drop zone clickable to trigger file input
    $dropZone.on('click', function(e) {
        if (!$(e.target).hasClass('remove-file') && !$(e.target).closest('.remove-file').length) {
            $input.click();
        }
    });

    // Process files function
    function processFiles(files) {
        Array.from(files).forEach((file, index) => {
            const isValidType = allowedTypes.includes(file.type);
            const isValidSize = file.size <= maxFileSize;

            if (!isValidType) {
                if (window.toast) {
                    toast.error(`${file.name} is not an allowed file type.`);
                } else {
                    alert(`${file.name} is not an allowed file type.`);
                }
                return;
            }

            if (!isValidSize) {
                if (window.toast) {
                    toast.error(`${file.name} exceeds the 5MB size limit.`);
                } else {
                    alert(`${file.name} exceeds the 5MB size limit.`);
                }
                return;
            }

            if (file.name && !uploadedFileNames.has(file.name)) {
                uploadedFileNames.add(file.name);
                allUploadedFiles.push(file);

                const fileId = 'file-' + Date.now() + '-' + index;
                const fileSize = (file.size / 1024).toFixed(2); // Convert to KB
                const fileIcon = getFileIcon(file.type);

                const fileItem = `
                    <div class="uploaded-file-item" id="${fileId}" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: white;
                        border: 1px solid #e5e7eb;
                        border-radius: 6px;
                        margin-bottom: 8px;
                    ">
                        <div style="font-size: 24px;">${fileIcon}</div>
                        <div style="flex: 1; min-width: 0;">
                            <div style="font-size: 13px; font-weight: 500; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${file.name}</div>
                            <div style="font-size: 11px; color: #999; margin-top: 2px;">${fileSize} KB</div>
                        </div>
                        <button type="button" class="btn btn-sm btn-danger remove-file" data-name="${file.name}" data-id="${fileId}" style="padding: 4px 12px; font-size: 12px;">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;

                $preview.append(fileItem);

                // Show success toast
                if (window.toast) {
                    toast.success(`${file.name} added successfully`);
                }
            } else if (uploadedFileNames.has(file.name)) {
                if (window.toast) {
                    toast.warning(`${file.name} is already added`);
                }
            }
        });
    }

    // Get file icon based on file type
    function getFileIcon(fileType) {
        if (fileType.includes('pdf')) return '📄';
        if (fileType.includes('image')) return '🖼️';
        if (fileType.includes('word')) return '📝';
        if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
        return '📎';
    }

    // Handle remove
    $(document).on('click', '.remove-file', function (e) {
        e.stopPropagation();
        const fileName = $(this).data('name');
        const fileId = $(this).data('id');

        // Remove from array
        allUploadedFiles = allUploadedFiles.filter(file => file.name !== fileName);
        // Remove from Set
        uploadedFileNames.delete(fileName);
        // Remove from DOM
        $('#' + fileId).remove();

        // Show toast
        if (window.toast) {
            toast.info(`${fileName} removed`);
        }
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
        if (window.toast) {
            toast.success('External referral submitted successfully! PDF document has been downloaded.');
        } else {
            alert('External referral submitted successfully! PDF document has been downloaded.');
        }

    } catch (error) {
        console.error('PDF download failed:', error);
        if (window.toast) {
            toast.error('Referral submitted successfully, but PDF download failed. Please contact support.');
        } else {
            alert('Referral submitted successfully, but PDF download failed. Please contact support.');
        }
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
    // Check if new organization section is visible
    var isNewOrgVisible = $('#new-organization-section').is(':visible');
    var isNewRecipientVisible = $('#new-recipient-section').is(':visible');

    if (isExternalReferral) {
        if (isNewOrgVisible) {
            // Validate new organization name
            markError("new-org-name", isEmpty(form["new_org_name"].value), "Organization name is required.");
        } else {
            // Validate organization selection
            markError("organization", isEmpty(form["organization"].value), "This field cannot be left blank.");
        }

        // Validate new recipient if that section is visible
        if (isNewRecipientVisible) {
            markError("new-recipient-name", isEmpty(form["new_recipient_name"].value), "Name is required.");
            markError("new-recipient-phone", isEmpty(form["new_recipient_phone"].value), "Phone is required.");
            markError("new-recipient-position", isEmpty(form["new_recipient_position"].value), "Position is required.");

            var recipientEmail = form["new_recipient_email"].value;
            markError("new-recipient-email", !isEmpty(recipientEmail) && !isEmail(recipientEmail), "Invalid email format.");
        }
    }

    markError("referral-reason", isEmpty(form["referral_reason"].value), "This field cannot be left blank.");
    markError("referral-condition", isEmpty(form["referral_condition"].value), "This field cannot be left blank.");

    function hasGreeting(val) {
        return /\bdear\b/i.test(val);
    }
    markError("referral-reason", !isEmpty(form["referral_reason"].value) && hasGreeting(form["referral_reason"].value), "Do not include greetings such as \"Dear Doctor\".");
    markError("referral-condition", !isEmpty(form["referral_condition"].value) && hasGreeting(form["referral_condition"].value), "Do not include greetings such as \"Dear Doctor\".");
    markError("priority", isEmpty(form["priority"].value), "This field cannot be left blank.");
    // Get ID type and IC/Passport value
    var idType = $('input[name="id_type"]:checked').val();
    var idNumber = getFieldValue("customer_ic");

    // Validation based on ID type
    if (idType === 'nric') {
        // NRIC: Must be exactly 12 digits
        markError("customer-ic", !isIC(idNumber), "NRIC must be a 12-digit number.");
    } else {
        // Passport: Just check not empty
        markError("customer-ic", isEmpty(idNumber), "Passport number cannot be empty.");
    }

    // Validate customer_id - must exist and be a positive integer
    var customerId = getFieldValue("customer_id");
    var customerMode = $('input[name="customer_mode"]:checked').val();
    var customerIdMsg = (customerMode === 'new')
        ? 'Please save the new customer before submitting.'
        : 'Please search for a customer before submitting.';
    markError("customer-ic", !customerId || !isInteger(customerId) || parseInt(customerId) === 0, customerIdMsg);
    markError("customer-name", isEmpty(form["customer_name"].value), "This field cannot be left blank.");
    markError("customer-phone", isEmpty(form["customer_phone"].value), "This field cannot be left blank.");
    var email = form["customer_email"].value;
    markError("customer-email", !isEmpty(email) && !isEmail(email), "Invalid email format.");
    markError("customer-address", isEmpty(form["customer_address"].value), "This field cannot be left blank.");
    markError("customer-race", isEmpty(form["customer_race"].value), "This field cannot be left blank.");
    markError("customer-nationality", isEmpty(form["customer_nationality"].value), "This field cannot be left blank.");

    // Validate required dynamic form detail fields (rendered by displayContent)
    var processedNames = {};
    $('.form-container:visible').find('[data-required="true"]:not(:disabled), [data-required="1"]:not(:disabled)').each(function() {
        var $field = $(this);
        var rawName = $field.attr('name') || '';
        var baseName = rawName.replace(/\[\]$/, '');
        if (!baseName || processedNames[baseName]) { return; }
        processedNames[baseName] = true;

        var fieldType = ($field.attr('type') || $field.prop('tagName')).toLowerCase();
        var isValid;

        if (fieldType === 'radio' || fieldType === 'checkbox') {
            isValid = $('[name="' + rawName + '"]:checked').length > 0;
        } else {
            isValid = ($field.val() || '').trim() !== '';
        }

        markError(baseName, !isValid, 'This field is required.');
    });

    // Validate consult_call_id when shown for clinic form (form_id=1, form_details_id=3)
    if ($('#consult-call-id-wrapper').is(':visible')) {
        var consultCallIdVal = ($('#consult_call_id_visible').val() || '').replace(/\D/g, '');
        $('#consult_call_id_visible').val(consultCallIdVal);
        if (isEmpty(consultCallIdVal)) {
            markError("consult-call-id", true, "Consult Call ID is required.");
        } else if (!/^\d+$/.test(consultCallIdVal) || parseInt(consultCallIdVal) <= 0) {
            markError("consult-call-id", true, "Consult Call ID must be a positive number.");
        }
    }

    if (hasError) {
        var firstError = Array.from(document.querySelectorAll('.error-message')).find(function (el) {
            return el.textContent.trim() !== '';
        });
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    if (!hasError) {
        $(this).find(':input').each(function () {
            if ($(this).is(':hidden')) {
                $(this).prop('required', false);
            }
        });

        const formData = new FormData(form);

        allUploadedFiles.forEach(file => {
            formData.append('attachments[]', file);
        });

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    size: value.size + ' bytes',
                    type: value.type,
                });
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        // Show loading overlay
        showLoadingOverlay();

        // Disable submit button to prevent double submission
        $('input[type="submit"]').prop('disabled', true);

        fetch('referral/post.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                const parsed = JSON.parse(data);
                const inner = JSON.parse(parsed.response);
                console.log('ID:', inner.id);
                console.log('ID', inner.pdf_base64)
                console.log('HTTP Code:', parsed.httpCode);

                const successCode = parsed.httpCode;

                if (successCode === 200 || successCode === 201) {
                    sessionStorage.setItem('successMessage', inner.message);
                    allUploadedFiles = [];
                    $('#attachmentPreview').empty();

                    const redirectUrl = 'referral/successful.php?id=' + inner.id + '&sequence=1';
                    const ccIdVisible = parseInt($('#consult_call_id_visible').val());
                    const ccId = parseInt($('#consult_call_id').val());
                    const fuId = parseInt($('#follow_up_id').val());
                    const locationTo = $('#location_to').val();

                    if (ccIdVisible && inner.id) {
                        // User manually entered consult call ID via the form (form_id=1, form_details_id=3)
                        const payload = {
                            action: 'link-referral-by-call',
                            consult_call_id: ccIdVisible,
                            my_referral_id: inner.id,
                            referral_to: locationTo ? parseInt(locationTo) : null
                        };
                        $.ajax({
                            url: 'consultcall/api-jwt.php',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(payload),
                            complete: function() {
                                window.location.href = redirectUrl;
                            }
                        });
                    } else if (ccId && fuId && inner.id) {
                        // Consult call ID and follow-up ID supplied via URL params (linked from consultcall app)
                        const payload = {
                            action: 'link-referral',
                            consult_call_id: ccId,
                            follow_up_id: fuId,
                            data: {
                                my_referral_id: inner.id,
                                referral_to: locationTo ? parseInt(locationTo) : null
                            }
                        };
                        $.ajax({
                            url: 'consultcall/api-jwt.php',
                            type: 'POST',
                            contentType: 'application/json',
                            data: JSON.stringify(payload),
                            complete: function() {
                                window.location.href = redirectUrl;
                            }
                        });
                    } else {
                        window.location.href = redirectUrl;
                    }

                } else {
                    // Hide loading overlay on validation error
                    hideLoadingOverlay();

                    // Re-enable submit button
                    $('input[type="submit"]').prop('disabled', false);

                    console.log('Failed:', inner.message);

                    // Show error message to user
                    if (window.toast) {
                        toast.error(inner.message || 'Referral submission failed. Please check your information and try again.');
                    } else {
                        alert(inner.message || 'Referral submission failed. Please check your information and try again.');
                    }
                }

            })
            .catch(error => {
                // Hide loading overlay on error
                hideLoadingOverlay();

                // Re-enable submit button
                $('input[type="submit"]').prop('disabled', false);

                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });

                // Show error message to user
                if (window.toast) {
                    toast.error('An error occurred while submitting the referral. Please try again.');
                } else {
                    alert('An error occurred while submitting the referral. Please try again.');
                }
            });

    }
}

// Function to show loading overlay
function showLoadingOverlay() {
    // Check if overlay already exists, if not create it
    if ($('#loading-overlay').length === 0) {
        const loadingHTML = `
            <div id="loading-overlay" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            ">
                <div style="
                    background-color: white;
                    padding: 30px 40px;
                    border-radius: 10px;
                    text-align: center;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                ">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div style="margin-top: 20px; font-size: 18px; font-weight: 500; color: #333;">
                        Submitting referral...
                    </div>
                    <div style="margin-top: 10px; font-size: 14px; color: #666;">
                        Please wait, do not close this page
                    </div>
                </div>
            </div>
        `;
        $('body').append(loadingHTML);
    } else {
        $('#loading-overlay').show();
    }
}

// Function to hide loading overlay
function hideLoadingOverlay() {
    $('#loading-overlay').fadeOut(300, function() {
        $(this).remove();
    });
}
