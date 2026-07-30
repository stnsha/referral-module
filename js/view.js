// Global variable to store PDF base64 data from API
let globalEncodedBase = null;
// Global variable to store original status value for validation
let originalStatus = null;
// Global variable to store referral details for sequence tracking
let referralDetails = null;
// Global variable to store status ID to label mapping for confirmation
let statusMapping = {};

// Show loading overlay during form submission
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

// Hide loading overlay
function hideLoadingOverlay() {
    $('#loading-overlay').fadeOut(300, function() {
        $(this).remove();
    });
}

$(document).ready(function () {
    console.log(businessUnitId);
    localStorage.clear();
    sessionStorage.clear();

    // Initialize Select2 on the refer_location select field only
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

    $('#refer_location').select2({
        ...select2Config,
        placeholder: 'Location'
    });

    referralAccordion();
    referAnother();
    $('.refer-form').hide();
    $('.external-referral-text').hide();

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'get-referral',
            referral_id: referral_id,
            view_only: viewOnly
        }),
        success: function (response) {
            var data = response.data;
            console.log(data);

            // Store encoded_base globally for PDF downloads
            globalEncodedBase = data.encoded_base || null;

            // Referral Details - assign to global variable for access in validateForm
            referralDetails = data.referralDetails;

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

            var updated_recipient_to = $('#updated_recipient_to');

            var organization = $('#organization');
            var location_organization = $('#location_organization');
            var referee = $('#referee');

            organization.val('');
            location_organization.val('');
            referee.val('');

            // Get last two sequences for form population
            const lastTwoSequences = referralDetails.slice(-2); // Get last 2 items

            if (lastTwoSequences.length >= 2) {
                // Second to last sequence (From)
                const fromReferral = lastTwoSequences[0];
                // Last sequence (To)
                const toReferral = lastTwoSequences[1];

                // Populate FROM section with second to last sequence
                if (fromReferral.staff_id) {
                    getReferredFrom(fromReferral.staff_id, fromReferral.location, fromReferral.business_unit_id, function (staffResponse) {
                        if (staffResponse && staffResponse.length > 0) {
                            assigneeFrom.val(staffResponse[0].staff || '');
                            business_unit_from.val(staffResponse[0].business_unit || '');
                            location_from.val(staffResponse[0].outlet || '');
                        }
                    });
                }

                // Check if TO section has external referral
                if (toReferral.external_referral && toReferral.external_referral.length > 0) {
                    // External referral - show external fields and hide regular fields
                    const externalRef = toReferral.external_referral[0];

                    // Populate external referral fields
                    organization.val(externalRef.organization ? externalRef.organization.name : '');
                    location_organization.val(externalRef.organization ? externalRef.organization.state : '');
                    referee.val(externalRef.referee ? externalRef.referee : '');

                    // Show external referral fields
                    organization.show();
                    location_organization.show();
                    referee.show();

                    // Hide regular referral fields
                    recipientTo.hide();
                    business_unit_to.hide();
                    location_to.hide();

                    // Toggle labels
                    $('.referring-to').hide();
                    $('.external-referral-text').show();
                } else {
                    // Regular referral - show regular fields and hide external fields
                    organization.hide();
                    location_organization.hide();
                    referee.hide();

                    // Show regular referral fields
                    recipientTo.show();
                    business_unit_to.show();
                    location_to.show();

                    // Toggle labels
                    $('.referring-to').show();
                    $('.external-referral-text').hide();

                    // Populate TO section with last sequence
                    if (toReferral.staff_id) {
                        // Use existing staff_id for TO section
                        // Pass false for checkOutletAccess to show historical staff data regardless of current outlet assignments
                        getStaffDetails(toReferral.staff_id, toReferral.location, toReferral.business_unit_id, department, function (staffResponse) {
                            if (staffResponse && staffResponse.length > 0) {
                                recipientTo.val(staffResponse[0].staff || '');
                                business_unit_to.val(staffResponse[0].business_unit || '');
                                location_to.val(staffResponse[0].outlet || '');
                            }
                        }, false);
                    } else {
                        // Only show staff name if not in view_only mode
                        if (!viewOnly) {
                            $.ajax({
                                url: 'referral/backend.php',
                                method: 'GET',
                                data: {
                                    staff_id: staffId,
                                    action: 'getStaffName'
                                },
                                dataType: 'json',
                                success: function (staffName) {
                                    if (staffName) {
                                        recipientTo.val(staffName);
                                    }
                                }
                            });
                        }

                        // When staff_id is null
                        if (toReferral.location === null && fromReferral.staff_id != staffId) {
                            // Location is also null - get staff name, business unit name, and all user locations
                            $.ajax({
                                url: 'referral/backend.php',
                                method: 'GET',
                                data: {
                                    bu_id: toReferral.business_unit_id,
                                    action: 'getBusinessUnitName'
                                },
                                dataType: 'json',
                                success: function (businessUnitName) {
                                    if (businessUnitName) {
                                        business_unit_to.val(businessUnitName);
                                    }
                                }
                            });

                            $.ajax({
                                url: 'referral/backend.php',
                                method: 'GET',
                                data: {
                                    staff_id: staffId,
                                    action: 'getStaffLocation'
                                },
                                dataType: 'json',
                                success: function (locations) {
                                    if (locations && locations.length > 1) {
                                        // Multiple locations - create select dropdown
                                        const fieldId = location_to.attr('id');
                                        const fieldName = location_to.attr('name');

                                        const selectElement = $('<select>', {
                                            id: fieldId,
                                            name: fieldName,
                                            class: 'form-select form-select-sm',
                                            required: true
                                        });

                                        selectElement.append($('<option>', {
                                            value: '',
                                            text: 'Select Location'
                                        }));

                                        locations.forEach(function (location) {
                                            selectElement.append($('<option>', {
                                                value: location.id,
                                                text: location.code
                                            }));
                                        });

                                        location_to.replaceWith(selectElement);

                                        // Show the location label with asterisk
                                        // $('#location-to-label').show();

                                        // Initialize select2 on the newly created location_to select element
                                        $('#location_to').select2({
                                            ...select2Config,
                                            placeholder: 'Select Location'
                                        });
                                    } else if (locations && locations.length === 1) {
                                        // Only one location - display as readonly input
                                        location_to.val(locations[0].code);
                                    }
                                }
                            });
                        }
                        else {
                            // Location exists - check if current session user's department matches
                            getStaffDetails(staffId, toReferral.location, null, department, function (staffResponse) {
                                if (staffResponse && staffResponse.length > 0 && staffResponse[0].department_id === department) {
                                    // Department matches - use current session user
                                    getStaffDetails(staffId, toReferral.location, toReferral.business_unit_id, department, function (staffResponse) {
                                        if (staffResponse && staffResponse.length > 0) {
                                            recipientTo.val(staffResponse[0].staff || '');
                                            business_unit_to.val(staffResponse[0].business_unit || '');
                                            location_to.val(staffResponse[0].outlet || '');
                                        }
                                    });
                                } else {
                                    // Department doesn't match - only populate location and business unit
                                    getRecipientDetails(toReferral.location, toReferral.business_unit_id, function (recipientResponse) {
                                        if (recipientResponse) {
                                            location_to.val(recipientResponse.outlet_name || '');
                                            business_unit_to.val(recipientResponse.business_unit_name || '');
                                            recipientTo.val(''); // Leave staff field empty
                                        }
                                    });
                                }
                            });
                        }

                    }
                }
            }

            // Handle takeover button visibility and functionality
            if (viewOnly && lastTwoSequences.length >= 2) {
                const toReferral = lastTwoSequences[1];

                // Check conditions: view_only=true AND location_to NOT NULL AND same business unit 
                if (toReferral.location !== null && toReferral.business_unit_id) {
                    // Check if business units match
                    if (businessUnitId && String(businessUnitId) === String(toReferral.business_unit_id)) {
                        // Show takeover button
                        $('#takeover-button-container').show();

                        // Add click handler for takeover button
                        $('#takeover-referral-btn').off('click').on('click', function () {
                            handleTakeoverReferral(toReferral, referralDetails);
                        });
                    }
                }
            }

            // Sort asc by sequence
            const sortedReferrals = referralDetails.sort((a, b) => a.sequence - b.sequence);

            const referralHistoryContainer = $('#referralHistoryContainer');

            // Process referral history (include filled sequences and unfilled external referral sequences)
            const referralHistoryItems = sortedReferrals.filter(function(rd) {
                return rd.is_filled === true || (rd.external_referral && rd.external_referral.length > 0);
            });

            function renderAccordionQueue(accordionQueue, totalItems, sortedReferrals, referral_id, referralHistoryContainer) {
                if (accordionQueue.length < totalItems) return;
                accordionQueue.sort(function(a, b) { return a.sequence - b.sequence; });

                // Pre-pass: when sequence N is followed by an external sequence N+1,
                // suppress createForm on N and hand it to N+1 for display.
                var seqMap = {};
                accordionQueue.forEach(function(item) { seqMap[item.sequence] = item; });
                accordionQueue.forEach(function(item) {
                    var nextItem = seqMap[item.sequence + 1];
                    if (nextItem && nextItem.rd.external_referral && nextItem.rd.external_referral.length > 0) {
                        item.suppressCreateForm = true;
                        nextItem.inheritedCreateForm = item.rd.createForm;
                    }
                });

                accordionQueue.forEach(function(accordionData, sortedIndex) {
                    var rd = accordionData.rd;
                    var staff = accordionData.staff;
                    var businessUnit = accordionData.businessUnit;
                    var outlet = accordionData.outlet;

                    // For sequence N where the next sequence is an external referral, generate the external letter (seq+1)
                    var downloadSeq = rd.sequence;
                    for (var i = 0; i < sortedReferrals.length; i++) {
                        if (sortedReferrals[i].sequence === rd.sequence + 1 &&
                            sortedReferrals[i].external_referral &&
                            sortedReferrals[i].external_referral.length > 0) {
                            downloadSeq = rd.sequence + 1;
                            break;
                        }
                    }

                    // External referral entries are informational — do not apply the disabled class
                    var isExternal = rd.external_referral && rd.external_referral.length > 0;
                    var disabledClass = (!isExternal && rd.is_filled == 0) ? ' disabled' : '';

                    var downloadButtonHtml = isExternal ? '' : (
                        '<a href="#" class="btn-icon btn-icon-download download-history-pdf-btn"' +
                        ' data-id="' + referral_id + '"' +
                        ' data-sequence="' + downloadSeq + '"' +
                        ' data-timestamp="' + rd.updated_at + '"' +
                        ' data-bs-toggle="tooltip"' +
                        ' data-bs-placement="top"' +
                        ' data-bs-title="Download PDF">' +
                        '<i class="bi bi-file-earmark-arrow-down"></i>' +
                        '</a>'
                    );

                    var accordionHtml =
                        '<div class="referral-history" data-sequence="' + rd.sequence + '">' +
                        '<button type="button" class="referral-accordion' + disabledClass + '">' +
                        '<div class="referral-accordion-content">' +
                        '<div class="referral-text">' +
                        '<span class="referral-title">' + businessUnit + ', ' + staff + (outlet ? ', ' + outlet : '') + '</span>' +
                        '<span class="referral-date">' + rd.updated_at + '</span>' +
                        '</div>' +
                        '<div class="referral-actions">' +
                        downloadButtonHtml +
                        '<span class="accordion-arrow"></span>' +
                        '</div>' +
                        '</div>' +
                        '</button>' +
                        '<div class="referral-panel">' +
                        '<div class="referral-panel-item" data-bu="' + (rd.business_unit_id || '') + '"></div>' +
                        '<div class="referral-pic"></div>' +
                        '</div>' +
                        '</div>';

                    referralHistoryContainer.append(accordionHtml);

                    var panel = $('[data-sequence="' + rd.sequence + '"] .referral-panel-item');
                    var accordion = $('[data-sequence="' + rd.sequence + '"]');
                    var shouldAutoOpen = (sortedIndex === accordionQueue.length - 1);
                    processAccordionContent(accordionData, panel, accordion, shouldAutoOpen);
                });
            }

            var accordionQueue = [];
            var processedCount = 0;
            var totalItems = referralHistoryItems.length;

            if (totalItems > 0) {
                referralHistoryItems.forEach(function(rd, index) {
                    if (rd.external_referral && rd.external_referral.length > 0) {
                        // External referral — derive header info from org/referee data directly, no API call needed
                        var extRef = rd.external_referral[0];
                        var extStaff = extRef.referee || 'External Referee';
                        var extBusinessUnit = 'External Referral';
                        var extOutlet = extRef.organization ? extRef.organization.name : '';
                        var extContact = extRef.organization ? (extRef.organization.phone || '') : '';

                        accordionQueue.push({
                            sequence: rd.sequence,
                            rd: rd,
                            staff: extStaff,
                            businessUnit: extBusinessUnit,
                            outlet: extOutlet,
                            contact: extContact,
                            staff_department_id: rd.business_unit_id,
                            createdAt: rd.updated_at,
                            originalIndex: index
                        });
                        processedCount++;
                        renderAccordionQueue(accordionQueue, totalItems, sortedReferrals, referral_id, referralHistoryContainer);
                    } else {
                        getReferredFrom(rd.staff_id, rd.location, rd.business_unit_id, function(staffResponse) {
                            var staff = staffResponse && staffResponse.length > 0 ? staffResponse[0].staff : 'Unknown';
                            var contact = staffResponse && staffResponse.length > 0 ? staffResponse[0].contact : '';
                            var businessUnit = staffResponse && staffResponse.length > 0 ? staffResponse[0].business_unit : '';
                            var outlet = staffResponse && staffResponse.length > 0 ? staffResponse[0].outlet : '';

                            accordionQueue.push({
                                sequence: rd.sequence,
                                rd: rd,
                                staff: staff,
                                businessUnit: businessUnit,
                                outlet: outlet,
                                contact: contact,
                                staff_department_id: rd.business_unit_id,
                                createdAt: rd.updated_at,
                                originalIndex: index
                            });
                            processedCount++;
                            renderAccordionQueue(accordionQueue, totalItems, sortedReferrals, referral_id, referralHistoryContainer);
                        });
                    }
                });
            }

            // Global flag to control reply-form-container visibility based on referral_details
            window.hasReplyForms = false;
            window.isLastSequence = false;

            // Get status early for use in async callbacks
            let status = data.status;

            if (referralDetails && referralDetails.length > 0) {
                const lastSequence = referralDetails[referralDetails.length - 1];

                // If referral is In Progress (status 2), show reply form and enable status only to
                // the assigned staff of the last sequence whose staff_id and business unit match.
                // Submitting will create a new sequence via the backend.
                // staffOutlet may be a comma-separated list (staff can be assigned to multiple outlets),
                // so check membership rather than exact string equality - mirrors the backend's
                // in_array($rh->location, $listOutlets) check in ReferralController::update().
                const staffOutletList = String(staffOutlet || '').split(',').map(function (o) { return o.trim(); });
                if (status == 2 && String(lastSequence.business_unit_id) === String(businessUnitId) && staffOutletList.indexOf(String(lastSequence.location)) !== -1) {
                    window.hasReplyForms = true;
                    window.isLastSequence = true;
                    if (!viewOnly) {
                        $('.reply-form-container').show();
                        displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                        $('.refer-another-container').show();
                        $('.form-btn-submit').show();
                    } else {
                        $('.reply-form-container').hide();
                        $('.refer-another-container').hide();
                        $('.form-btn-submit').hide();
                    }
                }
                // Check if external referral - hide reply form
                else if (lastSequence.external_referral && lastSequence.external_referral.length > 0) {
                    window.hasReplyForms = false;
                    window.isLastSequence = false;
                    $('.reply-form-container').hide();
                }
                // Check is_filled status - if true, hide reply form regardless of other conditions
                // But still allow the assigned staff to update the status (e.g. from In Progress to Closed)
                else if (lastSequence.is_filled === true) {
                    window.hasReplyForms = false;
                    $('.reply-form-container').hide();
                    if (lastSequence.staff_id && String(lastSequence.staff_id) === String(staffId)) {
                        window.isLastSequence = true;
                    } else {
                        window.isLastSequence = false;
                    }
                }
                // Check if referral_details exist but not empty (safety check)
                // When referral_details is empty (no form answers yet) but a staff member is assigned,
                // still allow the assigned staff to update the status even though the reply form is hidden.
                else if (!lastSequence.referral_details || (lastSequence.referral_details.length === 0 && lastSequence.staff_id !== null)) {
                    window.hasReplyForms = false;
                    $('.reply-form-container').hide();
                    if (lastSequence.staff_id && String(lastSequence.staff_id) === String(staffId)) {
                        window.isLastSequence = true;
                    } else {
                        window.isLastSequence = false;
                    }
                }
                // Only show reply form if current user is the staff in last sequence
                else if (lastSequence.staff_id) {
                    // Check if current user matches the staff_id in last sequence
                    if (String(lastSequence.staff_id) === String(staffId)) {
                        // Current user is the staff in last sequence
                        window.hasReplyForms = true;
                        window.isLastSequence = true;
                        // Only show reply form if NOT in view_only mode
                        if (!viewOnly) {
                            $('.reply-form-container').show();
                            displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                        } else {
                            $('.reply-form-container').hide();
                        }
                    } else {
                        // Current user is not the staff in last sequence - hide reply form
                        window.hasReplyForms = false;
                        window.isLastSequence = false;
                        $('.reply-form-container').hide();
                    }
                }
                // Special case: staff_id is null - check department match
                else if (lastSequence.staff_id === null && lastSequence.location != null) {
                    // Assign current user as recipient
                    updated_recipient_to.val(staffId);

                    // When staff_id is null, check if current session user's department matches
                    getStaffDetails(staffId, lastSequence.location, null, department, function (staffResponse) {
                        if (staffResponse && staffResponse.length > 0 && staffResponse[0].department_id === department) {
                            // Department matches
                            window.hasReplyForms = true;
                            window.isLastSequence = true;

                            // Only show reply form if NOT in view_only mode
                            if (!viewOnly) {
                                $('.reply-form-container').show();
                                displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                                // Show "Refer Another" container and submit button when department matches
                                $('.refer-another-container').show();
                                if (status != 4 && status != 5) {
                                    $('.form-btn-submit').show();
                                }
                            } else {
                                $('.reply-form-container').hide();
                                $('.refer-another-container').hide();
                                $('.form-btn-submit').hide();
                            }
                            // Reload status options with correct disable state
                            loadStatusOptions(status, (status == 4 || status == 5), data.status_note);
                        } else {
                            // Department doesn't match - hide reply form
                            window.hasReplyForms = false;
                            window.isLastSequence = false;
                            $('.reply-form-container').hide();

                            // Hide "Refer Another" container and submit button when department doesn't match
                            $('.refer-another-container').hide();
                            $('.form-btn-submit').hide();
                            // Reload status options with correct disable state
                            loadStatusOptions(status, true, data.status_note);
                        }
                    });
                }

                else if (lastSequence.staff_id === null && lastSequence.location == null) {
                    // Assign current user as recipient
                    updated_recipient_to.val(staffId);
                    // When staff_id is null, check if current session user's department matches
                    isStaffMatch(staffId, department, function (staffResponse) {
                        if (staffResponse) {
                            // Department matches
                            window.hasReplyForms = true;
                            window.isLastSequence = true;

                            // Only show reply form if NOT in view_only mode
                            if (!viewOnly) {
                                $('.reply-form-container').show();
                                displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                                // Show "Refer Another" container and submit button when department matches
                                $('.refer-another-container').show();
                                if (status != 4 && status != 5) {
                                    $('.form-btn-submit').show();
                                }
                            } else {
                                $('.reply-form-container').hide();
                                $('.refer-another-container').hide();
                                $('.form-btn-submit').hide();
                            }
                            // Reload status options with correct disable state
                            loadStatusOptions(status, (status == 4 || status == 5), data.status_note);
                        } else {
                            // Department doesn't match - hide reply form
                            window.hasReplyForms = false;
                            window.isLastSequence = false;
                            $('.reply-form-container').hide();

                            // Hide "Refer Another" container and submit button when department doesn't match
                            $('.refer-another-container').hide();
                            $('.form-btn-submit').hide();
                            // Reload status options with correct disable state
                            loadStatusOptions(status, true, data.status_note);
                        }
                    });
                }

                else {
                    // Default: hide reply form
                    window.hasReplyForms = false;
                    window.isLastSequence = false;
                    $('.reply-form-container').hide();
                }
            } else {
                // No referral details - hide reply form
                window.isLastSequence = false;
                $('.reply-form-container').hide();
            }


            $('input[name="priority"]').on('click', function (e) {
                e.preventDefault();
            });
            $('input[name="priority"][value="' + data.priority + '"]').prop('checked', true);

            var custid = data.customer_id;

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

            // Load status options dynamically with disable parameter for status 4 or 5 OR not last sequence
            const shouldDisableRadios = (status == 4 || status == 5 || !window.isLastSequence);
            loadStatusOptions(status, shouldDisableRadios, data.status_note);

            // Apply UI changes based on last sequence status - after status options loaded
            if (!window.isLastSequence) {
                // Hide entire "Refer Another" container
                $('.refer-another-container').hide();
                // Hide submit button
                $('.form-btn-submit').hide();
            } else {
                // Show "Refer Another" container when in last sequence
                $('.refer-another-container').show();
                // Ensure submit button is visible (unless status is 4 or 5)
                if (status != 4 && status != 5) {
                    $('.form-btn-submit').show();
                }
            }

            // Hide submit button if initial status is 4 or 5
            const submitButton = document.querySelector('.form-btn-submit');

            // Referral Attachments
            const attachmentContainer = $('#attachmentDisplay');
            attachmentContainer.empty(); // Clear existing attachments
        },
        error: function (xhr, status, error) {
            logError(new Error('Failed to fetch referral details'), { context: 'fetchReferralDetails', referralId: referral_id, status: status, error: error });
        }
    });

    handleFilePreview('#attachmentInput', '#attachmentPreview');

    // For Refer To
    $('#refer_business_unit').change(function () {
        const selectedOption = $(this).find(':selected');
        var refBusId = selectedOption.data('id');

        if (refBusId) {
            $('input[name="refer_business_unit_id"]').val(refBusId);

            toggleReferForm();

            $.ajax({
                url: 'referral/backend.php?action=getLocations',
                type: 'POST',
                data: {
                    ref_bus_id: refBusId
                },
                dataType: 'json',
                success: function (response) {
                    var locationTo = $('#refer_location');
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
        } else {
            $('#refer_location').empty().append('<option value="">Location</option>');
            toggleReferForm();
        }
    });


    $('#refer_another').change(function () {
        toggleReferForm();
    });

});

// Function to process accordion content after all async calls complete
function processAccordionContent(queueItem, panel, accordion, shouldAutoOpen = false) {
    const { rd, staff, businessUnit, outlet, contact, staff_department_id, createdAt } = queueItem;

    // External referral destination entry — show inherited referral info then org/referee details
    if (rd.external_referral && rd.external_referral.length > 0) {
        var cf = queueItem.inheritedCreateForm;
        if (cf && (cf.referral_reason || cf.referral_condition || cf.medical_history)) {
            panel.append(`
                <div class="referral-info-section border-bottom pb-3 mb-3">
                    <p class="r-title">Referral Information</p>
                    <div class="mb-2">
                        <p class="r-text">Purpose of Referral</p>
                        <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${cf.referral_reason || 'N/A'}</textarea>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Details of Patient's Condition</p>
                        <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${cf.referral_condition || 'N/A'}</textarea>
                    </div>
                    <div class="mb-2">
                        <p class="r-text">Relevant Medical History</p>
                        <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${cf.medical_history || 'N/A'}</textarea>
                    </div>
                </div>
            `);
        }
        var extRef = rd.external_referral[0];
        var orgName = extRef.organization ? extRef.organization.name : 'N/A';
        var orgAddress = extRef.organization ? (extRef.organization.address || 'N/A') : 'N/A';
        var orgState = extRef.organization ? (extRef.organization.state || 'N/A') : 'N/A';
        var refereeName = extRef.referee || 'N/A';
        panel.append(
            '<div class="referral-info-section border-bottom pb-3 mb-3">' +
            '<p class="r-title">External Referral Destination</p>' +
            '<div class="mb-2"><p class="r-text">Organization: ' + orgName + '</p></div>' +
            '<div class="mb-2"><p class="r-text">Address: ' + orgAddress + '</p></div>' +
            '<div class="mb-2"><p class="r-text">State: ' + orgState + '</p></div>' +
            '<div class="mb-2"><p class="r-text">Referee: ' + refereeName + '</p></div>' +
            '</div>'
        );
        var extAccordionButton = accordion.find('.referral-accordion');
        var extAccordionPanel = accordion.find('.referral-panel');
        if (shouldAutoOpen) {
            extAccordionButton.addClass('active');
            extAccordionPanel.css('maxHeight', extAccordionPanel[0].scrollHeight + 'px');
        }
        return;
    }

    // Display Referral Feedback from replyForm object
    if (rd.replyForm && Object.keys(rd.replyForm).length > 0 && (rd.replyForm.post_diagnosis || rd.replyForm.outcome || rd.replyForm.feedback)) {
        panel.append(`
            <div class="referral-feedback-section border-bottom pb-3 mb-3">
                <p class="r-title">Previous Feedback</p>
                <div class="mb-2">
                    <p class="r-text">Post Diagnosis</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.replyForm.post_diagnosis || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Outcome</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.replyForm.outcome || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Feedback</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.replyForm.feedback || 'N/A'}</textarea>
                </div>
            </div>
            `);
    }

    // Display Referral Information from createForm object
    // Suppressed when the next sequence is an external referral (data is moved there instead)
    if (!queueItem.suppressCreateForm && rd.createForm && Object.keys(rd.createForm).length > 0 && (rd.createForm.referral_reason || rd.createForm.referral_condition || rd.createForm.medical_history)) {
        panel.append(`
            <div class="referral-info-section border-bottom pb-3 mb-3">
                <p class="r-title">Referral Information</p>
                <div class="mb-2">
                    <p class="r-text">Purpose of Referral</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.createForm.referral_reason || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Details of Patient's Condition</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.createForm.referral_condition || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Relevant Medical History</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.createForm.medical_history || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Additional Remarks</p>
                    <textarea class="form-control form-control-sm" rows="10" style="white-space:pre-wrap;" readonly>${rd.additional_remarks || 'N/A'}</textarea>
                </div>
            </div>
            `);
    }

    //add title for initial treatment only if referral_details exists and is not empty
    if (rd.referral_details && rd.referral_details.length > 0) {
        panel.append(`
                <div class="treatment-section">
                    <p class="r-title">Current/Past Treatment</p>
                </div>
            `);

        //display initial treatment
        initialTreatment(rd.referral_details, rd.business_unit_id, panel, rd.additional_remarks);
    }

    const referralPic = accordion.find('.referral-pic');
    var whatsapp = 'https://api.whatsapp.com/send?phone=' + contact;

    // Priority mapping and defaulting
    const priorityMap = {
        '1': { name: 'Low', class: 'bdg-priority-low' },
        '2': { name: 'Medium', class: 'bdg-priority-medium' },
        '3': { name: 'High', class: 'bdg-priority-high' }
    };

    // Default to Medium (2) if priority is null/empty
    const priorityValue = rd.priority ? rd.priority.toString() : '2';
    const priorityInfo = priorityMap[priorityValue] || priorityMap['2'];
    const priorityBadge = `<span class="${priorityInfo.class}">${priorityInfo.name} priority</span>`;

    referralPic.html(`
        ${priorityBadge}<br><br>
        <span class="r-title">Submitted by</span><br>
        <span class="r-text">Name: ${staff} </span><br>
        <span class="r-text">Contact: ${contact} </span><br>
        <span class="r-text">Date: ${createdAt} </span><br>
        <a href="${whatsapp}" target="_blank" style="text-decoration: none;">
            <img src="referral/img/whatsapp.png" style="width:25px;">
        </a>
        `);

    if (rd.attachments.length > 0) {
        displayAttachments(rd.attachments, staff, createdAt, accordion);
    }

    //auto-open only the first (latest) filled accordion - moved to end after all content is added
    const accordionButton = accordion.find('.referral-accordion');
    const accordionPanel = accordion.find('.referral-panel');

    // Only auto-open the first filled accordion
    if (shouldAutoOpen) {
        accordionButton.addClass('active');
        accordionPanel.css('maxHeight', accordionPanel[0].scrollHeight + 'px');
    }
}

function displayAttachments(attachments, staff, created_at, accordion) {
    // Create attachment container within this accordion
    let attachmentContainer = accordion.find('.attachment-container');
    if (attachmentContainer.length === 0) {
        attachmentContainer = $('<div class="attachment-container mt-3"><h6 class="r-title">Attachments</h6><ul class="list-group"></ul></div>');
        accordion.find('.referral-panel').append(attachmentContainer);
    }
    const attachmentList = attachmentContainer.find('.list-group');

    attachments.forEach(function (attachment) {
        let isDownloadableClientSide = false;

        const downloadButtonHtml = isDownloadableClientSide ?
            `<button class="btn btn-sm btn-link text-decoration-none download-btn" title="Download" data-filename="${attachment.name}" data-encoded="${attachment.encoded}">
                    <img src="referral/img/download.png" style="width:25px;"/>
                </button>` :
            `<button class="btn btn-sm btn-link text-decoration-none download-btn" title="Download" data-filename="${attachment.name}" data-attachment-id="${attachment.attachment_id}"> <img src="referral/img/download.png" style="width:25px;"/>
                </button>`;

        const attachmentItem = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex flex-column align-items-start flex-grow-1">
                        <span class="fw-bold">${attachment.name}</span>
                        <small class="d-block r-text text-muted">Uploaded by ${staff} on ${created_at}.</small>
                    </div>
                    <div class="d-flex align-items-center">
                        ${downloadButtonHtml}
                    </div>
                </li>
            `;
        attachmentList.append(attachmentItem);
    });

    $('.download-btn').on('click', function () {
        const fileName = $(this).data('filename');
        const encodedData = $(this).data('encoded');
        const attachmentId = $(this).data('attachment-id');

        if (encodedData) {
            // Client-side download using Base64
            try {
                // Decode base64 data
                const base64Data = encodedData.replace(/^data:[^;]+;base64,/, '');
                const binaryString = atob(base64Data);
                const bytes = new Uint8Array(binaryString.length);

                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                // Use content type from API response or fallback to detected MIME type
                const contentType = response.data.content_type || getMimeTypeFromFileName(fileName);
                const blob = new Blob([bytes], { type: contentType });

                // Create temporary URL and download
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                a.style.display = 'none';

                document.body.appendChild(a);
                a.click();

                // Clean up
                setTimeout(() => {
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                }, 100);

            } catch (error) {
                logError(new Error('Error decoding base64 data'), { context: 'downloadAttachment', fileName: fileName, error: error.message });
                alert('Failed to download file. Invalid file data.');
            }
        } else if (attachmentId) {
            // Server-side download
            // console.log(`Downloading attachment: ${fileName} (ID: ${attachmentId})`);

            // Make AJAX request for download
            $.ajax({
                url: 'referral/api-jwt.php',
                method: 'POST',
                data: JSON.stringify({
                    action: 'download-attachment',
                    attachment_id: attachmentId
                }),
                contentType: 'application/json',
                xhrFields: {
                    responseType: 'blob'
                },
                success: function (response) {
                    try {
                        // Try to read the response as text first
                        const reader = new FileReader();
                        reader.onload = function () {
                            try {
                                // Check if response is JSON
                                const jsonResponse = JSON.parse(reader.result);
                                if (!jsonResponse.success) {
                                    logError(new Error('Download failed'), { context: 'downloadAttachment', fileName: fileName, message: jsonResponse.message });
                                    alert(jsonResponse.message || 'Failed to download file. Please try again.');
                                    return;
                                }
                            } catch (e) {
                                // Not JSON, treat as binary data
                                const blob = new Blob([response], { type: response.type || getMimeTypeFromFileName(fileName) });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileName;
                                a.style.display = 'none';

                                document.body.appendChild(a);
                                a.click();

                                setTimeout(() => {
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                }, 100);
                            }
                        };
                        reader.readAsText(response);
                    } catch (error) {
                        logError(new Error('Error processing file data'), { context: 'downloadAttachment', fileName: fileName, error: error.message });
                        alert('Failed to process file data. Please try again.');
                    }
                },
                error: function (xhr, status, error) {
                    logError(new Error('Download failed'), { context: 'downloadAttachment', fileName: fileName, status: status, error: error, responseText: xhr.responseText });
                    alert('Failed to download file. Please try again.');
                }
            });
        } else {
            console.warn('No download method available for this attachment.');
            alert('Download method not available for this file.');
        }

    });

    // Helper function to determine MIME type from file extension
    function getMimeTypeFromFileName(fileName) {
        const extension = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            'pdf': 'application/pdf',
            'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'ppt': 'application/vnd.ms-powerpoint',
            'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'txt': 'text/plain',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'bmp': 'image/bmp',
            'tiff': 'image/tiff',
            'zip': 'application/zip',
            'rar': 'application/x-rar-compressed',
            '7z': 'application/x-7z-compressed'
        };

        return mimeTypes[extension] || 'application/octet-stream';
    }
}

// Toggle read-only state for the entire form
function toggleFormReadOnly(isReadOnly) {
    // Get all form inputs, selects, and textareas
    const formElements = document.querySelectorAll('input, select, textarea, button');

    formElements.forEach(element => {
        if (isReadOnly) {
            // Make elements read-only/disabled
            if (element.type === 'radio' || element.type === 'checkbox' || element.type === 'file' || element.tagName === 'SELECT' || element.tagName === 'BUTTON') {
                element.disabled = true;
                element.setAttribute('data-was-disabled', 'true');
            } else {
                element.readOnly = true;
                element.setAttribute('data-was-readonly', 'true');
            }
            // Add visual styling for read-only state
            element.style.backgroundColor = '#f8f9fa';
            element.style.cursor = 'not-allowed';
        } else {
            // Restore original state
            if (element.hasAttribute('data-was-disabled')) {
                element.disabled = false;
                element.removeAttribute('data-was-disabled');
            }
            if (element.hasAttribute('data-was-readonly')) {
                element.readOnly = false;
                element.removeAttribute('data-was-readonly');
            }
            // Remove read-only styling
            element.style.backgroundColor = '';
            element.style.cursor = '';
        }
    });
}

function addStatusChangeListeners() {
    const statusRadios = document.querySelectorAll('input[name="status"]');
    const statusNoteContainer = document.querySelector('#status-note-container > div');
    const statusNoteTextarea = document.getElementById('status_note');
    const statusNoteError = document.getElementById('error-status_note');

    statusRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (statusNoteContainer && statusNoteTextarea) {
                if (this.value === '5') {
                    // Show status_note textarea when status 5 is selected
                    statusNoteContainer.style.display = 'block';
                    // Hide reply form when status 5 (Not Present) is selected
                    $('.reply-form-container').hide();
                    // Hide attachment input for status 5
                    $('#attachmentInput').hide();
                    // Make reply-content form-container fields nullable
                    toggleReplyFormRequirement(false);
                    // Hide submit button for status 5
                    const submitButton = document.querySelector('.form-btn-submit');
                    if (submitButton) {
                        submitButton.style.display = 'none';
                    }
                    // Make entire form read-only for status 5
                    toggleFormReadOnly(true);
                } else if (this.value === '4') {
                    // Hide and clear status_note textarea for status 4
                    statusNoteContainer.style.display = 'none';
                    statusNoteTextarea.value = '';
                    if (statusNoteError) {
                        statusNoteError.textContent = '';
                    }
                    // Show reply form when status 4 is selected (only if forms exist)
                    if (window.hasReplyForms) {
                        $('.reply-form-container').show();
                    }
                    // Hide attachment input for status 4
                    $('#attachmentInput').hide();
                    // Restore reply-content form-container fields as required
                    toggleReplyFormRequirement(true);
                    // Hide submit button for status 4
                    const submitButton = document.querySelector('.form-btn-submit');
                    if (submitButton) {
                        submitButton.style.display = 'none';
                    }
                    // Make entire form read-only for status 4
                    toggleFormReadOnly(true);
                } else {
                    // Hide and clear status_note textarea for other statuses
                    statusNoteContainer.style.display = 'none';
                    statusNoteTextarea.value = '';
                    if (statusNoteError) {
                        statusNoteError.textContent = '';
                    }
                    // Show reply form when other statuses are selected (only if forms exist)
                    if (window.hasReplyForms) {
                        $('.reply-form-container').show();
                    }
                    // Show attachment input for other statuses
                    $('#attachmentInput').show();
                    // Restore reply-content form-container fields as required
                    toggleReplyFormRequirement(true);
                    // Show submit button for other statuses
                    const submitButton = document.querySelector('.form-btn-submit');
                    if (submitButton) {
                        submitButton.style.display = 'inline-block';
                    }
                    // Make form editable for other statuses
                    toggleFormReadOnly(false);
                }
            }
        });
    });
}

function loadStatusOptions(selectedStatus, shouldDisableRadios = false, statusNote = null) {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            const statusContainer = document.getElementById('status-options');
            if (statusContainer && response && response.data) {
                // Clear existing options
                statusContainer.innerHTML = '';

                // Store the original status value on first load for validation
                if (originalStatus === null && selectedStatus) {
                    originalStatus = String(selectedStatus);
                }

                // Add status options from object format {"1": "Open", "2": "In Progress", etc.}
                Object.keys(response.data).forEach(function (key) {
                    // Store mapping for confirmation dialog
                    statusMapping[key] = response.data[key];

                    const statusDiv = document.createElement('div');
                    statusDiv.className = 'form-check';

                    const isChecked = selectedStatus && String(selectedStatus) === String(key) ? 'checked' : '';
                    const isDisabled = shouldDisableRadios ? 'disabled' : '';

                    statusDiv.innerHTML = `
                        <input class="form-check-input border" type="radio" name="status" id="status${key}" value="${key}" ${isChecked} ${isDisabled}>
                        <label class="form-check-label r-text" for="status${key}">${response.data[key]}</label>
                    `;

                    statusContainer.appendChild(statusDiv);
                });
                // Add status_note textarea after status options
                addStatusNoteField(statusContainer, selectedStatus, statusNote);
                // Add event listeners for status change
                addStatusChangeListeners();
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('Error loading status options'), { context: 'loadStatusOptions', status: status, error: error, responseText: xhr.responseText });
            // Fallback to default options if API fails
            const statusContainer = document.getElementById('status-options');
            if (statusContainer) {
                const isDisabled = shouldDisableRadios ? 'disabled' : '';
                statusContainer.innerHTML = `
                    <div class="form-check">
                        <input class="form-check-input border" type="radio" name="status" id="statusOpen" value="1" ${isDisabled}>
                        <label class="form-check-label r-text" for="statusOpen">Open</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input border" type="radio" name="status" id="statusProgress" value="2" ${isDisabled}>
                        <label class="form-check-label r-text" for="statusProgress">In Progress</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input border" type="radio" name="status" id="statusReferred" value="3" ${isDisabled}>
                        <label class="form-check-label r-text" for="statusReferred">Referred</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input border" type="radio" name="status" id="statusClosed" value="4" ${isDisabled}>
                        <label class="form-check-label r-text" for="statusClosed">Closed</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input border" type="radio" name="status" id="statusNotPresent" value="5" ${isDisabled}>
                        <label class="form-check-label r-text" for="statusNotPresent">Not Present</label>
                    </div>
                `;
                // Store the original status value on first load for validation
                if (originalStatus === null && selectedStatus) {
                    originalStatus = String(selectedStatus);
                }
                // Set fallback mapping for confirmation dialog
                statusMapping = {
                    '1': 'Open',
                    '2': 'In Progress',
                    '3': 'Referred',
                    '4': 'Closed',
                    '5': 'Not Present'
                };
                // Add status_note textarea after fallback options
                addStatusNoteField(statusContainer, selectedStatus, statusNote);
                // Add event listeners for status change
                addStatusChangeListeners();
            }
        }
    });
}

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

// Add status_note textarea field
function addStatusNoteField(container, selectedStatus, statusNote = null) {
    // Add error message container for status validation
    // Check if error div already exists to avoid duplicates
    let statusErrorDiv = document.getElementById('error-status');
    if (!statusErrorDiv) {
        statusErrorDiv = document.createElement('div');
        statusErrorDiv.id = 'error-status';
        statusErrorDiv.className = 'error-message';
        statusErrorDiv.style.cssText = 'color: red; font-size: 12px; margin-top: 8px; display: none;';
        container.appendChild(statusErrorDiv);
    }

    const statusNoteDiv = document.createElement('div');
    statusNoteDiv.className = 'mb-3';
    statusNoteDiv.id = 'status-note-container';

    // Show the textarea only if status 5 is selected
    const isStatus5Selected = selectedStatus && String(selectedStatus) === '5';
    const displayStyle = isStatus5Selected ? 'block' : 'none';

    // If status is 5 and statusNote exists, set value and disable the field
    const noteValue = (isStatus5Selected && statusNote) ? statusNote : '';
    const disabledAttr = (isStatus5Selected && statusNote) ? 'disabled' : '';

    statusNoteDiv.innerHTML = `
        <div style="display: ${displayStyle};">
            <label class="form-label r-text" for="status_note">Status Note</label>
            <textarea class="form-control form-control-sm" name="status_note" id="status_note" rows="10" placeholder="Please provide additional details..." ${disabledAttr}>${noteValue}</textarea>
            <div id="error-status_note" class="error-message" style="color: red; font-size: 12px;"></div>
        </div>
    `;

    container.appendChild(statusNoteDiv);
}

// Add event listeners for status radio button changes
function addStatusChangeListeners() {
    const statusRadios = document.querySelectorAll('input[name="status"]');
    const statusNoteContainer = document.querySelector('#status-note-container > div');
    const statusNoteTextarea = document.getElementById('status_note');
    const statusNoteError = document.getElementById('error-status_note');

    statusRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            // Clear status validation error when user changes status
            const statusErrorElement = document.getElementById('error-status');
            if (statusErrorElement) {
                statusErrorElement.textContent = '';
                statusErrorElement.style.display = 'none';
            }

            if (statusNoteContainer && statusNoteTextarea) {
                if (this.value === '5') {
                    // Show status_note textarea when status 5 is selected
                    statusNoteContainer.style.display = 'block';
                    // Hide reply form when status 5 (Not Present) is selected
                    $('.reply-form-container').hide();
                    // Make reply-content form-container fields nullable
                    toggleReplyFormRequirement(false);
                } else {
                    // Hide and clear status_note textarea for other statuses
                    statusNoteContainer.style.display = 'none';
                    statusNoteTextarea.value = '';
                    if (statusNoteError) {
                        statusNoteError.textContent = '';
                    }
                    // Show reply form when other statuses are selected (only if forms exist)
                    if (window.hasReplyForms) {
                        $('.reply-form-container').show();
                    }
                    // Restore reply-content form-container fields as required
                    toggleReplyFormRequirement(true);
                }
            }
        });
    });
}

// Toggle required attribute for reply-content form-container fields
function toggleReplyFormRequirement(isRequired) {
    const replyFormContainers = document.querySelectorAll('.reply-content .form-container');

    replyFormContainers.forEach(container => {
        const requiredFields = container.querySelectorAll('input[required], select[required], textarea[required]');
        const dataRequiredFields = container.querySelectorAll('input[data-required="true"], select[data-required="true"], textarea[data-required="true"]');

        if (isRequired) {
            // Restore required attributes
            requiredFields.forEach(field => {
                if (field.hasAttribute('data-was-required-removed')) {
                    field.setAttribute('required', true);
                    field.removeAttribute('data-was-required-removed');
                }
            });

            dataRequiredFields.forEach(field => {
                if (field.hasAttribute('data-was-data-required-removed')) {
                    field.setAttribute('data-required', 'true');
                    field.removeAttribute('data-was-data-required-removed');
                }
            });
        } else {
            // Remove required attributes and mark them for restoration
            requiredFields.forEach(field => {
                field.removeAttribute('required');
                field.setAttribute('data-was-required-removed', 'true');
            });

            dataRequiredFields.forEach(field => {
                field.removeAttribute('data-required');
                field.setAttribute('data-was-data-required-removed', 'true');
            });
        }
    });
}

function getStaffDetails(staffId, locationId, businessUnitId, deptId, callback, checkOutletAccess) {
    if (typeof checkOutletAccess === 'undefined') {
        checkOutletAccess = true;
    }
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            location_id: locationId,
            bu_id: businessUnitId,
            deptId: deptId,
            check_outlet_access: checkOutletAccess ? 1 : 0,
            action: 'getStaffDetails'
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error fetching staff details'), { context: 'getStaffDetails', staffId: staffId, locationId: locationId, businessUnitId: businessUnitId, status: status, error: error });
            callback("Unknown");
        }
    });
}

function getReferredFrom(staffId, locationId, businessUnitId, callback) {
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            location_id: locationId,
            bu_id: businessUnitId,
            action: 'getReferredFrom'
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error fetching referred from staff'), { context: 'getReferredFrom', staffId: staffId, locationId: locationId, businessUnitId: businessUnitId, status: status, error: error });
            callback("Unknown");
        }
    });
}

function isStaffMatch(staffId, deptId, callback) {
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staffId: staffId,
            deptId: deptId,
            action: 'isStaffMatch'
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error fetching staff details'), { context: 'isStaffMatch', staffId: staffId, deptId: deptId, status: status, error: error });
            callback("Unknown");
        }
    });
}

function isLocationMatch(staffId, locationId, businessUnitId, callback) {
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staffId: staffId,
            locationId: locationId,
            businessUnitId: businessUnitId,
            action: 'isLocationMatch'
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error checking location match'), { context: 'isLocationMatch', staffId: staffId, locationId: locationId, businessUnitId: businessUnitId, status: status, error: error });
            callback(false);
        }
    });
}

function getRecipientDetails(location, businessUnit, callback) {
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            location: location,
            business_unit: businessUnit,
            action: 'getRecipientDetails'
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error fetching recipient details'), { context: 'getRecipientDetails', location: location, businessUnit: businessUnit, status: status, error: error });
            callback(null);
        }
    });
}

function getCreationAnswers(referralDetails) {
    var answered = [];
    if (!referralDetails || !referralDetails.length) {
        return answered;
    }
    var firstSeq = referralDetails[0];
    if (!firstSeq || !firstSeq.referral_details) {
        return answered;
    }
    firstSeq.referral_details.forEach(function (rd) {
        if (!rd.form_details) {
            return;
        }
        var formId = rd.form_id;
        Object.values(rd.form_details).forEach(function (detail) {
            if (Array.isArray(detail.field_data)) {
                detail.field_data.forEach(function (opt) {
                    if (opt.is_answer) {
                        answered.push({ form_detail_id: opt.form_detail_id, form_id: formId });
                    }
                });
            }
        });
    });
    return answered;
}

function displayContent(businessUnitId, targetSelector, referralDetails = null) {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: {
            action: 'form-details',
            business_unit_id: businessUnitId
        },
        success: function (response) {
            let forms = response.data.forms;

            var creationAnswers = getCreationAnswers(referralDetails);

            $('.reply-content').hide();
            const targetDiv = $(targetSelector);
            targetDiv.show();
            targetDiv.find('[data-required="true"]').prop('required', true);
            targetDiv.find('.form-container').remove();

            const bu_id_reply = $('<input type="text" name="bu_id_reply" hidden value=' + businessUnitId + ' readonly/>');
            targetDiv.append(bu_id_reply);

            forms.forEach(({ form_id, label_name, is_hidden, display_on, form_details, conditions }) => {
                // Skip hidden forms
                if (is_hidden === true) {
                    return;
                }
                // Skip creation-only forms in reply context
                if (display_on === 'creation') {
                    return;
                }
                // Evaluate conditions against creation answers.
                // A condition is triggered only when the answered form_detail_id matches
                // trigger_form_detail_id AND the answer came from the same form
                // (trigger_form_id matches the form_id recorded in referral_details).
                if (Array.isArray(conditions) && conditions.length > 0) {
                    var triggered = conditions.some(function (c) {
                        return creationAnswers.some(function (a) {
                            return a.form_detail_id === c.trigger_form_detail_id &&
                                   a.form_id === c.trigger_form_id;
                        });
                    });
                    if (!triggered) {
                        return;
                    }
                }
                const formContainer = $('<div class="form-container mb-3"></div>');

                // Handle new API structure where form_details is an object
                Object.values(form_details || {}).forEach(detail => {
                    const { field_name, field_type, is_required, field_value } = detail;

                    const errorId = 'error-' + field_name;
                    const labelText = label_name + (is_required ? '<span style="color:red;">*</span>' : '');

                    let wrapper;
                    let input;

                    wrapper = $('<div class="mb-2"></div>');

                    if ((field_type === 'radio' || field_type === 'checkbox') && Array.isArray(field_value)) {
                        wrapper = $('<div class="mb-2"></div>');
                        const label = $('<p class="r-text"></p>').html(labelText);
                        input = $('<div></div>');

                        field_value.forEach((option, index) => {
                            const optionWrapper = $('<div class="form-check"></div>');
                            const inputField = $('<input>', {
                                type: field_type,
                                class: 'form-check-input border',
                                name: field_name + (field_type === 'checkbox' ? '[]' : ''),
                                value: option.form_detail_id,
                            });
                            if (is_required) {
                                inputField.attr('data-required', 'true');
                                inputField.attr('data-group', field_name);
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
                            required: is_required
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
                            required: is_required
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

            // Add compulsory fields: Post Diagnosis, Outcome, Feedback
            const postDiagnosisWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Post Diagnosis<span style="color:red;">*</span></p>
                    <textarea name="post_diagnosis" id="post_diagnosis"
                        class="form-control form-control-sm" rows="10"></textarea>
                    <div id="error-post_diagnosis" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const outcomeWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Outcome</p>
                    <textarea name="outcome" id="outcome"
                        class="form-control form-control-sm" rows="10"></textarea>
                    <div id="error-outcome" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const feedbackWrapper = $(`
                <div class="mb-2" style="display:none;">
                    <p class="r-text">Feedback</p>
                    <textarea name="feedback" id="feedback"
                        class="form-control form-control-sm" rows="10"></textarea>
                    <div id="error-feedback" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const remarksWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Additional Remarks</p>
                    <textarea name="additional_remarks_reply" id="additional_remarks_reply"
                        class="form-control form-control-sm" rows="10"></textarea>
                </div>
            `);

            targetDiv.append(postDiagnosisWrapper);
            targetDiv.append(outcomeWrapper);
            targetDiv.append(feedbackWrapper);
            targetDiv.append(remarksWrapper);
        },
        error: function (xhr, status, error) {
            logError(new Error('Failed to display form details'), { context: 'displayContent', businessUnitId: businessUnitId, status: status, error: error });
        }
    });
}

function getCustomer(custid, callback) {
    $.ajax({
        url: 'referral/backend.php?action=searchCustomer',
        method: 'POST',
        data: {
            customer_id: custid,
        },
        dataType: 'json',
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            logError(new Error('Error fetching customer data'), { context: 'getCustomer', custid: custid, status: status, error: error });
            callback("Unknown");
        }
    });
}

function initialTreatment(initialTreatment, bu_id, targetPanel, additionalRemarks) {
    $('.content').hide();
    const targetDiv = $('.business-unit-' + bu_id);
    targetDiv.show();
    targetDiv.find('[data-required="true"]').prop('required', true);
    $('.content .form-container').remove();

    initialTreatment.forEach(function ({ form_id, label_name, is_hidden, form_details, form_answer }) {
        const formContainer = $('<div class="form-container mb-3"></div>');
        const normalizedDetails = Array.isArray(form_details)
            ? form_details
            : Object.values(form_details || {});

        normalizedDetails.forEach(detail => {
            const {
                field_name,
                field_type,
                is_required,
                field_data = []
            } = detail;

            const errorId = 'error-' + field_name;
            const labelText = label_name + (is_required ? ' <span style="color:red;">*</span>' : '');

            let wrapper;
            let input;

            if ((field_type === 'radio' || field_type === 'checkbox') && Array.isArray(field_data)) {
                wrapper = $('<div class="mb-2"></div>');
                const label = $('<p class="r-text"></p>').html(labelText);
                input = $('<div></div>');

                field_data.forEach(option => {
                    const optionWrapper = $('<div class="form-check"></div>');
                    const inputField = $('<input>', {
                        type: field_type,
                        class: 'form-check-input border',
                        name: field_name + (field_type === 'checkbox' ? '[]' : ''),
                        value: option.form_detail_id,
                        required: is_required,
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

            } else if (field_type === 'select' && Array.isArray(field_data)) {
                wrapper = $('<div class="col mb-2"></div>');
                const label = $('<p class="r-text"></p>').html(labelText);
                input = $('<select>', {
                    name: field_name,
                    id: field_name,
                    class: 'form-select form-select-sm text-capitalize',
                    required: is_required,
                    disabled: true
                });

                input.append($('<option>', {
                    value: '',
                    text: 'Select ' + field_name
                }));

                field_data.forEach(option => {
                    const optionEl = $('<option>', {
                        value: option.form_detail_id,
                        text: option.field_value
                    });

                    if (option.is_answer) {
                        optionEl.prop('selected', true);
                    }

                    input.append(optionEl);
                });

                wrapper.append(label, input);

            } else if (field_type === 'textarea') {
                wrapper = $('<div class="mb-2"></div>');
                const label = $('<p class="r-text"></p>').html(labelText);

                const answer = field_data.find(d => d.is_answer) || {};
                const value = answer.field_value || '';

                input = $('<textarea>', {
                    name: field_name,
                    class: 'form-control form-control-sm',
                    rows: 10,
                    readonly: true
                }).css('white-space', 'pre-wrap').val(value);

                wrapper.append(label, input);
            } else {
                wrapper = $('<div class="mb-2"></div>');
                const label = $('<p class="r-text"></p>').html(labelText);

                const answer = field_data.find(d => d.is_answer) || {};
                const value = answer.field_value || '';

                input = $('<input>', {
                    type: field_type,
                    name: field_name,
                    class: 'form-control form-control-sm',
                    value: value,
                    required: is_required,
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

        targetPanel.append(formContainer);
    });
}

function referralAccordion() {
    document.addEventListener("click", function (e) {
        const accordion = e.target.closest(".referral-accordion");

        if (accordion && !accordion.classList.contains("disabled")) {
            // Close all other accordions first
            const allAccordions = document.querySelectorAll(".referral-accordion");
            allAccordions.forEach(function (otherAccordion) {
                if (otherAccordion !== accordion) {
                    otherAccordion.classList.remove("active");
                    const otherPanel = otherAccordion.nextElementSibling;
                    otherPanel.style.maxHeight = null;
                }
            });

            // Toggle the clicked accordion
            accordion.classList.toggle("active");

            const panel = accordion.nextElementSibling;
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
            } else {
                panel.style.maxHeight = panel.scrollHeight + "px";
            }
        }
    });
}

// PDF download handler for accordion history
$(document).on('click', '.download-history-pdf-btn, .download-history-pdf-btn i', function(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent accordion toggle

    // Get the link element (in case user clicked the icon)
    const $btn = $(this).hasClass('download-history-pdf-btn') ? $(this) : $(this).closest('.download-history-pdf-btn');

    const referralId = $btn.data('id');
    const sequence = $btn.data('sequence');
    const timestamp = $btn.data('timestamp');

    // Generate filename: referral_17_seq2_2025-12-15_10-30-45.pdf
    const formattedTimestamp = timestamp ? timestamp.replace(/[:.]/g, '-').replace('T', '_').split('.')[0] : '';
    const fileName = `referral_${referralId}_seq${sequence}_${formattedTimestamp}.pdf`;

    // Show loading state with spinning icon
    const originalHTML = $btn.html();
    $btn.html('<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i>').prop('disabled', true);

    // Add spin animation if not already in CSS
    if (!document.getElementById('spin-animation-style')) {
        const style = document.createElement('style');
        style.id = 'spin-animation-style';
        style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: JSON.stringify({
            action: 'download-external-form',
            referral_id: referralId,
            sequence: sequence || null
        }),
        contentType: 'application/json',
        xhrFields: {
            responseType: 'blob'
        },
        success: function (response) {
            try {
                // Try to read the response as text first to check for JSON error
                const reader = new FileReader();
                reader.onload = function () {
                    try {
                        // Check if response is JSON (error response)
                        const jsonResponse = JSON.parse(reader.result);
                        if (!jsonResponse.success) {
                            alert(jsonResponse.message || 'Failed to download PDF. Please try again.');
                            $btn.html(originalHTML).prop('disabled', false);
                            return;
                        }
                    } catch (e) {
                        // Not JSON - treat as PDF binary
                        const blob = new Blob([response], { type: 'application/pdf' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;

                        // Trigger browser download
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);

                        // Show success message if toast available
                        if (window.toast) {
                            toast.success(`PDF downloaded: ${fileName}`);
                        }
                    }

                    // Restore button
                    $btn.html(originalHTML).prop('disabled', false);
                };
                reader.readAsText(response);
            } catch (error) {
                console.error('Download error:', error);
                alert('Failed to download PDF. Please try again.');
                $btn.html(originalHTML).prop('disabled', false);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX error:', status, error);
            alert('Failed to download PDF. Please try again.');
            $btn.html(originalHTML).prop('disabled', false);
        }
    });
});

function referAnother() {
    const checkbox = document.getElementById('refer_another');
    const referBusinessUnit = document.getElementById('refer_business_unit');
    const referLocation = document.getElementById('refer_location');
    const externalReferralCheckboxContainer = document.getElementById('external-referral-checkbox-container');
    const externalReferralCheckbox = document.getElementById('refer_external_referral');

    checkbox.addEventListener('change', function () {
        const isChecked = this.checked;

        referBusinessUnit.disabled = !isChecked;
        referLocation.disabled = !isChecked;

        if (!isChecked) {
            referBusinessUnit.innerHTML = '<option value="">Business Unit</option>';
            referLocation.innerHTML = '<option value="">Location</option>';
            $('.refer-form').hide().find('input[type="text"], textarea').val('');
            $('.refer-form').find('select').prop('selectedIndex', 0);

            // Hide and reset external referral section
            externalReferralCheckboxContainer.style.display = 'none';
            externalReferralCheckbox.checked = false;
            externalReferralCheckbox.disabled = true;
            $('#refer-external-referral-section').addClass('d-none');
            resetReferExternalReferralSection();
        } else {
            getBusinessUnits();
            // Show external referral checkbox when refer another is checked
            externalReferralCheckboxContainer.style.display = 'flex';
            externalReferralCheckbox.disabled = false;
        }
    });

    // Handle external referral checkbox toggle
    toggleReferExternalReferralSection();
}

function getBusinessUnits() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: JSON.stringify({
            action: 'business-units'
        }),
        success: function (response) {
            var referBusinessUnit = $('#refer_business_unit');

            $.each(response.data, function (index, businessUnit) {
                referBusinessUnit.append(
                    '<option value="' + businessUnit.staff_department_id + '" data-id="' + businessUnit.id + '" ' + '>' +
                    businessUnit.name + '</option>'
                );
            });

            referBusinessUnit.trigger('change');

        },
        error: function (xhr, status, error) {
            console.error('Error loading business units:', error);
            alert('Error loading business units');
        }
    });
}

function prefillReferralInfo() {
    var $form = $('.refer-form');
    // Only pre-populate when fields are still empty to avoid overwriting user edits
    if ($form.find('textarea[name="referral_reason"]').val() !== '') return;
    if (!referralDetails || referralDetails.length === 0) return;
    var lastSeq = referralDetails[referralDetails.length - 1];
    if (!lastSeq || !lastSeq.createForm) return;
    var cf = lastSeq.createForm;
    $form.find('textarea[name="referral_reason"]').val(cf.referral_reason || '');
    $form.find('textarea[name="referral_condition"]').val(cf.referral_condition || '');
    $form.find('textarea[name="medical_history"]').val(cf.medical_history || '');
}

function toggleReferForm() {
    const isChecked = $('#refer_another').is(':checked');
    const hasBusinessUnit = $('#refer_business_unit').val();

    if (isChecked && hasBusinessUnit) {
        $('.refer-form').show();
        loadReferralPriorities();
        prefillReferralInfo();
    } else {
        $('.refer-form').hide();
        $('.refer-form').find('input[type="text"], textarea').val('');
        $('.refer-form').find('select').prop('selectedIndex', 0);
    }
}

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

function validateForm(event) {
    event.preventDefault();

    let isValid = true;
    $('.error-message').text('');

    const requiredGroups = new Set();

    $('input[type="checkbox"][data-required="true"], input[type="radio"][data-required="true"]').each(function () {
        requiredGroups.add($(this).data('group'));
    });

    requiredGroups.forEach(group => {
        const inputs = $(`input[data-group="${group}"]`);
        const isChecked = inputs.is(':checked');

        if (!isChecked) {
            $(`#error-${group}`).text('Please select at least one option.');
            isValid = false;
        }
    });

    // Check if location_to field is a select element and validate it
    const locationToField = document.getElementById('location_to');
    if (locationToField && locationToField.tagName === 'SELECT') {
        const locationValue = locationToField.value;
        if (!locationValue || locationValue === '') {
            const errorLocationTo = document.getElementById('error-location-to');
            if (errorLocationTo) {
                errorLocationTo.textContent = 'Please select a location.';
                // Scroll to the error
                locationToField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            console.warn('Location not selected - form submission blocked');
            isValid = false;
        }
    }

    // Removed HTML5 validation - using JavaScript validation with red text errors instead
    const form = document.getElementById('referral-form');
    // if (!form.checkValidity()) {
    //     form.reportValidity();
    //     isValid = false;
    // }

    // Validate that status has been changed from original value
    const selectedStatus = document.querySelector('input[name="status"]:checked');
    const statusErrorElement = document.getElementById('error-status');

    // Only validate status change if status radios are not disabled
    const firstStatusRadio = document.querySelector('input[name="status"]');
    const statusRadiosDisabled = firstStatusRadio && firstStatusRadio.disabled;

    console.log('=== STATUS VALIDATION DEBUG ===');
    console.log('statusRadiosDisabled:', statusRadiosDisabled);
    console.log('originalStatus:', originalStatus);
    console.log('selectedStatus:', selectedStatus);
    console.log('selectedStatus.value:', selectedStatus ? selectedStatus.value : 'null');
    console.log('statusErrorElement exists:', !!statusErrorElement);
    console.log('Condition check:', !statusRadiosDisabled && originalStatus !== null);

    if (!statusRadiosDisabled && originalStatus !== null) {
        if (!selectedStatus) {
            // No status selected at all
            if (statusErrorElement) {
                statusErrorElement.textContent = 'Please select a status.';
                statusErrorElement.style.display = 'block';
                // Scroll to error for visibility
                const statusContainer = document.getElementById('status-options');
                if (statusContainer) {
                    statusContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            isValid = false;
        } else if (String(selectedStatus.value) === originalStatus) {
            // Status hasn't been changed from original
            if (statusErrorElement) {
                statusErrorElement.textContent = 'Please update the referral status before submitting.';
                statusErrorElement.style.display = 'block';
                // Scroll to error for visibility
                const statusContainer = document.getElementById('status-options');
                if (statusContainer) {
                    statusContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            isValid = false;
        } else {
            // Status has been changed - clear any error
            if (statusErrorElement) {
                statusErrorElement.textContent = '';
                statusErrorElement.style.display = 'none';
            }
        }
    }

    // Validate Post Diagnosis field when status is not 5
    if (!selectedStatus || selectedStatus.value !== '5') {
        const postDiagnosis = document.getElementById('post_diagnosis');

        if (postDiagnosis && !postDiagnosis.value.trim()) {
            document.getElementById('error-post_diagnosis').textContent = 'Post Diagnosis is required.';
            isValid = false;
        }
    }

    // Add validation for status_note when status 5 is selected
    const statusNoteTextarea = document.getElementById('status_note');
    const statusNoteError = document.getElementById('error-status_note');

    if (selectedStatus && selectedStatus.value === '5') {
        if (!statusNoteTextarea || !statusNoteTextarea.value.trim()) {
            if (statusNoteError) {
                statusNoteError.textContent = 'Status note is required when status is "Not Present".';
            }
            isValid = false;
        }

        // Double check: For status 5, reply-content form-container fields should be nullable
        // Clear any validation errors for reply-content fields when status is 5
        const replyFormContainers = document.querySelectorAll('.reply-content .form-container');
        replyFormContainers.forEach(container => {
            const errorMessages = container.querySelectorAll('.error-message');
            errorMessages.forEach(error => {
                error.textContent = '';
            });
        });
    } else {
        // For other statuses, ensure reply-content validation is enforced
        const replyFormContainers = document.querySelectorAll('.reply-content .form-container');
        replyFormContainers.forEach(container => {
            const requiredFields = container.querySelectorAll('input[data-was-required-removed], select[data-was-required-removed], textarea[data-was-required-removed]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    const fieldName = field.getAttribute('name');
                    const errorElement = document.getElementById(`error-${fieldName}`);
                    if (errorElement) {
                        errorElement.textContent = 'This field is required.';
                    }
                    isValid = false;
                }
            });
        });
    }

    // Validate refer another section
    var isReferAnother = $('#refer_another').is(':checked');
    if (isReferAnother) {
        var isReferExternal = $('#refer_external_referral').is(':checked');
        if (isReferExternal) {
            var isNewReferOrgVisible = $('#refer-new-organization-section').is(':visible');
            if (isNewReferOrgVisible) {
                var newReferOrgName = $('#refer-new-org-name').val().trim();
                if (!newReferOrgName) {
                    $('#error-refer-new-org-name').text('Organization name is required.');
                    isValid = false;
                }
            } else {
                var referOrgVal = $('#refer_organization').val();
                if (!referOrgVal) {
                    $('#error-refer-organization').text('Please select an organization.');
                    isValid = false;
                }
            }
        } else {
            var referBusUnit = $('#refer_business_unit').val();
            if (!referBusUnit) {
                $('#error-refer-business-unit').text('Please select a business unit.');
                isValid = false;
            }
            var referLoc = $('#refer_location').val();
            if (!referLoc) {
                $('#error-refer-location').text('Please select a location.');
                isValid = false;
            }
        }
    }

    if (isValid) {
        // form.submit();

        // NEW: Add confirmation dialog for status change
        const selectedStatus = document.querySelector('input[name="status"]:checked');
        const firstStatusRadio = document.querySelector('input[name="status"]');
        const statusRadiosDisabled = firstStatusRadio && firstStatusRadio.disabled;

        // Check if status radios are enabled (validation should apply)
        if (!statusRadiosDisabled && selectedStatus && originalStatus !== null && String(selectedStatus.value) !== originalStatus) {
            // Status has changed - show confirmation
            const statusName = statusMapping[selectedStatus.value] || 'selected status';
            const confirmMessage = 'Are you sure you want to change status to ' + statusName + '?';

            if (!confirm(confirmMessage)) {
                // User cancelled - stop submission
                return;
            }
        }
        // END NEW CODE

        const formData = new FormData(form);
        allUploadedFiles.forEach(file => {
            formData.append('attachments[]', file);
        });

        // Manually add location_to value if it's a select element
        const locationToField = document.getElementById('location_to');
        if (locationToField && locationToField.tagName === 'SELECT') {
            const locationValue = locationToField.value;
            // FormData should capture it, but ensure it's there
            if (locationValue && !formData.has('location_to')) {
                formData.set('location_to', locationValue);
            }
        }

        // Capture status value for conditional redirect
        const selectedStatusRadio = document.querySelector('input[name="status"]:checked');
        const statusValue = selectedStatusRadio ? selectedStatusRadio.value : null;

        // Capture referral ID for successful.php redirect
        const referralIdField = document.querySelector('input[name="referral_id"]');
        const referralId = referralIdField ? referralIdField.value : null;

        // Show loading overlay
        showLoadingOverlay();

        // Disable submit button to prevent double submission
        $('.form-btn-submit').prop('disabled', true);

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

        fetch('referral/update.php', {
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
                    // Success - redirect (no need to hide overlay, page will redirect)
                    if (inner.new_sequence && inner.referral_id) {
                        // refer_another was submitted - pass from-sequence (new_sequence - 1) so the
                        // successful endpoint resolves the new TO hierarchy (new_sequence)
                        window.location.href = 'referral/successful.php?id=' + inner.referral_id + '&sequence=' + (inner.new_sequence - 1);
                    } else if (statusValue === '3' && referralId) {
                        // Status 3 (Referred) - redirect to successful.php with referral ID and sequence

                        // Get the current/latest sequence (the one being submitted)
                        let sequenceParam = '';

                        if (referralDetails && referralDetails.length > 0) {
                            // Use the last sequence in the array (the current referral)
                            const currentSequence = referralDetails[referralDetails.length - 1].sequence;
                            sequenceParam = '&sequence=' + currentSequence;
                        }

                        window.location.href = 'referral/successful.php?id=' + referralId + sequenceParam;
                    } else {
                        // All other statuses - redirect to index.php
                        window.location.href = 'referral/index.php';
                    }
                } else {
                    // Error response - hide loading and re-enable button
                    hideLoadingOverlay();
                    $('.form-btn-submit').prop('disabled', false);

                    console.log('Failed:', inner.message);

                    // Show error message to user
                    if (window.toast) {
                        toast.error(inner.message || 'Update failed. Please try again.');
                    } else {
                        alert(inner.message || 'Update failed. Please try again.');
                    }
                }

            })
            .catch(error => {
                // Network error - hide loading and re-enable button
                hideLoadingOverlay();
                $('.form-btn-submit').prop('disabled', false);

                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });

                // Show error message to user
                if (window.toast) {
                    toast.error('An error occurred while updating. Please try again.');
                } else {
                    alert('An error occurred while updating. Please try again.');
                }
            });
    }
}

