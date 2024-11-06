// INITIALIZATION AND EVENT SETUPS STARTS HERE

$(document).ready(function () {
    // Initialize Select2 and event listeners only once
    initializeDropdown();
    fetchInventoryData(); // Fetch and display inventory data
    fetchAllSalesData(); // Fetch both sales and return sales data on load
    attachSubmitSaleListener();
});

function initializeDropdown() {
    const $itemDropdown = $('#itemDropdown').select2({
        placeholder: 'Search for items...',
        allowClear: true,
        width: '100%',
        templateResult: formatOption, 
        templateSelection: formatOption,
    });

    // Attach event listener for searching
    $itemDropdown.on('select2:open', function () {
        const searchInput = $('.select2-search__field'); // Select2 search input
        searchInput.on('input', function () {
            const searchTerm = $(this).val().toLowerCase();

            // Make AJAX request to fetch filtered products
            $.ajax({
                url: `http://localhost:3000/product/search?search=${searchTerm}`,
                method: "GET",
                success: function (data) {
                    populateDropdown(data.products); // Update dropdown with filtered products
                },
                error: function (error) {
                    console.error("Failed to fetch inventory data.", error);
                }
            });
        });
    });

    // Attach change event listener for updating unit price when an item is selected
    $itemDropdown.change(function () {
        const selectedOption = $(this).find("option:selected");
        const unitPriceInput = $("input[name='unitPrice']");

        // Set unit price from the selected item's selling price
        const selectedPrice = parseFloat(selectedOption.data("price"));
        unitPriceInput.val(selectedPrice.toFixed(2));

        // Calculate total price if quantity is already entered
        calculateTotalPrice();
    }); 

    // Attach other event listeners
    attachEventListeners();
}

function attachEventListeners() {
    const $itemDropdown = $("#itemDropdown");
    const $quantityInput = $("input[name='quantity']");
    const $expensesInput = $("input[name='expenses']");
    const $discountInput = $("input[name='discount']");

    // Event listener to update unit price when an item is selected
    $itemDropdown.change(function () {
        const selectedOption = $(this).find("option:selected");
        const unitPriceInput = $("input[name='unitPrice']");

        // Set unit price from the selected item's selling price
        const selectedPrice = parseFloat(selectedOption.data("price"));
        unitPriceInput.val(selectedPrice.toFixed(2));

        // Calculate total price if quantity is already entered
        calculateTotalPrice();
    });
    // Event listener to calculate total price when quantity or expenses are entered/changed
    $quantityInput.on("input", calculateTotalPrice);
    $expensesInput.on("input", calculateTotalPrice);
    $discountInput.on("input", calculateTotalPrice);
}

function attachSubmitSaleListener() {
    $("#submitSaleForm").on("submit", function (e) {
        e.preventDefault();
        const saleData = { items: cartItems };
        addSales(saleData);
    });
}

// INITIALIZATION AND EVENT SETUPS ENDS HERE

let cartItems = []; // Declare cartItems in the global scope
let currentPage = 1;
const rowsPerPage = 5; // Number of rows per page

// Custom format function
function formatOption(item) {
    // If the item has no id, return the item as plain text (used for placeholders)
    if (!item.id) {
        return item.text;
    }

    const $option = $(
        `<span class="hover-option">
            ${item.text}
        </span>`
    );

    return $option; // Return the jQuery object
}

// DATA FETCHING AND SETUP STARTS HERE

function fetchInventoryData() {
    // Fetch inventory data from the backend
    $.ajax({
        url: "http://localhost:3000/product", // Ensure this is your actual endpoint
        method: "GET",
        success: function (data) {
            console.log('Inventory data:', data);
            populateDropdown(data.products); // Assuming the response contains an array of products
        },
        error: function (error) {
            console.error("Failed to fetch inventory data. Please try again later.", error);
        }
    });
}

