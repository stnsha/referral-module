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
            alert('Error loading business units');
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
            // alert('Error loading locations');
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
    console.log('Resetting filters...');

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

    console.log('Filters reset completed');
}