// Toggle external referral section for "Refer Another"
function toggleReferExternalReferralSection() {
    $('#refer_external_referral').on('change', function () {
        if ($(this).is(':checked')) {
            $('#refer-external-referral-section').removeClass('d-none');
            $('#refer_business_unit, #refer_location').prop('disabled', true);
            $('#refer_organization, #refer_referee').prop('disabled', false);

            // Show the referring indication form (referral_reason, referral_condition, medical_history)
            $('.refer-form').show();
            loadReferralPriorities();
            prefillReferralInfo();

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
                        var $org = $('#refer_organization');
                        $org.empty().append('<option value="">Organization</option>');
                        externalOrganizations.forEach(function (org) {
                            $org.append('<option value="' + org.id + '">' + org.name + '</option>');
                        });
                    }
                    $('#refer_referee').empty().append('<option value="">Recipient (Optional)</option>');
                    $('#refer_organization, #refer_referee').val('');
                }
            });

            $('#refer_organization').on('change', function () {
                var orgId = $(this).val();
                if (!orgId) {
                    $('#refer_referee').empty().append('<option value="">Recipient (Optional)</option>');
                    $('#refer-add-new-recipient-btn').prop('disabled', true);
                    return;
                }

                // Enable add recipient button when organization is selected
                $('#refer-add-new-recipient-btn').prop('disabled', false);

                var org = externalOrganizations.find(function (o) { return o.id == orgId; });
                if (org) {
                    var $ref = $('#refer_referee');
                    $ref.empty().append('<option value="">Recipient (Optional)</option>');
                    if (org.referees && org.referees.length) {
                        org.referees.forEach(function (r) {
                            $ref.append('<option value="' + r.id + '">' + r.name + ' (' + r.position + ')</option>');
                        });
                    }
                }
            });
        } else {
            $('#refer-external-referral-section').addClass('d-none');
            $('#refer_business_unit, #refer_location').prop('disabled', false);
            $('#refer_organization, #refer_referee').prop('disabled', true);

            // Hide referring indication form when external referral is unchecked
            // Only hide if business unit is also not selected
            if (!$('#refer_business_unit').val()) {
                $('.refer-form').hide();
            }

            resetReferExternalReferralSection();
        }
    });
}