function populateDropdown(products) {
    const $itemDropdown = $("#itemDropdown");

    // Clear existing options
    $itemDropdown.empty().append('<option></option>');

    // Populate dropdown with product names
    products.forEach(product => {
        const option = $("<option>", {
            value: product._id, // Use product ID as value
            text: product.name, // Display product name
            "data-price": product.sellingPrice, // Attach price as a data attribute for later use
            "data-stock": product.availableStock // Store available stock
        });
        $itemDropdown.append(option);
    });

    // Event listener to update unit price when an item is selected
    $itemDropdown.change(function () {
        const selectedOption = $(this).find("option:selected");
        const unitPriceInput = $("input[name='unitPrice']");
        const quantityInput = $("input[name='quantity']");
        const totalPriceInput = $("input[name='totalPrice']");

        // Set unit price from the selected item's selling price
        const selectedPrice = parseFloat(selectedOption.data("price"));
        unitPriceInput.val(selectedPrice.toFixed(2));

        // Calculate total price if quantity is already entered
        calculateTotalPrice();
    });

    // Event listeners for quantity and expenses changes
    const $quantityInput = $("input[name='quantity']");
    const $expensesInput = $("input[name='expenses']");

    // Event listener to calculate total price when quantity is entered or changed
    $quantityInput.on("input", calculateTotalPrice);
    $expensesInput.on("input", calculateTotalPrice);
}

// Fetch and Populate Sales and Return Sales Data
async function fetchAllSalesData() {
    try {
        const salesResponse = await $.ajax({ 
            url: `http://localhost:3000/sales`, 
            type: 'GET', 
            dataType: 'json' 
        });
        const returnSalesResponse = await $.ajax({ 
            url: `http://localhost:3000/returnSales`, 
            type: 'GET', 
            dataType: 'json' 
        });

        const allSalesData = [...salesResponse.sales, ...returnSalesResponse.returns];
        allSalesData.sort((a, b) => new Date(b.saleDate || b.returnDate) - new Date(a.saleDate || a.returnDate));

        // Check if salesResponse and returnSalesResponse have data
        if (salesResponse.sales && salesResponse.sales.length > 0) {
            populateSalesTable(allSalesData);
            // Show pagination if there are sales data
            $(".pagination-controls").show();
        } else {
            $(".pagination-controls").hide();
        }
    } catch (error) {
        console.error('Error fetching sales data:', error);
    }
}

// Fetch all sales on a particular date and populate sold items dropdown
async function fetchSalesByDate() {
    const saleDate = document.getElementById('saleDate').value;
    if (!saleDate) return;

    try {
        const response = await fetch(`http://localhost:3000/sales?date=${saleDate}`);
        const data = await response.json();

        if (response.ok && data.sales) {
            const soldItemsSelect = document.getElementById('soldItems');
            soldItemsSelect.innerHTML = '<option value="">Select Item</option>'; // Clear existing options

            const unavailableItems = []; // Array to collect names of unavailable items

            data.sales.forEach(sale => {
                sale.items.forEach(item => {
                    if (!item.productId) {
                        console.error('Product is undefined for item:', item);
                        unavailableItems.push(item.name); // Add the item name to unavailableItems array
                        return; // Skip this item if productId is undefined
                    }
                    const option = document.createElement('option');
                    option.value = item.productId._id.toString(); // Access the correct product ID
                    option.textContent = `${item.name}`;
                    option.dataset.unitPrice = item.price; // Store unit price
                    option.dataset.quantity = item.quantity; // Store the sold quantity for validation
                    option.dataset.saleId = sale._id; // Store sale ID for later use
                    soldItemsSelect.appendChild(option);
                });
            });

            // If there are unavailable items, display their names in a single notification
            if (unavailableItems.length > 0) {
                showNotification(`Item "${unavailableItems.join(', ')}" is not available in Inventory!`, `warning`);
            }
        } else {
            showNotification("No sales found for the selected date.", "error");
        }
    } catch (error) {
        console.error("Error fetching sales:", error);
    }
}

