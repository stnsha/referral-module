$(document).ready(function () {
    // Search button click handler
    $('#searchBtn').on('click', function () {
        performSearch();
    });

    // Enter key press handler for search input
    $('#search-customer').on('keypress', function (e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            performSearch();
        }
    });

    // Clear search button handler
    $('#clearSearchBtn').on('click', function () {
        $('#search-customer').val('');
        resetTable();
    });

    function performSearch() {
        const icno = $('#search-customer').val().trim();

        if (icno === '') {
            alert('Please enter customer IC number');
            return;
        }

        // Show loading state
        $('#customer-filter-tbody').html(`
            <tr>
                <td colspan="6" class="text-center" style="padding: 20px;">
                    <span style="color: #6c757d;">Searching...</span>
                </td>
            </tr>
        `);

        // Step 1: Get customer details by IC
        $.ajax({
            url: 'referral/backend.php?action=searchCustomer',
            type: 'POST',
            data: {
                icno: icno
            },
            dataType: 'json',
            success: function (customerData) {
                if (customerData && customerData.length > 0) {
                    const customer = customerData[0];
                    // Step 2: Search referrals using customer ID
                    searchReferralsByCustomerId(customer.id, customer.name, customer.ic);
                } else {
                    showError('Customer not found');
                }
            },
            error: function (xhr, status, error) {
                console.error('Customer search error:', error);
                showError('An error occurred while searching for customer. Please try again.');
            }
        });
    }

    function searchReferralsByCustomerId(customerId, customerName, customerIc) {
        // Make AJAX request to search for referrals by customer ID
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'search-referral',
                customer_id: customerId
            }),
            dataType: 'json',
            success: function (response) {
                if (response.success && response.data) {
                    // Add customer info to each referral record
                    const referralsWithCustomerInfo = response.data.map(function(item) {
                        return {
                            ...item,
                            customer_name: customerName,
                            ic_number: customerIc
                        };
                    });
                    displayResults(referralsWithCustomerInfo);
                } else {
                    showError(response.message || 'No referrals found for this customer');
                }
            },
            error: function (xhr, status, error) {
                console.error('Referral search error:', error);
                showError('An error occurred while searching for referrals. Please try again.');
            }
        });
    }

    function displayResults(data) {
        if (!data || data.length === 0) {
            $('#customer-filter-tbody').html(`
                <tr>
                    <td colspan="6" style="text-align: center; padding: 20px; color: #666; font-style: italic;">No data available</td>
                </tr>
            `);
            return;
        }

        let rows = '';
        data.forEach(function (item) {
            const statusClass = getStatusClass(item.status);
            const statusText = getStatusText(item.status);

            // Display from and to business units separately
            const fromBusinessUnit = item.from_business_unit || '-';
            const toBusinessUnit = item.to_business_unit || '-';

            // Add external badge if referral is external
            const externalBadge = item.is_external ? '<br><span class="badge-external">External</span>' : '';

            // Conditional button for external vs internal referrals
            const secondButton = item.is_external
                ? `<a href="#" class="btn-icon btn-icon-download download-form-btn" data-id="${item.id}" data-ref-id="${item.ref_id}" data-timestamp="${item.ori_created_at}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Download Form"><i class="bi bi-file-earmark-arrow-down"></i></a>`
                : `<a href="referral/qr.php?id=${item.id}" class="btn-icon btn-icon-qr" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Generate QR"><i class="bi bi-qr-code"></i></a>`;

            // Calculate relative time (using plain JavaScript since we may not have moment.js)
            const relativeTime = item.ori_created_at ? getRelativeTime(item.ori_created_at) : 'N/A';

            rows += `
                <tr>
                    <td style="font-size:14px;width: 10%;text-align:start;">${item.ref_id || ''}</td>
                    <td style="font-size:14px;width: 35%;text-align:start;">${item.reason || ''}</td>
                    <td style="font-size:14px;width: 13%;text-align:start;">
                        <span>${fromBusinessUnit}</span>
                    </td>
                    <td style="font-size:14px;width: 13%;text-align:start;">
                        <span>${toBusinessUnit}</span>${externalBadge}
                    </td>
                    <td style="font-size:14px;width: 14%;text-align:start;">
                        <span class="bdg-${statusClass}">${statusText}</span>
                        <br><span style="color: #6c757d; font-size: 13px; margin-top: 4px; display: inline-block;">${relativeTime}</span>
                    </td>
                    <td style="font-size:14px;width: 15%;text-align:start;">
                        <a href="referral/view.php?id=${item.id}&view_only=true" class="btn-icon btn-icon-edit" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View"><i class="bi bi-pencil-square"></i></a>
                        ${secondButton}
                    </td>
                </tr>
            `;
        });

        $('#customer-filter-tbody').html(rows);

        // Initialize Bootstrap tooltips for the newly added buttons
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    }

    function getStatusClass(status) {
        const statusMap = {
            1: 'open',
            2: 'in-progress',
            3: 'referred',
            4: 'closed',
            5: 'not-present'
        };

        return statusMap[status] || 'unknown';
    }

    function getStatusText(status) {
        const statusTextMap = {
            1: 'Open',
            2: 'In Progress',
            3: 'Referred',
            4: 'Closed',
            5: 'Not Present'
        };

        return statusTextMap[status] || 'Unknown';
    }

    function getRelativeTime(timestamp) {
        if (!timestamp) return 'N/A';

        const now = new Date();
        const past = new Date(timestamp);
        const diffMs = now - past;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);
        const diffWeek = Math.floor(diffDay / 7);
        const diffMonth = Math.floor(diffDay / 30);
        const diffYear = Math.floor(diffDay / 365);

        if (diffYear > 0) return diffYear === 1 ? 'a year ago' : diffYear + ' years ago';
        if (diffMonth > 0) return diffMonth === 1 ? 'a month ago' : diffMonth + ' months ago';
        if (diffWeek > 0) return diffWeek === 1 ? 'a week ago' : diffWeek + ' weeks ago';
        if (diffDay > 0) return diffDay === 1 ? 'a day ago' : diffDay + ' days ago';
        if (diffHour > 0) return diffHour === 1 ? 'an hour ago' : diffHour + ' hours ago';
        if (diffMin > 0) return diffMin === 1 ? 'a minute ago' : diffMin + ' minutes ago';
        return 'just now';
    }

    function showError(message) {
        $('#customer-filter-tbody').html(`
            <tr>
                <td colspan="6" class="text-center" style="padding: 20px;">
                    <span style="color: #dc3545;">${message}</span>
                </td>
            </tr>
        `);
    }

    function resetTable() {
        $('#customer-filter-tbody').html(`
            <tr>
                <td colspan="6" class="text-center" style="padding: 20px;">
                    <span style="color: #6c757d;">Enter search criteria to find referrals</span>
                </td>
            </tr>
        `);
    }
});
