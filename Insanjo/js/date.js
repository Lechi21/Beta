    // Function to get the current date and format it
    function getCurrentDate() {
        var today = new Date();
    
        var day = today.getDate().toString().padStart(2, '0'); // Add leading zero if necessary
        var month = (today.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed, add leading zero if necessary
        var year = today.getFullYear();
    
        return `${day}-${month}-${year}`;
    }
    
    // Display the current date in the 'date' div
    document.getElementById('date').textContent = getCurrentDate();
    