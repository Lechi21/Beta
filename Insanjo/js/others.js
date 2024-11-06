"use strict;"


// =============================currency===================================//
const currencies = [
        // African currencies
        { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
        { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
        { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
        { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
        { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
        { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
        { code: 'XOF', symbol: 'CFA', name: 'West African CFA franc' },
        { code: 'DZD', symbol: 'DA', name: 'Algerian Dinar' },
        { code: 'GMD', symbol: 'D', name: 'Gambian Dalasi' },
        { code: 'BWP', symbol: 'P', name: 'Botswana Pula' },
        // Asian currencies
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
        { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
        { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
        { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
        { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates Dirham' },
        { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
        { code: 'THB', symbol: '฿', name: 'Thai Baht' },
        { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
        // European currencies
        { code: 'GBP', symbol: '£', name: 'British Pound Sterling' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
        { code: 'SEK', symbol: 'kr', name: 'Swedish Krona' },
        { code: 'NOK', symbol: 'kr', name: 'Norwegian Krone' },
        { code: 'DKK', symbol: 'kr', name: 'Danish Krone' },
        { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
        { code: 'HUF', symbol: 'Ft', name: 'Hungarian Forint' },
        { code: 'CZK', symbol: 'Kč', name: 'Czech Koruna' },
        { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
        // North American currencies
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
        { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
        { code: 'COP', symbol: '$', name: 'Colombian Peso' },
        { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
        { code: 'PEN', symbol: 'S/.', name: 'Peruvian Nuevo Sol' },
        { code: 'GTQ', symbol: 'Q', name: 'Guatemalan Quetzal' },
        { code: 'CRC', symbol: '₡', name: 'Costa Rican Colón' },
        // South American currencies
        { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
        { code: 'ARS', symbol: '$', name: 'Argentine Peso' },
        { code: 'COP', symbol: '$', name: 'Colombian Peso' },
        { code: 'CLP', symbol: '$', name: 'Chilean Peso' },
        { code: 'PEN', symbol: 'S/.', name: 'Peruvian Nuevo Sol' },
        { code: 'UYU', symbol: '$', name: 'Uruguayan Peso' },
        { code: 'VEF', symbol: 'Bs', name: 'Venezuelan Bolívar' },
        { code: 'BOB', symbol: 'Bs', name: 'Bolivian Boliviano' },
        { code: 'PYG', symbol: '₲', name: 'Paraguayan Guarani' },
        { code: 'GHS', symbol: 'GH₵', name: 'Guyanaese Dollar' },
        // Oceanian currencies (including Australia)
        { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
        { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
        { code: 'PGK', symbol: 'K', name: 'Papua New Guinean Kina' },
        { code: 'FJD', symbol: 'FJ$', name: 'Fijian Dollar' },
        { code: 'TOP', symbol: 'T$', name: 'Tongan pa\'anga' },
        { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' },
        { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },
        { code: 'WST', symbol: 'WS$', name: 'Samoan Tala' },
        { code: 'SBD', symbol: 'SI$', name: 'Solomon Islands Dollar' },
        { code: 'VUV', symbol: 'VT', name: 'Vanuatu Vatu' },    
    ];
    const currencySelect = document.getElementById('currencySelect');
    const currencyToggle = document.getElementById('currencyToggle');
    
    // Populate the dropdown with currency options
    currencies.forEach(currency => {
        const option = document.createElement('option');
        option.value = currency.code;
        option.text = `${currency.code} (${currency.symbol})`;
        currencySelect.appendChild(option);
    });

    function saveCurrencySymbol() { 
        const selectedCurrency = currencySelect.value;
        if (currencyToggle.checked) {
            localStorage.setItem('selectedCurrency', selectedCurrency);
            alert('Currency symbol saved!');
        } else {
            localStorage.removeItem('selectedCurrency');
            alert('Currency symbol removed!');
        }
    }

  // Load saved currency symbol on page load
    document.addEventListener('DOMContentLoaded', function() {
        const savedCurrency = localStorage.getItem('selectedCurrency');
        if (savedCurrency) {
            currencySelect.value = savedCurrency;
            currencyToggle.checked = true;
        } else {
            currencyToggle.checked = false;
        }

      // Add event listeners to the currency toggle and select elements
        currencyToggle.addEventListener('change', saveCurrencySymbol);
        currencySelect.addEventListener('change', function() {
            if (currencyToggle.checked) {
                saveCurrencySymbol();
            }
        });
    });






    // ==============================Timezones=======================================//
    const timezones = [
        { id: 'auto', name: 'Automatic' },
        { id: '-12', name: 'UTC -12:00' },
        { id: '-11', name: 'UTC -11:00' },
        { id: '-10', name: 'UTC -10:00' },
        { id: '-9.5', name: 'UTC -09:30' },
        { id: '-9', name: 'UTC -09:00' },
        { id: '-8.5', name: 'UTC -08:30' },
        { id: '-8', name: 'UTC -08:00' },
        { id: '-7', name: 'UTC -07:00' },
        { id: '-6', name: 'UTC -06:00' },
        { id: '-5', name: 'UTC -05:00' },
        { id: '-4.5', name: 'UTC -04:30' },
        { id: '-4', name: 'UTC -04:00' },
        { id: '-3.5', name: 'UTC -03:30' },
        { id: '-3', name: 'UTC -03:00' },
        { id: '-2.5', name: 'UTC -02:30' },
        { id: '-2', name: 'UTC -02:00' },
        { id: '-1', name: 'UTC -01:00' },
        { id: '0', name: 'UTC +00:00' },
        { id: '1', name: 'UTC +01:00' },
        { id: '2', name: 'UTC +02:00' },
        { id: '3', name: 'UTC +03:00' },
        { id: '3.5', name: 'UTC +03:30' },
        { id: '4', name: 'UTC +04:00' },
        { id: '4.5', name: 'UTC +04:30' },
        { id: '5', name: 'UTC +05:00' },
        { id: '5.5', name: 'UTC +05:30' },
        { id: '5.75', name: 'UTC +05:45' },
        { id: '6', name: 'UTC +06:00' },
        { id: '6.5', name: 'UTC +06:30' },
        { id: '6.75', name: 'UTC +06:45' },
        { id: '7', name: 'UTC +07:00' },
        { id: '7.5', name: 'UTC +07:30' },
        { id: '8', name: 'UTC +08:00' },
        { id: '8.5', name: 'UTC +08:30' },
        { id: '8.75', name: 'UTC +08:45' },
        { id: '9', name: 'UTC +09:00' },
        { id: '9.5', name: 'UTC +09:30' },
        { id: '9.75', name: 'UTC +09:45' },
        { id: '10', name: 'UTC +10:00' },
        { id: '10.5', name: 'UTC +10:30' },
        { id: '11', name: 'UTC +11:00' },
        { id: '11.5', name: 'UTC +11:30' },
        { id: '12', name: 'UTC +12:00' },
        { id: '12.5', name: 'UTC +12:30' },
        { id: '12.75', name: 'UTC +12:45' },
        { id: '13', name: 'UTC +13:00' },
        { id: '13.75', name: 'UTC +13:45' },
        { id: '14', name: 'UTC +14:00' },
    ];
    const timezoneSelect = document.getElementById('timezoneSelect');
    
    // Populate the dropdown with currency options
        timezones.forEach(time => {
        const option = document.createElement('option');
        option.value = time.id;
        option.text = `${time.name}`;
        timezoneSelect.appendChild(option);
    });
    
    