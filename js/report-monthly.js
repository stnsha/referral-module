document.addEventListener('DOMContentLoaded', function () {
    loadBusinessUnits();
    loadStatus();
    loadReferralPriorities();
    loadMonths();
    loadYears();

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

    $('#filter-location, #filter-status, #filter-priority, #filter-month, #filter-year').on('change', function () {
        loadSummary();
    });

    $('#resetFiltersBtn').on('click', function () {
        resetFilters();
    });

    $('#viewReportbtn').on('click', function (e) {
        e.preventDefault();
        generateReport();
    });
});

function loadBusinessUnits() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'business-units' },
        success: function (response) {
            var busUnitFrom = $('#filter-business-unit');
            busUnitFrom.empty();

            if (referralPermission === 1) {
                busUnitFrom.prop('disabled', false);
                busUnitFrom.append('<option value="all" data-id="">All Business Units</option>');
            } else {
                busUnitFrom.prop('disabled', true);
            }

            let businessUnitId = '';

            $.each(response.data, function (index, businessUnit) {
                let selected = '';

                if (referralPermission !== 1) {
                    if (department == 1) {
                        if (staffPosition.toLowerCase().includes('audiologist')) {
                            if (businessUnit.id === 1) {
                                selected = 'selected';
                                businessUnitId = businessUnit.id;
                            }
                        } else {
                            if (businessUnit.id === 5 && businessUnit.name.toLowerCase().includes('pharmacy')) {
                                selected = 'selected';
                                businessUnitId = businessUnit.id;
                            }
                        }
                    } else {
                        if (businessUnit.staff_department_id == department) {
                            selected = 'selected';
                            businessUnitId = businessUnit.id;
                        }
                    }
                }

                busUnitFrom.append(
                    '<option value="' + businessUnit.name + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            if (businessUnitId) {
                loadLocations(businessUnitId);
            } else {
                $('#filter-location').html('<option value="">All Locations</option>');
            }

            loadSummary();
        },
        error: function () {
            logError(new Error('Error loading business units'), { context: 'loadBusinessUnits' });
        }
    });
}

function loadLocations(businessUnitId) {
    $.ajax({
        url: 'referral/backend.php?action=getLocations',
        type: 'POST',
        data: { ref_bus_id: businessUnitId },
        dataType: 'json',
        success: function (response) {
            var locationSelect = $('#filter-location');
            locationSelect.html('<option value="">Select Location</option>');

            $.each(response, function (index, location) {
                locationSelect.append(
                    '<option value="' + location.id + '">' + location.code + '</option>'
                );
            });
        },
        error: function () {
            $('#filter-location').html('<option value="">Select Location</option>');
        }
    });
}

function loadStatus() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            const statusSelect = $('#filter-status');
            if (statusSelect.length && response && response.data) {
                statusSelect.html('<option value="">All Status</option>');
                Object.keys(response.data).forEach(function (key) {
                    statusSelect.append('<option value="' + key + '">' + response.data[key] + '</option>');
                });
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('Error loading status options'), { context: 'loadStatus', status: status, error: error });
        }
    });
}

function loadReferralPriorities() {
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'referral-priority' },
        success: function (response) {
            const priorityContainer = $('#filter-priority');
            if (priorityContainer.length && response && response.data) {
                priorityContainer.html('<option value="">All Priority</option>');
                Object.keys(response.data).forEach(function (key) {
                    priorityContainer.append('<option value="' + key + '">' + response.data[key] + '</option>');
                });
            }
        },
        error: function () {
            logError(new Error('Failed to load referral priorities'), { context: 'loadReferralPriorities' });
        }
    });
}

function loadMonths() {
    const months = [
        { value: 1, name: 'January' }, { value: 2, name: 'February' },
        { value: 3, name: 'March' },   { value: 4, name: 'April' },
        { value: 5, name: 'May' },     { value: 6, name: 'June' },
        { value: 7, name: 'July' },    { value: 8, name: 'August' },
        { value: 9, name: 'September' },{ value: 10, name: 'October' },
        { value: 11, name: 'November' },{ value: 12, name: 'December' }
    ];

    const monthSelect = $('#filter-month');
    const currentMonth = new Date().getMonth() + 1;

    monthSelect.html('<option value="">All Months</option>');
    months.forEach(function (month) {
        const selected = month.value === currentMonth ? 'selected' : '';
        monthSelect.append('<option value="' + month.value + '" ' + selected + '>' + month.name + '</option>');
    });
}

