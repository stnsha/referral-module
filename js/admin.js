function loadBusinessUnits() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        data: { action: 'business-units' },
        success: function (data) {
            window.allBusinessUnits = data.data;
            var $container = $('#business-units-container');
            $container.empty();

            var preSelectedIds = [];

            $.each(data.data, function (i, unit) {
                var isMatch = false;

                if (department == 1) {
                    if (staffPosition.toLowerCase().includes('audiologist')) {
                        if (unit.id === 1) { isMatch = true; }
                    } else {
                        if (unit.id === 5 && unit.name.toLowerCase().includes('pharmacy')) { isMatch = true; }
                    }
                } else {
                    if (unit.staff_department_id == department) { isMatch = true; }
                }

                if (isMatch) { preSelectedIds.push(unit.id); }

                var $label = $('<label>', {
                    class: 'form-check-label r-text text-capitalize',
                    'for': 'bu-check-' + unit.id,
                    text: unit.name,
                    css: { fontSize: '13px' }
                });
                var $cb = $('<input>', {
                    type: 'checkbox',
                    class: 'form-check-input me-1 bu-checkbox',
                    id: 'bu-check-' + unit.id,
                    value: unit.id,
                    name: 'business_unit_ids[]'
                });
                var $wrap = $('<div>', { class: 'form-check mb-0' }).append($cb).append($label);
                $container.append($wrap);
            });

            if (preSelectedIds.length > 0) {
                $.each(preSelectedIds, function (i, id) {
                    $('#bu-check-' + id).prop('checked', true).prop('disabled', true);
                });
            }
        },
        error: function () {
            $('#error-business-units').text('Failed to load business units');
        }
    });
}

