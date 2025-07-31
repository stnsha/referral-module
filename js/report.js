document.addEventListener('DOMContentLoaded', function () {
    //load functions
    loadBusinessUnits();
    loadStatus();
    loadMonths();
    loadYears();

    $.ajax({
        url: 'backend.php?action=getBusinessUnit',
        type: 'GET',
        dataType: 'json',
        data: {
            staffDeptId: department
        },
        success: function (response) {
            const businessUnitId = response;
            loadSummary(businessUnitId);
        },
        error: function () {
            logError(new Error('Error loading business unit ID'), { context: 'loadBusinessUnit' });
        }
    });

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
            logError(new Error('Error loading business units'), { context: 'loadBusinessUnits' });
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
            logError(new Error('Error loading status options'), { context: 'loadStatus', status: status, error: error, responseText: xhr.responseText });
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
}

// Generate Report function
function generateReport() {
    // Get filter values
    // const businessUnit = $('#filter-business-unit').val();
    const businessUnitId = $('#filter-business-unit option:selected').data('id');
    const location = $('#filter-location').val();
    const status = $('#filter-status').val();
    const priority = $('#filter-priority').val();
    const month = $('#filter-month').val();
    const year = $('#filter-year').val();

    // Prepare data for API call
    const reportData = {
        business_unit_id: businessUnitId ? parseInt(businessUnitId) : null,
        location: location ? parseInt(location) : null,
        status: status ? parseInt(status) : null,
        priority: priority ? parseInt(priority) : null,
        month: month ? parseInt(month) : null,
        year: year ? parseInt(year) : null,
        is_external: false,
        is_referred: false
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
                const url = response.data.download_url;
                if (response.data && url) {
                    console.log('Download URL available:', url);
                    // Auto-download the report file
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = '';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
            } else {
                // Handle different types of errors
                logError(new Error('Report generation failed'), { context: 'generateReport', message: response.message, details: response.details });

                // Log user-friendly error message
                let errorMessage = response.message || 'Unknown error occurred';

                // Handle validation errors (422)
                if (response.details) {
                    logError(new Error('Validation details found'), { context: 'generateReport', validationDetails: response.details });
                    errorMessage += '\nValidation errors:';
                    Object.keys(response.details).forEach(function (field) {
                        errorMessage += '\n- ' + field + ': ' + response.details[field].join(', ');
                    });
                }

                // Log error instead of showing alert
                logError(new Error('Report Generation Failed'), { context: 'generateReport', errorMessage: errorMessage });
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('AJAX Error generating report'), {
                context: 'generateReport',
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

            logError(new Error('Report generation error'), { context: 'generateReport', errorMessage: errorMessage });
        },
        complete: function () {
            // Reset button state
            $('#viewReportbtn').html('Generate Report');
            $('#viewReportbtn').prop('disabled', false);
        }
    });
}

// Function to display report data
function loadSummary(businessUnitId) {
    $.ajax({
        url: 'api.php',
        type: 'POST',
        data: {
            action: 'get-summary-report',
            business_unit_id: businessUnitId
        },
        success: function (response) {
            console.log('API Response:', response);

            // Handle different response structures
            let data = null;
            if (response && response.success && response.data) {
                data = response.data;
            } else if (response && !response.success && response.data) {
                // Sometimes data might be present even if success is false
                data = response.data;
            } else if (response && response.statistics) {
                // Data nested under 'statistics' key
                data = response.statistics;
            } else if (response && typeof response === 'object' && response.total_referrals !== undefined) {
                // Direct data structure without wrapper
                data = response;
            }

            if (data) {
                console.log('Creating charts with data:', data);
                createCharts(data);
            } else {
                logError(new Error('No valid data found in response'), { context: 'loadSummary', response: response });
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('AJAX Error generating summary report'), {
                context: 'loadSummary',
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
                logError(new Error('Error parsing response'), { context: 'loadSummary', parseError: e.message });
            }

            logError(new Error('Summary report error'), { context: 'loadSummary', errorMessage: errorMessage });
        }
    });
}

// Function to create charts
function createCharts(data) {
    console.log('createCharts called with data:', data);

    try {
        // Destroy existing charts if they exist
        if (window.statusChart && typeof window.statusChart.destroy === 'function') {
            window.statusChart.destroy();
        }
        if (window.priorityChart && typeof window.priorityChart.destroy === 'function') {
            window.priorityChart.destroy();
        }
        if (window.sentReceivedChart && typeof window.sentReceivedChart.destroy === 'function') {
            window.sentReceivedChart.destroy();
        }
        if (window.locationChart && typeof window.locationChart.destroy === 'function') {
            window.locationChart.destroy();
        }

        // Check if Chart.js is loaded
        if (typeof Chart === 'undefined') {
            logError(new Error('Chart.js is not loaded'), { context: 'createCharts' });
            return;
        }

        // Status Distribution Chart (Doughnut)
        const statusElement = document.getElementById('statusChart');
        if (statusElement && data.status) {
            console.log('Creating status chart with data:', data.status);
            const statusCtx = statusElement.getContext('2d');
            const statusLabels = Object.keys(data.status);
            const statusValues = Object.values(data.status);

            window.statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusValues,
                        backgroundColor: [
                            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
                            '#9966ff', '#ff9f40', '#e83e8c', '#c9cbcf'
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    animation: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('Status chart created successfully');
        } else {
            logError(new Error('Status chart element not found or no status data'), { context: 'createCharts', hasElement: !!statusElement, hasData: !!data.status });
        }

        // Priority Breakdown Chart (Pie)
        const priorityElement = document.getElementById('priorityChart');
        if (priorityElement && data.priority) {
            console.log('Creating priority chart with data:', data.priority);
            const priorityCtx = priorityElement.getContext('2d');
            const priorityLabels = Object.keys(data.priority);
            const priorityValues = Object.values(data.priority);

            window.priorityChart = new Chart(priorityCtx, {
                type: 'pie',
                data: {
                    labels: priorityLabels,
                    datasets: [{
                        data: priorityValues,
                        backgroundColor: ['#ff6384', '#36a2eb'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1,
                    animation: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
            console.log('Priority chart created successfully');
        } else {
            logError(new Error('Priority chart element not found or no priority data'), { context: 'createCharts', hasElement: !!priorityElement, hasData: !!data.priority });
        }

        // Sent vs Received Chart (Bar)
        const sentReceivedElement = document.getElementById('sentReceivedChart');
        if (sentReceivedElement && data.sent_received) {
            console.log('Creating sent/received chart with data:', data.sent_received);
            const sentReceivedCtx = sentReceivedElement.getContext('2d');

            window.sentReceivedChart = new Chart(sentReceivedCtx, {
                type: 'bar',
                data: {
                    labels: ['Sent', 'Received'],
                    datasets: [{
                        label: 'Referrals',
                        data: [data.sent_received.sent, data.sent_received.received],
                        backgroundColor: ['#36a2eb', '#ff6384'],
                        borderColor: ['#36a2eb', '#ff6384'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    animation: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            console.log('Sent/Received chart created successfully');
        } else {
            logError(new Error('Sent/Received chart element not found or no sent_received data'), { context: 'createCharts', hasElement: !!sentReceivedElement, hasData: !!data.sent_received });
        }

        // Location Summary Chart (Bar)
        const locationElement = document.getElementById('locationChart');
        if (locationElement && data.location_summary) {
            console.log('Creating location chart with data:', data.location_summary);
            const locationCtx = locationElement.getContext('2d');
            const locationLabels = Object.keys(data.location_summary);
            const locationValues = Object.values(data.location_summary);

            window.locationChart = new Chart(locationCtx, {
                type: 'bar',
                data: {
                    labels: locationLabels,
                    datasets: [{
                        label: 'Referrals',
                        data: locationValues,
                        backgroundColor: '#4bc0c0',
                        borderColor: '#4bc0c0',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    animation: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
            console.log('Location chart created successfully');
        } else {
            logError(new Error('Location chart element not found or no location_summary data'), { context: 'createCharts', hasElement: !!locationElement, hasData: !!data.location_summary });
        }

    } catch (error) {
        logError(new Error('Error creating charts'), { context: 'createCharts', originalError: error.message, stack: error.stack });
    }
}