// Reset external referral section
function resetReferExternalReferralSection() {
    // Hide and reset new organization section
    $('#refer-new-organization-section').hide();
    $('#refer-new-org-name').val('');
    $('#refer-new-org-address').val('');
    $('#refer-new-org-postcode').val('');
    $('#refer-new-org-state').val('');
    $('#refer-new-org-country').val('Malaysia');
    $('#error-refer-new-org-name').html('');
    $('#refer-add-new-org-btn').show();

    // Hide and reset new recipient section
    $('#refer-new-recipient-section').hide();
    $('#refer-new-recipient-name').val('');
    $('#refer-new-recipient-email').val('');
    $('#refer-new-recipient-phone').val('');
    $('#refer-new-recipient-position').val('');
    $('#error-refer-new-recipient-name').html('');
    $('#error-refer-new-recipient-email').html('');
    $('#error-refer-new-recipient-phone').html('');
    $('#error-refer-new-recipient-position').html('');
    $('#refer-add-new-recipient-btn').show().prop('disabled', true);

    // Reset organization and referee dropdowns
    $('#refer_organization').empty().append('<option value="">Organization</option>');
    $('#refer_referee').empty().append('<option value="">Recipient (Optional)</option>');
}

// Handle "Add New Organization" button click for refer another
$('#refer-add-new-org-btn').on('click', function () {
    $('#refer-new-organization-section').show();
    $('#refer_organization').val('').prop('disabled', true);
    $('#refer_referee').val('').prop('disabled', true);
    $(this).hide();

    // Enable add recipient button when creating new org
    $('#refer-add-new-recipient-btn').prop('disabled', false);
});

