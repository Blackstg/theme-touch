/*****************************
 Flash
 *****************************/
var Flash = (function () {
    var display = function (text) {
        var message = $j('#fadeout-message');

        if (message.is(':visible')) {
            clearTimeout(message.data('timer'));
            message.stop().css({opacity: '100'});
            message.fadeOut(60).fadeIn(60);
        }

        message.find('.message__content').replaceWith('<div class="message__content">' + text + '</div>').show();

        message.data('timer', setTimeout(function () {
            message.fadeOut(200);
        }, 1500));
        message.show();
    };

    var displayForItem = function (form, productName, operation) {
        var message;
        switch (operation) {
            case 'added':
                // quantity is undefined for deal products
                var quantity = form.find('.quantity option:selected').val(),
                    productNameWithQty = (quantity == undefined || quantity == 1) ? productName : (quantity + ' x ' + productName);
                message = locProductAdded(productNameWithQty);
                break;
            case 'updated':
                message = locProductUpdated(productName);
                break;
            case 'removed':
                message = locProductRemoved(productName);
                break;
            default:
                alert('Incorrect operation called in displayForItem: ' + operation);
                break;
        }
        display(message);
    };

    var show = function (flash, time) {
        flash.show();
        setTimeout(function () {
            flash.fadeOut(200);
        }, time);
    };

    var showInfo = function () {
        show($j('#flash-info'), 2500);
    };

    var showError = function () {
        show($j('#flash-error'), 5000);
    };

    return {
        itemAdded: function (form, productName) {
            displayForItem(form, productName, 'added');
        },

        itemUpdated: function (productName) {
            displayForItem(null, productName, 'updated');
        },

        itemRemoved: function (productName) {
            displayForItem(null, productName, 'removed');
        },

        basketEmptied: function () {
            display(locBasketEmptied());
        },

        showInfo: showInfo,

        showError: showError
    }
}());
