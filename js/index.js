$(document).ready(function () {
    $('#myTable').DataTable({
        ajax: {
            url: 'api.php',
            type: 'POST',
            data: { action: 'all-referral' },
            dataSrc: function (json) {
                // console.log('Raw response:', json);
                if (!json || typeof json !== 'object' || !json.data) {
                    return [];
                }
                console.log(json.data);
                return json.data;
            }
        },
        columns: [
            { data: 'ref_id' },
            { data: 'reason' },
            { data: 'business_unit' },
            { data: 'status' },
            {
                data: null,
                orderable: false,
                searchable: false,
                render: function (data, type, row) {
                    return `<a class="view-btn" type="button" data-id="${row.id}" href="view.php?id=${row.id}">View</a>`;
                }
            }
        ]
    });
});