// Handle "Cancel" button click for new organization
$('#refer-cancel-new-org-btn').on('click', function () {
    $('#refer-new-organization-section').hide();
    $('#refer_organization').prop('disabled', false);
    $('#refer_referee').prop('disabled', false);
    $('#refer-add-new-org-btn').show();

    // Clear new organization fields
    $('#refer-new-org-name').val('');
    $('#refer-new-org-address').val('');
    $('#refer-new-org-postcode').val('');
    $('#refer-new-org-state').val('');
    $('#refer-new-org-country').val('Malaysia');
    $('#error-refer-new-org-name').html('');

    // Also close new recipient section if it was open
    if ($('#refer-new-recipient-section').is(':visible')) {
        $('#refer-new-recipient-section').hide();
        $('#refer-new-recipient-name').val('');
        $('#refer-new-recipient-email').val('');
        $('#refer-new-recipient-phone').val('');
        $('#refer-new-recipient-position').val('');
        $('#error-refer-new-recipient-name').html('');
        $('#error-refer-new-recipient-email').html('');
        $('#error-refer-new-recipient-phone').html('');
        $('#error-refer-new-recipient-position').html('');
        $('#refer-add-new-recipient-btn').show();
    }

    // Disable add recipient button if no organization selected
    if (!$('#refer_organization').val()) {
        $('#refer-add-new-recipient-btn').prop('disabled', true);
    }
});