function populateSalesTable(salesData) {
    const $tableBody = $("#salesTableBody");
    $tableBody.empty();

    salesData.forEach(sale => {
        const isReturn = sale.returnDate !== undefined;

        let name = '';
        let quantity = 0;
        let amount = 0;

        if (isReturn && sale.product && sale.product.name) {
            name = sale.product.name;
            quantity = sale.quantity;
            amount = sale.totalAmount || 0;
        } else if (!isReturn && Array.isArray(sale.items)) {
            name = sale.items.map(item => item.name || 'Unnamed Item').join(', ');
            quantity = sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
            amount = sale.items.reduce((sum, item) => sum + (item.totalAmount || 0), 0);
        } else {
            return; // Skip this sale entry if necessary data is missing
        }

        const newRow = `
            <tr class="${isReturn ? 'return-sale' : 'normal-sale'}" data-id="${sale._id}">
                <td></td>
                <td>${name}</td>
                <td>${quantity}</td>
                <td>${amount.toFixed(2)}</td>
            </tr>
        `;
        $tableBody.append(newRow);
    });

    updateSerialNumbers();
    initializePagination(); // Reset pagination after new data is populated

    // Add click event to the rows
    $tableBody.on("click", "tr", function () {
        const saleId = $(this).data("id");
        if (saleId) {
            // Check the row class to determine the redirection
            if ($(this).hasClass("return-sale")) {
                window.location.href = `itemPreviewReturn.html?id=${encodeURIComponent(saleId)}`;
            } else {
                window.location.href = `itemPreview.html?id=${encodeURIComponent(saleId)}`;
            }
        }
    });
}
// DATA FETCHING AND SETUP ENDS HERE

// CART AND SALES OPERATIONS STARTS HERE

function addForm(event) {
    event.preventDefault();

    const selectedOption = $("#itemDropdown option:selected");
    const productId = selectedOption.val();
    const itemName = selectedOption.text();
    const quantity = parseFloat($("input[name='quantity']").val());
    const unitPrice = parseFloat($("input[name='unitPrice']").val());
    const expenses = parseFloat($("input[name='expenses']").val()) || 0;
    const totalPrice = parseFloat($("input[name='totalPrice']").val());
    const note = $("#txArea").val().trim();

    if (!productId || isNaN(quantity) || quantity <= 0 || isNaN(unitPrice) || isNaN(totalPrice)) {
        showNotification("Please enter valid values for all required fields.", 'error');
        return false;
    }

    const newItem = {
        productId: productId,
        name: itemName,
        quantity: quantity,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
        expenses: expenses,
        note: note
    };

    cartItems.push(newItem);
    updateStockAfterAdd(selectedOption, quantity);
    displayPreviewItem(newItem);
    
    // Show cue notification for successful addition
    showNotification(`${itemName} added to cart!`, 'success'); 

    updateCartTotal();
    resetForm();
    closePopup();
}

function updateCartTotal() {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
    $("#cartTotalAmount").text(totalAmount.toFixed(2));
}

function updateStockAfterAdd(option, quantity) {
    let availableStock = parseInt(option.data("stock"));
    availableStock -= quantity;

    // Update stock in the option's data
    option.data("stock", availableStock);
    
    // Show cue if the item stock is running low
    if (availableStock <= 5 && availableStock > 0) {
        showNotification(`Warning: Only ${availableStock} items left in stock!`, 'warning');
    } else if (availableStock <= 0) {
        option.prop('disabled', true);
        showNotification(`Out of stock: ${option.text()} is no longer available.`, 'error');
    }
}

