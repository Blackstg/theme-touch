/*****************************
 DealSelects
 *****************************/
var DealSelects = (function () {
    function dealItemSelected(select) {
        select.removeClass('popup-deal-line__select_error');

        var deal_item_nb = select.attr('name').match(/deal_item_(\d+)/)[1],
            sku_virtual_id = select.find(':selected').val(),
            product_handle = sku_virtual_id.split(':')[0],
            product_details = window.dealItemDetails[deal_item_nb][product_handle],
            description = (product_details ? product_details.description : undefined),
            thumbnail_url = (product_details ? product_details.thumbnail_url : undefined),
            deal_item = select.closest('[data-deal-item]'),
            deal_item_picture = deal_item.find('[data-deal-item-picture]'),
            deal_item_description = deal_item.find('[data-deal-item-description]');

        if (description) {
            deal_item_description.html(description);
            deal_item_description.show();
        } else {
            deal_item_description.hide();
            deal_item_description.html('');
        }

        if (thumbnail_url) {
            deal_item_picture.find('img').attr('src', thumbnail_url);
            deal_item_picture.show();
        } else {
            deal_item_picture.hide();
            deal_item_picture.find('img').attr('src', '/assets-images/blank.gif');
        }
    }

    var validate = function (form) {
        var is_ok = true;
        form.find('[data-deal-item] select').removeClass('popup-deal-line__select_error').each(function (i, e) {
            if (!$j(e).val()) {
                is_ok = false;
                $j(e).addClass('popup-deal-line__select_error');
            }
        });
        return is_ok;
    }

    return {
        init: function (form) {
            form.find('[data-deal-item] select').each(function (i, _select) {
                var select = $j(_select);
                select.change(function () {
                    dealItemSelected(select)
                });
                dealItemSelected(select);
            });
        },

        validate: function (form) {
            return validate($j(form));
        },
    }
}());