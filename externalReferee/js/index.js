//Submission validation
function validateForm(event) {
    event.preventDefault();
    var form = document.forms["externalRefereeForm"];

    function setErrorMessage(fieldName, message) {
        var errorElement = document.getElementById('error-' + fieldName);
        if (errorElement) {
            errorElement.innerHTML = message;
        }
    }

    var errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(function (element) {
        element.innerHTML = '';
    });

    function isEmpty(val) {
        return val === null || val.trim() === "";
    }

    function isEmail(val) {
        return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
    }

    var hasError = false;

    function markError(fieldName, condition, message) {
        if (condition) {
            setErrorMessage(fieldName, message);
            hasError = true;
        }
    }

    markError("name", isEmpty(form["name"].value), "This field cannot be left blank.");
    markError("organization", isEmpty(form["organization"].value), "This field cannot be left blank.");
    markError("position", isEmpty(form["position"].value), "This field cannot be left blank.");
    markError("specialty", isEmpty(form["specialty"].value), "This field cannot be left blank.");
    markError("phone", isEmpty(form["phone"].value), "This field cannot be left blank.");
    var email = form["email"].value;
    markError("email", isEmpty(email) || !isEmail(email), "Please enter a valid email address.");
    markError("address", isEmpty(form["address"].value), "This field cannot be left blank.");

    if (!hasError) {
        $(this).find(':input').each(function () {
            if ($(this).is(':hidden')) {
                $(this).prop('required', false);
            }
        });

        const formData = new FormData(form);

        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                console.log(`${key}:`, {
                    name: value.name,
                    size: value.size + ' bytes',
                    type: value.type,
                });
            } else {
                console.log(`${key}: ${value}`);
            }
        }

        fetch('referral/externalReferee/post.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.text())
            .then(data => {
                const parsed = JSON.parse(data);
                const inner = JSON.parse(parsed.response);
                console.log('ID:', inner.id);
                console.log('HTTP Code:', parsed.httpCode);

                const successCode = parsed.httpCode;

                if (successCode === 200 || successCode === 201) {
                    window.location.href = 'referral/externalReferee/index.php';
                } else {
                    console.log('Failed:', inner.message);
                }

            })
            .catch(error => {
                logError(new Error('Form submission error'), { context: 'validateForm', error: error.message });
            });

    }
}