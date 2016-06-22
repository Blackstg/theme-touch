/*****************************
 DealWizard
 *****************************/

var DealWizard = (function () {
    var selected_items,
        deal_id,
        product_deal_handle,
        deal_name,
        line_nb;

    var showTab = function () {
        $j('.deal-wizard-navigation__tab_active').removeClass('deal-wizard-navigation__tab_active');
        $j('a[href=deal-wizard-set-' + line_nb + ']').closest('.deal-wizard-navigation__tab').addClass('deal-wizard-navigation__tab_active');

        $j('.deal-wizard-set_active').removeClass('deal-wizard-set_active');
        $j('#deal-wizard-set-' + line_nb).addClass('deal-wizard-set_active');

        Page.equalizeProducts();

        $j('body,html').animate({
            scrollTop: 0
        }, 400);
    };

    var nbLines = function () {
        return $j('.deal-wizard-set').size();
    };

    var navigationClickHandler = function (event) {
        event.preventDefault();
        var link_href = $j(event.target.closest('a')).attr('href'),
            new_line_nb = /deal-wizard-set-([0-9]+)$/i.exec(link_href)[1];

        if (new_line_nb == 1 || selected_items[new_line_nb - 1] !== undefined) {
            line_nb = new_line_nb
            showTab();
        }
    };

    var getSkuId = function (form) {
        var product = $j(form).attr('data-product'),
            sku = $j(form).attr('data-sku');
        return product + (sku ? ':' + sku : '')
    };

    var create = function () {
        var ajax_data = {
            page: 'basket'
        };

        selected_items.forEach(function (selected_item, line_nb) {
            ajax_data['deal_item_' + line_nb] = selected_item.sku_id;
            if (Object.keys(selected_item.options).length > 0) {
                ajax_data['deal_item_' + line_nb + '_options'] = selected_item.options;
            }
        });

        Basket.showBusy();

        $j.ajax({
            url: Util.addKeyValueToURL('/deal_bags/create', 'product_handle', product_deal_handle),
            type: 'post',
            data: JSON.stringify(ajax_data),
            contentType: 'application/json'
        }).done(function (data) {
            Flash.itemAdded($j("<form></form>"), deal_name);
            Basket.updateContent(data);

            // Redirect
            window.location = Util.getParameterFromUrl(window.location.href, 'redirect_to') || '/categories';
        });
    }

    return {
        init: function (handle, id, name) {
            selected_items = [];
            line_nb = 1;
            product_deal_handle = handle;
            deal_id = id;
            deal_name = name;

            $j('.deal-wizard-navigation__tab a').each(function () {
                $j(this).on('click', navigationClickHandler);
            });
            showTab();
        },

        newItem: function (form) {
            var sku_id = getSkuId(form);

            $j.ajax({
                url: Util.addParametersToURL('/deal_editor/edit/' + encodeURIComponent(sku_id), 'page=deal_wizard_popup&deal_line_number=' + line_nb + '&deal_id=' + deal_id),
                type: 'post'
            }).done(function (data) {
                $j('#popup-holder').html(data);
                selected_items[line_nb] = {
                    sku_id: sku_id,
                    quantity: 1,
                    item: {},
                    options: {}
                };
            });
        },

        createItem: function (form) {
            selected_items[line_nb] = {
                sku_id: getSkuId(form),
                quantity: 1,
                item: {},
                options: {}
            };

            if (line_nb < nbLines()) {
                line_nb++;
                showTab();
            } else {
                create();
            }
        },

        itemCreated: function (form) {
            var options = {};

            form.find('input:checked', 'option:selected').each(function (i, el) {
                var array = /^item\[([^\]]*)\]$/.exec(el.name);
                if (array) {
                    var option_name = array[1];
                    if (option_name !== 'sku') {
                        options[option_name] = el.value;
                    }
                }

                array = /^item\[([^\]]*)\]\[\]$/.exec(el.name);
                if (array) {
                    var option_name = array[1];
                    if (!(option_name in options)) {
                        options[option_name] = [];
                    }
                    options[option_name].push(el.value);
                }
            });
            selected_items[line_nb].options = options;

            Popup.close();

            if (line_nb < nbLines()) {
                line_nb++;
                showTab();
            } else {
                create();
            }
        }
    };
})();