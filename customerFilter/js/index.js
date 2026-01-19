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

    function detectSearchType(input) {
        const trimmedInput = input.trim().toUpperCase();

        // Check if starts with "REF" (case-insensitive)
        if (trimmedInput.startsWith('REF')) {
            return {
                type: 'referral',
                value: input.trim().substring(3) // Strip "REF" prefix
            };
        }

        // Check if it's a valid IC (12 digits after removing dashes)
        const cleanedInput = input.replace(/[^0-9]/g, '');
        if (cleanedInput.length === 12 && /^\d+$/.test(cleanedInput)) {
            return {
                type: 'ic',
                value: input.trim()
            };
        }

        return {
            type: 'unknown',
            value: input.trim()
        };
    }

    function performSearch() {
        const input = $('#search-customer').val().trim();

        if (input === '') {
            alert('Please enter customer IC or referral ID');
            return;
        }

        // Detect search type
        const searchType = detectSearchType(input);

        // Show loading state
        $('#customer-filter-tbody').html(`
            <tr>
                <td colspan="7" class="text-center" style="padding: 20px;">
                    <span style="color: #6c757d;">Searching...</span>
                </td>
            </tr>
        `);

        if (searchType.type === 'referral') {
            // Search by Referral ID
            searchReferralsByRefId(searchType.value);
        } else if (searchType.type === 'ic') {
            // Step 1: Get customer details by IC
            $.ajax({
                url: 'referral/backend.php?action=searchCustomer',
                type: 'POST',
                data: {
                    icno: searchType.value
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
        } else {
            // Invalid format
            showError('Invalid input. Please enter a valid Customer IC (12 digits) or Referral ID (REF followed by alphanumeric)');
        }
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

    function searchReferralsByRefId(refId) {
        // Make AJAX request to search for referrals by referral ID
        $.ajax({
            url: 'referral/api-jwt.php',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                action: 'search-referral',
                ref_id: refId
            }),
            dataType: 'json',
            success: function (response) {
                if (response.success && response.data) {
                    displayResults(response.data);
                } else {
                    showError(response.message || 'No referrals found for this referral ID');
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
                    <td colspan="7" style="text-align: center; padding: 20px; color: #666; font-style: italic;">No data available</td>
                </tr>
            `);
            return;
        }

        let rows = '';
        data.forEach(function (item) {
            const statusClass = getStatusClass(item.status);
            const statusText = getStatusText(item.status);

            // Display from and to business units separately
            const fromBusinessUnit = item.from_business_unit || 'N/A';
            const toBusinessUnit = item.to_business_unit || 'N/A';

            // Add external badge if referral is external
            const externalBadge = item.is_external ? '<br><span class="badge-external">External</span>' : '';

            // Priority mapping and defaulting
            const priorityMap = {
                '1': { name: 'Low', class: 'bdg-priority-low' },
                '2': { name: 'Medium', class: 'bdg-priority-medium' },
                '3': { name: 'High', class: 'bdg-priority-high' }
            };

            // Default to Medium (2) if priority is null/empty
            const priorityValue = item.priority || '2';
            const priorityInfo = priorityMap[priorityValue] || priorityMap['2'];
            const priorityBadge = `<span class="${priorityInfo.class}">${priorityInfo.name}</span>`;

            // Generate PDF button for all referrals (both internal and external)
            const secondButton = `<a href="#" class="btn-icon btn-icon-download download-form-btn" data-id="${item.id}" data-ref-id="${item.ref_id}" data-timestamp="${item.ori_updated_at}" data-from-sequence="${item.from_sequence || ''}" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Download MyReferral Letter"><i class="bi bi-file-earmark-arrow-down"></i></a>`;

            // Calculate relative time (using plain JavaScript since we may not have moment.js)
            const relativeTime = item.ori_updated_at ? getRelativeTime(item.ori_updated_at) : 'N/A';

            rows += `
                <tr>
                    <td style="font-size:13px;width: 8%;text-align:start;">${item.ref_id}</td>
                    <td style="font-size:13px;width: 34%;text-align:start;">
                        ${item.reason}
                    </td>
                    <td style="font-size:13px;width: 13%;text-align:start;">
                        <span style="font-size:13px;">${fromBusinessUnit}</span>
                    </td>
                    <td style="font-size:13px;width: 13%;text-align:start;">
                        <span style="font-size:13px;">${toBusinessUnit}</span>${externalBadge}
                    </td>
                    <td style="font-size:13px;width: 10%;text-align:start;">
                        <span class="bdg-${statusClass}">${statusText}</span>
                        <br><span style="color: #6c757d; font-size: 13px; margin-top: 4px; display: inline-block;">${relativeTime}</span>
                    </td>
                    <td style="font-size:13px;width: 10%;text-align:start;">
                        ${priorityBadge}
                    </td>
                    <td style="font-size:13px;width: 12%;text-align:start;">
                        <a href="referral/view.php?id=${item.id}" class="btn-icon btn-icon-edit" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="View/Edit MyReferral"><i class="bi bi-pencil-square"></i></a>
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
                <td colspan="7" class="text-center" style="padding: 20px;">
                    <span style="color: #dc3545;">${message}</span>
                </td>
            </tr>
        `);
    }

    function resetTable() {
        $('#customer-filter-tbody').html(`
            <tr>
                <td colspan="7" class="text-center" style="padding: 20px;">
                    <span style="color: #6c757d;">Enter search criteria to find referrals</span>
                </td>
            </tr>
        `);
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

    // Event handler for download form button
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
});
