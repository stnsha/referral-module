$(document).ready(function () {
    referralAccordion();
    referAnother();
    $('.refer-form').hide();

    $.ajax({
        url: 'api.php',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'get-referral',
            referral_id: referral_id
        }),
        success: function (response) {
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

            // Referral Details
            let referralDetails = response.data.referralDetails;

            const sortedDetails = Object.values(referralDetails).sort(function (a, b) {
                return a.sequence - b.sequence;
            });

            const container = $('#referralHistoryContainer');
            $.each(sortedDetails, function (index, rd) {
                //change for production
                // rd.staff_id ??= staffId; 

                //testing purposes only
                const fakeStaffId = 3333;
                rd.staff_id ??= fakeStaffId;

                $('input[name="updated_recipient_to"]').val(fakeStaffId);

                //run through staff details
                getStaffDetails(rd.staff_id, rd.location, rd.business_unit_id, function (sd) {
                    const staff = sd[0].staff;
                    const businessUnit = sd[0].business_unit;
                    const outlet = sd[0].outlet;
                    const contact = sd[0].contact;
                    const createdAt = rd.created_at;

                    //referral history accordion
                    const accordionHTML = `
                        <div class="referral-history">
                            <button type="button" class="referral-accordion${rd.is_filled == 0 ? ' disabled' : ''}">
                                <div class="referral-accordion-content">
                                    <div class="referral-text">
                                        <span class="referral-title">${staff}, ${outlet}</span>
                                        <span class="referral-date">${createdAt}</span>
                                    </div>
                                </div>
                            </button>
                            <div class="referral-panel">
                                <div class="referral-panel-item" data-bu="${rd.business_unit_id}"></div>
                                <div class="referral-pic"></div>
                            </div>
                        </div>
                        `;

                    if (rd.is_filled == 1) {
                        //display history if exist
                        const accordion = $(accordionHTML);
                        container.append(accordion);
                        const panel = accordion.find('.referral-panel-item');
                        //display initial treatment
                        initialTreatment(rd.referral_details, rd.business_unit_id, panel, rd.additional_remarks);

                        const referralPic = accordion.find('.referral-pic');
                        var whatsapp = 'https://api.whatsapp.com/send?phone=' + contact;
                        referralPic.html(`
                            <span class="r-title">Person in Charge</span><br>
                            <span class="r-text">Name: ${staff} </span><br>
                            <span class="r-text">
                                Contact: 
                                <a href="${whatsapp}" target="_blank">
                                    <img src="img/whatsapp.png" style="width:25px;">
                                </a>
                            </span>
                        `);

                        //pass object attachments
                        if (rd.attachments > 0) {
                            displayAttachments(rd.attachments, staff, createdAt);
                        }

                    } else {
                        //display reply form for next pic
                        displayContent(rd.business_unit_id, '.reply-form');
                    }

                    //assign referred from 
                    if (rd.sequence == 1) {
                        assigneeFrom.val(staff);
                        business_unit_from.val(businessUnit);
                        location_from.val(outlet);
                    }
                    //assign referred to
                    if (rd.sequence == 2) {
                        recipientTo.val(staff);
                        business_unit_to.val(businessUnit);
                        location_to.val(outlet);
                    }
                });

                $('.referring-indication').hide();
                var referral_reason_refer = $('#referral_reason_refer');
                var referral_condition_refer = $('#referral_condition_refer');
                var medical_history_refer = $('#medical_history_refer');

                referral_reason_refer.val('');
                referral_condition_refer.val('');
                medical_history_refer.val('');

                if (rd.is_filled == 0 && rd.sequence != 2) {
                    $('.referring-indication').show();
                    referral_reason_refer.val(rd.referral_reason);
                    referral_condition_refer.val(rd.referral_condition);
                    medical_history_refer.val(rd.medical_history);

                }
            });

            // Referring Indication
            let referringIndication = response.data.referringIndication;

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

            let status = referringIndication.status;
            if (status) {
                const radio = document.querySelector(`input[name="status"][value="${status}"]`);
                if (radio) radio.checked = true;
            }

            // Referral Attachments
            const attachmentContainer = $('#attachmentDisplay');

            function displayAttachments(attachments, staff, created_at) {
                attachmentContainer.empty(); // Clear existing attachments
                console.log(attachments);

                attachments.forEach(function (attachment) {
                    let isDownloadableClientSide = false;

                    const downloadButtonHtml = isDownloadableClientSide ?
                        `<button class="btn btn-sm btn-link text-decoration-none download-btn" title="Download" data-filename="${attachment.name}" data-encoded="${attachment.encoded}">
                    Download
                </button>` :
                        `<button class="btn btn-sm btn-link text-decoration-none download-btn" title="Download" data-filename="${attachment.name}" data-attachment-id="${attachment.attachment_id}"> Download
                </button>`;

                    const attachmentItem = `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div>
                            <span class="r-title">${attachment.name}</span>
                            <small class="d-block r-text text-muted">Uploaded by ${staff} on ${created_at}.</small>
                        </div>
                    </div>
                    <div>
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
                            console.error('Error decoding base64 data:', error);
                            alert('Failed to download file. Invalid file data.');
                        }
                    } else if (attachmentId) {
                        // Server-side download
                        console.log(`Downloading attachment: ${fileName} (ID: ${attachmentId})`);

                        // Make AJAX call to download from server
                        $.ajax({
                            url: 'api.php',
                            method: 'POST',
                            data: JSON.stringify({
                                action: 'download-attachment',
                                attachment_id: attachmentId
                            }),
                            contentType: 'application/json',
                            dataType: 'json',
                            success: function (response) {
                                if (!response.success) {
                                    console.error('Download failed:', response.message);
                                    alert(response.message || 'Failed to download file. Please try again.');
                                    return;
                                }

                                try {
                                    // Decode base64 data
                                    const base64Data = response.data.file_content;
                                    const binaryString = atob(base64Data);
                                    const bytes = new Uint8Array(binaryString.length);

                                    for (let i = 0; i < binaryString.length; i++) {
                                        bytes[i] = binaryString.charCodeAt(i);
                                    }

                                    // Create blob with appropriate MIME type
                                    const contentType = response.data.content_type || getMimeTypeFromFileName(fileName);
                                    const blob = new Blob([bytes], { type: contentType });

                                    // Create temporary URL and download
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = response.data.filename || fileName;
                                    a.style.display = 'none';

                                    document.body.appendChild(a);
                                    a.click();

                                    // Clean up
                                    setTimeout(() => {
                                        window.URL.revokeObjectURL(url);
                                        document.body.removeChild(a);
                                    }, 100);
                                } catch (error) {
                                    console.error('Error processing file data:', error);
                                    alert('Failed to process file data. Please try again.');
                                }
                            },
                            error: function (xhr, status, error) {
                                console.error('Download failed:', error);
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




        },
        error: function () {
            console.log("Failed to fetch referral details.");
        }
    });

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

    handleFilePreview('#attachmentInput', '#attachmentPreview');
});

function getStaffDetails(staffId, locationId, businessUnitId, callback) {
    $.ajax({
        url: 'backend.php',
        method: 'GET',
        data: {
            staff_id: staffId,
            location_id: locationId,
            bu_id: businessUnitId,
            action: 'getStaffDetails'
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

function displayContent(businessUnitId, targetSelector) {
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

            $('.reply-content').hide();
            const targetDiv = $(targetSelector);
            targetDiv.show();
            targetDiv.find('[data-required="true"]').prop('required', true);
            $('.reply-content .form-container').remove();

            const bu_id_reply = $('<input type="text" name="bu_id_reply" hidden value=' + businessUnitId + ' readonly/>');
            $('.reply-content').append(bu_id_reply);

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

                    wrapper.append(input);
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
        }
        ,
        error: function () {
            console.log('Failed to display form details');
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

    if (isValid) {
        // form.submit();
        const formData = new FormData(form);
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