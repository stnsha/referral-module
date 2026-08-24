// Global variable to store original form values for change detection
var originalFormValues = {};

$(document).ready(function () {
    // 1. Load Business Units table
    loadBusinessUnits();

    // 2. Initialize Department autocomplete
    initializeDepartmentAutocomplete();

    // 3. Initialize Outlet Select2
    initializeOutletSelect();

    // 4. Initialize Select2 for staff search
    initializeStaffSearch();

    // 5. Business Unit Form Submit
    $('#business-unit-form').on('submit', handleBusinessUnitSubmit);

    // 6. Access Control Form Submit
    $('#access-control-form').on('submit', handleAccessControlSubmit);

    // 7. Cancel Edit Mode
    $('#bu-cancel-btn').on('click', resetBusinessUnitForm);

    // 8. Add change detection listeners for edit mode
    $('#bu-name, #bu-ending-code').on('input', checkFormChanges);
    $('#bu-department').on('change', checkFormChanges);
    $('#bu-outlet').on('change', checkFormChanges);
    $('input[name="bu_status"]').on('change', checkFormChanges);
});

// Load all business units into table
function loadBusinessUnits() {
    $.ajax({
        url: '/odb/referral/backend.php?action=getBusinessUnits',
        type: 'GET',
        success: function (response) {
            if (response) {
                console.log(response);
                renderBusinessUnitsTable(response);
            }
        },
        error: function (xhr, status, error) {
            toast.error('Error loading business units');
            console.error('Error loading business units:', error);
        }
    });
}

// Render table rows
function renderBusinessUnitsTable(data) {
    var tbody = $('#bu-table-body');
    tbody.empty();

    if (data.length === 0) {
        tbody.append('<tr><td colspan="5" class="text-start r-text">No business units found</td></tr>');
        return;
    }

    $.each(data, function (index, bu) {
        var isActive = bu.is_active == 1;
        var statusBtnClass = isActive ? 'btn-outline-warning' : 'btn-outline-success';
        var statusBtnText = isActive ? 'Set Inactive' : 'Set Active';
        var statusBadge = isActive ?
            '<span class="status-badge status-active" style="font-size:13px;padding:5px 10px;border-radius:4px;border:1px solid #198754;background-color:#198754;color:#fff;display:inline-block;">Active</span>' :
            '<span class="status-badge status-inactive" style="font-size:13px;padding:5px 10px;border-radius:4px;border:1px solid #6c757d;background-color:#6c757d;color:#fff;display:inline-block;">Inactive</span>';

        var row = '<tr>' +
            '<td class="r-text" style="font-size:13px;text-align:start;">' + statusBadge + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;">' + bu.name + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;">' + (bu.staff_department_id || 'N/A') + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;">' + (bu.ending_code || 'N/A') + '</td>' +
            '<td class="r-text" style="font-size:13px;text-align:start;">' +
            '<button class="btn-icon btn-icon-edit edit-bu" data-id="' + bu.id + '" ' +
            'data-name="' + bu.name + '" data-dept="' + bu.staff_department_id + '" ' +
            'data-code="' + bu.ending_code + '" data-active="' + bu.is_active + '" ' +
            'data-outlet-id="' + (bu.outlet_id || '') + '" ' +
            'data-outlet-code="' + (bu.outlet_code || '') + '" ' +
            'data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit Business Unit">' +
            '<i class="bi bi-pencil-square"></i></button>' +
            '<button class="btn btn-sm ' + statusBtnClass + ' toggle-status-bu" data-id="' + bu.id + '" ' +
            'data-name="' + bu.name + '" data-dept="' + bu.staff_department_id + '" ' +
            'data-code="' + bu.ending_code + '" data-active="' + bu.is_active + '" ' +
            'data-outlet-id="' + (bu.outlet_id || '') + '">' + statusBtnText + '</button>' +
            '</td>' +
            '</tr>';
        tbody.append(row);
    });

    // Attach event handlers
    $('.edit-bu').on('click', handleEditBusinessUnit);
    $('.toggle-status-bu').on('click', handleToggleStatus);

    // Initialize Bootstrap tooltips for edit buttons
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('#bu-table-body [data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        // Dispose existing tooltip if any
        var existingTooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
        if (existingTooltip) {
            existingTooltip.dispose();
        }
        // Create new tooltip
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize Select2 for department autocomplete
function initializeDepartmentAutocomplete() {
    $('#bu-department').select2({
        placeholder: 'Type to search departments...',
        minimumInputLength: 0,
        allowClear: true,
        width: '100%',
        ajax: {
            url: '/odb/referral/backend.php?action=searchDepartments',
            type: 'POST',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search_term: params.term || '' };
            },
            processResults: function (data) {
                return {
                    results: data.map(function (dept) {
                        return {
                            id: dept.id,
                            text: dept.name
                        };
                    })
                };
            },
            cache: true
        },
        templateResult: function (data) {
            if (!data.id) return data.text;
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        },
        templateSelection: function (data) {
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        }
    });
}

