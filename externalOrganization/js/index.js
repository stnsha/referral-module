// Global variable to store organizations data
var organizationsData = [];

// Load organizations on page load
$(document).ready(function () {
    loadOrganizations();

    // Handle "Add Referee" button click in form
    $('#add-referee-btn').on('click', function () {
        $('#new-referee-section').show();
        $(this).hide();
    });

    // Handle "Cancel" button click in form
    $('#cancel-referee-btn').on('click', function () {
        $('#new-referee-section').hide();
        $('#add-referee-btn').show();
        clearRefereeFormFields();
    });

    // Handle accordion toggle click
    $(document).on('click', '.org-row .toggle-cell', function (e) {
        e.stopPropagation();
        var $row = $(this).closest('.org-row');
        toggleAccordion($row);
    });

    // Handle organization row click (expand/collapse)
    $(document).on('click', '.org-row', function (e) {
        // Don't toggle if clicking on buttons, links, or inputs
        if ($(e.target).is('a, button, input, select, .btn, .btn *, .btn-icon, .btn-icon *')) {
            return;
        }
        toggleAccordion($(this));
    });

    // Handle "Add Referee" button click on organization row
    $(document).on('click', '.btn-add-referee', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var orgId = $(this).data('org-id');
        var orgName = $(this).data('org-name');
        openAddRefereeModal(orgId, orgName);
    });

    // Handle modal save referee button
    $('#modal-save-referee').on('click', function () {
        saveRefereeFromModal();
    });

    // Handle Edit Organization button click
    $(document).on('click', '.btn-edit-org', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var orgId = $(this).data('id');
        openEditOrgModal(orgId);
    });

    // Handle modal save organization button
    $('#modal-save-org').on('click', function () {
        saveOrganizationFromModal();
    });

    // Handle Delete Organization button click
    $(document).on('click', '.btn-delete-org', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var hasReferrals = $(this).data('has-referrals');
        if (hasReferrals === true || hasReferrals === 'true') {
            alert('Cannot delete this organization because it has associated referrals.');
            return;
        }
        var orgId = $(this).data('id');
        var $row = $(this).closest('.org-row');
        var orgName = $row.find('[data-field="name"]').text();
        deleteOrganization(orgId, orgName);
    });

    // Handle Edit Referee button click
    $(document).on('click', '.btn-edit-referee', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $row = $(this).closest('tr');
        editRefereeInline($row);
    });

    // Handle Cancel Referee Edit button click
    $(document).on('click', '.btn-cancel-referee', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $row = $(this).closest('tr');
        cancelRefereeEdit($row);
    });

    // Handle Update Referee button click
    $(document).on('click', '.btn-update-referee', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $row = $(this).closest('tr');
        updateReferee($row);
    });

    // Handle Delete Referee button click
    $(document).on('click', '.btn-delete-referee', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var hasReferrals = $(this).data('has-referrals');
        if (hasReferrals === true || hasReferrals === 'true') {
            alert('Cannot delete this referee because they have associated referrals.');
            return;
        }
        var refereeId = $(this).data('id');
        var $row = $(this).closest('tr');
        var refereeName = $row.find('[data-field="name"]').text();
        deleteReferee(refereeId, refereeName);
    });
});

// Load organizations from API
function loadOrganizations() {
    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'external-organizations'
        }),
        success: function (response) {
            console.log('Organizations loaded:', response);
            var $tbody = $('#external-organizations-tbody');
            $tbody.empty();

            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                organizationsData = response.data;
                renderOrganizationsTable(response.data);
            } else {
                $tbody.append('<tr><td colspan="5" class="text-center">No external organizations found</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading external organizations:', error);
            $('#external-organizations-tbody').html('<tr><td colspan="5" class="text-center text-danger">Error loading data</td></tr>');
        }
    });
}

