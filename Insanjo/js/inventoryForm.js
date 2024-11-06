function togglePopup(){
    var screenWidth = window.innerWidth;
    var tabletView = 1200;
    var mobileView = 768;

    if (screenWidth >= 768){
        return toggleButton();
    } else if (screenWidth === 1200){
        return toggleButton();
    }
    else if (screenWidth <= 768){
        return window.location.replace('inventory2.html');
    }
};

//JavaScript to toggle popup visibility
function toggleButton(){
    var itemPage = document.getElementById('itemPage');
    var overlay = document.querySelector('.formOverlay');
    itemPage.style.display = 'block';
    overlay.style.display = 'block';
}

//JavaScript to ensure popup opens and stays open on first click
document.addEventListener('DOMContentLoaded', function (){
    const addProductButton = document.getElementById('add');
    const itemPage = document.getElementById('itemPage');
    var overlay = document.querySelector('.formOverlay');
    const itemCloseButton = document.getElementById('itemClose');

    addProductButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        itemPage.style.display = 'block';
        // overlay.style.display = 'block';
    });

    itemCloseButton.addEventListener('click', function (){
        itemPage.style.display = 'none';
        overlay.style.display = 'none';
    });
});