// Initialize Select2 for outlet autocomplete
function initializeOutletSelect() {
    $('#bu-outlet').select2({
        placeholder: 'Type to search outlets...',
        minimumInputLength: 0,
        allowClear: true,
        width: '100%',
        ajax: {
            url: '/odb/referral/backend.php?action=searchOutlets',
            type: 'POST',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search_term: params.term || '' };
            },
            processResults: function (data) {
                return {
                    results: data.map(function (o) {
                        return { id: o.id, text: o.code };
                    })
                };
            },
            cache: true
        },
        templateResult: function (data) {
            if (!data.id) return data.text;
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        },
        templateSelection: function (data) {
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        }
    });
}

// Initialize Select2 for staff search
function initializeStaffSearch() {
    $('#staff-search').select2({
        placeholder: 'Type staff name...',
        minimumInputLength: 2,
        allowClear: true,
        width: '100%',
        ajax: {
            url: '/odb/referral/backend.php?action=searchStaff',
            type: 'POST',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search_term: params.term };
            },
            processResults: function (data) {
                return {
                    results: data.map(function (staff) {
                        return {
                            id: staff.id,
                            text: staff.nama_staff,
                            staff_data: staff
                        };
                    })
                };
            },
            cache: true
        },
        templateResult: function (data) {
            if (!data.id) return data.text;
            var $result = $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
            return $result;
        },
        templateSelection: function (data) {
            return $('<span style="text-align: left; display: block; font-size: 13px; font-family: Inter, sans-serif;">' + data.text + '</span>');
        }
    });

    // On staff selection, display info
    $('#staff-search').on('select2:select', function (e) {
        var staffData = e.params.data.staff_data;
        displayStaffInfo(staffData);
    });

    $('#staff-search').on('select2:clear', function () {
        $('#selected-staff-info').hide();
    });
}

// Display selected staff information
function displayStaffInfo(staff) {
    $('#info-nama').text(staff.nama_staff);
    $('#info-department').text(staff.department || 'N/A');
    $('#info-outlet').text(staff.outlet || 'None');

    var referralText = staff.referral === 1 ? 'Super Admin (1)' :
        staff.referral === 2 ? 'HQ Admin (2)' :
            'Normal User (0)';
    $('#info-referral').text(referralText);

    // Pre-select current permission
    $('input[name="referral_permission"][value="' + staff.referral + '"]').prop('checked', true);

    $('#selected-staff-info').show();
}

// Handle Business Unit form submission (Create/Update)
function handleBusinessUnitSubmit(e) {
    e.preventDefault();

    var buId = $('#bu-id').val();
    var buData = {
        name: $('#bu-name').val().trim(),
        staff_department_id: $('#bu-department').val() ? parseInt($('#bu-department').val()) : null,
        outlet_id: $('#bu-outlet').val() ? parseInt($('#bu-outlet').val()) : null,
        ending_code: $('#bu-ending-code').val().trim().toUpperCase().replace(/\s*,\s*/g, ','),
        is_active: parseInt($('input[name="bu_status"]:checked').val())
    };

    // Validation
    if (!buData.name) {
        showBadgeMessage('Please fill all required fields', 'error');
        return;
    }

    if (buData.ending_code) {
        var parts = buData.ending_code.split(',');
        var valid = true;
        for (var i = 0; i < parts.length; i++) {
            if (!/^[A-Z0-9]$/.test(parts[i].trim())) {
                valid = false;
                break;
            }
        }
        if (!valid) {
            showBadgeMessage('Ending code must be single alphanumeric characters separated by commas (e.g. 1,2,F)', 'error');
            return;
        }
    }

    var statusText = buData.is_active ? 'Active' : 'Inactive';
    var action = buId ? 'update' : 'create';

    // Build confirmation detail lines
    var confirmLines = 'Name: ' + buData.name + '\n';
    if (buData.outlet_id) {
        var outletText = $('#bu-outlet').select2('data')[0] ? $('#bu-outlet').select2('data')[0].text : buData.outlet_id;
        confirmLines += 'Outlet: ' + outletText + '\n';
    }
    if (buData.staff_department_id) {
        var deptText = $('#bu-department').select2('data')[0] ? $('#bu-department').select2('data')[0].text : buData.staff_department_id;
        confirmLines += 'Department: ' + deptText + '\n';
    }
    confirmLines += 'Ending Code: ' + buData.ending_code + '\n' + 'Status: ' + statusText;

    // Show confirmation dialog
    var confirmMessage = 'Are you sure you want to ' + action + ' this business unit?\n\n' + confirmLines;

    if (!confirm(confirmMessage)) {
        return;
    }

    var actionStr = buId ? 'update-business-unit' : 'create-business-unit';
    var payload = buId ?
        { action: actionStr, business_unit_id: parseInt(buId), business_unit_data: buData } :
        { action: actionStr, business_unit_data: buData };

    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json',
        success: function (response) {
            console.log('Response:', response);
            // Handle success as both boolean and number (1 or true)
            if (response.success === true || response.success === 1 || response.success === '1') {
                showBadgeMessage(response.message || (buId ? 'Updated' : 'Created') + ' successfully', 'success');
                // Reload page after 1.5 seconds to show latest changes
                setTimeout(function () {
                    window.location.reload();
                }, 1500);
            } else {
                showBadgeMessage(response.message || 'Operation failed', 'error');
            }
        },
        error: function (xhr, status, error) {
            showBadgeMessage('Error processing request', 'error');
            console.error('Error submitting business unit form:', error);
            console.error('XHR:', xhr.responseText);
        }
    });
}

