document.addEventListener('DOMContentLoaded', function () {
    //load functions
    loadBusinessUnits();
    loadStatus();
    loadMonths();
    loadYears();

    // Business unit change handler
    $('#filter-business-unit').on('change', function () {
        const selectedOption = $(this).find('option:selected');
        const businessUnitId = selectedOption.data('id');

        if (businessUnitId && selectedOption.val() !== 'all') {
            loadLocations(businessUnitId);
        } else {
            // Reset to default location option
            $('#filter-location').html('<option value="">Select Location</option>');
        }
    });

    // Reset filters button handler
    $('#resetFiltersBtn').on('click', function () {
        resetFilters();
    });

    // Generate Report button handler
    $('#viewReportbtn').on('click', function (e) {
        e.preventDefault();
        generateReport();
    });

});

// Load business units
function loadBusinessUnits() {
    //display business unit
    $.ajax({
        url: 'backend.php',
        type: 'GET',
        dataType: 'json',
        data: {
            action: 'getBusinessUnits'
        },
        success: function (response) {
            var busUnitFrom = $('#filter-business-unit');

            // Add default "All" option
            busUnitFrom.append('<option value="all">Select Business Unit</option>');

            let isSelected = false;
            let businessUnitId = '';

            $.each(response, function (index, businessUnit) {
                const selected = businessUnit.staff_department_id == department ? 'selected' : '';
                if (selected !== '') isSelected = true;
                if (selected !== '') businessUnitId = businessUnit.id;

                busUnitFrom.append(
                    '<option value="' + businessUnit.name + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            // Load locations for initially selected business unit
            if (businessUnitId) {
                loadLocations(businessUnitId);
            } else {
                // Show default location option
                $('#filter-location').html('<option value="">Select Location</option>');
            }
        },
        error: function () {
            console.error('Error loading business units');
        }
    });
}

// Function to load locations based on business unit ID
function loadLocations(businessUnitId) {
    $.ajax({
        url: 'backend.php?action=getLocations',
        type: 'POST',
        data: {
            ref_bus_id: businessUnitId
        },
        dataType: 'json',
        success: function (response) {
            var locationSelect = $('#filter-location');

            // Clear existing options and add default
            locationSelect.html('<option value="">Select Location</option>');

            $.each(response, function (index, location) {
                let selected = '';

                locationSelect.append(
                    '<option value="' + location.id + '" ' + selected + '>' +
                    location.code + '</option>'
                );
            });
        },
        error: function () {
            // Reset to default on error
            $('#filter-location').html('<option value="">Select Location</option>');
        }
    });
}

// Load status options from API
function loadStatus() {
    $.ajax({
        url: 'api.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            // console.log(response);
            const statusSelect = $('#filter-status');
            if (statusSelect.length && response && response.data) {
                // Clear existing options
                statusSelect.html('<option value="">All Status</option>');

                // Add status options from object format {"1": "Open", "2": "In Progress", etc.}
                Object.keys(response.data).forEach(function (key) {
                    statusSelect.append(
                        '<option value="' + key + '">' + response.data[key] + '</option>'
                    );
                });
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading status options:', error);
        }
    });
}
// Function to load month options
function loadMonths() {
    const months = [
        { value: 1, name: 'January' },
        { value: 2, name: 'February' },
        { value: 3, name: 'March' },
        { value: 4, name: 'April' },
        { value: 5, name: 'May' },
        { value: 6, name: 'June' },
        { value: 7, name: 'July' },
        { value: 8, name: 'August' },
        { value: 9, name: 'September' },
        { value: 10, name: 'October' },
        { value: 11, name: 'November' },
        { value: 12, name: 'December' }
    ];

    const monthSelect = $('#filter-month');
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1

    // Clear existing options and add default
    monthSelect.html('<option value="">All Months</option>');

    // Add month options
    months.forEach(function (month) {
        const selected = month.value === currentMonth ? 'selected' : '';
        monthSelect.append(
            '<option value="' + month.value + '" ' + selected + '>' + month.name + '</option>'
        );
    });
}

// Function to load year options
function loadYears() {
    const yearSelect = $('#filter-year');
    const currentYear = new Date().getFullYear();
    const startYear = 2025;

    // Clear existing options and add default
    yearSelect.html('<option value="">All Years</option>');

    // Add year options from 2025 to current year
    for (let year = startYear; year <= currentYear; year++) {
        const selected = year === currentYear ? 'selected' : '';
        yearSelect.append(
            '<option value="' + year + '" ' + selected + '>' + year + '</option>'
        );
    }
}

// Reset filters function
function resetFilters() {
    // Reset business unit to session department default by reloading business units
    loadBusinessUnits();

    // Reset status to default
    $('#filter-status').val('');

    // Reset priority to default
    $('#filter-priority').val('');

    // Reset month to current month
    const currentMonth = new Date().getMonth() + 1;
    $('#filter-month').val(currentMonth);

    // Reset year to current year
    const currentYear = new Date().getFullYear();
    $('#filter-year').val(currentYear);

    // Clear the report table
    const table = $('#report-table');
    table.find('tr:not(:first)').remove(); // Remove all rows except header
}

// Generate Report function
function generateReport() {
    // Get filter values
    const businessUnit = $('#filter-business-unit').val();
    const businessUnitId = $('#filter-business-unit option:selected').data('id');
    const location = $('#filter-location').val();
    const status = $('#filter-status').val();
    const priority = $('#filter-priority').val();
    const month = $('#filter-month').val();
    const year = $('#filter-year').val();

    // Prepare data for API call
    const reportData = {
        business_unit: businessUnit,
        business_unit_id: businessUnitId,
        location: location,
        status: status,
        priority: priority,
        month: month,
        year: year
    };


    // Make API call to fetch report data
    $.ajax({
        url: 'api.php',
        type: 'POST',
        data: {
            action: 'get-report',
            formData: reportData
        },
        dataType: 'json',
        beforeSend: function () {
            // Show loading state
            $('#viewReportbtn').html('<i class="bi bi-hourglass-split"></i> Generating...');
            $('#viewReportbtn').prop('disabled', true);
        },
        success: function (response) {
            if (response && response.success === true) {
                // Process and display report data
                displayReportData(response.data);

                // If there's a download URL, you can handle it here
                // if (response.data && response.data.download_url) {
                //     // Optionally show download link or auto-download
                //     document.body.removeChild(link);
                // }
            } else {
                // Handle different types of errors
                console.error('Report generation failed:', response.message);

                // Log user-friendly error message
                let errorMessage = response.message || 'Unknown error occurred';

                // Handle validation errors (422)
                if (response.details) {
                    console.error('Validation details:', response.details);
                    errorMessage += '\nValidation errors:';
                    Object.keys(response.details).forEach(function (field) {
                        errorMessage += '\n- ' + field + ': ' + response.details[field].join(', ');
                    });
                }

                // Log error instead of showing alert
                console.error('Report Generation Failed:', errorMessage);
            }
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error generating report:', {
                status: status,
                error: error,
                responseText: xhr.responseText
            });

            // Try to parse error response
            let errorMessage = 'Network error occurred while generating report';
            try {
                const errorResponse = JSON.parse(xhr.responseText);
                if (errorResponse.message) {
                    errorMessage = errorResponse.message;
                }
            } catch (e) {
                // Use default message if parsing fails
            }

            console.error('Error:', errorMessage);
        },
        complete: function () {
            // Reset button state
            $('#viewReportbtn').html('Generate Report');
            $('#viewReportbtn').prop('disabled', false);
        }
    });
}
// Function to display report data
function displayReportData(data) {
    var results = data.results;

    // Get the table element
    const table = $('#report-table');

    // Clear existing rows (except header)
    table.find('tr:not(:first)').remove();

    // Check if we have results
    if (!results || results.length === 0) {
        table.append(`
            <tr>
                <td colspan="5" style="text-align: center; padding: 20px; color: #666;">
                    No data found for the selected filters
                </td>
            </tr>
        `);
        return;
    }

    // Process each result
    $.each(results, function (index, item) {
        console.log(item);
        // Get referral basic info
        const referralId = item.referral_id;
        const status = item.referral.status_name;
        const priority = item.referral.priority;

        // Process referral histories
        const histories = item.referral_histories || [];
        let historiesHtml = '';
        let detailsHtml = '';

        histories.forEach(function (history, historyIndex) {
            if (history.is_filled === 1) {
                // Build history summary
                historiesHtml += `
                    <div class="history-item" style="margin-bottom: 10px; padding: 8px; border-left: 3px solid #007bff;">
                        <strong>Sequence ${history.sequence}:</strong> ${history.business_unit}<br>
                        <small>Reason: ${history.referral_reason || 'N/A'}</small><br>
                        <small>Condition: ${history.referral_condition || 'N/A'}</small>
                    </div>
                `;

                // Build referral details
                if (history.referral_details && history.referral_details.length > 0) {
                    detailsHtml += `<div class="details-section"><strong>Sequence ${history.sequence} Details:</strong><ul>`;
                    history.referral_details.forEach(function (detail) {
                        detailsHtml += `<li><strong>${detail.form_name}:</strong> ${detail.value}</li>`;
                    });
                    detailsHtml += '</ul></div>';
                }
            } else {
                historiesHtml += `
                    <div class="history-item" style="margin-bottom: 10px; padding: 8px; border-left: 3px solid #ccc;">
                        <strong>Sequence ${history.sequence}:</strong> ${history.business_unit || 'Pending'}<br>
                        <small style="color: #666;">Not filled yet</small>
                    </div>
                `;
            }
        });

        // Add row to table
        table.append(`
            <tr>
                <td>
                    <strong>${referralId}</strong><br>
                    <small>Created: ${item.referral.created_at}</small><br>
                    <small>Updated: ${item.referral.updated_at}</small>
                </td>
                <td>
                    ${historiesHtml || 'No histories available'}
                </td>
                <td style="vertical-align: top; max-width: 300px;">
                    ${detailsHtml || 'No details available'}
                </td>
                <td>
                    <span class="status-badge" style="padding: 4px 8px; border-radius: 4px; background-color: ${status === 'Open' ? '#28a745' : status === 'In Progress' ? '#ffc107' : '#6c757d'}; color: white;">
                        ${status}
                    </span>
                </td>
                <td>
                    <span class="priority-badge" style="padding: 4px 8px; border-radius: 4px; background-color: ${priority === 1 ? '#dc3545' : priority === 2 ? '#fd7e14' : '#28a745'}; color: white;">
                        ${priority === 1 ? 'High' : priority === 2 ? 'Medium' : 'Low'}
                    </span>
                </td>
            </tr>
        `);
    });

    // Handle download URL if available
    // if (data.download_url) {
    //     console.log('Download URL available:', data.download_url);
    //     // Auto-download the report file
    //     const link = document.createElement('a');
    //     link.href = data.download_url;
    //     link.download = '';
    //     document.body.appendChild(link);
    //     link.click();
    //     document.body.removeChild(link);
    // }
}