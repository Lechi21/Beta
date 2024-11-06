"use strict";

// Dark Mode Section
document.addEventListener('DOMContentLoaded', function () {
    const darkMode = document.querySelector('.dark-mode');

    // Function to set dark mode based on user preference
    function setDarkModePreference() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        
        // Set dark mode class based on user preference
        document.documentElement.classList.toggle('dark-mode-variables', isDarkMode);
        
        // Update the dark mode button state
        darkMode.querySelector('span:nth-child(1)').classList.toggle('active', isDarkMode);
        darkMode.querySelector('span:nth-child(2)').classList.toggle('active', !isDarkMode);
    }

    // Toggle dark mode function
    function toggleDarkMode() {
        const isCurrentlyDarkMode = document.documentElement.classList.contains('dark-mode-variables');

        // Toggle the class and update the preference in localStorage
        document.documentElement.classList.toggle('dark-mode-variables', !isCurrentlyDarkMode);
        darkMode.querySelector('span:nth-child(1)').classList.toggle('active', !isCurrentlyDarkMode);
        darkMode.querySelector('span:nth-child(2)').classList.toggle('active', isCurrentlyDarkMode);

        localStorage.setItem('darkMode', !isCurrentlyDarkMode);
    }

    // Set dark mode based on user preference on page load
    setDarkModePreference();

    // Attach the toggleDarkMode function to the dark mode button
    darkMode.addEventListener('click', toggleDarkMode);
});


//FUNCTION TO SHOW AND HIDE THE MENU

$(document).ready(function() {
    $(".showBar").click(function() {
        $(".innerNav").slideToggle(100).toggleClass("activity");
        $(".hideBar").show();
        $(".showBar").hide();
    });

    $(".hideBar").click(function() {
        $(".innerNav").slideToggle(100).toggleClass("activity");
        $(".hideBar").hide();
        $(".showBar").show();
    });

    $(".Predictor").click(function() {
        $(".innerNav").slideToggle(100).toggleClass("activity");
        $(".hideBar").hide();
    });
});