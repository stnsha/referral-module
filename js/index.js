
document.addEventListener('DOMContentLoaded', function () {
    //dashboard summary
    // window.FORCE_EMPTY_RESPONSE = true;
    let dashboardData = null;
    let statusMapping = null;
    let apisLoaded = {
        statusMapping: false,
        referralData: false,
        businessUnits: false
    };

    // Show loading state with spinner
    function showLoadingState() {
        const tbody = document.querySelector('#referral-tbl tbody');
        if (!tbody) {
            const newTbody = document.createElement('tbody');
            document.getElementById('referral-tbl').appendChild(newTbody);
        }
        const tableBody = document.querySelector('#referral-tbl tbody');

        // Create loading row with spinner
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 40px;">
                    <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <div style="margin-top: 12px; color: #6c757d; font-size: 14px;">Loading referrals...</div>
                </td>
            </tr>
        `;
    }

    // Check if all APIs are loaded
    function checkAllApisLoaded() {
        if (apisLoaded.statusMapping && apisLoaded.referralData && apisLoaded.businessUnits) {
            // All APIs loaded, now display the data
            if (window.initialReferralData) {
                initializeReferralTable(window.initialReferralData);
            }
        }
    }

    // Function to update referral type counts in radio button labels
    function updateReferralTypeCounts(data) {
        if (!data) return;

        const allCount = (data.all && Array.isArray(data.all)) ? data.all.length : 0;
        const sentCount = (data.sent && Array.isArray(data.sent)) ? data.sent.length : 0;
        const receivedCount = (data.received && Array.isArray(data.received)) ? data.received.length : 0;

        const allLabel = document.querySelector('label[for="type-all"]');
        const sentLabel = document.querySelector('label[for="type-sent"]');
        const receivedLabel = document.querySelector('label[for="type-received"]');

        if (allLabel) {
            allLabel.innerHTML = `All <span class="filter-count">(${allCount})</span>`;
        }
        if (sentLabel) {
            sentLabel.innerHTML = `Sent <span class="filter-count">(${sentCount})</span>`;
        }
        if (receivedLabel) {
            receivedLabel.innerHTML = `Received <span class="filter-count">(${receivedCount})</span>`;
        }
    }

    // Initialize referral table once all APIs are loaded
    function initializeReferralTable(response) {
        // console.log('DEBUG: All APIs loaded, initializing table...');

        // Update counts in radio button labels
        updateReferralTypeCounts(response.data);

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

        allData = originalData;
        currentPage = 1;

        if (typeof globalApplyFilters === 'function') {
            globalApplyFilters();
        } else {
            displayPage(currentPage);
        }
    }

    // Show loading state immediately
    showLoadingState();

    // First, fetch status mapping from getReferralStatus API
    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: { action: 'referral-status' },
        success: function (response) {
            if (response && response.data) {
                statusMapping = response.data;
                apisLoaded.statusMapping = true;
                checkAllApisLoaded();
                fetchDashboardData();
            }
        },
        error: function (xhr, status, error) {
            statusMapping = {
                '1': 'Open',
                '2': 'In Progress',
                '3': 'Referred',
                '4': 'Closed',
                '5': 'Not Present'
            };
            apisLoaded.statusMapping = true;
            checkAllApisLoaded();
            fetchDashboardData();
        }
    });

    function updateDashboardFromData(rows) {
        var statusCount = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
        var priorityCount = { '1': 0, '2': 0, '3': 0 };
        var buCount = {};

        rows.forEach(function (row) {
            var s = String(row.status);
            if (statusCount[s] !== undefined) statusCount[s]++;

            var p = String(row.priority || '2');
            if (priorityCount[p] !== undefined) priorityCount[p]++;

            var bu = row.to_business_unit || row.from_business_unit;
            if (bu) {
                buCount[bu] = (buCount[bu] || 0) + 1;
            }
        });

        var total = rows.length;
        $('#total-referral-count').text(total);
        $('#referral-open-count').text(statusCount['1']);
        $('#referral-progress-count').text(statusCount['2']);
        $('#referral-referred-count').text(statusCount['3']);
        $('#referral-closed-count').text(statusCount['4']);
        $('#referral-not-present-count').text(statusCount['5']);

        var totalPriority = priorityCount['1'] + priorityCount['2'] + priorityCount['3'];
        $('#total-priority-count').text(totalPriority);
        $('#referral-low-count').text(priorityCount['1']);
        $('#referral-medium-count').text(priorityCount['2']);
        $('#referral-high-count').text(priorityCount['3']);

        var buList = Object.keys(buCount).map(function (name) {
            return { name: name, count: buCount[name] };
        });
        buList.sort(function (a, b) { return b.count - a.count; });
        $('#total-business-unit-count').text(buList.length);
        populateBusinessUnits(buList);

        makeStatusItemsClickable(statusCount);
        makePriorityItemsClickable(priorityCount);
    }

    function fetchDashboardData() {
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            data: { action: 'report-dashboard' },
            success: function (response) {
                console.log(response.data);
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
        // Reset other filters
        if (document.getElementById('filter-referral-id')) {
            document.getElementById('filter-referral-id').value = '';
        }
        if (document.getElementById('filter-business-unit')) {
            document.getElementById('filter-business-unit').value = 'all';
        }
        if (document.getElementById('filter-status')) {
            document.getElementById('filter-status').value = '';
        }

        // Set priority filter to clicked priority
        if (document.getElementById('filter-priority')) {
            document.getElementById('filter-priority').value = priorityId;
        }

        // Switch to "All" view and use all data
        document.getElementById('type-all').checked = true;
        window.currentReferralType = 'all';

        if (window.referralApiData && window.referralApiData.all) {
            originalData = [...window.referralApiData.all];
        }

        // Apply filters using unified logic
        if (typeof globalApplyFilters === 'function') {
            globalApplyFilters();
        } else {
            const checkAndApply = setInterval(function () {
                if (typeof globalApplyFilters === 'function') {
                    globalApplyFilters();
                    clearInterval(checkAndApply);
                }
            }, 100);
            setTimeout(function () {
                clearInterval(checkAndApply);
            }, 5000);
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
                    '<span class="r-text">' + unit.name + '</span>' +
                    '<span class="r-text">' + unit.count + '</span>' +
                    '</div>'
                );
            });

            // Fill remaining slots with empty divs to maintain height
            for (let i = businessUnits.length; i < maxVisible; i++) {
                const marginClass = i === maxVisible - 1 ? '' : 'mb-1';
                $('#business-units-list').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span class="r-text">&nbsp;</span>' +
                    '<span class="r-text">&nbsp;</span>' +
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
                    '<span class="r-text">' + businessUnits[i].name + '</span>' +
                    '<span class="r-text">' + businessUnits[i].count + '</span>' +
                    '</div>'
                );
            }

            // Show remaining business units in collapse
            for (let i = maxVisible; i < businessUnits.length; i++) {
                const marginClass = i === businessUnits.length - 1 ? '' : 'mb-1';
                $('#businessUnitsCollapse').append(
                    '<div class="d-flex justify-content-between w-100 ' + marginClass + '">' +
                    '<span class="r-text">' + businessUnits[i].name + '</span>' +
                    '<span class="r-text">' + businessUnits[i].count + '</span>' +
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
            url: 'referral/api-jwt.php',
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
        url: 'referral/api-jwt.php',
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

            apisLoaded.businessUnits = true;
            checkAllApisLoaded();
        },
        error: function () {
            if (window.toast) {
                toast.error('Error loading business units');
            } else {
                alert('Error loading business units');
            }
            apisLoaded.businessUnits = true;
            checkAllApisLoaded();
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
                    <td colspan="8" style="text-align: center; padding: 20px; color: #666; font-style: italic;">No data available</td>
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

                // Add external badge if referral is external
                const externalBadge = row.is_external ? '<br><span class="badge-external">External</span>' : '';

                // Priority mapping and defaulting
                const priorityMap = {
                    '1': { name: 'Low', class: 'bdg-priority-low' },
                    '2': { name: 'Medium', class: 'bdg-priority-medium' },
                    '3': { name: 'High', class: 'bdg-priority-high' }
                };

                // Default to Medium (2) if priority is null/empty
                const priorityValue = row.priority || '2';
                const priorityInfo = priorityMap[priorityValue] || priorityMap['2'];
                const priorityBadge = `<span class="${priorityInfo.class}">${priorityInfo.name}</span>`;

                const secondButton = ``;

                // Calculate relative time using moment.js
                // Remove 'Z' suffix and treat as Malaysia time (UTC+8)
                const relativeTime = row.ori_updated_at ? moment(row.ori_updated_at.replace('Z', '')).utcOffset(8, true).fromNow() : 'N/A';

                tr.innerHTML = `
                    <td style="font-size:13px;width: 8%;text-align:start;">${row.ref_id}</td>
                    <td style="font-size:13px;width: 34%;text-align:start;">
                        ${row.reason}
                    </td>
                    <td style="font-size:13px;width: 13%;text-align:start;">
                        <span style="font-size:13px;">${(window.outletCodeMap && row.from_location && window.outletCodeMap[row.from_location]) ? window.outletCodeMap[row.from_location] : (row.from_business_unit || 'N/A')}</span>
                    </td>
                    <td style="font-size:13px;width: 13%;text-align:start;">
                        <span style="font-size:13px;">${(window.outletCodeMap && row.to_location && window.outletCodeMap[row.to_location]) ? window.outletCodeMap[row.to_location] : (row.to_business_unit || 'N/A')}</span>${externalBadge}
                    </td>
                    <td style="font-size:13px;width: 9%;text-align:start;">${row.created_at || 'N/A'}</td>
                    <td style="font-size:13px;width: 9%;text-align:start;">
                        <span class="bdg-${statusClass}">${statusText}</span>
                        <br><span style="font-size:11px;color:#6c757d;font-style:italic;">${row.ori_updated_at ? 'Last updated: ' + row.ori_updated_at.substring(0, 10).split('-').reverse().join('-') : ''}</span>
                    </td>
                    <td style="font-size:13px;width: 9%;text-align:start;">
                        ${priorityBadge}
                    </td>
                    <td style="font-size:13px;width: 10%;text-align:start;">
                        <a href="referral/view.php?id=${row.id}" class="btn-icon btn-icon-edit" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View/Edit MyReferral"><i class="bi bi-pencil-square"></i></a>
                        ${secondButton}
                    </td>
                `;
                // console.log('DEBUG displayPage: Created tr element:', tr);
                const tbody = document.querySelector('#referral-tbl tbody');
                tbody.appendChild(tr);
                // console.log('DEBUG displayPage: Appended row to tbody, tbody now has', tbody.children.length, 'rows');
            });

            // Initialize Bootstrap tooltips for the newly added buttons
            const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
            const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

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

        // Helper function to determine MIME type from file extension
        function getMimeTypeFromFileName(fileName) {
            const extension = fileName.split('.').pop().toLowerCase();
            const mimeTypes = {
                'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xls': 'application/vnd.ms-excel',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'ppt': 'application/vnd.ms-powerpoint',
                'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                'txt': 'text/plain',
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'gif': 'image/gif',
                'bmp': 'image/bmp',
                'tiff': 'image/tiff',
                'zip': 'application/zip',
                'rar': 'application/x-rar-compressed',
                '7z': 'application/x-7z-compressed'
            };

            return mimeTypes[extension] || 'application/octet-stream';
        }

        // Event handler for download form button (external referrals)
        $(document).on('click', '.download-form-btn', function (e) {
            e.preventDefault();
            const referralId = $(this).data('id');
            const refId = $(this).data('ref-id');
            const timestamp = $(this).data('timestamp');
            const fromSequence = $(this).data('from-sequence');

            // Generate filename from ref_id and timestamp
            // Remove # from ref_id and format timestamp
            const cleanRefId = refId.replace('#', '');
            const formattedTimestamp = timestamp ? timestamp.replace(/[:.]/g, '-').replace('T', '_').split('.')[0] : '';
            const fileName = `${cleanRefId}_${formattedTimestamp}.pdf`;

            // Show loading state with spinning icon
            const btn = $(this);
            const originalHTML = btn.html();
            btn.html('<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite;"></i>').prop('disabled', true);

            // Add spin animation if not already in CSS
            if (!document.getElementById('spin-animation-style')) {
                const style = document.createElement('style');
                style.id = 'spin-animation-style';
                style.textContent = '@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }';
                document.head.appendChild(style);
            }

            $.ajax({
                url: 'referral/api-jwt.php',
                type: 'POST',
                data: JSON.stringify({
                    action: 'download-external-form',
                    referral_id: referralId,
                    sequence: fromSequence || null
                }),
                contentType: 'application/json',
                xhrFields: {
                    responseType: 'blob'
                },
                success: function (response) {
                    try {
                        // Try to read the response as text first to check for JSON error
                        const reader = new FileReader();
                        reader.onload = function () {
                            try {
                                // Check if response is JSON (error response)
                                const jsonResponse = JSON.parse(reader.result);
                                if (!jsonResponse.success) {
                                    alert(jsonResponse.message || 'Failed to download form. Please try again.');
                                    btn.html(originalHTML).prop('disabled', false);
                                    return;
                                }
                            } catch (e) {
                                // Not JSON, treat as binary data (PDF)
                                const blob = new Blob([response], { type: response.type || getMimeTypeFromFileName(fileName) });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileName;
                                a.style.display = 'none';

                                document.body.appendChild(a);
                                a.click();

                                setTimeout(() => {
                                    window.URL.revokeObjectURL(url);
                                    document.body.removeChild(a);
                                }, 100);

                                // Restore button
                                btn.html(originalHTML).prop('disabled', false);
                            }
                        };
                        reader.readAsText(response);
                    } catch (error) {
                        alert('Failed to process file data. Please try again.');
                        console.error('Download error:', error);
                        btn.html(originalHTML).prop('disabled', false);
                    }
                },
                error: function (xhr, status, error) {
                    alert('Error downloading form. Please try again.');
                    console.error('Download error:', error);
                    btn.html(originalHTML).prop('disabled', false);
                }
            });
        });

        // Load status options from API
        $.ajax({
            url: 'referral/api-jwt.php',
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

        // Load priority options from API
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            data: { action: 'referral-priority' },
            success: function (response) {
                const prioritySelect = document.getElementById('filter-priority');
                if (prioritySelect && response && response.data) {
                    // Clear existing options
                    prioritySelect.innerHTML = '<option value="">All Priority</option>';

                    // Add priority options from object format {"1": "Low", "2": "Medium", "3": "High"}
                    Object.keys(response.data).forEach(function (key) {
                        const option = document.createElement('option');
                        option.value = key;
                        option.textContent = response.data[key];
                        prioritySelect.appendChild(option);
                    });
                }
            },
            error: function (xhr, status, error) {
                logError(new Error('Error loading priority options'), { context: 'loadPriorityOptions', status: status, error: error, responseText: xhr.responseText });
            }
        });

        // Populate location filter from current user's outlets
        $.ajax({
            url: 'referral/backend.php?action=getStaffLocation',
            type: 'GET',
            dataType: 'json',
            data: { staff_id: id_user },
            success: function (response) {
                var locationSelect = document.getElementById('filter-location');
                if (locationSelect) {
                    locationSelect.innerHTML = '<option value="all">All Location</option>';
                    if (Array.isArray(response)) {
                        window.userOutletIds = response.map(function (outlet) { return String(outlet.id); });
                        response.forEach(function (outlet) {
                            var option = document.createElement('option');
                            option.value = outlet.id;
                            option.textContent = outlet.code;
                            locationSelect.appendChild(option);
                        });
                    }
                }
            },
            error: function () {
                var locationSelect = document.getElementById('filter-location');
                if (locationSelect) {
                    locationSelect.innerHTML = '<option value="all">All Location</option>';
                }
                window.userOutletIds = [];
            }
        });

        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            data: { action: 'all-referral' },
            success: function (response) {
                console.log(response);
                if (!response || typeof response !== 'object' || !response.data) {
                    logError(new Error('Invalid response format'), { context: 'loadReferralData', response: response });
                    apisLoaded.referralData = true;
                    checkAllApisLoaded();
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
                window.initialReferralData = response;

                // Collect unique outlet IDs from all referral rows
                var allRows = (response.data.all || []).concat(response.data.sent || []).concat(response.data.received || []);
                var locationIds = {};
                allRows.forEach(function (row) {
                    if (row.from_location) locationIds[row.from_location] = true;
                    if (row.to_location) locationIds[row.to_location] = true;
                });
                var uniqueIds = Object.keys(locationIds).join(',');

                if (uniqueIds) {
                    $.ajax({
                        url: 'referral/backend.php?action=getOutletCodes',
                        type: 'POST',
                        dataType: 'json',
                        data: { ids: uniqueIds },
                        success: function (map) {
                            window.outletCodeMap = map;
                        },
                        error: function () {
                            window.outletCodeMap = {};
                        },
                        complete: function () {
                            apisLoaded.referralData = true;
                            checkAllApisLoaded();
                        }
                    });
                } else {
                    window.outletCodeMap = {};
                    // Mark API as loaded
                    apisLoaded.referralData = true;
                    checkAllApisLoaded();
                }

                // console.log('DEBUG: Referral data loaded, waiting for other APIs...');

                if (false && department && department !== '') { // Temporarily disabled
                    // Get business units to find the department name
                    $.ajax({
                        url: 'referral/api-jwt.php',
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

                // Add filter functionality for priority
                const priorityFilter = document.getElementById('filter-priority');
                if (priorityFilter) {
                    priorityFilter.addEventListener('change', function () {
                        applyFilters();
                    });
                }

                // Add filter functionality for location
                const locationFilter = document.getElementById('filter-location');
                if (locationFilter) {
                    locationFilter.addEventListener('change', function () {
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
                                    document.getElementById('filter-priority').value = '';
                                    if (document.getElementById('filter-date-range')) {
                                        document.getElementById('filter-date-range').value = '';
                                    }
                                    if (document.getElementById('filter-location')) {
                                        document.getElementById('filter-location').value = 'all';
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
                        document.getElementById('filter-priority').value = '';
                        if (document.getElementById('filter-location')) {
                            document.getElementById('filter-location').value = 'all';
                        }
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
                    const selectedPriority = document.getElementById('filter-priority').value;
                    const selectedLocation = document.getElementById('filter-location') ? document.getElementById('filter-location').value : 'all';
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
                        selectedPriority !== '' ||
                        (selectedLocation !== '' && selectedLocation !== 'all') ||
                        dateRange !== '';

                    // console.log('DEBUG applyFilters: hasActiveFilters:', hasActiveFilters);

                    // If any filter is active, switch to "All" view and use all data
                    if (hasActiveFilters) {
                        // console.log('DEBUG applyFilters: Switching to All view for filtering');
                        document.getElementById('type-all').checked = true;
                        window.currentReferralType = 'all';

                        if (window.referralApiData && window.referralApiData.all) {
                            originalData = [...window.referralApiData.all];
                        }
                    }

                    // When status filter is active, use ALL data without department filtering
                    // This ensures status cards show all referrals across departments
                    let startingData;
                    if (selectedStatus !== '') {
                        // console.log('DEBUG: Status filter active, using ALL data without department filtering');
                        startingData = [...originalData];
                    } else if (selectedBusinessUnit === '' || selectedBusinessUnit === 'all') {
                        startingData = [...originalData];
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
                            const toMatches = row.to_business_unit && row.to_business_unit.toLowerCase() === selectedBusinessUnit.toLowerCase();

                            if (fromMatches) {
                                // console.log('From business unit match:', row.from_business_unit);
                            }
                            return toMatches;
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

                    // Filter by priority
                    if (selectedPriority !== '') {
                        filteredData = filteredData.filter(function (row) {
                            const matches = String(row.priority) === String(selectedPriority);
                            return matches;
                        });
                    }

                    // Filter by location (outlet)
                    if (selectedLocation !== '' && selectedLocation !== 'all') {
                        filteredData = filteredData.filter(function (row) {
                            return String(row.from_location) === String(selectedLocation) ||
                                String(row.to_location) === String(selectedLocation);
                        });
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
                            // Try ori_updated_at first (ISO format), then fall back to updated_at
                            let rowDate;
                            if (row.ori_updated_at) {
                                rowDate = new Date(row.ori_updated_at);
                            } else {
                                rowDate = parseCustomDate(row.updated_at || row.date || row.timestamp);
                            }
                            if (!rowDate) {
                                // console.log('Invalid row date:', row.updated_at);
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
                            //     originalRowDate: row.updated_at
                            // });

                            const isInRange = rowDateOnly >= startDateOnly && rowDateOnly <= endDateOnly;
                            if (isInRange) {
                                // console.log('Date match:', row.updated_at, 'parsed as:', rowDate.toDateString());
                            }
                            return isInRange;
                        });
                        // console.log('After date filter:', filteredData.length);
                    }

                    // Update display with filtered data
                    allData = filteredData;
                    currentPage = 1;
                    displayPage(currentPage);
                }

                // Assign to global variable so date picker can access it
                globalApplyFilters = applyFilters;
            },
            error: function (xhr, status, error) {
                logError(new Error('Error loading referral data'), { context: 'loadReferralData', status: status, error: error, responseText: xhr.responseText });
                apisLoaded.referralData = true;
                checkAllApisLoaded();
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

    // Table column sorting functionality
    let currentSortColumn = null;
    let currentSortDirection = 'asc';

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', function () {
            const column = this.getAttribute('data-column');

            // Toggle sort direction if clicking same column, otherwise default to asc
            if (currentSortColumn === column) {
                currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                currentSortDirection = 'asc';
            }

            currentSortColumn = column;

            // Update header icons
            document.querySelectorAll('.sortable i').forEach(icon => {
                icon.className = 'bi bi-arrow-down-up';
                icon.style.opacity = '0.5';
            });

            const icon = this.querySelector('i');
            if (currentSortDirection === 'asc') {
                icon.className = 'bi bi-arrow-up';
                icon.style.opacity = '1';
            } else {
                icon.className = 'bi bi-arrow-down';
                icon.style.opacity = '1';
            }

            // Sort the data
            sortTableData(column, currentSortDirection);
        });

        // Add hover effect
        header.addEventListener('mouseenter', function () {
            this.style.backgroundColor = '#f0f4f8';
        });

        header.addEventListener('mouseleave', function () {
            this.style.backgroundColor = '';
        });
    });

    function sortTableData(column, direction) {
        if (!allData || allData.length === 0) return;

        allData.sort((a, b) => {
            let valueA = a[column];
            let valueB = b[column];

            // Handle null/undefined values
            if (valueA === null || valueA === undefined) valueA = '';
            if (valueB === null || valueB === undefined) valueB = '';

            // Convert to string for comparison
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();

            // For ref_id, extract the number for proper sorting
            if (column === 'ref_id') {
                const numA = parseInt(valueA.replace(/\D/g, '')) || 0;
                const numB = parseInt(valueB.replace(/\D/g, '')) || 0;
                return direction === 'asc' ? numA - numB : numB - numA;
            }

            // For status, sort by status ID number
            if (column === 'status') {
                const numA = parseInt(valueA) || 0;
                const numB = parseInt(valueB) || 0;
                return direction === 'asc' ? numA - numB : numB - numA;
            }

            // For priority, sort by priority ID number (1=Low, 2=Medium, 3=High)
            if (column === 'priority') {
                const numA = parseInt(valueA) || 2; // Default to Medium if null
                const numB = parseInt(valueB) || 2;
                return direction === 'asc' ? numA - numB : numB - numA;
            }

            // String comparison for other columns
            if (direction === 'asc') {
                return valueA.localeCompare(valueB);
            } else {
                return valueB.localeCompare(valueA);
            }
        });

        // Reset to first page and display sorted data
        currentPage = 1;
        displayPage(currentPage);

        // Show toast notification
        if (window.toast) {
            const directionText = direction === 'asc' ? 'ascending' : 'descending';
            const columnName = document.querySelector(`[data-column="${column}"]`).textContent.trim();
            toast.info(`Sorted by ${columnName} (${directionText})`);
        }
    }

});


