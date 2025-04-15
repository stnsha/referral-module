<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Referral</title>
    <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
</head>

<body>
    <div class="flex flex-col justify-center items-center mx-auto py-8 px-12 w-full">
        <div class="flex flex-col justify-start items-start w-full mb-2">
            <span class="text-lg font-bold mb-2">New Referral</span>
        </div>
        <form class="flex justify-center w-full grid grid-flow-col grid-rows-1 grid-cols-2 gap-4" action="">
            <div class="flex flex-col w-full border-1 border-slate-400 rounded-md p-4 row-span-10">
                <div class="flex flex-col w-full border-b-1 border-slate-400 pb-4">
                    <span class="text-sm font-medium mb-4">Referral Details</span>
                    <span class="font-normal text-sm mb-2">Referred From<span
                            class="pl-0.5 text-red-500">*</span></span>
                    <div class="flex flex-row grid grid-cols-3 gap-4 w-full mb-2">
                        <div class="flex w-full">
                            <select name="business_units" id="business_units"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                                <option value="">Business Unit</option>
                            </select>
                        </div>
                        <div class="flex w-full">
                            <select name="location" id="location"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                                <option value="">Location</option>
                            </select>
                        </div>
                        <div class="flex w-full">
                            <select name="" id=""
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                                <option value="">Assignee</option>
                            </select>
                        </div>
                    </div>
                    <span class="font-normal text-sm mb-2">Referred To<span class="pl-0.5 text-red-500">*</span></span>
                    <div class="flex flex-row grid grid-cols-3 gap-4 w-full">
                        <div class="flex w-full">
                            <select name="" id=""
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                                <option value="">Business Unit</option>

                            </select>
                        </div>
                        <div class="flex w-full">
                            <select name="" id=""
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">

                            </select>
                        </div>
                        <div class="flex w-full">
                            <select name="" id=""
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                                <option value="">Assignee</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col w-full border-b-1 border-slate-400 py-4">
                    <span class="text-sm font-medium mb-4">Referring Indication</span>
                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Reason of Referral<span
                                class="pl-0.5 text-red-500">*</span></span>
                        <textarea name="reason"
                            class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50"></textarea>
                    </div>
                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Details of Customer/Patient Condition<span
                                class="pl-0.5 text-red-500">*</span></span>
                        <textarea name="reason"
                            class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50"></textarea>
                    </div>
                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Relevant Medical History</span>
                        <textarea name="reason"
                            class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50"></textarea>
                    </div>
                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Priority<span class="pl-0.5 text-red-500">*</span></span>
                        <div class="flex flex-row">
                            <input type="checkbox" name="priority" class="border-0 border-slate-300 rounded-md">
                            <span class="font-normal text-sm ml-2">High (1 to 2 working days)</span>
                        </div>
                        <div class="flex flex-row">
                            <input type="checkbox" name="priority" class="border-0 border-slate-300 rounded-md">
                            <span class="font-normal text-sm ml-2">Standard (3 to 4 working days)</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-full border-1 border-slate-400 rounded-md p-4 col-span-2">
                <div class="flex flex-col w-full mb-2">
                    <span class="text-sm font-medium mb-4">Customer/Patient Information</span>
                    <div class="flex flex-col w-1/3 mb-2">
                        <span class="font-normal text-sm mb-2">I/C Number<span
                                class="pl-0.5 text-red-500">*</span></span>
                        <div class="flex flex-row mt-0.5 mb-2 w-full">
                            <input type="text"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50"
                                name="ic" id="icnoInput">
                            <button id="searchIcBtn" class="ml-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5 cursor-pointer">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                            </button>
                        </div>
                        <div class="flex flex-row mt-0.5 mb-2">
                            <input type="checkbox" name="new_cust" class="border-0 border-slate-300 rounded-md">
                            <span class="font-normal text-xs ml-2">New customer/patient?</span>
                        </div>
                    </div>

                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Customer/Patient Name<span
                                class="pl-0.5 text-red-500">*</span></span>
                        <input type="text" name="customer_name"
                            class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                    </div>
                    <div class="flex flex-row w-full mb-2">
                        <div class="flex flex-col w-1/2 mr-2">
                            <span class="font-normal text-sm mb-2">Email</span>
                            <input type="text" name="email"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                        </div>
                        <div class="flex flex-col w-1/2 ml-2">
                            <span class="font-normal text-sm mb-2">Phone</span>
                            <input type="text" name="phone"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                        </div>
                    </div>
                    <div class="flex flex-row w-full mb-2">
                        <div class="flex flex-col w-1/2 mr-2">
                            <span class="font-normal text-sm mb-2">Age</span>
                            <input type="text" name="age"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                        </div>
                        <div class="flex flex-col w-1/2 ml-2">
                            <span class="font-normal text-sm mb-2">Gender</span>
                            <input type="text" name="gender"
                                class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                        </div>
                    </div>
                    <div class="flex flex-col w-full mb-2">
                        <span class="font-normal text-sm mb-2">Address</span>
                        <input type="text" name="address"
                            class="font-normal text-sm px-2 py-1.5 border-0 border-slate-300 rounded-md w-full bg-slate-50">
                    </div>
                </div>
            </div>
            <div class="flex flex-col w-full border-1 border-slate-400 rounded-md p-4 col-span-2 row-span-2">
                <span class="text-sm font-medium mb-4">Attachments</span>
            </div>
        </form>
    </div>