$(document).ready(function () {
    // Load business units
    loadBusinessUnits();

    // Load all forms
    loadAllForms();

    // Handle hide/unhide form button click
    $(document).on('click', '.btn-toggle-form', function () {
        var formId = $(this).data('id');
        var isHidden = $(this).data('hidden');
        var action = isHidden ? 'unhide-form' : 'hide-form';
        var confirmMessage = isHidden ? 'Are you sure you want to unhide this form?' : 'Are you sure you want to hide this form?';

        if (confirm(confirmMessage)) {
            $.ajax({
                url: 'referral/api-jwt.php',
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: JSON.stringify({
                    action: action,
                    form_id: formId
                }),
                success: function (response) {
                    console.log('Toggle form response:', response);
                    if (response.success) {
                        alert(response.message || (isHidden ? 'Form unhidden successfully!' : 'Form hidden successfully!'));
                        loadAllForms(); // Reload the forms table
                    } else {
                        alert('Failed: ' + (response.message || 'Unknown error'));
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error toggling form:', error);
                    alert('Error. Please try again.');
                }
            });
        }
    });
});

// Function to load all forms
function loadAllForms() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'all-forms'
        }),
        success: function (response) {
            console.log('All forms loaded:', response);
            var $tbody = $('#forms-tbody');
            $tbody.empty();

            if (response && response.data && response.data.forms && Array.isArray(response.data.forms) && response.data.forms.length > 0) {
                // Store all forms globally for use in condition modal dropdowns
                window.allFormsData = response.data.forms;

                $.each(response.data.forms, function (i, form) {
                    var isHidden = form.is_hidden ? 'Yes' : 'No';
                    var displayOn = form.display_on || 'creation';
                    var rowNumber = i + 1;

                    // Build nested table for form details
                    var detailsHtml = '<table class="table table-sm table-bordered mb-0">';
                    detailsHtml += '<thead class="table-secondary"><tr><th>Field Name</th><th>Field Type</th><th>Required</th><th>Values</th></tr></thead>';
                    detailsHtml += '<tbody>';

                    if (Array.isArray(form.form_details)) {
                        // Array format
                        $.each(form.form_details, function (j, detail) {
                            var isRequired = detail.is_required ? 'Yes' : 'No';
                            var fieldValue = detail.field_value || '-';
                            detailsHtml += '<tr>';
                            detailsHtml += '<td>' + detail.field_name + '</td>';
                            detailsHtml += '<td>' + detail.field_type + '</td>';
                            detailsHtml += '<td>' + isRequired + '</td>';
                            detailsHtml += '<td>' + fieldValue + '</td>';
                            detailsHtml += '</tr>';
                        });
                    } else if (typeof form.form_details === 'object') {
                        // Object format
                        $.each(form.form_details, function (fieldName, detail) {
                            var isRequired = detail.is_required ? 'Yes' : 'No';
                            var fieldValue = '-';

                            if (Array.isArray(detail.field_value)) {
                                fieldValue = detail.field_value.map(function(v) {
                                    return v.field_value;
                                }).join(', ');
                            } else if (detail.field_value) {
                                fieldValue = detail.field_value;
                            }

                            detailsHtml += '<tr>';
                            detailsHtml += '<td>' + detail.field_name + '</td>';
                            detailsHtml += '<td>' + detail.field_type + '</td>';
                            detailsHtml += '<td>' + isRequired + '</td>';
                            detailsHtml += '<td>' + fieldValue + '</td>';
                            detailsHtml += '</tr>';
                        });
                    }

                    detailsHtml += '</tbody></table>';

                    // Build conditions summary
                    var conditionsHtml = '-';
                    if (Array.isArray(form.conditions) && form.conditions.length > 0) {
                        conditionsHtml = form.conditions.map(function(c) {
                            return 'trigger:' + c.trigger_form_detail_id;
                        }).join(', ');
                    }

                    // Build business units summary
                    var buNamesHtml = '-';
                    if (Array.isArray(form.business_unit_ids) && form.business_unit_ids.length > 0 && window.allBusinessUnits) {
                        var buNames = form.business_unit_ids.map(function(id) {
                            var bu = window.allBusinessUnits.find(function(b) { return b.id === id; });
                            return bu ? bu.name : 'ID:' + id;
                        });
                        buNamesHtml = buNames.join(', ');
                    }

                    // Determine button text and color based on is_hidden status
                    var buttonText = form.is_hidden ? 'Unhide' : 'Hide';
                    var buttonClass = form.is_hidden ? 'btn-primary' : 'btn-warning';

                    var row = '<tr>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + rowNumber + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + form.label_name + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + buNamesHtml + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + isHidden + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + displayOn + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + conditionsHtml + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' + detailsHtml + '</td>' +
                        '<td class="r-text" style="font-size:13px;text-align:start;">' +
                        '<button class="btn btn-sm ' + buttonClass + ' btn-toggle-form me-1" data-id="' + form.form_id + '" data-hidden="' + form.is_hidden + '">' + buttonText + '</button>' +
                        '<button class="btn btn-sm btn-secondary btn-manage-conditions me-1" data-form-id="' + form.form_id + '" data-form-name="' + form.label_name + '">Conditions</button>' +
                        '<button class="btn btn-sm btn-info btn-edit-form" data-form-id="' + form.form_id + '">Edit</button>' +
                        '</td>' +
                        '</tr>';
                    $tbody.append(row);
                });
            } else {
                $tbody.append('<tr><td colspan="8" class="text-center">No forms found</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading forms:', error);
            $('#forms-tbody').html('<tr><td colspan="8" class="text-center text-danger">Error loading forms</td></tr>');
        }
    });
}

// Delegated handler for "Edit" button
$(document).on('click', '.btn-edit-form', function () {
    var formId = parseInt($(this).data('form-id'), 10);
    var form = (window.allFormsData || []).find(function (f) { return f.form_id === formId; });
    if (form) { openEditModal(form); }
});

