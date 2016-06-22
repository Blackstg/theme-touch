/*****************************
 MobileSkus
 *****************************/

var MobileSkus = (function () {
    var is_mobile;

    function isMobile() {
        return ($j('.header__burger-menu').filter(':hidden').length == 0);
    }

    function initAllToggles() {
        $j('.skus_item-desktop [data-sku-part]').each(function () {
            var radio = $j(this).find('input:checked'),
                parent = $j(this).closest('.product__form'),
                sku_part_index = $j(this).attr('data-sku-part'),
                sku_part_value_name = radio.closest('label').find('.sku-part__text').html();
            parent.find('.skus-summary span[data-mobile-sku-part="' + sku_part_index + '"]').html(sku_part_value_name);
        });
    }

    function mobileRadioClicked(e) {
        var radio = $j(e.target),
            parent = radio.closest('.product__form'),
            sku_part_index = radio.closest('ul').attr('data-sku-part'),
            sku_part_value = radio.val(),
            desktop_radio = parent.find('.skus_item-desktop [data-sku-part=' + sku_part_index + '] input[value=' + sku_part_value + ']'),
            sku_part_value_name = desktop_radio.closest('label').find('.sku-part__text').html(),
            toggle_span = radio.closest('.product').find('.skus-summary span[data-mobile-sku-part="' + sku_part_index + '"]');

        toggle_span.html(sku_part_value_name);
        desktop_radio.click();
    }

    function toggleClicked(e) {
        e.preventDefault();

        var toggle = $j(e.target).closest('.skus-summary'),
            product_footer = toggle.closest('.product__bottom'),
            parent = toggle.closest('.product__form'),
            skus_desktop = parent.find('.skus_item-desktop'),
            skus_mobile = parent.find('.skus-mobile');

        if (!toggle.hasClass('cloned')) {
            var clone = skus_desktop.clone(true).removeClass('skus_item-desktop');
            // Change the radio group name so that it is not the same as desktop
            clone.find('input').each(function () {
                var input = $j(this);
                input.attr('name', 'mobile_' + input.attr('name'));
            })
            clone.appendTo(skus_mobile);
            skus_mobile.find('.sku-part label input').on('click', mobileRadioClicked);

            toggle.addClass('cloned sinchronised');
        }

        if (toggle.hasClass('cloned') && !toggle.hasClass('sinchronised')) {
            // Sinc desktop -> mobile
            if (!product_footer.hasClass('show-skus')) {
                $j(skus_desktop).find('[data-sku-part]').each(function () {
                    var sku_part_index = $j(this).attr('data-sku-part'),
                        sku_part_value = $j(this).find('input:checked').val();
                    skus_mobile.find('.sku-part__list[data-sku-part="' + sku_part_index + '"] input[value="' + sku_part_value + '"]').click();
                });
            }
            toggle.addClass('sinchronised');
        }

        product_footer.toggleClass('show-skus');
    }

    function resize() {
        if (is_mobile != isMobile()) {
            // Hide all toggles when resizing to desktop
            if (is_mobile) {
                $j('.product__bottom.show-skus').removeClass('show-skus');
                $j('.skus-summary.sinchronised').removeClass('sinchronised');
            }
            // Init toggles when resizing to mobile
            if (!is_mobile) {
                initAllToggles();
            }
            is_mobile = isMobile();
        }
    }

    function init() {
        is_mobile = isMobile();
        initAllToggles();
        $j('.skus-summary_clickable').on('click', toggleClicked);
        $j(window).on('resize', resize);
    }

    return {
        init: init
    };
})();