function displayPreviewItem(item) {
    let existingItem = $(".preview-container").find(`[data-product-id="${item.productId}"]`);

    if (existingItem.length > 0) {
        // If the item already exists, update its quantity and price
        let quantityElement = existingItem.find(".price-quantity p").eq(1);
        let totalElement = existingItem.find(".tos");

        let currentQuantity = parseInt(quantityElement.text().split(" ")[0]);
        let newQuantity = currentQuantity + item.quantity;
        quantityElement.text(`${newQuantity} Pieces`);

        let currentTotal = parseFloat(totalElement.text().split(": ")[1]);
        let newTotal = currentTotal + item.totalPrice;
        totalElement.text(`Total: ${newTotal.toFixed(2)}`);
    } else {
        // Otherwise, add a new preview item
        const itemHtml = `
            <div class="preview-item" data-product-id="${item.productId}">
                <div class="checker">
                    <div class="name-note">
                        <h4>${item.name}</h4>
                        <p class="note-text">${item.note ? item.note : "No notes added"}</p>
                    </div>
                    <div class="price-quantity">
                        <p class="tos">Total: ${item.totalPrice.toFixed(2)}</p>
                        <p>${item.quantity} Pieces</p>
                    </div>
                </div>
                <div class="edit-delete-buttons">
                    <button class="delete-item" onclick="deleteItem(this, '${item.productId}')">Remove</button>
                </div>
            </div>
        `;
        $(".preview-container").prepend(itemHtml);
    }
}

function deleteItem(button, productId) {
    const itemName = $(button).closest(".preview-item").find(".name-note h4").text(); // Get item name for notification
    $(button).closest(".preview-item").remove(); // Remove item from DOM

    // Remove the item from cartItems array
    cartItems = cartItems.filter(item => item.productId !== productId);

    // Show notification for item removal
    showNotification(`${itemName} removed from cart.`);
}

function closeSales(productId) {
    $(".preview-container").empty();
    $("#cartTotalAmount").empty();
    cartItems = [];
    // Remove the item from cartItems array
    cartItems = cartItems.filter(item => item.productId !== productId);
}

// CART AND SALES OPERATIONS ENDS HERE

// PRICE CALCULATION AND VALIDATION STARTS HERE

function calculateTotalPrice() {
    const $itemDropdown = $("#itemDropdown");
    const selectedOption = $itemDropdown.find("option:selected");
    const unitPrice = parseFloat(selectedOption.data("price")); // Get unit price
    const availableStock = parseInt(selectedOption.data("stock")); // Get available stock
    const $quantityInput = $("input[name='quantity']");
    const $expensesInput = $("input[name='expenses']");
    const $discountInput = $("input[name='discount']"); // Discount input field
    const $totalPriceInput = $("input[name='totalPrice']");
    const $discountDisplay = $("#discountDisplay"); // Span to display discount percentage

    const quantity = parseFloat($quantityInput.val()) || 0; // Get quantity, default to 0 if empty
    const expenses = parseFloat($expensesInput.val()) || 0; // Get expenses, default to 0 if empty
    const discount = parseFloat($discountInput.val()) || 0; // Get discount, default to 0 if empty

    // Validate quantity against available stock
    if (quantity > availableStock) {
        showNotification(`You cannot enter a quantity greater than the available stock (${availableStock}).`, 'warning');
        $quantityInput.val(availableStock); // Optionally set quantity to available stock
        return; // Exit the function if quantity is invalid
    }
    // Ensure the selected item, quantity, and optional expenses are valid numbers
    if (!isNaN(unitPrice) && !isNaN(quantity) && quantity > 0) {
        let basePrice = unitPrice * quantity;  // Base price (Q * P)
        let totalBeforeDiscount = basePrice + expenses;

        // Subtract discount from total
        let totalPrice = totalBeforeDiscount - discount;

        // Calculate discount percentage (discount / basePrice * 100)
        let discountPercentage = (discount / basePrice) * 100;

        // Update the total price input field
        $totalPriceInput.val(totalPrice.toFixed(2));

        // Update the discount display span to show percentage
        $discountDisplay.html(`<span class="discount-label">Discount:</span> <span class="discount-value">${discountPercentage.toFixed(2)}%</span>`);
    } else {
        $totalPriceInput.val(""); // Clear total price if invalid inputs
        $discountDisplay.html(`<span class="discount-label">Discount:</span> <span class="discount-value">0.00%</span>`); // Reset with styled HTML
    }
}