function openEditModal(form) {
    // Extract first detail from array or grouped-object format
    var detail = null;
    if (Array.isArray(form.form_details) && form.form_details.length > 0) {
        detail = form.form_details[0];
    } else if (form.form_details && typeof form.form_details === 'object') {
        var vals = Object.values(form.form_details);
        if (vals.length > 0) { detail = vals[0]; }
    }

    var bodyHtml = '<p class="r-text mb-1"><strong>Label:</strong> ' + form.label_name + '</p>';

    // Business unit management section
    bodyHtml += '<hr><p class="r-text fw-bold mb-2" style="font-size:14px;">Business Units</p>';
    bodyHtml += '<div id="bu-list-container">';
    var attachedBuIds = Array.isArray(form.business_unit_ids) ? form.business_unit_ids : [];
    if (attachedBuIds.length > 0 && window.allBusinessUnits) {
        attachedBuIds.forEach(function (buId) {
            var bu = window.allBusinessUnits.find(function (b) { return b.id === buId; });
            var buName = bu ? bu.name : 'ID:' + buId;
            bodyHtml += '<div class="d-flex justify-content-between align-items-center mb-1 r-text bu-row" ' +
                'id="bu-row-' + buId + '" style="font-size:13px;">' +
                '<span>' + buName + '</span>' +
                '<button class="btn btn-sm btn-danger btn-remove-form-bu" ' +
                'data-form-id="' + form.form_id + '" data-bu-id="' + buId + '">Remove</button>' +
                '</div>';
        });
    } else {
        bodyHtml += '<p class="text-muted r-text" style="font-size:13px;" id="no-bu-msg">No business units attached.</p>';
    }
    bodyHtml += '</div>';

    // Dropdown for adding a new BU (exclude already attached)
    var availableBus = window.allBusinessUnits ? window.allBusinessUnits.filter(function (bu) {
        return attachedBuIds.indexOf(bu.id) === -1;
    }) : [];
    bodyHtml += '<div class="d-flex align-items-center mt-2">' +
        '<select id="add-bu-select" class="form-select form-select-sm">' +
        '<option value="">Select business unit to add...</option>';
    availableBus.forEach(function (bu) {
        bodyHtml += '<option value="' + bu.id + '">' + bu.name + '</option>';
    });
    bodyHtml += '</select>' +
        '<button class="btn btn-sm btn-primary ms-2 btn-add-form-bu" ' +
        'data-form-id="' + form.form_id + '">Add</button>' +
        '</div>' +
        '<div id="bu-modal-message" class="mt-1" style="font-size:12px;"></div>';
    bodyHtml += '<hr>';

    if (!detail) {
        bodyHtml += '<p class="text-muted r-text">No form details found for this form.</p>';
    } else {
        var fieldName = detail.field_name;
        var fieldType = detail.field_type;
        var isRequired = detail.is_required ? 1 : 0;

        bodyHtml += '<p class="r-text mb-2">' +
            '<strong>Field Name:</strong> ' + fieldName +
            ' &nbsp; <strong>Type:</strong> ' + fieldType + '</p>';

        if (fieldType === 'radio' || fieldType === 'checkbox') {
            bodyHtml += '<div id="edit-value-fields">' +
                '<div class="input-group mb-2">' +
                '<input type="text" class="form-control form-control-sm edit-value-input" placeholder="Enter new value">' +
                '<button type="button" class="btn btn-sm btn-danger remove-edit-value">Remove</button>' +
                '</div></div>' +
                '<button type="button" id="btn-add-edit-value" class="btn btn-sm btn-secondary mb-2">+ Add More</button>' +
                '<div id="edit-modal-message" class="mb-2"></div>' +
                '<button type="button" id="btn-save-edit-values" ' +
                'data-form-id="' + form.form_id + '" ' +
                'data-field-name="' + fieldName + '" ' +
                'data-field-type="' + fieldType + '" ' +
                'data-is-required="' + isRequired + '" ' +
                'class="btn btn-sm btn-primary">Save</button>';
        } else {
            bodyHtml += '<p class="text-muted r-text">New values can only be added to radio or checkbox field types.</p>';
        }
    }

    $('#editModalBody').html(bodyHtml);
    $('#editModalLabel').text('Edit Form: ' + form.label_name);
    var editModalEl = document.getElementById('editModal');
    bootstrap.Modal.getOrCreateInstance(editModalEl).show();
}

// Add More value row in edit modal
$(document).on('click', '#btn-add-edit-value', function () {
    $('#edit-value-fields').append(
        '<div class="input-group mb-2">' +
        '<input type="text" class="form-control form-control-sm edit-value-input" placeholder="Enter new value">' +
        '<button type="button" class="btn btn-sm btn-danger remove-edit-value">Remove</button>' +
        '</div>'
    );
});

// Remove value row in edit modal
$(document).on('click', '.remove-edit-value', function () {
    $(this).closest('.input-group').remove();
});