function loadYears() {
    const yearSelect = $('#filter-year');
    const currentYear = new Date().getFullYear();
    const startYear = 2025;

    yearSelect.html('<option value="">All Years</option>');
    for (let year = startYear; year <= currentYear; year++) {
        const selected = year === currentYear ? 'selected' : '';
        yearSelect.append('<option value="' + year + '" ' + selected + '>' + year + '</option>');
    }
}

function resetFilters() {
    loadBusinessUnits();
    $('#filter-status').val('');
    $('#filter-priority').val('');
    $('#filter-month').val(new Date().getMonth() + 1);
    $('#filter-year').val(new Date().getFullYear());
}

function generateReport() {
    const businessUnitId = $('#filter-business-unit option:selected').data('id');
    const location = $('#filter-location').val();
    const status = $('#filter-status').val();
    const priority = $('#filter-priority').val();
    const month = $('#filter-month').val();
    const year = $('#filter-year').val();

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

    function downloadBase64File(base64Data, filename, mimeType) {
        try {
            const base64String = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
            const binaryString = atob(base64String);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            logError(new Error('Client-side download failed'), { context: 'downloadBase64File', error: error.message });
            downloadBase64FileServerSide(base64Data, filename, mimeType);
        }
    }

    function downloadBase64FileServerSide(base64Data, filename, mimeType) {
        $.ajax({
            url: 'referral/download-file.php',
            type: 'POST',
            data: JSON.stringify({ base64: base64Data, filename: filename, type: mimeType }),
            contentType: 'application/json',
            dataType: 'json',
            success: function (response) {
                if (response.success && response.download_url) {
                    const link = document.createElement('a');
                    link.href = response.download_url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                } else {
                    throw new Error(response.error || 'Server-side download failed');
                }
            },
            error: function (xhr, status, error) {
                logError(new Error('Server-side download failed'), { context: 'downloadBase64FileServerSide', error: error });
                alert('Download failed: ' + error);
            }
        });
    }

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'get-report', formData: reportData },
        dataType: 'json',
        beforeSend: function () {
            $('#viewReportbtn').html('<i class="bi bi-hourglass-split"></i> Generating...');
            $('#viewReportbtn').prop('disabled', true);
        },
        success: function (response) {
            if (response && response.success === true && response.data) {
                if (response.data.base64 && response.data.filename) {
                    downloadBase64File(response.data.base64, response.data.filename, response.data.type);
                } else {
                    logError(new Error('Invalid file data received'), { context: 'generateReport', data: response.data });
                    alert('Invalid file data received from server');
                }
            } else {
                let errorMessage = response.message || 'Unknown error occurred';
                if (response.details && response.details.http_code === 404) {
                    alert('No referral report found based on the filter');
                    return;
                }
                if (response.details) {
                    errorMessage += '\nValidation errors:';
                    Object.keys(response.details).forEach(function (field) {
                        errorMessage += '\n- ' + field + ': ' + response.details[field].join(', ');
                    });
                }
                logError(new Error('Report generation failed'), { context: 'generateReport', errorMessage: errorMessage });
                alert('Report generation failed: ' + errorMessage);
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('AJAX error generating report'), { context: 'generateReport', status: status, error: error });
        },
        complete: function () {
            $('#viewReportbtn').html('Download Report');
            $('#viewReportbtn').prop('disabled', false);
        }
    });
}

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
            let data = null;
            if (response && response.success && response.data) {
                data = response.data;
            } else if (response && response.statistics) {
                data = response.statistics;
            } else if (response && typeof response === 'object' && response.total_referrals !== undefined) {
                data = response;
            }

            if (data) {
                createCharts(data);
            }
        },
        error: function (xhr, status, error) {
            logError(new Error('AJAX error loading summary report'), { context: 'loadSummary', status: status, error: error });
        }
    });
}

