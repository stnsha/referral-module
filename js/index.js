
document.addEventListener('DOMContentLoaded', function () {
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

    // Load referral data into  table
    if (document.getElementById('referral-tbl')) {
        let allData = [];
        let currentPage = 1;
        const itemsPerPage = 15;

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
                    <td style="font-size:14px;width: 40%;text-align:start;">${row.reason}</td>
                    <td style="font-size:14px;width: 15%;text-align:start;">${row.business_unit}</td>
                    <td style="font-size:14px;width: 10%;text-align:start;">
                        <span class="bdg-${row.status.toLowerCase()}">${row.status}</span>
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

        $.ajax({
            url: 'api.php',
            type: 'POST',
            data: { action: 'all-referral' },
            success: function (response) {
                if (!response || typeof response !== 'object' || !response.data) {
                    console.error('Invalid response format');
                    return;
                }
                console.log(response.data);

                const tableBody = document.querySelector('#referral-tbl tbody');
                if (!tableBody) {
                    // Create tbody if it doesn't exist
                    const tbody = document.createElement('tbody');
                    document.getElementById('referral-tbl').appendChild(tbody);
                }

                allData = response.data;
                currentPage = 1;
                displayPage(currentPage);

                // Add filter functionality for referral ID
                const filterInput = document.getElementById('filter-referral-id');
                if (filterInput) {
                    filterInput.addEventListener('input', function() {
                        applyFilters();
                    });
                }

                // Add filter functionality for business unit
                const businessUnitFilter = document.getElementById('filter-business-unit');
                if (businessUnitFilter) {
                    businessUnitFilter.addEventListener('change', function() {
                        applyFilters();
                    });
                }

                // Combined filter function
                function applyFilters() {
                    const referralId = document.getElementById('filter-referral-id').value.trim().toLowerCase();
                    const selectedBusinessUnit = document.getElementById('filter-business-unit').value;
                    
                    let filteredData = response.data;
                    
                    // Filter by referral ID
                    if (referralId !== '') {
                        filteredData = filteredData.filter(function(row) {
                            return row.ref_id.toLowerCase().includes(referralId);
                        });
                    }
                    
                    // Filter by business unit
                    if (selectedBusinessUnit !== '' && selectedBusinessUnit !== 'all') {
                        filteredData = filteredData.filter(function(row) {
                            return row.business_unit.toLowerCase() === selectedBusinessUnit.toLowerCase();
                        });
                    }
                    
                    allData = filteredData;
                    currentPage = 1;
                    displayPage(currentPage);
                }
            },
            error: function (xhr, status, error) {
                console.error('Error loading referral data:', error);
            }
        });
    } else {
        console.error('Referral table element not found');
    }

    // Handle generate report toggle
    const generateReportBtn = document.getElementById('generateReportBtn');
    const generateReportSelect = document.getElementById('generate-report');

    generateReportBtn.addEventListener('click', function () {
        const isVisible = generateReportSelect.style.display !== 'none';
        generateReportSelect.style.display = isVisible ? 'none' : 'block';
        this.textContent = isVisible ? 'Generate Report' : 'Hide Options';
    });

    document.getElementById('report-parameter').addEventListener('change', function () {
        window.location.href = `report.php?period=${this.value}`;
    });

    //chart
    const xValues = ["Pharmacy", "Clinic", "Optisaver", "Baby", "Physio", "Sugi", "Audiology"];
    const yValues = [55, 49, 44, 24, 15, 24, 15];
    const barColors = ["#1e4384", "#17b2a6", "#194621", "#19b8d3", "#21a2dc", "orange", "#204296"];

    new Chart("myChart", {
        type: "bar",
        data: {
            labels: xValues,
            datasets: [{
                backgroundColor: barColors,
                data: yValues
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Business Unit'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Total Referral'
                    },
                    ticks: {
                        beginAtZero: true
                    }
                }]
            },
            title: {
                display: false,
                text: "World Wine Production 2018"
            }
        }
    });
});