// Save new values in edit modal
$(document).on('click', '#btn-save-edit-values', function () {
    var $btn = $(this);
    var formId = parseInt($btn.data('form-id'), 10);
    var fieldName = $btn.data('field-name');
    var fieldType = $btn.data('field-type');
    var isRequired = parseInt($btn.data('is-required'), 10);
    var $msg = $('#edit-modal-message');

    var newValues = [];
    $('.edit-value-input').each(function () {
        var v = $(this).val().trim();
        if (v !== '') { newValues.push(v); }
    });

    if (newValues.length === 0) {
        // No values entered — business unit changes are already saved; just close
        bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).hide();
        return;
    }

    $btn.prop('disabled', true).text('Saving...');
    $msg.text('');

    var formDetails = newValues.map(function (v) {
        return {
            field_name: fieldName,
            field_type: fieldType,
            is_required: isRequired,
            field_value: v
        };
    });

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'add-form-details',
            form_id: formId,
            form_details: formDetails
        }),
        success: function (data) {
            $btn.prop('disabled', false).text('Save');
            if (data.success) {
                $msg.text('Values added successfully.').css('color', 'green');
                loadAllForms();
                setTimeout(function () {
                    bootstrap.Modal.getOrCreateInstance(document.getElementById('editModal')).hide();
                }, 1200);
            } else {
                $msg.text('Error: ' + (data.message || 'Failed to add values.')).css('color', 'red');
            }
        },
        error: function () {
            $btn.prop('disabled', false).text('Save');
            $msg.text('Request failed. Please try again.').css('color', 'red');
        }
    });
});

// Remove a business unit from a form
$(document).on('click', '.btn-remove-form-bu', function () {
    var $btn = $(this);
    var formId = parseInt($btn.data('form-id'), 10);
    var buId = parseInt($btn.data('bu-id'), 10);
    var buName = $btn.closest('.bu-row').find('span').text();
    var $msg = $('#bu-modal-message');

    if (!confirm('Remove "' + buName + '" from this form?')) { return; }

    $btn.prop('disabled', true).text('Removing...');
    $msg.text('');

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'remove-form-business-unit', form_id: formId, business_unit_id: buId }),
        success: function (data) {
            if (data.success) {
                $btn.closest('.bu-row').remove();
                // Add the removed BU back to the add dropdown
                if (window.allBusinessUnits) {
                    var bu = window.allBusinessUnits.find(function (b) { return b.id === buId; });
                    if (bu) {
                        $('#add-bu-select').append('<option value="' + bu.id + '">' + bu.name + '</option>');
                    }
                }
                if ($('#bu-list-container .bu-row').length === 0) {
                    $('#bu-list-container').append('<p class="text-muted r-text" style="font-size:13px;" id="no-bu-msg">No business units attached.</p>');
                }
                $msg.text(data.message || 'Removed successfully.').css('color', 'green');
                loadAllForms();
            } else {
                $btn.prop('disabled', false).text('Remove');
                $msg.text(data.message || 'Failed to remove.').css('color', 'red');
            }
        },
        error: function () {
            $btn.prop('disabled', false).text('Remove');
            $msg.text('Request failed.').css('color', 'red');
        }
    });
});

// Add a business unit to a form
$(document).on('click', '.btn-add-form-bu', function () {
    var $btn = $(this);
    var formId = parseInt($btn.data('form-id'), 10);
    var buId = parseInt($('#add-bu-select').val(), 10);
    var $msg = $('#bu-modal-message');

    if (!buId) {
        $msg.text('Please select a business unit.').css('color', 'red');
        return;
    }

    $btn.prop('disabled', true).text('Adding...');
    $msg.text('');

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({ action: 'add-form-business-unit', form_id: formId, business_unit_id: buId }),
        success: function (data) {
            $btn.prop('disabled', false).text('Add');
            if (data.success) {
                var bu = window.allBusinessUnits ? window.allBusinessUnits.find(function (b) { return b.id === buId; }) : null;
                var buName = bu ? bu.name : 'ID:' + buId;
                // Add row to list
                $('#no-bu-msg').remove();
                $('#bu-list-container').append(
                    '<div class="d-flex justify-content-between align-items-center mb-1 r-text bu-row" ' +
                    'id="bu-row-' + buId + '" style="font-size:13px;">' +
                    '<span>' + buName + '</span>' +
                    '<button class="btn btn-sm btn-danger btn-remove-form-bu" ' +
                    'data-form-id="' + formId + '" data-bu-id="' + buId + '">Remove</button>' +
                    '</div>'
                );
                // Remove from dropdown
                $('#add-bu-select option[value="' + buId + '"]').remove();
                $('#add-bu-select').val('');
                $msg.text(data.message || 'Added successfully.').css('color', 'green');
                loadAllForms();
            } else {
                $msg.text(data.message || 'Failed to add.').css('color', 'red');
            }
        },
        error: function () {
            $btn.prop('disabled', false).text('Add');
            $msg.text('Request failed.').css('color', 'red');
        }
    });
});

