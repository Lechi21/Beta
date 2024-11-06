
// ===========To TOGGLE THE RIGHT HAND MENU================================//
document.addEventListener('DOMContentLoaded', function () {
    const displayPic = document.querySelector('.displayPic.usersDetails');
    const details = document.querySelector('.details');

    displayPic.addEventListener('click', function (event) {
        details.classList.toggle('active');
        event.stopPropagation(); // Prevents the click event from propagating to document
    });

    // Close details when clicking outside of it
    document.addEventListener('click', function (event) {
        if (!details.contains(event.target) && !displayPic.contains(event.target)) {
            details.classList.remove('active');
        }
    });
});

//JavaScript to toggle popup visibility
function addMoreItems(){
    var SalesItem = document.getElementById('SalesItem');
    var overlay = document.querySelector('.formOverlay');
    SalesItem.style.display = 'block';
    overlay.style.display = 'block';

}

function closePopup(){
    var SalesItem = document.getElementById('SalesItem');
    var overlay = document.querySelector('.formOverlay');
    SalesItem.style.display = 'none';
    overlay.style.display = 'none';
}

//JavaScript to ensure popup opens and stays open on first click
document.addEventListener('DOMContentLoaded', function (){
    const SalesItem = document.getElementById('SalesItem');
    var overlay = document.querySelector('.formOverlay');
    const itemCloseButton = document.getElementById('itemClosed');

    itemCloseButton.addEventListener('click', function (){
        SalesItem.style.display = 'none';
        overlay.style.display = 'none';
    });
});

    // Function to get the current date and format it
    function getCurrentDate() {
        var today = new Date();

        var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        var monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        var dayOfWeek = daysOfWeek[today.getDay()];
        var day = today.getDate();
        var month = monthsOfYear[today.getMonth()];
        var year = today.getFullYear();

        // Get the correct suffix for the day
        var suffix = getDaySuffix(day);

        return dayOfWeek + " " + day + suffix + " " + month + " " + year;
    }

    function getDaySuffix(day) {
        if (day > 3 && day < 21) return "th"; // 4th to 20th are "th"
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }
    // Display the current date in the 'date' div
    document.getElementById('date').textContent = getCurrentDate();
