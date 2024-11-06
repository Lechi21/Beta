// PREDICTIVE ANALYSIS BUTTONS

$(document).ready(function () {
    function toggleVisibility(btnId, messageId, listId) {
        const btn = $(btnId);
        const message = $(messageId);
        const list = $(listId);

        // Handle hover for desktop (mouseover and mouseout)
        btn.on('mouseover', () => {
            if (!isMobile()) {  // Check if not on mobile
                message.css('display', 'block');
                list.css('display', 'none');
            }
        });

        btn.on('mouseout', () => {
            if (!isMobile()) {  // Check if not on mobile
                message.css('display', 'none');
            }
        });

        // Handle click for both desktop and mobile (click and touchstart)
        btn.on('click', () => {
            if (list.css('display') === 'block') {
                list.css('display', 'none');
            } else {
                message.css('display', 'none');
                list.css('display', 'block');
            }
        });
    }

    // Helper function to check if the user is on a mobile device
    function isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    // Call the function for the "simpleBtn"
    toggleVisibility('#simpleBtn', '#simpleMessage', '#simpleList');
    toggleVisibility('#scenarioBtn', '#scenarioMessage', '#scenarioList');


    // Function to toggle the modal's visibility
    function showScenarioModal() {
        $('.ScenarioPop').css('display', 'block');
    }

    // Event listener for list items inside #scenarioList
    $('#scenarioList li').on('click', function () {
        showScenarioModal();  // Show the modal when any <li> in #scenarioList is clicked
    });

    // Function to close the modal
    function closeScenario() {
        $('.ScenarioPop').css('display', 'none');
    }

    // Event listener for the close button inside the modal
    $('#closeScene').on('click', function () {
        closeScenario();  // Close the modal when the close button is clicked
    });
});
