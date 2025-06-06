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
            console.log(response.data.referringIndication);

            var assigneeFrom = $('#assignee_from');
            var business_unit_from = $('#business_unit_from');
            var location_from = $('#location_from');

            assigneeFrom.val('');
            business_unit_from.val('');
            location_from.val('');

            var recipientTo = $('#recipient_to');
            var business_unit_to = $('#business_unit_to');
            var location_to = $('#location_to');

            recipientTo.val('');
            business_unit_to.val('');
            location_to.val('');

            response.data.referralDetails.forEach(function (item) {
                getStaff(item.staff_id, item.location, function (staffInfo) {
                    if (item.sequence == 1) {
                        assigneeFrom.val(staffInfo[0].nama_staff);
                        business_unit_from.val(staffInfo[0].department);
                        location_from.val(staffInfo[0].location);
                    } else {
                        recipientTo.val(staffInfo[0].nama_staff);
                        business_unit_to.val(staffInfo[0].department);
                        location_to.val(staffInfo[0].location);
                    }
                });
            })

            var referringIndication = response.data.referringIndication;

            var referral_reason = $('#referral_reason');
            var referral_condition = $('#referral_condition');
            var medical_history = $('#medical_history');

            referral_reason.val('');
            referral_condition.val('');
            medical_history.val('');

            referral_reason.val(referringIndication.referral_reason);
            referral_condition.val(referringIndication.referral_condition);
            medical_history.val(referringIndication.medical_history);
            $('input[name="priority"]').on('click', function (e) {
                e.preventDefault();
            });
            $('input[name="priority"][value="' + referringIndication.priority + '"]').prop('checked', true);

            var custid = referringIndication.customer_id;

            var customer_id = $('#customer_id');
            var customer_ic = $('#customer_ic');

            var customer_name = $('#customer_name');
            var customer_phone = $('#customer_phone');
            var customer_email = $('#customer_email');
            var customer_age = $('#customer_age');
            var customer_gender = $('#customer_gender');
            var customer_address = $('#customer_address');

            customer_id.val('');
            customer_ic.val('');
            customer_name.val('');
            customer_phone.val('');
            customer_email.val('');
            customer_age.val('');
            customer_gender.val('');
            customer_address.val('');


            getCustomer(custid, function (customer) {
                customer_id.val(customer[0].id);
                customer_ic.val(customer[0].ic);
                customer_name.val(customer[0].name);
                customer_phone.val(customer[0].phone);
                customer_email.val(customer[0].email);

                if (customer[0].birth_date) {
                    var parts = customer[0].birth_date.split('-');
                    var birthYear = parseInt(parts[0], 10);
                    var birthMonth = parseInt(parts[1], 10);
                    var birthDay = parseInt(parts[2], 10);

                    var today = new Date();
                    var age = today.getFullYear() - birthYear;
                    if (
                        today.getMonth() + 1 < birthMonth ||
                        (today.getMonth() + 1 === birthMonth && today.getDate() <
                            birthDay)
                    ) {
                        age--;
                    }
                    customer_age.val(age);
                }

                customer_gender.val(customer[0].gender);
                customer_address.val(customer[0].address);
            });

        },
        error: function () {
            console.log("Failed to fetch referral details.");
        }
    });

    function getStaff(staff_id, location, callback) {
        $.ajax({
            url: 'backend.php',
            method: 'GET',
            data: {
                staff_id: staff_id,
                location: location,
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

    function getCustomer(custid, callback) {
        $.ajax({
            url: 'backend.php?action=searchCustomer',
            method: 'POST',
            data: {
                customer_id: custid,
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
