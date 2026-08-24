document.addEventListener('DOMContentLoaded', function () {
    //load functions
    loadBusinessUnits();
    loadStatus();
    loadReferralPriorities();
    loadMonths();
    loadYears();

    // Business unit change handler
    $('#filter-business-unit').on('change', function () {
        const selectedOption = $(this).find('option:selected');
        const businessUnitId = selectedOption.data('id');

        if (businessUnitId && selectedOption.val() !== 'all') {
            loadLocations(businessUnitId);
        } else {
            $('#filter-location').html('<option value="">All Locations</option>');
        }

        loadSummary();
    });

    // Filter change handlers - reload charts on any filter change
    $('#filter-location, #filter-status, #filter-priority, #filter-month').on('change', function () {
        loadSummary();
    });

    $('#filter-year').on('change', function () {
        loadSummary();
        loadYearlySummary();
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
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'business-units' },
        success: function (response) {
            var busUnitFrom = $('#filter-business-unit');
            busUnitFrom.empty();

            if (referralPermission === 1 || referralPermission === 2) {
                // Superadmin: enable dropdown, allow selecting any BU or all
                busUnitFrom.prop('disabled', false);
                busUnitFrom.append('<option value="all" data-id="">All Business Units</option>');
            } else {
                // Non-superadmin: disable dropdown, auto-select their BU
                busUnitFrom.prop('disabled', true);
            }

            let businessUnitId = '';

            $.each(response.data, function (index, businessUnit) {
                let selected = '';

                if (referralPermission !== 1 && referralPermission !== 2) {
                    if (staffBusinessUnitId && businessUnit.id === staffBusinessUnitId) {
                        selected = 'selected';
                        businessUnitId = businessUnit.id;
                    }
                }

                busUnitFrom.append(
                    '<option value="' + businessUnit.name + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            // Load locations for the initially selected business unit
            if (businessUnitId) {
                loadLocations(businessUnitId);
            } else {
                $('#filter-location').html('<option value="">All Locations</option>');
            }

            // Load summary charts with initial filter state
            loadSummary();
            loadYearlySummary();
        },
        error: function () {
            logError(new Error('Error loading business units'), { context: 'loadBusinessUnits' });
        }
    });
}

// Function to load locations based on business unit ID
function loadLocations(businessUnitId) {
    $.ajax({
        url: 'referral/backend.php?action=getLocations',
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
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
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
            logError(new Error('Error loading status options'), { context: 'loadStatusOptions', status: status, error: error, responseText: xhr.responseText });
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
            const priorityContainer = $('#filter-priority');

            if (priorityContainer.length && response && response.data) {
                // Clear existing options
                priorityContainer.html('<option value="">All Priority</option>');

                // Add status options from object format {"1": "Open", "2": "In Progress", etc.}
                Object.keys(response.data).forEach(function (key) {
                    priorityContainer.append(
                        '<option value="' + key + '">' + response.data[key] + '</option>'
                    );
                });
            }
        },
        error: function () {
            console.log('Failed to load referral priorities');
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

    // Function to download base64 file (client-side approach - recommended)
    function downloadBase64File(base64Data, filename, mimeType) {
        try {
            // Remove data URL prefix if present (data:application/...;base64,)
            const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;

            // Decode base64 to binary
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);

            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }

            // Create blob with proper MIME type
            const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;

            // Trigger download
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            console.log('File download initiated:', filename);
        } catch (error) {
            logError(new Error('Client-side download failed'), {
                context: 'downloadBase64File',
                filename: filename,
                error: error.message
            });

            // Fallback to server-side download
            console.log('Falling back to server-side download...');
            downloadBase64FileServerSide(base64Data, filename, mimeType);
        }
    }

    // Alternative server-side download function
    function downloadBase64FileServerSide(base64Data, filename, mimeType) {
        $.ajax({
            url: 'referral/download-file.php',
            type: 'POST',
            data: JSON.stringify({
                base64: base64Data,
                filename: filename,
                type: mimeType
            }),
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                if (response.success && response.download_url) {
                    // Create download link and trigger download
                    const link = document.createElement('a');
                    link.href = response.download_url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('Server-side download initiated:', filename);
                } else {
                    throw new Error(response.error || 'Server-side download failed');
                }
            },
            error: function (xhr, status, error) {
                logError(new Error('Server-side download failed'), {
                    context: 'downloadBase64FileServerSide',
                    filename: filename,
                    status: status,
                    error: error
                });
                alert('Download failed: ' + error);
            }
        });
    }

    // Make API call to fetch report data
    $.ajax({
        url: 'referral/api-jwt.php',
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
            console.log(response.data);

            if (response && response.success === true && response.data) {
                // Handle base64 file response
                if (response.data.base64 && response.data.filename) {
                    console.log('Base64 file data received:', response.data.filename);
                    downloadBase64File(response.data.base64, response.data.filename, response.data.type);
                } else {
                    logError(new Error('Invalid file data received'), { context: 'generateReport', data: response.data });
                    alert('Invalid file data received from server');
                }
            } else {
                // Handle different types of errors
                logError(new Error('Report generation failed'), { context: 'generateReport', message: response.message, details: response.details });

                // Log user-friendly error message
                let errorMessage = response.message || 'Unknown error occurred';

                if (response.details && response.details.http_code === 404) {
                    alert('No referral report found based on the filter');
                    return;
                }

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
                alert('Report generation failed: ' + errorMessage);
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
function loadSummary() {
    var selectedBuOption = $('#filter-business-unit option:selected');
    var businessUnitId = selectedBuOption.data('id') || '';
    var location = $('#filter-location').val() || '';
    var status = $('#filter-status').val() || '';
    var priority = $('#filter-priority').val() || '';
    var month = $('#filter-month').val() || '';
    var year = $('#filter-year').val() || '';

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: {
            action: 'get-summary-report',
            business_unit_id: businessUnitId,
            location: location,
            status: status,
            priority: priority,
            month: month,
            year: year
        },
        success: function (response) {
            // console.log('API Response:', response);

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
                console.log('No valid data found in response', { context: 'loadSummary', response: response });
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
            console.error('Chart.js is not loaded. Please check if the Chart.js script is properly included.');
            return;
        }
        
        console.log('Chart.js version:', Chart.version);
        console.log('Available Chart types:', Chart.registry.plugins._items);

        // Status Distribution Chart (Doughnut)
        const statusElement = document.getElementById('statusChart');
        if (statusElement) {
            console.log('Creating status chart with data:', data.status);
            // Ensure canvas is visible
            statusElement.style.display = 'block';
            statusElement.style.maxWidth = '100%';
            statusElement.style.height = 'auto';
            const statusCtx = statusElement.getContext('2d');
            
            // Check if we have valid status data
            const hasStatusData = data.status && Object.keys(data.status).length > 0;
            const statusLabels = hasStatusData ? Object.keys(data.status) : ['No Data'];
            const statusValues = hasStatusData ? Object.values(data.status) : [1];

            window.statusChart = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: statusLabels,
                    datasets: [{
                        data: statusValues,
                        backgroundColor: hasStatusData ? [
                            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
                            '#9966ff', '#ff9f40', '#e83e8c', '#c9cbcf'
                        ] : ['#e0e0e0'],
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
                        },
                        tooltip: {
                            enabled: hasStatusData
                        }
                    }
                }
            });
            console.log('Status chart created successfully');
        } else {
            logError(new Error('Status chart element not found'), { context: 'createCharts', hasElement: !!statusElement });
        }

        // Priority Breakdown Chart (Pie)
        const priorityElement = document.getElementById('priorityChart');
        if (priorityElement) {
            console.log('Creating priority chart with data:', data.priority);
            // Ensure canvas is visible
            priorityElement.style.display = 'block';
            priorityElement.style.maxWidth = '100%';
            priorityElement.style.height = 'auto';
            const priorityCtx = priorityElement.getContext('2d');
            
            // Check if we have valid priority data
            const hasPriorityData = data.priority && Object.keys(data.priority).length > 0;
            const priorityLabels = hasPriorityData ? Object.keys(data.priority) : ['No Data'];
            const priorityValues = hasPriorityData ? Object.values(data.priority) : [1];

            window.priorityChart = new Chart(priorityCtx, {
                type: 'pie',
                data: {
                    labels: priorityLabels,
                    datasets: [{
                        data: priorityValues,
                        backgroundColor: hasPriorityData ? [
                            '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'
                        ] : ['#e0e0e0'],
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
                        },
                        tooltip: {
                            enabled: hasPriorityData
                        }
                    }
                }
            });
            console.log('Priority chart created successfully');
        } else {
            logError(new Error('Priority chart element not found'), { context: 'createCharts', hasElement: !!priorityElement });
        }

        // Sent vs Received Chart (Bar)
        const sentReceivedElement = document.getElementById('sentReceivedChart');
        if (sentReceivedElement) {
            console.log('Creating sent/received chart with data:', data.sent_received);
            const sentReceivedCtx = sentReceivedElement.getContext('2d');
            
            // Check if we have valid sent/received data
            const hasSentReceivedData = data.sent_received && (data.sent_received.sent > 0 || data.sent_received.received > 0);
            const sentValue = data.sent_received ? data.sent_received.sent : 0;
            const receivedValue = data.sent_received ? data.sent_received.received : 0;

            window.sentReceivedChart = new Chart(sentReceivedCtx, {
                type: 'bar',
                data: {
                    labels: ['Sent', 'Received'],
                    datasets: [{
                        label: 'Referrals',
                        data: hasSentReceivedData ? [sentValue, receivedValue] : [0, 0],
                        backgroundColor: hasSentReceivedData ? ['#36a2eb', '#ff6384'] : ['#e0e0e0', '#e0e0e0'],
                        borderColor: hasSentReceivedData ? ['#36a2eb', '#ff6384'] : ['#e0e0e0', '#e0e0e0'],
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
                        },
                        tooltip: {
                            enabled: hasSentReceivedData
                        }
                    }
                }
            });
            console.log('Sent/Received chart created successfully');
        } else {
            logError(new Error('Sent/Received chart element not found'), { context: 'createCharts', hasElement: !!sentReceivedElement });
        }

        // Location Summary Chart (Bar)
        const locationElement = document.getElementById('locationChart');
        if (locationElement) {
            console.log('Creating location chart with data:', data.location_summary);
            const locationCtx = locationElement.getContext('2d');
            
            // Check if we have valid location data
            const hasLocationData = data.location_summary && Object.keys(data.location_summary).length > 0;
            const locationLabels = hasLocationData ? Object.keys(data.location_summary) : ['No Data'];
            const locationValues = hasLocationData ? Object.values(data.location_summary) : [0];

            window.locationChart = new Chart(locationCtx, {
                type: 'bar',
                data: {
                    labels: locationLabels,
                    datasets: [{
                        label: 'Referrals',
                        data: locationValues,
                        backgroundColor: hasLocationData ? '#4bc0c0' : '#e0e0e0',
                        borderColor: hasLocationData ? '#4bc0c0' : '#e0e0e0',
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
                        },
                        tooltip: {
                            enabled: hasLocationData
                        }
                    }
                }
            });
            console.log('Location chart created successfully');
        } else {
            logError(new Error('Location chart element not found'), { context: 'createCharts', hasElement: !!locationElement });
        }

    } catch (error) {
        logError(new Error('Error creating charts'), { context: 'createCharts', originalError: error.message, stack: error.stack });
    }
}

// Palette for business units (up to 10 BUs)
var BU_COLORS = [
    '#36a2eb', '#ff6384', '#4bc0c0', '#ffce56',
    '#9966ff', '#ff9f40', '#e83e8c', '#20c997',
    '#fd7e14', '#6610f2'
];

function loadYearlySummary() {
    var year = $('#filter-year').val() || new Date().getFullYear();

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: {
            action: 'get-yearly-report',
            year: year
        },
        success: function (response) {
            if (response && response.success && response.data) {
                createYearlyCharts(response.data);
            } else {
                logError(new Error('Failed to load yearly report'), { context: 'loadYearlySummary', response: response });
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('AJAX error loading yearly report'), {
                context: 'loadYearlySummary',
                status: status,
                error: error,
                responseText: xhr.responseText
            });
        }
    });
}