// Delegated handler for "Conditions" button
$(document).on('click', '.btn-manage-conditions', function () {
    var formId = $(this).data('form-id');
    var formName = $(this).data('form-name');
    openConditionModal(formId, formName);
});

function openConditionModal(formId, formName) {
    $('#conditionModalLabel').text('Conditions: ' + formName);

    var form = null;
    if (window.allFormsData) {
        for (var i = 0; i < window.allFormsData.length; i++) {
            if (window.allFormsData[i].form_id === formId) {
                form = window.allFormsData[i];
                break;
            }
        }
    }

    var bodyHtml = '';

    // Current conditions list
    if (form && Array.isArray(form.conditions) && form.conditions.length > 0) {
        bodyHtml += '<p class="r-text fw-bold">Current Conditions</p>';
        bodyHtml += '<ul class="list-group mb-3" id="condition-list">';
        form.conditions.forEach(function (c) {
            var label = 'form_detail_id: ' + c.trigger_form_detail_id;
            // Try to find the field_value label from allFormsData
            if (window.allFormsData) {
                window.allFormsData.forEach(function (f) {
                    var details = Array.isArray(f.form_details) ? f.form_details : Object.values(f.form_details || {});
                    details.forEach(function (d) {
                        if (Array.isArray(d.field_value)) {
                            d.field_value.forEach(function (opt) {
                                if (opt.form_detail_id === c.trigger_form_detail_id) {
                                    label = opt.field_value + ' (id:' + opt.form_detail_id + ')';
                                }
                            });
                        }
                    });
                });
            }
            bodyHtml += '<li class="list-group-item d-flex justify-content-between align-items-center r-text" style="font-size:13px;">' +
                label +
                '<button class="btn btn-sm btn-danger btn-delete-condition" data-condition-id="' + c.condition_id + '" data-form-id="' + formId + '">Delete</button>' +
                '</li>';
        });
        bodyHtml += '</ul>';
    } else {
        bodyHtml += '<p class="r-text text-muted" style="font-size:13px;">No conditions defined.</p>';
    }

    // Add condition form
    bodyHtml += '<hr><p class="r-text fw-bold">Add Condition</p>';
    bodyHtml += '<div class="mb-2">';
    bodyHtml += '<label class="r-text" style="font-size:13px;">Trigger Form Detail</label>';
    bodyHtml += '<select id="trigger-detail-select" class="form-select form-select-sm mt-1">';
    bodyHtml += '<option value="">Select trigger option</option>';

    if (window.allFormsData) {
        window.allFormsData.forEach(function (f) {
            var details = Array.isArray(f.form_details) ? f.form_details : Object.values(f.form_details || {});
            details.forEach(function (d) {
                if (Array.isArray(d.field_value)) {
                    d.field_value.forEach(function (opt) {
                        bodyHtml += '<option value="' + opt.form_detail_id + '">' +
                            '[Form: ' + f.label_name + '] ' + opt.field_value + ' (id:' + opt.form_detail_id + ')' +
                            '</option>';
                    });
                }
            });
        });
    }

    bodyHtml += '</select></div>';
    bodyHtml += '<button class="btn btn-sm btn-primary" id="btn-add-condition" data-form-id="' + formId + '">Add Condition</button>';
    bodyHtml += '<div id="condition-modal-message" class="mt-2" style="font-size:12px;"></div>';

    $('#conditionModalBody').html(bodyHtml);
    var modal = new bootstrap.Modal(document.getElementById('conditionModal'));
    modal.show();
}

$(document).on('click', '.btn-delete-condition', function () {
    var conditionId = $(this).data('condition-id');
    var formId = $(this).data('form-id');
    var $btn = $(this);
    $btn.prop('disabled', true).text('Deleting...');

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'delete-condition',
            condition_id: conditionId
        }),
        success: function (data) {
            if (data.success) {
                $btn.closest('li').remove();
                loadAllForms();
            } else {
                $btn.prop('disabled', false).text('Delete');
                $('#condition-modal-message').text('Error: ' + (data.message || 'Failed to delete.')).css('color', 'red');
            }
        },
        error: function () {
            $btn.prop('disabled', false).text('Delete');
            $('#condition-modal-message').text('Request failed.').css('color', 'red');
        }
    });
});