function calculateRefundAmount() {
    const quantity = parseInt($("#returnQuantity").val());
    const unitPrice = parseFloat($("#unitPrice").val());
    const soldItemsSelect = $("#soldItems");
    const selectedOption = soldItemsSelect.find("option:selected");
    const soldQuantity = parseInt(selectedOption.data("quantity"));

    if (isNaN(quantity) || quantity <= 0) {
        $("#quantityError").text("Please enter a valid quantity.");
        $("#totalPrice").val("");
        return;
    } 
    
    if (quantity > soldQuantity) {
        $("#quantityError").text(`Return quantity cannot exceed the sold quantity of ${soldQuantity}.`);
        $("#totalPrice").val("");
        showNotification(`You have entered more than what you sold!`, `error`);
        return;
    } else {
        $("#quantityError").text("");
    }

    const totalPrice = quantity * unitPrice;
    $("#totalPrice").val(totalPrice.toFixed(2));
}

// Fetch the unit price of selected item based on sale details
function fetchSalePrice() {
    const soldItemsSelect = document.getElementById('soldItems');
    const selectedOption = soldItemsSelect.options[soldItemsSelect.selectedIndex];
    if (!selectedOption) return;

    const unitPrice = selectedOption.dataset.unitPrice;
    document.getElementById('unitPrice').value = unitPrice || ''; // Display unit price
    document.getElementById('saleId').value = selectedOption.dataset.saleId || ''; // Store sale ID for processing return
}

// PRICE CALCULATION AND VALIDATION ENDS HERE

// SALES SUBMISSION AND RETURN PROCESSING STARTS HERE
// SEND SALES TO DATABASE AND UPDATE CART, INVENTORY, AND TABLE
function addSales(event) {
    event.preventDefault();
    
    if (cartItems.length === 0) {
        showNotification("No items in the cart to submit.", "error");
        return;
    }

    // Prepare the payload for sales submission
    const salesData = {
        items: cartItems
    };

    // Send the cart items to the server using AJAX
    $.ajax({
        url: "http://localhost:3000/sales",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(salesData), // Send data as JSON
        success: function(response) {
            console.log("Sales successfully submitted:", response);
            showNotification("Sales successfully submitted!", "success");

            // Clear the cart and preview container after successful submission
            cartItems = [];
            $(".preview-container").empty();
            $("#cartTotalAmount").empty();

            // Summarize all the items into a single table row (just for the current sale)
            const createdSales = response.sale.items; // This is where the items are located
            const totalQuantity = createdSales.reduce((sum, item) => sum + item.quantity, 0);
            const totalAmount = createdSales.reduce((sum, item) => sum + item.totalPrice, 0);
            const itemNames = createdSales.map(item => item.name).join(', ');

            const newRow = `
                <tr>
                    <td></td>
                    <td>${itemNames}</td>
                    <td>${totalQuantity}</td>
                    <td>${totalAmount.toFixed(2)}</td>
                </tr>
            `;
            // Append the new consolidated row to the sales table
            const $tableBody = $(".stock-sales tbody");
            $tableBody.prepend(newRow);
            // Optionally, clear any previously entered sales data in the form
            resetForm();

            // Update the serial numbers after adding the new row
            updateSerialNumbers();
        },
        error: function (error) {
            showNotification("Failed to submit sales. Please check your network or try again.", "error");

        }      
    });
}

// Process return and refresh table with combined sales data
async function processReturn() {
    const saleId = $("#saleId").val();
    const productId = $("#soldItems").val();
    const returnQuantity = parseInt($("#returnQuantity").val());
    const notes = $("#txArea").val();

    if (!saleId || !productId || isNaN(returnQuantity) || returnQuantity <= 0) {
        showNotification("Please fill all fields correctly.", "error");
        return;
    }

    // Calculate the total amount for the return
    const totalAmount = returnQuantity * unitPrice;

    try {
        // Create a return sale entry
        const returnSaleData = {
            saleId,
            product: productId,
            quantity: returnQuantity,
            totalAmount: totalAmount,
            note: notes,
        };

        const response = await fetch('http://localhost:3000/returnSales', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ saleId, productId, returnQuantity, notes })
        });

        const result = await response.json();
        if (response.ok) {
            showNotification("Return processed successfully!", "success");
            closeReturn();
            fetchAllSalesData(); // Refresh the table with updated data
        } else {
            showNotification(result.message || "Failed to process return.", "error");
        }
    } catch (error) {
        showNotification("Error processing return. Try again.", "error");
    }
}

