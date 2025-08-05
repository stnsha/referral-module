
document.addEventListener('DOMContentLoaded', function () {
    //dashboard summary
    // window.FORCE_EMPTY_RESPONSE = true;
    let dashboardData = null;
    let statusMapping = null;

    // First, fetch status mapping from getReferralStatus API
    $.ajax({
        url: 'api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            if (response && response.data) {
                statusMapping = response.data;
                // Now fetch dashboard data
                fetchDashboardData();
            }
        },
        error: function (xhr, status, error) {
            // console.log('Error loading status mapping:', error);
            // Fallback - still try to load dashboard data
            fetchDashboardData();
        }
    });

    function fetchDashboardData() {
        $.ajax({
            url: 'api-jwt.php',
            type: 'POST',
            data: { action: 'report-dashboard' },
            success: function (response) {
                // console.log(response.data);
                if (typeof response.data === 'object' && response.data !== null) {
                    if (Object.keys(response.data).length != 0) {
                        dashboardData = response.data;

                        // Update total referral count
                        if (response.data.total_referral !== undefined) {
                            $('#total-referral-count').text(response.data.total_referral);
                        }

                        // Update status counts using status_count and mapping
                        if (response.data.status_count && statusMapping) {
                            $('#referral-open-count').text(response.data.status_count['1'] || 0);
                            $('#referral-progress-count').text(response.data.status_count['2'] || 0);
                            $('#referral-referred-count').text(response.data.status_count['3'] || 0);
                            $('#referral-closed-count').text(response.data.status_count['4'] || 0);
                            $('#referral-not-present-count').text(response.data.status_count['5'] || 0);

                            // Make status items clickable
                            makeStatusItemsClickable(response.data.status_count);
                        }

                        // Update priority counts
                        if (response.data.priority_count) {
                            $('#referral-low-count').text(response.data.priority_count['1'] || 0);
                            $('#referral-medium-count').text(response.data.priority_count['2'] || 0);
                            $('#referral-high-count').text(response.data.priority_count['3'] || 0);

                            // Make priority items clickable
                            makePriorityItemsClickable(response.data.priority_count);
                        }

                        // Update total priority count
                        if (response.data.total_priority !== undefined) {
                            $('#total-priority-count').text(response.data.total_priority);
                        }

                        // Update business units dashboard
                        if (response.data.total_business_unit !== undefined) {
                            $('#total-business-unit-count').text(response.data.total_business_unit);
                        }

                        if (response.data.business_units && Array.isArray(response.data.business_units)) {
                            populateBusinessUnits(response.data.business_units);
                        }
                    } else {
                        // Handle empty data condition - display 0 for all columns
                        handleEmptyData();
                    }
                }
            },
            error: function (xhr, status, error) {
                // console.log('Dashboard report error:', error);
            }
        });
    }

    // Function to make status items clickable for filtering
    function makeStatusItemsClickable(statusCount) {
        // Add click handlers for each status
        $('#referral-open-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByStatus('1');
        });

        $('#referral-progress-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByStatus('2');
        });

        $('#referral-referred-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByStatus('3');
        });

        $('#referral-closed-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByStatus('4');
        });

        $('#referral-not-present-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByStatus('5');
        });
    }

    // Function to make priority items clickable for filtering
    function makePriorityItemsClickable(priorityCount) {
        // Add click handlers for each priority
        $('#referral-low-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByPriority('1');
        });

        $('#referral-medium-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByPriority('2');
        });

        $('#referral-high-count').parent().css('cursor', 'pointer').off('click').on('click', function () {
            filterTableByPriority('3');
        });
    }

    // Function to filter table by status
    function filterTableByStatus(statusId) {
        // console.log('DEBUG filterTableByStatus: Called with statusId:', statusId);
        if (document.getElementById('filter-status')) {
            // Set the status filter
            document.getElementById('filter-status').value = statusId;

            // Reset other filters to show all data for this status
            document.getElementById('filter-referral-id').value = '';
            document.getElementById('filter-business-unit').value = 'all';

            // Switch to "All" view and use all data
            document.getElementById('type-all').checked = true;
            window.currentReferralType = 'all';

            // Use ALL data from API response
            if (window.referralApiData && window.referralApiData.all) {
                originalData = [...window.referralApiData.all];
                allData = [...originalData];
                // console.log('DEBUG filterTableByStatus: Switched to All view, data length:', originalData.length);
            }

            // console.log('DEBUG filterTableByStatus: About to apply filters');
            if (typeof globalApplyFilters === 'function') {
                globalApplyFilters();
            } else {
                // console.log('DEBUG filterTableByStatus: globalApplyFilters not ready, waiting...');
                // If globalApplyFilters is not ready yet, wait for it
                const checkAndApply = setInterval(function () {
                    if (typeof globalApplyFilters === 'function') {
                        // console.log('DEBUG filterTableByStatus: globalApplyFilters now ready, applying...');
                        globalApplyFilters();
                        clearInterval(checkAndApply);
                    }
                }, 100); // Check every 100ms

                // Clear interval after 5 seconds to prevent infinite loop
                setTimeout(function () {
                    clearInterval(checkAndApply);
                }, 5000);
            }
        }
    }

    // Function to filter table by priority
    function filterTableByPriority(priorityId) {
        // console.log('DEBUG filterTableByPriority: Called with priorityId:', priorityId);

        // Reset other filters and switch to All view - same pattern as filterTableByStatus
        if (document.getElementById('filter-referral-id')) {
            document.getElementById('filter-referral-id').value = '';
        }
        if (document.getElementById('filter-business-unit')) {
            document.getElementById('filter-business-unit').value = 'all';
        }
        if (document.getElementById('filter-status')) {
            document.getElementById('filter-status').value = '';
        }

        // Switch to "All" view and use all data
        document.getElementById('type-all').checked = true;
        window.currentReferralType = 'all';

        // Use ALL data from API response
        if (window.referralApiData && window.referralApiData.all) {
            originalData = [...window.referralApiData.all];
            // console.log('DEBUG filterTableByPriority: Switched to All view, data length:', originalData.length);

            // Filter by priority
            let filteredData = originalData.filter(function (row) {
                return String(row.priority) === String(priorityId);
            });

            // Update the displayed data
            allData = filteredData;
            currentPage = 1;
            if (typeof displayPage === 'function') {
                displayPage(currentPage);
            }

            // console.log('DEBUG filterTableByPriority: Priority filter applied:', priorityId, 'Results:', filteredData.length);
        }
    }

    // Helper function to populate business units with collapse functionality
    function populateBusinessUnits(businessUnits) {
        $('#business-units-list').empty();
        $('#businessUnitsCollapse').empty();

        const maxVisible = 4; // Show 4 items to match referral column height

        if (businessUnits.length <= maxVisible) {
            // Show all business units if 4 or fewer
            businessUnits.forEach(function (unit, index) {
                const marginClass = index === businessUnits.length - 1 ? '' : 'mb-1';
                $('#business-units-list').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span>' + unit.name + '</span>' +
                    '<span>' + unit.count + '</span>' +
                    '</div>'
                );
            });

            // Fill remaining slots with empty divs to maintain height
            for (let i = businessUnits.length; i < maxVisible; i++) {
                const marginClass = i === maxVisible - 1 ? '' : 'mb-1';
                $('#business-units-list').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span>&nbsp;</span>' +
                    '<span>&nbsp;</span>' +
                    '</div>'
                );
            }

            $('#toggleButton').addClass('d-none');
        } else {
            // Show first 4 business units
            for (let i = 0; i < maxVisible; i++) {
                const marginClass = i === maxVisible - 1 ? '' : 'mb-1';
                $('#business-units-list').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span>' + businessUnits[i].name + '</span>' +
                    '<span>' + businessUnits[i].count + '</span>' +
                    '</div>'
                );
            }

            // Show remaining business units in collapse
            for (let i = maxVisible; i < businessUnits.length; i++) {
                const marginClass = i === businessUnits.length - 1 ? '' : 'mb-1';
                $('#businessUnitsCollapse').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span>' + businessUnits[i].name + '</span>' +
                    '<span>' + businessUnits[i].count + '</span>' +
                    '</div>'
                );
            }

            $('#toggleButton').removeClass('d-none');
        }
    }

    // Helper function to handle empty data condition
    function handleEmptyData() {
        // console.log("Handling empty data - displaying zeros");

        // Get business units from API and display with 0 counts
        $.ajax({
            url: 'api-jwt.php',
            type: 'POST',
            data: { action: 'business-units' },
            success: function (response) {
                if (response && response.data && Array.isArray(response.data)) {
                    const businessUnitsWithZero = response.data.map(function (unit) {
                        return {
                            name: unit.name,
                            count: 0
                        };
                    });
                    populateBusinessUnits(businessUnitsWithZero);
                }
            },
            error: function () {
                // console.log('Error fetching business units for empty data display');
                // If API fails, show at least 4 empty rows to maintain height
                $('#business-units-list').empty();
                for (let i = 0; i < 4; i++) {
                    const marginClass = i === 3 ? '' : 'mb-1';
                    $('#business-units-list').append(
                        '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                        '<span>&nbsp;</span>' +
                        '<span>0</span>' +
                        '</div>'
                    );
                }
                $('#toggleButton').addClass('d-none');
            }
        });
    }

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
        url: 'api-jwt.php',
        type: 'POST',
        data: { action: 'business-units' },
        success: function (response) {
            var busUnitFrom = $('#filter-business-unit');

            // Add default "All" option
            busUnitFrom.append('<option value="all">Business Units</option>');

            let isSelected = false;
            let businessUnitId = '';

            if (response && response.data && Array.isArray(response.data)) {
                $.each(response.data, function (index, businessUnit) {
                    // Remove default selection
                    if (department && businessUnit.staff_department_id == department) {
                        businessUnitId = businessUnit.id;
                    }

                    busUnitFrom.append(
                        '<option value="' + businessUnit.name + '" data-id="' + businessUnit.id + '">' +
                        businessUnit.name + '</option>'
                    );
                });
            }

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
            // console.log('DEBUG displayPage: Called with page', page);
            // console.log('DEBUG displayPage: allData length', allData.length);
            // console.log('DEBUG displayPage: allData content', allData);

            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const pageData = allData.slice(startIndex, endIndex);

            // console.log('DEBUG displayPage: pageData length', pageData.length);
            // console.log('DEBUG displayPage: pageData content', pageData);

            // Clear existing rows
            const tbody = document.querySelector('#referral-tbl tbody');
            // console.log('DEBUG displayPage: tbody element', tbody);
            if (tbody) {
                tbody.innerHTML = '';
            }

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
            // console.log('DEBUG displayPage: About to create rows, statusMapping:', statusMapping);
            pageData.forEach(function (row, index) {
                console.log(row);
                // console.log('DEBUG displayPage: Creating row', index, 'for:', row);
                const tr = document.createElement('tr');
                const statusText = statusMapping && statusMapping[row.status] ? statusMapping[row.status] : 'Unknown';
                const statusClass = statusMapping && statusMapping[row.status] ? statusMapping[row.status].toLowerCase().replace(/\s+/g, '-') : 'unknown';

                // console.log('DEBUG displayPage: Status mapping for', row.status, ':', statusText, 'class:', statusClass);

                tr.innerHTML = `
                    <td style="font-size:14px;width: 10%;text-align:start;">${row.ref_id}</td>
                    <td style="font-size:14px;width: 40%;text-align:start;">
                        ${row.reason}<br>
                        <span class="text-muted fst-italic r-text">${row.is_external ? 'External: ${row.to_business_unit}' : ''}</span>
                    </td>
                    <td style="font-size:14px;width: 15%;text-align:start;">
                        <span>${row.from_business_unit}</span>
                    </td>
                    <td style="font-size:14px;width: 10%;text-align:center;">
                        <span class="bdg-${statusClass}">${statusText}</span>
                        <br><span class="mt-1.5 fw-bold fst-italic r-text">${row.is_external ? '(External)' : ''}</span>
                    </td>
                    <td style="font-size:14px;width: 15%;text-align:start;">
                        <a href="view.php?id=${row.id}" target="_blank" class="btn-referral">View</a>
                        <a href="qr.php?id=${row.id}" target="_blank" class="btn-referral">Generate QR</a>
                    </td>
                `;
                // console.log('DEBUG displayPage: Created tr element:', tr);
                const tbody = document.querySelector('#referral-tbl tbody');
                tbody.appendChild(tr);
                // console.log('DEBUG displayPage: Appended row to tbody, tbody now has', tbody.children.length, 'rows');
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
            url: 'api-jwt.php',
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
                logError(new Error('Error loading status options'), { context: 'loadStatusOptions', status: status, error: error, responseText: xhr.responseText });
            }
        });

        $.ajax({
            url: 'api-jwt.php',
            type: 'POST',
            data: { action: 'all-referral' },
            success: function (response) {
                // console.log(response);
                if (!response || typeof response !== 'object' || !response.data) {
                    logError(new Error('Invalid response format'), { context: 'loadReferralData', response: response });
                    return;
                }

                const tableBody = document.querySelector('#referral-tbl tbody');
                if (!tableBody) {
                    // Create tbody if it doesn't exist
                    const tbody = document.createElement('tbody');
                    document.getElementById('referral-tbl').appendChild(tbody);
                }

                // Store the full API response structure
                window.referralApiData = response.data;

                // Initialize with all data by default
                const checkedRadio = document.querySelector('input[name="referral-type"]:checked');
                const filterType = checkedRadio ? checkedRadio.value : 'all';
                const selectedData = response.data[filterType] || [];
                originalData = [...selectedData];
                window.currentReferralType = filterType;

                // console.log('DEBUG: Checked radio:', checkedRadio ? checkedRadio.value : 'none');
                // console.log('DEBUG: Filter type:', filterType);
                // console.log('DEBUG: Selected data length:', selectedData.length);
                // console.log('DEBUG: Original data length:', originalData.length);

                // FORCE DISPLAY - Apply department filtering if needed and display
                // console.log('DEBUG: Department variable:', department);

                // Force display the data first
                allData = originalData;
                currentPage = 1;
                displayPage(currentPage);
                // console.log('DEBUG: Forced display with allData length:', allData.length);

                if (false && department && department !== '') { // Temporarily disabled
                    // Get business units to find the department name
                    $.ajax({
                        url: 'api-jwt.php',
                        type: 'POST',
                        data: { action: 'business-units' },
                        success: function (busResponse) {
                            const businessUnits = busResponse.data || [];
                            const userBusinessUnit = businessUnits.find(function (unit) {
                                return unit.staff_department_id == department;
                            });

                            if (userBusinessUnit) {
                                allData = originalData.filter(function (row) {
                                    const fromMatches = row.from_business_unit && row.from_business_unit.toLowerCase() === userBusinessUnit.name.toLowerCase();
                                    const toMatches = row.to_business_unit && row.to_business_unit.toLowerCase() === userBusinessUnit.name.toLowerCase();
                                    return fromMatches || toMatches;
                                });
                            } else {
                                allData = originalData;
                            }
                            currentPage = 1;
                            displayPage(currentPage);
                        },
                        error: function () {
                            allData = originalData;
                            currentPage = 1;
                            displayPage(currentPage);
                        }
                    });
                }

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

                // Add referral type filter functionality
                const referralTypeFilters = document.querySelectorAll('input[name="referral-type"]');
                referralTypeFilters.forEach(function (radio) {
                    radio.addEventListener('change', function () {
                        if (this.checked) {
                            window.currentReferralType = this.value;
                            // Update originalData based on selected type
                            if (window.referralApiData) {
                                const selectedData = window.referralApiData[this.value] || [];
                                originalData = [...selectedData];
                                allData = [...originalData];
                                // Reset to page 1 and clear any active filters when switching views
                                currentPage = 1;

                                // Clear filters when switching referral types (unless switching to "all")
                                if (this.value !== 'all') {
                                    document.getElementById('filter-referral-id').value = '';
                                    document.getElementById('filter-business-unit').value = 'all';
                                    document.getElementById('filter-status').value = '';
                                    if (document.getElementById('filter-date-range')) {
                                        document.getElementById('filter-date-range').value = '';
                                    }
                                }

                                displayPage(currentPage);
                            }
                        }
                    });
                });

                // Add reset filters functionality
                const resetFiltersBtn = document.getElementById('resetFiltersBtn');
                if (resetFiltersBtn) {
                    resetFiltersBtn.addEventListener('click', function () {
                        // console.log('Resetting all filters');

                        // Clear all filter inputs
                        document.getElementById('filter-referral-id').value = '';

                        // Reset referral type to 'all' to maintain consistency with filtering
                        document.getElementById('type-all').checked = true;
                        window.currentReferralType = 'all';
                        if (window.referralApiData) {
                            originalData = [...window.referralApiData.all];
                        }

                        // Reset business unit to user's department (session-based)
                        const businessUnitSelect = document.getElementById('filter-business-unit');
                        const userDepartmentOption = businessUnitSelect.querySelector('option[selected]');
                        if (userDepartmentOption) {
                            businessUnitSelect.value = userDepartmentOption.value;
                        } else {
                            businessUnitSelect.value = 'all';
                        }

                        document.getElementById('filter-status').value = '';
                        document.getElementById('filter-date-range').value = '';

                        // Clear date range picker
                        $('#filter-date-range').data('daterangepicker').setStartDate(moment());
                        $('#filter-date-range').data('daterangepicker').setEndDate(moment());

                        // Reset to original data and apply business unit filter if needed
                        allData = [...originalData];
                        currentPage = 1;

                        // Apply business unit filter if not 'all'
                        if (businessUnitSelect.value !== 'all') {
                            applyFilters();
                        } else {
                            displayPage(currentPage);
                        }

                        // console.log('Filters reset, showing data for department:', businessUnitSelect.value, allData.length, 'items');
                    });
                }

                // Combined filter function
                function applyFilters() {
                    const referralId = document.getElementById('filter-referral-id').value.trim().toLowerCase();
                    const selectedBusinessUnit = document.getElementById('filter-business-unit').value;
                    const selectedStatus = document.getElementById('filter-status').value;
                    const dateRange = document.getElementById('filter-date-range').value;

                    // console.log('Applying filters:', {
                    //     referralId: referralId,
                    //     selectedBusinessUnit: selectedBusinessUnit,
                    //     selectedStatus: selectedStatus,
                    //     dateRange: dateRange
                    // });

                    // Check if any filter is being used (excluding default "all" values)
                    const hasActiveFilters = referralId !== '' ||
                        (selectedBusinessUnit !== '' && selectedBusinessUnit !== 'all') ||
                        selectedStatus !== '' ||
                        dateRange !== '';

                    // console.log('DEBUG applyFilters: hasActiveFilters:', hasActiveFilters);

                    // If any filter is active, switch to "All" view and use all data
                    if (hasActiveFilters) {
                        // console.log('DEBUG applyFilters: Switching to All view for filtering');
                        document.getElementById('type-all').checked = true;
                        window.currentReferralType = 'all';

                        // Use ALL data from API response
                        if (window.referralApiData && window.referralApiData.all) {
                            originalData = [...window.referralApiData.all];
                            // console.log('DEBUG applyFilters: Using all data, length:', originalData.length);
                        }
                    }

                    // When status filter is active, use ALL data without department filtering
                    // This ensures status cards show all referrals across departments
                    let startingData;
                    if (selectedStatus !== '') {
                        // console.log('DEBUG: Status filter active, using ALL data without department filtering');
                        startingData = [...originalData];
                    } else if (selectedBusinessUnit === '' || selectedBusinessUnit === 'all') {
                        // Use department-filtered data by getting current user's business unit
                        if (department && department !== '') {
                            $.ajax({
                                url: 'api-jwt.php',
                                type: 'POST',
                                async: false, // Make synchronous to get data immediately
                                data: { action: 'business-units' },
                                success: function (response) {
                                    const businessUnits = response.data || [];
                                    const userBusinessUnit = businessUnits.find(function (unit) {
                                        return unit.staff_department_id == department;
                                    });

                                    if (userBusinessUnit) {
                                        startingData = originalData.filter(function (row) {
                                            const fromMatches = row.from_business_unit && row.from_business_unit.toLowerCase() === userBusinessUnit.name.toLowerCase();
                                            const toMatches = row.to_business_unit && row.to_business_unit.toLowerCase() === userBusinessUnit.name.toLowerCase();
                                            return fromMatches || toMatches;
                                        });
                                    } else {
                                        startingData = [...originalData];
                                    }
                                },
                                error: function () {
                                    startingData = [...originalData];
                                }
                            });
                        } else {
                            startingData = [...originalData];
                        }
                    } else {
                        // Business unit is explicitly selected, start from all data
                        startingData = [...originalData];
                    }

                    let filteredData = startingData || [...originalData];
                    // console.log('Starting data count:', filteredData.length);

                    // Filter by referral ID
                    if (referralId !== '') {
                        // console.log('Filtering by referral ID:', referralId);
                        filteredData = filteredData.filter(function (row) {
                            const matches = row.ref_id && row.ref_id.toLowerCase().includes(referralId);
                            if (matches) {
                                // console.log('Referral ID match:', row.ref_id);
                            }
                            return matches;
                        });
                        // console.log('After referral ID filter:', filteredData.length);
                    }

                    // Filter by business unit
                    if (selectedBusinessUnit !== '' && selectedBusinessUnit !== 'all') {
                        // console.log('Filtering by business unit:', selectedBusinessUnit);
                        filteredData = filteredData.filter(function (row) {
                            // Check only from_business_unit
                            const fromMatches = row.from_business_unit && row.from_business_unit.toLowerCase() === selectedBusinessUnit.toLowerCase();

                            if (fromMatches) {
                                // console.log('From business unit match:', row.from_business_unit);
                            }
                            return fromMatches;
                        });
                        // console.log('After business unit filter:', filteredData.length);
                    }

                    // Filter by status
                    if (selectedStatus !== '') {
                        // console.log('=== STATUS FILTER DEBUG ===');
                        // console.log('Filtering by status:', selectedStatus, 'Type:', typeof selectedStatus);
                        // console.log('Data before status filter:', filteredData.length);

                        filteredData = filteredData.filter(function (row, index) {
                            // console.log(`Row ${index}:`, {
                            //     id: row.id,
                            //     ref_id: row.ref_id,
                            //     status: row.status,
                            //     statusType: typeof row.status,
                            //     selectedStatus: selectedStatus,
                            //     selectedStatusType: typeof selectedStatus,
                            //     stringStatus: String(row.status),
                            //     stringSelected: String(selectedStatus),
                            //     comparison: String(row.status) === String(selectedStatus)
                            // });

                            const matches = String(row.status) === String(selectedStatus);
                            if (matches) {
                                // console.log('✅ STATUS MATCH FOUND:', row.ref_id, 'status:', row.status);
                            }
                            return matches;
                        });
                        // console.log('=== END STATUS FILTER DEBUG ===');
                        // console.log('After status filter:', filteredData.length);
                    }

                    // Filter by date range
                    if (dateRange && dateRange.includes(' - ')) {
                        // console.log('Filtering by date range:', dateRange);
                        const dates = dateRange.split(' - ');
                        // Parse YYYY-MM-DD format from date picker
                        const startDate = new Date(dates[0]);
                        const endDate = new Date(dates[1]);

                        // console.log('Date range:', startDate, 'to', endDate);

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
                            // Try ori_created_at first (ISO format), then fall back to created_at
                            let rowDate;
                            if (row.ori_created_at) {
                                rowDate = new Date(row.ori_created_at);
                            } else {
                                rowDate = parseCustomDate(row.created_at || row.date || row.timestamp);
                            }
                            if (!rowDate) {
                                // console.log('Invalid row date:', row.created_at);
                                return false;
                            }

                            // Set time to start of day for comparison
                            const rowDateOnly = new Date(rowDate.getFullYear(), rowDate.getMonth(), rowDate.getDate());
                            const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                            const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

                            // console.log('Comparing dates:', {
                            //     rowDate: rowDateOnly.toDateString(),
                            //     startDate: startDateOnly.toDateString(),
                            //     endDate: endDateOnly.toDateString(),
                            //     originalRowDate: row.created_at
                            // });

                            const isInRange = rowDateOnly >= startDateOnly && rowDateOnly <= endDateOnly;
                            if (isInRange) {
                                // console.log('Date match:', row.created_at, 'parsed as:', rowDate.toDateString());
                            }
                            return isInRange;
                        });
                        // console.log('After date filter:', filteredData.length);
                    }

                    // Update display with filtered data
                    allData = filteredData;
                    currentPage = 1;
                    displayPage(currentPage);
                    // console.log('Final filtered data count:', filteredData.length);
                }

                // Assign to global variable so date picker can access it
                globalApplyFilters = applyFilters;
            },
            error: function (xhr, status, error) {
                logError(new Error('Error loading referral data'), { context: 'loadReferralData', status: status, error: error, responseText: xhr.responseText });
            }
        });
    } else {
        logError(new Error('Referral table element not found'), { context: 'initializeReferralTable' });
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


    // $.ajax({
    //     url: 'api.php',
    //     type: 'POST',
    //     data: { action: 'report-chart' },
    //     success: function (response) {
    //         // console.log('Report chart response:', response);

    //         try {
    //             const chartData = typeof response === 'string' ? JSON.parse(response) : response;

    //             // Process the data for grouped bar chart
    //             const labels = [];
    //             const sentData = [];
    //             const receivedData = [];

    //             // Process actual API response data
    //             Object.keys(chartData.data).forEach(businessUnit => {
    //                 const label = businessUnit.replace(/^Alpro\s+/i, '');
    //                 const unitData = chartData.data[businessUnit][0];

    //                 labels.push(label);
    //                 sentData.push(unitData.sent);
    //                 receivedData.push(unitData.received);
    //             });

    //             // Update chart with actual data
    //             updateChart(labels, sentData, receivedData);

    //         } catch (e) {
    //             logError(new Error('Error parsing chart data'), { context: 'loadReportChart', parseError: e.message });
    //             initChart(); // Use default data
    //         }
    //     },
    //     error: function (xhr, status, error) {
    //         logError(new Error('Error loading report chart'), { context: 'loadReportChart', status: status, error: error, responseText: xhr.responseText });
    //         initChart(); // Use default data
    //     }
    // });

    // //chart
    // const ctx = document.getElementById('myChart');
    // let chartInstance = null;

    // // Initialize chart with empty state
    // function initChart() {
    //     if (chartInstance) {
    //         chartInstance.destroy();
    //     }

    //     chartInstance = new Chart(ctx, {
    //         type: 'bar',
    //         data: {
    //             labels: [],
    //             datasets: [{
    //                 label: 'Total Referral',
    //                 data: [],
    //                 backgroundColor: [],
    //                 borderWidth: 1
    //             }]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             plugins: {
    //                 legend: {
    //                     display: false
    //                 },
    //                 title: {
    //                     display: true,
    //                     text: 'Total Referral by Business Unit'
    //                 }
    //             },
    //             scales: {
    //                 x: {
    //                     title: {
    //                         display: true,
    //                         text: 'Business Unit'
    //                     }
    //                 },
    //                 y: {
    //                     beginAtZero: true,
    //                     title: {
    //                         display: true,
    //                         text: 'Total Referral'
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }

    // // Update chart with grouped bar data (sent/received)
    // function updateChart(labels, sentData, receivedData) {
    //     if (chartInstance) {
    //         chartInstance.destroy();
    //     }

    //     chartInstance = new Chart(ctx, {
    //         type: 'bar',
    //         data: {
    //             labels: labels,
    //             datasets: [
    //                 {
    //                     label: 'Sent',
    //                     data: sentData,
    //                     backgroundColor: '#1e4384',
    //                     borderWidth: 1
    //                 },
    //                 {
    //                     label: 'Received',
    //                     data: receivedData,
    //                     backgroundColor: '#17b2a6',
    //                     borderWidth: 1
    //                 }
    //             ]
    //         },
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             plugins: {
    //                 legend: {
    //                     display: true,
    //                     position: 'top'
    //                 },
    //                 title: {
    //                     display: true,
    //                     text: 'Referrals Sent vs Received by Business Unit'
    //                 }
    //             },
    //             scales: {
    //                 x: {
    //                     title: {
    //                         display: true,
    //                         text: 'Business Unit'
    //                     }
    //                 },
    //                 y: {
    //                     beginAtZero: true,
    //                     title: {
    //                         display: true,
    //                         text: 'Number of Referrals'
    //                     }
    //                 }
    //             }
    //         }
    //     });
    // }

    // // Initialize chart with default data if no AJAX call succeeds
    // initChart();

    // Date range picker is already initialized above - removed duplicate

});