// Render organizations table with accordion
function renderOrganizationsTable(organizations) {
    var $tbody = $('#external-organizations-tbody');
    $tbody.empty();

    $.each(organizations, function (i, org) {
        var refereeCount = org.referees ? org.referees.length : 0;
        var address = org.address || 'N/A';
        var state = org.state || 'N/A';
        var hasReferrals = org.has_referrals || false;

        // Organization row
        var deleteBtn = hasReferrals ?
            '<a href="#" class="btn-icon btn-icon-delete btn-delete-org disabled" data-id="' + org.id + '" data-has-referrals="true" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Cannot delete - has associated referrals"><i class="bi bi-trash-fill"></i></a>' :
            '<a href="#" class="btn-icon btn-icon-delete btn-delete-org" data-id="' + org.id + '" data-has-referrals="false" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete Organization"><i class="bi bi-trash-fill"></i></a>';

        var orgRow = '<tr class="org-row" data-id="' + org.id + '" data-has-referrals="' + hasReferrals + '">' +
            '<td class="toggle-cell text-center" style="cursor:pointer;">' +
            '<i class="bi bi-chevron-right toggle-icon"></i></td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;" data-field="name">' + org.name + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;" data-field="address">' + address + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;" data-field="state">' + state + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;white-space:nowrap;">' +
            '<a href="#" class="btn-icon btn-icon-edit btn-edit-org" data-id="' + org.id + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Organization"><i class="bi bi-pencil-square"></i></a>' +
            '<a href="#" class="btn-icon btn-icon-add btn-add-referee" data-org-id="' + org.id + '" data-org-name="' + escapeHtml(org.name) + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Add Referee"><i class="bi bi-person-plus-fill"></i></a>' +
            deleteBtn +
            '</td>' +
            '</tr>';

        $tbody.append(orgRow);

        // Referee label row (hidden by default)
        if (org.referees && org.referees.length > 0) {
            var labelRow = '<tr class="referee-label-row" data-org-id="' + org.id + '" style="display:none;background-color:#e9ecef;">' +
                '<td></td>' +
                '<td colspan="4" class="r-text fw-bold" style="font-size:12px;text-align:start;color:#173F5F;">' +
                '<i class="bi bi-people-fill me-1"></i>External Referees (' + refereeCount + ')' +
                '</td>' +
                '</tr>';
            $tbody.append(labelRow);

            // Referee rows (hidden by default)
            $.each(org.referees, function (j, referee) {
                var email = referee.email || 'N/A';
                var phone = referee.phone || 'N/A';
                var position = referee.position || '';
                var refereeHasReferrals = referee.has_referrals || false;

                var refereeDeleteBtn = refereeHasReferrals ?
                    '<a href="#" class="btn-icon btn-icon-delete btn-delete-referee disabled" data-id="' + referee.id + '" data-has-referrals="true" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Cannot delete - has associated referrals"><i class="bi bi-trash-fill"></i></a>' :
                    '<a href="#" class="btn-icon btn-icon-delete btn-delete-referee" data-id="' + referee.id + '" data-has-referrals="false" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete Referee"><i class="bi bi-trash-fill"></i></a>';

                var nameWithPosition = position ? referee.name + ' <span class="text-muted">(' + position + ')</span>' : referee.name;

                var refereeRow = '<tr class="referee-row" data-org-id="' + org.id + '" data-referee-id="' + referee.id + '" data-has-referrals="' + refereeHasReferrals + '" style="display:none;background-color:#f8f9fa;">' +
                    '<td></td>' +
                    '<td class="r-text ps-4" style="font-size:12px;text-align:start;" data-field="name" data-position="' + escapeHtml(position) + '">' +
                    '<i class="bi bi-person me-1"></i>' + nameWithPosition + '</td>' +
                    '<td class="r-text" style="font-size:12px;text-align:start;" data-field="email">' + email + '</td>' +
                    '<td class="r-text" style="font-size:12px;text-align:start;" data-field="phone">' + phone + '</td>' +
                    '<td class="r-text" style="font-size:12px;text-align:start;white-space:nowrap;">' +
                    '<a href="#" class="btn-icon btn-icon-edit btn-edit-referee" data-id="' + referee.id + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Referee"><i class="bi bi-pencil-square"></i></a>' +
                    refereeDeleteBtn +
                    '</td>' +
                    '</tr>';

                $tbody.append(refereeRow);
            });
        }
    });

    // Initialize Bootstrap tooltips
    initializeTooltips();
}

// Initialize Bootstrap tooltips
function initializeTooltips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        var existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (existingTooltip) {
            existingTooltip.dispose();
        }
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Toggle accordion for organization row
function toggleAccordion($orgRow) {
    var orgId = $orgRow.data('id');
    var $toggleIcon = $orgRow.find('.toggle-icon');
    var $labelRow = $('.referee-label-row[data-org-id="' + orgId + '"]');
    var $refereeRows = $('.referee-row[data-org-id="' + orgId + '"]');

    // Check icon state instead of row visibility (fixes issue when no referees)
    var isExpanded = $toggleIcon.hasClass('bi-chevron-down');

    if (isExpanded) {
        // Collapse
        $labelRow.hide();
        $refereeRows.hide();
        $toggleIcon.removeClass('bi-chevron-down').addClass('bi-chevron-right');
    } else {
        // Expand
        $labelRow.show();
        $refereeRows.show();
        $toggleIcon.removeClass('bi-chevron-right').addClass('bi-chevron-down');
    }
}

