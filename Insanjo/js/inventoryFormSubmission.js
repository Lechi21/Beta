$(document).ready(function () {
    // Set the current date in the designated element
    $('#date').text(getCurrentDate());

    let currentPage = 1; // Track the current page of products
    const limit = 7; // Number of products to display per page
    let totalItems = 0; // Total number of products available
    let allItems = []; // Array to hold all products

    // Function to format a date string to DD-MM-YYYY
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
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

    // Function to load products with pagination
    function loadProducts() {
        const skip = (currentPage - 1) * limit; // Calculate how many items to skip based on the current page

        // AJAX request to fetch products from the server
        $.ajax({
            type: 'GET',
            url: `http://localhost:3000/product?skip=${skip}&limit=${limit}`,
            success: function (response) {
                totalItems = response.totalCount; // Set the total items from response
                allItems = response.products; // Store the fetched products

                displayProducts(allItems); // Display the products in the table
                setupPagination(totalItems); // Set up pagination controls
            },
            error: function (error) {
                console.log('Error fetching products:', error); // Log any error during the fetch
            }
        });
    }

    // Function to display products in the inventory table
    function displayProducts(products) {
        $('#inventory-list').empty(); // Clear the current product list

        products.forEach(product => {
            const formattedStockDate = product.stockDate ? formatDate(product.stockDate) : 'No stock date';

            const rowHtml = `
                <tr data-id="${product._id}">
                    <td><img src="${product.productImage}" class="item-table-image" width="50"></td>
                    <td class="item-name-column">
                        <strong>${product.name}</strong><div class="item-table-id">${product._id}</div>
                    </td>
                    <td class="description-column">${product.description}</td>
                    <td>${product.availableStock}</td>
                    <td>${formattedStockDate}</td>
                    <td>${product.purchasePrice}</td>
                    <td>${product.sellingPrice}</td>
                </tr>`;
            
            $('#inventory-list').append(rowHtml);
        });

        // Add click event to redirect to the edit page for the clicked product
        $('#inventory-list tr').off('click').on('click', function() {
            window.location.href = `editProduct.html?id=${$(this).data('id')}`;
        });
    }

    // Function to set up pagination controls
    function setupPagination(totalCount) {
        const totalPages = Math.ceil(totalCount / limit);
        $('#pagination').empty(); // Clear current pagination

        if (currentPage > 1) {
            $('#pagination').append(`<button class="pagination-button" data-page="${currentPage - 1}">Previous</button>`);
        }

        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`<button class="pagination-button ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`);
        }

        if (currentPage < totalPages) {
            $('#pagination').append(`<button class="pagination-button" data-page="${currentPage + 1}">Next</button>`);
        }

        $('.pagination-button').off('click').on('click', function () {
            const page = parseInt($(this).data('page'));
            if (page !== currentPage) {
                currentPage = page;
                loadProducts();
            }
        });
    }

    // Event listener for search input
    $('#search-input').on('input', function () {
        const searchInput = $(this).val().toLowerCase(); // Get the search input

        // AJAX request to search products from the server
        $.ajax({
            type: 'GET',
            url: `http://localhost:3000/product/search?search=${searchInput}`,
            success: function (response) {
                allItems = response.products; // Store the fetched products
                displayProducts(allItems); // Display the products in the table
                setupPagination(allItems.length); // Set up pagination based on the filtered items
            },
            error: function (error) {
                console.log('Error fetching products:', error); // Log any error during the fetch
            }
        });
    });

    // Form submission event for adding new products
    $('#itemPage, #itemPage2').off('submit').on('submit', function (e) {
        e.preventDefault(); // Prevent default form submission

        const formId = $(this).attr('id');
        const formData = new FormData(this);
        const currentDate = $('#date').text();
        const dateParts = currentDate.split('-');
        const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        formData.append('stockDate', formattedDate);

        // Send Data to the Server
        $.ajax({
            type: 'POST',
            url: 'http://localhost:3000/product',
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                console.log("Item added:", response);
                showNotification(`Item Successfully Added!`, `success`)
                loadProducts(); // Reload products to show the new one
                if (formId === 'itemPage') {
                    $(`#${formId}`).hide();
                    $('.formOverlay').hide();
                } else {
                    window.location.href = 'inventory.html';
                }
                $('#' + formId)[0].reset(); // Reset the form fields
                $('#date').text(getCurrentDate());
            },
            error: function (error) {
                showNotification('Error adding item', 'error');
                console.log(error);
            }
        });
    });

    loadProducts(); // Initial call to load products when the page is ready
});