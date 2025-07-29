
document.addEventListener('DOMContentLoaded', function () {
    console.log(department);

    //dashboard summary
    $.ajax({
        url: 'api.php',
        type: 'POST',
        data: { action: 'report-dashboard' },
        success: function (response) {
            // console.log('Dashboard report success:', response);

            // Update referral dashboard
            if (response.data.total_referral !== undefined) {
                $('#total-referral-count').text(response.data.total_referral);
            }

            if (response.data.referrals) {
                $('#referral-open-count').text(response.data.referrals.open || 0);
                $('#referral-progress-count').text(response.data.referrals.in_progress || 0);
                $('#referral-referred-count').text(response.data.referrals.referred || 0);
                $('#referral-closed-count').text(response.data.referrals.closed || 0);
            }

            // Update business units dashboard
            if (response.data.total_business_unit !== undefined) {
                $('#total-business-unit-count').text(response.data.total_business_unit);
            }

            if (response.data.business_units && Array.isArray(response.data.business_units)) {
                // Clear existing business units
                $('#business-units-list').empty();

                // Display all business units
                response.data.business_units.forEach(function (unit) {
                    $('#business-units-list').append(
                        '<div class="d-flex justify-content-between w-100 mb-1">' +
                        '<span>' + unit.name + '</span>' +
                        '<span>' + unit.count + '</span>' +
                        '</div>'
                    );
                });
            }
        },
        error: function (xhr, status, error) {
            console.log('Dashboard report error:', error);
        }
    });

    //business unit collapse view
    const collapseElement = document.getElementById('businessUnitsCollapse');
    const toggleIcon = document.getElementById('toggleIcon');
    const toggleText = document.getElementById('toggleText');

    collapseElement.addEventListener('show.bs.collapse', function () {
        toggleIcon.className = 'bi bi-chevron-up';
        toggleText.textContent = 'Show Less';
    });

    collapseElement.addEventListener('hide.bs.collapse', function () {
        toggleIcon.className = 'bi bi-chevron-down';
        toggleText.textContent = 'Show More';
    });

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
            busUnitFrom.append('<option value="all">All Business Units</option>');

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

        },
        error: function () {
            alert('Error loading business units');
        }
    });

    // Global variables for filtering
    let allData = [];
    let originalData = []; // Store original unfiltered data
    let currentPage = 1;
    const itemsPerPage = 15;
    let globalApplyFilters = null;

    // Date range picker functionality using daterangepicker.com library
    $(document).ready(function () {
        // console.log('Date range picker initializing...');

        // Initialize the date range picker
        $('#filter-date-range').daterangepicker({
            autoUpdateInput: false,
            locale: {
                cancelLabel: 'Clear',
                format: 'YYYY-MM-DD'
            },
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        });

        // Handle date range selection
        $('#filter-date-range').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('YYYY-MM-DD') + ' - ' + picker.endDate.format('YYYY-MM-DD'));
            // console.log('Date range selected:', $(this).val());

            // Apply filters automatically
            if (typeof globalApplyFilters === 'function') {
                globalApplyFilters();
            }
        });

        // Handle date range clear
        $('#filter-date-range').on('cancel.daterangepicker', function (ev, picker) {
            $(this).val('');
            // console.log('Date range cleared');

            // Apply filters to show all data
            if (typeof globalApplyFilters === 'function') {
                globalApplyFilters();
            }
        });
    });

    // Load referral data into  table
    if (document.getElementById('referral-tbl')) {

        function displayPage(page) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = allData.slice(startIndex, endIndex);

            // Clear existing rows
            document.querySelector('#referral-tbl tbody').innerHTML = '';

            // Check if there's no data to display
            if (allData.length === 0) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td colspan="5" style="text-align: center; padding: 20px; color: #666; font-style: italic;">No data available</td>
                `;
                document.querySelector('#referral-tbl tbody').appendChild(tr);
                updatePagination();
                return;
            }

            // Populate table with page data
            pageData.forEach(function (row) {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="font-size:14px;width: 10%;text-align:start;">${row.ref_id}</td>
                    <td style="font-size:14px;width: 40%;text-align:start;">
                    ${row.reason}<br>
                    <span class="text-muted fst-italic r-text">From: ${row.from_business_unit}</span> 
                    </td>
                    <td style="font-size:14px;width: 15%;text-align:start;">
                        <span>${row.to_business_unit} </span>
                        <span ${row.is_external ? 'class="ref-external"' : ''}>${row.is_external ? '(External)' : ''}</span>
                    </td>
                    <td style="font-size:14px;width: 10%;text-align:center;">
                        <span class="bdg-${row.status.toLowerCase().replace(/\s+/g, '-')}">${row.status}</span>
                    </td>
                    <td style="font-size:14px;width: 15%;text-align:start;">
                        <a href="view.php?id=${row.id}" target="_blank" class="btn-referral">View</a>
                        <a href="qr.php?id=${row.id}" target="_blank" class="btn-referral">Generate QR</a>
                    </td>
                `;
                document.querySelector('#referral-tbl tbody').appendChild(tr);
            });

            updatePagination();
        }

        function updatePagination() {
            const totalPages = Math.ceil(allData.length / itemsPerPage);
            let paginationContainer = document.getElementById('pagination-container');

            if (!paginationContainer) {
                paginationContainer = document.createElement('div');
                paginationContainer.id = 'pagination-container';
                paginationContainer.style.cssText = 'display: flex; justify-content: flex-end; align-items: center; margin-top: 15px; gap: 10px;';
                document.querySelector('#referral-tbl').parentNode.appendChild(paginationContainer);
            }

            // Hide pagination if no data
            if (allData.length === 0) {
                paginationContainer.innerHTML = '';
                return;
            }

            paginationContainer.innerHTML = `
                <span style="font-size: 14px; color: #135caa; font-weight: 500;">Page ${currentPage} of ${totalPages}</span>
                <button id="prev-btn" style="padding: 8px 15px; border: 1px solid #135caa; background: ${currentPage === 1 ? '#f8fafc' : '#135caa'}; color: ${currentPage === 1 ? '#999' : 'white'}; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'}; border-radius: 4px; font-weight: 500; transition: all 0.3s ease;" ${currentPage === 1 ? 'disabled' : ''}>Previous</button>
                <button id="next-btn" style="padding: 8px 15px; border: 1px solid #135caa; background: ${currentPage === totalPages ? '#f8fafc' : '#135caa'}; color: ${currentPage === totalPages ? '#999' : 'white'}; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'}; border-radius: 4px; font-weight: 500; transition: all 0.3s ease;" ${currentPage === totalPages ? 'disabled' : ''}>Next</button>
            `;

            document.getElementById('prev-btn').addEventListener('click', function () {
                if (currentPage > 1) {
                    currentPage--;
                    displayPage(currentPage);
                }
            });

            document.getElementById('next-btn').addEventListener('click', function () {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayPage(currentPage);
                }
            });
        }

        // Load status options from API
        $.ajax({
            url: 'api.php',
            type: 'POST',
            data: { action: 'referral-status' },
            success: function (response) {
                // console.log(response);
                const statusSelect = document.getElementById('filter-status');
                if (statusSelect && response && response.data) {
                    // Clear existing options
                    statusSelect.innerHTML = '<option value="">All Status</option>';

                    // Add status options from object format {"1": "Open", "2": "In Progress", etc.}
                    Object.keys(response.data).forEach(function (key) {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = response.data[key];
                        statusSelect.appendChild(option);
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading status options:', error);
            }
        });

        $.ajax({
            url: 'api.php',
            type: 'POST',
            data: { action: 'all-referral' },
            success: function (response) {
                // console.log(response);
                if (!response || typeof response !== 'object' || !response.data) {
                    console.error('Invalid response format');
                    return;
                }

                const tableBody = document.querySelector('#referral-tbl tbody');
                if (!tableBody) {
                    // Create tbody if it doesn't exist
                    const tbody = document.createElement('tbody');
                    document.getElementById('referral-tbl').appendChild(tbody);
                }

                allData = response.data;
                originalData = [...response.data]; // Store original data
                currentPage = 1;
                displayPage(currentPage);

                // Add filter functionality for referral ID
                const filterInput = document.getElementById('filter-referral-id');
                if (filterInput) {
                    filterInput.addEventListener('input', function () {
                        applyFilters();
                    });
                }

                // Add filter functionality for business unit
                const businessUnitFilter = document.getElementById('filter-business-unit');
                if (businessUnitFilter) {
                    businessUnitFilter.addEventListener('change', function () {
                        applyFilters();
                    });
                }

                // Add filter functionality for status
                const statusFilter = document.getElementById('filter-status');
                if (statusFilter) {
                    statusFilter.addEventListener('change', function () {
                        applyFilters();
                    });
                }

                // Add reset filters functionality
                const resetFiltersBtn = document.getElementById('resetFiltersBtn');
                if (resetFiltersBtn) {
                    resetFiltersBtn.addEventListener('click', function () {
                        console.log('Resetting all filters');

                        // Clear all filter inputs
                        document.getElementById('filter-referral-id').value = '';
                        document.getElementById('filter-business-unit').value = 'all';
                        document.getElementById('filter-status').value = '';
                        document.getElementById('filter-date-range').value = '';

                        // Clear date range picker
                        $('#filter-date-range').data('daterangepicker').setStartDate(moment());
                        $('#filter-date-range').data('daterangepicker').setEndDate(moment());

                        // Reset to original data
                        allData = [...originalData];
                        currentPage = 1;
                        displayPage(currentPage);

                        console.log('Filters reset, showing all data:', allData.length, 'items');
                    });
                }

                // Combined filter function
                function applyFilters() {
                    const referralId = document.getElementById('filter-referral-id').value.trim().toLowerCase();
                    const selectedBusinessUnit = document.getElementById('filter-business-unit').value;
                    const selectedStatus = document.getElementById('filter-status').value;
                    const dateRange = document.getElementById('filter-date-range').value;

                    console.log('Applying filters:', {
                        referralId: referralId,
                        selectedBusinessUnit: selectedBusinessUnit,
                        selectedStatus: selectedStatus,
                        dateRange: dateRange
                    });

                    let filteredData = [...originalData]; // Always start from original data
                    console.log('Original data count:', filteredData.length);

                    // Filter by referral ID
                    if (referralId !== '') {
                        console.log('Filtering by referral ID:', referralId);
                        filteredData = filteredData.filter(function (row) {
                            const matches = row.ref_id && row.ref_id.toLowerCase().includes(referralId);
                            if (matches) {
                                console.log('Referral ID match:', row.ref_id);
                            }
                            return matches;
                        });
                        console.log('After referral ID filter:', filteredData.length);
                    }

                    // Filter by business unit
                    if (selectedBusinessUnit !== '' && selectedBusinessUnit !== 'all') {
                        console.log('Filtering by business unit:', selectedBusinessUnit);
                        filteredData = filteredData.filter(function (row) {
                            // Check both from_business_unit and to_business_unit
                            const fromMatches = row.from_business_unit && row.from_business_unit.toLowerCase() === selectedBusinessUnit.toLowerCase();
                            const toMatches = row.to_business_unit && row.to_business_unit.toLowerCase() === selectedBusinessUnit.toLowerCase();
                            const matches = fromMatches || toMatches;

                            if (matches) {
                                console.log('Business unit match:', fromMatches ? `from: ${row.from_business_unit}` : `to: ${row.to_business_unit}`);
                            }
                            return matches;
                        });
                        console.log('After business unit filter:', filteredData.length);
                    }

                    // Filter by status
                    if (selectedStatus !== '') {
                        console.log('Filtering by status:', selectedStatus, 'Type:', typeof selectedStatus);
                        filteredData = filteredData.filter(function (row) {
                            console.log('Row status:', row.ori_status, 'Type:', typeof row.ori_status);
                            const matches = String(row.ori_status) === String(selectedStatus);
                            if (matches) {
                                console.log('Status match:', row.ori_status);
                            }
                            return matches;
                        });
                        console.log('After status filter:', filteredData.length);
                    }

                    // Filter by date range
                    if (dateRange && dateRange.includes(' - ')) {
                        console.log('Filtering by date range:', dateRange);
                        const dates = dateRange.split(' - ');
                        // Parse YYYY-MM-DD format from date picker
                        const startDate = new Date(dates[0]);
                        const endDate = new Date(dates[1]);

                        console.log('Date range:', startDate, 'to', endDate);

                        // Function to parse custom date format "8 July 2025, Tuesday"
                        function parseCustomDate(dateStr) {
                            if (!dateStr) return null;

                            // Remove day name if present (e.g., ", Tuesday")
                            const cleanDateStr = dateStr.replace(/,\s*\w+$/, '').trim();

                            // Handle format like "8 July 2025"
                            const parts = cleanDateStr.split(' ');
                            if (parts.length === 3) {
                                const day = parseInt(parts[0]);
                                const month = parts[1];
                                const year = parseInt(parts[2]);

                                // Convert month name to number
                                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                                    'July', 'August', 'September', 'October', 'November', 'December'];
                                const monthIndex = monthNames.findIndex(m => m.toLowerCase() === month.toLowerCase());

                                if (monthIndex !== -1 && !isNaN(day) && !isNaN(year)) {
                                    return new Date(year, monthIndex, day);
                                }
                            }

                            // Try to parse the date directly as fallback
                            const parsedDate = new Date(cleanDateStr);
                            return isNaN(parsedDate.getTime()) ? null : parsedDate;
                        }

                        filteredData = filteredData.filter(function (row) {
                            const rowDate = parseCustomDate(row.created_at || row.date || row.timestamp);
                            if (!rowDate) {
                                console.log('Invalid row date:', row.created_at);
                                return false;
                            }

                            // Set time to start of day for comparison
                            const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
                            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                            console.log('Comparing dates:', {
                                rowDate: rowDateOnly.toDateString(),
                                startDate: startDateOnly.toDateString(),
                                endDate: endDateOnly.toDateString(),
                                originalRowDate: row.created_at
                            });

                            const isInRange = rowDateOnly >= startDateOnly && rowDateOnly <= endDateOnly;
                            if (isInRange) {
                                console.log('Date match:', row.created_at, 'parsed as:', rowDate.toDateString());
                            }
                            return isInRange;
                        });
                        console.log('After date filter:', filteredData.length);
                    }

                    // Update display with filtered data
                    allData = filteredData;
                    currentPage = 1;
                    displayPage(currentPage);
                    console.log('Final filtered data count:', filteredData.length);
                }

                // Assign to global variable so date picker can access it
                globalApplyFilters = applyFilters;
            },
            error: function (xhr, status, error) {
                console.error('Error loading referral data:', error);
            }
        });
    } else {
        console.error('Referral table element not found');
    }

    // Handle generate report toggle
    // const generateReportBtn = document.getElementById('generateReportBtn');
    // const generateReportSelect = document.getElementById('generate-report');

    // generateReportBtn.addEventListener('click', function () {
    //     const isVisible = generateReportSelect.style.display !== 'none';
    //     generateReportSelect.style.display = isVisible ? 'none' : 'block';
    //     this.textContent = isVisible ? 'Generate Report' : 'Hide Options';
    // });

    // document.getElementById('report-parameter').addEventListener('change', function () {
    //     window.location.href = `report.php?period=${this.value}`;
    // });


    $.ajax({
        url: 'api.php',
        type: 'POST',
        data: { action: 'report-chart' },
        success: function (response) {
            // console.log('Report chart response:', response);

            try {
                const chartData = typeof response === 'string' ? JSON.parse(response) : response;

                // Process the data for grouped bar chart
                const labels = [];
                const sentData = [];
                const receivedData = [];

                // Process actual API response data
                Object.keys(chartData.data).forEach(businessUnit => {
                    const label = businessUnit.replace(/^Alpro\s+/i, '');
                    const unitData = chartData.data[businessUnit][0];

                    labels.push(label);
                    sentData.push(unitData.sent);
                    receivedData.push(unitData.received);
                });

                // Update chart with actual data
                updateChart(labels, sentData, receivedData);

            } catch (e) {
                console.error('Error parsing chart data:', e);
                initChart(); // Use default data
            }
        },
        error: function (xhr, status, error) {
            console.error('Error loading report chart:', error);
            initChart(); // Use default data
        }
    });

    //chart
    const ctx = document.getElementById('myChart');
    let chartInstance = null;

    // Initialize chart with empty state
    function initChart() {
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Total Referral',
                    data: [],
                    backgroundColor: [],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Total Referral by Business Unit'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Business Unit'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Total Referral'
                        }
                    }
                }
            }
        });
    }

    // Update chart with grouped bar data (sent/received)
    function updateChart(labels, sentData, receivedData) {
        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Sent',
                        data: sentData,
                        backgroundColor: '#1e4384',
                        borderWidth: 1
                    },
                    {
                        label: 'Received',
                        data: receivedData,
                        backgroundColor: '#17b2a6',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Referrals Sent vs Received by Business Unit'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Business Unit'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Referrals'
                        }
                    }
                }
            }
        });
    }

    // Initialize chart with default data if no AJAX call succeeds
    initChart();

    // Initialize date range picker
    $('#filter-date-range').daterangepicker({
        autoUpdateInput: false,
        locale: {
            cancelLabel: 'Clear',
            format: 'DD/MM/YYYY'
        }
    });

    $('#filter-date-range').on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        if (typeof globalApplyFilters === 'function') {
            globalApplyFilters();
        }
    });

    $('#filter-date-range').on('cancel.daterangepicker', function (ev, picker) {
        $(this).val('');
        if (typeof globalApplyFilters === 'function') {
            globalApplyFilters();
        }
    });

});


