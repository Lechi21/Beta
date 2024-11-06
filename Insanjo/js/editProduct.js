$(document).ready(function () {
    // Get the productId from the URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

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

    if (productId) {
        // Fetch the product details from the server using the product ID
        $.ajax({
            type: 'GET',
            url: `http://localhost:3000/product/${productId}`, // Server endpoint to fetch the product by ID
            success: function (response) {
                const product = response.product; // Assuming response.product contains the product details

                // Populate the page with product details
                $('#productCoverImage').attr('src', `${product.productImage}`);
                $('h1').text(product.name);
                $('#productId').text(product._id);
                $('#productName').val(product.name); // Populate form input fields

                // Set fields to handle missing or undefined data
                $('#productDescription').text(product.description || 'No description available');
                $('#availableStock').text(product.availableStock);
                $('#stockDate').text(product.stockDate ? formatDate(product.stockDate) : 'No stock date'); //custom format
                $('#purchasePrice').text(product.purchasePrice ? product.purchasePrice.toFixed(2) : '0.00');
                $('#sellingPrice').text(product.sellingPrice ? product.sellingPrice.toFixed(2) : '0.00');
            },
            error: function (error) {
                console.log('Error fetching product details:', error);
            }
        });
    } else {
        showNotification('No product ID found in the URL', 'error');

    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`; // Format: DD-MM-YYYY
    }

    // Attach click event handler for the edit button
    $('#editBtn').click(function () {
        const productId = $('#productId').text(); // Get the product ID from the populated field
        editForm(productId); // Call the edit form function with the product ID
    });

    // Handle form submission inside the modal
    $('#modalForm').on('submit', function (e) {
        e.preventDefault(); // Prevent default form submission behavior

        const productId = $('#productId').text().trim(); // Get and trim the product ID

        // Capture updated form data
        const updatedProduct = {
            name: $('#modalProductName').val(),
            description: $('#modalProductDescription').val(),
            availableStock: parseInt($('#modalAvailableStock').val(), 10),
            purchasePrice: $('#modalPurchasePrice').val(),
            sellingPrice: $('#modalSellingPrice').val()
        };

        // Use FormData to handle file upload along with other form data
        const formData = new FormData();
        Object.keys(updatedProduct).forEach(key => {
            formData.append(key, updatedProduct[key]); // Append all fields to FormData
        });

        // If there's an image being uploaded, append it to FormData
        const file = $('#productImageUrl')[0].files[0];
        if (file && (file.size > 1048576 || !['image/jpeg', 'image/png'].includes(file.type))) {
            showNotification('Please upload a valid image file (JPEG or PNG) under 1MB.', 'error');

            return;
        }
        formData.append('productImage', file);

        console.log('Form Data:', [...formData.entries()]); // Log form data contents

        // Compare the current available stock with the new one and update the stockDate if the stock has increased
        const previousStock = parseInt($('#availableStock').text(), 10); // Previous stock from product details
        const newStock = parseInt($('#modalAvailableStock').val(), 10); // New stock from the form input

        if (newStock > previousStock) {
            formData.append('stockDate', new Date().toISOString()); // Update stock date if the stock has increased
        }

        // Send PATCH request to update the product
        $.ajax({
            url: `http://localhost:3000/product/${productId}`, // Use productId correctly
            type: 'PATCH',
            data: formData,
            processData: false, // Required for FormData
            contentType: false, // Required for FormData
            success: function (response) {
                showNotification('Product updated successfully!', 'success');

                window.location.reload(); // Reload the page to reflect changes
            },
            error: function (error) {
                showNotification('Error updating product', 'error');
            }
        });
    });
});

function editForm(productId) {
    // Show the edit product modal
    $('#editProductModal').css('display', 'block');

    // Close the modal when the close button is clicked
    $('.close').click(function () {
        $('#modalForm')[0].reset();
        $('#productImageUrl').val('');
        $('#editProductModal').css('display', 'none');
    });
}

function deleteForm() {
    // Show the pop-up
    $('#deleteConfirmationPopup').css('display', 'flex');

    // Get the product ID
    const productId = $('#productId').text();
    // When the delete button in the pop-up is clicked
    $('#confirmDelete').off('click').on('click', function () {
        $.ajax({
            url: `http://localhost:3000/product/${productId}`,
            type: 'DELETE',
            success: function (response) {
                // Redirect to the products list or homepage
                window.location.href = 'inventory.html'; // Adjust the URL as needed
                showNotification('Product Successfully deleted', 'success');
            },
            error: function (error) {
                showNotification('Error deleting product', 'error');
                console.error('Delete Error:', error);
            }
        });
        // Hide the pop-up after deletion
        $('#deleteConfirmationPopup').css('display', 'none');
    });
    // When the cancel button in the pop-up is clicked
    $('#cancelDelete').on('click', function () {
        // Hide the pop-up
        $('#deleteConfirmationPopup').css('display', 'none');
    });
}