// Open Add Referee Modal
function openAddRefereeModal(orgId, orgName) {
    $('#modal-org-id').val(orgId);
    $('#addRefereeModalLabel').text('Add Referee to ' + orgName);

    // Clear fields
    $('#modal-referee-name').val('');
    $('#modal-referee-email').val('');
    $('#modal-referee-phone').val('');
    $('#modal-referee-position').val('');
    $('#error-modal-referee-name').html('');
    $('#error-modal-referee-email').html('');
    $('#error-modal-referee-phone').html('');
    $('#error-modal-referee-position').html('');

    var modal = new bootstrap.Modal(document.getElementById('addRefereeModal'));
    modal.show();
}

// Save referee from modal
function saveRefereeFromModal() {
    var orgId = $('#modal-org-id').val();
    var name = $('#modal-referee-name').val().trim();
    var email = $('#modal-referee-email').val().trim();
    var phone = $('#modal-referee-phone').val().trim();
    var position = $('#modal-referee-position').val().trim();

    // Clear errors
    $('#error-modal-referee-name').html('');
    $('#error-modal-referee-email').html('');
    $('#error-modal-referee-phone').html('');
    $('#error-modal-referee-position').html('');

    var hasError = false;

    if (!name) {
        $('#error-modal-referee-name').html('Referee name is required.');
        hasError = true;
    }

    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        $('#error-modal-referee-email').html('Please enter a valid email address.');
        hasError = true;
    }

    if (!phone) {
        $('#error-modal-referee-phone').html('Phone is required.');
        hasError = true;
    }

    if (!position) {
        $('#error-modal-referee-position').html('Position is required.');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    var refereeData = {
        name: name,
        email: email,
        phone: phone,
        position: position
    };

    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'create-external-referee-for-org',
            org_id: orgId,
            referee_data: refereeData
        }),
        success: function (response) {
            console.log('Create referee response:', response);
            if (response.success) {
                alert('Referee added successfully!');
                bootstrap.Modal.getInstance(document.getElementById('addRefereeModal')).hide();
                loadOrganizations();
            } else {
                alert('Failed: ' + (response.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error('Error creating referee:', error);
            alert('Error creating referee. Please try again.');
        }
    });
}

// Open Edit Organization Modal
function openEditOrgModal(orgId) {
    var org = organizationsData.find(function (o) { return o.id == orgId; });
    if (!org) {
        alert('Organization not found');
        return;
    }

    $('#edit-org-id').val(org.id);
    $('#edit-org-name').val(org.name || '');
    $('#edit-org-address').val(org.address || '');
    $('#edit-org-postcode').val(org.postcode || '');
    $('#edit-org-state').val(org.state || '');
    $('#edit-org-country').val(org.country || 'Malaysia');
    $('#error-edit-org-name').html('');

    var modal = new bootstrap.Modal(document.getElementById('editOrgModal'));
    modal.show();
}