// Handle Access Control form submission
function handleAccessControlSubmit(e) {
    e.preventDefault();

    var staffId = $('#staff-search').val();
    var permission = $('input[name="referral_permission"]:checked').val();

    if (!staffId || permission === undefined) {
        showAccessBadgeMessage('Please select a staff member and permission level', 'error');
        return;
    }

    $.ajax({
        url: '/odb/referral/backend.php?action=updateStaffReferral',
        type: 'POST',
        data: {
            staff_id: staffId,
            referral_value: parseInt(permission)
        },
        dataType: 'json',
        success: function (response) {
            console.log('Access Control Response:', response);
            if (response.success === true || response.success === 1 || response.success === '1') {
                showAccessBadgeMessage(response.message || 'Access updated successfully', 'success');
                // Refresh staff info to show updated permission
                var staffData = $('#staff-search').select2('data')[0].staff_data;
                staffData.referral = parseInt(permission);
                displayStaffInfo(staffData);
            } else {
                showAccessBadgeMessage(response.message || 'Update failed', 'error');
            }
        },
        error: function (xhr, status, error) {
            showAccessBadgeMessage('Error updating access', 'error');
            console.error('Error updating staff access:', error);
            console.error('XHR:', xhr.responseText);
        }
    });
}

// Edit Business Unit (populate form)
function handleEditBusinessUnit() {
    var buId = $(this).data('id');
    var buName = $(this).data('name');
    var buDept = $(this).data('dept');
    var buCode = $(this).data('code');
    var buActive = $(this).data('active');
    var buOutletId = $(this).data('outlet-id');
    var buOutletCode = $(this).data('outlet-code');

    $('#bu-id').val(buId);
    $('#bu-name').val(buName);
    $('#bu-ending-code').val(buCode);

    // Set status radio button
    $('input[name="bu_status"][value="' + buActive + '"]').prop('checked', true);

    // Store original values for change detection
    originalFormValues = {
        name: buName,
        department: buDept ? buDept.toString() : '',
        outlet: buOutletId ? buOutletId.toString() : '',
        ending_code: buCode,
        status: buActive.toString()
    };

    // Pre-populate outlet Select2 if set
    if (buOutletId) {
        var outletOption = new Option(buOutletCode, buOutletId, true, true);
        $('#bu-outlet').append(outletOption).trigger('change');
    } else {
        $('#bu-outlet').val(null).trigger('change');
    }

    // For Select2, fetch and populate department name
    if (buDept) {
        $.ajax({
            url: '/odb/referral/backend.php?action=getDepartments',
            type: 'GET',
            success: function (data) {
                var dept = data.find(function (d) { return d.id == buDept; });
                if (dept) {
                    var newOption = new Option(dept.name, dept.id, true, true);
                    $('#bu-department').append(newOption).trigger('change');

                    // Update original department value after Select2 is populated
                    originalFormValues.department = dept.id.toString();
                }
            }
        });
    } else {
        $('#bu-department').val(null).trigger('change');
    }

    $('#bu-submit-btn').text('Update').prop('disabled', true);
    $('#bu-cancel-btn').show();

    // Scroll to form
    $('html, body').animate({
        scrollTop: $('#business-unit-form').offset().top - 100
    }, 500);
}

