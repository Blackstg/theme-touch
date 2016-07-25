/*****************************
 SkuButtons
 *****************************/

var SkuButtons = (function () {
    var is_mobile;

    function isMobile() {
        return ($j('.header__burger-menu').filter(':hidden').length == 0);
    }

    function setButtonSkuTexts() {
        $j('[data-mobile-sku-part]').each(function () {
            var sku_part_index = $j(this).attr('data-mobile-sku-part'),
                form = $j(this).closest('.product__form'),
                sku_part = form.find('[data-sku-part="' + sku_part_index + '"]'),
                radio = sku_part.find('input:checked'),
                sku_part_value_name = radio.closest('.sku-buttons__item-label').find('.sku-buttons__text').html();
            $j(this).html(sku_part_value_name);
        });
    }

    function mobileButtonSkuClicked(e) {
        var radio = $j(e.target),
            form = radio.closest('.product__form'),
            sku_part_index = radio.closest('ul').attr('data-sku-part'),
            sku_part_value = radio.val(),
            desktop_radio = form.find('[data-sku-part=' + sku_part_index + '] input[value=' + sku_part_value + ']'),
            sku_part_value_name = desktop_radio.closest('label').find('.sku-buttons__text').html(),
            toggle_span = form.find('[data-mobile-sku-part="' + sku_part_index + '"]');

        toggle_span.html(sku_part_value_name);
        desktop_radio.click();
    }

    function summaryClicked(e) {
        e.preventDefault();

        var summary = $j(e.target).closest('.sku-buttons-summary'),
            form = summary.closest('.product__form'),
            skus_desktop = form.find('.sku-buttons'),
            skus_mobile = form.find('.product__mobile-sku-buttons');

        if (!summary.hasClass('cloned')) {
            var clone = skus_desktop.clone(true).removeClass('sku-buttons');
            // Change the radio group name so that it is not the same as desktop
            clone.find('input').each(function () {
                var input = $j(this);
                input.attr('name', 'mobile_' + input.attr('name'));
            })
            clone.appendTo(skus_mobile);
            skus_mobile.find('.sku-buttons__part input').on('click', mobileButtonSkuClicked);

            summary.addClass('cloned synchronised');
        }

        if (summary.hasClass('cloned') && !summary.hasClass('synchronised')) {
            // Sync desktop -> mobile
            if (!skus_mobile.is(':visible')) {
                $j(skus_desktop).find('[data-sku-part]').each(function () {
                    var sku_part_index = $j(this).attr('data-sku-part'),
                        sku_part_value = $j(this).find('input:checked').val();
                    skus_mobile.find('[data-sku-part="' + sku_part_index + '"] input[value="' + sku_part_value + '"]').click();
                });
            }
            summary.addClass('synchronised');
        }

        skus_mobile.show();
    }

    function resize() {
        if (is_mobile != isMobile()) {
            // Hide summaries when resizing to desktop
            if (is_mobile) {
                $j('.product__mobile-sku-buttons').hide();
                $j('.sku-buttons-summary.synchronised').removeClass('synchronised');
            }
            // Init summaries when resizing to mobile
            if (!is_mobile) {
                setButtonSkuTexts();
            }
            is_mobile = isMobile();
        }
    }

    function init() {
        if ($j('[data-mobile-sku-part]').size == 0) return;

        is_mobile = isMobile();
        setButtonSkuTexts();
        $j('.sku-buttons-summary').on('click', summaryClicked);
        $j(window).on('resize', resize);
    }

    return {
        init: init
    };
})();