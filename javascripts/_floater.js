/*****************************
 Floater
 *****************************/
var Floater = (function () {
    var elements = [],
        enabled,
        initialized;

    var resize = function () {
        var is_desktop = !$j('.header__burger-menu').is(':visible');
        if (enabled !== is_desktop) {
            if (is_desktop) {
                $j(window).on('scroll', scroll);
            } else {
                $j(window).off('scroll', scroll);
            }
            enabled = is_desktop;
        }

        if (enabled) {
            $j.each(elements, function () {
                var element = this[0],
                    parameters = this[1];

                setPosition(element, 'static', '', '', '', '');
                var offset = element.offset();

                parameters['top'] = offset.top;
                parameters['left'] = offset.left;
                parameters['width'] = element.width();
            });
            scroll();
        }
    };

    var scroll = function () {
        var scroll_position = $j(window).scrollTop();

        $j.each(elements, function () {
            var element = this[0],
                parameters = this[1];
            if (scroll_position <= parameters['top']) {
                setPosition(element, 'static', '', '', '', '');
                element.removeClass('floater-fixed');
            } else {
                setPosition(element, 'fixed', parameters['left'], parameters['width'], '0', '');
                element.addClass('floater-fixed');
            }
        })
    };

    var setPosition = function (element, position, left, width, top, bottom) {
        element.css({
            'position': position,
            'left': left,
            'width': width,
            'top': top,
            'bottom': bottom
        });
    }

    return {
        addElement: function (selector) {
            var element = $j(selector);
            if (element.length > 0) {
                elements.push([element, {}]);
                if (!initialized) {
                    $j(window).on('resize', resize);
                    initialized = true;
                }
                resize();
            }
        }
    }
}());