// SALES SUBMISSION AND RETURN PROCESSING ENDS HERE

// UTILITY FUNCTIONS STARTS HERE

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

function resetForm() {
    // Reset the Select2 dropdown and clear selected value
    $("#itemDropdown").val(null).trigger('change'); // Reset Select2 dropdown to its placeholder

    // Clear all input fields in the form
    $("input[name='quantity']").val('');
    $("input[name='unitPrice']").val('');
    $("input[name='expenses']").val('');
    $("input[name='totalPrice']").val('');
    $("input[name='discount']").val('');
    $("#txArea").val('');
}

// Serial Number Update
function updateSerialNumbers() {
    $("#salesTableBody tr").each(function (index) {
        $(this).find("td").first().text(index + 1);
    });
}

// PAGINATION FUNCTIONS STARTS HERE

// Pagination Control Functions
function initializePagination() {
    currentPage = 1;
    displayPage(currentPage); // Display the first page
}

// Pagination functions
function displayPage(page) {
    const $tableBody = $("#salesTableBody");
    const rows = $tableBody.find("tr");
    const totalPages = Math.ceil(rows.length / rowsPerPage);

     // Hide pagination controls if there are no rows
    if (rows.length === 0) {
        $(".pagination-controls").hide();
    } else {
        $(".pagination-controls").show();
    }

    rows.hide(); // Hide all rows
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    rows.slice(startIndex, endIndex).show(); // Show only the rows for the current page

    $("#pageInfo").text(`Page ${page} of ${totalPages}`);
    $("#prevPage").prop("disabled", page === 1);
    $("#nextPage").prop("disabled", page === totalPages);
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPage(currentPage);
    }
}

function nextPage() {
    const totalRows = $("#salesTableBody tr").length; // Get total number of rows
    const totalPages = Math.ceil(totalRows / rowsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayPage(currentPage);
    }
}

// OTHERS
function collectSaleData() {
    return {
        items: cartItems,
        note: $("#txArea").val().trim() // Add note content to sale data
    };
}

function closePopup() {
    $(".formOverlay").fadeOut();
    $(".inventory-box").fadeOut();

    resetForm();
}

// DOWNLOAD SALES RECORDS
async function downloadSalesRecordsPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const salesData = await fetchAllSalesData(); // Adjust if you need to call another endpoint

    let yOffset = 10;
    pdf.text("Sales and Return Sales Report", 10, yOffset);
    yOffset += 10;

    // Format and add each sale record
    salesData.forEach((sale, index) => {
        const isReturn = sale.returnDate !== undefined;
        pdf.text(`Record #${index + 1}`, 10, yOffset);
        yOffset += 10;
        pdf.text(`Type: ${isReturn ? 'Return' : 'Normal'} Sale`, 10, yOffset);
        yOffset += 10;
        pdf.text(`Date: ${sale.saleDate || sale.returnDate}`, 10, yOffset);
        pdf.text(`Product(s): ${sale.product ? sale.product.name : sale.items.map(item => item.name).join(', ')}`, 10, yOffset + 10);
        pdf.text(`Quantity: ${isReturn ? sale.quantity : sale.items.reduce((sum, item) => sum + item.quantity, 0)}`, 10, yOffset + 20);
        pdf.text(`Amount: $${(isReturn ? sale.totalAmount : sale.items.reduce((sum, item) => sum + item.totalAmount, 0)).toFixed(2)}`, 10, yOffset + 30);
        yOffset += 40;
    });

    // Save the PDF
    pdf.save("Sales_Returns_Report.pdf");
}
