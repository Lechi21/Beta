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