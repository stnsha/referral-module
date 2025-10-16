// Load organizations and external referees on page load
$(document).ready(function () {
    // Fetch organizations from API
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
            var $select = $('#organization-select');

            if (response && response.data && Array.isArray(response.data)) {
                $.each(response.data, function (i, org) {
                    $select.append('<option value="' + org.id + '">' + org.name + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading organizations:', error);
        }
    });

    // Fetch external referees from API
    $.ajax({
        url: '/odb/referral/api-jwt.php',
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            action: 'external-referees'
        }),
        success: function (response) {
            console.log('External referees loaded:', response);
            var $tbody = $('#external-referees-tbody');
            $tbody.empty();

            if (response && response.data && Array.isArray(response.data) && response.data.length > 0) {
                $.each(response.data, function (i, referee) {
                    var orgName = referee.organization ? referee.organization.name : 'N/A';
                    var orgId = referee.organization ? referee.organization.id : '';
                    var email = referee.email || '';

                    var row = '<tr data-id="' + referee.id + '">' +
                        '<td data-field="name">' + referee.name + '</td>' +
                        '<td data-field="email">' + (email || 'N/A') + '</td>' +
                        '<td data-field="phone">' + referee.phone + '</td>' +
                        '<td data-field="organization" data-org-id="' + orgId + '">' + orgName + '</td>' +
                        '<td data-field="position">' + referee.position + '</td>' +
                        '<td>' +
                        '<button class="btn btn-sm btn-primary btn-edit" data-id="' + referee.id + '">Edit</button> ' +
                        '<button class="btn btn-sm btn-danger btn-delete" data-id="' + referee.id + '">Delete</button>' +
                        '</td>' +
                        '</tr>';
                    $tbody.append(row);
                });
            } else {
                $tbody.append('<tr><td colspan="6" class="text-center">No external referees found</td></tr>');
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading external referees:', error);
            $('#external-referees-tbody').html('<tr><td colspan="6" class="text-center text-danger">Error loading data</td></tr>');
        }
    });

    // Handle "Add New Organization" button click
    $('#add-new-org-btn').on('click', function () {
        $('#new-organization-section').show();
        $('#organization-select').val('').prop('disabled', true);
        $(this).hide();
    });

    // Handle "Cancel" button click
    $('#cancel-new-org-btn').on('click', function () {
        $('#new-organization-section').hide();
        $('#organization-select').prop('disabled', false);
        $('#add-new-org-btn').show();

        // Clear new organization fields
        $('#new-org-name').val('');
        $('#new-org-address').val('');
        $('#new-org-postcode').val('');
        $('#new-org-state').val('');
        $('#new-org-country').val('');
        $('#error-new-org-name').html('');
    });

    // Handle Edit button click - convert row to editable fields
    $(document).on('click', '.btn-edit', function () {
        var $row = $(this).closest('tr');
        var refereeId = $(this).data('id');

        // Store original values
        $row.data('original-name', $row.find('[data-field="name"]').text());
        $row.data('original-email', $row.find('[data-field="email"]').text());
        $row.data('original-phone', $row.find('[data-field="phone"]').text());
        $row.data('original-org-id', $row.find('[data-field="organization"]').data('org-id'));
        $row.data('original-org-name', $row.find('[data-field="organization"]').text());
        $row.data('original-position', $row.find('[data-field="position"]').text());

        // Replace text with input fields
        var nameVal = $row.find('[data-field="name"]').text();
        var emailVal = $row.find('[data-field="email"]').text();
        emailVal = (emailVal === 'N/A') ? '' : emailVal;
        var phoneVal = $row.find('[data-field="phone"]').text();
        var orgId = $row.find('[data-field="organization"]').data('org-id');
        var positionVal = $row.find('[data-field="position"]').text();

        $row.find('[data-field="name"]').html('<input type="text" class="form-control form-control-sm" value="' + nameVal + '">');
        $row.find('[data-field="email"]').html('<input type="email" class="form-control form-control-sm" value="' + emailVal + '">');
        $row.find('[data-field="phone"]').html('<input type="tel" class="form-control form-control-sm" value="' + phoneVal + '">');

        // Build organization dropdown
        var orgSelect = '<select class="form-control form-control-sm">';
        $('#organization-select option').each(function() {
            var optVal = $(this).val();
            var optText = $(this).text();
            if (optVal !== '') {
                var selected = (optVal == orgId) ? 'selected' : '';
                orgSelect += '<option value="' + optVal + '" ' + selected + '>' + optText + '</option>';
            }
        });
        orgSelect += '</select>';
        $row.find('[data-field="organization"]').html(orgSelect);

        $row.find('[data-field="position"]').html('<input type="text" class="form-control form-control-sm" value="' + positionVal + '">');

        // Change buttons
        $(this).replaceWith('<button class="btn btn-sm btn-success btn-update" data-id="' + refereeId + '">Update</button> ' +
                           '<button class="btn btn-sm btn-secondary btn-cancel">Cancel</button>');
    });

    // Handle Cancel button click - revert to original values
    $(document).on('click', '.btn-cancel', function () {
        var $row = $(this).closest('tr');

        $row.find('[data-field="name"]').text($row.data('original-name'));
        $row.find('[data-field="email"]').text($row.data('original-email'));
        $row.find('[data-field="phone"]').text($row.data('original-phone'));
        $row.find('[data-field="organization"]').text($row.data('original-org-name'));
        $row.find('[data-field="organization"]').data('org-id', $row.data('original-org-id'));
        $row.find('[data-field="position"]').text($row.data('original-position'));

        var refereeId = $row.data('id');
        var $actionCell = $row.find('td:last');
        $actionCell.html(
            '<button class="btn btn-sm btn-primary btn-edit" data-id="' + refereeId + '">Edit</button> ' +
            '<button class="btn btn-sm btn-danger btn-delete" data-id="' + refereeId + '">Delete</button>'
        );
    });

    // Handle Update button click
    $(document).on('click', '.btn-update', function () {
        var $row = $(this).closest('tr');
        var refereeId = $(this).data('id');

        console.log('Referee ID:', refereeId);

        // Clear previous error messages
        $row.find('.error-message').remove();

        // Helper functions for validation
        function isEmpty(val) {
            return val === null || val.trim() === "";
        }

        function isEmail(val) {
            return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
        }

        function showError($field, message) {
            var $errorDiv = $('<div class="error-message" style="color: red; font-size: 12px; margin-top: 3px;"></div>');
            $errorDiv.text(message);
            $field.after($errorDiv);
        }

        // Get field values
        var name = $row.find('[data-field="name"] input').val();
        var email = $row.find('[data-field="email"] input').val();
        var phone = $row.find('[data-field="phone"] input').val();
        var organizationId = $row.find('[data-field="organization"] select').val();
        var position = $row.find('[data-field="position"] input').val();

        var hasError = false;

        // Validate name
        if (isEmpty(name)) {
            showError($row.find('[data-field="name"] input'), 'Name cannot be empty.');
            hasError = true;
        }

        // Validate email - optional but must be valid if provided
        if (!isEmpty(email) && !isEmail(email)) {
            showError($row.find('[data-field="email"] input'), 'Please enter a valid email address.');
            hasError = true;
        }

        // Validate phone
        if (isEmpty(phone)) {
            showError($row.find('[data-field="phone"] input'), 'Phone cannot be empty.');
            hasError = true;
        } else if (phone.length < 10) {
            showError($row.find('[data-field="phone"] input'), 'Phone number must be at least 10 digits.');
            hasError = true;
        }

        // Validate organization
        if (isEmpty(organizationId)) {
            showError($row.find('[data-field="organization"] select'), 'Please select an organization.');
            hasError = true;
        }

        // Validate position
        if (isEmpty(position)) {
            showError($row.find('[data-field="position"] input'), 'Position cannot be empty.');
            hasError = true;
        }

        // If validation fails, stop here
        if (hasError) {
            return;
        }

        var updateData = {
            name: name,
            email: email,
            phone: phone,
            external_organization_id: parseInt(organizationId),
            position: position
        };

        console.log('Update data:', updateData);

        $.ajax({
            url: '/odb/referral/api-jwt.php?action=update-external-referee&referee_id=' + refereeId,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(updateData),
            success: function (response) {
                console.log('Update response:', response);
                if (response.success) {
                    alert('External referee updated successfully!');
                    // Reload the table
                    location.reload();
                } else {
                    alert('Failed: ' + (response.message || 'Unknown error'));
                }
            },
            error: function (xhr, status, error) {
                console.error('Error updating referee:', error);
                console.error('Response text:', xhr.responseText);
                alert('Error updating referee. Please try again.');
            }
        });
    });

    // Handle Delete button click
    $(document).on('click', '.btn-delete', function () {
        var refereeId = $(this).data('id');
        var $row = $(this).closest('tr');
        var refereeName = $row.find('[data-field="name"]').text();

        // Show confirmation dialog
        if (confirm('Are you sure you want to delete ' + refereeName + '? This action cannot be undone.')) {
            console.log('Deleting referee ID:', refereeId);

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
                    console.log('Delete response:', response);
                    if (response.success) {
                        alert('External referee deleted successfully!');
                        // Reload the table
                        location.reload();
                    } else {
                        alert('Failed to delete: ' + (response.message || 'Unknown error'));
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Error deleting referee:', error);
                    console.error('Response text:', xhr.responseText);

                    // Try to parse the error response to get the actual message
                    var errorMessage = 'Error deleting referee. Please try again.';
                    try {
                        var errorResponse = JSON.parse(xhr.responseText);
                        if (errorResponse.message) {
                            errorMessage = errorResponse.message;
                        }
                    } catch (e) {
                        // If JSON parsing fails, use default message
                    }

                    alert(errorMessage);
                }
            });
        }
    });
});

