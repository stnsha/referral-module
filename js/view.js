$(document).ready(function () {
    console.log(referral_id);

    $.ajax({
        url: 'api.php',
        type: 'POST',
        dataType: 'json',
        data: JSON.stringify({
            action: 'get-referral',
            referral_id: referral_id
        }),
        success: function (response) {
            console.log(response.data);

            var assigneeFrom = $('#assignee_from');
            assigneeFrom.val('');

            var recipientTo = $('#recipient_to');
            recipientTo.val('');

            response.data.referralDetails.forEach(function (item) {
                getStaff(item.staff_id, function (staff_name) {
                    if (item.sequence == 1) {
                        assigneeFrom.val(staff_name);
                    } else {
                        recipientTo.val(staff_name);
                    }
                });
            });
        },
        error: function () {
            console.log("Failed to fetch referral details.");
        }
    });

    function getStaff(staff_id, callback) {
        $.ajax({
            url: 'backend.php',
            method: 'GET',
            data: {
                staff_id: staff_id,
                action: 'getStaff'
            },
            dataType: 'json',
            success: function (response) {
                callback(response);
            },
            error: function () {
                callback("Unknown");
            }
        });
    }
});