// Save organization from modal
function saveOrganizationFromModal() {
    var orgId = $('#edit-org-id').val();
    var name = $('#edit-org-name').val().trim();
    var address = $('#edit-org-address').val().trim();
    var postcode = $('#edit-org-postcode').val().trim();
    var state = $('#edit-org-state').val();
    var country = $('#edit-org-country').val();

    $('#error-edit-org-name').html('');

    if (!name) {
        $('#error-edit-org-name').html('Organization name is required.');
        return;
    }

    var updateData = {
        name: name,
        address: address,
        postcode: postcode,
        state: state,
        country: country
    };

    $.ajax({
        url: '/odb/referral/api-jwt.php?action=update-external-organization&org_id=' + orgId,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function (response) {
            console.log('Update org response:', response);
            if (response.success) {
                alert('External organization updated successfully!');
                bootstrap.Modal.getInstance(document.getElementById('editOrgModal')).hide();
                loadOrganizations();
            } else {
                alert('Failed: ' + (response.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error('Error updating organization:', error);
            alert('Error updating organization. Please try again.');
        }
    });
}

// Delete organization
function deleteOrganization(orgId, orgName) {
    if (!confirm('Are you sure you want to delete "' + orgName + '"? This will also delete all referees in this organization. This action cannot be undone.')) {
        return;
    }

    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'delete-external-organization',
            org_id: orgId
        }),
        success: function (response) {
            console.log('Delete org response:', response);
            if (response.success) {
                alert('External organization deleted successfully!');
                loadOrganizations();
            } else {
                alert('Failed to delete: ' + (response.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error('Error deleting organization:', error);
            var errorMessage = 'Error deleting organization. Please try again.';
            try {
                var errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {}
            alert(errorMessage);
        }
    });
}

// Edit referee inline
function editRefereeInline($row) {
    var refereeId = $row.data('referee-id');
    var hasReferrals = $row.data('has-referrals');

    // Get original values - name is stored without position text
    var $nameCell = $row.find('[data-field="name"]');
    var fullText = $nameCell.text().trim();
    // Remove position from name if present (format: "Name (Position)")
    var nameVal = fullText.replace(/\s*\([^)]*\)\s*$/, '').trim();
    var positionVal = $nameCell.data('position') || '';

    $row.data('original-name', nameVal);
    $row.data('original-position', positionVal);
    $row.data('original-email', $row.find('[data-field="email"]').text().trim());
    $row.data('original-phone', $row.find('[data-field="phone"]').text().trim());

    var emailVal = $row.data('original-email');
    emailVal = (emailVal === 'N/A') ? '' : emailVal;
    var phoneVal = $row.data('original-phone');
    phoneVal = (phoneVal === 'N/A') ? '' : phoneVal;

    $nameCell.html(
        '<input type="text" class="form-control form-control-sm mb-1" placeholder="Name" value="' + escapeHtml(nameVal) + '">' +
        '<input type="text" class="form-control form-control-sm position-input" placeholder="Position" value="' + escapeHtml(positionVal) + '">'
    );
    $row.find('[data-field="email"]').html('<input type="email" class="form-control form-control-sm" value="' + escapeHtml(emailVal) + '">');
    $row.find('[data-field="phone"]').html('<input type="tel" class="form-control form-control-sm" value="' + escapeHtml(phoneVal) + '">');

    var $actionCell = $row.find('td:last');
    $actionCell.html(
        '<a href="#" class="btn-icon btn-icon-save btn-update-referee" data-id="' + refereeId + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Save"><i class="bi bi-check-lg"></i></a>' +
        '<a href="#" class="btn-icon btn-icon-cancel btn-cancel-referee" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Cancel"><i class="bi bi-x-lg"></i></a>'
    );
}

// Cancel referee edit
function cancelRefereeEdit($row) {
    var refereeId = $row.data('referee-id');
    var hasReferrals = $row.data('has-referrals');
    var name = $row.data('original-name');
    var position = $row.data('original-position');
    var email = $row.data('original-email');
    var phone = $row.data('original-phone');

    var nameWithPosition = position ? name + ' <span class="text-muted">(' + position + ')</span>' : name;

    $row.find('[data-field="name"]').attr('data-position', position).html('<i class="bi bi-person me-1"></i>' + nameWithPosition);
    $row.find('[data-field="email"]').text(email);
    $row.find('[data-field="phone"]').text(phone);

    var deleteBtn = (hasReferrals === true || hasReferrals === 'true') ?
        '<a href="#" class="btn-icon btn-icon-delete btn-delete-referee disabled" data-id="' + refereeId + '" data-has-referrals="true" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Cannot delete - has associated referrals"><i class="bi bi-trash-fill"></i></a>' :
        '<a href="#" class="btn-icon btn-icon-delete btn-delete-referee" data-id="' + refereeId + '" data-has-referrals="false" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Delete Referee"><i class="bi bi-trash-fill"></i></a>';

    var $actionCell = $row.find('td:last');
    $actionCell.html(
        '<a href="#" class="btn-icon btn-icon-edit btn-edit-referee" data-id="' + refereeId + '" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Referee"><i class="bi bi-pencil-square"></i></a>' +
        deleteBtn
    );
}

// Update referee
function updateReferee($row) {
    var refereeId = $row.data('referee-id');
    var orgId = $row.data('org-id');

    $row.find('.error-message').remove();

    // Name and position are in the same cell now
    var $nameCell = $row.find('[data-field="name"]');
    var $nameInputs = $nameCell.find('input');
    var name = $nameInputs.eq(0).val().trim();
    var position = $nameInputs.eq(1).val().trim();
    var email = $row.find('[data-field="email"] input').val().trim();
    var phone = $row.find('[data-field="phone"] input').val().trim();

    var hasError = false;

    function showError($field, message) {
        var $errorDiv = $('<div class="error-message" style="color: red; font-size: 11px; margin-top: 2px;"></div>');
        $errorDiv.text(message);
        $field.after($errorDiv);
    }

    if (!name) {
        showError($nameInputs.eq(0), 'Name is required.');
        hasError = true;
    }

    if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        showError($row.find('[data-field="email"] input'), 'Invalid email.');
        hasError = true;
    }

    if (!phone) {
        showError($row.find('[data-field="phone"] input'), 'Phone is required.');
        hasError = true;
    }

    if (!position) {
        showError($nameInputs.eq(1), 'Position is required.');
        hasError = true;
    }

    if (hasError) {
        return;
    }

    var updateData = {
        name: name,
        email: email,
        phone: phone,
        position: position,
        external_organization_id: parseInt(orgId)
    };

    $.ajax({
        url: '/odb/referral/api-jwt.php?action=update-external-referee&referee_id=' + refereeId,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify(updateData),
        success: function (response) {
            console.log('Update referee response:', response);
            if (response.success) {
                alert('External referee updated successfully!');
                loadOrganizations();
            } else {
                alert('Failed: ' + (response.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error('Error updating referee:', error);
            alert('Error updating referee. Please try again.');
        }
    });
}

// Delete referee
function deleteReferee(refereeId, refereeName) {
    if (!confirm('Are you sure you want to delete referee "' + refereeName + '"? This action cannot be undone.')) {
        return;
    }

    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'delete-external-referee',
            referee_id: refereeId
        }),
        success: function (response) {
            console.log('Delete referee response:', response);
            if (response.success) {
                alert('External referee deleted successfully!');
                loadOrganizations();
            } else {
                alert('Failed to delete: ' + (response.message || 'Unknown error'));
            }
        },
        error: function (xhr, status, error) {
            console.error('Error deleting referee:', error);
            var errorMessage = 'Error deleting referee. Please try again.';
            try {
                var errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {}
            alert(errorMessage);
        }
    });
}

// Clear referee form fields
function clearRefereeFormFields() {
    $('#referee-name').val('');
    $('#referee-email').val('');
    $('#referee-phone').val('');
    $('#referee-position').val('');
    $('#error-referee-name').html('');
    $('#error-referee-email').html('');
    $('#error-referee-phone').html('');
    $('#error-referee-position').html('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
}

// Form submission validation
function validateForm(event) {
    event.preventDefault();
    var form = document.forms["externalOrganizationForm"];

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
        return val === null || val === undefined || val.trim() === "";
    }

    function isEmail(val) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
    }

    var hasError = false;

    function markError(fieldName, condition, message) {
        if (condition) {
            setErrorMessage(fieldName, message);
            hasError = true;
        }
    }

    // Validate organization name (required)
    markError("org-name", isEmpty(form["org_name"].value), "Organization name is required.");

    // Check if referee section is visible
    var isRefereeVisible = $('#new-referee-section').is(':visible');

    if (isRefereeVisible) {
        // Validate referee fields
        markError("referee-name", isEmpty(form["referee_name"].value), "Referee name is required.");
        markError("referee-phone", isEmpty(form["referee_phone"].value), "Phone is required.");
        markError("referee-position", isEmpty(form["referee_position"].value), "Position is required.");

        var refereeEmail = form["referee_email"].value;
        if (!isEmpty(refereeEmail)) {
            markError("referee-email", !isEmail(refereeEmail), "Please enter a valid email address.");
        }
    }

    if (!hasError) {
        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            console.log(key + ': ' + value);
        }

        fetch('referral/externalOrganization/post.php', {
            method: 'POST',
            body: formData
        })
            .then(function(response) { return response.text(); })
            .then(function(data) {
                console.log('Response:', data);
                var parsed = JSON.parse(data);
                var httpCode = parsed.httpCode;

                if (httpCode === 200 || httpCode === 201) {
                    window.location.href = 'referral/externalOrganization/index.php';
                } else {
                    var inner = parsed.response ? JSON.parse(parsed.response) : parsed;
                    console.log('Failed:', inner.message || 'Unknown error');
                    alert('Failed: ' + (inner.message || 'Unknown error'));
                }
            })
            .catch(function(error) {
                console.error('Form submission error:', error);
                if (typeof logError === 'function') {
                    logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });
                }
            });
    }
}