//Submission validation
function validateForm(event) {
    event.preventDefault();
    var form = document.forms["externalRefereeForm"];

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

    markError("name", isEmpty(form["name"].value), "This field cannot be left blank.");
    markError("position", isEmpty(form["position"].value), "This field cannot be left blank.");
    markError("phone", isEmpty(form["phone"].value), "This field cannot be left blank.");
    var email = form["email"].value;
    // Email is optional, but if provided, must be valid
    if (!isEmpty(email)) {
        markError("email", !isEmail(email), "Please enter a valid email address.");
    }

    // Check if new organization section is visible
    var isNewOrgVisible = $('#new-organization-section').is(':visible');

    if (isNewOrgVisible) {
        // Validate new organization name
        markError("new-org-name", isEmpty(form["new_org_name"].value), "Organization name is required.");
    } else {
        // Validate organization selection
        markError("organization", isEmpty(form["external_organization_id"].value), "Please select an organization.");
    }

    if (!hasError) {
        $(this).find(':input').each(function () {
            if ($(this).is(':hidden')) {
                $(this).prop('required', false);
            }
        });

        const formData = new FormData(form);

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

        fetch('referral/externalReferee/post.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                const parsed = JSON.parse(data);
                const inner = JSON.parse(parsed.response);
                console.log('ID:', inner.id);
                console.log('HTTP Code:', parsed.httpCode);

                const successCode = parsed.httpCode;

                if (successCode === 200 || successCode === 201) {
                    window.location.href = 'referral/externalReferee/index.php';
                } else {
                    console.log('Failed:', inner.message);
                }

            })
            .catch(error => {
                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });
            });

    }
}