</body>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
    $(document).ready(function() {
        $.ajax({
            url: 'backend.php?action=getLocations',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                var locationDropdown = $('#location');
                $.each(response, function(index, location) {
                    locationDropdown.append('<option value="' + location.id + '">' + location
                        .comp_name + '</option>');
                });
            },
            error: function() {
                alert('Error loading locations');
            }
        });

        $.ajax({
            url: 'backend.php?action=getBusinessUnits',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                var BusUnDropdown = $('#business_units');
                $.each(response, function(index, businessUnit) {
                    BusUnDropdown.append('<option value="' + businessUnit.id + '">' +
                        businessUnit.depart_name + '</option>');
                });
            },
            error: function() {
                alert('Error loading business units');
            }
        });

        var inputs = $(
            'input[name="customer_name"], input[name="email"], input[name="phone"], input[name="gender"], input[name="age"], input[name="address"]'
        );

        // Initially disable inputs
        inputs.prop('disabled', true);

        $('#searchIcBtn').click(function() {
            event.preventDefault();
            var icno = $('#icnoInput').val().trim();
            if (icno === '') {
                alert('Please enter an IC number');
                return;
            }

            $.ajax({
                type: 'POST',
                url: 'backend.php?action=searchCustomer',
                data: {
                    icno: icno
                },
                dataType: 'json',
                success: function(response) {
                    if (response.length === 0) {
                        alert('Customer not found');
                        return;
                    } else {
                        console.log(response);
                        var customer = response[0];
                        $('input[name="customer_name"]').val(customer.name ? customer.name :
                            '');
                        $('input[name="phone"]').val(customer.phone ? customer.phone : '');
                        $('input[name="gender"]').val(customer.gender ? customer.gender : '');
                        $('input[name="address"]').val(customer.address ? customer.address :
                            '');
                        $('input[name="ic"]').val(customer.ic);
                        if (customer.birth_date) {
                            var parts = customer.birth_date.split(
                                '-');
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

                            $('input[name="age"]').val(age);
                        } else {
                            $('input[name="age"]').val('');
                        }
                    }
                },
                error: function() {
                    alert('Error retrieving data');
                    return;
                }
            });
        });

        $('input[name="new_cust"]').change(function() {
            if ($(this).is(':checked')) {
                inputs.prop('disabled', false).val('');
            } else {
                inputs.prop('disabled', true).val('');
            }
        });
    });
</script>

</html>