$(document).on('click', '#btn-add-condition', function () {
    var formId = $(this).data('form-id');
    var triggerDetailId = $('#trigger-detail-select').val();
    var $btn = $(this);

    if (!triggerDetailId) {
        $('#condition-modal-message').text('Please select a trigger option.').css('color', 'red');
        return;
    }

    $btn.prop('disabled', true).text('Adding...');
    $('#condition-modal-message').text('');

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'create-condition',
            form_id: formId,
            trigger_form_detail_id: parseInt(triggerDetailId, 10)
        }),
        success: function (data) {
            $btn.prop('disabled', false).text('Add Condition');
            if (data.success) {
                $('#condition-modal-message').text('Condition added successfully.').css('color', 'green');
                loadAllForms();
            } else {
                $('#condition-modal-message').text('Error: ' + (data.message || 'Failed to add.')).css('color', 'red');
            }
        },
        error: function () {
            $btn.prop('disabled', false).text('Add Condition');
            $('#condition-modal-message').text('Request failed.').css('color', 'red');
        }
    });
});

document.addEventListener('DOMContentLoaded', function () {
    const inputTypeSelect = document.getElementById('input_type');
    const dynamicValuesSection = document.getElementById('dynamic-values');
    const valueFieldsContainer = document.getElementById('value-fields');
    const addValueBtn = document.getElementById('addValueBtn');

    // Toggle the visibility of the dynamic value fields based on input type
    inputTypeSelect.addEventListener('change', function () {
        if (['checkbox', 'radio'].includes(inputTypeSelect.value)) {
            dynamicValuesSection.style.display = 'block';
        } else {
            dynamicValuesSection.style.display = 'none';
        }
    });

    // Add more value input fields when the "Add More" button is clicked
    addValueBtn.addEventListener('click', function () {
        const inputGroup = document.createElement('div');
        inputGroup.classList.add('input-group', 'mb-2');

        const newInputField = document.createElement('input');
        newInputField.type = 'text';
        newInputField.name = 'value_fields[]';
        newInputField.classList.add('form-control', 'form-control-sm');
        newInputField.placeholder = 'Enter value';

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.classList.add('btn', 'btn-sm', 'btn-danger', 'remove-value-btn');
        removeBtn.textContent = 'Remove';

        inputGroup.appendChild(newInputField);
        inputGroup.appendChild(removeBtn);
        valueFieldsContainer.insertBefore(inputGroup, addValueBtn);
    });

    // Handle remove button clicks for value fields
    valueFieldsContainer.addEventListener('click', function (e) {
        if (e.target.classList.contains('remove-value-btn')) {
            const inputGroup = e.target.closest('.input-group');
            const remainingFields = valueFieldsContainer.querySelectorAll('.input-group');

            // Keep at least one field
            if (remainingFields.length > 1) {
                inputGroup.remove();
            } else {
                alert('At least one value field is required.');
            }
        }
    });

    const labelNameInput = document.getElementById('label_name');
    const fieldNameInput = document.getElementById('field_name');

    // Automatically update field_name when label_name is entered
    labelNameInput.addEventListener('input', function () {
        let labelValue = labelNameInput.value.trim();
        let fieldNameValue = labelValue.replace(/\s+/g, '_').toLowerCase(); // Replace spaces with underscores and convert to lowercase
        fieldNameInput.value = fieldNameValue;
    });
});

