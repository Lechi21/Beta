"use strict";

    function openTab(evt, tabName) {
        var i, tabcontent, tablinks;
            tabcontent = document.getElementsByClassName("tabcontent");

        for (i = 0; i < tabcontent.length; i++) {
            tabcontent[i].style.display = "none";
        }
        tablinks = document.getElementsByClassName("tablinks");
        for (i = 0; i < tablinks.length; i++) {
            tablinks[i].className = tablinks[i].className.replace(" active", "");
        }
        
        document.getElementById(tabName).style.display = "block";
        evt.currentTarget.className += " active";
    }

    function goLeft() {
        var currentTab = document.querySelector('.tablinks.active');
        var prevTab = currentTab.previousElementSibling || document.querySelector('.tablinks:last-child');
    
        prevTab.click();
    }
    
    function goRight() {
        var currentTab = document.querySelector('.tablinks.active');
        var nextTab = currentTab.nextElementSibling || document.querySelector('.tablinks:first-child');
    
        nextTab.click();
    }
                
    // Get the element with id="defaultOpen" and click on it
        document.getElementById("defaultOpen").click();
    // swipe section for Tabs
    document.addEventListener('DOMContentLoaded', function () {
            var swipeContainer = document.querySelector('.swipe-container');
            var hammertime = new Hammer(swipeContainer);

            hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });

            hammertime.on('swiperight', function () {
                showPreviousTab();
            });

            hammertime.on('swipeleft', function () {
                showNextTab();
            });
        });
        function showNextTab() {
            var swipeContainer = document.querySelector('.swipe-container');
            var currentTab = document.querySelector('.tablinks.active');
            var nextTab = currentTab.nextElementSibling || document.querySelector('.tablinks:first-child');
        
            nextTab.click();
            scrollTabContainer(swipeContainer, nextTab);
        }
        
        function showPreviousTab() {
            var swipeContainer = document.querySelector('.swipe-container');
            var currentTab = document.querySelector('.tablinks.active');
            var prevTab = currentTab.previousElementSibling || document.querySelector('.tablinks:last-child');
        
            prevTab.click();
            scrollTabContainer(swipeContainer, prevTab);
        }

        function scrollTabContainer(container, tab) {
            var tabRect = tab.getBoundingClientRect();
            var containerRect = container.getBoundingClientRect();

            if (tabRect.right > containerRect.right) {
                container.scrollBy(tabRect.width, 0);
            } else if (tabRect.left < containerRect.left) {
                container.scrollBy(-tabRect.width, 0);
            }
        }