// Handle "Add New Recipient" button click for refer another
$('#refer-add-new-recipient-btn').on('click', function () {
    // Check if organization is selected or new org form is visible
    var hasOrganization = $('#refer_organization').val() || $('#refer-new-organization-section').is(':visible');

    if (!hasOrganization) {
        alert('Please select or create an organization first before adding a recipient.');
        return;
    }

    $('#refer-new-recipient-section').show();
    $('#refer_referee').val('').prop('disabled', true);
    $(this).hide();
});

// Handle "Cancel" button click for new recipient
$('#refer-cancel-new-recipient-btn').on('click', function () {
    $('#refer-new-recipient-section').hide();
    $('#refer_referee').prop('disabled', false);
    $('#refer-add-new-recipient-btn').show();

    // Clear new recipient fields
    $('#refer-new-recipient-name').val('');
    $('#refer-new-recipient-email').val('');
    $('#refer-new-recipient-phone').val('');
    $('#refer-new-recipient-position').val('');
    $('#error-refer-new-recipient-name').html('');
    $('#error-refer-new-recipient-email').html('');
    $('#error-refer-new-recipient-phone').html('');
    $('#error-refer-new-recipient-position').html('');
});

// Handle Takeover Referral functionality
function handleTakeoverReferral(toReferral, referralDetails) {
    if (!confirm('Are you sure you want to takeover this referral? You will be assigned as the recipient.')) {
        return;
    }

    // 1. Update recipient_to field to current user's name
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            action: 'getStaffName'
        },
        dataType: 'json',
        success: function (staffName) {
            if (staffName) {
                $('#recipient_to').val(staffName);
            }
        }
    });

    // 2. Make location_to editable and populate with select2
    const locationToField = $('#location_to');
    const fieldId = locationToField.attr('id');
    const fieldName = locationToField.attr('name');

    // Get staff locations and create select dropdown
    $.ajax({
        url: 'referral/backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            action: 'getStaffLocation'
        },
        dataType: 'json',
        success: function (locations) {
            if (locations && locations.length > 0) {
                // Create select element
                const selectElement = $('<select>', {
                    id: fieldId,
                    name: fieldName,
                    class: 'form-select form-select-sm',
                    required: true
                });

                selectElement.append($('<option>', {
                    value: '',
                    text: 'Select Location'
                }));

                locations.forEach(function (location) {
                    selectElement.append($('<option>', {
                        value: location.id,
                        text: location.code
                    }));
                });

                // Replace input with select
                locationToField.replaceWith(selectElement);

                // Initialize select2
                $('#location_to').select2({
                    allowClear: true,
                    width: '100%',
                    dir: 'ltr',
                    dropdownAutoWidth: false,
                    minimumResultsForSearch: 5,
                    placeholder: 'Select Location',
                    templateResult: function (data) {
                        if (!data.id) {
                            return data.text;
                        }
                        return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
                    },
                    templateSelection: function (data) {
                        return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
                    }
                });
            }
        }
    });

    // 3. Set updated_recipient_to to current user's ID
    $('#updated_recipient_to').val(staffId);

    // 4. Enable reply form and show it
    window.hasReplyForms = true;
    window.isLastSequence = true;
    $('.reply-form-container').show();

    // 5. Display content/forms for reply
    displayContent(toReferral.business_unit_id, '.reply-content', referralDetails);

    // 6. Show "Refer Another" container and submit button
    $('.refer-another-container').show();
    $('.form-btn-submit').show();

    // 7. Enable status radios IMMEDIATELY (don't wait for AJAX)
    $('input[name="status"]').prop('disabled', false);

    // 8. Reload status options
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'get-referral', referral_id: referral_id, view_only: viewOnly },
        dataType: 'json',
        success: function (response) {
            if (response && response.data) {
                // Update originalStatus immediately for validation baseline
                originalStatus = String(response.data.status);
                loadStatusOptions(response.data.status, false, response.data.status_note);
            }
        }
    });

    // 9. Hide takeover button after takeover
    $('#takeover-button-container').hide();

    if (window.toast) {
        toast.success('You have successfully taken over this referral. You can now update the form.');
    } else {
        alert('You have successfully taken over this referral. You can now update the form.');
    }
}