function createYearlyCharts(data) {
    var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    var buList = data.business_units || [];
    var topLocations = data.top_locations || {};
    var year = data.year || new Date().getFullYear();

    $('#yearly-title-year').text(year);

    // Destroy any existing yearly charts
    ['yearlyBuTotalChart', 'yearlyBuSentReceivedChart',
     'yearlyMonthlyTrendChart', 'yearlyTopLocationsChart', 'yearlyStatusChart'
    ].forEach(function (id) {
        if (window[id] && typeof window[id].destroy === 'function') {
            window[id].destroy();
            window[id] = null;
        }
    });

    var buNames = buList.map(function (bu) { return bu.name; });

    // 1. Total Referrals by BU (horizontal bar)
    var totalEl = document.getElementById('yearlyBuTotalChart');
    if (totalEl) {
        window.yearlyBuTotalChart = new Chart(totalEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: buNames,
                datasets: [{
                    label: 'Total Referrals',
                    data: buList.map(function (bu) { return bu.total; }),
                    backgroundColor: buList.map(function (bu, i) { return BU_COLORS[i % BU_COLORS.length]; }),
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                animation: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 2. Sent vs Received per BU (grouped bar)
    var srEl = document.getElementById('yearlyBuSentReceivedChart');
    if (srEl) {
        window.yearlyBuSentReceivedChart = new Chart(srEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: buNames,
                datasets: [
                    {
                        label: 'Sent',
                        data: buList.map(function (bu) { return bu.sent; }),
                        backgroundColor: '#36a2eb',
                        borderWidth: 1
                    },
                    {
                        label: 'Received',
                        data: buList.map(function (bu) { return bu.received; }),
                        backgroundColor: '#ff6384',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                animation: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 3. Monthly Trend by BU (line chart)
    var trendEl = document.getElementById('yearlyMonthlyTrendChart');
    if (trendEl) {
        var trendDatasets = buList.map(function (bu, i) {
            return {
                label: bu.name,
                data: bu.monthly_trend,
                borderColor: BU_COLORS[i % BU_COLORS.length],
                backgroundColor: 'transparent',
                tension: 0.3,
                pointRadius: 3,
                borderWidth: 2
            };
        });

        window.yearlyMonthlyTrendChart = new Chart(trendEl.getContext('2d'), {
            type: 'line',
            data: {
                labels: MONTHS,
                datasets: trendDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 4. Top Locations Overall (horizontal bar)
    var locEl = document.getElementById('yearlyTopLocationsChart');
    if (locEl) {
        var locLabels = Object.keys(topLocations);
        var locValues = Object.values(topLocations);

        window.yearlyTopLocationsChart = new Chart(locEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: locLabels,
                datasets: [{
                    label: 'Referrals',
                    data: locValues,
                    backgroundColor: '#4bc0c0',
                    borderWidth: 1
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                animation: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 5. Status Distribution by BU (stacked bar)
    var statusEl = document.getElementById('yearlyStatusChart');
    if (statusEl) {
        var statusKeys = ['Open', 'In Progress', 'Referred', 'Closed', 'Not Present'];
        var statusColors = ['#36a2eb', '#ffce56', '#4bc0c0', '#ff6384', '#c9cbcf'];

        var statusDatasets = statusKeys.map(function (statusName, i) {
            return {
                label: statusName,
                data: buList.map(function (bu) { return bu.status[statusName] || 0; }),
                backgroundColor: statusColors[i],
                borderWidth: 1
            };
        });

        window.yearlyStatusChart = new Chart(statusEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: buNames,
                datasets: statusDatasets
            },
            options: {
                responsive: true,
                animation: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }
}