function validateForm(e) {
    let hasError = false;

    const labelName = document.getElementById('label_name');
    const fieldName = document.getElementById('field_name');
    const fieldType = document.getElementById('input_type');
    const valueFields = document.querySelectorAll('input[name="value_fields[]"]');

    const style = 'color: red; font-size: 12px; text-align: start;';

    document.getElementById('error-business-units').textContent = '';
    document.getElementById('error-label-name').textContent = '';
    document.getElementById('error-field-type').textContent = '';
    document.getElementById('error-value-field').textContent = '';

    var selectedBuIds = Array.from(document.querySelectorAll('#business-units-container .bu-checkbox:checked')).map(function(cb) { return parseInt(cb.value, 10); });
    if (selectedBuIds.length === 0) {
        const errorDiv = document.getElementById('error-business-units');
        errorDiv.textContent = 'At least one Business Unit is required.';
        errorDiv.style = style;
        hasError = true;
    }

    if (labelName.value.trim() === '') {
        const errorDiv = document.getElementById('error-label-name');
        errorDiv.textContent = 'Label Name is required.';
        errorDiv.style = style;
        hasError = true;
    }

    var fieldNameDiv = fieldName.closest('.col-sm-8');
    var fieldNameError = fieldNameDiv.querySelector('.error-message');
    if (!fieldNameError) {
        fieldNameError = document.createElement('div');
        fieldNameError.className = 'error-message';
        fieldNameDiv.appendChild(fieldNameError);
    }
    fieldNameError.textContent = '';

    if (fieldName.value.trim() === '') {
        fieldNameError.textContent = 'Field Name is required.';
        fieldNameError.style = style;
        hasError = true;
    } else if (window.allFormsData) {
        var enteredName = fieldName.value.trim();
        var isDuplicate = window.allFormsData.some(function (f) {
            if (Array.isArray(f.form_details)) {
                return f.form_details.some(function (d) { return d.field_name === enteredName; });
            } else if (f.form_details && typeof f.form_details === 'object') {
                return Object.prototype.hasOwnProperty.call(f.form_details, enteredName);
            }
            return false;
        });
        if (isDuplicate) {
            fieldNameError.textContent = 'Field Name already exists. Please use a unique name.';
            fieldNameError.style = style;
            hasError = true;
        }
    }

    if (fieldType.value === '') {
        const errorDiv = document.getElementById('error-field-type');
        errorDiv.textContent = 'Field Type is required.';
        errorDiv.style = style;
        hasError = true;
    }

    if (fieldType.value === 'checkbox' || fieldType.value === 'radio') {
        const hasValue = Array.from(valueFields).some(input => input.value.trim() !== '');
        if (!hasValue) {
            const errorDiv = document.getElementById('error-value-field');
            errorDiv.textContent = 'At least one value is required.';
            errorDiv.style = style;
            hasError = true;
        }
    }

    if (hasError) {
        e.preventDefault();
    } else {
        // Create custom data array
        const displayOnEl = document.getElementById('display_on');
        const formDataArray = {
            'business_unit_ids': selectedBuIds,
            'label_name': labelName.value,
            'field_name': fieldName.value,
            'field_type': fieldType.value,
            'is_hidden': document.querySelector('input[name="is_hidden"]:checked') ? 1 : 0,
            'is_required': document.querySelector('input[name="is_required"]:checked') ? 1 : 0,
            'display_on': displayOnEl ? displayOnEl.value : 'creation'
        };
        // Add value_fields if checkbox or radio
        if (fieldType.value === 'checkbox' || fieldType.value === 'radio') {
            formDataArray.value_fields = Array.from(valueFields)
                .map(field => field.value.trim())
                .filter(value => value !== '');
        }

        // Send custom data array via AJAX
        e.preventDefault(); // Prevent traditional form submission
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'create-form',
                formData: formDataArray
            }),
            success: function (data) {
                if (data.success) {
                    // console.log('Success:', data.id);
                    $('.success-message').text('Form submitted successfully! Form ID: ' + data.id).show();

                    // Reset the form
                    document.getElementById('admin-form').reset();

                    // Clear error messages
                    document.querySelectorAll('.error-message').forEach(function(el) {
                        el.textContent = '';
                    });

                    // Hide dynamic values section
                    document.getElementById('dynamic-values').style.display = 'none';

                    // Reset value fields to initial state (one field with remove button)
                    const valueFieldsContainer = document.getElementById('value-fields');
                    valueFieldsContainer.innerHTML = `
                        <div class="input-group mb-2">
                            <input type="text" name="value_fields[]" class="form-control form-control-sm" placeholder="Enter value">
                            <button type="button" class="btn btn-sm btn-danger remove-value-btn">Remove</button>
                        </div>
                        <button type="button" id="addValueBtn" class="btn btn-sm btn-primary">Add More</button>
                    `;

                    // Reload all forms table
                    loadAllForms();

                    // Reload business units checkboxes to restore default selection
                    loadBusinessUnits();

                    // Hide success message after 3 seconds
                    setTimeout(function() {
                        $('.success-message').fadeOut();
                    }, 3000);

                } else {
                    console.log('Error:', data)
                }
            },
            error: function (xhr, status, error) {
                logError(new Error('Form submission error'), { context: 'validateForm', status: status, error: error, responseText: xhr.responseText });
            }
        });


    }
}

// Attach the validateForm function to form submission
document.getElementById('admin-form').onsubmit = validateForm;