function createCharts(data) {
    try {
        ['statusChart', 'priorityChart', 'sentReceivedChart', 'locationChart'].forEach(function (id) {
            if (window[id] && typeof window[id].destroy === 'function') {
                window[id].destroy();
            }
        });

        if (typeof Chart === 'undefined') {
            logError(new Error('Chart.js is not loaded'), { context: 'createCharts' });
            return;
        }

        // Status Distribution (Doughnut)
        const statusElement = document.getElementById('statusChart');
        if (statusElement) {
            statusElement.style.display = 'block';
            statusElement.style.maxWidth = '100%';
            statusElement.style.height = 'auto';
            const hasStatusData = data.status && Object.keys(data.status).length > 0;
            window.statusChart = new Chart(statusElement.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: hasStatusData ? Object.keys(data.status) : ['No Data'],
                    datasets: [{
                        data: hasStatusData ? Object.values(data.status) : [1],
                        backgroundColor: hasStatusData
                            ? ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#e83e8c', '#c9cbcf']
                            : ['#e0e0e0'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, aspectRatio: 1, animation: false,
                    plugins: { legend: { position: 'bottom' }, tooltip: { enabled: hasStatusData } }
                }
            });
        }

        // Priority Breakdown (Pie)
        const priorityElement = document.getElementById('priorityChart');
        if (priorityElement) {
            priorityElement.style.display = 'block';
            priorityElement.style.maxWidth = '100%';
            priorityElement.style.height = 'auto';
            const hasPriorityData = data.priority && Object.keys(data.priority).length > 0;
            window.priorityChart = new Chart(priorityElement.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: hasPriorityData ? Object.keys(data.priority) : ['No Data'],
                    datasets: [{
                        data: hasPriorityData ? Object.values(data.priority) : [1],
                        backgroundColor: hasPriorityData ? ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'] : ['#e0e0e0'],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, aspectRatio: 1, animation: false,
                    plugins: { legend: { position: 'bottom' }, tooltip: { enabled: hasPriorityData } }
                }
            });
        }

        // Sent vs Received (Bar)
        const srElement = document.getElementById('sentReceivedChart');
        if (srElement) {
            const hasSrData = data.sent_received && (data.sent_received.sent > 0 || data.sent_received.received > 0);
            const sentVal = data.sent_received ? data.sent_received.sent : 0;
            const recVal = data.sent_received ? data.sent_received.received : 0;
            window.sentReceivedChart = new Chart(srElement.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: ['Sent', 'Received'],
                    datasets: [{
                        label: 'Referrals',
                        data: [sentVal, recVal],
                        backgroundColor: hasSrData ? ['#36a2eb', '#ff6384'] : ['#e0e0e0', '#e0e0e0'],
                        borderColor: hasSrData ? ['#36a2eb', '#ff6384'] : ['#e0e0e0', '#e0e0e0'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, animation: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: false }, tooltip: { enabled: hasSrData } }
                }
            });
        }

        // Location Summary (Bar)
        const locationElement = document.getElementById('locationChart');
        if (locationElement) {
            const hasLocData = data.location_summary && Object.keys(data.location_summary).length > 0;
            window.locationChart = new Chart(locationElement.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: hasLocData ? Object.keys(data.location_summary) : ['No Data'],
                    datasets: [{
                        label: 'Referrals',
                        data: hasLocData ? Object.values(data.location_summary) : [0],
                        backgroundColor: hasLocData ? '#4bc0c0' : '#e0e0e0',
                        borderColor: hasLocData ? '#4bc0c0' : '#e0e0e0',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: true, aspectRatio: 1.5, animation: false,
                    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
                    plugins: { legend: { display: false }, tooltip: { enabled: hasLocData } }
                }
            });
        }

    } catch (error) {
        logError(new Error('Error creating charts'), { context: 'createCharts', originalError: error.message, stack: error.stack });
    }
}
