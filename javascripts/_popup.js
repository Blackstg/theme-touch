/*****************************
 Popup
 *****************************/
var Popup = (function () {
    var show_mobile_basket;

    var open = function (id) {
        show_mobile_basket = $j('#sidebar-ofc').hasClass('off-canvas_open');
        if (show_mobile_basket) $j.sidr('close', 'sidebar-ofc');

        var windowH = $j(window).height(),
            popupH = $j(id).height(),
            top = (popupH < windowH) ? $j(document).scrollTop() + (windowH - popupH) / 4 + "px" : $j(document).scrollTop() + windowH * 0.01 + "px";

        $j('#page-overlay').show();
        $j('#page-overlay').on('click', function () {
            Popup.close(id);
        });
        $j(id).css('top', top);
        $j(id).show();
    }

    var close = function (id) {
        Basket.hideBusy();
        $j(id).hide();
        $j('#page-overlay').hide().off('click');
        if (show_mobile_basket) $j('#basket-off-canvas').click();
    }

    return {
        open: function () {
            open('#popup');
        },

        close: function () {
            close('#popup');
        },
    }
}());