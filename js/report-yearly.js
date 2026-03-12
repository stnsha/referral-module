document.addEventListener('DOMContentLoaded', function () {
    loadBusinessUnits();
    loadYears();

    $('#filter-business-unit').on('change', function () {
        loadYearlySummary();
    });

    $('#filter-year').on('change', function () {
        loadYearlySummary();
    });

    $('#resetFiltersBtn').on('click', function () {
        resetFilters();
    });
});

var BU_COLORS = [
    '#36a2eb', '#ff6384', '#4bc0c0', '#ffce56',
    '#9966ff', '#ff9f40', '#e83e8c', '#20c997',
    '#fd7e14', '#6610f2'
];

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

            $.each(response.data, function (index, businessUnit) {
                let selected = '';

                if (referralPermission !== 1) {
                    if (department == 1) {
                        if (staffPosition.toLowerCase().includes('audiologist')) {
                            if (businessUnit.id === 1) { selected = 'selected'; }
                        } else {
                            if (businessUnit.id === 5 && businessUnit.name.toLowerCase().includes('pharmacy')) {
                                selected = 'selected';
                            }
                        }
                    } else {
                        if (businessUnit.staff_department_id == department) { selected = 'selected'; }
                    }
                }

                busUnitFrom.append(
                    '<option value="' + businessUnit.name + '" data-id="' + businessUnit.id + '" ' + selected + '>' +
                    businessUnit.name + '</option>'
                );
            });

            loadYearlySummary();
        },
        error: function () {
            logError(new Error('Error loading business units'), { context: 'loadBusinessUnits' });
        }
    });
}

function loadYears() {
    const yearSelect = $('#filter-year');
    const currentYear = new Date().getFullYear();
    const startYear = 2025;

    yearSelect.empty();
    for (let year = startYear; year <= currentYear; year++) {
        const selected = year === currentYear ? 'selected' : '';
        yearSelect.append('<option value="' + year + '" ' + selected + '>' + year + '</option>');
    }
}

function resetFilters() {
    loadBusinessUnits();
    $('#filter-year').val(new Date().getFullYear());
    loadYearlySummary();
}

function loadYearlySummary() {
    var year = $('#filter-year').val() || new Date().getFullYear();
    var businessUnitId = $('#filter-business-unit option:selected').data('id') || '';

    $.ajax({
        url: 'referral/api-jwt.php',
        type: 'POST',
        data: {
            action: 'get-yearly-report',
            year: year,
            business_unit_id: businessUnitId
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
    var buList      = data.business_units || [];
    var topLocations = data.top_locations || {};
    var year        = data.year || new Date().getFullYear();

    $('#yearly-title-year').text(year);

    ['yearlyTotalChart', 'yearlySentReceivedChart',
     'yearlyStatusChart', 'yearlyLocationsChart'
    ].forEach(function (id) {
        if (window[id] && typeof window[id].destroy === 'function') {
            window[id].destroy();
            window[id] = null;
        }
    });

    var buNames = buList.map(function (bu) { return bu.name; });

    // 1. Total Referrals by BU (horizontal bar)
    var totalEl = document.getElementById('yearlyTotalChart');
    if (totalEl) {
        window.yearlyTotalChart = new Chart(totalEl.getContext('2d'), {
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
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { display: false } },
                scales: { x: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 2. Created vs Received per BU (grouped bar)
    var srEl = document.getElementById('yearlySentReceivedChart');
    if (srEl) {
        window.yearlySentReceivedChart = new Chart(srEl.getContext('2d'), {
            type: 'bar',
            data: {
                labels: buNames,
                datasets: [
                    {
                        label: 'Created',
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
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { position: 'bottom' } },
                scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
            }
        });
    }

    // 3. Status Distribution by BU (stacked bar)
    var statusEl = document.getElementById('yearlyStatusChart');
    if (statusEl) {
        var statusKeys   = ['Open', 'In Progress', 'Referred', 'Closed', 'Not Present'];
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
            data: { labels: buNames, datasets: statusDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: { legend: { position: 'bottom' } },
                scales: {
                    x: { stacked: true },
                    y: { stacked: true, beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    // 4. Top 3 Locations per BU — grouped bar, X = BU names, 3 datasets (rank 1/2/3)
    //    Tooltip shows the actual location code for each rank
    var locEl = document.getElementById('yearlyLocationsChart');
    if (locEl) {
        // Build per-rank arrays: locCodes[rank][buIdx] = code, locCounts[rank][buIdx] = count
        var rankColors = ['#36a2eb', '#ff6384', '#4bc0c0'];
        var rankLabels = ['1st Location', '2nd Location', '3rd Location'];

        // For each BU, extract ordered top locations
        var buLocData = buList.map(function (bu) {
            var locs = bu.top_locations || {};
            var entries = Object.keys(locs).map(function (code) {
                return { code: code, count: locs[code] };
            });
            // already sorted descending by backend; take first 3
            return entries.slice(0, 3);
        });

        var rankDatasets = [0, 1, 2].map(function (rank) {
            return {
                label: rankLabels[rank],
                data: buLocData.map(function (entries) {
                    return entries[rank] ? entries[rank].count : 0;
                }),
                backgroundColor: rankColors[rank],
                borderWidth: 1
            };
        });

        window.yearlyLocationsChart = new Chart(locEl.getContext('2d'), {
            type: 'bar',
            data: { labels: buNames, datasets: rankDatasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                plugins: {
                    legend: { position: 'bottom' },
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                var rank = context.datasetIndex;
                                var buIdx = context.dataIndex;
                                var entry = buLocData[buIdx] && buLocData[buIdx][rank];
                                if (!entry || entry.count === 0) { return null; }
                                return rankLabels[rank] + ': ' + entry.code + ' (' + entry.count + ')';
                            }
                        }
                    }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }
}