// Toggle Business Unit Active/Inactive Status
function handleToggleStatus() {
    var buId = $(this).data('id');
    var buName = $(this).data('name');
    var buDept = $(this).data('dept');
    var buCode = $(this).data('code');
    var buOutletId = $(this).data('outlet-id');
    var currentActive = $(this).data('active');
    var newActive = currentActive == 1 ? 0 : 1;
    var statusText = newActive == 1 ? 'active' : 'inactive';

    if (!confirm('Are you sure you want to set this business unit as ' + statusText + '?')) {
        return;
    }

    // Prepare complete business unit data for API call
    var buData = {
        name: buName,
        staff_department_id: buDept ? parseInt(buDept) : null,
        outlet_id: buOutletId ? parseInt(buOutletId) : null,
        ending_code: buCode,
        is_active: newActive
    };

    var payload = {
        action: 'update-business-unit',
        business_unit_id: parseInt(buId),
        business_unit_data: buData
    };

    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        dataType: 'json',
        success: function (response) {
            console.log('Toggle Status Response:', response);
            // Handle success as both boolean and number (1 or true)
            if (response.success === true || response.success === 1 || response.success === '1') {
                toast.success('Business unit status updated successfully');
                // Reload page after 1 second to show latest changes
                setTimeout(function () {
                    window.location.reload();
                }, 1000);
            } else {
                toast.error(response.message || 'Status update failed');
            }
        },
        error: function (xhr, status, error) {
            toast.error('Error updating status');
            console.error('Error toggling status:', error);
            console.error('XHR:', xhr.responseText);
        }
    });
}

// Reset Business Unit form to create mode
function resetBusinessUnitForm() {
    $('#business-unit-form')[0].reset();
    $('#bu-id').val('');
    $('#bu-submit-btn').text('Create').prop('disabled', false);
    $('#bu-cancel-btn').hide();

    // Clear Select2 selections
    $('#bu-department').val(null).trigger('change');
    $('#bu-outlet').val(null).trigger('change');

    // Reset status to Active
    $('#bu-status-active').prop('checked', true);

    // Clear original form values
    originalFormValues = {};
}

// Check if form values have changed (for edit mode)
function checkFormChanges() {
    var buId = $('#bu-id').val();

    // Only check changes in edit mode
    if (!buId || Object.keys(originalFormValues).length === 0) {
        return;
    }

    var currentValues = {
        name: $('#bu-name').val().trim(),
        department: $('#bu-department').val() || '',
        outlet: $('#bu-outlet').val() || '',
        ending_code: $('#bu-ending-code').val().trim().toUpperCase().replace(/\s*,\s*/g, ','),
        status: $('input[name="bu_status"]:checked').val()
    };

    // Check if at least one field has changed
    var hasChanges = currentValues.name !== originalFormValues.name ||
        currentValues.department !== originalFormValues.department ||
        currentValues.outlet !== originalFormValues.outlet ||
        currentValues.ending_code !== originalFormValues.ending_code ||
        currentValues.status !== originalFormValues.status;

    // Enable/disable Update button based on changes
    $('#bu-submit-btn').prop('disabled', !hasChanges);
}

// Show message badge below submit button
function showBadgeMessage(message, type) {
    // Remove existing badge if any
    $('#bu-message-badge').remove();

    // Determine badge class
    var badgeClass = type === 'success' ? 'alert alert-success' : 'alert alert-danger';

    // Create badge element
    var badge = $('<div id="bu-message-badge" class="' + badgeClass + ' mt-2" style="font-size:13px;text-align:left;padding:8px;">' + message + '</div>');

    // Insert badge below submit button row
    badge.insertAfter($('#bu-submit-btn').closest('.row'));

    // Auto-hide after 5 seconds
    setTimeout(function () {
        $('#bu-message-badge').fadeOut(300, function () {
            $(this).remove();
        });
    }, 5000);
}

// Show message badge below Access Control submit button
function showAccessBadgeMessage(message, type) {
    // Remove existing badge if any
    $('#access-message-badge').remove();

    // Determine badge class
    var badgeClass = type === 'success' ? 'alert alert-success' : 'alert alert-danger';

    // Create badge element
    var badge = $('<div id="access-message-badge" class="' + badgeClass + ' mt-2" style="font-size:13px;text-align:left;padding:8px;">' + message + '</div>');

    // Insert badge below the Update Access button row
    badge.insertAfter($('#access-control-form button[type="submit"]').closest('.row'));

    // Auto-hide after 5 seconds
    setTimeout(function () {
        $('#access-message-badge').fadeOut(300, function () {
            $(this).remove();
        });
    }, 5000);
}
