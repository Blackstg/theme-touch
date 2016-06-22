/*****************************
 Basket
 *****************************/
var Basket = (function () {
    // Busy indicator - show
    function showBusy() {
        $j('#busy').show();
    }

    // Busy indicator - hide
    function hideBusy() {
        $j('#busy').hide();
    }

    var updateBasketOrPopup = function (page, data) {
        if (page == 'basket' || page == 'step_basket') {
            $j('#basket-holder').html(data);
            return $j('#basket-holder');
        } else {
            $j('#popup-holder').html(data);
            return $j('#popup-holder');
        }
    };

    // AJAX operations
    var ajaxPost = function (url, page) {
        showBusy();
        $j.ajax({
            url: url,
            type: 'post',
            data: 'page=' + encodeURIComponent(page)
        }).done(function (data) {
            updateBasketOrPopup(page, data);
        });
    };

    var ajaxPostForm = function (url, form, page, sku) {
        ajaxPostFormWithCallback(url, form, page, sku, $j.noop);
    };

    var ajaxPostFormWithCallback = function (url, form, page, sku, callback) {
        showBusy();
        $j.ajax({
            url: url,
            type: 'post',
            data: $j(form).serialize() + '&page=' + encodeURIComponent(page) + (sku ? '&item[sku]=' + encodeURIComponent(sku) : '')
        }).done(function (data) {
            var basket = updateBasketOrPopup(page, data);
            var new_key = basket.find('[data-edited]').attr('data-key');
            $j(form).attr('data-key', new_key);
            callback();
        });
    };

    var ajaxGet = function (url, page) {
        showBusy();
        $j.ajax({
            url: Util.addKeyValueToURL(url, 'page', encodeURIComponent(page)),
            type: 'get'
        }).done(function (data) {
            updateBasketOrPopup(page, data);
        });
    };

    // Coupon codes
    var selectedCouponProductHandle = function () {
        return $j('#coupon_form option:selected').val().split("###")[0];
    };

    var selectedCouponSkuHandle = function () {
        return $j('#coupon_form option:selected').val().split("###")[1];
    };

    var createItemWithPageAndCallback = function (_form, item_name, page, callback) {
        var form = $j(_form),
            product = form.attr('data-product'),
            sku = form.attr('data-sku'),
            url = '/basket_items/create/' + product;
        Flash.itemAdded(form, item_name);
        if (callback) {
            ajaxPostFormWithCallback(url, form, page, sku, callback);
        } else {
            ajaxPostForm(url, form, page, sku);
        }
    };

    var createMultipleItemsWithPageAndCallback = function (_form, params, item_names, page, callback) {
        var form = $j(_form),
            url = '/basket_items/create_multiple?' + params;
        Flash.itemAdded(form, item_names);
        if (callback) {
            ajaxPostFormWithCallback(url, form, page, null, callback);
        } else {
            ajaxPostForm(url, form, page, null);
        }
    };

    return {
        // ------------------
        // Single items
        // ------------------
        newItem: function (_form, target) {
            var form = $j(_form),
                product = form.attr('data-product'),
                sku = form.attr('data-sku'),
                url = '/basket_items/new/' + product;
            if (target == "popup") {
                ajaxPostForm(url, form, 'popup_item', sku);
            } else {
                window.location = Util.addParametersToURL(url, 'page=' + target + (form ? '&' + form.serialize() : ''));
            }
        },

        createItem: function (_form, item_name) {
            createItemWithPageAndCallback(_form, item_name, 'basket', null);
        },

        createItemInStepBasket: function (_form, item_name) {
            createItemWithPageAndCallback(_form, item_name, 'step_basket', null);
        },

        createItemWithCallback: function (_form, item_name, callback) {
            createItemWithPageAndCallback(_form, item_name, 'basket', callback);
        },

        editItem: function (url, target) {
            if (target == 'popup') {
                ajaxPost(url, 'popup_item');
            } else {
                window.location = Util.addKeyValueToURL(url, 'page', target);
            }
        },

        updateItem: function (_form, item_name) {
            var form = $j(_form),
                key = form.attr('data-key'),
                sku = form.attr('data-sku'),
                url = '/basket_items/update/' + key;
            Flash.itemUpdated(item_name);
            ajaxPostForm(url, form, 'basket', sku);
        },

        deleteItem: function (basket_item_key, item_name) {
            var url = "/basket_items/destroy/" + basket_item_key;
            Flash.itemRemoved(item_name);
            ajaxGet(url, 'basket');
        },

        // ------------------
        // Items group
        // ------------------
        createMultipleItems: function (_form, params, item_names) {
            createMultipleItemsWithPageAndCallback(_form, params, item_names, 'basket', null);
        },

        createMultipleItemsWithCallback: function (_form, params, item_names, callback) {
            createMultipleItemsWithPageAndCallback(_form, params, item_names, 'basket', callback);
        },

        createMultipleItemsInStepBasket: function (_form, params, item_names) {
            createMultipleItemsWithPageAndCallback(_form, params, item_names, 'step_basket', null);
        },

        // ------------------
        // Deals
        // ------------------
        newDeal: function (_form, page, redirect_to) {
            var form = $j(_form),
                product = form.attr('data-product'),
                url = Util.addKeyValueToURL('/deal_bags/new', 'product_handle', product),
                url = Util.addKeyValueToURL(url, 'page', page),
                url = Util.addKeyValueToURL(url, 'redirect_to', redirect_to);
            window.location = url;
        },

        createDeal: function (_form, deal_name) {
            var form = $j(_form),
                product = form.attr('data-product'),
                url = '/deal_bags/create/' + product;
            Flash.itemAdded(form, deal_name);
            ajaxPostForm(url, form, 'basket', null);
        },

        editDeal: function (url, target) {
            if (target == "popup") {
                ajaxPost(url, 'popup_deal');
            } else {
                window.location = Util.addKeyValueToURL(url, 'page', target);
            }
        },

        updateDeal: function (_form, deal_name) {
            var form = $j(_form),
                key = form.attr('data-key'),
                url = '/deal_bags/update/' + key;
            Flash.itemUpdated(deal_name);
            ajaxPostForm(url, form, 'basket', null);
        },

        deleteDeal: function (url, deal_name) {
            ajaxPost(url, 'basket');
            Flash.itemRemoved(deal_name);
        },

        // ------------------
        // Deal items
        // ------------------
        editDealItem: function (url, target) {
            if (target == "popup") {
                ajaxPost(url, 'popup_deal_item');
            } else {
                window.location = Util.addKeyValueToURL(url, 'page', target);
            }
        },

        updateDealItem: function (_form, item_name) {
            var form = $j(_form),
                key = form.attr('data-key'),
                sku = form.attr('data-sku'),
                url = '/deal_basket_items/update/' + key;
            Flash.itemUpdated(item_name);
            ajaxPostForm(url, form, 'basket', sku);
        },

        deleteDealItem: function (url, deal_item_name) {
            Flash.itemRemoved(deal_item_name);
            ajaxPost(url, 'basket');
        },

        // ------------------
        // Actions
        // ------------------
        action: function (_form, name) {
            var form = $j(_form),
                action = form.attr('data-action');
            switch (action) {
                case 'create-item':
                    Basket.createItem(form, name);
                    break;
                case 'update-item':
                    Basket.updateItem(form, name);
                    break;
                case 'update-deal-item':
                    Basket.updateDealItem(form, name);
                    break;
                case 'create-deal':
                    Basket.createDeal(form, name);
                    break;
                case 'update-deal':
                    Basket.updateDeal(form, name);
                    break;
            }
        },

        // ------------------
        // Item/deal quantity
        // ------------------
        increaseItemQuantity: function (basket_item_key, item_name) {
            var url = "/basket_items/increase_quantity/" + basket_item_key;
            Flash.itemUpdated(item_name);
            ajaxPost(url, 'basket');
        },

        decreaseItemQuantity: function (basket_item_key, item_name) {
            var url = "/basket_items/decrease_quantity/" + basket_item_key;
            Flash.itemUpdated(item_name);
            ajaxPost(url, 'basket');
        },

        decreaseItemQuantityByProduct: function (product, item_name) {
            var url = "/basket_items/remove_one/" + product;
            Flash.itemUpdated(item_name);
            ajaxPost(url, 'basket');
        },

        decreaseDealQuantityByProduct: function (product, item_name) {
            var url = "/deal_bags/remove_one/" + product;
            Flash.itemUpdated(item_name);
            ajaxPost(url, 'basket');
        },

        // ------------------
        // Busy indicator
        // ------------------
        showBusy: showBusy,

        hideBusy: hideBusy,

        // ------------------
        // Manual update
        // ------------------
        updateContent: function (data) {
            updateBasketOrPopup('basket', data);
        },

        // ------------------
        // Clear basket
        // ------------------
        clear: function () {
            ajaxPost('/basket/clear', 'basket');
            Flash.basketEmptied();
        },

        // ------------------
        // Order repeat
        // ------------------
        repeatOrder: function (url, form) {
            ajaxPostForm(url, form, 'basket', null);
        },

        repeatOrderItem: function (url, form) {
            ajaxPostForm(url, form, 'basket', null);
        },

        // ------------------
        // Tips
        // ------------------
        increaseTip: function (page_name) {
            ajaxPost('/basket_tips/increase', page_name);
        },

        decreaseTip: function (page_name) {
            ajaxPost('/basket_tips/decrease', page_name);
        },

        // ------------------
        // Coupon codes
        // ------------------
        setCouponCode: function (coupon_code, page) {
            ajaxPost('/coupon_code?code=' + encodeURIComponent(coupon_code) + '&page=' + page, page);
        },

        deleteCouponCode: function (page_name) {
            ajaxPost('/coupon_code?code=&page=' + page_name, page_name);
        },

        addCouponProduct: function (page_name) {
            var product_handle = selectedCouponProductHandle();
            if (product_handle !== '') {
                var product_name = $j('#coupon_form option:selected').html();
                Flash.itemAdded($j('#coupon_form'), product_name);

                var sku_handle = selectedCouponSkuHandle();
                ajaxPostForm('/basket_items/create/' + product_handle, $j('#coupon_form'), page_name, sku_handle);
            }
        }
    };
}());
