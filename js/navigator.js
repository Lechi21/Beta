"use strict"

function goToPredictor() {
    // Navigate to index.html with a query parameter indicating to open Tab1
    window.location.href = 'index.html?openTab=Tab1';
}

// RETURNING SALES LINE

function ReturnItems() {
    var returnPage = document.getElementById('returning-sales');
    returnPage.style.display = 'block';
}

function closeReturn(){
    var returnPage = document.getElementById('returning-sales');
    returnPage.style.display = 'none';
    resetReturnSalesForm();
}

function closePopup() {
    var returnPage = document.getElementById('returning-sales');
    returnPage.style.display = 'none';
    resetReturnSalesForm();
}

function showNotification(message, type = 'info') {
    const notification = $("#notification");
    $("#notification-message").text(message);

    // Change notification style based on type
    if (type === 'success') {
        notification.css('background-color', 'green');
    } else if (type === 'warning') {
        notification.css('background-color', 'orange');
    } else if (type === 'error') {
        notification.css('background-color', 'red');
    } else {
        notification.css('background-color', 'blue');
    }

    // Set text color to white
    notification.css('color', '#ffffff');

    notification.fadeIn(300).delay(5000).fadeOut(300);
}

function resetReturnSalesForm() {
    $("#returnQuantity, #unitPrice, #totalPrice").val("");
    $("#txArea, #quantityError").text("");
    $("#soldItems").prop("selectedIndex", 0);
}