$(document).ready(function () {
    localStorage.clear();
    sessionStorage.clear();

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
                    // When staff_id is null, check if current session user's department matches
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

            var organization = $('#organization');
            var location_organization = $('#location_organization');
            var referee = $('#referee');

            organization.hide();
            location_organization.hide();
            referee.hide();

            // Sort asc by sequence
            const sortedReferrals = referralDetails.sort((a, b) => a.sequence - b.sequence);
            // console.log(sortedReferrals);

            const referralHistoryContainer = $('#referralHistoryContainer');

            // Process referral history (exclude the last sequence which always has empty staff_id)
            const referralHistoryItems = sortedReferrals.slice(0, -1); // Remove last item
            let processedCount = 0;
            const totalItems = referralHistoryItems.length;

            if (totalItems > 0) {
                referralHistoryItems.forEach((rd, index) => {
                    // Get staff details first to populate accordion header
                    getStaffDetails(rd.staff_id, rd.location, rd.business_unit_id, department, function (staffResponse) {
                        const staff = staffResponse && staffResponse.length > 0 ? staffResponse[0].staff : 'Unknown';
                        const contact = staffResponse && staffResponse.length > 0 ? staffResponse[0].contact : '';
                        const businessUnit = staffResponse && staffResponse.length > 0 ? staffResponse[0].business_unit : '';
                        const outlet = staffResponse && staffResponse.length > 0 ? staffResponse[0].outlet : '';

                        // Create accordion structure for each referral
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
                        const shouldAutoOpen = (index === 0); // Auto-open first accordion

                        processAccordionContent(queueItem, panel, accordion, shouldAutoOpen);

                        processedCount++;
                        // if (processedCount === totalItems) {
                        //     console.log('All referral history accordions processed');
                        // }
                    });
                });
            }

            // Global flag to control reply-form-container visibility based on referral_details
            window.hasReplyForms = false;

            if (referralDetails && referralDetails.length > 0) {
                const lastSequence = referralDetails[referralDetails.length - 1];

                if (lastSequence.referral_details && lastSequence.referral_details.length > 0) {
                    window.hasReplyForms = true;
                    displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                } else if (!lastSequence.staff_id) {
                    // When staff_id is null, check if current session user's department matches
                    getStaffDetails(staffId, lastSequence.location, null, department, function (staffResponse) {
                        if (staffResponse && staffResponse.length > 0 && staffResponse[0].department_id === department) {
                            // Department matches - show reply form and populate forms
                            window.hasReplyForms = true;
                            $('.reply-form-container').show();
                            displayContent(lastSequence.business_unit_id, '.reply-content', referralDetails);
                        } else {
                            // Department doesn't match - hide reply form
                            window.hasReplyForms = false;
                            $('.reply-form-container').hide();
                        }
                    });
                    return; // Exit early since we're handling visibility in the callback
                }
            }

            // Control container visibility for other cases
            if (window.hasReplyForms) {
                $('.reply-form-container').show();
            } else {
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

            let status = data.status;
            // Load status options dynamically with disable parameter for status 4 or 5
            const shouldDisableRadios = (status == 4 || status == 5);
            loadStatusOptions(status, shouldDisableRadios);

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

    // For Refer To
    $('#refer_location').change(function () {
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

                    var assigneeTo = $('#refer_to');
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
    });

    $('#refer_another').change(function () {
        toggleReferForm();
    });

});

// Function to process accordion content after all async calls complete
function processAccordionContent(queueItem, panel, accordion, shouldAutoOpen = false) {
    const { rd, staff, businessUnit, outlet, contact, staff_department_id, createdAt } = queueItem;

    //display referral info in panel
    if (rd.referral_reason || rd.referral_condition || rd.medical_history) {
        panel.append(`
            <div class="referral-info-section border-bottom pb-3 mb-3">
                <p class="r-title">Referral Information</p>
                <div class="mb-2">
                    <p class="r-text">Reason of Referral</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.referral_reason || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Details of Patient's Condition</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.referral_condition || 'N/A'}</textarea>
                </div>
                <div class="mb-2">
                    <p class="r-text">Relevant Medical History</p>
                    <textarea class="form-control form-control-sm" rows="3" readonly>${rd.medical_history || 'N/A'}</textarea>
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

    //auto-open only the first (latest) filled accordion
    const accordionButton = accordion.find('.referral-accordion');
    const accordionPanel = accordion.find('.referral-panel');

    // Only auto-open the first filled accordion
    if (shouldAutoOpen) {
        accordionButton.addClass('active');
        accordionPanel.css('maxHeight', accordionPanel[0].scrollHeight + 'px');
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
        displayAttachments(rd.attachments, staff, createdAt);
    }
}

function displayAttachments(attachments, staff, created_at) {

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
        attachmentContainer.append(attachmentItem);
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
                url: 'api.php',
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

function loadStatusOptions(selectedStatus, shouldDisableRadios = false) {
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
                addStatusNoteField(statusContainer, selectedStatus);
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
                addStatusNoteField(statusContainer, selectedStatus);
                // Add event listeners for status change
                addStatusChangeListeners();
            }
        }
    });
}

// Add status_note textarea field
function addStatusNoteField(container, selectedStatus) {
    const statusNoteDiv = document.createElement('div');
    statusNoteDiv.className = 'mb-3';
    statusNoteDiv.id = 'status-note-container';

    // Show the textarea only if status 5 is selected
    const isStatus5Selected = selectedStatus && String(selectedStatus) === '5';
    const displayStyle = isStatus5Selected ? 'block' : 'none';

    statusNoteDiv.innerHTML = `
        <div style="display: ${displayStyle};">
            <label class="form-label r-text" for="status_note">Status Note</label>
            <textarea class="form-control form-control-sm" name="status_note" id="status_note" rows="3" placeholder="Please provide additional details..."></textarea>
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

            const remarksWrapper = $(`
                <div class="mb-2">
                    <p class="r-text">Additional Remarks</p>
                    <textarea name="additional_remarks_reply" id="additional_remarks_reply"
                        class="form-control form-control-sm" rows="5"></textarea>
                </div>
            `);

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
    const referTo = document.getElementById('refer_to');

    checkbox.addEventListener('change', function () {
        const isChecked = this.checked;

        referBusinessUnit.disabled = !isChecked;
        referLocation.disabled = !isChecked;
        referTo.disabled = !isChecked;

        if (!isChecked) {
            referBusinessUnit.innerHTML = '<option value="">Business Unit</option>';
            referLocation.innerHTML = '<option value="">Location</option>';
            referTo.innerHTML = '<option value="">Assignees</option>';
            $('.refer-form').hide().find('input[type="text"], textarea').val('');
            $('.refer-form').find('select').prop('selectedIndex', 0);
        } else {
            getBusinessUnits();
        }
    });
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

    const form = document.getElementById('referral-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        isValid = false;
    }

    // Add validation for status_note when status 5 is selected
    const selectedStatus = document.querySelector('input[name="status"]:checked');
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