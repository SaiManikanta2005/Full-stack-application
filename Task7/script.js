const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const messageInput = document.getElementById('message');
const submitBtn = document.getElementById('submitBtn');

const nameError = document.getElementById('nameError');
const emailError = document.getElementById('emailError');
const messageError = document.getElementById('messageError');

function validateName() {
    if (nameInput.value.trim().length < 3) {
        nameError.textContent = "Name must be at least 3 characters";
        return false;
    }
    nameError.textContent = "";
    return true;
}

function validateEmail() {
    const pattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
    if (!pattern.test(emailInput.value.trim())) {
        emailError.textContent = "Enter a valid email";
        return false;
    }
    emailError.textContent = "";
    return true;
}

function validateMessage() {
    if (messageInput.value.trim().length < 5) {
        messageError.textContent = "Message must be at least 5 characters";
        return false;
    }
    messageError.textContent = "";
    return true;
}

nameInput.addEventListener('keyup', validateName);
emailInput.addEventListener('keyup', validateEmail);
messageInput.addEventListener('keyup', validateMessage);

submitBtn.addEventListener('dblclick', function () {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isMessageValid = validateMessage();

    if (isNameValid && isEmailValid && isMessageValid) {
        alert("Feedback submitted successfully!");
        document.getElementById('feedbackForm').reset();
    } else {
        alert("Please correct the errors before submitting.");
    }
});