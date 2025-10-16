$(document).ready(function () {
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
        url: 'api-jwt.php',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'get-referral',
            referral_id: referral_id
        }),
        success: function (response) {
            var data = response.data;

            // Referral Details
            let referralDetails = data.referralDetails;

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
                    getStaffDetails(fromReferral.staff_id, fromReferral.location, fromReferral.business_unit_id, department, function (staffResponse) {
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
                    organization.val(externalRef.organization || '');
                    location_organization.val(externalRef.state || '');
                    referee.val(externalRef.name || '');

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
                        getStaffDetails(toReferral.staff_id, toReferral.location, toReferral.business_unit_id, department, function (staffResponse) {
                            if (staffResponse && staffResponse.length > 0) {
                                recipientTo.val(staffResponse[0].staff || '');
                                business_unit_to.val(staffResponse[0].business_unit || '');
                                location_to.val(staffResponse[0].outlet || '');
                            }
                        });
                    } else {
                        $.ajax({
                            url: 'backend.php',
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

                        // When staff_id is null
                        if (toReferral.location === null && fromReferral.staff_id != staffId) {
                            // Location is also null - get staff name, business unit name, and all user locations
                            $.ajax({
                                url: 'backend.php',
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
                                url: 'backend.php',
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

            // Sort asc by sequence
            const sortedReferrals = referralDetails.sort((a, b) => a.sequence - b.sequence);

            const referralHistoryContainer = $('#referralHistoryContainer');

            // Process referral history (only include filled sequences)
            const referralHistoryItems = sortedReferrals.filter(rd => rd.is_filled === true);
            let processedCount = 0;
            const totalItems = referralHistoryItems.length;

            if (totalItems > 0) {
                const accordionQueue = [];

                referralHistoryItems.forEach((rd, index) => {
                    // Get staff details first to populate accordion header
                    getStaffDetails(rd.staff_id, rd.location, rd.business_unit_id, department, function (staffResponse) {
                        const staff = staffResponse && staffResponse.length > 0 ? staffResponse[0].staff : 'Unknown';
                        const contact = staffResponse && staffResponse.length > 0 ? staffResponse[0].contact : '';
                        const businessUnit = staffResponse && staffResponse.length > 0 ? staffResponse[0].business_unit : '';
                        const outlet = staffResponse && staffResponse.length > 0 ? staffResponse[0].outlet : '';

                        // Store accordion data in queue instead of immediately appending
                        const accordionData = {
                            sequence: rd.sequence,
                            rd: rd,
                            staff: staff,
                            businessUnit: businessUnit,
                            outlet: outlet,
                            contact: contact,
                            staff_department_id: rd.business_unit_id,
                            createdAt: rd.created_at,
                            originalIndex: index
                        };

                        accordionQueue.push(accordionData);
                        processedCount++;

                        // When all AJAX calls are complete, sort and display accordions
                        if (processedCount === totalItems) {
                            // Sort by sequence to maintain order
                            accordionQueue.sort((a, b) => a.sequence - b.sequence);

                            // Now append accordions in correct sequence order
                            accordionQueue.forEach((accordionData, sortedIndex) => {
                                const { rd, staff, businessUnit, outlet, contact } = accordionData;

                                const accordionHtml = `
                                    <div class="referral-history" data-sequence="${rd.sequence}">
                                        <button type="button" class="referral-accordion${rd.is_filled == 0 ? ' disabled' : ''}">
                                            <div class="referral-accordion-content">
                                                <div class="referral-text">
                                                    <span class="referral-title">
                                                        ${businessUnit}, ${staff}, ${outlet}</span>
                                                    <span class="referral-date">${rd.created_at}</span>
                                                </div>
                                            </div>
                                        </button>
                                        <div class="referral-panel">
                                            <div class="referral-panel-item" data-bu="${rd.business_unit_id}"></div>
                                            <div class="referral-pic"></div>
                                        </div>
                                    </div>
                                `;

                                referralHistoryContainer.append(accordionHtml);

                                // Prepare data for processAccordionContent function
                                const queueItem = {
                                    rd: rd,
                                    staff: staff,
                                    businessUnit: businessUnit,
                                    outlet: outlet,
                                    contact: contact,
                                    staff_department_id: rd.business_unit_id,
                                    createdAt: rd.created_at
                                };

                                const panel = $(`[data-sequence="${rd.sequence}"] .referral-panel-item`);
                                const accordion = $(`[data-sequence="${rd.sequence}"]`);
                                const shouldAutoOpen = (sortedIndex === accordionQueue.length - 1); // Auto-open last accordion (highest sequence)

                                processAccordionContent(queueItem, panel, accordion, shouldAutoOpen);
                            });
                        }
                    });
                });
            }

            // Global flag to control reply-form-container visibility based on referral_details
            window.hasReplyForms = false;
            window.isLastSequence = false;

            // Get status early for use in async callbacks
            let status = data.status;

            if (referralDetails && referralDetails.length > 0) {
                const lastSequence = referralDetails[referralDetails.length - 1];

                // Check if external referral - hide reply form
                if (lastSequence.external_referral && lastSequence.external_referral.length > 0) {
                    window.hasReplyForms = false;
                    window.isLastSequence = false;
                    $('.reply-form-container').hide();
                }
                // Check is_filled status - if true, hide reply form regardless of other conditions
                else if (lastSequence.is_filled === true) {
                    window.hasReplyForms = false;
                    window.isLastSequence = false;
                    $('.reply-form-container').hide();
                }
                // Check if referral_details exist but not empty (safety check)
                else if (!lastSequence.referral_details || (lastSequence.referral_details.length === 0 && lastSequence.staff_id !== null)) {
                    window.hasReplyForms = false;
                    window.isLastSequence = false;
                    $('.reply-form-container').hide();
                }
                // Only show reply form if current user is the staff in last sequence
                else if (lastSequence.staff_id) {
                    // Check if current user matches the staff_id in last sequence
                    if (lastSequence.staff_id === staffId) {
                        // Current user is the staff in last sequence - show reply form and populate forms
                        window.hasReplyForms = true;
                        window.isLastSequence = true;
                        $('.reply-form-container').show();
                        displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
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
                            // Department matches - show reply form and populate forms
                            window.hasReplyForms = true;
                            window.isLastSequence = true;
                            $('.reply-form-container').show();

                            // Check if referral_details is empty - show all forms
                            if (lastSequence.referral_details && lastSequence.referral_details.length === 0) {
                                displayContent(lastSequence.business_unit_id, '.reply-content', null);
                            } else {
                                displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                            }

                            // Show "Refer Another" container and submit button when department matches
                            $('.refer-another-container').show();
                            if (status != 4 && status != 5) {
                                $('.form-btn-submit').show();
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
                            // Department matches - show reply form and populate forms
                            window.hasReplyForms = true;
                            window.isLastSequence = true;
                            $('.reply-form-container').show();

                            // Check if referral_details is empty - show all forms
                            if (lastSequence.referral_details && lastSequence.referral_details.length === 0) {
                                displayContent(lastSequence.business_unit_id, '.reply-content', null);
                            } else {
                                displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                            }

                            // Show "Refer Another" container and submit button when department matches
                            $('.refer-another-container').show();
                            if (status != 4 && status != 5) {
                                $('.form-btn-submit').show();
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
                url: 'backend.php?action=getLocations',
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

    // Display Referral Feedback from replyForm object
    if (rd.replyForm && Object.keys(rd.replyForm).length > 0 && (rd.replyForm.post_diagnosis || rd.replyForm.outcome || rd.replyForm.feedback)) {
        panel.append(`
            <div class="referral-feedback-section border-bottom pb-3 mb-3">
                <p class="r-title">Previous Feedback</p>
                <div class="mb-2">
                    <p class="r-text">Post Diagnosis</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.replyForm.post_diagnosis || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Outcome</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.replyForm.outcome || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Feedback</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.replyForm.feedback || 'N/A'}</textarea>
                </div>
            </div>
            `);
    }

    // Display Referral Information from createForm object
    if (rd.createForm && Object.keys(rd.createForm).length > 0 && (rd.createForm.referral_reason || rd.createForm.referral_condition || rd.createForm.medical_history)) {
        panel.append(`
            <div class="referral-info-section border-bottom pb-3 mb-3">
                <p class="r-title">Referral Information</p>
                <div class="mb-2">
                    <p class="r-text">Reason of Referral</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.createForm.referral_reason || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Details of Patient's Condition</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.createForm.referral_condition || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Relevant Medical History</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.createForm.medical_history || 'N/A'}</textarea>
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
    referralPic.html(`
        <span class="r-title">Submitted by</span><br>
        <span class="r-text">Name: ${staff} </span><br>
        <span class="r-text">Contact: ${contact} </span><br>
        <span class="r-text">Date: ${createdAt} </span><br>
        <a href="${whatsapp}" target="_blank" style="text-decoration: none;">
            <img src="img/whatsapp.png" style="width:25px;">
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
                    <img src="img/download.png" style="width:25px;"/>
                </button>` :
            `<button class="btn btn-sm btn-link text-decoration-none download-btn" title="Download" data-filename="${attachment.name}" data-attachment-id="${attachment.attachment_id}"> <img src="img/download.png" style="width:25px;"/>
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
                url: 'api-jwt.php',
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
        url: 'api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            const statusContainer = document.getElementById('status-options');
            if (statusContainer && response && response.data) {
                // Clear existing options
                statusContainer.innerHTML = '';

                // Add status options from object format {"1": "Open", "2": "In Progress", etc.}
                Object.keys(response.data).forEach(function (key) {
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
                // Add status_note textarea after fallback options
                addStatusNoteField(statusContainer, selectedStatus, statusNote);
                // Add event listeners for status change
                addStatusChangeListeners();
            }
        }
    });
}

// Add status_note textarea field
function addStatusNoteField(container, selectedStatus, statusNote = null) {
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
            <textarea class="form-control form-control-sm" name="status_note" id="status_note" rows="3" placeholder="Please provide additional details..." ${disabledAttr}>${noteValue}</textarea>
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

function getStaffDetails(staffId, locationId, businessUnitId, deptId, callback) {
    $.ajax({
        url: 'backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            location_id: locationId,
            bu_id: businessUnitId,
            deptId: deptId,
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

function isStaffMatch(staffId, deptId, callback) {
    $.ajax({
        url: 'backend.php',
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

function getRecipientDetails(location, businessUnit, callback) {
    $.ajax({
        url: 'backend.php',
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

function displayContent(businessUnitId, targetSelector, referralDetails = null) {
    $.ajax({
        url: 'api-jwt.php',
        type: 'POST',
        data: {
            action: 'form-details',
            business_unit_id: businessUnitId
        },
        success: function (response) {
            let forms = response.data.forms;

            // Filter forms based on referralDetails if provided
            if (referralDetails && referralDetails.length > 0) {
                const lastSequence = referralDetails[referralDetails.length - 1];
                if (lastSequence.referral_details && lastSequence.referral_details.length > 0) {
                    const allowedFormIds = lastSequence.referral_details.map(rd => rd.form_id);
                    forms = forms.filter(form => allowedFormIds.includes(form.form_id));
                }
            }

            $('.reply-content').hide();
            const targetDiv = $(targetSelector);
            targetDiv.show();
            targetDiv.find('[data-required="true"]').prop('required', true);
            targetDiv.find('.form-container').remove();

            const bu_id_reply = $('<input type="text" name="bu_id_reply" hidden value=' + businessUnitId + ' readonly/>');
            targetDiv.append(bu_id_reply);

            forms.forEach(({ form_id, label_name, is_hidden, form_details }) => {
                // Skip hidden forms
                if (is_hidden === true) {
                    return;
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
                        class="form-control form-control-sm" rows="5" required></textarea>
                    <div id="error-post_diagnosis" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const outcomeWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Outcome<span style="color:red;">*</span></p>
                    <textarea name="outcome" id="outcome"
                        class="form-control form-control-sm" rows="5" required></textarea>
                    <div id="error-outcome" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const feedbackWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Feedback<span style="color:red;">*</span></p>
                    <textarea name="feedback" id="feedback"
                        class="form-control form-control-sm" rows="5" required></textarea>
                    <div id="error-feedback" class="error-message" style="color: red;font-size:12px;"></div>
                </div>
            `);

            const remarksWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Additional Remarks</p>
                    <textarea name="additional_remarks_reply" id="additional_remarks_reply"
                        class="form-control form-control-sm" rows="5"></textarea>
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
        url: 'backend.php?action=searchCustomer',
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

    const remarksWrapper = $('<div class="mb-3"></div>');
    const remarksLabel = $('<p class="r-text">Additional Remarks</p>');
    const remarksTextarea = $('<textarea>', {
        class: 'form-control form-control-sm',
        readonly: true,
        disabled: true,
        rows: 5
    }).val(additionalRemarks || '');

    remarksWrapper.append(remarksLabel, remarksTextarea);
    targetPanel.append(remarksWrapper);
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

function getBusinessUnit(departmentId, callback) {
    $.ajax({
        url: 'backend.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'getBusinessUnit',
            staffDeptId: departmentId
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            console.log(status, error);
            logError(new Error('Error fetching business unit'), { context: 'getBusinessUnit', businessUnitId: businessUnitId, status: status, error: error });
            callback("Unknown");
        }
    });
}

function getBusinessUnits() {
    $.ajax({
        url: 'backend.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'getBusinessUnits'
        },
        success: function (response) {
            var referBusinessUnit = $('#refer_business_unit');

            $.each(response, function (index, businessUnit) {
                referBusinessUnit.append(
                    '<option value="' + businessUnit.staff_department_id + '" data-id="' + businessUnit.id + '" ' + '>' +
                    businessUnit.name + '</option>'
                );
            });

            referBusinessUnit.trigger('change');

        },
        error: function () {
            alert('Error loading business units');
        }
    });
}

function toggleReferForm() {
    const isChecked = $('#refer_another').is(':checked');
    const hasBusinessUnit = $('#refer_business_unit').val();

    if (isChecked && hasBusinessUnit) {
        $('.refer-form').show();
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

    const form = document.getElementById('referral-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        isValid = false;
    }

    // Validate the three compulsory fields when status is not 5
    const selectedStatus = document.querySelector('input[name="status"]:checked');
    if (!selectedStatus || selectedStatus.value !== '5') {
        const postDiagnosis = document.getElementById('post_diagnosis');
        const outcome = document.getElementById('outcome');
        const feedback = document.getElementById('feedback');

        if (postDiagnosis && !postDiagnosis.value.trim()) {
            document.getElementById('error-post_diagnosis').textContent = 'Post Diagnosis is required.';
            isValid = false;
        }

        if (outcome && !outcome.value.trim()) {
            document.getElementById('error-outcome').textContent = 'Outcome is required.';
            isValid = false;
        }

        if (feedback && !feedback.value.trim()) {
            document.getElementById('error-feedback').textContent = 'Feedback is required.';
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

    if (isValid) {
        // form.submit();
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

        fetch('update.php', {
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
                    window.location.href = 'index.php';
                } else {
                    console.log('Failed:', inner.message);
                }

            })
            .catch(error => {
                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });
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